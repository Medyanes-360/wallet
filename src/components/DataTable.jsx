"use client";
import { IoMdSettings } from "react-icons/io";
import { MdNotStarted , MdCancel,MdCheckCircle   } from "react-icons/md";

import { motion } from "framer-motion";
import { useState } from "react";

export default function DataTable() {
  const [isShow, toggleShow] = useState(false);
  const variants = {
    open: {
      y: -30,
      opacity: 1,
    },
    closed: {
      y: 0,
      opacity: 0,
      transition: {
        delay: 0.5,
      },
    },
  };
  const testData = [
    {
      id: "1",
      walletId: "643eebc7f5a44b63b5f9ab00",
      userId: "643eeac9f5a44b63b5f9aa90",
      type: "deposit",
      amount: 500.0,
      status: "SUCCESS",
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
      description: "Initial deposit",
      PaymentLog: null,
      Wallet: "Main Wallet",
      User: "John Doe",
    },
    {
      id: "2",
      walletId: "643eebc7f5a44b63b5f9ab01",
      userId: "643eeac9f5a44b63b5f9aa91",
      type: "withdraw",
      amount: 200.0,
      status: "PENDING",
      createdAt: "2024-02-01",
      updatedAt: "2024-02-02",
      description: "ATM withdrawal",
      PaymentLog: null,
      Wallet: "Main Wallet",
      User: "Jane Smith",
    },
    {
      id: "3",
      walletId: "643eebc7f5a44b63b5f9ab02",
      userId: "643eeac9f5a44b63b5f9aa92",
      type: "transfer",
      amount: 1000.0,
      status: "FAILED",
      createdAt: "2024-03-05",
      updatedAt: "2024-03-05",
      description: "Transfer to another wallet",
      PaymentLog: null,
      Wallet: "Main Wallet",
      User: "Alice Johnson",
    },
    {
      id: "4",
      walletId: "643eebc7f5a44b63b5f9ab03",
      userId: "643eeac9f5a44b63b5f9aa93",
      type: "deposit",
      amount: 700.0,
      status: "SUCCESS",
      createdAt: "2024-03-10",
      updatedAt: "2024-03-10",
      description: "Salary deposit",
      PaymentLog: null,
      Wallet: "Savings Wallet",
      User: "Bob Lee",
    },
    {
      id: "5",
      walletId: "643eebc7f5a44b63b5f9ab04",
      userId: "643eeac9f5a44b63b5f9aa94",
      type: "withdraw",
      amount: 50.0,
      status: "CANCELLED",
      createdAt: "2024-04-01",
      updatedAt: "2024-04-01",
      description: "Cancelled transaction",
      PaymentLog: null,
      Wallet: "Savings Wallet",
      User: "Charlie Brown",
    },
    {
      id: "6",
      walletId: "643eebc7f5a44b63b5f9ab05",
      userId: "643eeac9f5a44b63b5f9aa95",
      type: "transfer",
      amount: 300.0,
      status: "PENDING",
      createdAt: "2024-04-05",
      updatedAt: "2024-04-06",
      description: "Transfer to savings",
      PaymentLog: null,
      Wallet: "Main Wallet",
      User: "Diana Prince",
    },
    {
      id: "7",
      walletId: "643eebc7f5a44b63b5f9ab06",
      userId: "643eeac9f5a44b63b5f9aa96",
      type: "deposit",
      amount: 900.0,
      status: "SUCCESS",
      createdAt: "2024-05-01",
      updatedAt: "2024-05-01",
      description: "Bonus deposit",
      PaymentLog: null,
      Wallet: "Bonus Wallet",
      User: "Eve Green",
    },
    {
      id: "8",
      walletId: "643eebc7f5a44b63b5f9ab07",
      userId: "643eeac9f5a44b63b5f9aa97",
      type: "withdraw",
      amount: 120.0,
      status: "SUCCESS",
      createdAt: "2024-06-01",
      updatedAt: "2024-06-01",
      description: "Withdraw to bank",
      PaymentLog: null,
      Wallet: "Main Wallet",
      User: "Frank Castle",
    },
    {
      id: "9",
      walletId: "643eebc7f5a44b63b5f9ab08",
      userId: "643eeac9f5a44b63b5f9aa98",
      type: "transfer",
      amount: 600.0,
      status: "FAILED",
      createdAt: "2024-06-10",
      updatedAt: "2024-06-10",
      description: "Failed transfer",
      PaymentLog: null,
      Wallet: "Main Wallet",
      User: "George Miller",
    },
    {
      id: "10",
      walletId: "643eebc7f5a44b63b5f9ab09",
      userId: "643eeac9f5a44b63b5f9aa99",
      type: "deposit",
      amount: 100.0,
      status: "SUCCESS",
      createdAt: "2024-07-01",
      updatedAt: "2024-07-01",
      description: "Gift deposit",
      PaymentLog: null,
      Wallet: "Main Wallet",
      User: "Hank Pym",
    },
  ];

  return (
    <table className="w-full md:w-11/12 mx-auto mt-10 shadow">
      <thead className="bg-slate-100">
        <tr>
          {/* İlk objenin key'lerini tablo başlığı olarak oluşturuyoruz */}
          {Object.keys(testData[0]).map((key) => (  
            <th className="p-3  text-left" key={key}>
              {key}
            </th>
          ))}
          <th></th>
        </tr>
      </thead>
      <tbody className="">
        {testData.map((item, index) => (
          <tr
            className="odd:bg-gray-50 hover:scale-100 hover:shadow-lg  transition-all duration-100 "
            key={item.id}
          >
            <td className="p-3  text-left">{item.id}</td>
            <td className="p-3  text-left">{item.walletId}</td>
            <td className="p-3  text-left">{item.userId}</td>
            <td className="p-3  text-left">{item.type}</td>
            <td className="p-3  text-left font-semibold text-lg">
              {item.amount}
            </td>
            <td
              className={`p-3 font-semibold lowercase text-sm text-left ${
                item.status === "SUCCESS"
                  ? "text-green-600"
                  : item.status === "PENDING"
                  ? "text-orange-600"
                  : item.status === "FAILED"
                  ? "text-red-600"
                  : "text-gray-600"
              }`}
            >
              <span
                className={`rounded-xl border p-1 ${
                  item.status === "SUCCESS"
                    ? "bg-green-100 border-green-200"
                    : item.status === "PENDING"
                    ? "bg-orange-100 border-orange-200"
                    : item.status === "FAILED"
                    ? "bg-red-100 border-red-200"
                    : "bg-gray-100 border-gray-200"
                }`}
              >
                {item.status}
              </span>
            </td>
            <td className="p-3  text-left">{item.createdAt}</td>
            <td className="p-3  text-left">{item.updatedAt}</td>
            <td className="p-3  text-left">{item.description}</td>
            <td className="p-3  text-left">{item.PaymentLog}</td>
            <td className="p-3  text-left">{item.Wallet}</td>
            <td className="p-3  text-left">{item.User}</td>

            <td className="p-3 relative">
              <motion.button
                key={item.id}
                onFocus={() => toggleShow(item.id)}
                onBlur={() => toggleShow(null)}
                className="flex justify-center items-center hover:scale-150 hover:rotate-180 transition-all duration-150"
              >
                <IoMdSettings size={20} />
              </motion.button>
              <motion.span
                animate={isShow === item.id ? "open" : "closed"}
                variants={variants}
                className={`${
                  isShow === item.id ? "flex" : "hidden"
                } shadow absolute rounded-lg flex-col justify-center items-center z-10 bg-white bottom-2 left-1 w-10 min:h-10`}
              >
                <button className="w-full px-1 flex justify-center items-center text-blue-600">
                  <MdNotStarted  size={38} />
                </button>
                <button className="w-full px-1 flex justify-center items-center text-red-600">
                  <MdCancel size={38} />
                </button>
                <button className="w-full px-1 flex justify-center items-center text-green-600">
                  <MdCheckCircle  size={38} />
                </button>
              </motion.span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
