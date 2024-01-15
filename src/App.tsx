// import { useState } from "react";
import "./App.css";
import { useCallback, useEffect, useState } from "react";

import { Toaster, toast } from "sonner";

import {
  useAccount,
  useNetwork,
  useSwitchNetwork,
  useContractRead,
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";

import {
  address as AddressBookContract,
  abi as AbiAddressBook,
} from "../contract/addressBook.json";

import { Form } from "../components/Form";
import AddressesBook from "../components/AddressesBook";

import Header from "../components/Header";
import Loading from "../components/Loading";

import {
  encodeFunctionData,
  createWalletClient,
  custom,
  http,
  publicActions,
  parseEther,
} from "viem";

import { tutorialsworld } from "./main";

import { privateKeyToAccount } from "viem/accounts";

export enum LoadingMessages {
  SendingToken = "Borrowing TWT 1/3",
  requestTransaction = "Please sign to execute the transaction 2/3",
  executingTransaction = "Executing transaction, please wait 3/3",
}

function App() {
  const initialState = [{ address: "", name: "" }];
  const [inputFields, setInputFields] = useState(initialState);
  const [preparationMulticall, setPreparationMulticall] = useState([""]);

  const [activateConfigMulticall, setActivateConfigMulticall] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(
    LoadingMessages.SendingToken
  );

  // Wagmi State Variables Hooks
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();

  const accountDev = privateKeyToAccount(import.meta.env.VITE_PRIVATE_KEY);

  const client = createWalletClient({
    account: accountDev,
    chain: tutorialsworld,
    transport: http(),
  }).extend(publicActions);

  const sendGasToken = async (gas: number) => {
    try {
      console.log("... Borrow token for gas ...");
      const hash = await client.sendTransaction({
        account: accountDev,
        to: address,
        value: parseEther((gas * 0.0000001015 * 1.2).toString()),
      });

      const transaction = await client.waitForTransactionReceipt({
        confirmations: 1,
        hash: hash,
      });

      console.log("Token sent --- Block confimation: ", transaction);
    } catch (error) {
      toast.error(`Something wrong`);
      console.log(error);
    }
  };

  useEffect(() => {
    const switchToOwnChain = async (client: any) => {
      await client.addChain({ chain: tutorialsworld });
      await client.switchChain({ id: 2705143118829000 });
    };

    if (chain?.id !== 2705143118829000 && isConnected) {
      const client = createWalletClient({
        account: address,
        // @ts-ignore
        transport: custom(window.ethereum),
      });
      switchToOwnChain(client);
    }

    return () => {
      // Cleanup function to prevent memory leaks
      // Unsubscribe or clean up any resources here
    };
  }, [isConnected, chain]);

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
    gas: 100_000n,
    // gasPrice: 100_000_000_000_0n, // Ether: 0.1
    chainId: 2705143118829000,
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
      setLoadingMessage(LoadingMessages.executingTransaction);
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
      setLoadingMessage(LoadingMessages.SendingToken);
      return toast.success(`Added contact`, {
        action: {
          label: "See hash tx",
          onClick: () =>
            parent.open(
              `https://tutorialworldtwo-2705143118829000-1.testnet-sp1.sagaexplorer.io/tx/${data?.hash}`
            ),
        },
      });
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
    chainId: 2705143118829000,
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
      setLoading(true);
      multicall?.();
    }
  }, [isReady]);

  // Wagmi write MULTICALL
  const { data: dataMulticall, write: multicall } = useContractWrite({
    ...configMulticall,
    onSuccess(data) {
      console.log("Success write multicall", data);
      setLoadingMessage(LoadingMessages.executingTransaction);
      setIsReady(false);
      setActivateConfigMulticall(false);
    },
    onError(err) {
      console.error("Error write multicall", err);
      setIsReady(false);
      setActivateConfigMulticall(false);
      toast.error("Something went wrong.");
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
      setLoading(false);
      setLoadingMessage(LoadingMessages.SendingToken);
      return toast.success(`Multicall successfull`, {
        action: {
          label: "See hash tx",
          onClick: () =>
            parent.open(
              `https://tutorialworldtwo-2705143118829000-1.testnet-sp1.sagaexplorer.io/tx/${dataMulticall?.hash}`
            ),
        },
      });
    },
  });

  const submit = async () => {
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
      await sendGasToken(100_000);
      console.log("AddContact write function");
      setLoadingMessage(LoadingMessages.requestTransaction);
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
      await sendGasToken(75_000 * argsBytes.length);

      setLoadingMessage(LoadingMessages.requestTransaction);
      setActivateConfigMulticall(true);
      setPreparationMulticall(argsBytes);

      // After that check above the "Wagmi write MULTICALL"
    }
  };

  return (
    <>
      <div className="bg-gray-100 min-h-screen">
        <Toaster position="top-center" richColors />
        <Header />
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
          {inputFields[0].address && inputFields[0].name && isConnected ? (
            <div className="flex justify-center items-center mt-8">
              {loading ? (
                <Loading
                  loadingMessage={loadingMessage}
                  isFaucetLoading={false}
                />
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
              client={client}
              accountDev={accountDev}
              addresses={addresses}
              refetchGetContacts={refetchGetContacts}
            />
          ) : null}
        </div>
      </div>
    </>
  );
}

export default App;
