import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Signin() {
  const [showCaret, setShowCaret] = useState(false);
  const [password,setPassword] = useState("")
  // Butona tıklanınca caret göstermek için state'i güncelle
  const handleButtonClick = () => {
    setShowCaret(true);
    // Caret'i bir süre sonra gizle
    setTimeout(() => setShowCaret(false), 2000);
  };

  return (
    <div className="h-screen border-2 border-red-500 flex justify-center">
      <div className="border  rounded-lg h-96 w-96 mt-16">
        <div className="bg-gradient-to-r border-t rounded-lg from-white via-purple-100 to-purple-200 p-4">
          Cüzdan Girişi
        </div>
        <div className="px-10 py-2">
          <div>Merhaba Kullanıcı</div>
          <div>cüzdana giriş yapmak için lütfen şifreni gir.</div>
        </div>
        <div className="px-10 mt-4">
          <button className="mb-5 text-sm">Şifre</button>
          <div className="grid grid-cols-6 gap-x-3">
            <button
              className="border p-6 rounded-lg"
              onClick={handleButtonClick}
            >
              <AnimatePresence>
                {showCaret && (
                  <motion.div
                    className="w-[1px] h-3 bg-black"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: [1, 0],
                      transition: { repeat: Infinity, duration: 0.6 },
                    }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </AnimatePresence>
            </button>
            <button
              className="border p-6 rounded-lg"
              onClick={handleButtonClick}
            >
              <AnimatePresence>
                {showCaret && (
                  <motion.div
                    className="w-[1px] h-3 bg-black"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: [1, 0],
                      transition: { repeat: Infinity, duration: 0.6 },
                    }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </AnimatePresence>
            </button>
            <button
              className="border p-6 rounded-lg"
              onClick={handleButtonClick}
            >
              <AnimatePresence>
                {showCaret && (
                  <motion.div
                    className="w-[1px] h-3 bg-black"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: [1, 0],
                      transition: { repeat: Infinity, duration: 0.6 },
                    }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </AnimatePresence>
            </button>
            <button
              className="border p-6 rounded-lg"
              onClick={handleButtonClick}
            >
              <AnimatePresence>
                {showCaret && (
                  <motion.div
                    className="w-[1px] h-3 bg-black"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: [1, 0],
                      transition: { repeat: Infinity, duration: 0.6 },
                    }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </AnimatePresence>
            </button>
            <button
              className="border p-6 rounded-lg"
              onClick={handleButtonClick}
            >
              <AnimatePresence>
                {showCaret && (
                  <motion.div
                    className="w-[1px] h-3 bg-black"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: [1, 0],
                      transition: { repeat: Infinity, duration: 0.6 },
                    }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </AnimatePresence>
            </button>
            <button
              className="border p-6 rounded-lg"
              onClick={handleButtonClick}
            >
              <AnimatePresence>
                {showCaret && (
                  <motion.div
                    className="w-[1px] h-3 bg-black"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: [1, 0],
                      transition: { repeat: Infinity, duration: 0.6 },
                    }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </AnimatePresence>
            </button>
          </div>
          <div className="mt-3">
            <button className="text-sm text-purple-600 font-medium">
              Şifremi Unuttum
            </button>
          </div>
          <div className="mt-5 border-t pt-3">
            <button className="w-full p-3 border rounded-lg bg-gray-400 text-gray-50">
              Giriş
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
