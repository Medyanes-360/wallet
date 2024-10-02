"use client";
import Signin from "./Signin";
import WalletMain from "./WalletMain";
import WalletNavigation from "./WalletNavigation";
import { useState } from "react";

export default function MainComponent() {
  const [page, setPage] = useState("wallet"); // wallet,transactions
  const [login, setLogin] = useState(false);

  if(login=== false){
    return(
      <Signin setLogin={setLogin} />
    )
  }else{
    return (
      <div className="grid grid-cols-5 min-h-screen md:p-0">
        <div className="h-screen hidden md:block md:col-span-1  bg-white">
          <WalletNavigation page={page} setPage={setPage} />
        </div>
        <div
          className={` col-span-5 md:col-span-3 md:p-10 md:pt-8 bg-gradient-to-r  from-gray-100 to-purple-50 `}
        >
          <WalletMain page={page}></WalletMain>
        </div>
        <div className="hidden md:block lg:col-span-1 lg:border md:bg-gray-50"></div>
        <div className="md:hidden bottom-0 mb-3 w-full absolute z-10">
          <WalletNavigation type="mobile" page={page} setPage={setPage} />
        </div>
      </div>
    );
  }
}
