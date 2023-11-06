import hre from "hardhat";
import "@nomicfoundation/hardhat-viem";

import { defineChain } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import Contract from "../artifacts/contracts/AddressBook.sol/AddressBook.json";

export const tutorialsworld = defineChain({
  id: 1699000173917438,
  name: "tutorialsworld",
  network: "Tutorials World",
  nativeCurrency: {
    decimals: 18,
    name: "tworld",
    symbol: "tworld",
  },
  rpcUrls: {
    public: {
      http: [
        "https://tutorialsworld-1699000173917438-1.jsonrpc.testnet-sp1.sagarpc.io",
      ],
    },
    default: {
      http: [
        "https://tutorialsworld-1699000173917438-1.jsonrpc.testnet-sp1.sagarpc.io",
      ],
    },
  },
});

async function main() {
  const account = privateKeyToAccount(`0x${process.env.PRIVATE_KEY}`);

  const contract = await hre.viem.getWalletClient(
    `0x${process.env.PRIVATE_KEY}`,
    {
      chain: tutorialsworld,
    }
  );

  const hash = await contract.deployContract({
    abi: Contract.abi,
    account: account,
    bytecode: Contract.bytecode as `0x${string}`,
  });

  console.log(`Contract deployed`);
  console.log(
    `To see the transaction in your explorer check:\n     https://${contract.chain.name}-${contract.chain.id}-1.testnet-sp1.sagaexplorer.io/tx/${hash}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
