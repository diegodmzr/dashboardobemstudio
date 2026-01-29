# Spécification: Formulaire de Départ de Projet Client

## Vue d'ensemble

Le formulaire `/client/projets/nouveau` permet aux clients de soumettre une **demande de projet** (brief initial) via un stepper multi-étapes. La demande crée une **Conversation** avec les réponses stockées en JSON, permettant à l'admin de valider avant de créer le projet réel.

---

## Décision Architecture: Conversation vs Projet Direct

### ✅ Choix Retenu: Créer une Conversation

**Pourquoi ?**
1. **Validation Admin** : L'admin peut revoir le brief avant de créer le projet
2. **Discussion** : Permet d'échanger avec le client pour clarifier
3. **Flexibilité** : L'admin peut ajuster les paramètres (montant, deadline, etc.)
4. **Traçabilité** : Historique complet de la demande initiale

**Workflow** :
```
Client remplit formulaire 
  → Conversation créée (catégorie "PROJET", status "OPEN")
  → Notification admin
  → Admin discute si besoin
  → Admin crée le projet depuis la conversation
```

---

## Étapes du Formulaire (Stepper)

### Étape 1: Informations de Base
- **Nom du projet** (input text, requis)
- **Description courte** (textarea, optionnel)

### Étape 2: Couleurs Souhaitées
- **Question** : "Quelles couleurs souhaitez-vous pour votre projet ?"
- **Réponse** : Textarea libre
- **Exemples** : "Bleu et blanc", "Tons chauds", "Monochrome noir/blanc"

### Étape 3: Design Préféré
- **Question** : "Quel style de design préférez-vous ?"
- **Galerie** : 6 cards avec exemples visuels
  - Minimaliste
  - Moderne
  - Classique
  - Créatif
  - Corporate
  - Autre
- **Sélection** : 1-2 choix (checkboxes)
- **URLs de référence** : Input pour ajouter 1-3 URLs d'exemples

### Étape 4: Typographie
- **Question** : "Quelle typographie préférez-vous ?"
- **Galerie** : 6 cards avec aperçu de polices
  - Inter (Sans-serif moderne)
  - Roboto (Sans-serif classique)
  - Playfair Display (Serif élégant)
  - Montserrat (Sans-serif géométrique)
  - Lora (Serif lisible)
  - Poppins (Sans-serif arrondi)
- **Sélection** : 1 choix (radio)
- **Option "Autre"** : Input text si aucune ne convient

### Étape 5: Récapitulatif & Envoi
- Affichage de toutes les réponses
- Bouton "Modifier" pour chaque section
- Bouton "Envoyer la demande"

### Étape 6: Confirmation
- Message de succès
- "Votre demande a été envoyée !"
- "Nous reviendrons vers vous sous 24-48h"
- Bouton "Retour aux projets"

---

## Modèle de Données

### Conversation (Prisma)

```typescript
{
  id: string
  subject: string              // "Nouvelle demande: [Nom du projet]"
  status: "OPEN"
  category: "PROJET"
  metadata: string             // JSON avec les réponses du formulaire
  participants: Participant[]  // Client + Admin
  messages: Message[]          // Premier message = résumé du brief
  createdAt: Date
}
```

### Structure metadata (JSON)

```json
{
  "projectRequest": {
    "projectName": "Mon site e-commerce",
    "description": "Site de vente en ligne pour produits artisanaux",
    "colors": "Tons naturels, beige et vert",
    "designStyles": ["Minimaliste", "Moderne"],
    "referenceUrls": [
      "https://example.com/site1",
      "https://example.com/site2"
    ],
    "typography": "Inter",
    "typographyOther": null,
    "submittedAt": "2026-01-28T10:54:00Z"
  }
}
```

---

## UI/UX Design (Monochrome)

### Layout Global
- **Container** : Max-width 800px, centré
- **Stepper** : En haut, indicateurs de progression
- **Card** : Fond blanc, bordure grise, ombre légère
- **Transitions** : Slide entre les étapes

### Stepper (Indicateur de Progression)

```
[1] ━━━ [2] ━━━ [3] ━━━ [4] ━━━ [5]
```

- **Étape actuelle** : Cercle noir, texte blanc
- **Étape terminée** : Cercle noir avec checkmark
- **Étape à venir** : Cercle blanc, bordure grise
- **Ligne** : Noire si terminée, grise sinon

### Cards de Sélection (Design & Typo)

**Structure** :
```
┌─────────────────┐
│   [Icône/Aperçu] │
│                  │
│   Nom du style   │
│   Description    │
└─────────────────┘
```

**États** :
- **Non sélectionné** : Fond blanc, bordure grise
- **Hover** : Bordure noire, translation -2px
- **Sélectionné** : Fond noir, texte blanc, checkmark

### Galerie Design Styles

6 cards avec icônes SVG :
- **Minimaliste** : Lignes épurées
- **Moderne** : Formes géométriques
- **Classique** : Colonnes
- **Créatif** : Formes abstraites
- **Corporate** : Grille structurée
- **Autre** : Point d'interrogation

### Galerie Typographies

6 cards avec aperçu texte :
```
┌─────────────────┐
│  Aa Bb Cc Dd    │ ← Aperçu dans la police
│                  │
│  Inter           │ ← Nom
│  Sans-serif      │ ← Catégorie
└─────────────────┘
```

### Boutons Navigation

- **Précédent** : Bordure grise, texte gris
- **Suivant** : Fond noir, texte blanc
- **Envoyer** : Fond noir, texte blanc, shadow

---

## Validation

### Règles par Étape

**Étape 1** :
- Nom du projet : Requis, min 3 caractères

**Étape 2** :
- Couleurs : Optionnel (peut être "À définir")

**Étape 3** :
- Design : Au moins 1 style sélectionné
- URLs : Optionnel, validation format URL si rempli

**Étape 4** :
- Typo : 1 choix obligatoire
- Si "Autre" : champ texte requis

**Étape 5** :
- Pas de validation, juste récap

---

## Endpoints API

### POST /api/conversations/project-request

**Request Body** :
```json
{
  "projectName": "Mon site",
  "description": "...",
  "colors": "...",
  "designStyles": ["Minimaliste"],
  "referenceUrls": ["https://..."],
  "typography": "Inter",
  "typographyOther": null
}
```

**Actions** :
1. Récupérer `userId` du client authentifié
2. Créer une **Conversation** :
   - `subject`: "Nouvelle demande: [projectName]"
   - `category`: "PROJET"
   - `status`: "OPEN"
   - `metadata`: JSON avec les réponses
3. Créer **Participants** :
   - Client (role: "OWNER")
   - Admin (récupérer premier user avec role "ADMIN")
4. Créer **Message initial** :
   - Contenu : Résumé formaté du brief
   - `senderId`: Client
5. Créer **Notification** pour l'admin :
   - Type: "DISCUSSION"
   - Titre: "Nouvelle demande de projet"
   - Message: "[Client] a soumis une demande: [projectName]"
6. **(Optionnel)** Envoyer email à l'admin

**Response** :
```json
{
  "success": true,
  "conversationId": "clx..."
}
```

---

## Notifications

### Notification Admin (Base de données)

```typescript
{
  type: "DISCUSSION",
  title: "Nouvelle demande de projet",
  message: "Diego Demazure a soumis une demande: Mon site e-commerce",
  entityType: "Conversation",
  entityId: "clx...",
  isRead: false
}
```

### Email Admin (Optionnel)

**Sujet** : "Nouvelle demande de projet - [Nom du projet]"

**Contenu** :
```
Bonjour,

[Client Name] a soumis une nouvelle demande de projet.

Nom du projet: [projectName]
Description: [description]

Couleurs: [colors]
Design: [designStyles]
Typographie: [typography]

Références:
- [url1]
- [url2]

Accéder à la conversation: [lien]

---
OBEM Studio Dashboard
```

---

## Composants

### Structure Fichiers

```
app/(client)/dashboard/client/projets/nouveau/
  └─ page.tsx                    (Server Component)

components/client/
  ├─ ProjectRequestForm.tsx      (Client Component - Stepper principal)
  ├─ ProjectRequestStep1.tsx     (Infos de base)
  ├─ ProjectRequestStep2.tsx     (Couleurs)
  ├─ ProjectRequestStep3.tsx     (Design)
  ├─ ProjectRequestStep4.tsx     (Typographie)
  ├─ ProjectRequestStep5.tsx     (Récapitulatif)
  ├─ ProjectRequestSuccess.tsx   (Confirmation)
  └─ DesignStyleCard.tsx         (Card réutilisable)

app/api/conversations/project-request/
  └─ route.ts                    (POST endpoint)
```

---

## État du Formulaire (React State)

```typescript
type FormData = {
  projectName: string;
  description: string;
  colors: string;
  designStyles: string[];       // Max 2
  referenceUrls: string[];      // Max 3
  typography: string;
  typographyOther: string;
};

const [currentStep, setCurrentStep] = useState(1);
const [formData, setFormData] = useState<FormData>({
  projectName: "",
  description: "",
  colors: "",
  designStyles: [],
  referenceUrls: [""],
  typography: "",
  typographyOther: "",
});
```

---

## Animations & Transitions

### Transition entre Étapes
```css
/* Slide in from right */
.step-enter {
  transform: translateX(100%);
  opacity: 0;
}
.step-enter-active {
  transform: translateX(0);
  opacity: 1;
  transition: all 300ms ease-out;
}

/* Slide out to left */
.step-exit {
  transform: translateX(0);
  opacity: 1;
}
.step-exit-active {
  transform: translateX(-100%);
  opacity: 0;
  transition: all 300ms ease-out;
}
```

### Hover Cards
```css
hover:-translate-y-1
hover:shadow-md
transition-all duration-200
```

---

## Responsive Design

### Breakpoints
- **Mobile** (< 640px) : 
  - Galerie 1 colonne
  - Stepper vertical
- **Tablet** (640px - 1024px) :
  - Galerie 2 colonnes
- **Desktop** (> 1024px) :
  - Galerie 3 colonnes

---

## Sécurité

### Contrôles
1. **Authentification** : `getCurrentUser()` requis
2. **Rôle** : Seuls les `CLIENT` peuvent soumettre
3. **Rate Limiting** : Max 5 demandes/heure par client
4. **Validation** : Sanitize inputs (XSS)
5. **URLs** : Validation format + whitelist domaines si nécessaire

---

## Workflow Admin (Post-Soumission)

1. **Admin reçoit notification** dans `/dashboard/discussions`
2. **Admin ouvre la conversation** et voit le brief
3. **Admin peut** :
   - Poser des questions au client
   - Demander des clarifications
   - Valider et créer le projet
4. **Création du projet** :
   - Depuis la conversation, bouton "Créer le projet"
   - Pré-remplir avec les infos du brief
   - Lier le projet à la conversation

---

## Messages d'Erreur

### Validation
- "Le nom du projet est requis"
- "Veuillez sélectionner au moins un style de design"
- "Veuillez choisir une typographie"
- "URL invalide"

### Soumission
- "Une erreur est survenue. Veuillez réessayer."
- "Vous avez atteint la limite de demandes. Veuillez patienter."

---

## Success Screen

```
┌─────────────────────────────────┐
│                                  │
│         ✓ (Checkmark)           │
│                                  │
│   Demande envoyée avec succès ! │
│                                  │
│   Nous reviendrons vers vous    │
│   sous 24-48h pour discuter     │
│   de votre projet.               │
│                                  │
│   [Retour aux projets]          │
│   [Voir mes demandes]           │
│                                  │
└─────────────────────────────────┘
```

---

## Améliorations Futures

1. **Upload de fichiers** : Permettre d'ajouter des moodboards
2. **Budget estimé** : Ajouter une fourchette de budget
3. **Deadline souhaitée** : Date de livraison espérée
4. **Sauvegarde brouillon** : Sauvegarder en localStorage
5. **Templates** : Proposer des templates de brief pré-remplis

---

## Points à Valider

### ✅ Décisions Confirmées
- Créer une **Conversation** (pas un projet direct)
- Stocker réponses en **metadata JSON**
- Notifier admin via **Notification** + email optionnel
- Formulaire en **5 étapes** + confirmation

### ❓ Questions Ouvertes
1. **Email admin** : Activer ou juste notification in-app ?
2. **Auto-assign admin** : Quel admin assigner par défaut ?
3. **Limite de demandes** : 5/heure est-il suffisant ?
4. **Champs additionnels** : Budget ? Deadline ? Type de projet ?

---

## Fichiers à Créer

### Routes
- `app/(client)/dashboard/client/projets/nouveau/page.tsx`

### Composants
- `components/client/ProjectRequestForm.tsx`
- `components/client/ProjectRequestStep1.tsx`
- `components/client/ProjectRequestStep2.tsx`
- `components/client/ProjectRequestStep3.tsx`
- `components/client/ProjectRequestStep4.tsx`
- `components/client/ProjectRequestStep5.tsx`
- `components/client/ProjectRequestSuccess.tsx`
- `components/client/DesignStyleCard.tsx`
- `components/client/TypographyCard.tsx`

### API
- `app/api/conversations/project-request/route.ts`

### Types
- Ajouter types dans fichier existant ou créer `types/project-request.ts`

---

## Conclusion

Cette implémentation fournit un **workflow complet** de demande de projet :
- ✅ Formulaire client intuitif et guidé
- ✅ Stockage structuré des réponses
- ✅ Notification admin automatique
- ✅ Base pour discussion client-admin
- ✅ Traçabilité complète
- ✅ Design monochrome ultra clean

Le client soumet une **demande**, l'admin **valide et crée le projet** après discussion si nécessaire.
