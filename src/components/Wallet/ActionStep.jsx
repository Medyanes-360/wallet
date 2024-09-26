import { RiArrowLeftWideLine } from "react-icons/ri";

export default function ActionStep({
  actionType,
  ifSavedCardUsed,
  setIfSavedCardUsed,
  setActionStep,
}) {
  if (actionType === "deposit") {
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
              Para Yükle
            </h4>
            <h3 className="text-2xl font-semibold text-purple-900">
              Banka/Kredi Kartından Cüzdanına Para Yükle
            </h3>
          </div>
        </div>
        <div className="border-b pb-5 flex flex-col gap-y-5 w-full md:w-3/5 ml-8">
          <input
            type="text"
            placeholder="Kart numarası"
            className="border p-2 py-3 rounded-lg"
          />
          <input
            type="text"
            placeholder="Kart üzerindeki isim"
            className="border p-2 py-3 rounded-lg"
          />
          <div className="flex justify-between gap-x-3">
            <input
              type="text"
              placeholder="Son kullanım tarihi"
              className="border px-1 py-3 rounded-lg w-1/2"
            />
            <input
              type="text"
              placeholder="CVV"
              className="border px-1 py-3 rounded-lg w-1/2"
            />
          </div>
        </div>
        <div className=" mt-5  ml-8  md:w-1/2 flex gap-x-3 ">
          <button
            onClick={() => setActionStep(0)}
            className="border p-1 w-1/2 rounded-lg bg-gray-100 text-gray-500"
          >
            İptal et
          </button>
          <button
            onClick={() => setActionStep((val) => val + 1)}
            className="border p-1 w-1/2 rounded-lg bg-purple-600 text-gray-50"
          >
            Devam Et
          </button>
        </div>
      </div>
    );
  } else {
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
            <h4 className="text-purple-600 font-medium uppercase">Para Çek</h4>
            <h3 className="text-2xl font-semibold text-purple-900">
              Cüzdanından Banka Hesabına Para Çek
            </h3>
          </div>
        </div>
        <div className="border-b pb-5 flex flex-col gap-y-5 w-full md:w-3/5 ">
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
        <div className=" mt-5  ml-8  md:w-1/2 flex gap-x-3 ">
          <button
            onClick={() => setActionStep(0)}
            className="border p-1 w-1/2 rounded-lg bg-gray-100 text-gray-500"
          >
            İptal et
          </button>
          <button
            onClick={() => setActionStep((val) => val + 1)}
            className="border p-1 w-1/2 rounded-lg bg-purple-600 text-gray-50"
          >
            Devam Et
          </button>
        </div>
      </div>
    );
  }
}
