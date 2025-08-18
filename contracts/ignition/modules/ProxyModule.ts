import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ProxyModule = buildModule("ProxyModule", (m) => {
  const proxyOwner = m.getAccount(0);
  const assetRegistryImpl = m.contract("AssetRegistry");

  // Encode initializer data to run during proxy construction
  const initData = m.encodeFunctionCall(assetRegistryImpl, "initialize", [proxyOwner]);

  const proxy = m.contract("TransparentUpgradeableProxy", [
    assetRegistryImpl,
    proxyOwner,
    initData
  ]);

  const proxyAdminAddress = m.readEventArgument(
    proxy,
    "AdminChanged",
    "newAdmin"
  );

  const proxyAdmin = m.contractAt("ProxyAdmin", proxyAdminAddress);

  return { assetRegistryImpl, proxyAdmin, proxy };
});

export default buildModule("AssetRegistryModule", (m) => {
  const { proxy, proxyAdmin, assetRegistryImpl } = m.useModule(ProxyModule);

  const AssetRegistry = m.contractAt("AssetRegistry", proxy);

  return { assetRegistry: AssetRegistry, proxy, proxyAdmin, assetRegistryImpl };
});