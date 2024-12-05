"use client";
import { RiArrowLeftWideLine, RiArrowRightWideLine } from "react-icons/ri";
import CardItem from "./CardItem";
import { HiOutlineCreditCard } from "react-icons/hi";
import { useEffect, useState } from "react";
import { postAPI } from "../../services/fetchAPI";

export default function CardMain({
  userData,
  showSelectedAction,
  updateActionStep,
  setIfSavedCardUsed,
  setSelectedCard,
  ifSavedCardUsed,
}) {
  const [bankAccounts, setBankAccounts] = useState([]);

  useEffect(() => {
    getBankAccounts();
  }, [userData.id]);

  function getBankAccounts() {
    if (!bankAccounts.length) {
      postAPI("/bank-account/get-bank-account", {
        userId: userData.id,
      })
        .then((res) => {
          if (res.status === 200 || res.status === "success") {
            setBankAccounts(res.data);
          } else {
            console.log(res.message);
          }
        })
        .catch((error) => {
          console.error(error.message);
        });
    }
  }

  return (
    <div className="w-full md:w-3/4">
      <div className="flex gap-x-3">
        <button onClick={() => updateActionStep((val) => val - 1)}>
          <RiArrowLeftWideLine className="text-purple-800" size={24} />
        </button>
        <div>
          <h4 className="text-purple-600 font-medium uppercase">
            {showSelectedAction === "deposit"
              ? "Para Yükleme işlemi"
              : "Para Çekme talebi"}
          </h4>
          <h3 className="text-2xl font-semibold text-purple-900">Kart seç</h3>
        </div>
      </div>
      <div className="flex flex-col gap-y-5 mt-10">
        <ul className="space-y-2">
          {bankAccounts?.map((card) => (
            <CardItem
              ifSavedCardUsed={ifSavedCardUsed}
              setIfSavedCardUsed={setIfSavedCardUsed}
              setActionStep={updateActionStep}
              key={card.id}
              card={card}
              setSelectedCard={setSelectedCard}
            />
          ))}
        </ul>
        <div className="border-t  py-4">
          <button
            onClick={() => updateActionStep((val) => val + 1)}
            className="w-full flex p-4  rounded-lg justify-between items-center text-sm shadow"
          >
            <span className="grid grid-cols-4  w-full">
              <span className="col-span-1 flex items-center justify-center">
                <HiOutlineCreditCard className="text-purple-600" size={24} />
              </span>
              <span className="col-span-3 font-medium flex flex-col items-start gap-y-1 ">
                <span>Yeni kart ile devam et</span>
              </span>
            </span>
            <span className="flex justify-center items-center gap-x-5">
              <span className="flex flex-col gap-y-1"></span>
              <span className="p-1">
                <RiArrowRightWideLine size={24} />
              </span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
