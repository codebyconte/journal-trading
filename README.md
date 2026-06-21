# TradingLog — Journal de Swing Trading 4H

Application locale Next.js + Neon PostgreSQL, dark mode style TradingView/Hyperliquid.

---

## Installation complète (étape par étape)

### Étape 1 — Homebrew + Node.js

Dans ton terminal :

```bash
# Activer Homebrew (si pas encore fait)
eval "$(/opt/homebrew/bin/brew shellenv zsh)"
echo 'eval "$(/opt/homebrew/bin/brew shellenv zsh)"' >> ~/.zprofile

# Installer Node.js 20
brew install node@20
echo 'export PATH="/opt/homebrew/opt/node@20/bin:$PATH"' >> ~/.zprofile
source ~/.zprofile

# Vérifier
node --version   # doit afficher v20.x.x
npm --version    # doit afficher 10.x.x
```

---

### Étape 2 — Base de données Neon (PostgreSQL cloud gratuit)

1. Va sur **https://neon.tech** → crée un compte gratuit
2. Crée un projet → nomme-le `trading-journal`
3. Dans ton projet → **Connection Details** → sélectionne **Pooled connection**
4. Copie l'URL (commence par `postgresql://...`)
5. Ouvre le fichier `~/Projects/trading-journal/.env`
6. Remplace les deux URL par tes vraies URLs Neon :

```
DATABASE_URL="postgresql://USER:PASSWORD@ep-xxx.region.aws.neon.tech/neondb?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://USER:PASSWORD@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
```

> `DATABASE_URL` = connection **poolée** (avec `pgbouncer=true`)  
> `DIRECT_URL` = connection **directe** (sans pgbouncer) — utilisée pour les migrations

---

### Étape 3 — Installer les dépendances

```bash
cd ~/Projects/trading-journal
npm install
```

---

### Étape 4 — Initialiser la base de données

```bash
npm run db:push
```

---

### Étape 5 — Lancer l'application

```bash
npm run dev
```

Ouvre **http://localhost:3000** dans ton navigateur.

---

## Fonctionnalités

### Dashboard
- Capital total avec equity curve animée
- Win Rate, Profit Factor, R/R moyen, Expectancy
- Max Drawdown, Streak actuel
- Health Check du protocole (vert/orange/rouge)

### Trades
- Formulaire chirurgical avec calculateur auto de position (1% risque)
- Checklist de confluence obligatoire (5 points)
- Upload/coller screenshot TradingView (Ctrl+V)
- État émotionnel 1-10
- Gestion Pending → Open → Closed
- Clôture avec prévisualisation P&L en temps réel + R-Multiple

### Analytics
- Performance par actif, setup, jour de la semaine
- Distribution R-Multiple (histogramme)
- Analyse MAE/MFE (scatter plot)
- Performance par état émotionnel
- Stats LONG vs SHORT

### Journal
- Calendrier mensuel avec indicateur de mood coloré
- Prompts de réflexion guidés
- Historique des entrées

### Paramètres
- Capital initial / Capital actuel
- % de risque par trade avec simulateur live
- Règles du protocole Swing 4H

---

## Métriques clés

| Métrique | Objectif Swing 4H |
|----------|------------------|
| Win Rate | ≥ 50% |
| Profit Factor | ≥ 1.5 |
| R/R moyen | ≥ 1.5R |
| Max Drawdown | ≤ 10% |
| Risque/trade | 1% capital |
| Expectancy | > 0 $ |

---

## Stack technique
- **Next.js 14** (App Router)
- **Prisma ORM** + **Neon PostgreSQL** (cloud gratuit)
- **Tailwind CSS** (dark theme TradingView-inspired)
- **Recharts** (graphiques)
- **TypeScript** strict
# journal-trading
# journal-trading
