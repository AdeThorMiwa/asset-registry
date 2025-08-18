import { IPaginationQuery } from "./logs";

export interface ISaveAssetPayload {
    assetId: bigint;
    description: string;
    timestamp: bigint;
    registeredBy: string;
    currentOwner: string;
}

export interface IGetAssetQuery extends IPaginationQuery {
    owner?: `0x${string}`
}