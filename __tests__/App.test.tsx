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
import { Form } from "../components/Form";

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

  it("should render two input fields for address and name", () => {
    render(
      <Form
        index={0}
        isLast={false}
        inputField={{ address: "", name: "" }}
        handleAddFields={() => {}}
        handleInputChange={() => {}}
        handleRemoveFields={() => {}}
      />,
      { wrapper: WagmiWrapperMockConnector }
    );
    expect(screen.getAllByRole("textbox")).toHaveLength(2);
  });

  it("should have correct labels for input fields", () => {
    render(
      <Form
        index={0}
        isLast={false}
        inputField={{ address: "", name: "" }}
        handleAddFields={() => {}}
        handleInputChange={() => {}}
        handleRemoveFields={() => {}}
      />,
      { wrapper: WagmiWrapperMockConnector }
    );
    expect(screen.getByText("Address")).toBeInTheDocument();
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Add an ETH address")
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Add an name / alias name")
    ).toBeInTheDocument();
  });

  it("should have correct change input ", () => {
    render(<App />, { wrapper: WagmiWrapperMockConnector });

    expect(
      screen.getByPlaceholderText("Add an ETH address")
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Add an name / alias name")
    ).toBeInTheDocument();

    const addressInput = screen.getByPlaceholderText("Add an ETH address");
    const nameInput = screen.getByPlaceholderText("Add an name / alias name");

    fireEvent.change(addressInput, {
      target: { value: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" },
    });
    fireEvent.change(nameInput, { target: { value: "Test input 2" } });

    // console.log("addressInput", addressInput.value);
    // console.log("nameInput", nameInput.value);

    // @ts-ignore
    expect(addressInput.value).toBe(
      "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
    );
    // @ts-ignore
    expect(nameInput.value).toBe("Test input 2");
  });

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

    // console.log("res.data", res.data);

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

  it("useAccount give me my address", async () => {
    const { result: address } = renderHook(() => useAccount(), {
      wrapper: WagmiWrapperMockConnector,
    });

    await waitFor(() => expect(address.current.isConnected).toBeTruthy());

    // console.log("address", address.current.address);
    expect(address.current.address).toBe(
      "0x8D37cb3624e1CB8480DceCC7884330a0449Dd9f0"
    );
  });

  it("addContact config usePrepareContractWrite should work", async () => {
    const { result: config } = renderHook(
      () =>
        usePrepareContractWrite({
          address: AddressBookContract as `0x${string}`,
          abi: AbiAddressBook,
          functionName: "addContact",
          chainId: baseGoerli.id,
          args: ["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", "Unit test"],
          account: "0x8D37cb3624e1CB8480DceCC7884330a0449Dd9f0",
          onError(err: any) {
            console.log(err);
          },
        }),
      { wrapper: WagmiWrapperMockConnector }
    );

    await waitFor(() => expect(config.current.isSuccess).toBeTruthy());
    const configObj = config.current.config.request;

    console.log("result.current.config.request", configObj);

    expect(configObj.abi).not.empty;

    expect(configObj.functionName).toBe("addContact");
  });

  it.only("addContact write call should work", async () => {
    const { result: address } = renderHook(() => useAccount(), {
      wrapper: WagmiWrapperMockConnector,
    });

    await waitFor(() => expect(address.current.isConnected).toBeTruthy());

    const { result: config } = renderHook(
      () =>
        usePrepareContractWrite({
          address: AddressBookContract as `0x${string}`,
          abi: AbiAddressBook,
          functionName: "addContact",
          chainId: baseGoerli.id,
          args: ["0x04B133Ef7561d795A52110670E54d673eD7EB17F", "Unit test"],
          // account: "0x8D37cb3624e1CB8480DceCC7884330a0449Dd9f0",
          onSuccess(data: any) {
            console.log("usePrepareContractWrite Success", data);
          },
          onError(err: any) {
            console.log("Error usePrepareContractWrite", err);
          },
        }),
      { wrapper: WagmiWrapperMockConnector }
    );

    await waitFor(() => expect(config.current.isSuccess).toBeTruthy());
    const configObj = config.current.config.request;

    console.log("config", config.current.config);

    expect(configObj.abi).not.empty;

    expect(configObj.functionName).toBe("addContact");

    const { result } = renderHook(
      () =>
        useContractWrite({
          ...config.current.config,
          // account: "0x8D37cb3624e1CB8480DceCC7884330a0449Dd9f0",
          onSuccess(data: any) {
            console.log("useContractWrite Success", data);
          },
          onError(err: any) {
            console.log("Error useContractWrite", err);
          },
        }),
      { wrapper: WagmiWrapperMockConnector }
    );

    // console.log(result);

    await waitFor(() => expect(result.current.write).toBeDefined());

    console.log("Before write contract result.current", result.current);

    console.log("Write contact");
    await act(async () => {
      result.current.write?.();
    });

    console.log("After write contract", result.current);

    await waitFor(() => expect(result.current.isSuccess).toBeTruthy());
    expect(result.current.data?.hash).toBeDefined();

    // console.log(result.current);
  });

  it("removeContact config usePrepareContractWrite should work on existing contact", async () => {
    const { result: address } = renderHook(() => useAccount(), {
      wrapper: WagmiWrapperMockConnector,
    });

    await waitFor(() => expect(address.current.isConnected).toBeTruthy());

    const { result } = renderHook(
      () =>
        usePrepareContractWrite({
          address: AddressBookContract as `0x${string}`,
          abi: AbiAddressBook,
          functionName: "removeContact",
          chainId: baseGoerli.id,
          args: ["0xed52E156aa52453f944505AA51117e2Eb82b0b09"],
          // account: "0x8D37cb3624e1CB8480DceCC7884330a0449Dd9f0",
          onError(err: any) {
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
