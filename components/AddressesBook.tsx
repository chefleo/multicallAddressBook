import React, { useState } from "react";
import Clipboard from "/Clipboard.svg";
import X from "/X.svg";

import {
  useAccount,
  useContractRead,
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";

import {
  address as AddressBookContract,
  abi as AbiAddressBook,
} from "../contract/addressBook.json";

const AddressLine = ({ address }: { address: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address ? address : "");
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  return (
    <>
      <div className="flex items-center">
        <p className="mt-1 truncate text-sm text-gray-500">
          {`${address.slice(0, 8)}...${address.slice(-8)}`}
        </p>
        {copied ? (
          <>
            <p className="pl-3 text-gray-500 font-medium text-sm">Copied</p>
          </>
        ) : (
          address && (
            <img
              onClick={() => handleCopy(address)}
              className="ml-3 h-4 w-4 cursor-pointer stroke-red-600"
              src={Clipboard}
              alt="Clipboard"
            />
          )
        )}
      </div>
    </>
  );
};

const AddressContainer = ({
  address,
  refetchGetContacts,
}: {
  address: string;
  refetchGetContacts: any;
}) => {
  const { address: addressUser } = useAccount();

  const { data: name } = useContractRead({
    address: AddressBookContract as `0x${string}`,
    abi: AbiAddressBook,
    functionName: "getAlias",
    args: [address],
    enabled: address !== "",
    account: addressUser,
    onSuccess(data) {
      console.log("Success getAlias", data);
    },
    onError(err) {
      console.log(err);
    },
  });

  // Wagmi Prepare Write Contract
  const { config } = usePrepareContractWrite({
    address: AddressBookContract as `0x${string}`,
    abi: AbiAddressBook,
    functionName: "removeContact",
    args: [address],
    enabled: address !== "",
    cacheTime: 2_000,
    onSuccess(data) {
      console.log("Preparation Success removeContact", data);
    },
    onError(error) {
      console.log("Error", error.message);
    },
  });

  // Wagmi Write Contract
  const { data, write: removeContact } = useContractWrite({
    ...config,
    onSuccess(data) {
      console.log("Success write removeContact", data);
    },
  });

  // Wagmi wait for the transaction to be processed
  useWaitForTransaction({
    confirmations: 1,
    hash: data?.hash,
    onSuccess() {
      refetchGetContacts();
    },
  });

  return (
    <>
      <div className="flex w-full items-center justify-between space-x-6 p-6">
        <div className="flex-1 truncate">
          <div className="flex justify-between items-center space-x-3">
            <h3 className="truncate text-sm font-medium text-gray-900">
              {typeof name === "string" ? name : ""}
            </h3>
            <img
              onClick={() => removeContact?.()}
              className="h-3 w-3 cursor-pointer hover:transition hover:transform hover:scale-125 hover:ease-in"
              src={X}
              alt="X"
            />
          </div>
          <AddressLine address={address} />
        </div>
      </div>
    </>
  );
};

const AddressesBook = ({
  addresses,
  refetchGetContacts,
}: {
  addresses: string[];
  refetchGetContacts: any;
}) => {
  return (
    <>
      <ul
        role="list"
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-8"
      >
        {addresses &&
          addresses.map((address: string, index: number) => (
            <li
              key={index}
              className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow"
            >
              <AddressContainer
                address={address}
                refetchGetContacts={refetchGetContacts}
              />
            </li>
          ))}
      </ul>
    </>
  );
};

export default AddressesBook;
