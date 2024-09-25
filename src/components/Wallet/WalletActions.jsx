"use client";
import { RiArrowRightWideLine, RiArrowLeftWideLine } from "react-icons/ri";
import { HiOutlineCreditCard } from "react-icons/hi2";
import { CiBank } from "react-icons/ci";
import { GrTransaction } from "react-icons/gr";
import { useState } from "react";
import { postAPI } from "../../services/fetchAPI";
import Swal from "sweetalert2";

export default function WalletActions() {
  const [showSelectedAction, setShowSelecetedAction] = useState(""); //deposit/withdraw
  const [continueAction, setContinueAction] = useState(false); // continue after card info added
  const [amount, setAmount] = useState("");
  const [actionStep, setActionStep] = useState(0); // işlem basamağı
  const [ifSavedCardUsed, setIfSavedCardUsed] = useState(false);
  const [riskAmount, setRiskAmount] = useState(2000); // Onay gerektiren para miktarı
  const [smsCode, setSmsCode] = useState(""); // Kullanıcının girdiği SMS kodu
  const generatedCode = "123456"; // SMS ile gönderilecek örnek kod

  const [processAmount, setProcessAmount] = useState(4); // giriş yapmış kullanıcıdan alacağımız o gün yaptığı işlem sayısı

  // SMS gönderme işlemi (Burada fake bir SMS kodu gönderiliyor)
  const sendSms = () => {
    console.log(`SMS ile gönderilen kod: ${generatedCode}`);
  };

  //günlük yapılan işlem saysını kontrol ediyoruz kontrol ediyoruz
  const checkProcessAmount = async () => {
    if (processAmount > 5) {
      await Swal.fire({
        title: "Uyarı",
        text: "Bugün 5'ten fazla işlem yaptınız!",
        icon: "warning",
        confirmButtonText: "Tamam",
      });
      return false; // İşlem sayısı sınırını aştı, daha fazla işlem yapılamaz
    } else if (processAmount === 4) {
      const result = await Swal.fire({
        title: "Son İşlem Uyarısı",
        text: "Bu, bugün yapabileceğiniz son işlem. Devam etmek istiyor musunuz?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Evet",
        cancelButtonText: "Hayır",
      });

      if (result.isConfirmed) {
        return true; // Kullanıcı onayladı, devam edebilir
      } else {
        return false; // Kullanıcı iptal etti, işlem yapılmıyor
      }
    } else {
      return true; // İşlem sayısı uygun
    }
  };

  //miktarın risk miktarından fazla olup olmadığını kontrol ediyoruz
  const checkRiskAmount = async (amount) => {
    if (amount > riskAmount) {
      const result = await Swal.fire({
        title: "Miktarı Onaylıyor musunuz?",
        text: `Bu işlem ${amount} TL'lik bir yükleme. Devam etmek istiyor musunuz?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Evet",
        cancelButtonText: "Hayır",
      });

      if (result.isConfirmed) {
        sendSms();

        let timerInterval;
        let timeLeft = 60; // 60 saniye (1 dakika)

        const smsResult = await Swal.fire({
          title: "SMS Onayı Gerekli",
          html: `
            <p>${riskAmount} TL'nin üzerinde bir işlem yapıyorsunuz.</p>
            <p>Lütfen SMS ile gönderilen kodu girin:</p>
            <input type="text" id="smsCodeInput" class="swal2-input" placeholder="SMS Kodu" />
            <p><strong>Kalan Süre: <span id="timer">60</span> saniye</strong></p>
          `,
          showCancelButton: true,
          confirmButtonText: "Onayla",
          cancelButtonText: "İptal",
          didOpen: () => {
            const timerElement =
              Swal.getHtmlContainer().querySelector("#timer");
            timerInterval = setInterval(() => {
              timeLeft -= 1;
              timerElement.textContent = timeLeft;

              if (timeLeft === 0) {
                clearInterval(timerInterval);
                Swal.close();
                Swal.fire(
                  "Süre Doldu",
                  "İşlem süresi dolduğu için iptal edildi.",
                  "error"
                );
              }
            }, 1000);
          },
          willClose: () => {
            clearInterval(timerInterval); // Zamanlayıcı durduruluyor
          },
          preConfirm: () => {
            const inputCode =
              Swal.getPopup().querySelector("#smsCodeInput").value;
            if (!inputCode) {
              Swal.showValidationMessage(`Lütfen SMS kodunu girin`);
            }
            return inputCode;
          },
        });

        if (smsResult.isConfirmed) {
          if (smsResult.value === generatedCode) {
            Swal.fire(
              "Onaylandı!",
              "İşleminiz başarıyla tamamlandı.",
              "success"
            );
            console.log("İşlem başarıyla onaylandı.");
            return true;
          } else {
            Swal.fire("Hatalı Kod", "Girdiğiniz SMS kodu yanlış.", "error");
            return false;
          }
        }
      } else {
        Swal.fire(
          "İşlem İptal Edildi",
          "Yükleme işlemi iptal edildi.",
          "error"
        );
        return false;
      }
    } else {
      console.log("İşlem risk seviyesinin altında, direkt yapılabilir.");
      return true;
    }
  };

  // Bakiye ekleme fonksiyonu
  const addBalance = async (amount) => {
    if (amount) {
      const processStatus = await checkProcessAmount(); // Günlük işlem sayısını kontrol et
      if (processStatus) {
        const riskStatus = await checkRiskAmount(amount); // Miktarı kontrol et
        console.log(riskStatus);
      }
    }
  };

  async function handleApiRequest() {
    console.log("hi");
    const payload = { item1: "a", item2: "b", item3: 10 };
    const res = await postAPI("/test", { text: "hi" });
    console.log(res);
  }
  const Balance = () => {
    return (
      <div className="text-center">
        <h2 className="text-xl font-semibold text-purple-800">
          Cüzdan Bakiyem
        </h2>
        <div className="text-5xl font-bold mt-2 text-purple-900">0 TL</div>
        <div className="text-xs text-gray-500 mt-1">
          Hesap numarası: 32507319
        </div>
      </div>
    );
  };
  const ActionButtons = () => {
    return (
      <div className="flex justify-around mt-6">
        <div className="flex flex-col items-center">
          <button
            onClick={() => {
              setShowSelecetedAction("deposit");
              setActionStep(1);
            }}
            className="bg-purple-600 text-white p-3 rounded-lg   shadow "
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M21.9167 6.04166C21.9167 2.75097 19.249 0.0833282 15.9583 0.0833282C12.6676 0.0833282 10 2.75097 10 6.04166C10 9.33236 12.6676 12 15.9583 12C19.249 12 21.9167 9.33236 21.9167 6.04166ZM16.5007 6.58334L16.5012 9.29484C16.5012 9.594 16.2587 9.83651 15.9595 9.83651C15.6604 9.83651 15.4179 9.594 15.4179 9.29484L15.4174 6.58334H12.7036C12.4047 6.58334 12.1624 6.34082 12.1624 6.04167C12.1624 5.74252 12.4047 5.5 12.7036 5.5H15.4172L15.4167 2.79024C15.4167 2.49109 15.6592 2.24857 15.9583 2.24857C16.2575 2.24857 16.5 2.49109 16.5 2.79024L16.5005 5.5H19.2046C19.5035 5.5 19.7458 5.74252 19.7458 6.04167C19.7458 6.34082 19.5035 6.58334 19.2046 6.58334H16.5007ZM18.6667 18.7708V12.5437C19.2526 12.2993 19.7985 11.978 20.2917 11.5925V18.7708C20.2917 20.4162 18.9578 21.75 17.3125 21.75H3.77083C1.82633 21.75 0.25 20.1737 0.25 18.2292V4.95833C0.25 4.92483 0.252027 4.8918 0.255966 4.85937C0.252011 4.80259 0.25 4.74528 0.25 4.68749C0.25 3.3413 1.34131 2.24999 2.6875 2.24999H10.0236C9.70236 2.75181 9.44299 3.29707 9.25629 3.87499H2.6875C2.23877 3.87499 1.875 4.23876 1.875 4.68749C1.875 5.13623 2.23877 5.49999 2.6875 5.49999H8.93719C8.92359 5.67877 8.91667 5.85941 8.91667 6.04166C8.91667 6.41007 8.94496 6.77186 8.99949 7.12499H2.6875C2.40261 7.12499 2.12913 7.07612 1.875 6.9863V18.2292C1.875 19.2762 2.72379 20.125 3.77083 20.125H17.3125C18.0604 20.125 18.6667 19.5187 18.6667 18.7708ZM14.6042 13.0833C14.1554 13.0833 13.7917 13.4471 13.7917 13.8958C13.7917 14.3446 14.1554 14.7083 14.6042 14.7083H16.7708C17.2196 14.7083 17.5833 14.3446 17.5833 13.8958C17.5833 13.4471 17.2196 13.0833 16.7708 13.0833H15.9583H14.6042Z"
                fill="white"
              ></path>
            </svg>
          </button>
          <span className="mt-1 text-sm text-purple-600 font-medium">
            Yükle
          </span>
        </div>

        <div className="flex flex-col items-center">
          <button
            onClick={() => {
              setShowSelecetedAction("withdraw");
              setActionStep(1);
            }}
            className="bg-purple-600 text-white p-3 rounded-lg shadow"
          >
            <GrTransaction size={24} />
          </button>
          <span className="mt-1 text-sm text-purple-600 font-medium">Çek</span>
        </div>
      </div>
    );
  };
  const LastActions = () => {
    return (
      <div className="mt-10 mx-auto max-w-xl">
        <div className="flex justify-between">
          <h3 className="font-semibold text-lg text-black">Son İşlemlerim</h3>
          <a className="underline decoration-1 text-purple-900" href="">
            Tümü
          </a>
        </div>
        <ul className="mt-4 space-y-2">
          <li className="">
            <button className="w-full flex p-4 border rounded-lg justify-between items-center text-sm shadow">
              <span className="font-medium">Bakiye Yüklendi </span>
              <span className="flex justify-center items-center gap-x-5">
                <span className="flex flex-col gap-y-1">
                  <span className="text-green-600 font-medium">+800,00 TL</span>
                  <div className="">10 Eylül</div>
                </span>
                <span className="p-1">
                  <RiArrowRightWideLine size={24} />
                </span>
              </span>
            </button>
          </li>
          <li className="">
            <button className="w-full flex p-4 border rounded-lg justify-between items-center text-sm shadow">
              <span className="font-medium">Hizmet satın alındı </span>
              <span className="flex justify-center items-center gap-x-5">
                <span className="flex flex-col gap-y-1">
                  <span className="text-red-600 font-medium">-100,00 TL</span>
                  <div className="">19 Ekim</div>
                </span>
                <span className="p-1">
                  <RiArrowRightWideLine size={24} />
                </span>
              </span>
            </button>
          </li>
          <li className="">
            <button className="w-full flex p-4 border rounded-lg justify-between items-center text-sm shadow">
              <span className="font-medium">Hizmet satın alındı </span>
              <span className="flex justify-center items-center gap-x-5">
                <span className="flex flex-col gap-y-1">
                  <span className="text-red-600 font-medium">-800,00 TL</span>
                  <div className="">1 Eylül</div>
                </span>
                <span className="p-1">
                  <RiArrowRightWideLine size={24} />
                </span>
              </span>
            </button>
          </li>
        </ul>
      </div>
    );
  };
  const DepositTitle = () => {
    return (
      <div className="flex gap-x-3">
        <button
          onClick={() => {
            ifSavedCardUsed
              ? setActionStep((val) => val - 2)
              : setActionStep((val) => val - 1);
            setIfSavedCardUsed(false);
          }}
        >
          <RiArrowLeftWideLine className="text-purple-800" size={24} />
        </button>
        <div>
          <h4 className="text-purple-600 font-medium uppercase">Para Yükle</h4>
          <h3 className="text-2xl font-semibold text-purple-900">
            Banka/Kredi Kartından Cüzdanına Para Yükle
          </h3>
        </div>
      </div>
    );
  };
  const WithdrawTitle = () => {
    return (
      <div className="flex gap-x-3">
        <button
          onClick={() => {
            ifSavedCardUsed
              ? setActionStep((val) => val - 2)
              : setActionStep((val) => val - 1);
            setIfSavedCardUsed(false);
          }}
        >
          <RiArrowLeftWideLine className="text-purple-800" size={24} />
        </button>
        <div>
          <h4 className="text-purple-600 font-medium uppercase">Para Çek</h4>
          <h3 className="text-2xl font-semibold text-purple-900">
            Cüzdanından Banka Hesabına Para Çek
          </h3>
        </div>
      </div>
    );
  };
  const DepositBody = () => {
    return (
      <div className="flex flex-col gap-y-5">
        <input
          type="text"
          placeholder="Kart numarası"
          className="border p-2 rounded-lg"
        />
        <input
          type="text"
          placeholder="Kart üzerindeki isim"
          className="border p-2 rounded-lg"
        />
        <div className="flex justify-between gap-x-3">
          <input
            type="text"
            placeholder="Son kullanım tarihi"
            className="border px-1 py-2 p-2 rounded-lg w-1/2"
          />
          <input
            type="text"
            placeholder="CVV"
            className="border px-1 py-2 rounded-lg w-1/2"
          />
        </div>
      </div>
    );
  };
  const WithdrawBody = () => {
    return (
      <div className="flex flex-col gap-y-5">
        <input
          type="text"
          placeholder="IBAN"
          className="border p-2 rounded-lg"
        />
        <input
          type="text"
          placeholder="Alıcı hesap adı"
          className="border p-2 rounded-lg"
        />
      </div>
    );
  };
  const AmountBody = () => {
    return (
      <div className="mt-16">
        <div className="flex flex-col gap-y-3 items-center">
          <div>Miktar seçiniz</div>
          <input
            onChange={(value) => setAmount(value.target.value)}
            placeholder="0"
            type="text"
            className={`text-center p-3 w-1/2 border-black  border-b-2 flex justify-center items-baseline text-5xl font-medium outline-none ${
              amount === 0 ? "text-gray-500" : "text-black"
            }`}
            value={amount}
          />
          <div className="flex w-full md:w-1/2 border-b-2 pb-10  p-2 justify-evenly">
            {[500, 1000, 3000].map((i) => (
              <button
                key={`item-${i}`}
                onClick={() => setAmount(i)}
                className={`border p-1 px-3 rounded-2xl ${
                  i === amount ? "bg-purple-300" : ""
                }`}
              >
                {i}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 text-center gap-x-3 w-1/2">
            <button
              onClick={() => setActionStep(0)}
              className="p-1 px-3 rounded-lg bg-gray-100"
            >
              İptal
            </button>
            <button
              onClick={() => {
                if (showSelectedAction === "deposit") {
                  addBalance(amount); // Bakiye yükleme işlemi
                } else if (showSelectedAction === "withdraw") {
                  console.log("Çekim talebi oluştur.");
                }
              }}
              className="p-1 px-3 rounded-lg bg-purple-700 text-white"
            >
              {showSelectedAction === "deposit"
                ? "Bakiye Yükle"
                : showSelectedAction === "withdraw"
                ? "Talep oluştur"
                : ""}
            </button>
          </div>
        </div>
      </div>
    );
  };
  const ChooseCardTitle = () => {
    return (
      <div className="flex gap-x-3">
        <button
          onClick={() => {
            setActionStep((val) => val - 1);
          }}
        >
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
    );
  };
  const ChooseCardBody = () => {
    return (
      <div className="flex flex-col gap-y-5">
        <ul className="space-y-2">
          {[1, 2, 3].map((i) => (
            <li className="">
              <button
                onClick={() => {
                  setActionStep((val) => val + 2);
                  setIfSavedCardUsed(true);
                }}
                className="w-full flex p-4  rounded-lg justify-between items-center text-sm shadow"
              >
                <span className="grid grid-cols-4  w-full">
                  <span className="col-span-1 flex items-center justify-center">
                    <CiBank size={24} />
                  </span>
                  <span className="col-span-3 font-medium flex flex-col items-start gap-y-1 ">
                    <span>{i} Bankası </span>
                    <span className="">Kart No</span>
                  </span>
                </span>
                <span className="flex justify-center items-center gap-x-5">
                  <span className="flex flex-col gap-y-1"></span>
                  <span className="p-1">
                    <RiArrowRightWideLine size={24} />
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <div className="border-t  py-4">
          <button
            onClick={() => setActionStep((val) => val + 1)}
            className="w-full flex p-4  rounded-lg justify-between items-center text-sm shadow"
          >
            <span className="grid grid-cols-4  w-full">
              <span className="col-span-1 flex items-center justify-center">
                <HiOutlineCreditCard className="text-purple-600" size={24} />
              </span>
              <button className="col-span-3 font-medium flex flex-col items-start gap-y-1 ">
                <span>Yeni kart ile devam et</span>
              </button>
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
    );
  };
  return (
    <div className="md:p-6 p-2  bg-white rounded-lg md:shadow-md">
      {actionStep === 0 ? (
        <div>
          <Balance /> {/* Bakiye Kısmı */}
          <ActionButtons /> {/* İşlem Butonları => Para Yatır/Para Çek  */}
          <LastActions /> {/* Son İşlemler */}
        </div>
      ) : actionStep === 1 ? (
        <div>
          <ChooseCardTitle />
          <div className="mt-10 md:ml-10 pb-4 ">
            <div className="w-full lg:w-1/2">
              <ChooseCardBody />
            </div>
          </div>
        </div>
      ) : actionStep === 2 ? (
        /** Choose payment type */
        <div>
          {/** Para yükleme/çekme işlemleri */}
          {showSelectedAction === "deposit" ? (
            <DepositTitle />
          ) : (
            <WithdrawTitle />
          )}
          <div className="mt-10 md:ml-10 pb-4 ">
            <div className="w-full lg:w-1/2">
              {/**showSelectedAction === "deposit"
                ? "Hesabına nasıl para yüklemek istersin?"
                : showSelectedAction === "withdraw"
                ? "Cüzdanından Para Çek"
                : ""*/}
              {/** Card or IBAN */}
              {showSelectedAction === "deposit" ? (
                <DepositBody />
              ) : showSelectedAction === "withdraw" ? (
                <WithdrawBody />
              ) : (
                ""
              )}
            </div>
            <div className=" mt-5 w-full  lg:w-1/2 flex gap-x-3 ">
              <button
                onClick={() => setActionStep(0)}
                className="border p-1 w-1/2 rounded-lg bg-gray-100 text-gray-500"
              >
                İptal
              </button>
              <button
                onClick={() => setActionStep((val) => val + 1)}
                className="border p-1 w-1/2 rounded-lg bg-purple-600 text-gray-50"
              >
                Devam Et
              </button>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
      {/** choose amount  */}
      {actionStep === 3 ? (
        <div>
          {/* <div className="flex gap-x-3">
            <button onClick={() => setContinueAction(false)}>
              <RiArrowLeftWideLine className="text-purple-800" size={24} />
            </button>
            <div>
              <h4 className="text-purple-600 font-medium uppercase">
                {showSelectedAction === "deposit"
                  ? "Para Yükle"
                  : showSelectedAction === "withdraw"
                  ? "Para Çek"
                  : ""}
              </h4>
              <h3 className="text-2xl font-semibold text-purple-900">
                {showSelectedAction === "deposit"
                  ? "Yüklenecek miktarı seçiniz"
                  : showSelectedAction === "withdraw"
                  ? "Çekme talebi oluşturalacak miktarı seçiniz"
                  : ""}
              </h3>
            </div>
          </div> */}
          {showSelectedAction === "deposit" ? (
            <DepositTitle />
          ) : (
            <WithdrawTitle />
          )}
          <AmountBody />
        </div>
      ) : (
        ""
      )}
    </div>
  );
}
