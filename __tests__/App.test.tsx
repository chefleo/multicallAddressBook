import React from "react";

// Testing library
import {
  fireEvent,
  render,
  screen,
  renderHook,
  waitFor,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom";

// App component
import App from "../src/App";

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

import { WagmiWrapper } from "../test/wrapper";
import { WagmiWrapperMockConnector } from "../test/wrapperTest";
import { baseGoerli } from "wagmi/chains";

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

  it("(useContractRead) getContacts should be NOT empty with address 0x8D37cb3624e1CB8480DceCC7884330a0449Dd9f0", async () => {
    // const render = renderWithProviders(<App />);

    const { getByText } = render(<App />, {
      wrapper: WagmiWrapperMockConnector,
    });

    // console.log("test", test);

    const { result } = renderHook(
      () =>
        useContractRead({
          address: AddressBookContract as `0x${string}`,
          abi: AbiAddressBook,
          functionName: "getContacts",
          account: "0x8D37cb3624e1CB8480DceCC7884330a0449Dd9f0",
          chainId: baseGoerli.id,
          onError(data) {
            console.log("Error Test", data);
          },
        }),
      { wrapper: WagmiWrapperMockConnector }
    );

    await waitFor(() => expect(result.current.isSuccess).toBeTruthy());
    const { internal: _, ...res } = result.current;

    console.log("res.data", res.data);

    expect(res.data).not.empty;

    // Because res.data is type unknown i used (res.data as string[])
    (res.data as string[]).forEach((text) => {
      // Check if each text is defined
      expect(text).toBeDefined();
    });

    // Because res.data is type unknown i used (res.data as string[])
    (res.data as string[]).forEach((text) => {
      const element = getByText(`${text.slice(0, 8)}...${text.slice(-8)}`);
      // console.log("element", element);
      // Check if each text is defined
      expect(element).toBeInTheDocument();
    });
  });

  it("(useContractRead) getAlias should get an alias with args 0x8D37cb3624e1CB8480DceCC7884330a0449Dd9f0", async () => {
    // const render = renderWithProviders(<App />);

    const { result } = renderHook(
      () =>
        useContractRead({
          address: AddressBookContract as `0x${string}`,
          abi: AbiAddressBook,
          functionName: "getAlias",
          args: ["0xed52E156aa52453f944505AA51117e2Eb82b0b09"],
          account: "0x8D37cb3624e1CB8480DceCC7884330a0449Dd9f0",
          onError(err) {
            console.log(err);
          },
        }),
      { wrapper: WagmiWrapperMockConnector }
    );

    await waitFor(() => expect(result.current.isSuccess).toBeTruthy());
    const { internal: _, ...res } = result.current;

    // console.log(res.data);

    expect(res.data).toBe("Test");
  });

  it("Test usePrepareContractWrite", async () => {
    const { result } = renderHook(
      () =>
        usePrepareContractWrite({
          address: AddressBookContract as `0x${string}`,
          abi: AbiAddressBook,
          functionName: "removeContact",
          chainId: baseGoerli.id,
          args: ["0xed52E156aa52453f944505AA51117e2Eb82b0b09"],
          account: "0x8D37cb3624e1CB8480DceCC7884330a0449Dd9f0",
          onError(err) {
            console.log(err);
          },
        }),
      { wrapper: WagmiWrapperMockConnector }
    );

    await waitFor(() => expect(result.current.isSuccess).toBeTruthy());
    const request = result.current.config.request;

    // console.log("result.current.config.request", request);

    expect(request.abi).not.empty;

    expect(request.functionName).toBe("removeContact");
  });
});
