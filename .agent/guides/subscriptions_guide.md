# Guide : Gestion des Abonnements Récurrents (Stripe Subscriptions)

## 🎯 Vue d'ensemble

Vous pouvez maintenant créer et gérer des **abonnements récurrents automatiques** pour vos contrats de maintenance ou services mensuels/annuels. Stripe s'occupe de tout :
- Prélèvements automatiques chaque mois/an
- Réessais en cas d'échec de paiement
- Facturation automatique
- Notifications par email

---

## 📝 Étape 1 : Créer vos Produits dans Stripe

Avant de créer un abonnement dans votre interface, vous devez **configurer les produits récurrents dans Stripe Dashboard**.

### Instructions :
1. Allez sur [Stripe Dashboard > Produits](https://dashboard.stripe.com/test/products)
2. Cliquez sur **"Ajouter un produit"**
3. Remplissez :
   - **Nom** : Ex: "Maintenance Premium"
   - **Prix** : `30 EUR`
   - **Type** : Sélectionnez **"Récurrent"**
   - **Période de facturation** : Mensuel (ou Annuel)
4. Cliquez sur **"Enregistrer le produit"**

### Important :
5. Copiez le **Price ID** généré (ex: `price_1ABC123xyz`)
   - Ce sera affiché à côté du prix dans le tableau
   - Il ressemble à `price_xxxxxxxxxxxxx`
   - **Gardez-le dans un coin**, vous en aurez besoin pour créer l'abonnement

---

## 🚀 Étape 2 : Créer un Abonnement depuis votre Dashboard

### Instructions :
1. Allez sur `/dashboard/finances/abonnements`
2. Cliquez sur **"+ Créer un abonnement"**
3. Remplissez le formulaire :
   - **Client** : Sélectionnez le client (obligatoire)
   - **Projet** : Optionnel, sélectionnez un projet lié
   - **Produit Stripe (Price ID)** : Collez le Price ID que vous avez copié dans Stripe (ex: `price_1ABC123xyz`)
4. Cliquez sur **"💳 Générer le lien d'abonnement"**
5. Le lien est **automatiquement copié** dans votre presse-papier
6. Envoyez-le au client (email, WhatsApp, SMS...)

---

## 💳 Étape 3 : Le Client s'Abonne

1. Le client clique sur le lien
2. Il arrive sur une page Stripe sécurisée
3. Il entre ses informations de carte bancaire
4. Il valide l'abonnement

### Ce qui se passe automatiquement :
✅ L'abonnement apparaît dans votre liste avec le statut **"Actif"**  
✅ Le premier paiement est enregistré dans "Paiements"  
✅ Stripe va **prélever automatiquement** le client tous les mois (ou selon la période choisie)  
✅ Chaque mois, un nouveau paiement apparaîtra dans "Paiements" (via webhook)

---

## 📊 Comprendre les Statistiques

### MRR (Monthly Recurring Revenue)
C'est votre **revenu mensuel récurrent garanti**.
- Si un client paie 30€/mois → MRR += 30€
- Si un client paie 360€/an → MRR += 30€ (360/12)
- **Seuls les abonnements actifs comptent**

**Pourquoi c'est important ?** Ça vous permet de prévoir votre chiffre d'affaires à venir.

---

## 🔴 Annuler un Abonnement

### Instructions :
1. Cliquez sur une ligne d'abonnement dans le tableau
2. Dans le drawer, cliquez sur **"Annuler l'abonnement"** (bouton rouge)
3. Confirmez

### Important :
- L'annulation prend effet **à la fin de la période déjà payée**
- Le client continue d'avoir accès jusqu'à la fin de son mois/an en cours
- Stripe ne prélèvera plus automatiquement après cette date
- Le statut passe à **"Annulé"**

---

## 🧪 Tester en Mode Test

### Carte de test Stripe :
- **Numéro** : `4242 4242 4242 4242`
- **Date d'expiration** : N'importe quelle date future (ex: `12/34`)
- **CVC** : N'importe quel 3 chiffres (ex: `123`)

### Tester un abonnement mensuel :
1. Créez un produit "Test Maintenance" à 10€/mois dans Stripe
2. Créez l'abonnement depuis votre dashboard
3. Utilisez la carte de test ci-dessus
4. L'abonnement devient actif immédiatement
5. Le premier paiement apparaît dans "Paiements"

**Note** : En mode test, vous pouvez forcer le paiement du mois suivant via le Stripe Dashboard pour tester la récurrence.

---

## ⚙️ Configuration du Webhook (Production uniquement)

Pour que les paiements mensuels automatiques soient synchronisés, assurez-vous que le webhook est configuré :

1. Allez sur [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Ajoutez un endpoint : `https://votre-domaine.com/api/webhooks/stripe`
3. Événements à écouter :
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded` ← **Très important** (crée automatiquement un Payment)
4. Copiez le **Webhook Secret** et ajoutez-le dans votre `.env` :
   ```
   STRIPE_WEBHOOK_SECRET=whsec_VotreSecret
   ```

---

## 💡 Cas d'Usage Recommandés

### Contrat de Maintenance :
- **Produit Stripe** : "Maintenance Premium"
- **Prix** : 30€/mois ou 300€/an
- **Avantage** : Revenu prévisible, automatisation complète

### Hébergement Web :
- **Produit Stripe** : "Hébergement Pro"
- **Prix** : 15€/mois
- **Avantage** : Plus besoin de relancer les clients

### Support Technique :
- **Produit Stripe** : "Support Prioritaire"
- **Prix** : 50€/mois
- **Avantage** : Revenus garantis, le client reste engagé

---

## 🆘 Dépannage

### L'abonnement n'apparaît pas après paiement
→ Vérifiez que le webhook est bien configuré et que les événements `customer.subscription.created` et `invoice.payment_succeeded` sont activés.

### Le client veut changer de carte bancaire
→ Donnez-lui accès au [Stripe Customer Portal](https://stripe.com/docs/customer-management) où il peut gérer lui-même son abonnement.

### Je veux changer le prix d'un abonnement existant
→ Créez un nouveau Price ID dans Stripe, puis mettez à jour l'abonnement via le Stripe Dashboard (impossible depuis l'interface pour éviter les erreurs).

---

Voilà ! Vous êtes prêt à gérer des abonnements récurrents automatiques 🎉
