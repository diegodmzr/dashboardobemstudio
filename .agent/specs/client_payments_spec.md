# Spécification: Mes Paiements (Client)

## Vue d'ensemble

Page simple permettant au client de **suivre tous ses paiements** et **payer ceux en retard**.

---

## Objectifs

1. ✅ Voir tous ses paiements (actifs, payés, en retard, annulés)
2. ✅ Payer les paiements en retard
3. ✅ Télécharger les factures/reçus
4. ❌ **PAS** de création de paiement
5. ❌ **PAS** d'accès aux stats MRR/abonnements

---

## UI/UX (Monochrome)

### Layout

```
┌─────────────────────────────────────────────────────────┐
│  Topbar: "Mes Paiements"                                │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  [Tabs: Tous | Payés | En retard | Annulés]            │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │ Table des paiements                             │    │
│  │ Date | Projet | Description | Montant | Statut │    │
│  │ Actions: [Voir] [Payer] [Facture]              │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Tabs (4 onglets)

1. **Tous** : Tous les paiements
2. **Payés** : `status: PAID`
3. **En retard** : `status: OVERDUE`
4. **Annulés** : `status: CANCELLED, FAILED`

### Table

**Colonnes** :
- **Date** : Date d'échéance
- **Projet** : Nom du projet lié
- **Description** : "Acompte 30%", "Solde final", etc.
- **Montant** : En EUR
- **Statut** : Badge
- **Actions** : Boutons contextuels

**Actions selon statut** :
- `PAID` : [Voir détails] [Télécharger facture]
- `OVERDUE` : [Payer maintenant] [Voir détails]
- `PENDING` : [Voir détails]
- `CANCELLED` : [Voir détails]

### Badges Statut

| Statut | Badge | Style |
|--------|-------|-------|
| Payé | `PAID` | `bg-black text-white` |
| En attente | `PENDING` | `bg-gray-200 text-gray-800` |
| En retard | `OVERDUE` | `bg-white border-2 border-black text-black` |
| Annulé | `CANCELLED` | `bg-gray-400 text-white` |
| Échoué | `FAILED` | `bg-gray-400 text-white` |

### Drawer Détails

```
┌─────────────────────────────────────┐
│  Détails du Paiement           [✕]  │
├─────────────────────────────────────┤
│                                      │
│  Projet: Mon Site E-commerce        │
│  Description: Acompte 30%           │
│                                      │
│  Montant: 1 500,00 €                │
│  Statut: [Badge]                    │
│                                      │
│  Date d'échéance: 15 janv. 2026     │
│  Date de paiement: 14 janv. 2026    │
│                                      │
│  ─────────────────────────────────  │
│                                      │
│  [Télécharger la facture]           │
│  [Voir le reçu Stripe]              │
│                                      │
│  // Si en retard:                   │
│  [💳 Payer maintenant]              │
│                                      │
└─────────────────────────────────────┘
```

---

## Fonctionnalités

### 1. Visualisation

- Liste de **tous les paiements** du client
- Filtrage par onglet (statut)
- Tri par date (plus récent en premier)

### 2. Paiement en Retard

**Workflow** :
1. Client clique "Payer maintenant"
2. Création d'un Payment Intent Stripe
3. Redirection vers Stripe Checkout
4. Webhook met à jour le statut → `PAID`
5. Retour vers `/dashboard/finances/paiements?success=true`

### 3. Téléchargement Factures

- Lien direct vers la facture Stripe (`stripeInvoiceId`)
- Ou génération PDF côté app si pas de Stripe

---

## API Endpoints

### GET /api/client/payments

**Description** : Liste des paiements du client connecté

**Query Params** :
- `status` : Filter by status (optional)

**Response** :
```json
{
  "payments": [
    {
      "id": "clx...",
      "projectId": "clx...",
      "projectName": "Mon Site",
      "description": "Acompte 30%",
      "amount": 1500.00,
      "currency": "EUR",
      "status": "PAID",
      "dueDate": "2026-01-15T00:00:00Z",
      "paidAt": "2026-01-14T10:30:00Z",
      "stripeInvoiceId": "in_...",
      "stripeReceiptUrl": "https://...",
      "createdAt": "2026-01-01T00:00:00Z"
    }
  ]
}
```

### POST /api/client/payments/[id]/pay

**Description** : Crée un Payment Intent pour payer un paiement en retard

**Response** :
```json
{
  "checkoutUrl": "https://checkout.stripe.com/..."
}
```

---

## Composants

```
app/(admin)/dashboard/finances/paiements/
  └─ page.tsx (Server - role check)

components/client/
  ├─ ClientPaymentsClient.tsx (Main)
  ├─ PaymentRow.tsx (Table row)
  └─ PaymentDrawer.tsx (Details)
```

---

## Sécurité

1. ✅ Client ne voit que **SES** paiements
2. ✅ Vérification ownership avant paiement
3. ✅ Pas de création/modification de paiements
4. ✅ Lecture seule sauf "Payer"

---

## Différences avec Admin

| Fonctionnalité | Admin | Client |
|----------------|-------|--------|
| Voir tous les paiements | ✅ Tous | ✅ Siens uniquement |
| Créer un paiement | ✅ | ❌ |
| Modifier un paiement | ✅ | ❌ |
| Payer un paiement | ❌ | ✅ |
| Stats MRR | ✅ | ❌ |
| Abonnements | ✅ | ❌ |

---

# Spécification: Mes Devis (Client)

## Vue d'ensemble

Page simple permettant au client de **voir tous ses devis** et **les signer**.

---

## Objectifs

1. ✅ Voir tous ses devis
2. ✅ Signer les devis non signés
3. ✅ Télécharger les devis en PDF
4. ❌ **PAS** de création de devis
5. ❌ **PAS** de modification de devis

---

## UI/UX (Monochrome)

### Layout

```
┌─────────────────────────────────────────────────────────┐
│  Topbar: "Mes Devis"                                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  [Tabs: Tous | En attente | Signés | Refusés]          │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │ Table des devis                                 │    │
│  │ N° | Date | Projet | Montant | Statut | Actions│    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Tabs (4 onglets)

1. **Tous** : Tous les devis
2. **En attente** : `status: SENT, PENDING`
3. **Signés** : `status: ACCEPTED, SIGNED`
4. **Refusés** : `status: REJECTED, EXPIRED`

### Table

**Colonnes** :
- **N°** : Numéro du devis (ex: DEV-2026-001)
- **Date** : Date d'émission
- **Projet** : Nom du projet
- **Montant** : Total TTC
- **Statut** : Badge
- **Actions** : Boutons

**Actions selon statut** :
- `SENT/PENDING` : [✍️ Signer] [📄 Voir PDF]
- `ACCEPTED/SIGNED` : [📄 Voir PDF]
- `REJECTED` : [📄 Voir PDF]

### Badges Statut

| Statut | Badge | Style |
|--------|-------|-------|
| Signé | `SIGNED` | `bg-black text-white` |
| En attente | `SENT` | `bg-gray-200 text-gray-800` |
| Refusé | `REJECTED` | `bg-gray-400 text-white` |
| Expiré | `EXPIRED` | `bg-gray-300 text-gray-700` |

### Modal Signature

```
┌─────────────────────────────────────┐
│  Signer le devis               [✕]  │
├─────────────────────────────────────┤
│                                      │
│  Devis: DEV-2026-001                │
│  Projet: Mon Site E-commerce        │
│  Montant: 5 000,00 € TTC            │
│                                      │
│  ─────────────────────────────────  │
│                                      │
│  En signant ce devis, vous          │
│  acceptez les conditions générales  │
│  et validez le lancement du projet. │
│                                      │
│  ─────────────────────────────────  │
│                                      │
│  Signature:                         │
│  ┌─────────────────────────────┐   │
│  │  [Canvas de signature]       │   │
│  └─────────────────────────────┘   │
│                                      │
│  [Effacer] [Annuler] [✓ Signer]    │
│                                      │
└─────────────────────────────────────┘
```

---

## Fonctionnalités

### 1. Visualisation

- Liste de **tous les devis** du client
- Filtrage par onglet (statut)
- Tri par date (plus récent en premier)

### 2. Signature de Devis

**Workflow** :
1. Client clique "Signer"
2. Modal s'ouvre avec canvas de signature
3. Client dessine sa signature
4. Clic "Signer" → POST /api/client/quotes/[id]/sign
5. Devis passe à `status: SIGNED`
6. Email de confirmation envoyé
7. Projet créé automatiquement (optionnel)

**Librairie** : `react-signature-canvas`

### 3. Téléchargement PDF

- Lien direct vers le PDF du devis
- Génération à la volée si nécessaire

---

## API Endpoints

### GET /api/client/quotes

**Description** : Liste des devis du client connecté

**Query Params** :
- `status` : Filter by status (optional)

**Response** :
```json
{
  "quotes": [
    {
      "id": "clx...",
      "quoteNumber": "DEV-2026-001",
      "projectName": "Mon Site E-commerce",
      "totalAmount": 5000.00,
      "status": "SENT",
      "createdAt": "2026-01-15T00:00:00Z",
      "pdfUrl": "/quotes/dev-2026-001.pdf"
    }
  ]
}
```

### POST /api/client/quotes/[id]/sign

**Description** : Signe un devis

**Request** :
```json
{
  "signature": "data:image/png;base64,..." // Base64 de la signature
}
```

**Response** :
```json
{
  "success": true,
  "quoteId": "clx...",
  "projectId": "clx..." // Si projet créé automatiquement
}
```

---

## Composants

```
app/(admin)/dashboard/finances/devis/
  └─ page.tsx (Server - role check)

components/client/
  ├─ ClientQuotesClient.tsx (Main)
  ├─ QuoteRow.tsx (Table row)
  └─ SignatureModal.tsx (Signature)
```

---

## Sécurité

1. ✅ Client ne voit que **SES** devis
2. ✅ Vérification ownership avant signature
3. ✅ Pas de création/modification de devis
4. ✅ Lecture seule sauf "Signer"

---

## Différences avec Admin

| Fonctionnalité | Admin | Client |
|----------------|-------|--------|
| Voir tous les devis | ✅ Tous | ✅ Siens uniquement |
| Créer un devis | ✅ | ❌ |
| Modifier un devis | ✅ | ❌ |
| Signer un devis | ❌ | ✅ |
| Envoyer un devis | ✅ | ❌ |

---

# Navigation Client

## Sidebar

```
Mes Finances
  ├─ Mes Devis         → /dashboard/finances/devis
  └─ Mes Paiements     → /dashboard/finances/paiements
```

## Middleware

```typescript
const SHARED_ROUTES = [
  "/dashboard/finances/devis",      // ✅ Client peut voir SES devis
  "/dashboard/finances/paiements",  // ✅ Client peut voir SES paiements
];

const ADMIN_ONLY_ROUTES = [
  "/dashboard/finances",            // ❌ Vue globale admin
  "/dashboard/finances/stats",      // ❌ Stats MRR
  "/dashboard/finances/subscriptions", // ❌ Abonnements
];
```

---

# Résumé

## Client peut :
- ✅ Voir **SES** paiements
- ✅ Payer les paiements en retard
- ✅ Télécharger ses factures
- ✅ Voir **SES** devis
- ✅ Signer les devis en attente
- ✅ Télécharger les devis PDF

## Client ne peut PAS :
- ❌ Créer des paiements
- ❌ Créer des devis
- ❌ Voir les stats MRR
- ❌ Gérer les abonnements
- ❌ Voir les paiements/devis d'autres clients

---

# Prochaines Étapes

1. Créer les pages :
   - `/dashboard/finances/devis/page.tsx`
   - `/dashboard/finances/paiements/page.tsx`

2. Créer les composants clients :
   - `ClientQuotesClient.tsx`
   - `ClientPaymentsClient.tsx`
   - `SignatureModal.tsx`

3. Créer les API endpoints :
   - `GET /api/client/quotes`
   - `POST /api/client/quotes/[id]/sign`
   - `GET /api/client/payments`
   - `POST /api/client/payments/[id]/pay`

4. Mettre à jour la navigation sidebar

Voulez-vous que je commence l'implémentation ? 🚀
