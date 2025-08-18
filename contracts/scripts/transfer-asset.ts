import { network } from "hardhat";
import { getEnv } from "./utils.js";

async function main() {
    const proxyAddress = getEnv("PROXY_ADDRESS", true) as `0x${string}`;
    const assetId = BigInt(getEnv("ASSET_ID", true)!);

    const confirmations = Number(getEnv("CONFIRMATIONS") ?? "1");

    const { viem } = await network.connect({
        network: getEnv("NETWORK", true)!,
        chainType: "l1",
    });

    const publicClient = await viem.getPublicClient();
    const [fromClient, toClient] = await viem.getWalletClients()
    const fromAddress = fromClient.account.address;
    const toAddress = toClient.account.address;

    const assetRegistry = await viem.getContractAt("AssetRegistry", proxyAddress);

    const exists = await assetRegistry.read.assetExists([assetId]);
    if (!exists) {
        throw new Error(`Asset ${assetId.toString()} does not exist on ${proxyAddress}`);
    }

    // Execute transfer
    console.log(`Transferring assetId=${assetId.toString()} from ${fromAddress} to ${toAddress} ...`);
    const txHash = await assetRegistry.write.transferOwnershipOf([assetId, toAddress], {
        account: fromAddress,
    });

    console.log(`Tx sent: ${txHash}`);
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash, confirmations });
    console.log(`Confirmed in block ${receipt.blockNumber} (status=${receipt.status})`);

    // Read-back verification
    const newOwner = await assetRegistry.read.ownerOf([assetId]);
    console.log(`New owner: ${newOwner}`);
}

main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
});