import { ethers } from "hardhat";
import { TheaterManager__factory } from "../typechain-types/factories/TheaterContract.sol";

const deploy = async () => {
  const [deployer] = await ethers.getSigners(); // Prende solo l'account [0]

  console.log(`Deploying contract with account: ${await deployer.getAddress()}`);

  const theaterContract = await new TheaterManager__factory(deployer).deploy();
  await theaterContract.waitForDeployment();

  console.log(`Theater Contract deployed at: ${await theaterContract.getAddress()}`);
};

deploy().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
