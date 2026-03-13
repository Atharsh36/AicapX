// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract OmniAIMarket is ERC1155, Ownable, ReentrancyGuard {
    uint256 public nextProjectId = 1;

    enum ProjectState { Funding, Funded, Failed }

    struct Project {
        string name;
        address payable startupWallet;
        uint256 fundingGoal;    // Target in Wei (BNB equivalent for now)
        uint256 raisedAmount;
        uint256 tokenSupply;    // Total Fractional NFTs mapping to this project
        ProjectState state;
    }

    mapping(uint256 => Project) public projects;

    event ProjectCreated(uint256 indexed projectId, string name, uint256 fundingGoal, uint256 tokenSupply);
    event Invested(uint256 indexed projectId, address indexed investor, uint256 amountInvested, uint256 tokensMinted);
    event ProjectFunded(uint256 indexed projectId, uint256 totalRaised);

    constructor() ERC1155("https://api.omniai.network/metadata/{id}.json") Ownable(msg.sender) {}

    /**
     * @dev Create a new AI project to raise funds. This automatically initializes the Fractional NFT.
     * @param _name Name of the project (e.g. "AutoAgent Systems")
     * @param _fundingGoal Target funding amount in Wei
     * @param _tokenSupply Total supply of the Fractional NFT representing 100% of investor share
     * @param _startupWallet Address to receive the funds upon successful funding
     */
    function createProject(
        string memory _name,
        uint256 _fundingGoal,
        uint256 _tokenSupply,
        address payable _startupWallet
    ) external onlyOwner returns (uint256) {
        uint256 projectId = nextProjectId++;

        projects[projectId] = Project({
            name: _name,
            startupWallet: _startupWallet,
            fundingGoal: _fundingGoal,
            raisedAmount: 0,
            tokenSupply: _tokenSupply,
            state: ProjectState.Funding
        });

        emit ProjectCreated(projectId, _name, _fundingGoal, _tokenSupply);
        return projectId;
    }

    /**
     * @dev Investors deposit BNB. They receive proportional F-NFTs instantly.
     * @param _projectId ID of the project to invest in.
     */
    function invest(uint256 _projectId) external payable nonReentrant {
        Project storage project = projects[_projectId];
        require(project.state == ProjectState.Funding, "Project not in funding state");
        require(msg.value > 0, "Must invest greater than 0");

        uint256 amountToInvest = msg.value;
        
        // Prevent over-funding
        if (project.raisedAmount + amountToInvest > project.fundingGoal) {
            amountToInvest = project.fundingGoal - project.raisedAmount;
        }

        project.raisedAmount += amountToInvest;

        // Calculate tokens to mint: (Investment / Goal) * TotalSupply
        uint256 tokensToMint = (amountToInvest * project.tokenSupply) / project.fundingGoal;

        // Mint Fractional NFTs directly to the investor
        _mint(msg.sender, _projectId, tokensToMint, "");

        // Refund excess if user sent too much
        if (msg.value > amountToInvest) {
            uint256 refund = msg.value - amountToInvest;
            (bool success, ) = msg.sender.call{value: refund}("");
            require(success, "Refund failed");
        }

        emit Invested(_projectId, msg.sender, amountToInvest, tokensToMint);

        // Check if goal reached
        if (project.raisedAmount == project.fundingGoal) {
            project.state = ProjectState.Funded;
            
            // Release funds directly to startup wallet for this MVP
            // (In production, this could go to a milestone escrow contract)
            (bool success, ) = project.startupWallet.call{value: project.raisedAmount}("");
            require(success, "Fund transfer failed");

            emit ProjectFunded(_projectId, project.raisedAmount);
        }
    }
}
