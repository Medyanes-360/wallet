"use client";
import { useFormik } from "formik";
import * as Yup from "yup";
import { postAPI } from "../../../services/fetchAPI";
import Swal from "sweetalert2";
import { FormErrorMessage } from "../../../components/ui/FormErrorMessage";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  password: Yup.string()
    .min(5, "Password must be at least 5 characters long")
    .required("Password is required"),
});

// if there is already a user
// ip is blocked
// ip is required to be confirmed

const ipIsBlockedNotification = (message) => {
  // User's ip is blocked in the ipList
  return Swal.fire({
    title: "IP is blocked",
    html: `
        <p>${message}</p> 
        <p>Here is relevant Email: <span style="color: #3b82f6; text-decoration: underline;">${process.env.NEXT_PUBLIC_EMAIL_USER}</span></p>
    `,
    icon: "warning",
    confirmButtonText: "Tamam",
    timer: 5000,
    timerProgressBar: true,
  });
};

const ipIsActiveNotification = async (message) => {
  // There is already a user in the session
  let timerInterval; // Declare timerInterval outside the Swal configuration
  let timeLeft = 60; // Initialize timeLeft with 60 seconds

  return Swal.fire({
    title: "A user detected",
    html: `
        <p>${message}:</p>
        <input type="text" id="smsCodeInput" class="swal2-input" placeholder="SMS Kodu" />
        <p><strong>Kalan Süre: <span id="timer">60</span> saniye</strong></p>
      `,
    showCancelButton: true,
    confirmButtonText: "Onayla",
    cancelButtonText: "İptal et",
    didOpen: () => {
      const timerElement = Swal.getHtmlContainer().querySelector("#timer");

      if (timerElement) {
        // Check if the timer element exists
        timerInterval = setInterval(() => {
          timeLeft -= 1;
          timerElement.textContent = timeLeft;

          if (timeLeft <= 0) {
            clearInterval(timerInterval);
            Swal.close();
            Swal.fire(
              "Süre Doldu",
              "İşlem süresi dolduğu için iptal edildi.",
              "error"
            );
          }
        }, 1000);
      } else {
        console.error("Timer element not found!");
      }
    },
    willClose: () => {
      clearInterval(timerInterval); // Clear the interval to avoid memory leaks
    },
    preConfirm: () => {
      const inputCode = Swal.getPopup().querySelector("#smsCodeInput").value;
      if (!inputCode) {
        Swal.showValidationMessage(`Lütfen SMS kodunu girin`);
      }
      return inputCode;
    },
  });
};

const ipConfirmationNotification = async (message) => {
  let timerInterval;
  let timeLeft = 60;

  return Swal.fire({
    title: "A new IP has been detected",
    html: `
        <p>${message}:</p>
        <input type="text" id="smsCodeInput" class="swal2-input" placeholder="SMS Kodu" />
        <p><strong>Kalan Süre: <span id="timer">60</span> saniye</strong></p>
      `,
    showCancelButton: true,
    confirmButtonText: "Onayla",
    cancelButtonText: "İptal et",
    didOpen: () => {
      const timerElement = Swal.getHtmlContainer().querySelector("#timer");
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
      clearInterval(timerInterval);
    },
    preConfirm: () => {
      const inputCode = Swal.getPopup().querySelector("#smsCodeInput").value;
      if (!inputCode) {
        Swal.showValidationMessage(`Lütfen SMS kodunu girin`);
      }
      return inputCode;
    },
  });
};

export default function Page() {
  const router = useRouter();
  const getUserIP = async () => {
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      console.log(data);
      return data.ip; // IP adresini döndürür
    } catch (error) {
      console.error("IP adresi alınırken hata oluştu:", error);
      return null; // Hata durumunda null döner
    }
  };

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { resetForm }) => {
      const inputEmail = values.email;
      const inputPassword = values.password;
      const ipAddress = await getUserIP();

      await postAPI("/handle-ip", {
        email: inputEmail,
      })
        .then(async (res) => {
          if (res.isIPBlocked) {
            ipIsBlockedNotification(res.message);
          } else if (res.isIPActive) {
            // new IP/IP is in IPlist, active session
            const sendEmailCode = await postAPI("/email/send-code", {
              email: inputEmail,
            })
              .then((res) => {
                if (res.status === 200 || res.status === "success") {
                  console.log(
                    "verificationCode: ",
                    res.verificationCode
                  );
                  return res.verificationCode;
                } else {
                  console.log(res.message);
                  return null;
                }
              })
              .catch((error) => {
                console.log(error.message);
                return null;
              });

            if (!sendEmailCode) {
              Swal.fire("Hata", "Email kodu gönderilemedi.", "error");
              return false;
            }

            let attempts = 3;
            let isVerified = false;
            while (attempts > 0 && !isVerified) {
              const emailResult = await ipIsActiveNotification(res.message);

              if (emailResult.isConfirmed) {
                const verificationOfEmailCode = await postAPI(
                  "/email/verify-code",
                  {
                    verificationCode: sendEmailCode,
                    userInput: emailResult.value,
                  }
                )
                  .then((res) => {
                    if (res.status === 200 || res.status === "success") {
                      console.log(res.message);
                      return res.isVerified;
                    }
                  })
                  .catch((error) => {
                    console.log(error.message);
                    return false;
                  });

                if (verificationOfEmailCode) {
                  Swal.fire(
                    "Onaylandı!",
                    "İşleminiz başarıyla tamamlandı.",
                    "success"
                  );

                  isVerified = true;
                  const signInRes = await signIn("credentials", {
                    email: inputEmail,
                    password: inputPassword,
                    ipAddress: "95.91.246.240",
                    redirect: false,
                  });
                  if (signInRes?.error) throw new Error(signInRes.error);
                  router.push("/wallet");
                } else {
                  attempts -= 1;
                  await Swal.fire({
                    title: "Hatalı Kod",
                    text: `Girdiğiniz kod yanlış. Kalan giriş hakkı: ${attempts}`,
                    icon: "error",
                    timer: 2000,
                    showConfirmButton: false,
                  });
                  await new Promise((resolve) => setTimeout(resolve, 10));
                }
              } else {
                Swal.fire(
                  "İşlem İptal Edildi",
                  "Giriş işlemi iptal edildi.",
                  "error"
                );
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
          } else if (res.isConfirmationRequired) {
            // new IP, no session
            const sendEmailCode = await postAPI("/email/send-code", {
              email: inputEmail,
            })
              .then((res) => {
                if (res.status === 200 || res.status === "success") {
                  console.log(
                    "verificationCode: ",
                    res.verificationCode
                  );
                  return res.verificationCode;
                } else {
                  console.log(res.message);
                  return null;
                }
              })
              .catch((error) => {
                console.log(error.message);
                return null;
              });

            if (!sendEmailCode) {
              Swal.fire("Hata", "Email kodu gönderilemedi.", "error");
              return false;
            }

            let attempts = 3;
            let isVerified = false;
            while (attempts > 0 && !isVerified) {
              const emailResult = await ipConfirmationNotification(res.message);

              if (emailResult.isConfirmed) {
                const verificationOfEmailCode = await postAPI(
                  "/email/verify-code",
                  {
                    verificationCode: sendEmailCode,
                    userInput: emailResult.value,
                  }
                )
                  .then((res) => {
                    if (res.status === 200 || res.status === "success") {
                      console.log(res.message);
                      return res.isVerified;
                    }
                  })
                  .catch((error) => {
                    console.log(error.message);
                    return false;
                  });

                if (verificationOfEmailCode) {
                  Swal.fire(
                    "Onaylandı!",
                    "İşleminiz başarıyla tamamlandı.",
                    "success"
                  );

                  isVerified = true;
                  const signInRes = await signIn("credentials", {
                    email: inputEmail,
                    password: inputPassword,
                    ipAddress: "95.91.246.240",
                    redirect: false,
                  });
                  if (signInRes?.error) throw new Error(signInRes.error);
                  router.push("/wallet");
                } else {
                  attempts -= 1;
                  await Swal.fire({
                    title: "Hatalı Kod",
                    text: `Girdiğiniz kod yanlış. Kalan giriş hakkı: ${attempts}`,
                    icon: "error",
                    timer: 2000,
                    showConfirmButton: false,
                  });
                  await new Promise((resolve) => setTimeout(resolve, 10));
                }
              } else {
                Swal.fire(
                  "İşlem İptal Edildi",
                  "Giriş işlemi iptal edildi.",
                  "error"
                );
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
            const signInRes = await signIn("credentials", {
              email: inputEmail,
              password: inputPassword,
              ipAddress: "95.91.246.240",
              redirect: false,
            });
            if (signInRes?.error) throw new Error(signInRes.error);
            router.push("/");
          }
        })
        .catch((err) => {
          console.error(err);
        })
        .finally(() => {
          // resetForm();
        });
    },
  });

  return (
    <div>
      <div className="h-screen flex justify-center bg-gradient-to-r from-purple-100 via-purple-200 to-purple-100">
        <div className="bg-white shadow-lg rounded-md mt-36 flex flex-row justify-center p-5 w-96 h-96">
          <form onSubmit={formik.handleSubmit}>
            <h3 className="text-4xl space text-center font-bold text-purple-950">
              Giriş Yap
            </h3>
            <div className="flex flex-col gap-2 gap-y-5 mt-10">
              <div className="flex flex-col">
                <div className="flex gap-x-3 border p-3 rounded-lg">
                  <label htmlFor="">Email</label>
                  <input
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="johndoe@johndoe.com"
                    type="email"
                    className="outline-none"
                  />
                </div>
                {formik.touched.email && formik.errors.email && (
                  <FormErrorMessage errorMessage={formik.errors.email} />
                )}
              </div>
              <div className="flex flex-col gap-y-3">
                <div className="flex gap-x-3 border p-3 rounded-lg">
                  <label htmlFor="">Şifre</label>
                  <input
                    name="password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="*******"
                    type="password"
                    className="outline-none"
                  />
                </div>
                {formik.touched.password && formik.errors.password && (
                  <FormErrorMessage errorMessage={formik.errors.password} />
                )}
              </div>
              <button
                className="shadow rounded-lg bg-purple-500 text-white font-medium p-1 duration-100 ease-in transition-all hover:bg-purple-600 hover:shadow-lg"
                type="submit"
              >
                Giriş Yap
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
