"use client";

import { useState, useEffect } from "react";

interface RevealTextProps {
  text?: string;
  textColor?: string;
  overlayColor?: string;
  fontSize?: string;
  letterDelay?: number;
  overlayDelay?: number;
  overlayDuration?: number;
  springDuration?: number;
  letterImages?: string[];
  className?: string;
}

export function RevealText({
  text = "TerraSharp",
  textColor = "text-white",
  overlayColor = "text-[#8de6ff]",
  fontSize = "text-[clamp(2.8rem,8.5vw,6.8rem)]",
  letterDelay = 0.07,
  overlayDelay = 0.05,
  overlayDuration = 0.45,
  springDuration = 600,
  className = "",
  letterImages = [
    "https://cdn.21st.dev/assets/mirror/0b/0b9ef6fff23ee3255a419d5ad0e5c6610d9a4e54a3441136e15f01b255594567.jpg",
    "https://cdn.21st.dev/assets/mirror/44/4481032f50f8d688268b28e49f0c1944bc9d46a9be1d8744f318483251fb4ca5.jpg",
    "https://cdn.21st.dev/assets/mirror/dc/dce249444517cd0fbadad8db875f59fd1730bd60dbd0fa1a49e4a23b58a19fd6.jpg",
    "https://cdn.21st.dev/assets/mirror/75/75be0ee67518d0db10eeea6afedad0aa6d6036fff0a3938dc2bda35f4e4333ff.jpg",
    "https://cdn.21st.dev/assets/mirror/4c/4c974d71baca0cabdb22ce7f26d11119c71be54d10a943ae94822a1ab21026ca.jpg",
    "https://cdn.21st.dev/assets/mirror/cc/ccf3cb0926c7d42b54f1a8bfc4ff63bd97a73ee71d667a1af7d2a1999b062b53.jpg",
    "https://cdn.21st.dev/assets/mirror/c5/c57bcf57be1f52e138b02dab40ba18a6a42823d9068172020eea1ac645068626.jpg",
    "https://cdn.21st.dev/assets/mirror/f4/f490732d34c74d72126780e3b77ed573fdac5b603079c2b9ffff04f0150cef6d.jpg",
  ],
}: RevealTextProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showSweep, setShowSweep] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const lastLetterDelay = (text.length - 1) * letterDelay;
    const totalDelay = lastLetterDelay * 1000 + springDuration;

    const timer = setTimeout(() => {
      setShowSweep(true);
    }, totalDelay);

    return () => clearTimeout(timer);
  }, [text.length, letterDelay, springDuration]);

  return (
    <div className={`relative inline-flex items-center select-none ${className}`}>
      <style>{`
        @keyframes revealSweep {
          0% { opacity: 0; }
          15% { opacity: 1; }
          75% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
      <div className="flex flex-wrap items-center">
        {text.split("").map((letter, index) => (
          <span
            key={index}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            className={`${fontSize} font-black tracking-[-0.04em] uppercase cursor-pointer relative overflow-hidden inline-block will-change-transform`}
            style={{
              transform: mounted ? "scale(1)" : "scale(0)",
              opacity: mounted ? 1 : 0,
              transition: `transform 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * letterDelay}s, opacity 0.4s ease ${index * letterDelay}s`,
            }}
          >
            <span
              className={`absolute inset-0 ${textColor}`}
              style={{
                opacity: hoveredIndex === index ? 0 : 1,
                transition: "opacity 0.1s ease",
              }}
            >
              {letter}
            </span>

            <span
              className="text-transparent bg-clip-text bg-cover bg-no-repeat block"
              style={{
                opacity: hoveredIndex === index ? 1 : 0,
                backgroundPosition: hoveredIndex === index ? "10% center" : "0% center",
                backgroundImage: `url('${letterImages[index % letterImages.length]}')`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                transition: "opacity 0.1s ease, background-position 3s ease-in-out",
              }}
            >
              {letter}
            </span>

            {showSweep && (
              <span
                className={`absolute inset-0 ${overlayColor} pointer-events-none`}
                style={{
                  animation: `revealSweep ${overlayDuration}s ease-in-out ${index * overlayDelay}s both`,
                }}
              >
                {letter}
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
