import { network } from "hardhat";
import { getEnv } from "./utils.js";

async function main() {
  const proxyAddress = getEnv("PROXY_ADDRESS", true) as `0x${string}`;
  const assetId = BigInt(getEnv("ASSET_ID", true)!);
  const descriptionEnv = getEnv("ASSET_DESCRIPTION", true)!;
  const confirmations = Number(getEnv("CONFIRMATIONS") ?? "1");

  const { viem } = await network.connect({
    network: getEnv("NETWORK", true)!,
    chainType: "l1",
  });

  const publicClient = await viem.getPublicClient();
  const [wallet] = await viem.getWalletClients();

  const assetRegistry = await viem.getContractAt("AssetRegistry", proxyAddress);

  const version = await assetRegistry.read.version({
    account: wallet.account.address,
  });
  console.log(`Connected to AssetRegistry at ${proxyAddress} (version: ${version})`);
  console.log(`Using sender: ${wallet.account.address}`);

  const exists = await assetRegistry.read.assetExists([assetId]);
  if (exists) {
    console.log(
      `Asset ${assetId.toString()} already exists. Skipping registration.`
    );
    return;
  }

  console.log(
    `Registering assetId=${assetId.toString()} with description="${descriptionEnv}"...`
  );
  const txHash = await assetRegistry.write.registerAsset([assetId, descriptionEnv], {
    account: wallet.account.address,
  });

  console.log(`Tx sent: ${txHash}`);
  const receipt = await publicClient.waitForTransactionReceipt({
    hash: txHash,
    confirmations: confirmations,
  });

  console.log(
    `Tx confirmed in block ${receipt.blockNumber} (status=${receipt.status})`
  );

  // Read back
  const [owner, description, registrationTs, nowExists] =
    await assetRegistry.read.getAsset([assetId]);

  console.log("Read-back result:");
  console.log({
    owner,
    description,
    registrationTimestamp: registrationTs.toString(),
    exists: nowExists,
  });
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});