import React from "react";
import { RiArrowLeftWideLine } from "react-icons/ri";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

// Luhn algoritmasını kullanarak kart numarasını doğrulayan fonksiyon
const luhnCheck = (cardNumber) => {
  let sum = 0;
  let shouldDouble = false;
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber[i]);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
};

export default function ActionStep({
  actionType,
  ifSavedCardUsed,
  setIfSavedCardUsed,
  setActionStep,
}) {
  const cardSchema = Yup.object().shape({
    cardNumber: Yup.string()
      .matches(/^[0-9]{16}$/, "Kart numarası 16 haneli olmalı.")
      .test("Luhn check", "Geçersiz kart numarası.", (value) =>
        luhnCheck(value || "")
      )
      .required("Kart numarası zorunludur."),
    cardName: Yup.string()
      .matches(/^[a-zA-Z\s]+$/, "Geçersiz kart üzerindeki isim.")
      .required("Kart üzerindeki isim zorunludur."),
    expiryDate: Yup.string()
      .matches(
        /^(0[1-9]|1[0-2])\/?([0-9]{2})$/,
        "Geçersiz son kullanım tarihi."
      )
      .required("Son kullanım tarihi zorunludur."),
    cvv: Yup.string()
      .matches(/^[0-9]{3}$/, "Geçersiz CVV.")
      .required("CVV zorunludur."),
  });

  return (
    <div>
      <div className="flex gap-x-3 mb-5">
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
          <h4 className="text-purple-600 font-medium uppercase">
            {actionType === "deposit" ? "Para Yükle" : "Para Çek"}
          </h4>
          <h3 className="text-2xl font-semibold text-purple-900">
            {actionType === "deposit"
              ? "Banka/Kredi Kartından Cüzdanına Para Yükle"
              : "Cüzdanından Banka Hesabına Para Çek"}
          </h3>
        </div>
      </div>

      {actionType === "deposit" ? (
        <Formik
          initialValues={{
            cardNumber: "",
            cardName: "",
            expiryDate: "",
            cvv: "",
          }}
          validationSchema={cardSchema}
          onSubmit={(values) => {
            console.log("Kart Bilgileri:", values);
            setActionStep((val) => val + 1);
          }}
        >
          {({ handleSubmit }) => (
            <Form className="border-b pb-5 flex flex-col gap-y-5 w-full md:w-3/5 md:ml-8">
              <div>
                <Field
                  type="number"
                  name="cardNumber"
                  placeholder="Kart numarası"
                  inputMode="numeric"
                  maxLength="16"
                  pattern="[0-9]*"
                  className="border p-2 py-3 rounded-lg w-full"
                />
                <ErrorMessage
                  name="cardNumber"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>
              <div>
                <Field
                  type="text"
                  name="cardName"
                  placeholder="Kart üzerindeki isim"
                  className="border p-2 py-3 rounded-lg w-full"
                />
                <ErrorMessage
                  name="cardName"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>
              <div className="flex justify-between gap-x-3">
                <div className="w-1/2">
                  <Field
                    type="text"
                    name="expiryDate"
                    placeholder="Son kullanım tarihi (MM/YY)"
                    inputMode="numeric"
                    pattern="[0-9/]*"
                    className="border px-1 py-3 rounded-lg w-full"
                  />
                  <ErrorMessage
                    name="expiryDate"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>
                <div className="w-1/2">
                  <Field
                    type="number"
                    name="cvv"
                    placeholder="CVV"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="border px-1 py-3 rounded-lg w-full"
                  />
                  <ErrorMessage
                    name="cvv"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-left items-center gap-x-3">
                <input
                  className="w-4 h-4"
                  type="checkbox"
                  name="saveCard"
                  id="saveCard"
                />
                <label className="text-gray-400 text-sm" htmlFor="saveCard">
                  Kart bilgilerini kaydetmek ister misiniz?
                </label>
              </div>
              <div className=" mt-5  flex gap-x-3 ">
                <button
                  onClick={() => setActionStep(0)}
                  className="border p-1 w-1/2 rounded-lg bg-gray-100 text-gray-500"
                >
                  İptal et
                </button>
                <button
                  type="submit"
                  className="border p-1 w-1/2 rounded-lg bg-purple-600 text-gray-50"
                >
                  Devam Et
                </button>
              </div>
            </Form>
          )}
        </Formik>
      ) : (
        <div>{/* Para Çek Formu */}</div>
      )}
    </div>
  );
}
