import { Metadata } from 'next'
import HeaderServer from '@/components/HeaderServer'
import Footer from '@/components/Footer'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, FileText } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Conditions Générales d\'Utilisation - GoalCraftAI',
  description: 'Conditions générales d\'utilisation de la plateforme GoalCraftAI',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <HeaderServer locale="fr" translations={{ home: 'Accueil', pricing: 'Tarifs', login: 'Se connecter' }} />
      
      <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/">
          <Button variant="ghost" className="mb-6 hover:bg-purple-500/10">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </Link>

        <Card className="p-8 bg-card/50 backdrop-blur border-purple-500/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Conditions Générales d&apos;Utilisation</h1>
              <p className="text-sm text-muted-foreground">Dernière mise à jour : Août 2024</p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Acceptation des conditions</h2>
              <p className="text-muted-foreground">
                En utilisant GoalCraftAI, vous acceptez d&apos;être lié par ces conditions d&apos;utilisation. 
                Si vous n&apos;acceptez pas ces conditions, veuillez ne pas utiliser notre service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Description du service</h2>
              <p className="text-muted-foreground">
                GoalCraftAI est une plateforme de gamification d&apos;objectifs personnels utilisant l&apos;intelligence artificielle 
                pour créer des parcours personnalisés et structurés. Le service comprend :
              </p>
              <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1">
                <li>Génération de parcours d&apos;objectifs par IA</li>
                <li>Système de progression gamifié</li>
                <li>Coaching personnalisé (plan Premium)</li>
                <li>Suivi de progression et statistiques</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Inscription et compte utilisateur</h2>
              <p className="text-muted-foreground">
                Pour utiliser certaines fonctionnalités, vous devez créer un compte. Vous êtes responsable de :
              </p>
              <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1">
                <li>Fournir des informations exactes et à jour</li>
                <li>Maintenir la confidentialité de votre mot de passe</li>
                <li>Toute activité effectuée sous votre compte</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Utilisation acceptable</h2>
              <p className="text-muted-foreground mb-2">Vous vous engagez à ne pas :</p>
              <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1">
                <li>Utiliser le service à des fins illégales</li>
                <li>Tenter de contourner les limites du service</li>
                <li>Partager votre compte avec des tiers</li>
                <li>Utiliser l&apos;IA pour générer du contenu inapproprié</li>
                <li>Perturber ou surcharger nos serveurs</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Abonnement Premium</h2>
              <p className="text-muted-foreground">
                L&apos;abonnement Premium offre des fonctionnalités supplémentaires. Les paiements sont :
              </p>
              <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1">
                <li>Récurrents (mensuel ou annuel)</li>
                <li>Non remboursables après 30 jours</li>
                <li>Annulables à tout moment</li>
                <li>Traités de manière sécurisée via Stripe</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Propriété intellectuelle</h2>
              <p className="text-muted-foreground">
                Tout le contenu de GoalCraftAI (design, code, textes) est notre propriété. 
                Vos données et objectifs personnels restent votre propriété exclusive.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Limitation de responsabilité</h2>
              <p className="text-muted-foreground">
                GoalCraftAI est fourni &quot;tel quel&quot;. Nous ne garantissons pas que le service sera 
                ininterrompu ou exempt d&apos;erreurs. Notre responsabilité est limitée au montant 
                que vous avez payé pour le service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Modifications</h2>
              <p className="text-muted-foreground">
                Nous nous réservons le droit de modifier ces conditions à tout moment. 
                Les modifications entrent en vigueur dès leur publication sur cette page.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Contact</h2>
              <p className="text-muted-foreground">
                Pour toute question concernant ces conditions, contactez-nous à : 
                <a href="mailto:legal@goalcraftai.com" className="text-purple-400 hover:text-purple-300 ml-1">
                  legal@goalcraftai.com
                </a>
              </p>
            </section>
          </div>
        </Card>
      </div>

      <Footer />
    </div>
  )
}