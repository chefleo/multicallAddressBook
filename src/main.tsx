import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Faucet from "../components/Faucet.tsx";
import App from "./App.tsx";
import "./index.css";
// import { baseGoerli } from "wagmi/chains";

import { createWeb3Modal } from "@web3modal/wagmi/react";
import { walletConnectProvider } from "@web3modal/wagmi";

import { WagmiConfig, configureChains, createConfig } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet";
import { InjectedConnector } from "wagmi/connectors/injected";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";

import { Chain } from "wagmi";

export const tutorialsworld = {
  id: 2705143118829000,
  name: "tutorialsworldtwo",
  network: "Tutorials World 2",
  nativeCurrency: {
    decimals: 18,
    name: "TWT",
    symbol: "TWT",
  },
  rpcUrls: {
    public: {
      http: [
        "https://tutorialworldtwo-2705143118829000-1.jsonrpc.testnet-sp1.sagarpc.io",
      ],
    },
    default: {
      http: [
        "https://tutorialworldtwo-2705143118829000-1.jsonrpc.testnet-sp1.sagarpc.io",
      ],
    },
  },
  blockExplorers: {
    default: {
      name: "Tutorials World Explorer",
      url: "https://tutorialworldtwo-2705143118829000-1.testnet-sp1.sagaexplorer.io/",
    },
  },
} as const satisfies Chain;

// 1. Get projectId
if (!import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID) {
  throw new Error("You need to provide WALLET_CONNECT_PROJECT_ID env variable");
}
const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID;

// 2. Create wagmiConfig
const { chains, publicClient } = configureChains(
  [tutorialsworld],
  [walletConnectProvider({ projectId }), publicProvider()]
);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: [
    new WalletConnectConnector({
      chains,
      options: {
        projectId,
        showQrModal: false,
        metadata: {
          name: "Multicall Saga",
        },
      },
    }),
    new InjectedConnector({ chains, options: { shimDisconnect: true } }),
    new CoinbaseWalletConnector({
      chains,
      options: { appName: "Multicall Saga" },
    }),
  ],
  publicClient,
});

// 3. Create modal
createWeb3Modal({
  wagmiConfig,
  projectId,
  chains,
  themeVariables: {
    "--w3m-color-mix": "#1f4287",
    "--w3m-accent": "#1f4287",
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WagmiConfig config={wagmiConfig}>
      <Router>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/faucet" element={<Faucet />} />
        </Routes>
      </Router>
    </WagmiConfig>
  </React.StrictMode>
);
