

import { network } from "hardhat";
import { getEnv } from "./utils.js";
import { NetworkConnection } from "hardhat/types/network";
import ProxyModule from "../ignition/modules/ProxyModule.js";

// Your sample daily transfer pattern; we’ll repeat it until targetTransfers is reached.
const BASE_PATTERN = [3, 0, 5, 2, 7, 4, 9, 1, 0, 6, 8, 2, 12, 3, 0, 15, 7];

function buildDailyCounts(targetTransfers: number): number[] {
    const counts: number[] = [];
    let total = 0;
    while (total < targetTransfers) {
        for (const c of BASE_PATTERN) {
            const add = Math.min(c, targetTransfers - total);
            counts.push(add);
            total += add;
            if (total >= targetTransfers) break;
        }
    }
    return counts;
}

async function increaseByMinute(network: NetworkConnection<"l1">) {
    await network.provider.request({
        method: "evm_increaseTime",
        params: [60],
    });
    await network.provider.request({ method: "evm_mine", params: [] });
}

async function increaseByDay(network: NetworkConnection<"l1">) {
    await network.provider.request({
        method: "evm_increaseTime",
        params: [60 * 60 * 24],
    });
    await network.provider.request({ method: "evm_mine", params: [] });
}

async function main() {
    const proxyAddressEnv = getEnv("SEED_PROXY_ADDRESS");
    const targetTransfers = Number(getEnv("TARGET_TRANSFER") ?? "1000");
    const ownersCount = Number(getEnv("OWNERS_COUNT") ?? "5");
    const regsPerDay = Number(getEnv("REGS_PER_DAY") ?? "3");

    console.log("Running on network: ", getEnv("NETWORK", true))

    const hre = await network.connect({
        network: getEnv("NETWORK", true)!,
        chainType: "l1",
    });

    const publicClient = await hre.viem.getPublicClient();
    const wallets = await hre.viem.getWalletClients();


    // 1) Deploy or attach to proxy
    let proxyAddress: `0x${string}`;
    if (proxyAddressEnv) {
        proxyAddress = proxyAddressEnv as `0x${string}`;
        console.log(`Using existing proxy at ${proxyAddress}`);
    } else {
        console.log("Deploying implementation + ProxyAdmin + Transparent proxy...");
        const { assetRegistry, assetRegistryImpl, proxyAdmin, proxy } = await hre.ignition.deploy(ProxyModule);

        proxyAddress = assetRegistry.address;
        console.log("Deployed:");
        console.log({ registry: assetRegistry.address, impl: assetRegistryImpl.address, proxyAdmin: proxyAdmin.address, proxy: proxy.address });
    }


    const assetRegistry = await hre.viem.getContractAt("AssetRegistry", proxyAddress);

    let version = await assetRegistry.read.version();

    console.log("seeding to version: ", version);

    // 2) Build daily transfer counts to hit the target
    const daily = buildDailyCounts(targetTransfers);
    console.log(`Days to simulate: ${daily.length} (target transfers: ${targetTransfers})`);

    // 3) Seed loop
    const owners = wallets.slice(0, ownersCount);
    const ownerAddr = owners.map(w => w.account.address);

    // State: current owner of each assetId (by wallet index)
    const currentOwnerIndex = new Map<bigint, number>();

    // Keep a pool of assets to transfer. We'll keep growing it gradually.
    let nextAssetId = 1n;

    // Helper to register one asset by `byIdx` as owner.
    const registerOne = async (byIdx: number) => {
        const assetId = nextAssetId++;
        const description = `Asset ${assetId.toString()}`;
        const tx = await assetRegistry.write.registerAsset([assetId, description], {
            account: owners[byIdx].account.address,
        });
        await publicClient.waitForTransactionReceipt({ hash: tx });
        currentOwnerIndex.set(assetId, byIdx);
        return assetId;
    };

    // Helper to transfer one asset to the next owner in rotation
    const transferOne = async (assetId: bigint) => {
        const curIdx = currentOwnerIndex.get(assetId)!;
        const newIdx = (curIdx + 1) % owners.length;
        const tx = await assetRegistry.write.transferOwnershipOf([assetId, ownerAddr[newIdx]], {
            account: owners[curIdx].account.address,
        });
        await publicClient.waitForTransactionReceipt({ hash: tx });
        currentOwnerIndex.set(assetId, newIdx);
    };

    // We’ll vary registration counts per day, but ensure there are always assets to transfer.
    // Simple policy: register `regsPerDay` new assets daily, then perform the day's transfers
    // picking assets round-robin from the pool.
    const assetIds: bigint[] = [];

    let totalRegs = 0;
    let totalTransfers = 0;

    for (let d = 0; d < daily.length; d++) {

        // A) registrations for the day (staggered in the first 30 minutes)
        for (let r = 0; r < regsPerDay; r++) {
            const byIdx = (d + r) % owners.length;
            const assetId = await registerOne(byIdx);
            await increaseByMinute(hre)
            assetIds.push(assetId);
            totalRegs++;
        }

        // Ensure we have at least some assets before starting transfers
        if (assetIds.length === 0) {
            // Register 1 immediately
            const assetId = await registerOne(d % owners.length);
            await increaseByMinute(hre)
            assetIds.push(assetId);
            totalRegs++;
        }

        // B) transfers for the day (spread across midday to evening)
        const transfersToday = daily[d];
        for (let k = 0; k < transfersToday; k++) {
            // round-robin pick an asset
            const assetId = assetIds[(d * 97 + k) % assetIds.length]; // pseudo-random-ish but deterministic
            await transferOne(assetId);
            await increaseByMinute(hre)
            totalTransfers++;
        }

        if ((d + 1) % 10 === 0) {
            console.log(`Day ${d + 1}/${daily.length}: regs=${totalRegs}, transfers=${totalTransfers}`);
        }

        await increaseByDay(hre)
    }

    // set timestamp to current date
    await hre.provider.request({
        method: "evm_setNextBlockTimestamp",
        params: [Math.floor(Date.now() / 1000)],
    });

    version = await assetRegistry.read.version();
    console.log("Done seeding.");
    console.log({ proxyAddress, version, totalRegistrations: totalRegs, totalTransfers });

    console.log("\nSet this in your backend .env for local run:");
    console.log(`ASSET_REGISTRY_ADDRESS=${proxyAddress}`);
}

main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
});
