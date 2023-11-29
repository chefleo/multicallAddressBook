import { WagmiConfig, configureChains, createConfig } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { baseGoerli } from "wagmi/chains";
import { MockConnector } from "wagmi/connectors/mock";
import { privateKeyToAccount } from "viem/accounts";
import { Hex, createWalletClient, http } from "viem";

// Test Account
const account = privateKeyToAccount(`${process.env.VITE_PRIVATE_KEY}` as Hex); // first anvil pk

const client = createWalletClient({
  account: account.address,
  chain: baseGoerli,
  transport: http(),
});

const { chains, publicClient } = configureChains(
  [baseGoerli],
  [publicProvider()]
);

const mockConnector = new MockConnector({
  chains,
  options: {
    chainId: baseGoerli.id,
    flags: { isAuthorized: true },
    walletClient: client,
  },
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: [mockConnector],
  publicClient,
});

export const WagmiWrapperMockConnector = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <WagmiConfig config={wagmiConfig}>{children}</WagmiConfig>;
};
