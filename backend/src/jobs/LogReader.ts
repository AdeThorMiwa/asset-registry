import { CronTime } from "cron-time-generator";
import { ISchedulable } from "../interface/jobs";
import { Cron } from "croner";
import { Container, Service } from "typedi";
import Logger from "../utils/logger";
import { JOB_TOKEN } from "../constants/tokens";
import { BlockLogProcessor } from "../services/BlockLogProcessor";
import LogCursorRepository from "../repositories/LogCursorRepository";
import { Env } from "../config/env";

@Service({ id: JOB_TOKEN, multiple: true })
export class LogReader implements ISchedulable {
    name = LogReader.name;
    schedule = CronTime.every(1).minutes();
    disabled = true;

    // blocks per batch
    private BATCH_SIZE = 1000n;

    cursorKey() {
        return `log::${Env.NETWORK}::${Env.ASSET_REGISTRY_ADDRESS}::cursor`
    }

    async handler(_: Cron): Promise<void> {
        Logger.info("[LogReader] start reading logs");

        const cursorRepository = Container.get(LogCursorRepository);

        try {
            let cursor = await cursorRepository.getCursor(this.cursorKey());
            const fromBlock = cursor + 1n;
            const toBlock = await Container.get(BlockLogProcessor).getCurrentBlockNumber(); // to current block
            Logger.info("[LogReader] reading logs from %s to %s", fromBlock, toBlock);
            let processed = 0n;
            let nextFrom = fromBlock;

            while (fromBlock <= toBlock) {
                const remaining = toBlock - nextFrom;
                const span = remaining < this.BATCH_SIZE ? remaining : this.BATCH_SIZE;
                const to = nextFrom + span;
                await this.processRange(nextFrom, to);

                await cursorRepository.setCursor(this.cursorKey(), to);
                processed += span;
                nextFrom = to + 1n;
            }
            Logger.info("[LogReader] processed total of %s blocks. From: %s To: %s", processed, fromBlock, nextFrom);
        } catch (e) {
            Logger.error("[LogReader] something went wrong", e)
        }
    }

    private async processRange(fromBlock: bigint, toBlock: bigint) {
        const processor = Container.get(BlockLogProcessor);
        const logs = await processor.fetchLogs(fromBlock, toBlock);
        if (logs.length) Logger.info("For range %s to %s found %s logs", fromBlock, toBlock, logs.length)
        await processor.onLogs(logs)
    }
}