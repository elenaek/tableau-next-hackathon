"use client";
import React, { useRef } from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

export const AnimatedCard = ({
  children,
  className,
  containerClassName,
  animate = true,
}: {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  animate?: boolean;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const variants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mouseX.set(x);
    mouseY.set(y);
  };

  const background = useMotionTemplate`radial-gradient(150px circle at ${mouseX}px ${mouseY}px, rgba(59, 130, 246, 0.25), transparent 50%)`;
  const borderGradient = useMotionTemplate`radial-gradient(180px circle at ${mouseX}px ${mouseY}px, rgba(147, 51, 234, 0.3), rgba(59, 130, 246, 0.15) 40%, transparent 60%)`;

  if (!animate) {
    return (
      <div className={cn("", containerClassName)}>
        <div className={cn("", className)}>{children}</div>
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate="visible"
      onMouseMove={handleMouseMove}
      className={cn("relative group", containerClassName)}
    >
      {/* Thin border glow effect */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 blur transition duration-300 group-hover:opacity-100 z-0"
        style={{
          background: borderGradient,
        }}
      />

      {/* Inner accent glow that follows mouse */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100 z-0"
        style={{
          background,
        }}
      />

      {/* Card content with higher z-index */}
      <div className={cn("relative z-10 bg-card rounded-xl", className)}>{children}</div>
    </motion.div>
  );
};