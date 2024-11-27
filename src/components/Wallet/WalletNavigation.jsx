"use client";
import { FaWallet, FaListUl } from "react-icons/fa";
import { RiArrowDownSLine } from "react-icons/ri";
import { IoPersonOutline } from "react-icons/io5";

import NavigationItem from "./NavigationItem";
import { useSession } from "next-auth/react";

export default function WalletNavigation({ type = "desktop", page, setPage }) {

  const {data: session} = useSession()
  const userName = session.user.fullName

  // type= desktop/mobile
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
  if (type === "mobile") {
    return (
      <div className="flex justify-center bg-white mx-3 py-3 rounded-xl shadow">
        <div className="flex justify-evenly w-full">
          {navigationItems.map((item) => (
            <NavigationItem
              type="mobile"
              id={item.id}
              key={item.id}
              page={page}
              setPage={setPage}
              title={item.title}
              icon={item.icon}
            />
          ))}
          <button className="flex w-full flex-col justify-center items-center text-center">
            <IoPersonOutline size={20} />
            <div className="p-1 text-left">Profilim</div>
          </button>
        </div>
      </div>
    );
  } else {
    return (
      <div className="relative min-h-screen flex flex-col bg-white">
        <div>
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
        <button className="fixed bottom-5 left-2 p-2 lg:p-3 rounded-lg shadow flex items-center gap-x-3 bg-white">
          <div className="p-1 px-2 lg:p-2 lg:px-3 rounded-lg bg-purple-100 text-purple-900 flex justify-center items-center">
            <IoPersonOutline size={20} />
          </div>
          <div className="p-1 w-full text-left text-[14px] lg:text-base">{userName}</div>
          <div className="p-1 flex justify-center items-center">
            <RiArrowDownSLine />
          </div>
        </button>
      </div>
    );
  }
}
