// import { useState } from "react";
import "./App.css";
import { useEffect, useState } from "react";

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

function App() {
  const initialState = [{ address: "", name: "" }];
  const [inputFields, setInputFields] = useState(initialState);

  // Wagmi State Variables Hooks
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  useEffect(() => {
    if (chain?.id !== 84531 && chain?.name !== "Base Goerli") {
      switchNetwork?.(84531);
    }
  }, [chain, switchNetwork]);

  const handleInputChange = (index: number, event: any) => {
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
  };

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
  });

  // Wagmi wait for the transaction to be processed
  useWaitForTransaction({
    confirmations: 1,
    hash: data?.hash,
    onSuccess() {
      refetchGetContacts();
      setInputFields(initialState);
    },
  });

  const submit = () => {
    const values = [...inputFields];

    const isAnyFieldEmpty = inputFields.some(
      (field) => !field.address || !field.name
    );
    if (isAnyFieldEmpty) {
      return toast.error("Please fill out all address and name fields.");
    }

    if (values.length <= 1) {
      console.log("values", Object.values(values[0]));
      addContact?.();
    } else {
      const arrMulticall = values.map((obj) => Object.values(obj));
      console.log("values arrMulticall", arrMulticall);
    }
  };

  return (
    <>
      <div className="bg-gray-100 min-h-screen">
        <Toaster position="top-center" richColors />
        <div className="flex justify-end items-center h-20 bg-slate-800 px-8">
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
              <button
                onClick={() => submit()}
                className="bg-slate-800 text-white font-semibold w-1/2 px-3 py-4 rounded-xl hover:bg-slate-600"
              >
                Add Contact{inputFields.length > 1 ? "s" : ""}
              </button>
            </div>
          ) : null}
          {Array.isArray(addresses) ? (
            <AddressesBook
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
