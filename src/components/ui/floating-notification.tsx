"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { CheckCircle, Info, AlertCircle, X } from "lucide-react";

interface FloatingNotificationProps {
  show: boolean;
  onClose?: () => void;
  title: string;
  description?: string;
  type?: "success" | "info" | "warning" | "error";
  className?: string;
  duration?: number;
}

export const FloatingNotification = ({
  show,
  onClose,
  title,
  description,
  type = "info",
  className,
  duration = 5000,
}: FloatingNotificationProps) => {
  React.useEffect(() => {
    if (show && duration > 0 && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case "success":
        return "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800";
      case "warning":
        return "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800";
      case "error":
        return "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800";
      default:
        return "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800";
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{
            duration: 0.3,
            type: "spring",
            damping: 25,
            stiffness: 300,
          }}
          className={cn(
            "fixed bottom-4 right-4 z-50 max-w-md",
            className
          )}
        >
          <div
            className={cn(
              "rounded-lg border p-4 shadow-lg backdrop-blur-md",
              getBgColor()
            )}
          >
            <div className="flex items-start gap-3">
              {getIcon()}
              <div className="flex-1">
                <h4 className="font-semibold text-sm">{title}</h4>
                {description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {description}
                  </p>
                )}
              </div>
              {onClose && (
                <button
                  onClick={onClose}
                  className="ml-2 hover:opacity-70 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};