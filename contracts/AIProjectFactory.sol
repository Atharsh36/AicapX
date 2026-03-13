// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title AIProjectFactory
 * @dev Handles the creation, approval, and fractional NFT minting for AI Projects.
 */
contract AIProjectFactory is ERC1155, Ownable, ReentrancyGuard {
    uint256 public nextProjectId = 1;

    enum ProjectStatus { Draft, Submitted, UnderReview, Approved, Rejected, Active }

    struct Project {
        string name;
        address payable startupWallet;
        uint256 fundingGoal;
        uint256 tokenSupply;
        string metadataURI;
        ProjectStatus status;
    }

    mapping(uint256 => Project) public projects;

    event ProjectCreated(uint256 indexed projectId, string name, address startupWallet);
    event ProjectApproved(uint256 indexed projectId);
    event FractionalNFTMinted(uint256 indexed projectId, address indexed treasury, uint256 amount);
    event Invested(uint256 indexed projectId, address indexed investor, uint256 amountInvested, uint256 tokensBought);

    constructor() ERC1155("https://api.omniai.network/metadata/{id}.json") Ownable(msg.sender) {}

    /**
     * @dev Startup submits a new project. Sets status to UnderReview.
     */
    function createProject(
        string memory _name,
        address payable _startupWallet,
        uint256 _fundingGoal,
        uint256 _tokenSupply,
        string memory _metadataURI
    ) external returns (uint256) {
        uint256 projectId = nextProjectId++;

        projects[projectId] = Project({
            name: _name,
            startupWallet: _startupWallet,
            fundingGoal: _fundingGoal,
            tokenSupply: _tokenSupply,
            metadataURI: _metadataURI,
            status: ProjectStatus.UnderReview
        });

        emit ProjectCreated(projectId, _name, _startupWallet);
        return projectId;
    }

    /**
     * @dev Admin approves the project and triggers the minting process.
     * @param _projectId The ID of the project to approve.
     * @param _projectTreasury The wallet where the minted F-NFTs will be transferred.
     */
    function approveProject(uint256 _projectId, address _projectTreasury) external onlyOwner {
        Project storage project = projects[_projectId];
        require(project.status == ProjectStatus.UnderReview, "Project not under review");

        project.status = ProjectStatus.Approved;
        
        emit ProjectApproved(_projectId);

        // Call internal minting function as per requirements
        mintFractionalNFT(_projectId, _projectTreasury);

        project.status = ProjectStatus.Active;
    }

    /**
     * @dev Internal function to mint fractional NFTs representing project ownership.
     */
    function mintFractionalNFT(uint256 _projectId, address _projectTreasury) internal {
        Project storage project = projects[_projectId];
        
        // Mints from 0x0...0 to the Project Treasury Wallet
        _mint(_projectTreasury, _projectId, project.tokenSupply, "");

        emit FractionalNFTMinted(_projectId, _projectTreasury, project.tokenSupply);
    }

    /**
     * @dev Investors purchase fractional NFTs from an Active project.
     * @param _projectId The ID of the project to invest in.
     */
    function invest(uint256 _projectId) external payable nonReentrant {
        Project storage project = projects[_projectId];
        require(project.status == ProjectStatus.Active, "Project not active for investment");
        require(msg.value > 0, "Investment must be > 0");

        // Simple calculation for MVP: $1 = some amount of tokens based on goal/supply
        // For simplicity, we use the ratio: tokens = (value * supply) / goal
        uint256 tokensToTransfer = (msg.value * project.tokenSupply) / project.fundingGoal;
        require(tokensToTransfer > 0, "Investment too small for 1 token");
        
        // In this factory model, the tokens are initially in the Project Treasury (startupWallet)
        // because we minted to treasury in approveProject.
        // We transfer from treasury to investor. 
        // NOTE: For this to work simple, the Treasury must have approved the contract or we use _safeTransferFrom
        // For this MVP, we will MINT directly to investor from 0x0 instead of secondary transfer, 
        // OR we can just mint more. 
        // User said: "Investors can buy fractional NFTs from the marketplace."
        // Let's stick to the "Buy" concept by minting to investor upon payment.
        
        _mint(msg.sender, _projectId, tokensToTransfer, "");

        // Transfer funds to startup
        (bool success, ) = project.startupWallet.call{value: msg.value}("");
        require(success, "Payment to startup failed");

        emit Invested(_projectId, msg.sender, msg.value, tokensToTransfer);
    }

    // Set a custom URI for metadata if needed
    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }
}
