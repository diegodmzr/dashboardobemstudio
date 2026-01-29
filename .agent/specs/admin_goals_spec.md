# 🎯 Spécification : Page Objectifs Admin

## 📋 Vue d'Ensemble

**Route** : `/dashboard/objectifs`  
**Titre** : Objectifs & Performance  
**Rôle requis** : ADMIN  

### Objectif Global
Système de définition, suivi et visualisation d'objectifs business (financiers et volumétriques) avec tracking automatique et courbes de progression en temps réel.

---

## 🎯 Types d'Objectifs Disponibles

### **Financiers**
| Type | Description | Source Auto | Unité |
|------|-------------|-------------|--------|
| `REVENUE` | Chiffre d'affaires | Somme payments PAID | € |
| `PROFIT` | Bénéfice net | CA - Coûts - Frais fixes | € |
| `MRR` | Revenu récurrent mensuel | Active subscriptions | €/mois |
| `AVERAGE_DEAL_SIZE` | Montant moyen par projet | Avg(projects.amount) | € |

### **Volumétriques**
| Type | Description | Source Auto | Unité |
|------|-------------|-------------|--------|
| `NEW_CLIENTS` | Nouveaux clients | User.createdAt (role=CLIENT) | count |
| `PROJECTS_CREATED` | Projets créés | Project.createdAt | count |
| `PROJECTS_COMPLETED` | Projets terminés | Project (status=Terminé) | count |
| `QUOTES_SENT` | Devis envoyés | Quote (status=SENT) | count |
| `QUOTES_ACCEPTED` | Devis acceptés | Quote (status=ACCEPTED) | count |
| `CONVERSION_RATE` | Taux de conversion devis | (Accepted / Sent) × 100 | % |

---

## 🗄️ Modèle de Données

### **Goal**
```prisma
model Goal {
  id            String   @id @default(cuid())
  
  // Identification
  title         String   // "CA 2026", "100 Nouveaux Clients"
  description   String?  // Note optionnelle
  
  // Type & Configuration
  type          String   // REVENUE | PROFIT | MRR | NEW_CLIENTS | PROJECTS_CREATED | etc.
  targetValue   Float    // Valeur cible (ex: 500000 pour 500k€)
  currentValue  Float    @default(0) // Valeur actuelle
  
  // Période
  startDate     DateTime
  endDate       DateTime
  
  // Comportement
  continuous    Boolean  @default(false) // true = reste actif après atteinte
  autoTracking  Boolean  @default(true)  // true = calcul auto, false = manuel
  
  // Statut (calculé)
  status        String   @default("ACTIVE") // ACTIVE | COMPLETED | ARCHIVED
  completedAt   DateTime?
  
  // Historique de progression
  progress      GoalProgress[]
  
  // Métadonnées
  metadata      String?  // JSON pour config avancée
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model GoalProgress {
  id        String   @id @default(cuid())
  goalId    String
  goal      Goal     @relation(fields: [goalId], references: [id], onDelete: Cascade)
  
  value     Float    // Valeur à ce moment
  date      DateTime @default(now())
  
  // Source
  isManual  Boolean  @default(false) // true si ajusté manuellement
  note      String?  // Note optionnelle pour ajustement manuel
  
  createdAt DateTime @default(now())
  
  @@index([goalId, date])
}
```

---

## 🎨 Interface Utilisateur

### **1. Page Principale : Listing des Objectifs**

#### **Header**
```
┌─────────────────────────────────────────────────────────┐
│ Objectifs & Performance                                 │
│ Suivez la progression de vos objectifs business        │
│                                  [+ Nouvel Objectif]    │
└─────────────────────────────────────────────────────────┘
```

#### **Filtres**
```
[ Tous ] [ 🎯 Actifs ] [ ✅ Atteints ] [ 📦 Archivés ]
[ 2026 ▾ ] [ Financiers ▾ ] [ Volumétriques ▾ ]
```

#### **Grid de Cards d'Objectifs**
```
┌───────────────────────────────────────────┐
│ 🎯 CA 2026                          [···] │
│ Chiffre d'Affaires                        │
│                                           │
│ 325 000 € / 500 000 €                    │
│ ████████░░░░░░░░░░ 65%                   │
│                                           │
│ 📅 01/01/26 - 31/12/26                   │
│ ⏱️  125 jours restants                    │
│ 📊 +12% vs période précédente            │
│                                           │
│ [ Voir détails ]                          │
└───────────────────────────────────────────┘
```

**Éléments de la Card** :
- **Icône du type** (Euro, Users, Briefcase, etc.)
- **Titre** (éditable)
- **Type d'objectif** (badge coloré)
- **Progression** :
  - Valeur actuelle / Cible
  - Barre de progression (avec animation)
  - Pourcentage
- **Période** :
  - Dates début/fin
  - Jours restants (si ACTIVE)
  - OU "Objectif atteint" (si COMPLETED)
- **Tendance** (variation vs période précédente)
- **Actions** : Voir détails, Éditer, Archiver

#### **États de la Barre de Progression**
- `< 50%` : Rouge/Orange (alerte)
- `50-75%` : Jaune (en cours)
- `75-99%` : Bleu (presque là)
- `≥ 100%` : Vert (atteint) avec animation ✨

---

### **2. Modal : Créer/Éditer Objectif**

```
┌────────────────────────────────────────────────┐
│ Nouvel Objectif                          [✕]  │
├────────────────────────────────────────────────┤
│                                                │
│ Titre *                                        │
│ ┌────────────────────────────────────┐        │
│ │ CA 2026                            │        │
│ └────────────────────────────────────┘        │
│                                                │
│ Type d'objectif *                              │
│ ┌────────────────────────────────────┐        │
│ │ Chiffre d'Affaires (€)        ▾   │        │
│ └────────────────────────────────────┘        │
│                                                │
│ Valeur cible *                                 │
│ ┌────────────────────────────────────┐        │
│ │ 500 000 €                          │        │
│ └────────────────────────────────────┘        │
│                                                │
│ Période                                        │
│ ┌──────────────┐  ┌──────────────┐           │
│ │ 01/01/2026   │  │ 31/12/2026   │           │
│ └──────────────┘  └──────────────┘           │
│                                                │
│ ☐ Garder actif après atteinte (continu)       │
│ ☑ Tracking automatique (depuis stats)         │
│                                                │
│ Description (optionnelle)                      │
│ ┌────────────────────────────────────┐        │
│ │ Objectif annuel de CA pour 2026    │        │
│ └────────────────────────────────────┘        │
│                                                │
│           [Annuler]  [Créer l'objectif]       │
└────────────────────────────────────────────────┘
```

**Validation** :
- `title` : requis, max 100 chars
- `type` : requis, doit être dans la liste
- `targetValue` : requis, > 0
- `startDate` < `endDate`
- `endDate` ne peut pas être dans le passé (pour création)

---

### **3. Page Détails : Vue Individuelle d'Objectif**

**Route** : `/dashboard/objectifs/[id]`

```
┌─────────────────────────────────────────────────────────┐
│ ← Retour                                                │
│                                                         │
│ 🎯 CA 2026                                        [···] │
│ Chiffre d'Affaires                                      │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐│
│ │                                                     ││
│ │        325 000 € / 500 000 €                       ││
│ │        ████████████░░░░░░░ 65%                     ││
│ │                                                     ││
│ │  Il vous reste 175 000 € pour atteindre l'objectif ││
│ │  📅 125 jours restants (se termine le 31/12/2026)  ││
│ │                                                     ││
│ └─────────────────────────────────────────────────────┘│
│                                                         │
│ 📊 Évolution de la Progression                         │
│ ┌─────────────────────────────────────────────────────┐│
│ │                                        Target ─────  ││
│ │ 500k│                            ╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱   ││
│ │     │                       ╱░░░░                   ││
│ │     │                  ╱░░░░                        ││
│ │     │             ╱░░░░                             ││
│ │     │        ╱░░░░                                  ││
│ │   0 └────────────────────────────────────────────   ││
│ │     Jan  Fev  Mar  Avr  Mai  Jun  Jul  Aou  Sep... ││
│ └─────────────────────────────────────────────────────┘│
│                                                         │
│ 📈 Statistiques                                         │
│ ┌──────────────┬──────────────┬──────────────┐        │
│ │ Progression  │ Rythme       │ Prédiction   │        │
│ │ +12%/semaine │ 2 083 €/jour │ ✅ Atteignable│        │
│ └──────────────┴──────────────┴──────────────┘        │
│                                                         │
│ 🕐 Historique de Progression (30 derniers jours)       │
│ ┌─────────────────────────────────────────────────────┐│
│ │ 27/01/2026  325 000 €  (+5 000 €)  Auto            ││
│ │ 26/01/2026  320 000 €  (+3 500 €)  Auto            ││
│ │ 25/01/2026  316 500 €  (+0 €)      Auto            ││
│ │ 24/01/2026  316 500 €  (+8 000 €)  ✏️ Manuel       ││
│ └─────────────────────────────────────────────────────┘│
│                                                         │
│ [ Ajuster manuellement ]  [ Archiver objectif ]        │
└─────────────────────────────────────────────────────────┘
```

**Graphique de Progression** :
- **Courbe bleue** : Progression réelle (valeur jour par jour)
- **Ligne pointillée grise** : Cible (ligne droite si répartition uniforme, ou courbe intelligente)
- **Zone de remplissage** : Entre 0 et progression actuelle
- **Indicateur visuel** : Couleur change selon proximité de la cible

**Statistiques Calculées** :
- **Progression moyenne** : `Δ valeur / Δ temps` (par semaine)
- **Rythme actuel** : `currentValue / jours écoulés` (par jour)
- **Prédiction** : 
  - Si `rythme actuel × jours restants + currentValue >= targetValue` → ✅ Atteignable
  - Sinon → ⚠️ Risque de non-atteinte

---

## 🔧 Endpoints API

### **1. GET `/api/goals`**
Liste tous les objectifs avec leur progression.

**Query Params** :
- `status` : `ACTIVE` | `COMPLETED` | `ARCHIVED`
- `year` : Filter par année (ex: `2026`)
- `type` : Filter par type (ex: `REVENUE`)

**Response** :
```json
{
  "goals": [
    {
      "id": "goal_123",
      "title": "CA 2026",
      "description": null,
      "type": "REVENUE",
      "targetValue": 500000,
      "currentValue": 325000,
      "startDate": "2026-01-01T00:00:00Z",
      "endDate": "2026-12-31T23:59:59Z",
      "continuous": false,
      "autoTracking": true,
      "status": "ACTIVE",
      "completedAt": null,
      "progressPercentage": 65,
      "daysRemaining": 125,
      "avgProgressPerWeek": 5200,
      "isPredictedToSucceed": true,
      "createdAt": "2026-01-01T10:00:00Z"
    }
  ]
}
```

### **2. POST `/api/goals`**
Créer un nouvel objectif.

**Body** :
```json
{
  "title": "CA 2026",
  "description": "Objectif annuel de CA",
  "type": "REVENUE",
  "targetValue": 500000,
  "startDate": "2026-01-01",
  "endDate": "2026-12-31",
  "continuous": false,
  "autoTracking": true
}
```

**Response** : `201 Created` + Goal créé

### **3. PATCH `/api/goals/[id]`**
Mettre à jour un objectif (titre, dates, target, etc.).

**Body** : Partial Goal
**Response** : `200 OK` + Goal mis à jour

### **4. DELETE `/api/goals/[id]`**
Supprimer (archiver) un objectif.

**Response** : `200 OK`

### **5. GET `/api/goals/[id]`**
Détails d'un objectif + historique de progression.

**Response** :
```json
{
  "goal": { /* ... */ },
  "progressHistory": [
    {
      "id": "prog_1",
      "value": 325000,
      "date": "2026-01-27T10:00:00Z",
      "isManual": false,
      "note": null
    },
    // ... 30 derniers jours
  ],
  "stats": {
    "avgProgressPerWeek": 5200,
    "avgProgressPerDay": 743,
    "remainingToTarget": 175000,
    "isPredictedToSucceed": true,
    "requiredDailyPace": 1400
  }
}
```

### **6. PUT `/api/goals/[id]/progress`**
Ajuster manuellement la progression (si `autoTracking = false` ou override).

**Body** :
```json
{
  "value": 330000,
  "note": "Ajustement suite à paiement hors système"
}
```

**Response** : `200 OK` + GoalProgress créé

### **7. POST `/api/goals/compute-progress`**
Recalcule la progression de tous les objectifs avec `autoTracking = true`.  
**Exécuté** : 
- Automatiquement via cron (quotidien à minuit)
- Manuellement via bouton admin

**Logic** :
```typescript
For each Goal with autoTracking = true:
  value = calculateCurrentValue(goal.type, goal.startDate, now)
  
  goal.currentValue = value
  
  if (value >= goal.targetValue && !goal.continuous):
    goal.status = "COMPLETED"
    goal.completedAt = now
  
  GoalProgress.create({
    goalId,
    value,
    date: now,
    isManual: false
  })
```

---

## 📊 Calcul Automatique de Progression

### **Fonction `calculateCurrentValue(type, startDate, endDate)`**

```typescript
async function calculateCurrentValue(
  type: GoalType,
  startDate: Date,
  endDate: Date
): Promise<number> {
  const now = new Date();
  const effectiveEnd = now < endDate ? now : endDate;

  switch (type) {
    case "REVENUE":
      const payments = await prisma.payment.aggregate({
        where: {
          status: "PAID",
          paidAt: { gte: startDate, lte: effectiveEnd },
        },
        _sum: { amount: true },
      });
      return payments._sum.amount || 0;

    case "PROFIT":
      // Similar to stats/overview
      const revenue = await calculateCurrentValue("REVENUE", startDate, effectiveEnd);
      const costs = await calculateCosts(startDate, effectiveEnd);
      return revenue - costs;

    case "MRR":
      // Take latest MRR snapshot (sum of active subscriptions)
      const subs = await prisma.subscription.findMany({
        where: { status: "active" },
        select: { amount: true, interval: true },
      });
      return subs.reduce((sum, s) => {
        const monthly = s.interval === "year" ? s.amount / 12 : s.amount;
        return sum + monthly;
      }, 0);

    case "NEW_CLIENTS":
      return await prisma.user.count({
        where: {
          role: "CLIENT",
          createdAt: { gte: startDate, lte: effectiveEnd },
        },
      });

    case "PROJECTS_CREATED":
      return await prisma.project.count({
        where: { createdAt: { gte: startDate, lte: effectiveEnd } },
      });

    case "PROJECTS_COMPLETED":
      return await prisma.project.count({
        where: {
          status: "Terminé",
          updatedAt: { gte: startDate, lte: effectiveEnd },
        },
      });

    case "QUOTES_SENT":
      return await prisma.quote.count({
        where: {
          status: "SENT",
          createdAt: { gte: startDate, lte: effectiveEnd },
        },
      });

    case "QUOTES_ACCEPTED":
      return await prisma.quote.count({
        where: {
          status: "ACCEPTED",
          createdAt: { gte: startDate, lte: effectiveEnd },
        },
      });

    case "CONVERSION_RATE":
      const totalSent = await prisma.quote.count({
        where: { createdAt: { gte: startDate, lte: effectiveEnd } },
      });
      const accepted = await prisma.quote.count({
        where: {
          status: "ACCEPTED",
          createdAt: { gte: startDate, lte: effectiveEnd },
        },
      });
      return totalSent > 0 ? (accepted / totalSent) * 100 : 0;

    default:
      return 0;
  }
}
```

---

## 🎨 Composants UI

### **GoalCard.tsx**
Carte individuelle d'objectif dans le grid.

**Props** :
```ts
{
  goal: Goal;
  onClick: () => void;
  onEdit: () => void;
  onArchive: () => void;
}
```

### **GoalModal.tsx**
Modal pour créer/éditer un objectif.

**Props** :
```ts
{
  isOpen: boolean;
  onClose: () => void;
  goal?: Goal | null; // null = create, Goal = edit
  onSubmit: (data: GoalInput) => void;
}
```

### **GoalProgressChart.tsx**
Graphique de progression (Recharts Line Chart).

**Props** :
```ts
{
  progressHistory: GoalProgress[];
  targetValue: number;
  startDate: Date;
  endDate: Date;
}
```

### **GoalStatsPanel.tsx**
Panneau de statistiques prédictives.

**Props** :
```ts
{
  goal: Goal;
  stats: {
    avgProgressPerWeek: number;
    isPredictedToSucceed: boolean;
    requiredDailyPace: number;
  };
}
```

---

## 🧪 Tests & Validation

### **Critères d'Acceptation**

#### **Création d'Objectif**
- ✅ Un objectif est créé avec tous les champs requis
- ✅ Si `autoTracking = true`, la première valeur est calculée immédiatement
- ✅ Un `GoalProgress` initial est créé automatiquement à `startDate`

#### **Calcul Automatique**
- ✅ La progression est recalculée quotidiennement via cron
- ✅ Les calculs correspondent exactement aux stats de `/api/stats/overview`
- ✅ Quand `currentValue >= targetValue` et `continuous = false`, le statut passe à `COMPLETED`

#### **Override Manuel**
- ✅ Un admin peut ajuster manuellement la valeur (même si `autoTracking = true`)
- ✅ L'override manuel est marqué dans `GoalProgress.isManual = true`
- ✅ Les calculs auto suivants ne suppriment pas les overrides manuels

#### **Visualisations**
- ✅ La barre de progression reflète le pourcentage réel
- ✅ Le graphique affiche correctement l'historique sur 30 jours
- ✅ Les couleurs changent selon la proximité de la cible (< 50%, 50-75%, 75-99%, ≥100%)

#### **Performance**
- ✅ Le listing de 50+ objectifs se charge en < 500ms
- ✅ Le calcul de progression pour 1 objectif prend < 100ms
- ✅ Le recalcul global (cron) pour tous les objectifs prend < 5s

---

## 🔮 Points à Valider

### **1. Progression : Auto, Manuel, ou Hybride ?**

**Option A (Recommandée) : Hybride**
- Par défaut : `autoTracking = true` (calcul auto quotidien)
- Possibilité d'override manuel à tout moment
- Les deux coexistent dans `GoalProgress` (flag `isManual`)

**Option B : Strictement Manuel**
- `autoTracking = false` pour tous
- Admin saisit manuellement chaque progression
- Plus de contrôle, mais plus de travail

**Option C : Strictement Auto**
- Pas d'override possible
- Simplifie le code, mais moins flexible

### **2. Types d'Objectifs**

La liste ci-dessus est-elle complète ? Faut-il ajouter :
- `CUSTOMER_LIFETIME_VALUE` (CLV) ?
- `CHURN_RATE` (taux d'attrition) ?
- `AVERAGE_PROJECT_DURATION` (durée moyenne projet) ?
- `TEAM_SIZE` (objectif d'embauche) ?

### **3. Notifications**

Voulez-vous des notifications quand :
- Un objectif est atteint (100%) ?
- Un objectif risque de ne pas être atteint (prédiction négative) ?
- Un objectif est en bonne voie (75% atteint) ?

Si oui :
- Email ?
- Toast dans l'app ?
- Dashboard widget ?

### **4. Granularité de l'Historique**

`GoalProgress` doit stocker :
- Un point par jour (quotidien) ? ← **Recommandé**
- Un point par semaine (hebdomadaire) ?
- Un point par heure (temps réel) ?

### **5. Objectifs d'Équipe vs Personnels**

Uniquement objectifs globaux (entreprise) ou aussi :
- Objectifs par utilisateur (ex: "Jean doit signer 10 projets") ?
- Objectifs par équipe ?

### **6. Archive vs Suppression**

Quand on "supprime" un objectif :
- **Archive** : `status = "ARCHIVED"`, les données restent
- **Suppression définitive** : Supprime l'objectif ET son historique

Préférence ?

---

## 🚀 Plan d'Implémentation Suggéré

### **Phase 1 : Base (Core Functionality)**
1. Créer les modèles `Goal` + `GoalProgress` dans Prisma
2. Endpoint `POST /api/goals` (création)
3. Endpoint `GET /api/goals` (listing)
4. Page `/dashboard/objectifs` avec grid de cards basique
5. Modal de création
6. Calcul auto pour les types financiers (REVENUE, PROFIT, MRR)

**Estimé** : 3-4h

### **Phase 2 : Progression & Visualisation**
1. Endpoint `GET /api/goals/[id]` (détails + historique)
2. Fonction `calculateCurrentValue()` pour tous les types
3. Page détails avec graphique Recharts
4. Panneau de stats prédictives
5. Cron job quotidien (`POST /api/goals/compute-progress`)

**Estimé** : 3-4h

### **Phase 3 : Avancé (Override & Polish)**
1. Endpoint `PUT /api/goals/[id]/progress` (override manuel)
2. Modal d'ajustement manuel
3. Filtres avancés (année, type, statut)
4. Animations de progression (confetti quand 100%)
5. Tests E2E

**Estimé** : 2-3h

### **Phase 4 : Optionnel (Notifications & Extras)**
1. Système de notifications (email/toast)
2. Export CSV/PDF des objectifs
3. Objectifs récurrents (ex: "100k CA chaque trimestre")
4. Comparaison multi-objectifs

**Estimé** : 2-3h

**Total** : 10-14h

---

## 📚 Ressources Techniques

### **Librairies Nécessaires**
- ✅ `recharts` (déjà installé pour stats)
- ✅ `date-fns` (déjà installé)
- ✅ `lucide-react` (déjà installé pour icônes)

### **Cron Job (Auto-computation)**

**Option 1 : Vercel Cron** (recommandé)
```json
// vercel.json
{
  "crons": [{
    "path": "/api/goals/compute-progress",
    "schedule": "0 0 * * *" // Tous les jours à minuit
  }]
}
```

**Option 2 : Node-cron** (local dev)
```typescript
import cron from 'node-cron';

cron.schedule('0 0 * * *', async () => {
  await computeAllGoalsProgress();
});
```

---

## ✅ Checklist de Validation Finale

Avant de démarrer l'implémentation, valider :
- [ ] **Progression** : Hybride (auto + override manuel) ?
- [ ] **Types d'objectifs** : Liste complète ou ajouts ?
- [ ] **Notifications** : Email/Toast ou non ?
- [ ] **Granularité** : Quotidien (1 point/jour) ?
- [ ] **Scope** : Objectifs globaux uniquement ?
- [ ] **Archive/Suppression** : Archive (soft delete) ou suppression définitive ?

---

**🎯 Spécification complète prête à implémenter !**

Dites-moi vos réponses aux points de validation et je démarre le développement ! 🚀
