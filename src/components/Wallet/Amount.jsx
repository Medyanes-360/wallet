"use client";
import { useState } from "react";
import Swal from "sweetalert2";
import { RiArrowRightWideLine, RiArrowLeftWideLine } from "react-icons/ri";

export default function Amount({
  amount,
  setActionStep,
  showSelectedAction,
  setAmount,
  setIfSavedCardUsed,
  ifSavedCardUsed
}) {
  const [riskAmount, setRiskAmount] = useState(2000); // Onay gerektiren para miktarı
  const [smsCode, setSmsCode] = useState(""); // Kullanıcının girdiği SMS kodu
  const generatedCode = "123456"; // SMS ile gönderilecek örnek kod
  const [processAmount, setProcessAmount] = useState(4); // giriş yapmış kullanıcıdan alacağımız o gün yaptığı işlem sayısı

  const handleChange = (event) => {
    const value = event.target.value;

    // Düzenli ifade ile sadece rakamları kabul et
    if (/^[0-9]*$/.test(value)) {
      setAmount(value); // Eğer girdi sadece sayı ise değeri güncelle
    }
  };
  const handleKeyDown = (event) => {
    // +, -, e, virgül, nokta ve diğer izin verilmeyen karakterlerin girişini engelle
    if (["+", "-", "e", ",", "."].includes(event.key)) {
      event.preventDefault();
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
          cancelButtonText: "İptal et",
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
  return (
    <div className="">
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
          <h4 className="text-purple-600 font-medium uppercase">{showSelectedAction === "deposit" ? "Para Yatır" : "Para Çek"}</h4>
          <h3 className="text-2xl font-semibold text-purple-900">
            
            {showSelectedAction === "deposit" ? "Banka Hesabından Cüzdanına Para Yükle" : "Cüzdanından Banka Hesabına Para Çek"}
          </h3>
        </div>
      </div>
      <div className="flex flex-col gap-y-3 mt-5 items-center">
        <div>Miktar seçiniz</div>
        <input
          autoFocus
          onChange={(event) => handleChange(event)}
          onKeyDown={(event) => handleKeyDown(event)}
          placeholder="0"
          type="number"
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
            İptal et
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
}
