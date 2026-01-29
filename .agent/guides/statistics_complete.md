# 📊 Guide : Page Statistiques Ultra Complète

## 🎉 Statut : Implémentation Terminée !

La page de statistiques est maintenant **100% fonctionnelle** avec toutes les fonctionnalités demandées.

---

## 📍 Accès

**URL** : `/dashboard/statistiques`

---

## 🎯 Fonctionnalités Implémentées

### **1. Filtres de Période** ✅
- **Boutons rapides** :
  - Aujourd'hui
  - 7 derniers jours
  - 30 derniers jours
  - Ce mois
  - 3 derniers mois
  - Cette année
- **Sélection manuelle** : Date de début + Date de fin
- **Auto-refresh** : Les stats se mettent à jour automatiquement quand vous changez la période

### **2. KPI Cards (9 métriques)** ✅

#### 💰 Chiffre d'Affaires (CA)
- **Calcul** : Somme de tous les paiements **PAID** dans la période
- **Comparaison** : % de changement vs période précédente (vert si hausse, rouge si baisse)

#### 📈 Bénéfice Net
- **Calcul** : `CA - CPP - Commissions - Frais Fixes`
- **Frais Fixes** : Pris en compte automatiquement depuis le modèle `FixedCost`
- **Comparaison** : % de changement vs période précédente

#### 🔁 MRR (Monthly Recurring Revenue)
- **Calcul** : Somme des abonnements actifs (normalisés en mensuel)
- Abonnements annuels divisés par 12

#### ⚠️ Retards de Paiement
- **Nombre** de paiements en statut `LATE`
- **Montant total** en retard
- Carte rouge si > 0

#### 🚀 Projets Créés
- Nombre de projets créés dans la période
- Comparaison avec période précédente

#### ✅ Projets Terminés
- Nombre de projets avec statut `Terminé` dans la période
- Comparaison avec période précédente

#### 📄 Devis Envoyés
- Nombre de devis envoyés
- **Taux d'acceptation** : % de devis acceptés sur le total

#### 👥 Nouveaux Clients
- Nombre de clients créés dans la période
- Comparaison avec période précédente

#### 🎫 Demandes (Tickets)
- Nombre de tickets créés
- **Temps moyen de résolution** en heures (uniquement pour les tickets résolus)

### **3. Graphiques (2)** ✅

#### 📈 Évolution du CA
- **Type** : Courbe (Line Chart)
- **Granularité automatique** :
  - ≤ 30 jours → Par jour
  - 31-90 jours → Par semaine
  - \> 90 jours → Par mois
- **Couleur** : Vert

#### 💹 Bénéfice
- **Type** : Histogramme (Bar Chart)
- **Couleur** : Vert si positif, Rouge si négatif
- **Granularité** : Idem que le CA

### **4. Tables (2)** ✅

#### 🏆 Top 5 Clients (par CA)
- Client (nom + entreprise)
- Nombre de projets actifs
- CA total dans la période
- Dernière activité

#### 💼 Top 5 Projets (par montant)
- Nom du projet
- Client associé
- Montant
- Statut (badge coloré)
- Avancement (barre de progression)

### **5. Export CSV** ✅
- Bouton en haut à droite : **📊 Export CSV**
- Télécharge un fichier CSV avec toutes les métriques
- Nom du fichier : `statistiques_YYYY-MM-DD_YYYY-MM-DD.csv`

---

## 📊 Formule du Bénéfice (Détaillée)

```
Bénéfice = CA - Coûts Directs - Frais Fixes

Où :
  CA = Somme(Payments PAID dans période)
  
  Coûts Directs = Somme(CPP + Commissions des projets liés aux paiements)
  
  Frais Fixes = Somme(FixedCost actifs) × Nombre de mois dans la période
```

### Exemple Concret :
```
Période : 01/01/2026 - 31/01/2026 (1 mois)

CA : 25 000 €
  - Paiement 1 : 10 000 € (projet A)
  - Paiement 2 : 8 000 € (projet B)
  - Paiement 3 : 7 000 € (pas de projet lié)

Coûts Directs : 5 500 €
  - Projet A : CPP 2 000 € + Commission 500 € = 2 500 €
  - Projet B : CPP 2 500 € + Commission 500 € = 3 000 €
  - (Paiement 3 n'a pas de projet → pas de coût)

Frais Fixes Mensuels : 800 €
  - Abonnement Figma Pro : 45 €
  - Abonnement Adobe CC : 60 €
  - Loyer Co-working : 300 €
  - Hébergement serveurs : 150 €
  - Assurance Pro : 245 €
  
Bénéfice = 25 000 - 5 500 - 800 = 18 700 €
```

---

## 🛠️ Gérer les Frais Fixes

### Modèle `FixedCost`
Les frais fixes sont enregistrés dans une nouvelle table de la DB :

```typescript
{
  name: "Abonnement Figma Pro",
  amount: 45.00,         // Montant mensuel
  currency: "EUR",
  category: "SAAS",      // SAAS | RENT | SALARY | OTHER
  recurring: true,       // Récurrent ou ponctuel
  startDate: "2026-01-01",
  endDate: null          // null si toujours actif
}
```

### Comment ajouter un frais fixe ?

**Méthode 1 : Via Prisma Studio** (pour l'instant)
```bash
npx prisma studio
```
1. Ouvrir la table `FixedCost`
2. Cliquer sur **Add record**
3. Remplir les champs
4. Enregistrer

**Méthode 2 : À implémenter** (prochaine version)
- Page `/dashboard/finances/frais-fixes`
- Interface CRUD complète pour gérer les frais

### Exemples de Frais Fixes :

**SaaS / Abonnements** :
- Figma Pro : 45€/mois
- Adobe Creative Cloud : 60€/mois
- Notion Team : 15€/mois
- GitHub Pro : 10€/mois
- Google Workspace : 12€/mois

**Locaux** :
- Loyer bureau : 500€/mois
- Électricité : 80€/mois
- Internet : 40€/mois

**Autres** :
- Assurance professionnelle : 245€/mois
- Expert-comptable : 150€/mois

---

## 🎨 Design & UX

### Couleurs des KPIs
- 💰 **CA** : Vert (succès)
- 📈 **Bénéfice** : Bleu (performance)
- 🔁 **MRR** : Violet (récurrence)
- ⚠️ **Retards** : Rouge si > 0, Gris sinon
- 🚀/✅/📄/👥/🎫 : Gris neutre

### Granularité des Graphiques
Le système choisit automatiquement :
- **≤ 30 jours** : Graphique par jour (ex: 2026-01-01, 2026-01-02, ...)
- **31-90 jours** : Graphique par semaine
- **> 90 jours** : Graphique par mois

### Comparaison Période Précédente
- Si vous sélectionnez **01/01 → 27/01** (27 jours)
- La période précédente sera **05/12 → 31/12** (27 jours aussi)
- Le % est calculé : `((nouvelle - ancienne) / ancienne) × 100`

---

## ⚡ Performance

### Cache
- **Revalidation** : 5 minutes (`revalidate = 300`)
- Les stats sont mises en cache côté serveur
- Actualisation automatique toutes les 5 min

### Optimisations
- Requêtes SQL agrégées (pas de N+1)
- Granularité auto (évite trop de points sur les graphiques)
- Lazy loading des graphiques

---

## 🧪 Tester la Page

### 1️⃣ Ajouter des Frais Fixes (optionnel)
```bash
npx prisma studio
```
Ajouter quelques frais fixes dans la table `FixedCost` pour voir l'impact sur le bénéfice.

### 2️⃣ Accéder à la page
```
http://localhost:3000/dashboard/statistiques
```

### 3️⃣ Tester les filtres
- Cliquez sur **"30 jours"** → Les stats se mettent à jour
- Changez la période manuellement (ex: 01/01 - 27/01) → Auto-refresh
- Testez **"Cette année"** pour voir la granularité mensuelle

### 4️⃣ Vérifier les KPIs
- Les montants doivent correspondre à vos paiements
- Les % de changement doivent être cohérents
- Le MRR doit afficher vos abonnements actifs

### 5️⃣ Vérifier les graphiques
- Le graphique CA doit montrer l'évolution
- Le graphique Bénéfice doit être en vert si positif, rouge si négatif

### 6️⃣ Exporter CSV
- Cliquez sur **📊 Export CSV**
- Un fichier CSV doit se télécharger avec toutes les métriques

---

## 🔮 Prochaines Améliorations (Optionnelles)

### Phase 2 :
- [ ] Page `/dashboard/finances/frais-fixes` pour gérer les frais directement
- [ ] Graphique **Projets par Statut** (Donut Chart)
- [ ] Graphique **Devis par Statut** (Stacked Bar)
- [ ] Graphique **Tickets par Catégorie**
- [ ] Export PDF (en plus du CSV)
- [ ] Comparaison N-1 (même période l'année dernière)

---

## ✅ Checklist de Validation

- [x] Filtres de période fonctionnels (boutons + dates manuelles)
- [x] 9 KPI Cards affichées avec les bonnes valeurs
- [x] Comparaisons vs période précédente (%)
- [x] Graphique CA (Line Chart, vert)
- [x] Graphique Bénéfice (Bar Chart, vert/rouge)
- [x] Top 5 Clients (triés par CA)
- [x] Top 5 Projets (triés par montant)
- [x] Export CSV fonctionnel
- [x] Responsive design (mobile/tablet/desktop)
- [x] Cache 5 minutes (performances)

---

**🎉 Tout est prêt ! Testez et faites-moi savoir si vous voulez ajuster quelque chose.**
