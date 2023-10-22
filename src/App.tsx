// import { useState } from "react";
import "./App.css";
import { useCallback, useEffect, useState } from "react";

import { Toaster, toast } from "sonner";
import Saga from "/saga.svg";

import { createWalletClient, http, publicActions } from "viem";
// import { parseUnits, parseGwei, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import {
  useAccount,
  // useBalance,
  useNetwork,
  useSwitchNetwork,
  useContractRead,
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { encodeFunctionData } from "viem";

import {
  address as AddressBookContract,
  abi as AbiAddressBook,
} from "../contract/addressBook.json";

import {
  address as AddressFaucet,
  abi as AbiFaucet,
} from "../contract/faucetSaga.json";

import { Form } from "../components/Form";
import AddressesBook from "../components/AddressesBook";

const Faucet = () => {
  // const { data } = useBalance({
  //   address: AddressFaucet as `0x${string}`,
  // });
  const { chains } = useSwitchNetwork();

  const account = privateKeyToAccount(import.meta.env.VITE_PRIVATE_KEY);

  const client = createWalletClient({
    account,
    chain: chains[0],
    transport: http(),
  }).extend(publicActions);

  const faucet = async () => {
    // Equivalent of usePrepareContractWrite
    const { request } = await client.simulateContract({
      address: AddressFaucet as `0x${string}`,
      abi: AbiFaucet,
      functionName: "requestTokens",
      args: ["0x03305A2C9d2030841576F7480D7E2eE45599f7D1"],
    });

    // Equivalent of useContractWrite
    const hash = await client.writeContract(request);
    console.log("Transaction successfull:", hash);
  };

  return (
    <div className="w-full flex justify-center items-center">
      <button
        onClick={() => faucet?.()}
        className="mt-10 h-20 w-48 rounded-xl bg-blue-500 cursor-pointer text-xl text-white font-semibold hover:scale-110  transition ease-in"
      >
        Faucet
      </button>
    </div>
  );
};

function App() {
  const initialState = [{ address: "", name: "" }];
  const [inputFields, setInputFields] = useState(initialState);
  const [preparationMulticall, setPreparationMulticall] = useState([""]);

  const [activateConfigMulticall, setActivateConfigMulticall] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [loading, setLoading] = useState(false);

  // Wagmi State Variables Hooks
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { chains, switchNetwork } = useSwitchNetwork();

  useEffect(() => {
    if (chain?.id !== chains[0].id) {
      switchNetwork?.(chains[0].id);
    }

    return () => {
      // Cleanup function to prevent memory leaks
      // Unsubscribe or clean up any resources here
    };
  }, [chain, switchNetwork]);

  const handleInputChange = useCallback(
    (index: number, event: any) => {
      const values = [...inputFields];
      const key: string = event.target.name;
      const value: string = event.target.value;

      if (key === "address" || key === "name") {
        // console.log("values[index][event.target.name]", values[index][key]);
        values[index][key] = value;
      } else {
        console.error("key is not correct", key);
      }

      setInputFields(values);
    },
    [inputFields, setInputFields]
  );

  const handleAddFields = () => {
    setInputFields([...inputFields, { address: "", name: "" }]);
  };

  const handleRemoveFields = () => {
    const values = [...inputFields];
    // console.log("Array length", values.length);
    if (values.length > 1) {
      values.splice(-1);
      setInputFields(values);
    }
  };

  // Wagmi Read Contract
  const { data: addresses, refetch: refetchGetContacts } = useContractRead({
    address: AddressBookContract as `0x${string}`,
    abi: AbiAddressBook,
    functionName: "getContacts",
    enabled: isConnected,
    account: address,
    onSuccess(data) {
      console.log("Success getContacts", data);
    },
    onError(err) {
      console.log(err);
    },
  });

  // Wagmi Prepare Write Contract
  const { config } = usePrepareContractWrite({
    address: AddressBookContract as `0x${string}`,
    abi: AbiAddressBook,
    functionName: "addContact",
    args: [inputFields[0].address, inputFields[0].name],
    enabled: inputFields[0].address !== "" && inputFields[0].name !== "",
    cacheTime: 2_000,
    onSuccess(data) {
      console.log("Preparation Success addContact", data);
    },
    onError(error) {
      console.log("Error", error.message);
    },
  });

  // Wagmi Write Contract
  const { data, write: addContact } = useContractWrite({
    ...config,
    onSuccess(data) {
      console.log("Success write addContact", data);
    },
    onError() {
      setLoading(false);
      toast.error("Something went wrong.");
    },
  });

  // Wagmi wait for the transaction to be processed
  useWaitForTransaction({
    confirmations: 1,
    hash: data?.hash,
    onSuccess() {
      console.log("Confimation addContact");
      refetchGetContacts();
      setInputFields(initialState);
      setLoading(false);
    },
  });

  // Wagmi prepare write MULTICALL
  const { config: configMulticall } = usePrepareContractWrite({
    address: AddressBookContract as `0x${string}`,
    abi: AbiAddressBook,
    functionName: "multicall",
    args: [preparationMulticall],
    enabled: activateConfigMulticall,
    cacheTime: 2_000,
    onSuccess(data) {
      console.log("Preparation Success multicall", data);
      setIsReady(true);
    },
    onError(error) {
      console.log("Error", error.message);
      setIsReady(false);
      setActivateConfigMulticall(false);
    },
  });

  // When the state variable isReady become true (inside onSuccess of usePrepareContractWrite of MULTICALL)
  // the write fn multicall is called
  useEffect(() => {
    if (isReady) {
      multicall?.();
    }
  }, [isReady]);

  // Wagmi write MULTICALL
  const { data: dataMulticall, write: multicall } = useContractWrite({
    ...configMulticall,
    onSuccess(data) {
      console.log("Success write multicall", data);
    },
    onError(err) {
      console.error("Error write multicall", err);
      toast.error("Something went wrong.");
    },
    onSettled() {
      setIsReady(false);
      setActivateConfigMulticall(false);
      setLoading(false);
    },
  });

  useWaitForTransaction({
    confirmations: 1,
    hash: dataMulticall?.hash,
    onSuccess() {
      console.log("Confimation multicall");
      refetchGetContacts();
      setInputFields(initialState);
      setPreparationMulticall([""]);
    },
  });

  const submit = () => {
    setLoading(true);
    const values = [...inputFields];

    const isAnyFieldEmpty = inputFields.some(
      (field) => !field.address || !field.name
    );
    if (isAnyFieldEmpty) {
      setLoading(false);
      return toast.error("Please fill out all address and name fields.");
    }

    if (values.length <= 1) {
      addContact?.();
    } else {
      const arrMulticall = values.map((obj) => Object.values(obj));

      const argsBytes = arrMulticall.map((arr) => {
        const address = arr[0];
        const name = arr[1];
        return encodeFunctionData({
          abi: AbiAddressBook,
          functionName: "addContact",
          args: [address, name],
        });
      });
      setActivateConfigMulticall(true);
      setPreparationMulticall(argsBytes);

      // After that check above the "Wagmi write MULTICALL"
    }
  };

  return (
    <>
      <div className="bg-gray-100 min-h-screen">
        <Toaster position="top-center" richColors />
        <div className="flex justify-between items-center h-20 bg-slate-800 px-20">
          <img className="h-10 w-10" src={Saga} alt="Saga" />
          <w3m-button balance="hide" />
        </div>
        <div className="mt-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex flex-col justify-center items-center">
            {inputFields.map((inputField, index) => (
              <Form
                key={index}
                index={index}
                isLast={index === [...inputFields].length - 1}
                inputField={inputField}
                handleAddFields={handleAddFields}
                handleInputChange={handleInputChange}
                handleRemoveFields={handleRemoveFields}
              />
            ))}
          </div>
          {inputFields[0].address && inputFields[0].name ? (
            <div className="flex justify-center items-center mt-8">
              {loading ? (
                <>
                  <div className="flex justify-center items-center bg-slate-800 text-white font-semibold w-1/2 px-3 py-4 rounded-xl">
                    <div className="h-5 w-5 inline-block relative pt-0.5">
                      <div className="spinner border-t-white"></div>
                      <div className="spinner delay_45 border-t-white"></div>
                      <div className="spinner delay_30 border-t-white"></div>
                      <div className="spinner delay_15 border-t-white "></div>
                    </div>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => submit()}
                  className="bg-slate-800 text-white font-semibold w-1/2 px-3 py-4 rounded-xl hover:bg-slate-600"
                >
                  Add Contact{inputFields.length > 1 ? "s" : ""}
                </button>
              )}
            </div>
          ) : null}
          {Array.isArray(addresses) ? (
            <AddressesBook
              addresses={addresses}
              refetchGetContacts={refetchGetContacts}
            />
          ) : null}
          <Faucet />
        </div>
      </div>
    </>
  );
}

export default App;
