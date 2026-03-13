import hre from "hardhat";
const { ethers } = hre;

/**
 * Deploy SolarRegistration (Fractional NFT) to BSC Testnet
 * Run: npx hardhat run scripts/deploySolarRegistration.js --network bscTestnet
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

  const Factory = await ethers.getContractFactory("SolarRegistration");
  const contract = await Factory.deploy();
  await contract.waitForDeployment();

  const addr = await contract.getAddress();
  console.log("✅ SolarRegistration deployed to:", addr);
  console.log("🔍 Explorer:", `https://testnet.bscscan.com/address/${addr}`);
  console.log("\n⚠️  Now update CONTRACT_ADDRESS in frontend/src/pages/admin.jsx to:", addr);
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
