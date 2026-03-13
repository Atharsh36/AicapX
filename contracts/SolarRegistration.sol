// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

/**
 * @title SolarRegistration
 * @dev Fractional NFT contract for the RWA investment platform.
 *      Admin mints one ERC-721 token representing a project.
 *      Fractional ownership (investment shares) is tracked per-address in mappings.
 *
 * Flow:
 *   1. Admin calls mint() with fractional owners & amounts → single tx
 *   2. Token minted to address(this), fractions assigned to owners
 *   3. Investors call transferFractionalOwnership() to trade shares
 *   4. Admin calls burnFractionalOwnership() to reclaim fractions
 */
contract SolarRegistration is ERC721Enumerable {
    address public owner;
    uint256 public _tokenIdCounter = 0;

    struct SolarToken {
        uint256 tokenId;
        string  name;
        string  description;
        address[] fractinalOwners;
        uint256[] fractionalAmounts;
    }

    struct FractionalOwnership {
        uint256 tokenId;
        uint256 amount;
    }

    mapping(uint256 => SolarToken)             public _SolarTokens;
    mapping(address => FractionalOwnership[])  public _fractionalOwnerships;

    // ─── Events ──────────────────────────────────────────────────────────
    event TokenMinted(uint256 indexed tokenId, string name, address[] owners, uint256[] amounts);
    event FractionalTransfer(uint256 indexed tokenId, address indexed from, address indexed to, uint256 amount);
    event FractionalBurned(uint256 indexed tokenId, address indexed from, uint256 amount);

    constructor() ERC721("FractionalSolarRegistration", "FSR") {
        owner = msg.sender;
    }

    // ─────────────────────────────────────────────────────────────────────
    // MINT — Admin only. Single transaction mints the ERC-721 and assigns fractions.
    // ─────────────────────────────────────────────────────────────────────
    function mint(
        address[] memory fractinalOwners,
        uint256[] memory fractionalAmounts,
        string memory name,
        string memory description
    ) public {
        require(owner == msg.sender, "SolarRegistration: only owner can mint");
        require(
            fractinalOwners.length == fractionalAmounts.length,
            "SolarRegistration: fractional owners and fractional amounts length mismatch"
        );

        _tokenIdCounter++;
        _mint(address(this), _tokenIdCounter);

        _SolarTokens[_tokenIdCounter] = SolarToken(
            _tokenIdCounter,
            name,
            description,
            fractinalOwners,
            fractionalAmounts
        );

        for (uint256 i = 0; i < fractinalOwners.length; i++) {
            _fractionalOwnerships[fractinalOwners[i]].push(
                FractionalOwnership(_tokenIdCounter, fractionalAmounts[i])
            );
        }

        emit TokenMinted(_tokenIdCounter, name, fractinalOwners, fractionalAmounts);
    }

    // ─────────────────────────────────────────────────────────────────────
    // TRANSFER FRACTIONAL OWNERSHIP
    // ─────────────────────────────────────────────────────────────────────
    function transferFractionalOwnership(
        address to,
        uint256 tokenId,
        uint256 amount
    ) public {
        address from = msg.sender;
        require(
            _fractionalOwnerships[from].length > 0,
            "SolarRegistration: fractional ownership not found"
        );

        for (uint256 i = 0; i < _fractionalOwnerships[from].length; i++) {
            if (_fractionalOwnerships[from][i].tokenId == tokenId) {
                if (_fractionalOwnerships[from][i].amount - amount == 0) {
                    delete _fractionalOwnerships[from][i];
                    bool found = false;
                    for (uint256 j = 0; j < _fractionalOwnerships[to].length; j++) {
                        if (_fractionalOwnerships[to][j].tokenId == tokenId) {
                            _fractionalOwnerships[to][j].amount += amount;
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        _fractionalOwnerships[to].push(FractionalOwnership(tokenId, amount));
                    }
                    for (uint256 j = 0; j < _SolarTokens[tokenId].fractinalOwners.length; j++) {
                        if (_SolarTokens[tokenId].fractinalOwners[j] == from) {
                            _SolarTokens[tokenId].fractinalOwners[j] = to;
                        }
                    }
                } else {
                    _fractionalOwnerships[from][i].amount -= amount;
                    bool found = false;
                    for (uint256 j = 0; j < _fractionalOwnerships[to].length; j++) {
                        if (_fractionalOwnerships[to][j].tokenId == tokenId) {
                            _fractionalOwnerships[to][j].amount += amount;
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        _fractionalOwnerships[to].push(FractionalOwnership(tokenId, amount));
                    }
                    for (uint256 j = 0; j < _SolarTokens[tokenId].fractinalOwners.length; j++) {
                        if (_SolarTokens[tokenId].fractinalOwners[j] == from) {
                            _SolarTokens[tokenId].fractionalAmounts[j] -= amount;
                        }
                    }
                    found = false;
                    for (uint256 j = 0; j < _SolarTokens[tokenId].fractinalOwners.length; j++) {
                        if (_SolarTokens[tokenId].fractinalOwners[j] == to) {
                            _SolarTokens[tokenId].fractionalAmounts[j] += amount;
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        _SolarTokens[tokenId].fractinalOwners.push(to);
                        _SolarTokens[tokenId].fractionalAmounts.push(amount);
                    }
                }
                break;
            }
        }

        emit FractionalTransfer(tokenId, from, to, amount);
    }

    // ─────────────────────────────────────────────────────────────────────
    // BURN FRACTIONAL OWNERSHIP — Admin only
    // ─────────────────────────────────────────────────────────────────────
    function burnFractionalOwnership(
        address from,
        uint256 tokenId,
        uint256 amount
    ) public {
        require(owner == msg.sender, "SolarRegistration: only owner can burn");
        require(
            _fractionalOwnerships[from].length > 0,
            "SolarRegistration: fractional ownership not found"
        );

        FractionalOwnership[] memory fractionalOwnerships = _fractionalOwnerships[from];
        for (uint256 i = 0; i < fractionalOwnerships.length; i++) {
            if (fractionalOwnerships[i].tokenId == tokenId) {
                require(
                    fractionalOwnerships[i].amount >= amount,
                    "SolarRegistration: fractional ownership amount exceeded"
                );
                break;
            }
        }

        for (uint256 i = 0; i < _fractionalOwnerships[from].length; i++) {
            if (_fractionalOwnerships[from][i].tokenId == tokenId) {
                _fractionalOwnerships[from][i].amount -= amount;
                if (_fractionalOwnerships[from][i].amount == 0) {
                    delete _fractionalOwnerships[from][i];
                    for (uint256 j = 0; j < _SolarTokens[tokenId].fractinalOwners.length; j++) {
                        if (_SolarTokens[tokenId].fractinalOwners[j] == from) {
                            delete _SolarTokens[tokenId].fractinalOwners[j];
                            delete _SolarTokens[tokenId].fractionalAmounts[j];
                        }
                    }
                } else {
                    for (uint256 j = 0; j < _SolarTokens[tokenId].fractinalOwners.length; j++) {
                        if (_SolarTokens[tokenId].fractinalOwners[j] == from) {
                            _SolarTokens[tokenId].fractionalAmounts[j] = _fractionalOwnerships[from][i].amount;
                        }
                    }
                }
                break;
            }
        }

        emit FractionalBurned(tokenId, from, amount);
    }

    // ─────────────────────────────────────────────────────────────────────
    // VIEW FUNCTIONS
    // ─────────────────────────────────────────────────────────────────────

    /// @notice Returns all SolarTokens in which msg.sender holds fractions.
    function getDetailedFractionOwnership() public view returns (SolarToken[] memory) {
        FractionalOwnership[] memory fractionalOwnerships = _fractionalOwnerships[msg.sender];
        if (fractionalOwnerships.length == 0) {
            return new SolarToken[](0);
        }
        SolarToken[] memory tokens = new SolarToken[](fractionalOwnerships.length);
        for (uint256 i = 0; i < fractionalOwnerships.length; i++) {
            tokens[i] = _SolarTokens[fractionalOwnerships[i].tokenId];
        }
        return tokens;
    }

    /// @notice Returns the fraction amount held by `holder` for a given tokenId.
    function getFractionalBalance(address holder, uint256 tokenId) public view returns (uint256) {
        FractionalOwnership[] memory ownerships = _fractionalOwnerships[holder];
        for (uint256 i = 0; i < ownerships.length; i++) {
            if (ownerships[i].tokenId == tokenId) return ownerships[i].amount;
        }
        return 0;
    }

    /// @notice Returns ownership percentage in basis points (10000 = 100%).
    function getOwnershipBps(address holder, uint256 tokenId) public view returns (uint256) {
        uint256 balance = getFractionalBalance(holder, tokenId);
        uint256 totalSupply_ = 0;
        uint256[] memory amounts = _SolarTokens[tokenId].fractionalAmounts;
        for (uint256 i = 0; i < amounts.length; i++) totalSupply_ += amounts[i];
        if (totalSupply_ == 0) return 0;
        return (balance * 10000) / totalSupply_;
    }

    function getSolarTokenById(uint256 tokenId) public view returns (SolarToken memory) {
        return _SolarTokens[tokenId];
    }
}
