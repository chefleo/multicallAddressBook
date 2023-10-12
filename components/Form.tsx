import React from "react";
import { PlusIcon } from "@heroicons/react/20/solid";
import { MinusIcon } from "@heroicons/react/20/solid";

type InputField = {
  address: string;
  name: string;
};

const Buttons = ({
  index,
  handleAddFields,
  handleRemoveFields,
}: {
  index: number;
  handleAddFields: () => void;
  handleRemoveFields: () => void;
}) => {
  return (
    <>
      <div className="col-start-3 col-end-5">
        <button
          type="button"
          onClick={() => handleAddFields()}
          className="ml-2 rounded-full bg-indigo-600 p-2 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 hover:scale-105 active:scale-110"
        >
          <PlusIcon className="h-5 w-5" aria-hidden="true" />
        </button>
        {index > 0 ? (
          <button
            type="button"
            onClick={() => handleRemoveFields()}
            className="ml-2 mt-2 sm:mt-0 rounded-full bg-red-600 p-2 text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 hover:scale-105 active:scale-110"
          >
            <MinusIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </>
  );
};

export const Form = ({
  index,
  isLast,
  inputField,
  handleAddFields,
  handleInputChange,
  handleRemoveFields,
}: {
  index: number;
  isLast: boolean;
  inputField: InputField;
  handleAddFields: () => void;
  handleInputChange: (index: any, event: any) => void;
  handleRemoveFields: () => void;
}) => {
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-9 px-6 sm:px-0 w-full pt-8 gap-x-5">
        <div className="lg:col-span-3 lg:col-start-2 lg:col-end-5">
          <label
            htmlFor="Address"
            className="block text-sm font-semibold leading-6 text-gray-900"
          >
            Address
          </label>
          <div className="mt-2.5">
            <input
              type="text"
              name="address"
              id="address"
              value={inputField.address}
              onChange={(event) => handleInputChange(index, event)}
              className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>
        <div className="lg:col-span-3 lg:col-start-6 lg:col-end-9">
          <label
            htmlFor="Name"
            className="block text-sm font-semibold leading-6 text-gray-900"
          >
            Name
          </label>
          <div className="mt-2.5">
            <input
              type="text"
              name="name"
              id="name"
              autoComplete="given-name"
              value={inputField.name}
              onChange={(event) => handleInputChange(index, event)}
              className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-6 mt-8">
        {isLast ? (
          <Buttons
            index={index}
            handleAddFields={handleAddFields}
            handleRemoveFields={handleRemoveFields}
          />
        ) : null}
      </div>
    </>
  );
};
