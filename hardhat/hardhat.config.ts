import { config as dotEnvConfig } from "dotenv";
dotEnvConfig();

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import "@nomicfoundation/hardhat-verify";

const PRIVATE_KEY = process.env.PRIVATE_KEY;

const config: HardhatUserConfig = {
  solidity: "0.8.21",
  networks: {
    tutorialsworld: {
      chainId: 1699000173917438,
      url: "https://tutorialsworld-1699000173917438-1.jsonrpc.testnet-sp1.sagarpc.io",
      accounts: [PRIVATE_KEY as string],
      gasPrice: 1000000000,
    },
  },
  sourcify: {
    enabled: true,
  },
};

export default config;
