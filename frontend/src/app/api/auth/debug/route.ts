import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    // Récupérer la session actuelle
    const session = await auth()
    
    console.log("[Debug Auth] Session actuelle:", session)
    
    return NextResponse.json({
      success: true,
      session: session || null,
      isAuthenticated: !!session,
      user: session?.user || null,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("[Debug Auth] Erreur:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
      timestamp: new Date().toISOString()
    })
  }
}