// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract AiRegistration is ERC721 {
    uint256 public _tokenIdCounter = 0;
    address public owner;

    constructor() ERC721("AutoAgent System", "AAS") {
        owner = msg.sender;
    }

    function invest(uint256 /*projectId*/, uint256 shares) public payable {
        for (uint256 i = 0; i < shares; i++) {
            _tokenIdCounter++;
            _safeMint(msg.sender, _tokenIdCounter);
        }
        if (msg.value > 0) {
            payable(owner).transfer(msg.value);
        }
    }

    function mint(address[] memory owners, uint256[] memory amounts, string memory /*name*/, string memory /*description*/) public {
        // require(msg.sender == owner, "Only owner"); // Removed for universal access
        for (uint256 i = 0; i < owners.length; i++) {
            for (uint256 j = 0; j < amounts[i]; j++) {
                _tokenIdCounter++;
                _safeMint(owners[i], _tokenIdCounter);
            }
        }
    }

    function multiTransfer(address to, uint256[] memory tokenIds) public {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            safeTransferFrom(msg.sender, to, tokenIds[i]);
        }
    }
}
