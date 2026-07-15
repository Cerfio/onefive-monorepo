"use client";

import { useEffect, useRef, useState } from "react";

type Slide = { key: string; text: string };

/**
 * Hero pill that cycles through short messages, matching the onestore badge.
 *
 * Slides share one grid cell so the pill is sized to the widest message and
 * holds its width while the text rotates — otherwise it would resize on every
 * transition and shove the heading around.
 */
export function RotatingBadge({
  slides,
  className = "",
}: {
  slides: Slide[];
  className?: string;
}) {
  const [i, setI] = useState(0);
  const paused = useRef(false);
  const count = slides.length;

  useEffect(() => {
    if (count < 2) return;
    const id = setInterval(() => {
      if (!paused.current) setI((p) => (p + 1) % count);
    }, 3600);
    return () => clearInterval(id);
  }, [count]);

  return (
    <div
      // The rotator is aria-hidden and the label lives here, so a screen
      // reader announces one message instead of reading all of them at once.
      aria-label={slides[i]?.text}
      role="status"
      onMouseEnter={() => {
        paused.current = true;
      }}
      onMouseLeave={() => {
        paused.current = false;
      }}
      className={`inline-flex items-center rounded-full border border-[#E8E8EA] bg-white px-3.5 py-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-px hover:border-[#DCDCDF] hover:shadow-[0_2px_10px_-2px_rgba(0,0,0,0.1)] ${className}`}
    >
      <span className="grid items-center justify-items-center" aria-hidden="true">
        {slides.map((s, idx) => (
          <span
            key={s.key}
            className={`col-start-1 row-start-1 inline-flex items-center gap-[7px] whitespace-nowrap text-xs font-medium tracking-[-0.01em] text-gray-600 transition-[opacity,transform] duration-500 motion-reduce:transform-none motion-reduce:duration-300 ${
              idx === i ? "translate-y-0 opacity-100" : "translate-y-[5px] opacity-0"
            }`}
          >
            <span className="size-1.5 shrink-0 animate-[onefive-pulse-dot_1.6s_ease-in-out_infinite] rounded-full bg-[#34C759] shadow-[0_0_0_4px_rgba(52,199,89,0.16)] motion-reduce:animate-none" />
            <span>{s.text}</span>
          </span>
        ))}
      </span>
    </div>
  );
}
