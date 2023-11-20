import React from "react";

// Testing library
import {
  fireEvent,
  render,
  screen,
  renderHook,
  waitFor,
} from "@testing-library/react";
import "@testing-library/jest-dom";

// App component
import App from "../src/App";

// Wagmi Config
import { WagmiConfig, configureChains, createConfig } from "wagmi";
import { MockConnector } from "@wagmi/core/connectors/mock";
import { publicProvider } from "wagmi/providers/public";

import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { foundry } from "viem/chains";
import { baseGoerli } from "wagmi/chains";

import {
  useAccount,
  useNetwork,
  useSwitchNetwork,
  useContractRead,
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { encodeFunctionData } from "viem";

import { renderWithProviders } from "../test";

import {
  address as AddressBookContract,
  abi as AbiAddressBook,
} from "../contract/addressBook.json";

describe("AddressContainer", () => {
  // Displays list of addresses from contract
  // it("should render input fields and submit button", () => {
  //   // Arrange
  //   const { getByText } = render(<App />, { wrapper: Wagmi });

  //   // Act
  //   const addressInput = getByText("Address");
  //   const nameInput = getByText("Name");
  //   const submitButton = getByText("Add Contact");

  //   // Assert
  //   expect(addressInput).toBeInTheDocument();
  //   expect(nameInput).toBeInTheDocument();
  //   expect(submitButton).toBeInTheDocument();
  // });

  it("Test wagmi hook", async () => {
    // Arrange
    const test = renderWithProviders(<App />);

    console.log("test", test);

    const { result } = renderHook(() =>
      useContractRead({
        address: AddressBookContract as `0x${string}`,
        abi: AbiAddressBook,
        functionName: "getContacts",
        account: "0x8D37cb3624e1CB8480DceCC7884330a0449Dd9f0",
        chainId: baseGoerli.id,
        onError(data) {
          console.log("Error Test", data);
        },
      })
    );

    console.log("config", result);

    // await waitFor(() => expect(result.current.isSuccess).toBeTruthy());
    const { internal: _, ...res } = result.current;
    console.log("res.data", res.data);
  });
});
