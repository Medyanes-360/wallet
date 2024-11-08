"use client";
import Signin from "./Signin";
import WalletMain from "./WalletMain";
import WalletNavigation from "./WalletNavigation";
import { useEffect, useState } from "react";
import useActivityTracker from "../../hooks/useActivityTracker";

export default function MainComponent() {
  const [page, setPage] = useState("wallet"); // wallet,transactions
  const [login, setLogin] = useState(false);
  useActivityTracker();
  // session varsa login true olur

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.sessionStorage.getItem("loginSession") === "true" && !login) {
        console.log(window.sessionStorage.getItem("loginSession"));
        setLogin(true);
      }
    }
  }, [login]);

  if (!login) {
    return <Signin setLogin={setLogin} />;
  } else {
    return (
      <div className="grid grid-cols-5 min-h-screen md:p-0">
        <div className="h-screen hidden md:block md:col-span-1  bg-white">
          <WalletNavigation page={page} setPage={setPage} />
        </div>
        <div
          className={` col-span-5 md:col-span-4 lg:col-span-3 pb-24 md:pb-0  md:px-5 lg:pt-5 md:pt-8 bg-gradient-to-r  from-gray-100 to-purple-50 `}
        >
          <WalletMain page={page} setPage={setPage}></WalletMain>
        </div>
        <div className="hidden lg:block lg:col-span-1 lg:bg-white"></div>
        <div className="md:hidden bottom-0 left-0 mb-3 w-full fixed z-20">
          <WalletNavigation type="mobile" page={page} setPage={setPage} />
        </div>
      </div>
    );
  }
}
