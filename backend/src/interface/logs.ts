
export enum EventName {
    AssetRegistered = "AssetRegistered",
    OwnershipTransferred = "OwnershipTransferred",
    Unknown = "Unknown"
}

export interface ParsedLogEvent<T = Record<string, unknown>> {
    eventName: EventName;
    hash: string;
    blockNumber: bigint;
    timestamp: Date;
    logIndex: number;
    args: T;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LogEventProcessorFunc = (log: ParsedLogEvent<any>) => Promise<void>;

export interface AssetRegisteredEventArgs {
    assetId: bigint;
    owner: `0x${string}`;
    description: string;
    registrationTimestamp: bigint;
}

export interface OwnershipTransferEventArgs {
    assetId: bigint;
    previousOwner: `0x${string}`;
    newOwner: `0x${string}`;
    timestamp: bigint;
}

export interface IPaginationQuery {
    page?: number;
    limit?: number;
}