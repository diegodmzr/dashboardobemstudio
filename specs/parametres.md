# Spécification Technique : Page Paramètres (/dashboard/parametres)

## Contexte Global
> **Prompt d'origine :**
> Conçois et spécifie /parametres (commun admin/client).
> Objectifs :
> - Modifier profil : nom, prénom, email, téléphone, adresse, avatar.
> - Modifier mot de passe (double saisie).
> - Thème clair/sombre (persisté).
> - Déconnexion.
> UI :
> - Tabs : Profil / Sécurité / Apparence
> - Upload avatar (crop option)
> - Confirmations + toasts
> Technique :
> - Endpoints update profile + update password
> - Sécurité : re-auth pour changer email/mdp (option)
> - AuditLog
> Sortie complète + acceptance criteria.

---

## 1. Vue d'Ensemble
Cette fonctionnalité permet aux utilisateurs (Admin et Client) de gérer leurs informations personnelles, leur sécurité et leurs préférences d'interface via une page unique `/dashboard/parametres`.

## 2. Modifications de la Base de Données (Schema Prisma)

Le modèle `User` doit être étendu pour supporter les nouvelles données.

```prisma
model User {
  // Champs existants
  id          String   @id @default(cuid())
  email       String   @unique
  // name existant, sera utilisé comme "Nom d'affichage" ou concaténation
  name        String
  
  // Nouveaux champs à ajouter via migration
  firstName   String?  // Prénom
  lastName    String?  // Nom de famille
  avatar      String?  // URL de l'avatar profil (distinct du logo entreprise)
  address     String?  // Adresse postale complête
  theme       String?  @default("light") // "light" | "dark" | "system"
  
  // Champs existants conservés
  role        String   @default("CLIENT")
  phone       String?
  // ... autres champs
}
```

> **Note de migration :** Un script devra séparer le champ `name` actuel en `firstName` et `lastName` lors de la migration, ou initialiser ces champs vides.

## 3. Architecture UI (Frontend)

### Layout
- Route : `/dashboard/parametres`
- Layout : Intégré dans le layout principal du dashboard.
- Titre : "Paramètres du compte".

### Composants
1.  **`SettingsPage.tsx`** (Client Component)
    -   Gère l'état global et les onglets.
    -   **Tabs** : `Profil`, `Sécurité`, `Apparence`.
2.  **`ProfileTab.tsx`**
    -   Formulaire : Nom, Prénom, Email, Téléphone, Adresse.
    -   **`AvatarUpload.tsx`** :
        -   Zone de drag & drop.
        -   Modal de recadrage (Crop) utilisant `react-easy-crop`.
        -   Prévisualisation en temps réel.
3.  **`SecurityTab.tsx`**
    -   Formulaire changement de mot de passe.
    -   Champs : *Mot de passe actuel*, *Nouveau mot de passe*, *Confirmer mot de passe*.
    -   Bouton "Se déconnecter de toutes les sessions" (Optionnel).
4.  **`AppearanceTab.tsx`**
    -   Sélecteur de thème (Cartes cliquables : Clair / Sombre / Système).
    -   Persistance immédiate via `next-themes` et API.

### UX / Interactions
- **Confirmations** : Toasts de succès ("Profil mis à jour") ou d'erreur via une librairie (ex: `sonner` ou `react-hot-toast`).
- **Validation** : Zod pour la validation des formulaires côté client avant envoi.

## 4. API & Backend (Route Handlers)

### `PATCH /api/profile`
- **Body** : `{ firstName, lastName, email, phone, address, avatar }`.
- **Validation** : Vérifie format email, longueur champs.
- **Sécurité** : 
    -   Si changement d'email : Vérifier unicité.
    -   Si changement d'email : Exiger *Mot de passe actuel* dans le body (Re-auth).
- **Audit** : Créer un `AuditLog` action=`UPDATE_PROFILE`.

### `PATCH /api/profile/password`
- **Body** : `{ currentPassword, newPassword }`.
- **Validation** : 
    -   `newPassword` min 8 chars, complexité.
    -   `newPassword` == `confirmPassword` (front).
- **Logique** :
    -   Vérifier `currentPassword` avec bcrypt.
    -   Hasher `newPassword`.
    -   Update User.
- **Audit** : Créer un `AuditLog` action=`UPDATE_PASSWORD`.

### `PATCH /api/profile/theme`
- **Body** : `{ theme }`.
- **Logique** : Update simple du champ `theme`.
- **Audit** : Optionnel (souvent considéré comme "bruit").

### `POST /api/upload/avatar`
- **Body** : `FormData` (file).
- **Logique** :
    -   Valider type (image/*) et taille (< 5MB).
    -   Sauvegarder dans `public/uploads/avatars/` (Nom unique uuid).
    -   Retourner URL publique.

## 5. Dépendances à Ajouter
- `zod` : Validation schema.
- `next-themes` : Gestion du thème dark mode.
- `react-easy-crop` : UI de recadrage image.
- `react-hot-toast` ou `sonner` : Notifications.

## 6. Critères d'Acceptation (Definition of Done)

### Profil
- [ ] Je peux modifier mon Prénom, Nom, Téléphone, et Adresse.
- [ ] Je peux uploader une image, la recadrer, et la voir s'afficher comme mon avatar.
- [ ] Les modifications sont sauvegardées en base de données.
- [ ] Une entrée est ajoutée dans `AuditLog` à chaque modification.

### Sécurité
- [ ] Je peux modifier mon mot de passe en fournissant l'ancien.
- [ ] Je reçois une erreur si l'ancien mot de passe est incorrect.
- [ ] Je reçois une erreur si les deux nouveaux mots de passe ne correspondent pas.
- [ ] Je ne peux pas changer mon email sans fournir mon mot de passe actuel.

### Apparence
- [ ] Je peux changer le thème (Clair/Sombre).
- [ ] Le thème persiste après rechargement de la page (LocalStorage + DB).

### Général
- [ ] Un bouton "Déconnexion" est accessible et fonctionnel (redirection `/login`).
- [ ] L'interface est responsive (Mobile/Desktop).
