export async function register() {
  console.log("🚀 [Server] Démarrage du serveur Next.js...")
  
  // Initialiser MongoDB une seule fois au démarrage (côté serveur uniquement)
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Import dynamique pour éviter les erreurs de build
    const { initDatabase } = await import("@/lib/db-init")
    
    try {
      await initDatabase()
      console.log("✨ [Server] Serveur prêt avec MongoDB connecté")
    } catch (error) {
      console.error("💥 [Server] Erreur fatale au démarrage:", error)
      process.exit(1)
    }
  }
}