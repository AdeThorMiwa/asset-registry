import { type Log, type PublicClient, createPublicClient, decodeEventLog, http } from "viem";
import { Env } from "../config/env";
import Logger from "../utils/logger";
import { BlockEventProcessor } from "./BlockEventProcessor";
import { Container, Service } from "typedi";
import { EventName, type LogEventProcessorFunc, type ParsedLogEvent } from "../interface/logs";
import { EVENTS_ABI } from "../data/abi";
import { SUPPORTED_NETWORKS } from "../constants/networks";

type DecodedEventLog = ReturnType<typeof decodeEventLog> & { eventName: EventName; originalLog: Log };

@Service()
export class BlockLogProcessor {
    private readonly rpc: PublicClient;
    private readonly processor: BlockEventProcessor;

    constructor() {
        const network = Env.NETWORK as keyof typeof SUPPORTED_NETWORKS;
        const chain = SUPPORTED_NETWORKS[network];
        this.rpc = createPublicClient({ chain, transport: http(Env.RPC_HTTP_URL) })
        this.processor = Container.get(BlockEventProcessor)
    }

    public async onLogs(logs: Log[]) {
        if (logs.length) Logger.info("onLogs called")
        logs.forEach(async log => {
            if (await this.hasEnoughConfirmation(log)) {
                await this.decodeAndProcess(log);
            }
        });
    }

    public async fetchLogs(fromBlock: bigint, toBlock?: bigint) {
        toBlock = toBlock ?? fromBlock + 1n; // just fetch logs from the single block
        const logs = await this.rpc.getLogs({
            address: Env.ASSET_REGISTRY_ADDRESS as `0x${string}`,
            fromBlock,
            toBlock,
        });

        return logs as Log[]
    }

    private async getConfirmationCount(log: Log) {
        if (!log.blockNumber) return 0;
        const currentBlockNumber = await this.rpc.getBlockNumber();
        return currentBlockNumber - log.blockNumber
    }

    private async hasEnoughConfirmation(log: Log) {
        const confirmations = await this.getConfirmationCount(log);
        return confirmations >= BigInt(Env.CONFIRMATIONS)
    }

    private async decodeAndProcess(log: Log) {
        Logger.info("decoding log -> %s", log.blockHash);
        const logEvent = await this.decodeAndParseLogEvent(log);
        const processorFunc: LogEventProcessorFunc = this.processor[logEvent.eventName];
        if (typeof processorFunc === "function") {
            await processorFunc(logEvent)
        }
    }

    private async decodeAndParseLogEvent(log: Log) {
        const decoded = this.decodeLogEvent(log);
        return await this.parseDecodedEventLog(decoded);
    }

    private decodeLogEvent(log: Log): DecodedEventLog {
        const payload = {
            abi: EVENTS_ABI,
            data: log.data,
            topics: log.topics,
        };

        let decoded: Omit<DecodedEventLog, "originalLog">;
        try {
            decoded = decodeEventLog(payload) as unknown as DecodedEventLog;
        } catch {
            decoded = { eventName: EventName.Unknown, args: {} }
        }

        return { ...decoded, originalLog: log }
    }

    private async parseDecodedEventLog(decoded: DecodedEventLog): Promise<ParsedLogEvent> {
        const eventName = decoded.eventName as EventName
        const block = await this.rpc.getBlock({ blockHash: decoded.originalLog.blockHash! });
        const timestamp = new Date(Number(block.timestamp.toString()) * 1000);
        const blockNumber = decoded.originalLog.blockNumber!;
        const hash = decoded.originalLog.transactionHash!;
        const logIndex = Number(decoded.originalLog.logIndex!);
        const args: Record<string, unknown> = decoded.args;

        return { eventName, timestamp, blockNumber, hash, logIndex, args }
    }

    public getCurrentBlockNumber() {
        return this.rpc.getBlockNumber()
    }
}
