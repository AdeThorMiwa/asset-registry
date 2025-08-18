import { type Log, type PublicClient, createPublicClient, decodeEventLog, webSocket } from "viem";
import { Env } from "../config/env";
import Logger from "../utils/logger";
import type { WatchEventReturnType } from "viem/actions";
import { sepolia } from "viem/chains";
import { Container, Service } from "typedi";
import { EventName, } from "../interface/logs";
import { BlockLogProcessor } from "./BlockLogProcessor";

@Service()
export class BlockIndexer {
    private unwatch: WatchEventReturnType | undefined;
    private readonly ws: PublicClient;
    private readonly processor: BlockLogProcessor;

    constructor() {
        this.ws = createPublicClient({ chain: sepolia, transport: webSocket(Env.RPC_WS_URL) })
        this.processor = Container.get(BlockLogProcessor)
    }

    async start(): Promise<void> {
        if (this.unwatch) {
            Logger.warn("[BlockIndexer] already started");
            return;
        }

        Logger.info("[BlockIndexer] monitoring Address: %s Confirmations: %s", Env.ASSET_REGISTRY_ADDRESS, Env.CONFIRMATIONS);
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self_ = this;
        this.unwatch = this.ws.watchEvent({
            address: Env.ASSET_REGISTRY_ADDRESS as `0x${string}`,
            onLogs: this.processor.onLogs.bind(this.processor),
            onError: this.onError.bind(self_),
        });
    }

    stop() {
        if (this.unwatch) {
            this.unwatch();
            this.unwatch = undefined;
            Logger.info("[BlockIndexer] stopped");
        }
    }

    private onError(err: Error) {
        Logger.error("[BlockIndexer] watchEvent error", err)
    }
}
