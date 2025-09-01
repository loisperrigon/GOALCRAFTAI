"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Brain } from "lucide-react"

interface LoaderProps {
  className?: string
  size?: "sm" | "md" | "lg"
  text?: string
  fullScreen?: boolean
}

export function Loader({ className, size = "md", text, fullScreen = false }: LoaderProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16"
  }

  const dotSizeClasses = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-3 h-3"
  }


  const LoaderContent = () => (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      {/* React Flow style spinner */}
      <div className={cn("relative", sizeClasses[size])}>
        {/* Outer ring */}
        <div className={cn(
          "absolute inset-0 rounded-full",
          "border-2 border-purple-500/20"
        )} />
        
        {/* Animated gradient ring */}
        <motion.div
          className={cn(
            "absolute inset-0 rounded-full",
            "border-2 border-transparent",
            "border-t-purple-500 border-r-blue-500"
          )}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        {/* Center brain icon */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ 
            scale: [0.8, 1.1, 1],
            opacity: 1
          }}
          transition={{
            scale: {
              duration: 0.5,
              ease: "easeOut"
            },
            opacity: {
              duration: 0.3
            }
          }}
        >
          <Brain className={cn(
            "text-purple-400",
            size === "sm" ? "w-3 h-3" : size === "md" ? "w-5 h-5" : "w-7 h-7"
          )} />
        </motion.div>
      </div>

      {/* Loading text */}
      {text && (
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-muted-foreground font-medium"
        >
          {text}
        </motion.p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      >
        <LoaderContent />
      </motion.div>
    )
  }

  return <LoaderContent />
}

// Export a simple spinner version
export function Spinner({ className, size = "sm" }: Omit<LoaderProps, "text" | "fullScreen">) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  }

  return (
    <motion.div
      className={cn(
        "relative inline-block",
        sizeClasses[size],
        className
      )}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }}
    >
      <div className={cn(
        "absolute inset-0 rounded-full",
        "border-2 border-purple-500/20"
      )} />
      <div className={cn(
        "absolute inset-0 rounded-full",
        "border-2 border-transparent",
        "border-t-purple-500 border-r-blue-500"
      )} />
    </motion.div>
  )
}