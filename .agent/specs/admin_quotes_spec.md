---
description: Specification for the Admin Finances Quotes (Devis) page.
---

# Admin Finance: Gestion des Devis

## Objectif Global
Créer une interface complète pour la gestion des devis (création, édition, visualisation PDF, envoi par email, suivi des statuts) au sein du dashboard admin.

## 1. Modélisation des Données (Prisma)

Mise à jour du modèle `Quote` pour stocker les détails requis.

```prisma
model Quote {
  id          String   @id @default(cuid())
  reference   String   @unique // Format: D-{YYYY}-{INCREMENT} ex: D-2024-001
  status      String   @default("DRAFT") // DRAFT, SENT, ACCEPTED, REJECTED
  
  // Relations
  clientId    String
  client      User     @relation(fields: [clientId], references: [id])
  projectId   String?  // Optionnel: lier un devis à un projet existant ou futur
  // project    Project? @relation(fields: [projectId], references: [id]) // À décommenter si relation stricte souhaitée

  // Dates
  issuedAt    DateTime @default(now())
  validUntil  DateTime?

  // Contenu (JSON pour SQLite/Simplicité)
  // Structure attendue: [{ description: string, quantity: number, unitPrice: number, total: number }]
  items       String   

  // Financier
  subtotal    Float
  taxRate     Float    @default(0) // ex: 20.0 pour 20%
  taxAmount   Float    @default(0)
  total       Float    // Montant TTC ou net selon TVA

  // Textes
  notes       String?
  terms       String?  // Conditions spécifiques

  // Méta
  pdfUrl      String?  // URL si stocké sur S3/R2
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## 2. Interface Utilisateur (UI)

### A. Listing Page (`/admin/dashboard/finances/devis`)
- **Tableau** :
  - Colonnes : Référence, Client, Projet (si lié), Date, Montant, Statut (Badge coloré), Actions.
- **Filtres** :
  - Par statut (Brouillon, Envoyé, Accepté, Refusé).
  - Par client (Recherche).
  - Par période (Mois/Année).
- **Actions** :
  - Bouton principal "Créer un devis" (Ouvre un Drawer/Modal large).
  - Actions sur ligne : Voir PDF, Modifier, Envoyer par email, Marquer comme accepté/refusé, Supprimer.

### B. Création / Édition de Devis (Drawer/Modal)
Un formulaire riche divisé en sections :
1.  **En-tête** :
    - Sélection du Client (Combobox avec recherche).
    - Sélection du Projet (Optionnel).
    - Date d'émission et Date de validité.
2.  **Lignes du devis** (Tableau éditable) :
    - Ajout/Suppression de lignes.
    - Champs : Description, Quantité, Prix Unitaire.
    - Calcul automatique du Total ligne.
3.  **Récapitulatif** :
    - Sous-total calculé.
    - Switch "TVA applicable" (si activé, input taux %).
    - Total calculé.
4.  **Pied de page** :
    - Notes (Textarea).
    - Conditions particulières (Textarea).
5.  **Actions** :
    - "Enregistrer en Brouillon".
    - "Générer PDF & Enregistrer".

### C. Visualisation & Envoi
- **Aperçu PDF** :
  - Génération à la volée du PDF côté client ou serveur pour prévisualisation.
  - Bouton "Télécharger".
- **Modal d'Envoi** :
  - Destinataire (pré-rempli avec email client).
  - CC (Optionnel).
  - Sujet (pré-rempli : "Votre devis D-2024-XXX - Obem Studio").
  - Message (pré-rempli avec template modifiable).
  - Bouton "Envoyer" (Déclenche l'envoi email avec PDF joint ou lien).

## 3. Endpoints API

### `GET /api/quotes`
- Récupère la liste avec filtres et pagination.

### `POST /api/quotes`
- Crée un nouveau devis.
- Génère la référence automatiquement (incrémental).

### `PATCH /api/quotes/[id]`
- Mise à jour du devis.
- Interdit si statut est "ACCEPTED" ou "SENT" (sauf pour changer le statut manuellement ou par admin).

### `POST /api/quotes/[id]/send`
- Envoie le devis par email (via Resend, Nodemailer, etc.).
- Met à jour le statut à "SENT".

### `GET /api/quotes/[id]/pdf`
- Génère le stream PDF du devis.

## 4. Stack Technique & Librairies
- **PDF** : `jspdf` + `jspdf-autotable` (côté client pour rapidité/preview) ou `@react-pdf/renderer` (plus robuste/declaratif). Recommandation : `@react-pdf/renderer` pour un design premium et maintenable.
- **Email** : Utilisation de l'infrastructure existante (probablement `Resend` ou `Nodemailer`).
- **Stockage** : Pour l'instant, génération à la volée. Option de sauvegarde S3 plus tard.

## 5. Acceptance Criteria
- [ ] Je peux créer un devis pour un client existant.
- [ ] Je peux ajouter plusieurs lignes et voir le total se mettre à jour en temps réel.
- [ ] Je peux enregistrer le devis en brouillon.
- [ ] Le PDF généré respecte la charte graphique Obem Studio (Logo, Polices, Couleurs).
- [ ] Je peux envoyer le devis par email directement depuis l'admin.
- [ ] Le statut passe automatiquement à "Envoyé" après envoi.
- [ ] Je peux changer le statut manuellement à "Accepté" ou "Refusé".
