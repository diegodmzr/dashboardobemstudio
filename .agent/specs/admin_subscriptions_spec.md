---
description: Specification for the Admin Finances Subscriptions (Abonnements) feature.
---

# Admin Finance: Gestion des Abonnements Récurrents

## Objectif Global
Créer un système de gestion des abonnements récurrents (contrats de maintenance, services mensuels) intégré avec Stripe Subscriptions. Le système permettra de créer, suivre et gérer les abonnements automatiques.

## 1. Modélisation des Données (Prisma)

Nouveau modèle `Subscription` pour suivre les abonnements Stripe.

```prisma
model Subscription {
  id                  String   @id @default(cuid())
  
  // Stripe IDs
  stripeSubscriptionId String  @unique
  stripeCustomerId     String
  stripePriceId        String
  stripeProductId      String?
  
  // Status
  status              String   // active, canceled, past_due, unpaid, incomplete
  
  // Billing
  amount              Float    // Monthly/Yearly amount
  currency            String   @default("EUR")
  interval            String   // month, year
  intervalCount       Int      @default(1)
  
  // Dates
  currentPeriodStart  DateTime
  currentPeriodEnd    DateTime
  canceledAt          DateTime?
  endedAt             DateTime?
  
  // Relations
  clientId            String
  client              User     @relation(fields: [clientId], references: [id])
  projectId           String?
  project             Project? @relation(fields: [projectId], references: [id])
  
  metadata            String?  // JSON for extra info
  
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}
```

## 2. Interface Utilisateur (UI)

### A. Listing Page (`/admin/dashboard/finances/abonnements`)
- **Cards KPI (Top)** :
  - Revenus Récurrents Mensuels (MRR).
  - Abonnements Actifs.
  - Taux de Churn (annulations).
- **Tableau** :
  - Colonnes : Client, Produit, Montant/Mois, Statut, Prochaine Facturation, Actions.
  - **Styles** :
    - `active` : Vert.
    - `past_due` : Orange (paiement en retard).
    - `canceled` : Gris (annulé).
- **Filtres** :
  - Statut (Actif/Annulé/En retard).
  - Client.

### B. Création d'Abonnement (Drawer)
- **Sélection** :
  - Client (obligatoire).
  - Produit Stripe (liste des produits récurrents depuis Stripe API).
  - Projet lié (optionnel).
- **Action** :
  - Génère un lien Stripe Checkout en mode `subscription`.
  - Le client entre sa CB → Abonnement activé automatiquement.

### C. Détail Abonnement (Drawer)
- **Infos** : Client, Montant, Période, Prochaine facturation.
- **Actions** :
  - **Annuler l'abonnement** (bouton rouge).
  - **Voir dans Stripe** (lien externe).

## 3. Endpoints API

### `GET /api/subscriptions`
- Récupère la liste des abonnements avec stats (MRR, count actifs).

### `POST /api/subscriptions/create-session`
- Crée une Stripe Checkout Session en mode `subscription`.
- Paramètres : `clientId`, `priceId`, `projectId` (optionnel).

### `POST /api/subscriptions/cancel`
- Annule un abonnement existant.
- Paramètres : `subscriptionId`.

### Webhook `/api/webhooks/stripe` (Extension)
Écoute de nouveaux événements :
- `customer.subscription.created` → Créer l'abonnement en DB.
- `customer.subscription.updated` → Mettre à jour le statut.
- `customer.subscription.deleted` → Marquer comme annulé.
- `invoice.payment_succeeded` → Créer un `Payment` pour chaque paiement mensuel.
- `invoice.payment_failed` → Alerter (optionnel).

## 4. Produits Stripe (Configuration manuelle)

**Action requise de l'utilisateur** :
1. Aller dans [Stripe Dashboard > Produits](https://dashboard.stripe.com/test/products).
2. Créer les produits récurrents :
   - Ex: "Maintenance Premium" → 30€/mois
   - Ex: "Maintenance Standard" → 15€/mois
3. Noter les **Price IDs** (ex: `price_xxxxx`).

## 5. Acceptance Criteria
- [ ] Je peux créer un abonnement depuis le dashboard.
- [ ] Le client reçoit un lien et entre sa CB.
- [ ] L'abonnement apparaît comme "Actif" dans ma liste.
- [ ] Les paiements mensuels sont enregistrés automatiquement dans "Paiements".
- [ ] Je peux annuler un abonnement manuellement.
- [ ] Je vois le MRR (Monthly Recurring Revenue) en haut de page.
