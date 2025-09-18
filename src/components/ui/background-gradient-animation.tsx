"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const BackgroundGradientAnimation = ({
  gradientBackgroundStart = "rgb(108, 0, 162)",
  gradientBackgroundEnd = "rgb(0, 17, 82)",
  firstColor = "18, 113, 255",
  // secondColor = "221, 74, 255",
  // thirdColor = "100, 220, 255",
  // fourthColor = "200, 50, 50",
  // fifthColor = "180, 180, 50",
  pointerColor = "140, 100, 255",
  size = "80%",
  blendingValue = "hard-light",
  children,
  className,
  interactive = true,
  containerClassName,
}: {
  gradientBackgroundStart?: string;
  gradientBackgroundEnd?: string;
  firstColor?: string;
  secondColor?: string;
  thirdColor?: string;
  fourthColor?: string;
  fifthColor?: string;
  pointerColor?: string;
  size?: string;
  blendingValue?: string;
  children?: React.ReactNode;
  className?: string;
  interactive?: boolean;
  containerClassName?: string;
}) => {
  const [curX, setCurX] = React.useState(0);
  const [curY, setCurY] = React.useState(0);

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCurX(e.pageX);
      setCurY(e.pageY);
    };

    if (interactive) {
      document.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      if (interactive) {
        document.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, [interactive]);

  return (
    <div
      className={cn(
        "h-full w-full relative overflow-hidden top-0 left-0 bg-[linear-gradient(40deg,var(--gradient-background-start),var(--gradient-background-end))]",
        containerClassName
      )}
      style={{
        "--gradient-background-start": gradientBackgroundStart,
        "--gradient-background-end": gradientBackgroundEnd,
      } as React.CSSProperties}
    >
      <svg className="hidden">
        <defs>
          <filter id="blurMe">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" />
          </filter>
        </defs>
      </svg>
      <div className={cn("", className)}>{children}</div>
      <motion.div
        className={cn(
          "gradients-container h-full w-full blur-lg",
          "absolute inset-0 [filter:url(#blurMe)_blur(40px)]"
        )}
        style={{
          mixBlendMode: blendingValue as React.CSSProperties['mixBlendMode'],
        }}
      >
        <motion.div
          className={cn(
            `absolute [background:radial-gradient(circle_at_center,_var(--first-color)_0,_var(--first-color)_50%)_no-repeat]`,
            `[mix-blend-mode:var(--blending-value)]`,
            `w-[var(--size)] h-[var(--size)]`,
            `top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)]`
          )}
          style={
            {
              "--first-color": `rgba(${firstColor}, 0.8)`,
              "--size": size,
              "--blending-value": blendingValue,
            } as React.CSSProperties
          }
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        {interactive && (
          <motion.div
            className={cn(
              `absolute [background:radial-gradient(circle_at_center,_rgba(var(--pointer-color),_0.8)_0,_rgba(var(--pointer-color),_0)_50%)_no-repeat]`,
              `[mix-blend-mode:var(--blending-value)]`,
              `w-52 h-52`
            )}
            style={
              {
                "--pointer-color": pointerColor,
                "--blending-value": blendingValue,
                left: curX - 104,
                top: curY - 104,
              } as React.CSSProperties
            }
          />
        )}
      </motion.div>
    </div>
  );
};