import { RiArrowRightWideLine } from "react-icons/ri";

export default function TransactionItem({ transactionData }) {
  return (
    <li className="">
      <button className="w-full flex p-4  justify-between items-center text-sm ">
        <span className="flex justify-center items-center gap-x-4">
          <span className="border rounded-full h-10 w-10">
            {/** seçili ikonlardan uygun olanı otomatik olarak seç */}
            icon
          </span>
          <span className="flex flex-col gap-y-3">
            <span className="font-medium">
              {transactionData ? transactionData.title : "Title"}
            </span>
            <span className="text-xm">
              {transactionData ? transactionData.subtitle : "Subtitle"}
            </span>
          </span>
        </span>
        <span className="flex justify-center items-center gap-x-5">
          <span className="flex flex-col gap-y-1">
            <span
              className={`font-medium ${
                transactionData.amount[0] === "+"
                  ? "text-green-600"
                  : "text-red-600 "
              }`}
            >
              {transactionData ? transactionData.amount : "+800,00 TL"}
            </span>
            <div className="">
              {transactionData ? transactionData.date : "10 Eylül"}
            </div>
          </span>
          <span className="p-1">
            <RiArrowRightWideLine size={24} />
          </span>
        </span>
      </button>
    </li>
  );
}
