import type { Abi } from "viem";

export const EVENTS_ABI: Abi = [
    {
        type: "event",
        name: "AssetRegistered",
        inputs: [
            { indexed: true, name: "assetId", type: "uint256" },
            { indexed: true, name: "owner", type: "address" },
            { indexed: false, name: "description", type: "string" },
            { indexed: false, name: "registrationTimestamp", type: "uint256" },
        ],
    },
    {
        type: "event",
        name: "OwnershipTransferred",
        inputs: [
            { indexed: true, name: "assetId", type: "uint256" },
            { indexed: true, name: "previousOwner", type: "address" },
            { indexed: true, name: "newOwner", type: "address" },
            { indexed: false, name: "timestamp", type: "uint256" },
        ],
    },
    {
        type: "function",
        name: "ownerOf",
        stateMutability: "view",
        inputs: [{ name: "assetId", type: "uint256" }],
        outputs: [{ type: "address" }],
    },
    {
        type: "function",
        name: "assetExists",
        stateMutability: "view",
        inputs: [{ name: "assetId", type: "uint256" }],
        outputs: [{ type: "bool" }],
    },
    {
        type: "function",
        name: "version",
        stateMutability: "pure",
        inputs: [],
        outputs: [{ type: "string" }],
    },
]