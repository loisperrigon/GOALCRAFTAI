import { signOut } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    await signOut({
      redirectTo: "/auth",
    })
  } catch (error) {
    console.error("Erreur lors de la déconnexion:", error)
    return NextResponse.json(
      { error: "Erreur lors de la déconnexion" },
      { status: 500 }
    )
  }
}