# Migration vers Routes Unifiées - Documentation

## Vue d'ensemble

Le système a été migré d'une architecture avec routes séparées (`/dashboard/client/*` vs `/dashboard/*`) vers une **architecture unifiée** où les mêmes routes sont accessibles aux admins et clients, avec des permissions gérées au niveau des pages.

---

## Changements d'Architecture

### Avant (Routes Séparées)

```
ADMIN:
/dashboard                    → Dashboard admin
/dashboard/projets            → Liste projets admin
/dashboard/clients            → Gestion clients
/dashboard/parametres         → Paramètres admin
/dashboard/notifications      → Notifications admin

CLIENT:
/dashboard/client             → Dashboard client
/dashboard/client/projets     → Liste projets client
/dashboard/client/demandes    → Demandes client
/dashboard/client/parametres  → ❌ Bloqué (forbidden)
/dashboard/client/notifications → ❌ Bloqué (forbidden)
```

**Problème** : Les clients ne pouvaient pas accéder aux paramètres et notifications car les routes n'existaient pas dans `/dashboard/client/*`.

### Après (Routes Unifiées)

```
PARTAGÉ (Admin + Client):
/dashboard                    → Dashboard (vue adaptée au rôle)
/dashboard/projets            → Projets (vue adaptée au rôle)
/dashboard/projets/[id]       → Détail projet (ownership vérifié)
/dashboard/projets/nouveau    → Nouveau projet (client uniquement)
/dashboard/parametres         → Paramètres (accessible aux deux)
/dashboard/notifications      → Notifications (accessible aux deux)
/dashboard/discussion         → Messagerie (accessible aux deux)

ADMIN UNIQUEMENT:
/dashboard/clients            → Gestion clients
/dashboard/finances           → Finances
/dashboard/devis              → Devis
/dashboard/stats              → Statistiques
```

---

## Middleware (`middleware.ts`)

### Logique de Permission

```typescript
// Routes réservées aux ADMIN
const ADMIN_ONLY_ROUTES = [
  "/dashboard/clients",
  "/dashboard/finances",
  "/dashboard/devis",
  "/dashboard/stats",
];

// Routes partagées (permissions gérées dans les pages)
const SHARED_ROUTES = [
  "/dashboard/parametres",
  "/dashboard/notifications",
  "/dashboard/projets",
];
```

**Comportement** :
- ✅ Les routes `ADMIN_ONLY` bloquent les clients
- ✅ Les routes `SHARED` sont accessibles aux deux rôles
- ✅ Les permissions spécifiques sont vérifiées dans chaque page

---

## Layout Unifié (`app/(admin)/dashboard/layout.tsx`)

### Navigation Dynamique

Le layout affiche différents items de navigation selon le rôle :

```typescript
const navItems = user?.role === "CLIENT" ? clientNavItems : defaultNavItems;
```

**Navigation Admin** :
- Accueil
- Projets
- Clients
- Discussions
- Finances (avec sous-menu : Devis, Paiements, Abonnements)

**Navigation Client** :
- Accueil
- Mes Projets
- Messagerie
- Mes Finances (avec sous-menu : Mes Devis, Mes Paiements)

---

## Pages avec Permissions Dynamiques

### `/dashboard/projets/page.tsx`

**Logique** :
```typescript
if (user.role === "CLIENT") {
  // Afficher uniquement les projets du client
  const projects = await prisma.project.findMany({
    where: { clientId: user.id }
  });
  return <ClientProjectsClient projects={projects} />;
}

// Afficher tous les projets pour l'admin
return <ProjectsAdminClient projects={allProjects} />;
```

### `/dashboard/projets/[id]/page.tsx`

**Logique** :
```typescript
// Vérifier l'ownership pour les clients
if (user.role === "CLIENT" && project.clientId !== user.id) {
  redirect("/forbidden");
}

// Les deux rôles voient la même vue (pour l'instant)
return <ClientProjectDetailClient project={project} />;
```

---

## Redirections

### `/dashboard/client` → `/dashboard`

Une redirection automatique a été mise en place pour les anciennes URLs :

```typescript
// app/(client)/dashboard/client/page.tsx
export default function ClientDashboardRedirect() {
  redirect("/dashboard");
}
```

---

## Fichiers Modifiés

### Configuration
- ✅ `middleware.ts` - Nouvelle logique de permissions
- ✅ `app/(admin)/dashboard/layout.tsx` - Navigation dynamique

### Pages
- ✅ `app/(admin)/dashboard/projets/page.tsx` - Vue adaptée au rôle
- ✅ `app/(admin)/dashboard/projets/[id]/page.tsx` - Détail avec ownership
- ✅ `app/(client)/dashboard/client/page.tsx` - Redirection

### Composants
- ✅ `components/client/ClientProjectsClient.tsx` - Liens mis à jour
- ✅ `components/client/ClientProjectDetailClient.tsx` - Liens mis à jour
- ✅ `components/client/ProjectRequestForm.tsx` - Imports et liens mis à jour
- ✅ `components/client/ProjectRequestSuccess.tsx` - Lien mis à jour

### Routes Déplacées
- ✅ `app/(admin)/dashboard/projets/nouveau/` - Formulaire de demande

---

## Avantages de l'Architecture Unifiée

### ✅ Simplicité
- Une seule URL pour chaque fonctionnalité
- Pas de duplication de code
- Maintenance plus facile

### ✅ Flexibilité
- Permissions gérées finement dans chaque page
- Facile d'ajouter de nouvelles routes partagées
- Possibilité de personnaliser la vue par rôle

### ✅ Expérience Utilisateur
- URLs cohérentes et prévisibles
- Pas de confusion entre `/dashboard/client/*` et `/dashboard/*`
- Partage de liens simplifié

### ✅ Sécurité
- Vérifications d'ownership au niveau de la page
- Middleware pour bloquer les routes admin
- Double vérification (middleware + page)

---

## Migration des Anciennes URLs

Toutes les anciennes URLs `/dashboard/client/*` ont été migrées :

| Ancienne URL | Nouvelle URL |
|--------------|--------------|
| `/dashboard/client` | `/dashboard` |
| `/dashboard/client/projets` | `/dashboard/projets` |
| `/dashboard/client/projets/[id]` | `/dashboard/projets/[id]` |
| `/dashboard/client/projets/nouveau` | `/dashboard/projets/nouveau` |

---

## TODO / Améliorations Futures

### 1. Vue Admin pour Détail Projet
Actuellement, admin et client voient la même vue. Créer une vue admin avec :
- Édition des informations
- Gestion des étapes
- Historique des modifications
- Assignation de membres d'équipe

### 2. Dashboard Personnalisé
Créer des vues différentes pour `/dashboard` selon le rôle :
- **Admin** : Stats globales, projets récents, clients actifs
- **Client** : Ses projets, notifications, prochaines échéances

### 3. Finances Client
Implémenter `/dashboard/finances` pour les clients :
- Voir ses devis
- Voir ses paiements
- Télécharger les factures

### 4. Notifications
Implémenter `/dashboard/notifications` avec :
- Liste des notifications
- Marquage lu/non lu
- Filtres par type

### 5. Messagerie
Implémenter `/dashboard/discussion` avec :
- Liste des conversations
- Vue détaillée
- Envoi de messages

---

## Points d'Attention

### ⚠️ Ownership Verification
Toujours vérifier l'ownership dans les pages qui affichent des données spécifiques :
```typescript
if (user.role === "CLIENT" && resource.clientId !== user.id) {
  redirect("/forbidden");
}
```

### ⚠️ Navigation Items
Mettre à jour `clientNavItems` et `defaultNavItems` dans `layout.tsx` lors de l'ajout de nouvelles routes.

### ⚠️ Middleware
Ajouter les nouvelles routes admin-only dans `ADMIN_ONLY_ROUTES` du middleware.

---

## Conclusion

La migration vers une architecture unifiée permet :
- ✅ Accès aux paramètres et notifications pour les clients
- ✅ URLs cohérentes et prévisibles
- ✅ Code plus maintenable
- ✅ Meilleure expérience utilisateur

Le système est maintenant prêt pour l'ajout de nouvelles fonctionnalités partagées entre admin et client.
