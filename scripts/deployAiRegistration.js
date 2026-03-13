import hre from "hardhat";
const { ethers } = hre;

/**
 * Deploy AiRegistration (Fractional NFT) to BSC Testnet
 * Run: npx hardhat run scripts/deployAiRegistration.js --network bscTestnet
 */
async function main() {
  const signers = await ethers.getSigners();
  if (signers.length === 0) {
    console.error("\n❌ ERROR: No deployer account found.");
    console.error("Please check that PRIVATE_KEY in your .env file is a valid 64-character hex string.\n");
    process.exit(1);
  }
  const [deployer] = signers;
  console.log("Deploying SolarRegistration with account:", deployer.address);
  console.log("Balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "BNB\n");

  const AiRegistration = await ethers.getContractFactory("AiRegistration");
  const aiRegistration = await AiRegistration.deploy();
  await aiRegistration.waitForDeployment();

  const addr = await aiRegistration.getAddress();
  console.log("✅ AiRegistration deployed to:", addr);
  
  const fs = await import('fs');
  fs.writeFileSync('address_log.txt', addr);
  console.log("🔍 Explorer:", `https://testnet.bscscan.com/address/${addr}`);
  console.log("\n⚠️  Now update CONTRACT_ADDRESS in frontend/src/pages/admin.jsx to:", addr);
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
