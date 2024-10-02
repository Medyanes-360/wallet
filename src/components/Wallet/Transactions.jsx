"use client";
import { IoIosSearch, IoMdOptions } from "react-icons/io";
import { useState } from "react";
import Tabs from "./Tabs";
import TransactionItem from "./TransactionItem";

export default function Transactions() {
  const [selected, setSelected] = useState("Tümü");
  const testTransactions = [
    {
      title: "Harcama",
      subtitle: "subtitle",
      date: "10 Eylül",
      amount: "-100",
    },
    {
      title: "Yükleme",
      subtitle: "subtitl2e",
      date: "10 2Eylül",
      amount: "+1000.00",
    },
    {
      title: "Çekme",
      subtitle: "subtitle3",
      date: "10 Eylül3",
      amount: "-10000.00",
    },
  ];
  return (
    <div className="md:mx-10">
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
        <Tabs />

        <div className="flex justify-center items-center  ">
          <ul className="mt-4 w-full max-w-xl  shadow border rounded-lg divide-y bg-white">
            {testTransactions.map((item) => (
              <TransactionItem key={item.title} transactionData={item} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
