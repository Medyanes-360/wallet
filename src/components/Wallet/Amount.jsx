"use client";
import { useState } from "react";
import Swal from "sweetalert2";
import { RiArrowLeftWideLine } from "react-icons/ri";
import { postAPI } from "../../services/fetchAPI";
import { v4 as uuidv4 } from "uuid";
import { useSession } from "next-auth/react";
import hashPaymentData from "../../services/hashPaymentData";

export default function Amount({
  amount,
  setActionStep,
  showSelectedAction,
  setAmount,
  setIfSavedCardUsed,
  ifSavedCardUsed,
  selectedCard,
}) {
  const [maxAmount, setMaxAmount] = useState(50000);
  const [minAmount, setMinAmount] = useState(250);
  const [riskAmount, setRiskAmount] = useState(10000); // Onay gerektiren para miktarı
  const [processAmount, setProcessAmount] = useState(0); // giriş yapmış kullanıcıdan alacağımız o gün yaptığı işlem sayısı
  const [paymentDescription, setPaymentDescription] = useState("");

  const { data: session } = useSession();
  const userData = session.user;
  const dailyPaymentLimit = userData.dailyPaymentLimit;

  // amount olarak girilebilecek değerleri kontrol eder
  const handleChange = (event) => {
    const value = event.target.value;

    // Düzenli ifade ile sadece rakamları kabul et
    if (/^[0-9]*$/.test(value)) {
      // setAmount(value); // Eğer girdi sadece sayı ise değeri güncelle
      setAmount(parseFloat(value)); // Eğer girdi sadece sayı ise değeri güncelle
    }
  };
  const handleKeyDown = (event) => {
    // +, -, e, virgül, nokta ve diğer izin verilmeyen karakterlerin girişini engelle
    if (["+", "-", "e", ",", "."].includes(event.key)) {
      event.preventDefault();
    }
  };
  // --------------------------------------------------
  // Bakiye ekleme fonksiyonu
  const addBalance = async (amount) => {
    if (amount) {
      const processStatus = await checkProcessAmount(); // Günlük işlem sayısını kontrol et
      if (processStatus) {
        const riskMinAmountStatus = await checkMinAmount(amount); // Miktarı kontrol et
        if (!riskMinAmountStatus) return;
        const riskStatus = await checkRiskAmount(amount); // Miktarı kontrol et
        if (!riskStatus) return;

        const transactionId = await postAPI("/createTransactionId", {
          userId: userData.id,
          amount,
        }).then((res) => {
          if (res.status === 200 || res.status === "success") {
            console.log(res.data);
            return res.data;
          } else {
            console.warn("Failed to create transaction ID:", res.message);
            return null;
          }
        });

        const paymentData = {
          userId: userData.id,
          amount,
          transactionId,
          description: paymentDescription,
          cardNumber: selectedCard?.cardNumber,
          iban: selectedCard.iban,
        };
        const encrypedData = hashPaymentData(paymentData, "enc");

        postAPI("/payment", { ...encrypedData })
          .then((res) => {
            if (res.status === 200 || res.status === "success") {
              console.log(res.data);
              setAmount("");
              setPaymentDescription("");
              return Swal.fire({
                title: `Para yatırma işlemi`,
                text: `${amount} TL için ${res.message}`,
                icon: "success",
                confirmButtonText: "Tamam",
                timer: 5000,
                timerProgressBar: true,
              });
            } else {
              console.warn("Failed deposit:", res?.message || "Unknown error");
              return Swal.fire({
                title: `Para yatırma işlemi hata`,
                text: `${res?.message ? res.message : "Bilinmeyen hata"}`,
                icon: "warning",
                confirmButtonText: "Tamam",
                timer: 5000,
                timerProgressBar: true,
              });
            }
          })
          .catch((error) => {
            console.error(error.message);
          });
        setProcessAmount((prev) => prev + 1);
      }
    }
  };

  //para çekme fonksiyonu
  const getWithdraw = async (amount) => {
    try {
      if (amount) {
        const processStatus = await checkProcessAmount(); // Günlük işlem sayısını kontrol et
        if (processStatus) {
          const riskMinAmountStatus = await checkMinAmount(amount); // Miktarı kontrol et
          if (!riskMinAmountStatus) return;
          const riskStatus = await checkRiskAmount(amount); // Miktarı kontrol et
          if (!riskStatus) return;

          const transactionId = await postAPI("/createTransactionId", {
            userId: userData.id,
            amount,
          }).then((res) => {
            if (res.status === 200 || res.status === "success") {
              console.log(res.data);
              return res.data;
            } else {
              console.warn("Failed to create transaction ID:", res.message);
              return null;
            }
          });

          const paymentData = {
            userId: userData.id,
            amount,
            transactionId,
            description: paymentDescription,
            cardNumber: selectedCard.cardNumber,
            iban: selectedCard.iban,
          };
          const encrypedData = hashPaymentData(paymentData, "enc");
          postAPI("/withdraw", { ...encrypedData })
            .then((res) => {
              if (res?.status === 200 || res?.status === "success") {
                console.log(res?.data);
                setPaymentDescription("");
                setAmount("");
                return Swal.fire({
                  title: `Para çekme işlemi`,
                  text: `${amount} TL için ${res?.message}`,
                  icon: "success",
                  confirmButtonText: "Tamam",
                  timer: 5000,
                  timerProgressBar: true,
                });
              } else {
                console.warn(
                  "Failed withdrawal:",
                  res?.message || "Unknown error"
                );
                console.log(res);
                return Swal.fire({
                  title: `Para çekme işlemi hata`,
                  text: `${res?.message ? res.message : "Bilinmeyen hata"}`,
                  icon: "warning",
                  confirmButtonText: "Tamam",
                  timer: 5000,
                  timerProgressBar: true,
                });
              }
            })
            .catch((error) => {
              console.error("Withdrawal request failed:", error);
              return null;
            });
          setProcessAmount((prev) => prev + 1);
        }
      }
    } catch (error) {
      console.error("Çekim işlemi sırasında hata oluştu:", error);
      await Swal.fire({
        title: "Hata!",
        text: "Çekim işlemi başarısız oldu.",
        icon: "error",
      });
    }
  };

  //günlük yapılan işlem saysını kontrol ediyoruz kontrol ediyoruz
  const checkProcessAmount = async () => {
    if (processAmount > dailyPaymentLimit) {
      await Swal.fire({
        title: "Uyarı",
        text: "Bugün 3'ten fazla işlem yaptınız!",
        icon: "warning",
        confirmButtonText: "Tamam",
      });
      return false; // İşlem sayısı sınırını aştı, daha fazla işlem yapılamaz
    } else if (processAmount === dailyPaymentLimit) {
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
    if (amount <= maxAmount) {
      if (amount >= riskAmount) {
        const result = await Swal.fire({
          title: "Miktarı Onaylıyor musunuz?",
          text: `Bu işlem ${amount} TL'lik, devam etmek istiyor musunuz?`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Evet",
          cancelButtonText: "Hayır",
        });

        if (result.isConfirmed) {
          const sendSMSCode = await postAPI("/sms/send-code", {
            userId: "66fb0e6ef23da7a2919e1b44",
            amount,
            paymentType: "payment",
          })
            .then((res) => {
              if (res.status === 200 || res.status === "success") {
                console.log("verificationCode: ", res.message.verificationCode);
                return res.message.verificationCode;
              } else {
                console.log(res.message);
                return null;
              }
            })
            .catch((error) => {
              console.log(error.message);
              return null;
            });

          if (!sendSMSCode) {
            Swal.fire("Hata", "SMS kodu gönderilemedi.", "error");
            return false;
          }

          let attempts = 3;
          let isVerified = false;
          while (attempts > 0 && !isVerified) {
            let timerInterval;
            let timeLeft = 60;

            const smsResult = await Swal.fire({
              title: "SMS Onayı Gerekli",
              html: `
                <p>${amount} TL'nin üzerinde bir işlem yapıyorsunuz.</p>
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
                    Swal.fire({
                      title: "Süre Doldu",
                      text: "İşlem süresi dolduğu için iptal edildi.",
                      icon: "error",
                      timer: 2000,
                      showConfirmButton: false,
                    });
                  }
                }, 1000);
              },
              willClose: () => {
                clearInterval(timerInterval);
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
              const smsVerificationResult = await postAPI("/sms/verify-code", {
                verificationCode: sendSMSCode,
                userInput: smsResult.value,
              })
                .then((res) => {
                  if (res.status === 200 || res.status === "success") {
                    console.log(res.message);
                    return res;
                  } else {
                    console.log(res.message);
                    return false;
                  }
                })
                .catch((error) => {
                  console.log(error.message);
                  return false;
                });

              if (smsVerificationResult.isVerified) {
                Swal.fire(
                  "Onaylandı!",
                  `${smsVerificationResult.message}`,
                  "success"
                );
                console.log("İşlem başarıyla onaylandı.");
                isVerified = true;
                return true;
              } else {
                attempts -= 1;
                await Swal.fire({
                  title: "Hatalı Kod",
                  text: `Girdiğiniz SMS kodu yanlış. Kalan giriş hakkı: ${attempts}`,
                  icon: "error",
                  timer: 2000,
                  showConfirmButton: false,
                });
                await new Promise((resolve) => setTimeout(resolve, 10));
              }
            } else {
              Swal.fire({
                title: "Süre Doldu",
                text: "İşlem süresi dolduğu için iptal edildi.",
                icon: "error",
                timer: 2000,
                showConfirmButton: false,
              });
              return false;
            }
          }

          if (!isVerified) {
            Swal.fire(
              "İşlem Başarısız",
              "3 defa yanlış kod girildiği için işlem iptal edildi.",
              "error"
            );
            return false;
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
        return true;
      }
    } else {
      await Swal.fire({
        title: "Maksimum limit",
        text: `Yapılan işlem için istediğiniz miktar ${amount} TL, sistem tarafından belirtilen maksimum limiti ${maxAmount} TL aşıyor.`,
        icon: "warning",
        confirmButtonText: "Tamam",
      });
      return false;
    }
  };

  //miktarın minimum miktardan az olup olmadığını kontrol ediyoruz
  const checkMinAmount = async (amount) => {
    if (amount < minAmount) {
      await Swal.fire({
        title: "Minimum limit",
        text: `İşlem için istediğiniz miktar ${amount} TL, sistem tarafından belirtilen minimum limitin ${minAmount} TL altında.`,
        icon: "warning",
        confirmButtonText: "Tamam",
      });
      return false;
    } else {
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
              : setActionStep((val) => val - 2);
            setIfSavedCardUsed(false);
          }}
        >
          <RiArrowLeftWideLine className="text-purple-800" size={24} />
        </button>
        <div>
          <h4 className="text-purple-600 font-medium uppercase">
            {showSelectedAction === "deposit" ? "Para Yatır" : "Para Çek"}
          </h4>
          <h3 className="text-2xl font-semibold text-purple-900">
            {showSelectedAction === "deposit"
              ? "Banka Hesabından Cüzdanına Para Yükle"
              : "Cüzdanından Banka Hesabına Para Çek"}
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
          className={`text-center p-3 w-1/2 border-black border-b-2 flex justify-center items-baseline text-5xl font-medium outline-none ${
            amount === 0 ? "text-gray-500" : "text-black"
          }`}
          value={amount}
        />

        <div className="flex w-full md:w-1/2 border-b-2 pb-10 p-2 justify-evenly">
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
        <textarea
          onChange={(event) => setPaymentDescription(event.target.value)}
          placeholder="Açıklama"
          type="number"
          className="border text-gray-500 p-3 rounded-lg w-full xs:w-1/2 focus:outline-none resize-none shadow-sm scrollbar-thin scrollbar-thumb-blue-500"
          value={paymentDescription}
        />

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
                getWithdraw(amount);
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
