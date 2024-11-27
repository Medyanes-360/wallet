"use client";
import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";

export default function Tabs({selected, setSelected}) {
  const containerRef = useRef(null);
  const [tabWidth, setTabWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        // Container'ın genişliğini alıp 3'e bölüyoruz
        const width = containerRef.current.offsetWidth / 3;
        setTabWidth(width);
      }
    };

    // Sayfa yüklendiğinde ve her pencere yeniden boyutlandırıldığında güncelle
    window.addEventListener("resize", handleResize);
    handleResize(); // İlk render sonrası genişliği hesapla
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Pozisyonları tutan yapı, pixel bazlı
  const positions = {
    Tümü: 0,
    Gelen: tabWidth,
    Giden: tabWidth * 2,
  };

  return (
    <div
      ref={containerRef}
      className="relative flex justify-around w-full max-w-[304px] md:max-w-[600px] border items-center mx-auto bg-gray-200 py-2 rounded-lg"
      // Mobilde 303px, masaüstünde 604.5px genişlikte
    >
      {/* Beyaz arka planı hareket ettiren element */}
      <motion.div
        className={`absolute bg-white rounded-lg py-4 ${selected==="Tümü" ? "translate-x-1" : ("")}`}
        style={{ width: `${tabWidth-8}px` }} // Tab'ın genişliğine göre ayarlanmış width
        animate={{
          left: `${positions[selected]}px`, // Pozisyona göre animasyon
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }} // Animasyon ayarları
      />

      {/* Tümü Butonu */}
      <button
        className={`tab-item relative z-10 ${
          selected === "Tümü" ? "text-purple-600 font-medium" : "text-gray-500"
        }`}
        onClick={() => setSelected("Tümü")}
      >
        Tümü
      </button>

      {/* Gelen Butonu */}
      <button
        className={`tab-item relative z-10 ${
          selected === "Gelen" ? "text-purple-600 font-medium" : "text-gray-500"
        }`}
        onClick={() => setSelected("Gelen")}
      >
        Gelen
      </button>

      {/* Giden Butonu */}
      <button
        className={`tab-item relative z-10 ${
          selected === "Giden" ? "text-purple-600 font-medium" : "text-gray-500"
        }`}
        onClick={() => setSelected("Giden")}
      >
        Giden
      </button>
    </div>
  );
}
