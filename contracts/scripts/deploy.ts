import { ethers } from "hardhat";

async function main() {
  console.log("Deploying VendorElect...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  const VendorElect = await ethers.getContractFactory("VendorElect");
  const vendorElect = await VendorElect.deploy();

  await vendorElect.waitForDeployment();

  const address = await vendorElect.getAddress();
  console.log("VendorElect deployed to:", address);

  console.log("\n--- Deployment Info ---");
  console.log("Contract Address:", address);
  console.log("Deployer:", deployer.address);
  console.log("Network: Sepolia");
  console.log("\nNext step: Verify on Etherscan");
  console.log(`npx hardhat verify --network sepolia ${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

