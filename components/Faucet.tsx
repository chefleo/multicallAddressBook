import React, { useCallback, useEffect, useState } from "react";

import Header from "./Header";
import Loading from "./Loading";
import { tutorialsworld } from "../src/main";

import { useBalance, useNetwork, useSwitchNetwork } from "wagmi";
import { privateKeyToAccount } from "viem/accounts";
import { createWalletClient, http, publicActions } from "viem";

import { Toaster, toast } from "sonner";

import {
  address as AddressFaucet,
  abi as AbiFaucet,
} from "../contract/faucetSaga.json";

const Faucet = () => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: balanceFaucet, refetch: refetchBalance } = useBalance({
    address: AddressFaucet as `0x${string}`,
  });
  const { chain } = useNetwork();
  const { chains, switchNetwork } = useSwitchNetwork();

  useEffect(() => {
    if (chain?.id !== 2705143118829000) {
      switchNetwork?.(2705143118829000);
    }

    return () => {
      // Cleanup function to prevent memory leaks
      // Unsubscribe or clean up any resources here
    };
  }, [chain, switchNetwork]);

  const handleInputChange = useCallback(
    (event: any) => {
      const value: string = event.target.value;
      setInput(value);
    },
    [input, setInput]
  );

  // console.log(input);

  const account = privateKeyToAccount(import.meta.env.VITE_PRIVATE_KEY);

  const client = createWalletClient({
    account,
    chain: tutorialsworld,
    transport: http(),
  }).extend(publicActions);

  const faucet = async () => {
    const pattern = /^0x[a-fA-F0-9]{40}$/;
    if (!pattern.test(input))
      return toast.error("Please fill out with an ethereum address.");

    setLoading(true);

    try {
      // Equivalent of usePrepareContractWrite
      const { request } = await client.simulateContract({
        address: AddressFaucet as `0x${string}`,
        abi: AbiFaucet,
        functionName: "requestTokens",
        args: [input],
      });

      // Equivalent of useContractWrite
      const hash = await client.writeContract(request);
      // console.log("Transaction successfull", hash);

      toast.success(`Token sent successfully`);
    } catch (error) {
      toast.error(
        `Sorry! To be fair to all developers, we only send 0.5 Tutorials token every 24 hours. Please try again after 24 hours from your original request.`
      );
    } finally {
      setInput("");
      setLoading(false);
      refetchBalance();
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Toaster position="top-center" richColors />
      <Header />
      <div className="mt-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex flex-col justify-center items-center">
          <div className="w-full flex flex-col justify-center items-center">
            <h1 className="block text-4xl font-medium leading-6 text-gray-900">
              Tutorials Faucet
            </h1>
            <h2 className="mt-4 block text-lg font-normal leading-6 text-gray-900">
              0.5 tutorials token/day
            </h2>
            <p className="mt-1 block text-sm font-normal leading-6 text-gray-500">
              Balance Faucet: {balanceFaucet?.formatted} Tutorial token
            </p>
            <div className="mt-8 w-3/4 sm:w-1/2">
              <input
                className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                type="text"
                name="address"
                id="address"
                value={input}
                onChange={(event) => handleInputChange(event)}
                placeholder="Enter Your Wallet Address 0x..."
                required
              />
            </div>
          </div>
          {loading ? (
            <Loading isFaucetLoading={true} />
          ) : (
            <button
              onClick={() => faucet?.()}
              // onClick={() => test()}
              className="mt-6 h-16 w-3/4 sm:w-1/4 rounded-xl bg-blue-700 cursor-pointer text-xl text-white font-semibold hover:scale-110 transition ease-in"
            >
              Send Me Tutorials token
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Faucet;
