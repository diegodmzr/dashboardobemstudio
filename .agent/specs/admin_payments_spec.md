---
description: Specification for the Admin Finances Payments page.
---

# Admin Finance: Gestion des Paiements

## Objectif Global
Créer une interface centralisée pour le suivi et la gestion de tous les paiements (Stripe principalement, mais aussi virement/manuel). L'objectif est d'avoir une vision claire de la trésorerie et des retards.

## 1. Modélisation des Données (Prisma)

Mise à jour du modèle `Payment` pour supporter les données Stripe et les relations projets.

```prisma
model Payment {
  id              String   @id @default(cuid())
  amount          Float
  currency        String   @default("EUR")
  status          String   // PENDING, PAID, LATE, FAILED, REFUNDED
  method          String?  // CARD, TRANSFER, SEPA, MANUAL
  
  // Dates
  dueDate         DateTime?
  paidAt          DateTime?
  
  // Stripe Specifics
  stripePaymentId String?  @unique // intent_id or charge_id
  stripeInvoiceId String?
  invoiceUrl      String?  // hosted_invoice_url from Stripe
  
  // Relations
  clientId        String
  client          User     @relation(fields: [clientId], references: [id])
  projectId       String?
  project         Project? @relation(fields: [projectId], references: [id])
  
  metadata        String?  // JSON for extra info
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

## 2. Interface Utilisateur (UI)

### A. Listing Page (`/admin/dashboard/finances/paiements`)
- **Cards KPI (Top)** :
  - Total Encaissé (Mois en cours).
  - En attente / À venir.
  - Retards (Rouge clignotant ou alerte).
- **Tableau** :
  - Colonnes : Client, Projet, Montant, Date (Prévue/Payée), Méthode, Statut (Pill), Actions.
  - **Styles** :
    - `PAID` : Vert succès.
    - `PENDING` : Gris neutre.
    - `LATE` : Badge Rouge "En retard" + highlight row.
    - `FAILED` : Rouge erreur.
- **Filtres** :
  - Période (Mois/Année/Custom).
  - Statut.
  - Client / Projet.

### B. Détail Paiement (Drawer)
- **Header** : Montant énorme, Statut, ID transaction.
- **Infos** : Client, Projet lié, Date d'échéance.
- **Stripe** : Lien vers la facture originale ("Voir facture"), ID Payment Intent.
- **Actions** :
  - Si `LATE` ou `PENDING` : Bouton "Envoyer une relance" (Email pré-rédigé).
  - Si `MANUAL` : Bouton "Marquer comme payé".

## 3. Endpoints API

### `GET /api/payments`
- Récupère la liste filtrée.
- Inclut une propriété `stats` dans la réponse pour les KPI (ou endpoint séparé `/api/payments/stats`).

### `POST /api/payments/reminder`
- Envoie un email de relance au client pour un paiement spécifique.

### `POST /api/webhooks/stripe` (Hors Scope Immédiat mais prévu)
- Écoute `invoice.paid`, `invoice.payment_failed` pour mettre à jour la DB automatiquement.

## 4. Automation & Relances
- **Question à valider** : Veux-tu que les relances soient 100% automatiques (Cron) ou manuelles au clic (recommandé pour v1) ?
  - *Choix V1* : Manuelle au clic ("Push to remind").

## 5. Acceptance Criteria
- [ ] Je vois la liste de tous les paiements avec le statut correct.
- [ ] Je peux identifier rapidement les paiements en retard.
- [ ] Je peux filtrer par client pour voir l'historique d'un compte.
- [ ] Je peux marquer manuellement un paiement comme "Payé" si reçu par virement.
- [ ] Je peux cliquer sur "Relancer" pour envoyer un mail doup au client.
