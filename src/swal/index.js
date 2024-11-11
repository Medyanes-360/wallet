import Swal from  "sweetalert2";

export const fireSmsNotification = (title,message)=>{
  console.log("FireSmsNotification");
  
  let timerInterval;
  let timeLeft = 60;

  return Swal.fire({
    title: title,
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
}