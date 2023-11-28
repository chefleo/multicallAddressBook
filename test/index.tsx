import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import type { MockProviderOptions } from "@wagmi/core/connectors/mock";
import React, { ReactElement } from "react";
import { http, createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { WagmiConfig, configureChains, createConfig } from "wagmi";
import type { Chain } from "wagmi";
import { baseGoerli } from "wagmi/chains";
import { MockConnector } from "wagmi/connectors/mock";
import { publicProvider } from "wagmi/providers/public";

import { Hex } from "viem";

const defaultChains = [baseGoerli];

export function renderWithProviders(
  component: ReactElement,
  options?: {
    chains?: Chain[];
    mock?: boolean;
    mockOptions?: MockProviderOptions;
  }
) {
  const supportedChains: Chain[] = options?.chains || defaultChains;
  const firstChain = supportedChains[0];

  const account = privateKeyToAccount(
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" as Hex
  ); // first anvil pk

  const client = createWalletClient({
    account: account.address,
    chain: firstChain,
    transport: http(),
  });

  const { chains, publicClient } = configureChains(supportedChains, [
    publicProvider(),
  ]);

  const mockConnector = new MockConnector({
    chains,
    options: {
      chainId: firstChain.id,
      flags: { isAuthorized: true },
      walletClient: client,
      ...options?.mockOptions,
    },
  });

  const wagmiConfig = createConfig({
    autoConnect: true,
    connectors: [mockConnector],
    publicClient,
  });

  const Wagmi = ({ children }: { children: React.ReactNode }) => {
    return <WagmiConfig config={wagmiConfig}>{children}</WagmiConfig>;
  };

  return render(component, {
    wrapper: Wagmi,
  });
}
