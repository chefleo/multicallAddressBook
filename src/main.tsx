import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import { createWeb3Modal } from "@web3modal/wagmi/react";
import { walletConnectProvider } from "@web3modal/wagmi";

import { WagmiConfig, configureChains, createConfig } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
// import { baseGoerli } from "wagmi/chains";
import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet";
import { InjectedConnector } from "wagmi/connectors/injected";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { Chain } from "wagmi";
import Faucet from "../components/Faucet.tsx";

export const tutorialsworld = {
  id: 1697743716680744,
  name: "tutorialsworld",
  network: "Tutorials World",
  nativeCurrency: {
    decimals: 18,
    name: "tutorials",
    symbol: "tutorials",
  },
  rpcUrls: {
    public: {
      http: [
        "https://tutorialsworld-1697743716680744-1.jsonrpc.sp1.sagarpc.io",
      ],
    },
    default: {
      http: [
        "https://tutorialsworld-1697743716680744-1.jsonrpc.sp1.sagarpc.io",
      ],
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

const metadata = {
  name: "Web3Modal",
  description: "Web3Modal Example",
  url: "https://web3modal.com",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: [
    new WalletConnectConnector({
      chains,
      options: { projectId, showQrModal: false, metadata },
    }),
    new InjectedConnector({ chains, options: { shimDisconnect: true } }),
    new CoinbaseWalletConnector({
      chains,
      options: { appName: metadata.name },
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
