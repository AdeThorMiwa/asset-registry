import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ProxyModule from "./ProxyModule.js";

const UpgradeModule = buildModule("UpgradeModule", (m) => {
    const proxyAdminOwner = m.getAccount(0);

    const { proxyAdmin, proxy } = m.useModule(ProxyModule);

    const UpgradedAssetRegistry = m.contract("AssetRegistryV2");

    const encodedFunctionCall = m.encodeFunctionCall(UpgradedAssetRegistry, "version", []);

    m.call(proxyAdmin, "upgradeAndCall", [proxy, UpgradedAssetRegistry, encodedFunctionCall], {
        from: proxyAdminOwner,
    });

    return { proxyAdmin, proxy };
});

export default buildModule("AssetRegistryUpgradedModule", (m) => {
    const { proxy } = m.useModule(UpgradeModule);

    const assetRegistry = m.contractAt("AssetRegistryV2", proxy);

    return { assetRegistry };
});