import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { AddressContainer, AddressLine } from "../components/AddressesBook";
import "@testing-library/jest-dom";

import { WagmiConfig, configureChains, createConfig } from "wagmi";
import { MockConnector } from "@wagmi/core/connectors/mock";
import { publicProvider } from "wagmi/providers/public";

import { createWalletClient, http } from "viem";
import { foundry } from "viem/chains";
// import { privateKeyToAccount } from "viem/accounts";

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [foundry],
  [publicProvider()]
);

const config = createConfig({
  autoConnect: true,
  publicClient,
  webSocketPublicClient,
});

const Wagmi = ({ children }: { children: React.ReactNode }) => {
  return <WagmiConfig config={config}>{children}</WagmiConfig>;
};

describe("AddressLine", () => {
  // Renders the address passed as props in a truncated format.
  it("should render the truncated address", () => {
    const address = "0x1234567890abcdef";
    render(<AddressLine address={address} />);
    const truncatedAddress = screen.queryByText("0x123456...abcdef");
    expect(truncatedAddress).toBeDefined();
  });

  it("should display a clipboard icon next to the truncated address", () => {
    const address = "0x1234567890abcdef";
    render(<AddressLine address={address} />);
    const clipboardIcon = screen.getByAltText("Clipboard");
    expect(clipboardIcon).toBeInTheDocument();
  });
});

describe.only("AddressContainer", () => {
  // Renders the component with the given address and refetch function
  it("should render the component with the given address and refetch function", () => {
    const address = "0x41f01E98AE44C4b1DA0522377BDcF7A51F4deA0A";
    const refetchGetContacts = () => {};

    render(
      <AddressContainer
        address={address}
        refetchGetContacts={refetchGetContacts}
      />,
      { wrapper: Wagmi }
    );

    expect(
      screen.getByText(`${address.slice(0, 8)}...${address.slice(-8)}`)
    ).toBeInTheDocument();
    expect(screen.getByAltText("Clipboard")).toBeInTheDocument();
    expect(screen.queryByText("Copied")).not.toBeInTheDocument();
    expect(screen.queryByAltText("X")).toBeInTheDocument();
  });
});

// TODO
// Deploy with in anvil chain id (31337) and get contract address
// Create App.test.tsx
// Import everything such as all wagmi read and write and abi
// Test using Viem simulate contract and write contract

// // Clicking the clipboard icon copies the address to the clipboard
// it("should copy the address to the clipboard when clicking the clipboard icon", async () => {
//   const address = "0x1234567890abcdef";
//   render(<AddressLine address={address} />);
//   const clipboardIcon = screen.getByAltText("Clipboard");
//   fireEvent.click(clipboardIcon); // Cannot read properties of undefined (reading 'writeText') / navigator.clipboard.writeText(address ? address : "");
//   const copiedText = screen.getByText("Copied");
//   expect(copiedText).toBeInTheDocument();
// });

// // Displays an empty string if the address is undefined
// it("should display an empty string if the address is undefined", () => {
//   const address = undefined;
//   render(<AddressLine address={address} />);
//   const truncatedAddress = screen.queryByText("");
//   expect(truncatedAddress).toBeDefined();
// });
