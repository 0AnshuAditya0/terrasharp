"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 380);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      className={[
        "fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-[#72c8ee]/35 bg-[#061323]/85 backdrop-blur-md text-[#8de6ff] transition-all duration-300 sm:bottom-8 sm:right-8",
        "hover:border-[#8de6ff] hover:bg-[#0b2947] hover:text-white hover:-translate-y-1 active:translate-y-0",
        visible
          ? "pointer-events-auto opacity-100 translate-y-0"
          : "pointer-events-none opacity-0 translate-y-4",
      ].join(" ")}
    >
      <ArrowUp size={18} strokeWidth={2.2} />
    </button>
  );
}
