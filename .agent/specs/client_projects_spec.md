# Spécification: Espace Client - Projets

## Vue d'ensemble

L'espace client `/client/projets` permet aux clients de consulter leurs projets en cours et terminés avec une interface moderne et intuitive. Les clients ont un accès en **lecture seule** et peuvent visualiser la progression détaillée de chaque projet.

---

## Objectifs

1. **Listing esthétique** : Affichage des projets sous forme de cards premium avec informations clés
2. **Suivi de progression** : Visualisation claire de l'avancement via barres de progression et étapes
3. **Détails projet** : Accès à une vue détaillée en lecture seule pour chaque projet
4. **Call-to-Action** : Bouton "Nouvelle demande" pour initier un nouveau projet

---

## Architecture

### Routes

```
/dashboard/client/projets              → Liste des projets (ClientProjectsPage)
/dashboard/client/projets/[id]         → Détail d'un projet (ClientProjectDetailPage)
```

### Composants

#### Server Components
- `app/(client)/dashboard/client/projets/page.tsx`
  - Récupère les projets du client via Prisma
  - Vérifie l'authentification et le rôle CLIENT
  - Passe les données au composant client

- `app/(client)/dashboard/client/projets/[id]/page.tsx`
  - Récupère les détails d'un projet spécifique
  - Vérifie que le projet appartient bien au client (RBAC)
  - Retourne 404 si le projet n'existe pas ou n'appartient pas au client

#### Client Components
- `components/client/ClientProjectsClient.tsx`
  - Affichage en grille des cards de projets
  - Filtres par statut et recherche
  - Calcul des étapes actuelles et suivantes
  - Gestion de l'état local (filtres, recherche)

- `components/client/ClientProjectDetailClient.tsx`
  - Vue détaillée d'un projet
  - Timeline des étapes avec indicateurs visuels
  - Informations complètes (montant, dates, caractéristiques)
  - CTA pour faire une demande

---

## UI/UX Design

### Page Liste des Projets

#### Header (Topbar)
- **Titre** : "Mes Projets"
- **Recherche** : Input avec icône de recherche
- **CTA** : Bouton "+ Nouvelle demande" (lien vers `/dashboard/client/demandes`)

#### Filtres
- Pills cliquables pour filtrer par statut
- "Tous" + statuts dynamiques extraits des projets
- Style actif : fond noir, texte blanc
- Style inactif : fond blanc, bordure grise

#### Cards Projet (Grid Responsive)
Chaque card affiche :
- **Header**
  - Nom du projet (titre)
  - Badge type (si disponible)
  - Badge statut avec point de couleur
  - Technologie (si disponible)

- **Barre de progression**
  - Label "Progression" + pourcentage
  - Barre gradient violet (#6b4de6 → #8b5cf6)
  - Hauteur 8px, coins arrondis

- **Indicateurs d'étapes**
  - Cercles numérotés ou avec checkmark
  - Connectés par des lignes
  - États : Terminé (vert), En cours (violet), À venir (gris)

- **Étape actuelle**
  - Encadré avec fond gris clair
  - Label de l'étape + description
  - "Prochaine étape" si disponible

- **Hover**
  - Translation -4px vers le haut
  - Ombre portée accentuée
  - Flèche droite apparaît en haut à droite

#### État vide
- Icône de projet (SVG)
- Message "Aucun projet trouvé"
- Texte contextuel selon les filtres
- Bouton "Faire une demande" si aucun projet

### Page Détail Projet

#### Header
- Titre : Nom du projet
- Bouton "Retour aux projets" avec flèche gauche

#### Card Header
- Nom du projet (h1)
- Badges : Statut, Type, Technologie
- Barre de progression globale (plus grande)
- Grid 3 colonnes :
  - Montant (formaté en EUR)
  - Date de création
  - Échéance (si disponible)

#### Timeline des Étapes
- Liste verticale avec connecteurs
- Cercles numérotés alignés à gauche
- Pour chaque étape :
  - Numéro ou checkmark
  - Label en gras
  - Description
  - Badge "En cours" animé pour l'étape actuelle

#### Caractéristiques
- Tags arrondis avec les attributs du projet
- Affichage en flex wrap

#### CTA Contact
- Card gradient violet
- Titre "Une question sur votre projet ?"
- Bouton "Faire une demande"

---

## Données et Logique

### Modèle Project (Prisma)

```typescript
{
  id: string
  name: string
  status: string              // "En cours", "Terminé", "En attente"
  progress: number            // 0-100
  type?: string              // "E-commerce", "Site vitrine", etc.
  technology?: string        // "Next.js", "WordPress", etc.
  deadline?: Date
  amount: number
  paymentType?: string
  progressConfig?: string    // JSON: { steps: [...] }
  attributes?: string        // JSON: ["Feature 1", "Feature 2"]
  createdAt: Date
  updatedAt: Date
  clientId: string
}
```

### Configuration des Étapes (progressConfig)

Format JSON stocké en base :
```json
{
  "steps": [
    { "label": "Brief", "description": "Cadrage initial" },
    { "label": "Design", "description": "Maquettes UI/UX" },
    { "label": "Développement", "description": "Intégration" },
    { "label": "Tests", "description": "Validation" },
    { "label": "Livraison", "description": "Mise en ligne" }
  ]
}
```

### Calcul de l'Étape Actuelle

```typescript
const getCurrentStep = (progress: number, totalSteps: number) => {
  const stepPercentage = 100 / totalSteps;
  return Math.min(Math.floor(progress / stepPercentage), totalSteps - 1);
};
```

**Exemples** :
- 5 étapes, progress 0% → Étape 0 (Brief)
- 5 étapes, progress 25% → Étape 1 (Design)
- 5 étapes, progress 80% → Étape 4 (Livraison)

---

## Sécurité et RBAC

### Contrôles d'Accès

1. **Authentification** : `getCurrentUser()` vérifie la session
2. **Rôle** : Seuls les utilisateurs avec `role: "CLIENT"` peuvent accéder
3. **Ownership** : Les clients ne voient que leurs propres projets
   - Liste : `WHERE clientId = user.id`
   - Détail : Vérification `project.clientId === user.id`

### Redirections

- Non authentifié → `/login`
- Mauvais rôle → `/forbidden`
- Projet inexistant ou non autorisé → `notFound()` (404)

---

## Endpoints API

### GET Projects (Server Component)

```typescript
// app/(client)/dashboard/client/projets/page.tsx
const projects = await prisma.project.findMany({
  where: { clientId: user.id },
  orderBy: { createdAt: "desc" }
});
```

### GET Project Detail (Server Component)

```typescript
// app/(client)/dashboard/client/projets/[id]/page.tsx
const project = await prisma.project.findUnique({
  where: { id: projectId },
  include: {
    client: {
      select: { id: true, name: true, email: true, companyName: true }
    }
  }
});

// Vérification ownership
if (project.clientId !== user.id) {
  notFound();
}
```

---

## États et Interactions

### Filtres
- **État initial** : Tous les projets affichés
- **Clic sur un filtre** : Mise à jour de `statusFilter`
- **Recherche** : Filtrage en temps réel sur le nom du projet
- **Combinaison** : Recherche + filtre statut appliqués ensemble

### Navigation
- **Clic sur card** → `/dashboard/client/projets/[id]`
- **Bouton "Nouvelle demande"** → `/dashboard/client/demandes`
- **Bouton "Retour"** → `/dashboard/client/projets`

---

## Responsive Design

### Breakpoints
- **Mobile** (< 640px) : 1 colonne
- **Tablet** (640px - 1024px) : 2 colonnes
- **Desktop** (> 1024px) : 3 colonnes

### Adaptations
- Input recherche : Largeur fixe sur desktop, full-width sur mobile
- Cards : Padding réduit sur mobile
- Timeline : Espacement ajusté sur mobile

---

## Palette de Couleurs

### Statuts
- **Terminé** : `bg-[#e2f6eb]` / `text-[#2b7a45]`
- **En cours** : `bg-[#fff4e6]` / `text-[#d97706]`
- **En attente** : `bg-[#f3f4f6]` / `text-[#6b7280]`

### Étapes
- **Terminée** : `bg-[#e8f7e6]` / `border-[#4c9f4a]` / `text-[#2f7a2c]`
- **En cours** : `bg-[#6b4de6]` / `text-white`
- **À venir** : `bg-white` / `border-[#c9c4ce]` / `text-[#8b8690]`

### Progression
- Gradient : `from-[#6b4de6] to-[#8b5cf6]`

---

## Améliorations Futures

1. **Notifications** : Alertes lors de changements d'étape
2. **Commentaires** : Section pour échanger avec l'admin
3. **Documents** : Téléchargement de livrables
4. **Historique** : Changelog des modifications du projet
5. **Export PDF** : Génération d'un rapport de projet

---

## Tests Recommandés

### Scénarios Utilisateur
1. Client avec 0 projet → Affichage état vide
2. Client avec 3 projets → Affichage grid
3. Recherche "Shop" → Filtrage correct
4. Filtre "En cours" → Seuls les projets en cours
5. Clic sur projet → Redirection vers détail
6. Accès direct à `/projets/[id]` d'un autre client → 404

### Sécurité
1. Utilisateur non authentifié → Redirect `/login`
2. Utilisateur ADMIN → Redirect `/forbidden`
3. Client A tente d'accéder au projet de Client B → 404

---

## Fichiers Créés/Modifiés

### Nouveaux fichiers
- `app/(client)/dashboard/client/projets/page.tsx`
- `app/(client)/dashboard/client/projets/[id]/page.tsx`
- `components/client/ClientProjectsClient.tsx`
- `components/client/ClientProjectDetailClient.tsx`

### Existants (inchangés)
- `app/(client)/dashboard/client/layout.tsx` (navigation sidebar)
- `components/Topbar.tsx` (header réutilisé)
- `lib/auth.ts` (authentification)
- `lib/prisma.ts` (accès base de données)

---

## Conclusion

Cette implémentation fournit une expérience client premium pour consulter les projets, avec :
- ✅ Interface moderne et esthétique
- ✅ Suivi de progression visuel et intuitif
- ✅ Sécurité RBAC stricte
- ✅ Performance optimisée (Server Components)
- ✅ Responsive design
- ✅ Call-to-action clairs
