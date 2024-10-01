"use client";
import { FaWallet, FaListUl } from "react-icons/fa";
import NavigationItem from "./NavigationItem";

export default function WalletNavigation({ page, setPage }) {
  const navigationItems = [
    {
      id: "wallet",
      icon: <FaWallet />,
      title: "Cüzdanım",
    },
    {
      id: "transactions",
      icon: <FaListUl />,
      title: "İşlemlerim",
    },
  ];

  return (
    <div className="min-h-full ">
      <div className="bg-white">
        <div className="border-b p-4 mb-5">
          <h3 className="text-lg font-medium text-purple-800">Cüzdanım</h3>
        </div>
        <div>
          {navigationItems.map((item) => (
            <NavigationItem
              id={item.id}
              key={item.id}
              page={page}
              setPage={setPage}
              title={item.title}
              icon={item.icon}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
