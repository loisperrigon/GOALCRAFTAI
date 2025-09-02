"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Chrome } from "lucide-react"

export function SignInButton() {
  return (
    <Button
      onClick={() => signIn("google", { callbackUrl: "/objectives" })}
      className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300"
    >
      <Chrome className="mr-2 h-5 w-5" />
      Continuer avec Google
    </Button>
  )
}