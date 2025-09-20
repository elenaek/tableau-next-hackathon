"use client";
import React, { useRef } from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

export const AnimatedChatCard = ({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mouseX.set(x);
    mouseY.set(y);
  };

  const background = useMotionTemplate`radial-gradient(150px circle at ${mouseX}px ${mouseY}px, rgba(236, 72, 153, 0.15), transparent 50%)`;
  const borderGradient = useMotionTemplate`radial-gradient(180px circle at ${mouseX}px ${mouseY}px, rgba(236, 72, 153, 0.3), rgba(99, 102, 241, 0.15) 40%, transparent 60%)`;

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className={cn("relative group", className)}
      style={style}
    >
      {/* Thin border glow effect */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 blur transition duration-300 group-hover:opacity-100"
        style={{
          background: borderGradient,
        }}
      />

      {/* Inner accent glow that follows mouse */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background,
        }}
      />

      {/* Card content - no additional wrapper divs */}
      {children}
    </div>
  );
};