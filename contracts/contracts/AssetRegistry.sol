// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

/**
 * @title AssetRegistry
 */
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract AssetRegistry is Initializable, OwnableUpgradeable {
    // Errors
    error AssetAlreadyRegistered(uint256 assetId);
    error AssetNotFound(uint256 assetId);
    error NotAssetOwner(address caller, uint256 assetId);
    error InvalidAddress();

    struct Asset {
        address owner;
        string description;
        uint64 registrationTimestamp; // in UTC
        bool exists;
    }

    mapping(uint256 => Asset) private _assets;

    // STORAGE GAP
    // Reserve storage slots for future variables (append-only layout).
    // Adjust length if you add new variables later.
    uint256[50] private __gap;

    // Events
    event AssetRegistered(
        uint256 indexed assetId,
        address indexed owner,
        string description,
        uint256 registrationTimestamp
    );

    event OwnershipTransferred(
        uint256 indexed assetId,
        address indexed previousOwner,
        address indexed newOwner,
        uint256 timestamp
    );

    /**
     * @notice Proxy-safe initializer
     * @param initialOwner The address to set as contract owner (authorized to upgrade).
     */
    function initialize(address initialOwner) public initializer {
        // Initialize inherited upgradeable modules
        __Ownable_init(initialOwner);
    }

    /**
     * @notice Register a new asset with caller as initial owner.
     * @param assetId Unique asset identifier.
     * @param description Asset description.
     */
    function registerAsset(
        uint256 assetId,
        string calldata description
    ) external {
        if (_assets[assetId].exists) revert AssetAlreadyRegistered(assetId);

        _assets[assetId] = Asset({
            owner: msg.sender,
            description: description,
            registrationTimestamp: uint64(block.timestamp),
            exists: true
        });

        emit AssetRegistered(assetId, msg.sender, description, block.timestamp);
    }

    /**
     * @notice Transfer ownership to a new owner.
     * @param assetId Asset id.
     * @param newOwner Recipient address.
     */
    function transferOwnershipOf(uint256 assetId, address newOwner) external {
        Asset storage asset = _assets[assetId];
        if (!asset.exists) revert AssetNotFound(assetId);
        if (asset.owner != msg.sender)
            revert NotAssetOwner(msg.sender, assetId);
        if (newOwner == address(0)) revert InvalidAddress();

        address prev = asset.owner;
        asset.owner = newOwner;

        emit OwnershipTransferred(assetId, prev, newOwner, block.timestamp);
    }

    /**
     * @notice Get details for an asset.
     */
    function getAsset(
        uint256 assetId
    )
        external
        view
        returns (
            address owner,
            string memory description,
            uint64 registrationTimestamp,
            bool exists
        )
    {
        Asset memory a = _assets[assetId];
        if (!a.exists) revert AssetNotFound(assetId);
        return (a.owner, a.description, a.registrationTimestamp, a.exists);
    }

    /**
     * @notice Returns true if asset exists.
     */
    function assetExists(uint256 assetId) external view returns (bool) {
        return _assets[assetId].exists;
    }

    /**
     * @notice Current owner of an asset (reverts if asset does not exist).
     */
    function ownerOf(uint256 assetId) external view returns (address) {
        Asset storage a = _assets[assetId];
        if (!a.exists) revert AssetNotFound(assetId);
        return a.owner;
    }

    /**
     * @notice Version tag to verify implementation during upgrades.
     */
    function version() external pure virtual returns (string memory) {
        return "1.0.0";
    }
}
