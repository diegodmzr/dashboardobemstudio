# Spécification Fonctionnelle & Technique : Gestion des Clients (Admin)

## 1. Objectif
Fournir une interface premium et performante pour la gestion centralisée des clients de l'agence (OBEM Studio). Cette page doit permettre de visualiser, créer, modifier et suivre les clients, en lien avec leurs projets et données financières.

## 2. Interface Utilisateur (UI/UX)

### 2.1. Page `/admin/clients`
- **Header Premium** : Titre "Clients", sous-titre descripteur, KPIs rapides en haut (Total Clients, Clients Actifs, CA Total Global - optionnel).
- **Toolbar** :
    - **Recherche** : Champ de recherche fluide (Nom, Prénom, Email, Entreprise) avec debouncing.
    - **Filtres** : "Statut" (Actif/Inactif), "Secteur" (optionnel).
    - **Actions** : Bouton principal "Nouveau Client" (Noir, arrondi).

### 2.2. Tableau de Données (Data Grid)
Design épuré, monochrome, très lisible.
Colonnes :
1.  **Client** : Avatar/Logo + Nom complet + Entreprise (en sous-texte gris).
2.  **Contact** : Email + (Téléphone au survol ou icône).
3.  **Projets** : Nombre de projets actifs/total (Badge).
4.  **CA Généré** : Montant total facturé (basé sur les paiements Stripe/Manuel).
5.  **Date d'entrée** : Date de création (`createdAt`).
6.  **Statut** : Badge (Actif = Vert/Noir, Inactif = Gris).
7.  **Actions** : Bouton "Détails" (œil) ou menu contextuel (Modifier, Réinitialiser MDP, Supprimer).

### 2.3. Modale Client (Création / Édition / Détail)
Une modale "Enhanced" similaire à celle des Projets.
- **Header** : Nom du client + Statut.
- **Onglet "Informations"** :
    - Photo/Logo (Upload ou Placeholder).
    - Prénom, Nom.
    - Email (Unique).
    - Téléphone.
    - Nom de l'entreprise.
    - Secteur d'activité.
    - Adresse (Facturation).
- **Onglet "Finances & Projets"** (Vue Lecture seule ou liens) :
    - Liste des projets associés.
    - Total facturé.
    - Lien Stripe (si applicable).
- **Zone "Sécurité"** :
    - Bouton "Envoyer email de réinitialisation de mot de passe".
    - Toggle "Compte Actif/Inactif".

## 3. Modèle de Données (Prisma Schema)

Mise à jour du modèle `User` et ajout d'une relation optionnelle pour les détails "Entreprise".

```prisma
// Extension du modèle User existant ou ajout de champs
model User {
  id            String    @id @default(cuid())
  name          String?   // Nom complet
  email         String    @unique
  role          String    @default("CLIENT") // "ADMIN" | "CLIENT"
  
  // Nouveaux champs pour Clients
  phone         String?
  companyName   String?
  sector        String?
  isActive      Boolean   @default(true)
  stripeCustomerId String? // Pour lien Stripe
  
  projects      Project[]
  auditLogs     AuditLog[]
  payments      Payment[] // Relation vers paiements pour calcul CA
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
// Note: Pas besoin de modèle "ClientProfile" séparé si les champs sont peu nombreux, 
// l'intégration directe dans User est plus simple pour l'accès.
```

## 4. API & Logique Métier

### 4.1. `GET /api/clients`
- **Params** : `search`, `status`, `sort`.
- **Logic** : `prisma.user.findMany` avec `where: { role: 'CLIENT' }`.
- **Computed** : Calcul du CA total (somme des `Payment` liés) et comptage des projets (`_count`).

### 4.2. `POST /api/clients`
- **Body** : `name`, `email`, `companyName`, `phone`, `sector`.
- **Logic** : 
    - Vérifier unicité email.
    - Créer `User` avec mot de passe temporaire (ou généré aléatoirement et non envoyé, invitation par email futur).
    - Créer `AuditLog`.

### 4.3. `PATCH /api/clients/[id]`
- Mise à jour des infos profil.
- Archivage (Soft delete via `isActive: false`).

## 5. Acceptance Criteria
- [ ] Je peux voir la liste des clients avec leur CA total calculé dynamiquement.
- [ ] Je peux rechercher un client par son nom d'entreprise.
- [ ] Je peux créer un nouveau client sans définir de mot de passe (flow d'invitation ou gestion admin).
- [ ] Le design respecte la charte "Premium Monochrome" (Noir/Blanc/Gris).
- [ ] Les données sensibles (Password) ne sont jamais exposées.

## 6. Points à Valider
- Gestion des mots de passe : Pour l'instant, création sans mot de passe (ou mot de passe par défaut à changer) ? -> *Proposition : Mot de passe généré aléatoirement à la création, possibilité d'envoyer un lien reset.*
- Upload Logo Entreprise : Stockage local ou DB (Blob) ? -> *Pour l'instant, pas d'upload fichier complexe, URL ou placeholder.*
