import { Metadata } from 'next'
import HeaderServer from '@/components/HeaderServer'
import Footer from '@/components/Footer'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Shield } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Politique de Confidentialité - GoalCraftAI',
  description: 'Politique de confidentialité et protection des données personnelles de GoalCraftAI',
}

export default function PrivacyPage() {
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
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Politique de Confidentialité</h1>
              <p className="text-sm text-muted-foreground">Dernière mise à jour : Août 2024</p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
              <p className="text-muted-foreground">
                Chez GoalCraftAI, nous prenons très au sérieux la protection de vos données personnelles. 
                Cette politique explique comment nous collectons, utilisons et protégeons vos informations.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Données collectées</h2>
              <p className="text-muted-foreground mb-2">Nous collectons les données suivantes :</p>
              
              <h3 className="text-lg font-medium mt-4 mb-2">Données d&apos;inscription :</h3>
              <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1">
                <li>Nom et prénom</li>
                <li>Adresse email</li>
                <li>Mot de passe (chiffré)</li>
                <li>Photo de profil (optionnelle)</li>
              </ul>

              <h3 className="text-lg font-medium mt-4 mb-2">Données d&apos;utilisation :</h3>
              <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1">
                <li>Objectifs créés et progression</li>
                <li>Interactions avec l&apos;IA</li>
                <li>Statistiques de connexion</li>
                <li>Préférences utilisateur</li>
              </ul>

              <h3 className="text-lg font-medium mt-4 mb-2">Données techniques :</h3>
              <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1">
                <li>Adresse IP</li>
                <li>Type de navigateur</li>
                <li>Système d&apos;exploitation</li>
                <li>Cookies de session</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Utilisation des données</h2>
              <p className="text-muted-foreground mb-2">Vos données sont utilisées pour :</p>
              <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1">
                <li>Fournir et améliorer nos services</li>
                <li>Personnaliser votre expérience</li>
                <li>Générer des parcours d&apos;objectifs adaptés</li>
                <li>Communiquer avec vous (notifications, support)</li>
                <li>Analyser l&apos;utilisation du service (données anonymisées)</li>
                <li>Prévenir les fraudes et abus</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Partage des données</h2>
              <p className="text-muted-foreground">
                Nous ne vendons jamais vos données personnelles. Nous pouvons partager vos données avec :
              </p>
              <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1">
                <li>OpenAI (pour la génération d&apos;objectifs - données anonymisées)</li>
                <li>Stripe (pour le traitement des paiements)</li>
                <li>Services d&apos;hébergement (données chiffrées)</li>
                <li>Autorités légales (si requis par la loi)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Sécurité des données</h2>
              <p className="text-muted-foreground">Nous mettons en œuvre des mesures de sécurité robustes :</p>
              <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1">
                <li>Chiffrement SSL/TLS pour toutes les communications</li>
                <li>Chiffrement des mots de passe avec bcrypt</li>
                <li>Serveurs sécurisés avec accès restreint</li>
                <li>Audits de sécurité réguliers</li>
                <li>Authentification à deux facteurs (optionnelle)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Vos droits (RGPD)</h2>
              <p className="text-muted-foreground mb-2">Conformément au RGPD, vous avez le droit de :</p>
              <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1">
                <li>Accéder à vos données personnelles</li>
                <li>Rectifier vos données</li>
                <li>Supprimer votre compte et vos données</li>
                <li>Limiter le traitement de vos données</li>
                <li>Porter vos données vers un autre service</li>
                <li>Vous opposer au traitement</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                Pour exercer ces droits, contactez-nous à privacy@goalcraftai.com
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Cookies</h2>
              <p className="text-muted-foreground">Nous utilisons des cookies pour :</p>
              <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1">
                <li>Maintenir votre session de connexion</li>
                <li>Mémoriser vos préférences</li>
                <li>Analyser l&apos;utilisation du site (cookies analytiques)</li>
                <li>Améliorer les performances</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                Vous pouvez désactiver les cookies dans votre navigateur, mais certaines fonctionnalités pourraient ne plus fonctionner.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Conservation des données</h2>
              <p className="text-muted-foreground">
                Vos données sont conservées tant que votre compte est actif. 
                Après suppression du compte, nous conservons certaines données anonymisées pour les statistiques 
                et les données de facturation pendant la durée légale requise.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Mineurs</h2>
              <p className="text-muted-foreground">
                GoalCraftAI n&apos;est pas destiné aux personnes de moins de 16 ans. 
                Nous ne collectons pas sciemment de données de mineurs.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Modifications</h2>
              <p className="text-muted-foreground">
                Cette politique peut être mise à jour. Nous vous informerons de tout changement 
                significatif par email ou notification dans l&apos;application.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">11. Contact</h2>
              <p className="text-muted-foreground">
                Pour toute question sur vos données personnelles :
              </p>
              <ul className="list-none text-muted-foreground ml-4 space-y-1 mt-2">
                <li>Email : <a href="mailto:privacy@goalcraftai.com" className="text-purple-400 hover:text-purple-300">privacy@goalcraftai.com</a></li>
                <li>DPO : <a href="mailto:dpo@goalcraftai.com" className="text-purple-400 hover:text-purple-300">dpo@goalcraftai.com</a></li>
                <li>Adresse : GoalCraftAI, Paris, France</li>
              </ul>
            </section>
          </div>
        </Card>
      </div>

      <Footer />
    </div>
  )
}