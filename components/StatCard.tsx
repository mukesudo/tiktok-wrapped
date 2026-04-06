"use client";

import { motion } from "framer-motion";
import clsx from "clsx";

const ACCENTS = {
  pink: "from-pink-500/25 via-fuchsia-500/10 to-transparent",
  cyan: "from-cyan-400/25 via-sky-500/10 to-transparent"
};

type StatCardProps = {
  label: string;
  value: string | number;
  accent?: keyof typeof ACCENTS;
  highlight?: boolean;
  pulse?: boolean;
  className?: string;
};

export default function StatCard({
  label,
  value,
  accent = "pink",
  highlight = false,
  pulse = false,
  className
}: StatCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
      className={clsx(
        "relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur",
        className
      )}
    >
      <div
        className={clsx(
          "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300",
          highlight && "opacity-100"
        )}
      >
        <div
          className={clsx(
            "h-full w-full bg-gradient-to-br blur-xl animate-pulse-glow",
            ACCENTS[accent]
          )}
        />
      </div>

      {pulse && (
        <div className="absolute right-4 top-4 flex h-6 items-end gap-1">
          {[0, 1, 2, 3].map((idx) => (
            <span
              key={idx}
              className="h-full w-1.5 rounded-full bg-pink-400/90 animate-bar-dance"
              style={{ animationDelay: `${idx * 0.15}s` }}
            />
          ))}
        </div>
      )}

      <p className="text-sm uppercase tracking-[0.2em] text-gray-400">
        {label}
      </p>
      <p className="relative mt-3 text-3xl font-semibold text-white">{value}</p>
    </motion.div>
  );
}
