# Spécification Technique : Page Détail Client (Admin)

## Contexte
L'objectif est de créer une vue détaillée complète pour chaque client dans le dashboard administrateur, permettant de gérer toutes les facettes de la relation client : informations, projets, finances et accès.

## Interface Utilisateur (UI)

L'interface sera une **Modale "Full Height"** ou une **Page dédiée** (actuellement Modale pour cohérence avec Projets). Elle sera divisée en un Header statique et une zone de contenu à Onglets.

### 1. Header (Statique)
- **Gauche** :
  - **Logo/Avatar** : Grand (80x80px), avec le logo de l'entreprise ou les initiales.
  - **Identité** : Nom du client + Nom de l'entreprise.
  - **Badges** : Statut du compte (Actif/Inactif) + Secteur.
- **Droite** :
  - **KPIs Rapides** :
    - **CA Total** : Somme des paiements "PAID" (ou montant total des projets).
    - **Projets** : Nombre de projets actifs/total.
  - **Bouton Fermer** (Croix).

### 2. Onglets de Navigation
Une barre d'onglets sous le header :
1.  **Informations** (Défaut)
2.  **Projets**
3.  **Finances** (Paiements & Devis)
4.  **Sécurité**

---

### Détail des Onglets

#### A. Onglet "Informations"
Formulaire d'édition des données client.
- **Champs** :
  - **Photo/Logo** : Champ URL (ou upload futur).
  - **Prénom & Nom** : Éditable.
  - **Email** : Éditable (avec validation unicité).
  - **Téléphone** : Éditable.
  - **Entreprise** : Nom de la société.
  - **Secteur** : Liste déroulante ou texte libre.
- **Actions** : Bouton "Enregistrer les modifications" (flottant ou en bas).

#### B. Onglet "Projets"
Liste des projets associés au client.
- **Format** : Tableau simplifié ou Cartes.
- **Colonnes** :
  - Nom du projet.
  - Type (Web, Mobile, etc.).
  - Statut (Badge coloré).
  - Progression (Barre de progression mini).
  - Montant.
- **Interaction** : Clic sur une ligne ouvre la modale "Détail Projet" (déjà existante).

#### C. Onglet "Finances"
Vue d'ensemble de la facturation.
- **Section 1 : KPIs Financiers**
  - Montant total facturé.
  - Montant en attente (Pending).
  - Montant en retard (Late).
- **Section 2 : Historique des Paiements**
  - Tableau des enregistrements `Payment`.
  - Colonnes : Date, Montant, Statut (Payé/En attente/Échec), Référence (StripeID).
- **Section 3 : Devis (Quotes)**
  - Liste rapide des devis associés.

#### D. Onglet "Sécurité" & "Actions Avancées"
Gestion des accès et du compte.
- **Changement de Mot de Passe** :
  - Champ "Nouveau mot de passe".
  - Bouton "Réinitialiser".
- **Statut du Compte** :
  - Toggle "Compte Actif / Inactif" (Empêche la connexion si inactif).
- **Fonction "Se connecter en tant que" (Impersonation)** :
  - Bouton "Voir la vue client" (Nécessite une implémentation auth spécifique).
- **Audit Logs** :
  - Liste des dernières actions sensibles sur ce compte (optionnel pour V1).

---

## Architecture Technique

### Modèle de Données (Rappel Prisma)
- `User` (Client) a des relations `One-to-Many` avec : `Project`, `Payment`, `Quote`, `Ticket`.
- Le endpoint doit charger ces relations.

### API Endpoints

#### 1. `GET /api/clients/[id]` (Amélioration)
- **Actuel** : Retourne `User` + `projects`.
- **Nouveau** : Doit inclure :
  - `projects` (id, name, status, amount, progress).
  - `payments` (id, amount, status, date, stripeId) - *limit 10 desc*.
  - `quotes` (id, reference, status, amount) - *limit 5 desc*.
  - Calculs côté serveur pour les KPIs si nécessaire.

#### 2. `PATCH /api/clients/[id]`
- Gère la mise à jour des infos de base, du mot de passe, et du statut `isActive`.
- **Sécurité** : Vérifier que l'utilisateur connecté est ADMIN.

### Sécurité & RBAC
- Seuls les utilisateurs avec `role: "ADMIN"` peuvent accéder à ces données.
- Le middleware protège déjà les routes `/dashboard...`.
- L'API doit revérifier le rôle avant d'effectuer des écritures.

## Plan d'Implémentation
1.  **Mise à jour API** : Modifier `GET /api/clients/[id]/route.ts` pour inclure paiements et devis.
2.  **Composants UI** :
    - Créer `ClientDetailTabs.tsx` pour gérer la navigation interne.
    - Créer les sous-composants : `ClientInfoTab`, `ClientProjectsTab`, `ClientFinanceTab`, `ClientSecurityTab`.
3.  **Intégration** : Mettre à jour `ClientDetailModal` pour utiliser ces onglets et charger les données complètes via un fetch SWR ou useEffect au montage (car la liste principale n'a pas tout).

## Points de Validation (Pour le User)
- [ ] Confirmer la liste des onglets (Infos, Projets, Finances, Sécurité).
- [ ] Confirmer que l'adresse postale n'est pas requise pour l'instant (absente du schéma).
- [ ] La fonction "Impersonation" (Se connecter en tant que) est-elle prioritaire pour cette version ?
