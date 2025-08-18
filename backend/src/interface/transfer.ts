export interface ISaveTransferPayload {
    assetId: bigint;
    previousOwner: `0x${string}`;
    newOwner: `0x${string}`;
    blockNumber: bigint;
    blockTimestamp: number;
    txHash: string;
    logIndex: number;
}
