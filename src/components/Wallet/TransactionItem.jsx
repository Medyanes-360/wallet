import { GrTransaction } from "react-icons/gr";
import { IoMdAdd } from "react-icons/io";
import { RiArrowRightWideLine } from "react-icons/ri";
import Swal from "sweetalert2";

export default function TransactionItem({ transactionData, currency }) {
  const dateTime = transactionData?.createdAt;
  const date = new Date(dateTime);

  // Array of Turkish month names for the second formatting variable to show the date looks like "12 Kasım, 2024"
  const monthsInTurkish = [
    "Ocak",
    "Şubat",
    "Mart",
    "Nisan",
    "Mayıs",
    "Haziran",
    "Temmuz",
    "Ağustos",
    "Eylül",
    "Ekim",
    "Kasım",
    "Aralık",
  ];

  // formatting the date so that it looks like for instance "12.10.24"
  // const formattedDate = `${String(date.getDate()).padStart(2, "0")}.${String(
  //   date.getMonth() + 1
  // ).padStart(2, "0")}.${String(date.getFullYear()).slice(-2)}`;

  // formatting the date so that it looks like for instance "12 Kasım, 2024"
  const formattedDate = `${String(date.getDate()).padStart(2, "0")} ${
    monthsInTurkish[date.getMonth()]
  }, ${date.getFullYear()}`;

  const showPaymentDetails = async () => {
    return Swal.fire({
      title: `<h2 class="text-lg font-bold mb-4">Payment Details</h2>`,
      html: `
        <div class="flex flex-col w-full space-y-4 text-left">
          <div class="flex flex-wrap items-center">
            <span class="font-semibold w-full xs:w-40">Operation Type:</span>
            <span class="w-full xs:w-auto">${transactionData.type}</span>
          </div>
          <div class="flex flex-wrap items-center">
            <span class="font-semibold w-full xs:w-40">Amount:</span>
            <span class="font-medium ${
              transactionData.type === "deposit"
                ? "text-green-500"
                : "text-red-500"
            } w-full xs:w-auto">
              ${transactionData.type === "deposit" ? "+" : "-"} ${
        transactionData?.amount
      } ${currency}
            </span>
          </div>
          <div class="flex flex-wrap items-center">
            <span class="font-semibold w-full xs:w-40">Date:</span>
            <span class="w-full xs:w-auto">${formattedDate}</span>
          </div>
          <div class="flex flex-wrap items-center">
            <span class="font-semibold w-full xs:w-40">Description:</span>
            <span class="text-gray-500 w-full xs:w-auto">${
              transactionData.description || "No description provided"
            }</span>
          </div>
        </div>`,
      confirmButtonText: "Tamam", 
    });
  };

  return (
    <li className="">
      <button
        className="w-full flex p-4 justify-between items-center text-sm"
        onClick={showPaymentDetails}
      >
        <span className="flex justify-center items-center gap-x-4">
          {/** şimdilik askıya alındı  -- seçili ikonlardan uygun olanı otomatik olarak seç */}
          <span className="border rounded-full h-8 w-8 flex justify-center items-center">
            {transactionData.type === "deposit" ? (
              <IoMdAdd className="text-green-500" size={16} />
            ) : (
              <GrTransaction className="text-red-500" size={16} />
            )}
          </span>
          <span className="flex flex-col gap-y-1">
            <span className="font-medium text-left">
              {transactionData ? transactionData.type : "Title"}
            </span>
            <span className="text-xm text-left text-gray-500 truncate max-w-[200px]">
              {transactionData?.description ? transactionData?.description : "No description provided"}
            </span>
          </span>
        </span>
        <span className="flex justify-center items-center gap-x-5">
          <span className="flex flex-col gap-y-1 items-end">
            <span
              className={`font-medium ${
                transactionData.type === "deposit"
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {transactionData.type === "deposit" ? "+" : "-"}{" "}
              {transactionData?.amount} {currency}
            </span>
            <div className="">{formattedDate}</div>
          </span>
          <span className="p-1">
            <RiArrowRightWideLine size={24} />
          </span>
        </span>
      </button>
    </li>
  );
}
