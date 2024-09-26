"use client";
import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";

export default function Tabs() {
  const [selected, setSelected] = useState("Tümü");
  const containerRef = useRef(null);
  const [tabWidth, setTabWidth] = useState(0);

  useEffect(() => {
    if (containerRef.current) {
      // Container'ın genişliğini alıp 3'e bölüyoruz
      setTabWidth(containerRef.current.offsetWidth / 3);
    }
  }, [containerRef.current]);

  // Pozisyonları tutan yapı, pixel bazlı
  const positions = {
    Tümü: 0,
    Gelen: tabWidth,
    Giden: tabWidth * 2,
  };

  return (
    <div
      ref={containerRef}
      className="relative flex justify-around items-center space-x-4 bg-gray-100 p-4 rounded-full"
      style={{ width: "300px" }} // Örnek genişlik, istediğin gibi değiştirebilirsin
    >
      {/* Beyaz arka planı hareket ettiren element */}
      <motion.div
        className="absolute bg-white rounded-full h-full"
        style={{ width: `${tabWidth}px` }} // Her tab'ın genişliğine göre ayar
        animate={{
          left: positions[selected], // Pozisyona göre animasyon
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      />

      {/* Tümü Butonu */}
      <button
        className={`tab-item relative z-10 ${selected === "Tümü" ? "text-purple-600 font-medium" : "text-gray-500"}`}
        onClick={() => setSelected("Tümü")}
      >
        Tümü
      </button>

      {/* Gelen Butonu */}
      <button
        className={`tab-item relative z-10 ${selected === "Gelen" ? "text-purple-600 font-medium" : "text-gray-500"}`}
        onClick={() => setSelected("Gelen")}
      >
        Gelen
      </button>

      {/* Giden Butonu */}
      <button
        className={`tab-item relative z-10 ${selected === "Giden" ? "text-purple-600 font-medium" : "text-gray-500"}`}
        onClick={() => setSelected("Giden")}
      >
        Giden
      </button>
    </div>
  );
}
