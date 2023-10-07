// import { useState } from "react";
import "./App.css";
import { PlusIcon } from "@heroicons/react/20/solid";
import { MinusIcon } from "@heroicons/react/20/solid";
import { useState } from "react";

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
      <div className="self-end mb-2 flex-none">
        <button
          type="button"
          onClick={() => handleAddFields()}
          className="ml-2 rounded-full bg-indigo-600 p-1 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 hover:scale-105 active:scale-110"
        >
          <PlusIcon className="h-5 w-5" aria-hidden="true" />
        </button>
        {index > 0 ? (
          <button
            type="button"
            onClick={() => handleRemoveFields()}
            className="ml-2 mt-2 sm:mt-0 rounded-full bg-red-600 p-1 text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 hover:scale-105 active:scale-110"
          >
            <MinusIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </>
  );
};

const Form = ({
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
      <div className="flex ml-auto px-6 sm:px-0 w-full sm:w-2/3 pt-8 gap-x-5">
        <div>
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
        <div>
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

function App() {
  const [inputFields, setInputFields] = useState([{ address: "", name: "" }]);
  // console.log("inputFields", inputFields);

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
  return (
    <>
      <div className=" bg-gray-100 min-h-screen">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
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
        </div>
      </div>
    </>
  );
}

export default App;
