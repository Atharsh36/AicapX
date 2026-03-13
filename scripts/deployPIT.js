import { ethers } from "hardhat";

/**
 * Deploy script for ProjectInvestmentToken
 * Run: npx hardhat run scripts/deployPIT.js --network bscTestnet
 */
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying ProjectInvestmentToken with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "BNB");

  const PIT = await ethers.getContractFactory("ProjectInvestmentToken");
  console.log("Deploying...");
  const pit = await PIT.deploy();
  await pit.waitForDeployment();

  const address = await pit.getAddress();
  console.log("\n✅ ProjectInvestmentToken deployed to:", address);
  console.log("📌 Network: BSC Testnet");
  console.log("🔍 Explorer:", `https://testnet.bscscan.com/address/${address}`);
  console.log("\n⚠️  UPDATE frontend CONTRACT_ADDRESS to:", address);
  console.log("⚠️  UPDATE admin.jsx ContractAddress to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
