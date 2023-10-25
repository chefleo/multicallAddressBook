import React from "react";

function Loading({ isFaucetLoading }: { isFaucetLoading: boolean }) {
  return (
    <>
      <div
        className={`flex justify-center items-center ${
          isFaucetLoading
            ? "bg-blue-700 w-3/4 sm:w-1/4 rounded-xl mt-6 h-16"
            : "bg-slate-800 w-1/2 px-3 py-4 rounded-xl"
        }  text-white font-semibold`}
      >
        <div
          className={`${
            isFaucetLoading ? "h-7 w-7" : "h-5 w-5"
          } inline-block relative pt-0.5`}
        >
          <div
            className={`${
              isFaucetLoading ? "h-6 w-6" : "h-4 w-4"
            } spinner border-t-white`}
          ></div>
          <div
            className={`${
              isFaucetLoading ? "h-6 w-6" : "h-4 w-4"
            } spinner delay_45 border-t-white`}
          ></div>
          <div
            className={`${
              isFaucetLoading ? "h-6 w-6" : "h-4 w-4"
            } spinner delay_30 border-t-white`}
          ></div>
          <div
            className={`${
              isFaucetLoading ? "h-6 w-6" : "h-4 w-4"
            } spinner delay_15 border-t-white `}
          ></div>
        </div>
      </div>
    </>
  );
}

export default Loading;
