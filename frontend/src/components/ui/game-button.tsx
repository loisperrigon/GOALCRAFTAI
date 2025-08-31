"use client"

import * as React from "react"
import { Button, ButtonProps } from "@/components/ui/button"
import { useSound } from "@/hooks/useSound"
import { cn } from "@/lib/utils"

export interface GameButtonProps extends ButtonProps {
  playSound?: boolean
}

const GameButton = React.forwardRef<HTMLButtonElement, GameButtonProps>(
  ({ className, playSound = true, onClick, children, disabled, ...props }, ref) => {
    const { playClick } = useSound()

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled && playSound) {
        playClick()
      }
      if (onClick) {
        onClick(e)
      }
    }

    return (
      <Button
        ref={ref}
        className={cn(className)}
        onClick={handleClick}
        disabled={disabled}
        {...props}
      >
        {children}
      </Button>
    )
  }
)

GameButton.displayName = "GameButton"

export { GameButton }