"use client";

import { useEffect, useState } from "react";

interface MinimalTextRevealProps {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  highlightText?: string;
  highlightClass?: string;
}

export function MinimalTextReveal({
  text,
  className = "",
  delay = 0.35,
  stagger = 0.05,
  highlightText = "",
  highlightClass = "text-[#8de6ff]",
}: MinimalTextRevealProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const words = text.split(" ");

  return (
    <span className={`inline-block ${className}`}>
      {words.map((word, index) => {
        const isHighlight =
          highlightText &&
          word.toLowerCase().includes(highlightText.toLowerCase());

        return (
          <span
            key={index}
            className={`inline-block mr-[0.26em] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform ${
              isHighlight ? highlightClass : ""
            }`}
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(10px)",
              filter: mounted ? "blur(0px)" : "blur(6px)",
              transitionDelay: `${delay + index * stagger}s`,
            }}
          >
            {word}
          </span>
        );
      })}
    </span>
  );
}

interface MinimalParagraphRevealProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
}

export function MinimalParagraphReveal({
  text,
  className = "",
  delay = 0.65,
  duration = 900,
}: MinimalParagraphRevealProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <span
      className={`inline-block transition-all ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform ${className}`}
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(12px)",
        filter: mounted ? "blur(0px)" : "blur(4px)",
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}s`,
      }}
    >
      {text}
    </span>
  );
}
