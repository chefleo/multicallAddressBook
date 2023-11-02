import { config as dotEnvConfig } from "dotenv";
dotEnvConfig();

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const API_KEY = process.env.API_KEY;

const config: HardhatUserConfig = {
  solidity: "0.8.21",
  networks: {
    "base-goerli": {
      url: "https://goerli.base.org",
      accounts: [PRIVATE_KEY as string],
      gasPrice: 1000000000,
    },
  },
  etherscan: {
    apiKey: {
      baseGoerli: API_KEY as string,
    },
  },
};

export default config;
