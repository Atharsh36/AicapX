import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying AIProjectFactory as admin:", deployer.address);

  // 1. Deploy the AIProjectFactory contract
  const AIProjectFactory = await hre.ethers.getContractFactory("AIProjectFactory");
  const factory = await AIProjectFactory.deploy();

  await factory.waitForDeployment();
  const address = await factory.getAddress();
  
  console.log(`\n✅ AIProjectFactory successfully deployed to: ${address}`);
  console.log(`   Transactions must appear on BNB explorer as ERC-721/1155 mints.`);

  // Note: For the first run, we'll initialize one project on-chain to match the backend seed
  console.log("\nInitialising AutoAgent Systems on-chain...");
  
  const createTx = await factory.createProject(
    "AutoAgent Systems",
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Hardhat Account #1 as Startup
    hre.ethers.parseEther("200000"),
    10000,
    "ipfs://autoagent-metadata"
  );
  await createTx.wait();

  // Approve it to make it Active
  const approveTx = await factory.approveProject(1, "0x70997970C51812dc3A010C7d01b50e0d17dc79C8");
  await approveTx.wait();

  console.log(`✅ AutoAgent Systems is now ACTIVE and Fractional NFTs have been minted.`);
  console.log(`   From: 0x0000000000000000000000000000000000000000`);
  console.log(`   To: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
