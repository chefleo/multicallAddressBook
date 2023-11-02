import { formatEther, parseEther } from "viem";
import hre from "hardhat";

async function main() {
  const addressBook = await hre.viem.deployContract("AddressBook");

  console.log(`AddressBook deployed to ${addressBook.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
