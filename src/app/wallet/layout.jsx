"use client";
import { div } from "framer-motion/client";
import Signin from "../../components/Wallet/Signin";
import WalletMain from "../../components/Wallet/WalletMain";
import WalletNavigation from "../../components/Wallet/WalletNavigation";
import { useState } from "react";

export default function WalletLayout({ children }) {
  const [page, setPage] = useState("wallet"); // wallet,transactions
  const [login, setLogin] = useState(false);

  return (
    <div className="grid grid-cols-5  min-h-screen md:p-0">
      <div className="hidden md:block md:col-span-1 border bg-gray-50">
        <WalletNavigation page={page} setPage={setPage} />
      </div>
      <div
        className={` col-span-5 md:col-span-3 md:p-10 md:pt-8 ${
          page === "transactions"
            ? "bg-gradient-to-r  from-gray-100 to-purple-50"
            : "bg-white"
        }`}
      >
        <WalletMain page={page}></WalletMain>
      </div>
      <div className="hidden md:block lg:col-span-1 lg:border md:bg-gray-50"></div>
    </div>
  );
}
