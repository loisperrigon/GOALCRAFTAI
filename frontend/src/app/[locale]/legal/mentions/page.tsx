import { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Info } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Mentions Légales - GoalCraftAI',
  description: 'Mentions légales et informations juridiques de GoalCraftAI',
}

export default function MentionsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
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
              <Info className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Mentions Légales</h1>
              <p className="text-sm text-muted-foreground">Dernière mise à jour : Août 2024</p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Éditeur du site</h2>
              <div className="text-muted-foreground space-y-1">
                <p><strong>Raison sociale :</strong> GoalCraftAI SAS</p>
                <p><strong>Capital social :</strong> 10 000 €</p>
                <p><strong>Siège social :</strong> 123 Avenue des Champs-Élysées, 75008 Paris, France</p>
                <p><strong>RCS :</strong> Paris B 123 456 789</p>
                <p><strong>TVA Intracommunautaire :</strong> FR 12 345678901</p>
                <p><strong>Email :</strong> <a href="mailto:contact@goalcraftai.com" className="text-purple-400 hover:text-purple-300">contact@goalcraftai.com</a></p>
                <p><strong>Téléphone :</strong> +33 1 23 45 67 89</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Directeur de publication</h2>
              <div className="text-muted-foreground space-y-1">
                <p><strong>Nom :</strong> Jean Dupont</p>
                <p><strong>Qualité :</strong> Président Directeur Général</p>
                <p><strong>Contact :</strong> <a href="mailto:direction@goalcraftai.com" className="text-purple-400 hover:text-purple-300">direction@goalcraftai.com</a></p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Hébergement</h2>
              <div className="text-muted-foreground space-y-1">
                <p><strong>Hébergeur :</strong> Vercel Inc.</p>
                <p><strong>Adresse :</strong> 440 N Barranca Ave #4133, Covina, CA 91723, USA</p>
                <p><strong>Site web :</strong> <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">vercel.com</a></p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Propriété intellectuelle</h2>
              <p className="text-muted-foreground">
                L&apos;ensemble de ce site relève de la législation française et internationale sur le droit d&apos;auteur 
                et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour 
                les documents téléchargeables et les représentations iconographiques et photographiques.
              </p>
              <p className="text-muted-foreground mt-2">
                La reproduction de tout ou partie de ce site sur un support électronique quel qu&apos;il soit est 
                formellement interdite sauf autorisation expresse du directeur de la publication.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Protection des données personnelles</h2>
              <p className="text-muted-foreground">
                Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi 
                « Informatique et Libertés » du 6 janvier 1978 modifiée, vous disposez d&apos;un droit d&apos;accès, 
                de rectification, de suppression et d&apos;opposition aux données vous concernant.
              </p>
              <p className="text-muted-foreground mt-2">
                <strong>Délégué à la Protection des Données (DPO) :</strong>
              </p>
              <div className="text-muted-foreground ml-4 mt-1">
                <p>Email : <a href="mailto:dpo@goalcraftai.com" className="text-purple-400 hover:text-purple-300">dpo@goalcraftai.com</a></p>
                <p>Courrier : DPO GoalCraftAI, 123 Avenue des Champs-Élysées, 75008 Paris</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Cookies</h2>
              <p className="text-muted-foreground">
                Ce site utilise des cookies pour améliorer l&apos;expérience utilisateur. En continuant à naviguer 
                sur ce site, vous acceptez notre utilisation des cookies conformément à notre 
                <Link href="/legal/privacy" className="text-purple-400 hover:text-purple-300 mx-1">
                  politique de confidentialité
                </Link>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Crédits</h2>
              <div className="text-muted-foreground space-y-2">
                <p><strong>Conception et développement :</strong> Équipe GoalCraftAI</p>
                <p><strong>Design UI/UX :</strong> Studio Design GoalCraftAI</p>
                <p><strong>Technologies utilisées :</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Next.js 15 (Framework React)</li>
                  <li>TypeScript</li>
                  <li>Tailwind CSS v4</li>
                  <li>OpenAI GPT-4 (Intelligence Artificielle)</li>
                  <li>MongoDB (Base de données)</li>
                  <li>Stripe (Paiements)</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Conditions d&apos;utilisation</h2>
              <p className="text-muted-foreground">
                L'utilisation de ce site implique l&apos;acceptation pleine et entière des 
                <Link href="/legal/terms" className="text-purple-400 hover:text-purple-300 mx-1">
                  conditions générales d&apos;utilisation
                </Link>
                décrites dans nos CGU. Ces conditions sont susceptibles d&apos;être modifiées ou complétées 
                à tout moment.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Litiges</h2>
              <p className="text-muted-foreground">
                Les présentes mentions légales sont régies par le droit français. En cas de litige et 
                après échec de toute tentative de recherche d&apos;une solution amiable, les tribunaux français 
                seront seuls compétents pour connaître de ce litige.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Contact</h2>
              <p className="text-muted-foreground">
                Pour toute question concernant ces mentions légales ou notre service :
              </p>
              <div className="text-muted-foreground ml-4 mt-2 space-y-1">
                <p>Email : <a href="mailto:legal@goalcraftai.com" className="text-purple-400 hover:text-purple-300">legal@goalcraftai.com</a></p>
                <p>Téléphone : +33 1 23 45 67 89</p>
                <p>Adresse : 123 Avenue des Champs-Élysées, 75008 Paris, France</p>
              </div>
            </section>
          </div>
        </Card>
      </div>

      <Footer />
    </div>
  )
}