import React from "react";

import Saga from "/saga.svg";

import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";

function Header() {
  const location = useLocation();
  return (
    <div className="flex justify-between items-center h-20 bg-slate-800 px-5 sm:px-20">
      <div className="flex items-center">
        <img className="h-10 w-10" src={Saga} alt="Saga" />
        {/* <a href=""></a> */}
        {location.pathname === "/" ? (
          <Link to={`faucet`}>
            {" "}
            <button className="text-white font-medium text-sm sm:text-lg ml-5 sm:ml-10 mr-10 px-4 py-2 rounded-2xl bg-[#278ea5] hover:scale-110 transition ease-in">
              Faucet
            </button>{" "}
          </Link>
        ) : (
          <Link to={`/`}>
            {" "}
            <button className="text-white font-medium text-sm sm:text-lg ml-5 sm:ml-10 mr-10 px-4 py-2 rounded-2xl bg-[#1f4287] hover:scale-110 transition ease-in">
              Return to Multicall
            </button>{" "}
          </Link>
        )}
      </div>
      <div className="ml-10 flex items-center justify-center text-white">
        <w3m-button balance="hide" label="Connect" />
      </div>
    </div>
  );
}

export default Header;
