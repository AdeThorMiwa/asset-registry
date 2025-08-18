// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;
import "../AssetRegistry.sol";

/**
 * @title AssetRegistryV2
 * @notice Minimal V2 used for upgrade tests. Storage layout MUST be preserved.
 */
contract AssetRegistryV2 is AssetRegistry {
    function version() external pure override returns (string memory) {
        return "2.0.0";
    }
}
