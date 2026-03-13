// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ProjectInvestmentToken
 * @dev Decentralized RWA investment platform on BNB Chain.
 *      Startups submit projects → Admin approves → ERC-1155 F-NFTs minted.
 *      Investors purchase fractional tokens representing real ownership shares.
 */
contract ProjectInvestmentToken is ERC1155, Ownable, ReentrancyGuard {

    // ─── State ───────────────────────────────────────────────────────────────
    uint256 public nextProjectId = 1;

    enum ProjectStatus {
        UnderReview,  // 0 – submitted, pending admin action
        Approved,     // 1 – approved, minting in progress
        Active,       // 2 – tokens minted, open for investment
        Rejected      // 3 – rejected by admin
    }

    struct Project {
        uint256 projectId;
        string  projectName;
        address payable projectWallet;   // treasury that receives raised funds
        uint256 fundingGoal;             // in wei (BNB)
        uint256 tokenSupply;             // total F-NFT count
        uint256 raisedAmount;            // total BNB raised so far
        string  metadataURI;
        ProjectStatus status;
        uint256 createdAt;
    }

    // projectId → Project
    mapping(uint256 => Project) public projects;

    // projectId → investor → token balance (mirrors ERC-1155 but cached for gas-free reads)
    mapping(uint256 => mapping(address => uint256)) public investorBalance;

    // ─── Events ──────────────────────────────────────────────────────────────
    event ProjectCreated(
        uint256 indexed projectId,
        string  projectName,
        address projectWallet,
        uint256 fundingGoal,
        uint256 tokenSupply
    );

    event ProjectApprovedAndMinted(
        uint256 indexed projectId,
        address indexed treasury,
        uint256 tokensMinted,
        string  projectName
    );

    event ProjectRejected(uint256 indexed projectId);

    event TokensPurchased(
        uint256 indexed projectId,
        address indexed investor,
        uint256 bnbPaid,
        uint256 tokensMinted,
        uint256 ownershipBps   // basis points: 10000 = 100%
    );

    event FundsWithdrawn(uint256 indexed projectId, address to, uint256 amount);

    // ─── Constructor ─────────────────────────────────────────────────────────
    constructor()
        ERC1155("https://api.omniai.network/metadata/{id}.json")
        Ownable(msg.sender)
    {}

    // ═════════════════════════════════════════════════════════════════════════
    // ADMIN FUNCTIONS
    // ═════════════════════════════════════════════════════════════════════════

    /**
     * @notice Admin registers a new project (called after off-chain KYB review).
     * @param _projectName   Human-readable name.
     * @param _projectWallet Treasury wallet for raised funds.
     * @param _fundingGoal   Funding target in wei.
     * @param _tokenSupply   Number of F-NFT fractions to mint.
     * @param _metadataURI   IPFS/HTTP URI for ERC-1155 metadata.
     * @return projectId     The new project's on-chain ID.
     */
    function createProject(
        string  memory _projectName,
        address payable _projectWallet,
        uint256 _fundingGoal,
        uint256 _tokenSupply,
        string  memory _metadataURI
    ) external onlyOwner returns (uint256) {
        require(bytes(_projectName).length > 0,   "Name required");
        require(_projectWallet != address(0),      "Invalid wallet");
        require(_fundingGoal > 0,                  "Goal must be > 0");
        require(_tokenSupply > 0,                  "Supply must be > 0");

        uint256 projectId = nextProjectId++;

        projects[projectId] = Project({
            projectId:    projectId,
            projectName:  _projectName,
            projectWallet: _projectWallet,
            fundingGoal:  _fundingGoal,
            tokenSupply:  _tokenSupply,
            raisedAmount: 0,
            metadataURI:  _metadataURI,
            status:       ProjectStatus.UnderReview,
            createdAt:    block.timestamp
        });

        emit ProjectCreated(projectId, _projectName, _projectWallet, _fundingGoal, _tokenSupply);
        return projectId;
    }

    /**
     * @notice Admin approves a project AND mints ERC-1155 fractional NFTs in one tx.
     * @dev    Tokens are minted from address(0) to projectWallet (treasury).
     *         Token ID = projectId (ERC-1155 multi-token).
     * @param _projectId The project to approve.
     */
    function approveAndMint(uint256 _projectId) external onlyOwner {
        Project storage project = projects[_projectId];
        require(project.projectId != 0,                       "Project not found");
        require(project.status == ProjectStatus.UnderReview,  "Not under review");

        // 1. Change status → Approved
        project.status = ProjectStatus.Approved;
        emit ProjectApprovedAndMinted(
            _projectId, project.projectWallet, project.tokenSupply, project.projectName
        );

        // 2. Mint ERC-1155 tokens:  from 0x000...0  →  projectWallet
        //    Token ID = projectId, amount = tokenSupply
        _mint(project.projectWallet, _projectId, project.tokenSupply, "");

        // 3. Mark Active → open for investor purchases
        project.status = ProjectStatus.Active;
    }

    /**
     * @notice Admin rejects a project.
     */
    function rejectProject(uint256 _projectId) external onlyOwner {
        Project storage project = projects[_projectId];
        require(project.projectId != 0,                       "Project not found");
        require(project.status == ProjectStatus.UnderReview,  "Not under review");

        project.status = ProjectStatus.Rejected;
        emit ProjectRejected(_projectId);
    }

    /**
     * @notice Update metadata URI if needed (e.g. IPFS pinning update).
     */
    function setProjectMetadata(uint256 _projectId, string memory _uri) external onlyOwner {
        require(projects[_projectId].projectId != 0, "Project not found");
        projects[_projectId].metadataURI = _uri;
        _setURI(_uri);
    }

    // ═════════════════════════════════════════════════════════════════════════
    // INVESTOR FUNCTIONS
    // ═════════════════════════════════════════════════════════════════════════

    /**
     * @notice Investors send BNB to purchase fractional F-NFT tokens.
     * @dev    Tokens minted on-demand from address(0) upon payment.
     *         Raised BNB forwarded directly to project treasury.
     * @param _projectId  The project to invest in.
     */
    function invest(uint256 _projectId) external payable nonReentrant {
        Project storage project = projects[_projectId];
        require(project.status == ProjectStatus.Active, "Project not active");
        require(msg.value > 0,                          "Send BNB to invest");

        // Tokens = (BNB_sent * tokenSupply) / fundingGoal
        uint256 tokensToMint = (msg.value * project.tokenSupply) / project.fundingGoal;
        require(tokensToMint > 0, "Investment too small - send more BNB");

        // Track raised & investor cache
        project.raisedAmount += msg.value;
        investorBalance[_projectId][msg.sender] += tokensToMint;

        // Mint directly to investor
        _mint(msg.sender, _projectId, tokensToMint, "");

        // Ownership in basis points (10000 = 100%)
        uint256 ownershipBps = (tokensToMint * 10000) / project.tokenSupply;

        emit TokensPurchased(_projectId, msg.sender, msg.value, tokensToMint, ownershipBps);

        // Forward BNB to project treasury
        (bool success, ) = project.projectWallet.call{value: msg.value}("");
        require(success, "BNB transfer to treasury failed");
    }

    // ═════════════════════════════════════════════════════════════════════════
    // VIEW FUNCTIONS
    // ═════════════════════════════════════════════════════════════════════════

    /**
     * @notice Fetch all project info in one call.
     */
    function getProject(uint256 _projectId)
        external view
        returns (
            uint256 projectId,
            string memory projectName,
            address projectWallet,
            uint256 fundingGoal,
            uint256 tokenSupply,
            uint256 raisedAmount,
            uint8   status,
            uint256 createdAt
        )
    {
        Project storage p = projects[_projectId];
        return (
            p.projectId,
            p.projectName,
            p.projectWallet,
            p.fundingGoal,
            p.tokenSupply,
            p.raisedAmount,
            uint8(p.status),
            p.createdAt
        );
    }

    /**
     * @notice Returns investor ownership percentage in basis points.
     *         10000 = 100%, 100 = 1%, 1 = 0.01%
     */
    function getOwnershipBps(uint256 _projectId, address _investor)
        external view returns (uint256)
    {
        uint256 supply = projects[_projectId].tokenSupply;
        if (supply == 0) return 0;
        return (balanceOf(_investor, _projectId) * 10000) / supply;
    }

    /**
     * @notice Returns token price in wei per F-NFT.
     */
    function getTokenPrice(uint256 _projectId) external view returns (uint256) {
        Project storage p = projects[_projectId];
        if (p.tokenSupply == 0) return 0;
        return p.fundingGoal / p.tokenSupply;
    }

    // Override URI to support per-project metadata
    function uri(uint256 _id) public view override returns (string memory) {
        if (bytes(projects[_id].metadataURI).length > 0) {
            return projects[_id].metadataURI;
        }
        return super.uri(_id);
    }
}
