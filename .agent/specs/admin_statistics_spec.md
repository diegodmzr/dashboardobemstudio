---
description: Specification for the Admin Statistics Dashboard (Ultra-Complete Cockpit)
---

# Admin Statistics: Cockpit Ultra Complet

## 🎯 Objectif Global

Créer une page `/admin/dashboard/statistiques` qui offre une **vue d'ensemble complète** de la performance de l'entreprise avec :
- **Visualisations graphiques** (charts)
- **KPI Cards** (métriques clés)
- **Tables de top performers**
- **Filtres de période** avancés avec comparaisons
- **Export des données**

---

## 🔍 Points à Valider / Questions

### 1. Définition du Bénéfice
**Question** : Comment définir précisément le bénéfice ?

**Option A (Simple)** :
```
Bénéfice = CA - Coûts des projets
         = Somme(Payments PAID) - Somme(Project.cpp + Project.commission)
```

**Option B (Avancée)** :
```
Bénéfice = CA - Coûts directs - Coûts indirects
         = Somme(Payments PAID) - Somme(CPP) - Somme(Commissions) - Frais fixes
```

**Proposition** : Commencer par l'Option A, puis ajouter un champ `metadata` JSON dans la DB pour les frais fixes mensuels si besoin.

### 2. Demandes (Tickets)
- Actuellement, le modèle `Ticket` n'a pas de catégorie ni de temps de traitement
- **À ajouter** : `category`, `resolvedAt`, `assignedTo` ?

### 3. Cache des statistiques
- Faut-il mettre en cache les stats pour améliorer les performances ?
- **Proposition** : Utiliser `revalidate = 300` (5 min) pour les stats

---

## 📊 Structure de la Page

### **1. Header (Filtres + Actions)**

#### Filtres de Période
- **Boutons rapides** :
  - Aujourd'hui
  - 7 derniers jours
  - 30 derniers jours
  - Ce mois-ci
  - 3 derniers mois
  - Cette année
  - Tout
- **Sélecteur personnalisé** :
  - Date de début (input date)
  - Date de fin (input date)

#### Filtres de Comparaison
- **Toggle** : Comparer avec période précédente
- **Toggle** : Comparer avec N-1 (même période l'année dernière)

#### Actions
- **Export CSV** : Bouton pour exporter toutes les données de la période sélectionnée
- **Export PDF** : Générer un rapport PDF (optionnel, phase 2)

**Rendu visuel** :
```
┌────────────────────────────────────────────────────────────────┐
│  Statistiques                                        [Export ▼]│
│  Vue d'ensemble de la performance                               │
│                                                                 │
│  [Aujourd'hui] [7j] [30j] [Ce mois] [3 mois] [Année] [Tout]   │
│  [Custom: 01/01 - 27/01]  ☐ Vs période précédente  ☐ Vs N-1   │
└────────────────────────────────────────────────────────────────┘
```

---

### **2. Section KPI Cards (Vue d'ensemble)**

Grid responsive (3-4 colonnes) avec cartes pour chaque métrique.

#### KPI 1 : Chiffre d'Affaires (CA)
- **Valeur** : `Somme(Payments WHERE status = 'PAID' AND paidAt IN period)`
- **Comparaison** : `+12.5%` vs période précédente (vert si positif, rouge si négatif)
- **Format** : Monnaie (EUR)
- **Icon** : 💰

#### KPI 2 : Bénéfice Net
- **Valeur** : `CA - Somme(Project.cpp) - Somme(Project.commission)`
- **Comparaison** : `+8.3%` vs période précédente
- **Format** : Monnaie (EUR)
- **Icon** : 📈
- **Note** : Uniquement pour les projets liés aux paiements de la période

#### KPI 3 : MRR (Monthly Recurring Revenue)
- **Valeur** : `Somme(Subscriptions WHERE status = 'active').amount (normalisé en mensuel)`
- **Comparaison** : `+15 nouveaux abonnements`
- **Format** : Monnaie (EUR) + "/mois"
- **Icon** : 🔁

#### KPI 4 : Retards de Paiement
- **Valeur** : `COUNT(Payments WHERE status = 'LATE')`
- **Sous-valeur** : Montant total en retard
- **Format** : Nombre + Montant
- **Icon** : ⚠️
- **Styling** : Rouge si > 0

#### KPI 5 : Projets Créés
- **Valeur** : `COUNT(Projects WHERE createdAt IN period)`
- **Comparaison** : `+5` vs période précédente
- **Format** : Nombre
- **Icon** : 🚀

#### KPI 6 : Projets Terminés
- **Valeur** : `COUNT(Projects WHERE status = 'Terminé' AND updatedAt IN period)`
- **Comparaison** : `+3` vs période précédente
- **Format** : Nombre
- **Icon** : ✅

#### KPI 7 : Devis Envoyés
- **Valeur** : `COUNT(Quotes WHERE status = 'SENT' AND createdAt IN period)`
- **Sous-valeur** : Taux d'acceptation (`ACCEPTED / SENT`)
- **Format** : Nombre + Pourcentage
- **Icon** : 📄

#### KPI 8 : Nouveaux Clients
- **Valeur** : `COUNT(Users WHERE role = 'CLIENT' AND createdAt IN period)`
- **Comparaison** : `+2` vs période précédente
- **Format** : Nombre
- **Icon** : 👥

#### KPI 9 : Demandes (Tickets)
- **Valeur** : `COUNT(Tickets WHERE createdAt IN period)`
- **Sous-valeur** : Temps moyen de résolution (⚠️ nécessite `resolvedAt` dans le modèle)
- **Format** : Nombre + Durée moyenne
- **Icon** : 🎫

**Rendu visuel (exemple pour 1 KPI)** :
```
┌─────────────────────────────┐
│ 💰 Chiffre d'Affaires       │
│                             │
│ 45 320,00 €                 │
│ +12.5% vs période précédente│
└─────────────────────────────┘
```

---

### **3. Section Graphiques (Charts)**

#### Chart 1 : Évolution du CA
- **Type** : Line Chart (courbe)
- **Axe X** : Temps (jours, semaines, mois selon période)
- **Axe Y** : Montant (EUR)
- **Données** : `GROUP BY paidAt::date / week / month`
- **Comparaison** : Ligne secondaire pour période précédente (gris clair)
- **Librairie** : Recharts (React) ou Chart.js

#### Chart 2 : Évolution du Bénéfice
- **Type** : Bar Chart (histogramme)
- **Axe X** : Temps
- **Axe Y** : Montant (EUR)
- **Données** : `CA - CPP - Commissions` par période
- **Couleur** : Vert si bénéfice > 0, Rouge si < 0

#### Chart 3 : Projets par Statut
- **Type** : Donut Chart (camembert)
- **Segments** : En cours, Terminé, En attente, Annulé
- **Données** : `COUNT(Projects) GROUP BY status WHERE createdAt IN period`

#### Chart 4 : Devis par Statut
- **Type** : Stacked Bar Chart (histogramme empilé)
- **Segments** : DRAFT, SENT, ACCEPTED, REJECTED
- **Axe X** : Temps
- **Données** : `COUNT(Quotes) GROUP BY status, month`

#### Chart 5 : Répartition des Demandes par Priorité
- **Type** : Bar Chart horizontal
- **Segments** : LOW, MEDIUM, HIGH, URGENT
- **Données** : `COUNT(Tickets) GROUP BY priority WHERE createdAt IN period`

**Rendu visuel (grid)** :
```
┌─────────────────────────────────────────────────────────┐
│  📈 Évolution du CA          │  💹 Bénéfice mensuel     │
│  [Line Chart]                │  [Bar Chart]             │
└──────────────────────────────┴──────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│  🎯 Projets par Statut       │  📄 Devis par Statut     │
│  [Donut Chart]               │  [Stacked Bar]           │
└──────────────────────────────┴──────────────────────────┘
```

---

### **4. Section Tables**

#### Table 1 : Top 5 Clients (par CA)
- **Colonnes** :
  - Client (nom)
  - Projets actifs
  - CA total (période)
  - Dernière activité
- **Tri** : CA DESC
- **Données** : 
```sql
SELECT 
  u.name, 
  COUNT(DISTINCT p.id) as activeProjects,
  SUM(pay.amount) as revenue,
  MAX(pay.paidAt) as lastActivity
FROM User u
JOIN Project p ON p.clientId = u.id
JOIN Payment pay ON pay.clientId = u.id AND pay.status = 'PAID'
WHERE pay.paidAt IN period
GROUP BY u.id
ORDER BY revenue DESC
LIMIT 5
```

#### Table 2 : Top 5 Projets (par montant)
- **Colonnes** :
  - Projet (nom)
  - Client
  - Montant (amount)
  - Statut
  - Avancement (%)
- **Tri** : Amount DESC
- **Données** : 
```sql
SELECT 
  p.name, 
  u.name as clientName,
  p.amount,
  p.status,
  p.progress
FROM Project p
JOIN User u ON u.id = p.clientId
WHERE p.createdAt IN period
ORDER BY p.amount DESC
LIMIT 5
```

#### Table 3 : Demandes par Catégorie (⚠️ nécessite ajout de `category` au modèle Ticket)
- **Colonnes** :
  - Catégorie
  - Nombre de demandes
  - Résolues
  - En cours
  - Temps moyen
- **Données** :
```sql
SELECT 
  category,
  COUNT(*) as total,
  COUNT(CASE WHEN status = 'CLOSED' THEN 1 END) as resolved,
  COUNT(CASE WHEN status != 'CLOSED' THEN 1 END) as open,
  AVG(EXTRACT(EPOCH FROM (resolvedAt - createdAt)) / 3600) as avgHours
FROM Ticket
WHERE createdAt IN period
GROUP BY category
```

**Rendu visuel** :
```
┌─────────────────────────────────────────────────────────┐
│  🏆 Top 5 Clients                                        │
├─────────────┬───────────┬────────────┬──────────────────┤
│ Client      │ Projets   │ CA         │ Dernière activité│
├─────────────┼───────────┼────────────┼──────────────────┤
│ Mantra Store│ 3         │ 15 000 €   │ 25 jan 2026      │
│ Client Demo │ 2         │ 8 500 €    │ 20 jan 2026      │
│ ...         │ ...       │ ...        │ ...              │
└─────────────┴───────────┴────────────┴──────────────────┘
```

---

## 🛠️ Implémentation Technique

### **1. Modèle de Données (Modifications Prisma)**

#### Extension du modèle `Ticket` (si besoin)
```prisma
model Ticket {
  id          String   @id @default(cuid())
  title       String
  status      String   // OPEN, IN_PROGRESS, CLOSED
  priority    String   // LOW, MEDIUM, HIGH, URGENT
  category    String?  // SUPPORT, BUG, FEATURE, OTHER (NOUVEAU)
  
  authorId    String
  author      User     @relation(fields: [authorId], references: [id])
  
  assignedTo  String?  // NOUVEAU (optionnel)
  
  createdAt   DateTime @default(now())
  resolvedAt  DateTime? // NOUVEAU
  updatedAt   DateTime @updatedAt
}
```

### **2. Endpoints API**

#### `GET /api/stats/overview`
Retourne les **KPIs principaux** pour la période sélectionnée.

**Query Params** :
- `startDate` : ISO string (ex: `2026-01-01`)
- `endDate` : ISO string (ex: `2026-01-27`)
- `compareWithPrevious` : boolean
- `compareWithYearAgo` : boolean

**Response** :
```json
{
  "period": {
    "start": "2026-01-01",
    "end": "2026-01-27"
  },
  "kpis": {
    "revenue": {
      "value": 45320.00,
      "change": 12.5,
      "changeType": "percentage"
    },
    "profit": {
      "value": 28450.00,
      "change": 8.3
    },
    "mrr": {
      "value": 1230.00,
      "change": 15,
      "changeType": "count"
    },
    "latePayments": {
      "count": 2,
      "amount": 450.00
    },
    "projectsCreated": {
      "value": 8,
      "change": 5
    },
    "projectsCompleted": {
      "value": 5,
      "change": 3
    },
    "quotesSent": {
      "value": 12,
      "acceptanceRate": 41.67
    },
    "newClients": {
      "value": 3,
      "change": 2
    },
    "tickets": {
      "count": 18,
      "avgResolutionHours": 24.5
    }
  }
}
```

#### `GET /api/stats/timeseries`
Retourne les **données temporelles** pour les graphiques.

**Query Params** :
- `startDate`, `endDate`
- `metric` : `revenue` | `profit`
- `granularity` : `day` | `week` | `month`

**Response** :
```json
{
  "data": [
    { "date": "2026-01-01", "value": 1200.00 },
    { "date": "2026-01-02", "value": 1500.00 },
    { "date": "2026-01-03", "value": 890.00 }
  ]
}
```

#### `GET /api/stats/top-clients`
Retourne le top 5 des clients.

**Response** :
```json
{
  "clients": [
    {
      "id": "xxx",
      "name": "Mantra Store",
      "activeProjects": 3,
      "revenue": 15000.00,
      "lastActivity": "2026-01-25"
    }
  ]
}
```

#### `GET /api/stats/top-projects`
Retourne le top 5 des projets.

#### `GET /api/stats/tickets-by-category`
Retourne les tickets groupés par catégorie.

### **3. Calculs & Agrégations**

#### Calcul du CA (Chiffre d'Affaires)
```typescript
const revenue = await prisma.payment.aggregate({
  where: {
    status: 'PAID',
    paidAt: {
      gte: startDate,
      lte: endDate,
    },
  },
  _sum: {
    amount: true,
  },
});

const ca = revenue._sum.amount || 0;
```

#### Calcul du Bénéfice
```typescript
// 1. Récupérer le CA
const ca = ...; // (voir ci-dessus)

// 2. Récupérer les paiements payés avec les projets liés
const payments = await prisma.payment.findMany({
  where: {
    status: 'PAID',
    paidAt: { gte: startDate, lte: endDate },
    projectId: { not: null },
  },
  include: {
    project: {
      select: { cpp: true, commission: true }
    }
  }
});

// 3. Calculer les coûts
const costs = payments.reduce((sum, p) => {
  const cpp = p.project?.cpp || 0;
  const commission = p.project?.commission || 0;
  return sum + cpp + commission;
}, 0);

// 4. Bénéfice = CA - Coûts
const profit = ca - costs;
```

#### Calcul du MRR
```typescript
const subscriptions = await prisma.subscription.findMany({
  where: { status: 'active' },
  select: { amount: true, interval: true }
});

const mrr = subscriptions.reduce((sum, s) => {
  // Normaliser en mensuel
  const monthly = s.interval === 'year' ? s.amount / 12 : s.amount;
  return sum + monthly;
}, 0);
```

#### Comparaison avec période précédente
```typescript
// Calculer la durée de la période
const duration = endDate - startDate; // en ms

// Période précédente
const prevStartDate = new Date(startDate.getTime() - duration);
const prevEndDate = startDate;

// Récupérer les mêmes stats pour la période précédente
const prevRevenue = await prisma.payment.aggregate({
  where: {
    status: 'PAID',
    paidAt: { gte: prevStartDate, lte: prevEndDate }
  },
  _sum: { amount: true }
});

// Calculer le changement en %
const change = ((ca - prevRevenue._sum.amount) / prevRevenue._sum.amount) * 100;
```

### **4. Cache & Performance**

#### Server-Side Caching
```typescript
// Dans la page stats (Server Component)
export const revalidate = 300; // 5 minutes

// Ou utiliser un cache externe (Redis) pour les calculs lourds
```

#### Optimisation des Requêtes
- Utiliser `aggregate()`, `groupBy()` de Prisma
- Index sur les colonnes `paidAt`, `createdAt`, `status`
- Limiter les `include` aux champs nécessaires

---

## 🎨 Design & UX

### Choix de Composants
- **Charts** : `recharts` (React)
- **Date Picker** : `react-datepicker` ou natif HTML5
- **Export CSV** : `papaparse` ou `json2csv`

### Palette de Couleurs
- **Revenue** : Vert (`#10B981`)
- **Profit** : Bleu (`#3B82F6`)
- **Danger (Retards)** : Rouge (`#EF4444`)
- **Neutral** : Gris (`#6B7280`)

### Responsive Design
- **Desktop** : Grid 3-4 colonnes pour les KPIs
- **Tablet** : Grid 2 colonnes
- **Mobile** : Grid 1 colonne, graphiques scrollables

---

## ✅ Acceptance Criteria

### Fonctionnalités de Base
- [ ] Je peux sélectionner une période (aujourd'hui, 7j, 30j, mois, année, tout)
- [ ] Je peux définir une plage de dates personnalisée
- [ ] Les KPIs affichent les bonnes valeurs pour la période sélectionnée
- [ ] Les graphiques se mettent à jour en fonction de la période

### Comparaisons
- [ ] Je peux activer/désactiver la comparaison avec la période précédente
- [ ] Les KPIs affichent le delta en % (vert si positif, rouge si négatif)
- [ ] Les graphiques affichent une courbe secondaire pour la comparaison

### Tables
- [ ] Le top 5 clients affiche les clients avec le plus de CA
- [ ] Le top 5 projets affiche les projets les plus rentables
- [ ] La table des demandes groupe par catégorie (si catégorie ajoutée au modèle)

### Export
- [ ] Je peux exporter les données en CSV
- [ ] Le CSV contient toutes les transactions de la période

### Performance
- [ ] La page se charge en moins de 2 secondes
- [ ] Les stats sont mises en cache (5 min)
- [ ] Pas de requêtes N+1

---

## 📌 Points de Validation Requis

### 1. Définition du Bénéfice
**Question** : Voulez-vous :
- ✅ **Option A** : Bénéfice = CA - CPP - Commissions (uniquement coûts directs) ?
- ⬜ **Option B** : Ajouter des frais fixes mensuels (loyer, salaires, etc.) ?

### 2. Modèle Ticket
**Question** : Voulez-vous ajouter au modèle `Ticket` :
- ⬜ `category` (SUPPORT, BUG, FEATURE, OTHER) ?
- ⬜ `resolvedAt` (pour calculer le temps de résolution) ?
- ⬜ `assignedTo` (pour savoir qui traite) ?

### 3. Granularité des Graphiques
**Question** : Comment grouper les données ?
- Période < 7j → Par jour
- Période < 3 mois → Par semaine
- Période > 3 mois → Par mois
**Confirmer** ?

### 4. Export PDF
**Question** : Voulez-vous un export PDF en plus du CSV ?
- ⬜ Oui (phase 2, avec `jsPDF` ou `puppeteer`)
- ✅ Non (CSV suffit pour commencer)

---

## 🚀 Ordre d'Implémentation Suggéré

### Phase 1 : Fondations (Core)
1. Créer les endpoints `/api/stats/overview` et `/api/stats/timeseries`
2. Implémenter les calculs de CA, Bénéfice, MRR
3. Créer la page avec KPI Cards (sans comparaison encore)

### Phase 2 : Visualisations
4. Ajouter le chart "Évolution du CA"
5. Ajouter le chart "Bénéfice mensuel"
6. Ajouter les filtres de période

### Phase 3 : Comparaisons
7. Implémenter la logique de comparaison (période précédente)
8. Afficher les deltas sur les KPIs
9. Ajouter la courbe secondaire sur les graphiques

### Phase 4 : Tables & Export
10. Créer les endpoints pour top clients, top projets
11. Afficher les tables
12. Implémenter l'export CSV

### Phase 5 : Polish
13. Optimiser les performances (cache, index)
14. Responsive design
15. Tests & débogage

---

**Estimations** :
- Phase 1-2 : ~3-4h
- Phase 3 : ~1-2h
- Phase 4 : ~1-2h
- Phase 5 : ~1h

**Total** : ~6-9h de développement

---

Voulez-vous que je commence l'implémentation ou souhaitez-vous d'abord valider les points ci-dessus ?
