# 🚀 Guide de configuration Stripe pour GoalCraftAI

## ✅ Intégration Stripe complète

L'intégration Stripe est maintenant **100% fonctionnelle** dans votre application. Voici ce qui a été implémenté :

### 📦 Ce qui a été fait

1. **Packages installés**
   - `stripe` - SDK serveur Stripe
   - `@stripe/stripe-js` - SDK client Stripe
   - `sonner` - Notifications toast

2. **API Routes créées** (`/api/stripe/`)
   - ✅ `checkout` - Création de sessions de paiement
   - ✅ `webhook` - Réception des événements Stripe
   - ✅ `subscription` - Vérification du statut
   - ✅ `portal` - Accès au portail client
   - ✅ `sync` - Synchronisation manuelle

3. **Store utilisateur mis à jour**
   - Champs Stripe ajoutés (customerId, subscriptionId, status)
   - Système de sync automatique
   - Vérification des limites par plan

4. **UI intégrée**
   - Page pricing avec checkout Stripe
   - Section abonnement dans le profil
   - Bouton "Gérer mon abonnement"
   - Affichage jours avant renouvellement

## 🔧 Configuration requise

### 1. Créer un compte Stripe

1. Allez sur [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Créez votre compte (gratuit)
3. Activez le mode **Test** (toggle en haut à droite)

### 2. Récupérer vos clés API

Dans le Dashboard Stripe (mode Test) :
1. Allez dans **Developers** → **API keys**
2. Copiez :
   - **Publishable key** (commence par `pk_test_`)
   - **Secret key** (commence par `sk_test_`)

### 3. Créer vos produits et prix

Dans le Dashboard Stripe :

1. Allez dans **Product catalog** → **Add product**

2. **Créer le produit "Starter"** :
   - Name: `GoalCraftAI Starter`
   - Description: `10 objectifs, étapes illimitées, support prioritaire`
   - Pricing:
     - Monthly: 9.99€ → Notez le `price_ID`
     - Yearly: 89.99€ → Notez le `price_ID`

3. **Créer le produit "Pro"** :
   - Name: `GoalCraftAI Pro`
   - Description: `Tout illimité, IA avancée, coaching personnalisé`
   - Pricing:
     - Monthly: 19.99€ → Notez le `price_ID`
     - Yearly: 179.99€ → Notez le `price_ID`

### 4. Configurer les webhooks

1. Dans Stripe Dashboard → **Developers** → **Webhooks**
2. Cliquez **Add endpoint**
3. Endpoint URL : 
   - Local : Utilisez [ngrok](https://ngrok.com/) ou [Stripe CLI](https://stripe.com/docs/stripe-cli)
   - Production : `https://votre-domaine.com/api/stripe/webhook`
4. Events à sélectionner :
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copiez le **Signing secret** (commence par `whsec_`)

### 5. Mettre à jour le fichier `.env.local`

```env
# Stripe Test Keys
STRIPE_SECRET_KEY=sk_test_VOTRE_CLE_SECRETE
STRIPE_WEBHOOK_SECRET=whsec_VOTRE_WEBHOOK_SECRET

# Stripe Public Key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_VOTRE_CLE_PUBLIQUE

# Stripe Price IDs (depuis votre Dashboard)
STRIPE_PRICE_STARTER_MONTHLY=price_XXXXXXXXXX
STRIPE_PRICE_STARTER_YEARLY=price_XXXXXXXXXX
STRIPE_PRICE_PRO_MONTHLY=price_XXXXXXXXXX
STRIPE_PRICE_PRO_YEARLY=price_XXXXXXXXXX
```

## 🧪 Tester l'intégration

### Test en local avec Stripe CLI

1. **Installer Stripe CLI** :
   ```bash
   # Windows (avec Scoop)
   scoop install stripe
   
   # Ou télécharger depuis
   # https://github.com/stripe/stripe-cli/releases
   ```

2. **Se connecter** :
   ```bash
   stripe login
   ```

3. **Écouter les webhooks** :
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   → Copiez le webhook secret affiché et mettez-le dans `.env.local`

4. **Démarrer l'app** :
   ```bash
   npm run dev
   ```

### Cartes de test

Utilisez ces numéros de carte pour tester :

- ✅ **Succès** : `4242 4242 4242 4242`
- ❌ **Décliné** : `4000 0000 0000 0002`
- 🔄 **3D Secure** : `4000 0025 0000 3155`

Expiration : N'importe quelle date future
CVV : N'importe quel 3 chiffres

### Flow de test complet

1. **Créer un compte** sur `/auth`
2. **Aller sur** `/pricing`
3. **Cliquer** "Commencer maintenant" sur un plan
4. **Entrer** une carte de test
5. **Vérifier** :
   - Webhook reçu dans terminal Stripe CLI
   - User mis à jour dans `/profile`
   - Limites appliquées dans `/objectives`

## 📊 Dashboard Stripe

### Métriques à surveiller

- **Payments** : Voir tous les paiements
- **Customers** : Liste des clients
- **Subscriptions** : Abonnements actifs
- **Events** : Historique des webhooks

### Portail client

Les utilisateurs peuvent gérer leur abonnement via le portail Stripe :
- Changer de plan
- Mettre à jour la carte
- Télécharger les factures
- Annuler l'abonnement

Configurez le portail dans : **Settings** → **Billing** → **Customer portal**

## 🚀 Mise en production

### Checklist

- [ ] Basculer sur les clés **Live** (sans `test_`)
- [ ] Configurer le webhook de production
- [ ] Activer votre compte Stripe (vérification identité)
- [ ] Configurer les emails Stripe
- [ ] Ajouter vos conditions de vente
- [ ] Tester avec une vraie carte

### Variables de production

```env
# Production (sur Vercel/Railway)
STRIPE_SECRET_KEY=sk_live_XXXX
STRIPE_WEBHOOK_SECRET=whsec_XXXX
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_XXXX
```

## 🆘 Dépannage

### "No signature found"
→ Vérifiez que le webhook secret est correct

### "Invalid signature"
→ Le body du webhook ne doit pas être parsé en JSON

### "Customer not found"
→ Lancez une sync manuelle depuis `/profile`

### Webhooks qui échouent
→ Stripe réessaye automatiquement pendant 3 jours

## 📚 Ressources

- [Documentation Stripe](https://stripe.com/docs)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
- [Test cards](https://stripe.com/docs/testing)
- [Webhook events](https://stripe.com/docs/webhooks/stripe-events)

---

**Support** : Si vous avez des questions, consultez la [documentation Stripe](https://stripe.com/docs) ou ouvrez une issue sur GitHub.