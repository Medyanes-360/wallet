"use client";
import { IoIosSearch, IoMdOptions } from "react-icons/io";

import { useEffect, useMemo, useState } from "react";
import Tabs from "./Tabs";
import TransactionItem from "./TransactionItem";
import { useSession } from "next-auth/react";
import { postAPI } from "../../services/fetchAPI";

export default function Transactions() {
  const [selected, setSelected] = useState("Tümü");
  const [transactions, setTransactions] = useState([]);
  const [wallet, setWallet] = useState(null);

  const { data: session } = useSession();
  const userData = session.user;

  const getWalletData = () => {
    if (!wallet && !transactions?.length) {
      postAPI("/wallet", { userId: userData.id })
        .then((res) => {
          if (res.status === 200 || res.status === "success") {
            setTransactions(res.data.transactions?.reverse());
            setWallet(res.data.wallet);
          } else {
            console.log(res.message);
          }
        })
        .catch((error) => {
          console.error(error.message);
        });
    }
  };

  useEffect(() => {
    getWalletData();
  }, [userData?.id]);

  const filteredTransactions = useMemo(
    () =>
      selected === "Tümü"
        ? transactions
        : transactions?.filter(
            (item) =>
              item.type === (selected === "Gelen" ? "deposit" : "withdraw")
          ),
    [transactions, selected]
  );

  return (
    <div className="lg:mx-10 ">
      <div className="md:p-6 p-2 flex flex-col gap-y-10">
        <div className="flex flex-col gap-y-3 md:flex-row justify-between items-center">
          <h2 className="text-2xl font-medium text-purple-900">İşlemlerim</h2>
          <div className="flex gap-x-5 md:justify-center items-center">
            <div className="flex justify-center items-center gap-x-3 px-3 py-2 rounded-lg bg-white border">
              <IoIosSearch />
              <input
                type="text"
                placeholder="Ne aramak istersin?"
                className="outline-none"
              />
            </div>
            <button className="border rounded-full h-10 w-10 bg-purple-100 text-purple-600 flex justify-center items-center">
              <IoMdOptions />
            </button>
          </div>
        </div>
        <Tabs selected={selected} setSelected={setSelected} />

        <div className="flex justify-center items-center ">
          <ul className="mt-4 w-full max-w-xl shadow border rounded-lg divide-y bg-white">
            {filteredTransactions?.map((item, index) => (
              <TransactionItem
                key={`${index}-${item.title}`}
                transactionData={item}
                currency={wallet?.currency}
              />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
