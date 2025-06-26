const hre = require("hardhat");

async function main() {
  const CertStorage = await hre.ethers.getContractFactory("CertStorage");
  const contract = await CertStorage.deploy(); // deploy() returns the instance directly
  await contract.waitForDeployment(); // use this instead of deployed()

  console.log("Contract deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
