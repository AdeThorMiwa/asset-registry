import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ProxyModule from "./ProxyModule.js";
import { PERSISTED_ASSET_ID, PERSISTED_DESC } from "../../constants/index.js";

const UpgradeWithStateModule = buildModule("UpgradeWithStateModule", (m) => {
    // Accounts
    const deployer = m.getAccount(0);
    const alice = m.getAccount(1);

    const { proxyAdmin, proxy, assetRegistry: assetRegistryV1 } = m.useModule(ProxyModule);
    const UpgradedAssetRegistry = m.contract("AssetRegistryV2");

    const encodedFunctionCall = m.encodeFunctionCall(UpgradedAssetRegistry, "version", []);

    m.call(assetRegistryV1, "registerAsset", [PERSISTED_ASSET_ID, PERSISTED_DESC], { from: alice });

    // --- Upgrade to V2 ---
    m.call(proxyAdmin, "upgradeAndCall", [proxy, UpgradedAssetRegistry, encodedFunctionCall], {
        from: deployer
    });

    return { proxyAdmin, proxy };
});

export default buildModule("AssetRegistryUpgradedWithStateModule", (m) => {
    const { proxy } = m.useModule(UpgradeWithStateModule);

    const assetRegistry = m.contractAt("AssetRegistryV2", proxy);

    return { assetRegistry };
})