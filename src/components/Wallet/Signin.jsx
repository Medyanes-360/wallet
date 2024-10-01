import { useState } from "react";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import VerificationInput from "react-verification-input";

export default function Signin({ setLogin }) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  console.log("şifre", "123456");

  function handleLogin(event) {
    console.log("hi");
    console.log(password);

    if (event) {
      if (event === "123456") {
        console.log("handle login");
        setLogin(true);
      }
    } else if (password === "123456") {
      console.log("handle login");
      setLogin(true);
    }
  }

  const ShowPasswordButton = () => {
    return (
      <button
        onClick={() => setShowPassword((val) => (val = !val))}
        className="flex gap-x-3 items-center my-2 w-fit"
      >
        <span>Şifre</span>
        <span className={`text-gray-400 ${showPassword ? "" : ""}`}>
          {showPassword ? <FaEye /> : <FaEyeSlash />}
        </span>
      </button>
    );
  };

  return (
    <div className="h-screen flex justify-center">
      <div className="border shadow-md  md:rounded-lg md:h-[555px] w-full md:w-[530px] md:mt-16">
        <div className="bg-gradient-to-r border-t md:rounded-t-lg from-gray-50 via-gray-50  to-purple-100 p-4">
          <span className="font-medium text-2xl ml-4">Cüzdan Girişi</span>
        </div>
        <div className="px-10 py-10">
          <div className="text-2xl font-semibold">Hoşgeldin Kullanıcı</div>
          <div>Cüzdana giriş yapmak için lütfen giriş yap.</div>
        </div>
        <div className="px-10  h-[340px] flex flex-col justify-between">
          <div className=" h-full flex flex-col gap-y-5">
            <ShowPasswordButton />

            <VerificationInput
              validChars="0-9"
              length={6}
              onChange={(event) => {
                console.log(event);
                setPassword(event);
              }}
              value={password}
              passwordMode={!showPassword}
              placeholder=" "
              autoFocus={true}
              onComplete={(event) => handleLogin(event)}
              inputProps={{ inputMode: "numeric" }}
              classNames={{
                character:
                  "rounded-lg w-5 outline-purple-500 border-gray-300 bg-white",
                container: "w-full",
                characterFilled: "flex justify-center items-center text-3xl",
                characterSelected: "text-black character--selected",
              }}
            />
            <div className="mt-3">
              <button className="text-sm text-purple-600 font-medium">
                Şifremi Unuttum
              </button>
            </div>
          </div>
          <div className="mt-5 border-t pt-3">
            <button
              onClick={handleLogin}
              className={`w-full p-3 border rounded-lg font-medium text-gray-50  ${
                password.length === 6 ? "bg-purple-800" : "bg-gray-400"
              }`}
            >
              Giriş
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
