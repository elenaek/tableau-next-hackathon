"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const SparklesCore = (props: {
  background?: string;
  minSize?: number;
  maxSize?: number;
  particleCount?: number;
  particleDensity?: number;
  className?: string;
  particleColor?: string;
}) => {
  const {
    background = "transparent",
    minSize = 1,
    maxSize = 3,
    particleCount = 50,
    particleColor = "#FFF",
    className,
  } = props;

  return (
    <div className={cn("absolute inset-0", className)}>
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ background }}
      >
        {[...Array(particleCount)].map((_, i) => (
          <motion.circle
            key={i}
            cx={`${Math.random() * 100}%`}
            cy={`${Math.random() * 100}%`}
            r={Math.random() * (maxSize - minSize) + minSize}
            fill={particleColor}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 2 + 1,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut",
            }}
          />
        ))}
      </svg>
    </div>
  );
};

export const Sparkles = ({
  children,
  className,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
} & React.ComponentProps<typeof SparklesCore>) => {
  return (
    <div className={cn("relative", className)}>
      <SparklesCore {...props} />
      <div className="relative z-10">{children}</div>
    </div>
  );
};