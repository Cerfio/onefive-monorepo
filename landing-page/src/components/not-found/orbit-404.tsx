"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

// The homepage hero orbits the same four members around the product. Here the
// middle is empty, which is the whole point: the network is intact, the page is
// not. Angles, avatars and the ~50s linear sweep are taken from the hero so the
// two read as one system rather than two takes on a circle.
const MEMBERS = [
  { angle: 45, title: "Founder", color: "bg-[#007A5A]", image: "/alisa-hester.png" },
  { angle: 100, title: "VC", color: "bg-[#4489B5]", image: "/nicolas-wang.png" },
  { angle: 269, title: "Mentor", color: "bg-[#BF5B8D]", image: "/katy-fuller.png" },
  { angle: 353, title: "BA", color: "bg-[#4489B5]", image: "/jackson-reed.png" },
];

// The hero hardcodes 720/1020/1320px and relies on the page clipping the
// overflow. A 404 has no such luxury — it must hold at 320px — so the rings are
// fractions of one responsive box and the avatars are placed with calc() off
// the same variable.
const RINGS = [
  { scale: 1, duration: 54 },
  { scale: 0.72, duration: 50 },
  { scale: 0.44, duration: 58 },
];

export function Orbit404() {
  const reduceMotion = useReducedMotion();

  return (
    <div
      aria-hidden
      className="relative grid place-items-center"
      style={
        {
          "--orbit": "clamp(230px, 66vw, 420px)",
          "--radius": "calc(var(--orbit) / 2)",
          width: "var(--orbit)",
          height: "var(--orbit)",
          // The members are centred *on* the outer ring, so half an avatar —
          // and its label — falls outside the ring's box. Without this the
          // Founder chip lands on the heading and BA touches the viewport edge
          // at 375px. The margin reserves the space the orbit actually needs.
          margin: "28px 30px 46px",
        } as React.CSSProperties
      }
    >
      {RINGS.map((ring, i) => (
        <motion.div
          key={ring.scale}
          className="absolute rounded-full border border-gray-300/70 dark:border-gray-600/50"
          style={{
            width: `calc(var(--orbit) * ${ring.scale})`,
            height: `calc(var(--orbit) * ${ring.scale})`,
          }}
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
        />
      ))}

      {/* The empty slot. Dashed rather than solid: a gap where something was. */}
      <motion.div
        className="absolute grid place-items-center rounded-full border border-dashed border-gray-400/70 dark:border-gray-500/60"
        style={{
          width: "calc(var(--orbit) * 0.44)",
          height: "calc(var(--orbit) * 0.44)",
        }}
        initial={{ opacity: 0 }}
        animate={
          reduceMotion
            ? { opacity: 1 }
            : { opacity: 1, scale: [1, 1.035, 1] }
        }
        transition={
          reduceMotion
            ? { duration: 0.4, delay: 0.3 }
            : {
                opacity: { duration: 0.4, delay: 0.3 },
                scale: { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
              }
        }
      >
        <span className="text-4xl sm:text-5xl font-semibold tracking-[-0.04em] text-[#101828] dark:text-gray-100 tabular-nums">
          404
        </span>
      </motion.div>

      {/* Outer ring carries the members. */}
      <motion.div
        className="absolute"
        style={{ width: "var(--orbit)", height: "var(--orbit)" }}
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={
          reduceMotion
            ? undefined
            : { duration: 54, repeat: Infinity, ease: "linear" }
        }
      >
        {MEMBERS.map((member, i) => {
          const rad = (member.angle * Math.PI) / 180;
          return (
            <motion.div
              key={member.title}
              className="absolute left-1/2 top-1/2"
              style={{
                x: `calc(${Math.cos(rad).toFixed(4)} * var(--radius) - 50%)`,
                y: `calc(${Math.sin(rad).toFixed(4)} * var(--radius) - 50%)`,
              }}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.45,
                delay: 0.35 + i * 0.09,
                ease: "easeOut",
              }}
            >
              {/* Counter-rotates the ring's sweep so faces and labels stay upright. */}
              <motion.div
                className="flex flex-col items-center justify-center"
                animate={reduceMotion ? undefined : { rotate: -360 }}
                transition={
                  reduceMotion
                    ? undefined
                    : { duration: 54, repeat: Infinity, ease: "linear" }
                }
              >
                <Image
                  src={member.image}
                  alt=""
                  width={40}
                  height={40}
                  className="rounded-full border-2 border-white shadow-sm sm:h-12 sm:w-12"
                />
                <span
                  className={`${member.color} mt-1 rounded-full px-2 py-0.5 text-[10px] font-medium text-white sm:text-xs`}
                >
                  {member.title}
                </span>
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
