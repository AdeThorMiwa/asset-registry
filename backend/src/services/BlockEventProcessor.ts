import { Container, Service } from "typedi";
import { type AssetRegisteredEventArgs, EventName, type LogEventProcessorFunc, type OwnershipTransferEventArgs, type ParsedLogEvent } from "../interface/logs";
import type { ISaveTransferPayload } from "../interface/transfer";
import TransferRepository from "../repositories/TransferRepository";
import AssetRepository from "../repositories/AssetRepository";
import type { ISaveAssetPayload } from "../interface/asset";
import Logger from "../utils/logger";

@Service()
export class BlockEventProcessor implements Record<EventName, LogEventProcessorFunc> {
    private readonly assetRepository: AssetRepository;
    private readonly transferRepository: TransferRepository;
    constructor(
    ) {
        this.assetRepository = Container.get(AssetRepository);
        this.transferRepository = Container.get(TransferRepository);
    }

    public [EventName.AssetRegistered] = async (event: ParsedLogEvent<AssetRegisteredEventArgs>) => {
        Logger.debug("New [EventName.AssetRegistered] event");

        const payload: ISaveAssetPayload = {
            assetId: event.args.assetId,
            registeredBy: event.args.owner,
            currentOwner: event.args.owner,
            description: event.args.description,
            timestamp: event.args.registrationTimestamp,
        };

        await this.assetRepository.save(payload);
    }

    public [EventName.OwnershipTransferred] = async (event: ParsedLogEvent<OwnershipTransferEventArgs>) => {
        Logger.debug("New [EventName.OwnershipTransferred] event");

        const asset = await this.assetRepository.getById(event.args.assetId);
        if (!asset) {
            Logger.warn("[EventName.OwnershipTransferred] asset not found", event);
            return;
        }

        const payload: ISaveTransferPayload = {
            assetId: event.args.assetId,
            newOwner: event.args.newOwner,
            previousOwner: event.args.previousOwner,
            blockNumber: event.blockNumber,
            blockTimestamp: event.timestamp.getTime(),
            logIndex: event.logIndex,
            txHash: event.hash,
        };

        await this.transferRepository.save(payload);
    }

    public [EventName.Unknown] = async (log: ParsedLogEvent) => {
        Logger.debug("Unknown event", { log });
    }
}