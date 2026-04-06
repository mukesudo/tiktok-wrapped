"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

type WrappedSectionProps = {
  id?: string;
  className?: string;
  theme?: "pink" | "cyan" | "green" | "sunset";
  children: React.ReactNode;
};

const THEME_CLASSES = {
  pink:
    "bg-[radial-gradient(circle_at_top,_rgba(236,72,153,0.2),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.16),_transparent_30%),linear-gradient(160deg,_rgba(14,14,14,0.98),_rgba(20,20,20,0.94))]",
  cyan:
    "bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.2),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.18),_transparent_32%),linear-gradient(160deg,_rgba(8,12,18,0.98),_rgba(14,14,14,0.95))]",
  green:
    "bg-[radial-gradient(circle_at_top,_rgba(30,215,96,0.24),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(34,211,238,0.15),_transparent_28%),linear-gradient(160deg,_rgba(9,12,10,0.98),_rgba(16,16,16,0.94))]",
  sunset:
    "bg-[radial-gradient(circle_at_top_left,_rgba(250,204,21,0.18),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(236,72,153,0.2),_transparent_28%),radial-gradient(circle_at_bottom,_rgba(34,211,238,0.12),_transparent_30%),linear-gradient(160deg,_rgba(18,18,18,0.98),_rgba(12,12,12,0.96))]"
};

function useInViewOnce(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current || inView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35, ...options }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [inView, options]);

  return { ref, inView };
}

export default function WrappedSection({
  id,
  className,
  theme = "pink",
  children
}: WrappedSectionProps) {
  const { ref, inView } = useInViewOnce({ rootMargin: "0px 0px -12% 0px" });

  return (
    <section
      id={id}
      ref={ref}
      className="snap-start px-4 py-4 md:px-6 md:py-6"
      data-slide-section
    >
      <motion.div
        className={clsx(
          "relative flex min-h-[calc(100vh-2rem)] flex-col justify-between overflow-hidden rounded-[2.5rem] border border-white/10 p-6 shadow-[0_28px_120px_rgba(0,0,0,0.4)] backdrop-blur md:min-h-[calc(100vh-3rem)] md:p-8 lg:p-10",
          THEME_CLASSES[theme],
          className
        )}
        initial={{ opacity: 0, y: 48, scale: 0.98 }}
        animate={inView ? { opacity: 1, y: 0, scale: 1 } : undefined}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),transparent_28%,transparent_72%,rgba(255,255,255,0.04))]" />
        <div className="relative z-10 flex h-full flex-1 flex-col">{children}</div>
      </motion.div>
    </section>
  );
}
