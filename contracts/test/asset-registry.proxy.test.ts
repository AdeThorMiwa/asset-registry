// We don't have Ethereum specific assertions in Hardhat 3 yet
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import UpgradeModule from "../ignition/modules/UpgradeModule.js";
import ProxyModule from "../ignition/modules/ProxyModule.js";
import UpgradeWithStateModule from "../ignition/modules/UpgradeWithStateModule.js";
import { zeroAddress, checksumAddress } from "viem";
import { PERSISTED_ASSET_ID, PERSISTED_DESC } from "../constants/index.js";

describe("AssetRegistry Proxy", async function () {
  const { ignition, viem } = await network.connect();

  describe("Proxy & Initialization", function () {
    it("Should deploy and expose version 1.0.0", async function () {
      const [, otherAccount] = await viem.getWalletClients();

      const { assetRegistry } = await ignition.deploy(ProxyModule);

      assert.equal(
        await assetRegistry.read.version({ account: otherAccount.account.address }),
        "1.0.0"
      );
    });

    it("Should set the contract owner from initialize(initialOwner)", async function () {
      const [deployer] = await viem.getWalletClients();
      const { assetRegistry } = await ignition.deploy(ProxyModule);

      const owner = await assetRegistry.read.owner({ account: deployer.account.address });
      assert.equal(checksumAddress(owner), checksumAddress(deployer.account.address));
    });

    it("Should prevent re-initialization (initializer guard)", async function () {
      const [, otherAccount] = await viem.getWalletClients();
      const { assetRegistry } = await ignition.deploy(ProxyModule);

      await assert.rejects(
        assetRegistry.write.initialize([otherAccount.account.address], {
          account: otherAccount.account.address,
        }),
        // Error message comes from OpenZeppelin Initializable
        /InvalidInitialization/i
      );
    });
  });

  describe("Registration & Queries", function () {
    it("Registers new asset and reads it back", async function () {
      const [, alice] = await viem.getWalletClients();
      const { assetRegistry } = await ignition.deploy(ProxyModule);

      const assetId = 42n;
      const desc = "Red Tesla Model 3";

      await assetRegistry.write.registerAsset([assetId, desc], {
        account: alice.account.address,
      });

      const [owner, description, timestamp, exists] = await assetRegistry.read.getAsset([assetId]);

      assert.equal(checksumAddress(owner), checksumAddress(alice.account.address));
      assert.equal(description, desc);
      assert.equal(exists, true);
      assert.ok(timestamp > 0n);
    });

    it("Allows empty description and large asset IDs", async function () {
      const [, alice] = await viem.getWalletClients();
      const { assetRegistry } = await ignition.deploy(ProxyModule);

      // Empty description
      const a1 = 7n;
      await assetRegistry.write.registerAsset([a1, ""], {
        account: alice.account.address,
      });
      const [owner1, desc1, , exists1] = await assetRegistry.read.getAsset([a1]);
      assert.equal(checksumAddress(owner1), checksumAddress(alice.account.address));
      assert.equal(desc1, "");
      assert.equal(exists1, true);

      // Very large uint256 value
      const bigId = (1n << 255n) - 1n;
      await assetRegistry.write.registerAsset([bigId, "Big Asset"], {
        account: alice.account.address,
      });
      const [owner2, desc2, , exists2] = await assetRegistry.read.getAsset([bigId]);
      assert.equal(checksumAddress(owner2), checksumAddress(alice.account.address));
      assert.equal(desc2, "Big Asset");
      assert.equal(exists2, true);
    });

    it("assetExists and ownerOf behave consistently", async function () {
      const [, alice] = await viem.getWalletClients();
      const { assetRegistry } = await ignition.deploy(ProxyModule);

      const id = 123n;
      assert.equal(await assetRegistry.read.assetExists([id]), false);

      await assetRegistry.write.registerAsset([id, "Laptop"], {
        account: alice.account.address,
      });

      assert.equal(await assetRegistry.read.assetExists([id]), true);

      const owner = await assetRegistry.read.ownerOf([id]);
      const [owner2] = await assetRegistry.read.getAsset([id]);

      assert.equal(checksumAddress(owner), checksumAddress(alice.account.address));
      assert.equal(checksumAddress(owner2), checksumAddress(alice.account.address));
    });
  });

  describe("Transfers", function () {
    it("Owner can transfer; new owner reflected in reads", async function () {
      const [, alice, bob] = await viem.getWalletClients();
      const { assetRegistry } = await ignition.deploy(ProxyModule);

      const id = 9001n;
      await assetRegistry.write.registerAsset([id, "Microscope"], {
        account: alice.account.address,
      });

      await assetRegistry.write.transferOwnershipOf([id, bob.account.address], {
        account: alice.account.address,
      });

      assert.equal(checksumAddress(await assetRegistry.read.ownerOf([id])), checksumAddress(bob.account.address));

      const [ownerAfter] = await assetRegistry.read.getAsset([id]);
      assert.equal(checksumAddress(ownerAfter), checksumAddress(bob.account.address));
    });

    it("Supports multiple sequential transfers", async function () {
      const [, alice, bob] = await viem.getWalletClients();
      const { assetRegistry } = await ignition.deploy(ProxyModule);

      const id = 777n;
      await assetRegistry.write.registerAsset([id, "Sequencer"], {
        account: alice.account.address,
      });

      // Alice -> Bob
      await assetRegistry.write.transferOwnershipOf([id, bob.account.address], {
        account: alice.account.address,
      });
      assert.equal(checksumAddress(await assetRegistry.read.ownerOf([id])), checksumAddress(bob.account.address));

      // Bob -> Alice
      await assetRegistry.write.transferOwnershipOf([id, alice.account.address], {
        account: bob.account.address,
      });
      assert.equal(checksumAddress(await assetRegistry.read.ownerOf([id])), checksumAddress(alice.account.address));
    });
  });

  describe("Reverts", function () {
    it("Rejects duplicate registration", async function () {
      const [, alice] = await viem.getWalletClients();
      const { assetRegistry } = await ignition.deploy(ProxyModule);

      const id = 2n;
      await assetRegistry.write.registerAsset([id, "First"], {
        account: alice.account.address,
      });

      await assert.rejects(
        assetRegistry.write.registerAsset([id, "Second"], {
          account: alice.account.address,
        }),
        /AssetAlreadyRegistered/i
      );
    });

    it("Rejects transfer by non-owner", async function () {
      const [, alice, bob] = await viem.getWalletClients();
      const { assetRegistry } = await ignition.deploy(ProxyModule);

      const id = 3n;
      await assetRegistry.write.registerAsset([id, "Phone"], {
        account: alice.account.address,
      });

      await assert.rejects(
        assetRegistry.write.transferOwnershipOf([id, bob.account.address], {
          account: bob.account.address, // wrong owner
        }),
        /NotAssetOwner/i
      );
    });

    it("Rejects transfer to zero address", async function () {
      const [, alice] = await viem.getWalletClients();
      const { assetRegistry } = await ignition.deploy(ProxyModule);

      const id = 4n;
      await assetRegistry.write.registerAsset([id, "Camera"], {
        account: alice.account.address,
      });

      await assert.rejects(
        assetRegistry.write.transferOwnershipOf([id, zeroAddress], {
          account: alice.account.address,
        }),
        /InvalidAddress/i
      );
    });

    it("Rejects ownerOf/getAsset/transfer on non-existent asset", async function () {
      const [, alice] = await viem.getWalletClients();
      const { assetRegistry } = await ignition.deploy(ProxyModule);

      const id = 9999n;

      await assert.rejects(assetRegistry.read.ownerOf([id]), /AssetNotFound/i);
      await assert.rejects(assetRegistry.read.getAsset([id]), /AssetNotFound/i);

      await assert.rejects(
        assetRegistry.write.transferOwnershipOf([id, alice.account.address], {
          account: alice.account.address,
        }),
        /AssetNotFound/i
      );
    });
  });

  describe("Upgrading", function () {
    it("Should have upgraded the proxy to V2", async function () {
      const [, otherAccount] = await viem.getWalletClients();

      const { assetRegistry } = await ignition.deploy(UpgradeModule);

      assert.equal(
        await assetRegistry.read.version({ account: otherAccount.account.address }),
        "2.0.0"
      );
    });

    it("Preserves state across upgrade (pre-registered assets remain)", async function () {
      const [, alice] = await viem.getWalletClients();

      const { assetRegistry } = await ignition.deploy(UpgradeWithStateModule);

      assert.equal(await assetRegistry.read.version({ account: alice.account.address }), "2.0.0");

      const [owner, desc, , exists] = await assetRegistry.read.getAsset([PERSISTED_ASSET_ID]);

      assert.equal(checksumAddress(owner), checksumAddress(alice.account.address));
      assert.equal(desc, PERSISTED_DESC);
      assert.equal(exists, true);

      const assetOwner = await assetRegistry.read.ownerOf([PERSISTED_ASSET_ID]);
      // Additional sanity: ownerOf returns same owner
      assert.equal(
        checksumAddress(assetOwner),
        checksumAddress(alice.account.address)
      );
    });
  });
});