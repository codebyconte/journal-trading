'use client'

import { useState, useMemo } from 'react'
import {
  Library,
  Search,
  ExternalLink,
  ChevronRight,
  GraduationCap,
  Building2,
  Activity,
  Database,
  X,
  Star,
  BookOpen,
  Sparkles,
  FileText,
  Landmark,
  Layers,
  ChevronDown,
  ChevronUp,
  Zap,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

type Category = 'academic' | 'institutional' | 'onchain' | 'data'

interface Metric {
  label: string
  value: string
}

interface Source {
  id: string
  institution: string
  country: string
  category: Category
  title: string
  authors?: string
  year?: number
  url: string
  institutionUrl: string
  indicators: string[]
  /** Résumé ultra-court visible par défaut */
  summary: string
  /** Explication claire — de quoi ça parle en language simple */
  explanation: string
  /** Étapes concrètes pour appliquer dans son trading */
  howToApply: string[]
  metrics?: Metric[]
  featured?: boolean
}

// ─────────────────────────────────────────────────────────────
// DATA — 23 sources avec explications détaillées
// ─────────────────────────────────────────────────────────────

const SOURCES: Source[] = [
  // ══════════════════ ACADÉMIQUE ══════════════════

  {
    id: 'eth-zurich-2019',
    institution: 'ETH Zürich',
    country: '🇨🇭',
    category: 'academic',
    title: 'Backtesting of Trading Strategies for Bitcoin',
    authors: 'Michael Glücksmann',
    year: 2019,
    url: 'https://ethz.ch/content/dam/ethz/special-interest/mtec/chair-of-entrepreneurial-risks-dam/documents/dissertation/master%20thesis/Master_Thesis_Gl%C3%BCcksmann_13June2019.pdf',
    institutionUrl: 'https://mtec.ethz.ch/research/entrepreneurial-risks.html',
    indicators: ['EMA Crossover', 'ATR', 'Bollinger Bands'],
    summary: "Les croisements EMA seuls sont médiocres. Ajouter un filtre ATR (volatilité) fait passer le Sharpe de 1.1 à 3.2 et réduit le drawdown à 25%.",
    explanation:
      "L'étude a pris les données horaires BTC/USD et testé des dizaines de stratégies. Résultat surprenant : les croisements de moyennes mobiles (EMA) seuls génèrent des signaux incorrects pendant les phases de forte volatilité (liquidations en cascade, news, etc.). En ajoutant l'ATR (Average True Range) comme filtre, on dit au système : « n'entre pas quand le marché est en mode explosion ». L'ATR mesure l'amplitude moyenne des bougies récentes — quand il est 2× ou 3× sa valeur normale, le marché est en régime chaotique et les signaux EMA deviennent non-fiables. Ce filtre simple fait passer le ratio de Sharpe de 1.1 (Buy & Hold basique) à 3.2, ce qui signifie que pour chaque unité de risque, tu gagnes 3× plus. Le drawdown maximum chute de 85% à seulement 25%, ce qui est remarquable pour un actif aussi volatil que le Bitcoin.",
    howToApply: [
      "Avant chaque entrée sur signal EMA, vérifie l'ATR(14) sur le 4H. Si l'ATR est > 2× sa valeur des 20 dernières bougies → skip ce trade.",
      "En pratique : sur TradingView, ajoute ATR(14) en sous-graphique. Calcule la moyenne des 20 dernières valeurs ATR. Si la valeur actuelle dépasse le double → volatilité trop haute → attends.",
      "Le protocole 4H applique déjà ce principe via le filtre de volume (>120% moyenne) et les conditions CryptoQuant — ce sont des proxies de régime de volatilité.",
      "Pendant les périodes de forte volatilité (CPI, FOMC, liquidations whales sur Arkham), réduis la taille de position de 50% même si le setup EMA est valide.",
      "L'ATR peut aussi servir pour placer ton SL : SL = entrée − 2×ATR(14) garantit que tu n'es pas sortie par la volatilité normale du marché.",
    ],
    metrics: [
      { label: 'Sharpe B&H', value: '1.1' },
      { label: 'Sharpe EMA+ATR', value: '3.2' },
      { label: 'Drawdown max', value: '25%' },
    ],
    featured: true,
  },

  {
    id: 'reading-hull-2019',
    institution: 'Henley Business School — Univ. Reading & Hull',
    country: '🇬🇧',
    category: 'academic',
    title: 'Technical Trading and Cryptocurrencies',
    authors: 'Robert Hudson & Andrew Urquhart',
    year: 2019,
    url: 'https://centaur.reading.ac.uk/85715/8/Hudson-Urquhart2019_Article_TechnicalTradingAndCryptocurre.pdf',
    institutionUrl: 'https://icmacentre.ac.uk/research',
    indicators: ['Moyennes Mobiles', 'EMA', 'RSI', 'Filtres Momentum'],
    summary: "15 000+ règles techniques testées sur BTC/ETH/LTC/XRP. Les MA et le momentum battent statistiquement le Buy & Hold (p < 5%).",
    explanation:
      "Les chercheurs ont fait quelque chose de radical : au lieu de tester 3 ou 4 stratégies comme tout le monde, ils ont généré et testé plus de 15 000 combinaisons de règles techniques différentes (différentes périodes de MA, seuils RSI, filtres momentum, combinaisons entre eux). Résultat : les règles basées sur les moyennes mobiles et le momentum ressortent systématiquement gagnantes sur les 4 cryptos testées. Le seuil « p < 5% » signifie que la probabilité que ces résultats soient dus au hasard est inférieure à 5% — c'est le standard minimum en recherche scientifique. Ce n'est pas 1 cherry-pick : c'est la conclusion de 15 000 tests indépendants qui convergent vers les mêmes indicateurs. L'étude invalide également ceux qui disent que l'analyse technique « ne marche pas » sur les cryptos.",
    howToApply: [
      "Utilise TOUJOURS une combinaison MA + momentum — ne trade jamais sur une MA seule ou un RSI seul. La confluence est ce qui génère l'edge.",
      "Les périodes standard (EMA 20/50/100/200) ont été les plus robustes dans les tests. Évite d'inventer des EMA exotiques (EMA 37, EMA 83) — elles ne sont pas testées et ne sont pas vues par les autres traders.",
      "Le momentum se mesure en regardant la tendance de la bougie elle-même : une bougie haussière qui ferme dans ses 70% hauts avec volume supérieur à la moyenne = momentum fort.",
      "Sur le 4H BTC, les MA croisées (EMA 50 > EMA 200) + RSI entre 40 et 60 (ni suracheté ni survendu) représentent le setup optimal validé dans cette étude.",
      "Si tu as un signal EMA mais que le momentum est négatif (bougies baissières, volume en baisse sur les rebonds), l'étude dit de ne pas entrer — le momentum contredit le signal MA.",
    ],
    metrics: [
      { label: 'Règles testées', value: '15 000+' },
      { label: 'Actifs', value: '4 cryptos' },
      { label: 'Seuil stat.', value: 'p < 5%' },
    ],
    featured: true,
  },

  {
    id: 'imperial-college-2022',
    institution: 'Imperial College London',
    country: '🇬🇧',
    category: 'academic',
    title: 'Backtesting with LLMs, Macroeconomic and Technical Indicators',
    authors: 'Alireza Kargarzadeh',
    year: 2022,
    url: 'https://www.imperial.ac.uk/media/imperial-college/faculty-of-natural-sciences/department-of-mathematics/math-finance/Kargarzadeh_Alireza_02092220.pdf',
    institutionUrl: 'https://www.imperial.ac.uk/mathematics/research/',
    indicators: ['Filtres Macro', 'Confluences Multi-Signaux', 'Pure Alpha', 'LLM Signals'],
    summary: "Attendre la convergence de signaux macro + techniques augmente massivement la régularité des gains, même après frais.",
    explanation:
      "L'étude d'Imperial College est l'une des premières à combiner signaux macroéconomiques (tendance du Russell 2000, S&P 500, taux d'intérêt) avec des indicateurs techniques classiques et même des signaux LLM (IA analysant les actualités financières). La conclusion centrale est puissante : pris séparément, chaque type de signal est médiocre. Mais quand tu attends que plusieurs signaux de types différents convergent vers la même conclusion (setup technique + macro favorable + sentiment IA positif), le win rate et la régularité des gains explosent. La stratégie « Pure Alpha » représente les gains générés au-dessus de ce que le marché donne naturellement (Buy & Hold). Cette stratégie reste profitable même en déduisant les frais de transaction réels, ce que beaucoup d'études ignorent frauduleusement.",
    howToApply: [
      "Ne prends jamais un trade sur signal technique seul. La macro doit être alignée : QQQ au-dessus de son EMA 200 weekly + DXY en baisse ou latéral = macro favorable pour long BTC.",
      "Si QQQ est sous son EMA 200 : réduire la taille de position de 30-50% sur tous les longs, même avec un setup 4H parfait.",
      "L'équivalent « LLM » dans notre protocole, c'est le filtre Arkham : il analyse les flux institutionnels en temps réel. Une alerte Arkham adverse = signal négatif macro-institutionnel → skip.",
      "La « confluence » n'est pas une suggestion : l'étude prouve mathématiquement que 1 signal seul = bruit, 3+ signaux alignés = edge statistique réel.",
      "Applique ce principe au check dominance BTC : BTC dominance montante + macro haussière + setup 4H bullish = triple confluence → taille maximale permise par le protocole.",
    ],
    featured: true,
  },

  {
    id: 'jof-lo-2000',
    institution: 'MIT Sloan / Harvard — Journal of Finance',
    country: '🇺🇸',
    category: 'academic',
    title: 'Foundations of Technical Analysis: Computational Algorithms, Statistical Inference',
    authors: 'Andrew Lo, Harry Mamaysky & Jiang Wang',
    year: 2000,
    url: 'https://onlinelibrary.wiley.com/doi/10.1111/0022-1082.00265',
    institutionUrl: 'https://onlinelibrary.wiley.com/journal/15406261',
    indicators: ['Supports / Résistances', 'Head & Shoulders', 'Moyennes Mobiles', 'Patterns Chartistes'],
    summary: "Sur 31 ans de données boursières, les patterns chartistes (S&R, Head & Shoulders, etc.) contiennent une information prédictive statistiquement prouvée.",
    explanation:
      "Andrew Lo est professeur au MIT et l'un des économistes financiers les plus cités au monde. En 2000, il a fait quelque chose de révolutionnaire : au lieu de tracer des patterns à la main, il a créé des algorithmes qui les détectent automatiquement sur 31 ans de données boursières américaines. Résultat : les patterns chartistes (tête-épaules, doubles sommets, triangles, supports/résistances) ne sont pas des illusions — ils contiennent une information statistiquement significative sur les rendements futurs. C'est l'étude qui a donné une légitimité académique à l'analyse technique, qu'on traitait jusque-là de pseudo-science. Elle est citée dans pratiquement tous les articles académiques sur le sujet depuis 2000.",
    howToApply: [
      "Quand tu identifies un Head & Shoulders sur le 4H ou le Daily, c'est une formation avec une base académique réelle — pas du chart art. Le neckline cassé est le signal d'entrée pour un short.",
      "Les supports et résistances historiques (S/R) sont les zones qui ont le plus de validation académique. Plus un niveau a été testé, plus il est statistiquement significatif.",
      "Combine toujours un pattern chartiste avec un indicateur de confirmation (volume, RSI) car l'étude de Lo montre que les patterns seuls ont un edge faible — c'est la combinaison qui génère de l'alpha.",
      "Sur TradingView, identifie les 3 zones S/R les plus claires sur le Weekly et le Daily AVANT de regarder le 4H. Ces niveaux macro sont les plus robustes statistiquement.",
      "Un double bottom avec divergence RSI haussière sur le 4H = pattern classique (Lo) + confirmation oscillateur (Hudson & Urquhart) = double validation académique pour un long.",
    ],
    featured: true,
  },

  {
    id: 'aqr-momentum-2012',
    institution: 'AQR Capital Management — Journal of Financial Economics',
    country: '🇺🇸',
    category: 'academic',
    title: 'Time Series Momentum',
    authors: 'Tobias Moskowitz, Yao Hua Ooi & Lasse Pedersen',
    year: 2012,
    url: 'https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2089463',
    institutionUrl: 'https://www.aqr.com/Insights/Research',
    indicators: ['Momentum 12 mois', 'Trend Following', 'Futures Multi-Actifs', 'Sharpe Ratio'],
    summary: "Un actif en hausse sur 12 mois continue statistiquement à surperformer. Validé sur 58 futures sur 25 ans — Sharpe 1.3.",
    explanation:
      "AQR est l'un des plus grands fonds quantitatifs au monde (~100 Mds$ AUM). Leur étude « Time Series Momentum » est simple mais puissante : si un actif a monté sur les 12 derniers mois, achète-le. S'il a baissé, vends-le (ou évite-le). Testé sur 58 futures liquides (actions mondiales, obligations, matières premières, devises) de 1985 à 2012, ce principe génère un Sharpe de 1.3 en moyenne — bien au-dessus du marché. Pourquoi ça marche ? Les investisseurs humains mettent du temps à changer d'avis. Quand un actif monte, les late adopters entrent progressivement, ce qui prolonge la tendance bien au-delà de ce que la logique pure impliquerait. Ce phénomène comportemental crée un « momentum » persistant que tu peux exploiter.",
    howToApply: [
      "Avant tout trade LONG sur BTC : est-ce que BTC est en hausse sur les 3 derniers mois (pas seulement sur 1 jour) ? Si non, c'est un trade contre le momentum — probabilité plus basse.",
      "Sur le Weekly BTC, vérifie que le prix est au-dessus de la EMA 20 Weekly (proxy du momentum 20 semaines). Si oui, le momentum moyen-terme est positif → favorise les longs.",
      "Le momentum s'efface rarement en 1 ou 2 bougies. Si BTC a été en tendance haussière 3 mois et que tu vois une correction 4H vers EMA 50 → c'est une opportunité d'acheter le momentum, pas de shorter.",
      "Évite les contre-tendances courtes sur des actifs avec fort momentum. L'étude montre que shorter un actif avec momentum positif fort (>3 mois de hausse) a un edge négatif.",
      "Applique le momentum multi-timeframe : Weekly momentum positif + Daily momentum positif + 4H setup technique = 3 timeframes alignés = setup de très haute probabilité.",
    ],
    metrics: [
      { label: 'Actifs testés', value: '58 futures' },
      { label: 'Période', value: '1985–2012' },
      { label: 'Sharpe moyen', value: '1.3' },
    ],
  },

  {
    id: 'brock-1992',
    institution: 'Université du Wisconsin — Journal of Finance',
    country: '🇺🇸',
    category: 'academic',
    title: 'Simple Technical Trading Rules and the Stochastic Properties of Stock Returns',
    authors: 'William Brock, Josef Lakonishok & Blake LeBaron',
    year: 1992,
    url: 'https://onlinelibrary.wiley.com/doi/10.1111/j.1540-6261.1992.tb04681.x',
    institutionUrl: 'https://onlinelibrary.wiley.com/journal/15406261',
    indicators: ['Moving Averages', 'Range Breakout', 'Règles de Filtre'],
    summary: "Sur 90 ans de données Dow Jones, les signaux de croisement MA et de rupture de range génèrent des rendements anormaux significatifs.",
    explanation:
      "Brock, Lakonishok & LeBaron ont fait l'étude qui a fermé la bouche à tous les sceptiques de l'analyse technique. Ils ont pris 90 ans de données du Dow Jones Industrial Average (1897-1986) et testé les deux règles les plus simples qui existent : le croisement de moyennes mobiles et la rupture de range. Résultat : dans les jours qui suivent un signal d'achat (MA courte croise au-dessus de MA longue), les rendements sont systématiquement et significativement plus élevés que la moyenne. L'inverse est vrai pour les signaux de vente. C'est l'étude fondatrice de toute la littérature sur l'analyse technique — elle est encore citée aujourd'hui dans chaque nouveau papier académique sur le sujet.",
    howToApply: [
      "Quand l'EMA 50 4H passe au-dessus de l'EMA 200 4H (Golden Cross), c'est un signal d'achat avec 90 ans de validation académique derrière. Ce n'est pas de la magie — c'est de la statistique.",
      "Le retour au test de l'EMA après un croisement (le fameux « retest ») est exactement ce que l'étude valide : tu entres là où les vendeurs et acheteurs se testent une dernière fois avant la continuation.",
      "Les ruptures de range avec volume > 120% de la moyenne (notre checklist) correspondent directement à la règle de « range breakout » testée dans cette étude.",
      "Utilise les périodes standard (50 et 200) — elles sont les plus répliquées dans la littérature et les plus surveillées par les institutions. Plus une MA est surveillée, plus elle crée une prophétie auto-réalisatrice.",
      "Ne modifie pas les paramètres de tes EMA après une perte. L'étude a été faite sur des règles fixes non-optimisées — c'est justement ça qui les rend robustes.",
    ],
    metrics: [
      { label: 'Données', value: '90 ans DJIA' },
      { label: 'Résultat', value: 'Alpha validé' },
    ],
  },

  {
    id: 'ssrn-crypto-2026',
    institution: 'SSRN — Social Science Research Network',
    country: '🌐',
    category: 'academic',
    title: 'Latest Research on Cryptocurrency Markets — Microstructures & Pairs Trading',
    year: 2026,
    url: 'https://blog.ssrn.com/2026/04/20/the-latest-research-on-cryptocurrency-2/',
    institutionUrl: 'https://www.ssrn.com/index.cfm/en/janda/cryptocurrency/',
    indicators: ['Microstructures', 'Profondeur Carnet', 'Spread Bid/Ask', 'Pairs Trading'],
    summary: "Les ordres limites dans les zones de volume dense ont un avantage mathématique prouvé sur les ordres marché. Le statut Maker réduit massivement les coûts.",
    explanation:
      "SSRN est la bibliothèque mondiale des pré-publications académiques (avant validation par les pairs). Les études récentes sur la « microstructure » des marchés crypto analysent ce qui se passe au niveau des ordres individuels : comment les prix se forment, où les grandes mains placent leurs ordres, pourquoi certains prix agissent comme des aimants. La découverte principale : les zones à forte densité de volume (les POC du Volume Profile) sont les points où les algorithmes institutionnels concentrent leurs ordres limites. Placer tes entrées à ces niveaux te donne un double avantage : meilleur prix d'entrée ET statut de « Maker » sur les exchanges comme Hyperliquid, ce qui signifie que tu reçois une réduction de frais au lieu d'en payer.",
    howToApply: [
      "Utilise TOUJOURS des ordres limites, jamais des ordres marché pour les entrées. Un ordre marché sur BTC te coûte 0.05% de frais immédiatement — sur 1 an, c'est des milliers de dollars perdus inutilement.",
      "Place ton ordre limite précisément sur le POC du FRVP (Volume Profile visible depuis le dernier ATH ou ATL). C'est là que les algorithmes institutionnels achètent aussi.",
      "Sur Hyperliquid, le statut Maker = tu reçois un rebate (remboursement partiel) au lieu de payer des frais. 100 trades par an = des centaines de dollars économisés juste avec ce changement.",
      "La « profondeur du carnet » visible sur les exchanges donne un signal d'intention : si tu vois un gros mur d'achats à -0.5% de ton POC, les acheteurs institutionnels défendent ce niveau.",
      "Évite les entrées en dehors des zones de volume dense. Un ordre limite à 103 200$ si le POC est à 103 500$ rate l'avantage — place-toi exactement sur le niveau de confluence.",
    ],
  },

  {
    id: 'nber-crypto',
    institution: 'NBER — National Bureau of Economic Research',
    country: '🇺🇸',
    category: 'academic',
    title: 'Cryptocurrency Economics & Market Structure Research',
    year: 2024,
    url: 'https://www.nber.org/topic/cryptocurrency',
    institutionUrl: 'https://www.nber.org/topic/cryptocurrency',
    indicators: ['Corrélation actifs', 'Cycles de Volatilité', 'Comportement Investisseurs', 'Adoption'],
    summary: "Harvard, MIT, Chicago Booth sur les marchés crypto : la volatilité est cyclique (non-aléatoire) et le comportement retail suit des biais comportementaux mesurables.",
    explanation:
      "Le NBER (National Bureau of Economic Research) est l'institution académique la plus influente en économie aux États-Unis — la quasi-totalité des Prix Nobel d'économie sont des chercheurs associés. Leurs travaux sur les cryptos montrent plusieurs résultats importants : 1) La volatilité de Bitcoin est cyclique, pas aléatoire — elle suit des patterns prévisibles liés aux cycles économiques et aux halvings. 2) Les investisseurs retail en crypto reproduisent exactement les mêmes biais comportementaux qu'en bourse : FOMO aux sommets, panique aux creux. 3) Les régulations sont le facteur externe le plus impactant les prix à court terme. Ces découvertes confirment pourquoi avoir un protocole strict est mathématiquement nécessaire.",
    howToApply: [
      "La volatilité cyclique signifie que tu peux anticiper les phases de calme et de turbulence. Après une phase de forte volatilité (crash -20%), une période de consolidation suit statistiquement — c'est là qu'on se positionne pour la prochaine tendance.",
      "Les biais retail documentés par le NBER (FOMO, panic sell) sont exactement ce que ton Audit Comportemental (journal) cherche à détecter. Les tracker, c'est utiliser la recherche académique directement.",
      "La corrélation BTC/actions monte pendant les crises de liquidité (2020, 2022) mais chute en période normale. Ton filtre QQQ doit être plus strict pendant les périodes de stress macro.",
      "L'impact des régulations (SEC, CFTC, régulations européennes) peut overrider tous tes signaux techniques. Check les news réglementaires majeures comme tu checks les FOMC.",
      "Les cycles de halving BTC (approximativement tous les 4 ans) créent des patterns de volatilité prévisibles selon le NBER. 12-18 mois après un halving = peak statistique de volatilité haussière.",
    ],
  },

  // ══════════════════ INSTITUTIONNEL ══════════════════

  {
    id: 'ssga-bitcoin-2024',
    institution: 'State Street Global Advisors',
    country: '🇺🇸',
    category: 'institutional',
    title: 'Why Bitcoin Institutional Demand Is On The Rise',
    year: 2024,
    url: 'https://www.ssga.com/us/en/institutional/insights/why-bitcoin-institutional-demand-is-on-the-rise',
    institutionUrl: 'https://www.ssga.com/us/en/institutional/insights',
    indicators: ['Sharpe Ratio Portfolio', 'Règle du 1%', 'Décorrélation', 'Allocation Asymétrique'],
    summary: "Un gestionnaire de $4T+ prouve que Bitcoin améliore le Sharpe d'un portefeuille via sa décorrélation — la règle du 1% par position est validée institutionnellement.",
    explanation:
      "State Street Global Advisors gère plus de 4 000 milliards de dollars pour des fonds de pension, des gouvernements et des fonds souverains — c'est l'un des 3 plus grands gestionnaires d'actifs au monde avec BlackRock et Vanguard. Quand ils publient une étude disant que Bitcoin améliore la performance d'un portefeuille, ce n'est pas une opinion — c'est le résultat d'analyses quantitatives réalisées par des équipes de 50+ quants. Leur découverte : même en risquant seulement 1 à 5% du capital sur Bitcoin (en proportion du portefeuille total), le ratio de Sharpe s'améliore significativement. Pourquoi ? La décorrélation. Bitcoin ne monte pas et ne baisse pas exactement comme les actions ou les obligations, ce qui réduit la variance totale du portefeuille.",
    howToApply: [
      "La règle du 1% de risque par trade que tu utilises vient directement de cette approche institutionnelle d'allocation asymétrique. C'est validé par les plus gros gestionnaires au monde.",
      "En pratique : ne risque jamais plus de 1% de ton capital sur un seul trade BTC — même si le setup est « parfait ». Les institutions ne font pas ça, tu ne dois pas non plus.",
      "La décorrélation BTC/stocks fonctionne dans les deux sens : quand BTC est en bull market fort, un portefeuille avec 3% de BTC surperforme massivement les portefeuilles 100% actions.",
      "State Street confirme que 5% maximum de Bitcoin dans un portefeuille est le sweet spot institutionnel. Au-delà, la volatilité crypto augmente le risque total du portefeuille.",
      "Surveille les flux vers les ETF Bitcoin spot (iShares, Fidelity) : quand State Street et ses pairs augmentent leurs positions, c'est un signal de demande institutionnelle réelle — bullish macro.",
    ],
    metrics: [
      { label: 'AUM géré', value: '+4 000 Mds$' },
      { label: 'Allocation', value: '1–5%' },
    ],
    featured: true,
  },

  {
    id: 'fidelity-bitcoin-2023',
    institution: 'Fidelity Digital Assets',
    country: '🇺🇸',
    category: 'institutional',
    title: "Bitcoin's Role as an Alternative Investment",
    year: 2023,
    url: 'https://www.fidelitydigitalassets.com/research-and-insights/bitcoin-investment-thesis',
    institutionUrl: 'https://www.fidelitydigitalassets.com/research-and-insights',
    indicators: ['Stock-to-Flow', 'Adoption Institutionnelle', 'Corrélation Or', 'Inflation Hedge'],
    summary: "Fidelity ($4 500 Mds AUM) valide le modèle Stock-to-Flow et positionne Bitcoin comme réserve de valeur décorrélée du portefeuille 60/40 traditionnel.",
    explanation:
      "Fidelity est l'un des premiers grands gestionnaires à avoir créé une division crypto dédiée (Fidelity Digital Assets). Leur rapport 2023 est une analyse de 80 pages qui répond à la question : pourquoi les institutions devraient avoir du Bitcoin ? Leur argument central repose sur le modèle Stock-to-Flow (S2F) : comme l'or, Bitcoin a une offre limitée (21 millions) et un rythme d'émission qui diminue tous les 4 ans (halving). Ce modèle de rareté prédisait avec une précision remarquable les grands cycles de prix de 2012 à 2021. Fidelity documente aussi la décorrélation de Bitcoin avec le portefeuille classique 60% actions / 40% obligations, particulièrement visible en dehors des crises de liquidité globales (2020, 2022).",
    howToApply: [
      "Consulte le S2F Ratio (disponible sur lookintobitcoin.com) pour connaître le cycle actuel. Un S2F ratio en croissance (après le halving) = phase historiquement haussière pour BTC.",
      "Ne pas confondre corrélation de crise (BTC crash avec les stocks en 2022) avec corrélation normale (BTC souvent décorrélé). Ton filtre QQQ doit être plus strict en période de crise macro globale.",
      "Les cycles Fidelity S2F suggèrent : 12-18 mois après un halving = période statistiquement la plus favorable pour les longs. Calibre ta taille de position en conséquence.",
      "Les flux vers les ETF Fidelity FBTC sont publics quotidiennement. Flux entrants importants (>$300M/jour) = demande institutionnelle forte = contexte favorable pour tes longs.",
      "Bitcoin comme 'inflation hedge' est validé sur le long terme mais pas sur le court terme. En trading 4H, ne l'utilise pas comme justification d'entrée — utilise les signaux techniques.",
    ],
    metrics: [
      { label: 'AUM Fidelity', value: '~4 500 Mds$' },
      { label: 'Décorrélation', value: 'Validée' },
    ],
  },

  {
    id: 'ark-big-ideas-2024',
    institution: 'ARK Invest Research',
    country: '🇺🇸',
    category: 'institutional',
    title: 'Big Ideas 2024 — Bitcoin & Crypto Assets',
    year: 2024,
    url: 'https://ark-invest.com/wp-content/uploads/2024/02/ARK-Invest_BigIdeas-2024.pdf',
    institutionUrl: 'https://ark-invest.com/research/',
    indicators: ['MVRV Z-Score', 'NVT Ratio', 'Modèles de Valorisation', 'Adoption Institutionnelle'],
    summary: "ARK Invest popularise MVRV Z-Score et NVT Ratio pour identifier les cycles BTC — quand acheter/vendre selon la valorisation on-chain vs marché.",
    explanation:
      "ARK Invest (Cathie Wood) produit chaque année un rapport de 150+ pages sur les grandes tendances technologiques. Leur section Bitcoin 2024 est une bible pour comprendre les métriques d'évaluation on-chain. Deux indicateurs clés : le MVRV Z-Score (Market Value to Realized Value) compare la valeur boursière de Bitcoin à sa « valeur réalisée » (ce que les détenteurs actuels ont payé en moyenne pour leurs coins). Quand ce ratio est très élevé (>6), les gens sont très en profit → ils vont vendre → signal de sommet de cycle. Quand il est négatif, les gens sont à perte → ils ne vendent plus → signal de creux. Le NVT Ratio (Network Value to Transactions) est l'équivalent du P/E boursier pour Bitcoin : valeur boursière divisée par le volume de transactions sur le réseau.",
    howToApply: [
      "Vérifie le MVRV Z-Score chaque semaine sur Glassnode (version gratuite disponible). Zone verte (score négatif) = accumulation institutionnelle = priorité aux longs. Zone rouge (>6) = proche d'un sommet de cycle = réduire tailles et éviter les longs à fort levier.",
      "NVT Signal (sur Coin Metrics) > 150 = Bitcoin surévalué par rapport à son activité réseau réelle → méfiance pour les longs nouveaux. NVT < 50 = sous-évalué = opportunité.",
      "ARK montre que les cycles BTC ont 4 phases : accumulation (MVRV négatif), markup (tendance haussière), distribution (MVRV >4), markdown (bear). Identifie ta phase pour calibrer ton biais directionnel.",
      "Croise MVRV Z-Score avec ton analyse technique : si MVRV est en zone d'accumulation ET le 4H donne un signal EMA + RSI → c'est la configuration optimale pour un long avec taille maximale.",
      "Télécharge le rapport ARK Big Ideas chaque début d'année — il donne le contexte macro crypto pour les 12 mois suivants, utile pour calibrer ton biais directionnel mensuel.",
    ],
    featured: true,
  },

  {
    id: 'bis-crypto-2018',
    institution: 'BIS — Bank for International Settlements',
    country: '🇨🇭',
    category: 'institutional',
    title: 'Cryptocurrencies: Looking Beyond the Hype',
    authors: 'Hyun Song Shin et al.',
    year: 2018,
    url: 'https://www.bis.org/publ/arpdf/ar2018e5.pdf',
    institutionUrl: 'https://www.bis.org/topic/fintech/crypto.htm',
    indicators: ['Régimes de Volatilité', 'Risque de Liquidité', 'Risque Systémique', 'Décorrélation'],
    summary: "La BIS (banque centrale des banques centrales) quantifie les crises de liquidité crypto — 10× plus fréquentes qu'en bourse. Validation du filtre de régime de volatilité.",
    explanation:
      "La Banque des Règlements Internationaux (BIS) est littéralement la banque centrale de toutes les banques centrales mondiales (Fed, BCE, Banque du Japon). Quand elle analyse un marché, c'est avec les données et les méthodes les plus rigoureuses qui existent. Leur rapport de 2018 documentait deux risques spécifiques aux cryptos : 1) La « volatility clustering » : les périodes calmes sont suivies de périodes calmes, les périodes explosives sont suivies de périodes explosives. La volatilité n'est pas aléatoire — elle se propage. 2) Les crises de liquidité (moments où tu ne peux pas vendre à un prix décent) sont 10× plus fréquentes en crypto qu'en bourse. Ces deux caractéristiques sont fondamentales pour comprendre pourquoi ton protocole exige un filtre de volatilité avant chaque trade.",
    howToApply: [
      "La 'volatility clustering' valide scientifiquement pourquoi après un gros mouvement (±5% en 4H), les prochaines bougies seront aussi volatiles. Skip les trades pendant les 2-3 bougies suivant un choc de prix majeur.",
      "Les crises de liquidité crypto sont souvent précédées d'une hausse de Funding Rate + Exchange Inflow élevé. Cette combinaison = risque de liquidité élevé → réduire taille ou rester en cash.",
      "Pendant les crises de liquidité (prix tombe 10-20% en 1h), les SL sont souvent sautés (slippage). C'est pourquoi le protocole utilise des Stop Market (pas des Stop Limit) pour garantir l'exécution.",
      "La BIS recommande des stress tests : imagine ce qui arrive à ta position si BTC tombe de 15% en 30 minutes. Ton SL tient-il ? Ton levier survit-il ? Si non, réduis le levier.",
      "En période de stress macro (FOMC surprenant, crise bancaire), les corrélations crypto/actions montent à 0.8+. Ton filtre QQQ et DXY doit être appliqué encore plus strictement dans ces périodes.",
    ],
  },

  {
    id: 'grayscale-2024',
    institution: 'Grayscale Research',
    country: '🇺🇸',
    category: 'institutional',
    title: 'Crypto Sectors Framework & Quarterly Market Reports',
    year: 2024,
    url: 'https://www.grayscale.com/research',
    institutionUrl: 'https://www.grayscale.com/research',
    indicators: ['Market Cap / TVL', 'Rotation Sectorielle', 'Dominance BTC', 'Cycles de Marché'],
    summary: "Grayscale documente la rotation sectorielle crypto (BTC → ETH → altcoins) et l'utilisation de BTC dominance comme signal d'allocation.",
    explanation:
      "Grayscale (~23 Mds$ AUM) gère les plus grands fonds crypto institutionnels (GBTC, ETHE). Leurs rapports trimestriels analysent la structure du marché crypto comme un gestionnaire de fonds d'actions analyse la rotation sectorielle. Leur découverte principale : le marché crypto a des rotations prévisibles. D'abord BTC monte (dominance hausse), puis ETH suit, puis les altcoins de qualité (L1, L2), enfin les memecoins (fin de cycle). En sens inverse lors des bears. Comprendre où on est dans cette rotation est essentiel pour choisir QU'EST-CE QU'ON TRADE et avec QUELLE CONVICTION. Leur ratio Price/TVL (valorisation boursière ÷ valeur totale déposée dans un protocole DeFi) est l'équivalent du P/E pour évaluer les tokens DeFi.",
    howToApply: [
      "Vérifie BTC Dominance chaque semaine (TradingView : BTC.D). Si BTC.D > 55% et monte → phase BTC pure → trade uniquement BTC, évite les alts même si setup technique présent.",
      "BTC.D en dessous de 50% et baissière → alt season potential → ETH et grandes alts ont plus d'alpha potentiel. Mais garde quand même 60%+ de tes trades sur BTC/ETH (plus de liquidité = meilleure exécution).",
      "Pour les positions sur ETH ou SOL : vérifie Price/TVL sur DeFiLlama. Price/TVL < 1 = protocole potentiellement sous-évalué par rapport à ses fondamentaux.",
      "Les rapports Grayscale trimestriels (gratuits) donnent le 'Crypto Sector Score' — une note de 1 à 10 pour chaque secteur (L1, DeFi, GameFi, etc.) basée sur les fondamentaux. Utilise-le pour prioriser tes trades.",
      "Phase de bear market (BTC.D monte vers 65-70%) : cela signifie que l'argent sort des alts vers BTC ou vers les stablecoins. C'est un signal de risque élevé — réduire toute exposition altcoins.",
    ],
  },

  {
    id: 'galaxy-digital-2024',
    institution: 'Galaxy Digital Research',
    country: '🇺🇸',
    category: 'institutional',
    title: 'Crypto Markets & Derivatives Analytics',
    year: 2024,
    url: 'https://www.galaxy.com/insights/',
    institutionUrl: 'https://www.galaxy.com/insights/',
    indicators: ['Flux de Capital', 'Open Interest Dérivés', 'Analyse Structurelle', 'Métriques On-Chain'],
    summary: "Galaxy démontre que l'évolution de l'Open Interest (OI) est un signal avancé des retournements de tendance — plus fiable que le prix seul.",
    explanation:
      "Galaxy Digital est un acteur majeur des marchés dérivés crypto institutionnels (trading, prêts, mining). Leur research couvre en particulier les marchés de futures et options. Leur insight le plus actionnable : l'Open Interest (OI = nombre total de contrats futures ouverts) donne une lecture de l'intensité des paris directionnels sur le marché. Quand l'OI monte ET le prix monte → les nouveaux acheteurs entrent → tendance saine. Quand l'OI monte ET le prix baisse → les vendeurs prennent le contrôle → signal de retournement baissier. Quand l'OI chute soudainement → positions liquidées en masse → souvent un point de retournement (local bottom ou top) car le levier excessif est purgé.",
    howToApply: [
      "Avant chaque trade : check l'OI sur CryptoQuant (Estimated Leverage Ratio ou Open Interest chart). OI croissant + prix croissant = tendance forte et saine → favorise les longs.",
      "OI croissant + prix stable ou baissier = pression vendeuse qui s'accumule → ne pas aller long, risque de cascade baissière si le support cède.",
      "Un crash d'OI (baisse soudaine de 15%+) = liquidation massive en cours. Après ce flush, les positions à fort levier ont été purgées → base potentielle pour un rebond. Attends la stabilisation avant d'entrer.",
      "Combine OI avec Funding Rate : OI élevé + Funding Rate > 0.05% = marché sur-leveraged à la hausse = déclencheur probable d'un retournement court terme. Évite les longs dans cette configuration.",
      "Galaxy publie un rapport hebdomadaire gratuit (Galaxy Research Weekly) avec OI, funding rates et flux de capital. Lis-le chaque lundi pour calibrer le biais de la semaine.",
    ],
  },

  {
    id: 'cme-bitcoin-research',
    institution: 'CME Group Research',
    country: '🇺🇸',
    category: 'institutional',
    title: 'Bitcoin Futures & Derivatives Market Analysis',
    year: 2024,
    url: 'https://www.cmegroup.com/education/cryptocurrency.html',
    institutionUrl: 'https://www.cmegroup.com/education/cryptocurrency.html',
    indicators: ['Futures Basis', 'Open Interest', 'Term Structure', 'Contango / Backwardation'],
    summary: "CME (plus grande bourse de dérivés mondiale) documente les gaps CME comme niveaux magnétiques et la structure à terme comme indicateur de sentiment institutionnel.",
    explanation:
      "Le CME est la plus grande bourse de dérivés financiers au monde. Le Bitcoin futures CME est différent du Bitcoin spot : il ne trade que du lundi au vendredi. Cela crée des 'gaps CME' : quand BTC bouge le week-end, le graphique CME a un espace vide (gap) au lundi. Ces gaps sont comblés statistiquement >70% du temps, ce qui en fait des cibles magnétiques. Par ailleurs, la structure à terme CME (contango vs backwardation) révèle le sentiment institutionnel : si les futures 3 mois se tradent 15%+ au-dessus du spot (fort contango), les institutionnels sont très bullish mais le marché est aussi potentiellement en surchauffe. Si les futures se tradent en dessous du spot (backwardation), c'est une alerte de fort pessimisme.",
    howToApply: [
      "Identifie les gaps CME ouverts sur le graphique hebdomadaire BTC CME (cherche BTC1! sur TradingView). Un gap non comblé à 85 000$ alors que BTC est à 100 000$ = aimant baissier potentiel.",
      "Règle pratique : si il y a un gap CME majeur (>2%) dans la direction opposée à ton trade, réduis la taille de position de 30% car le risque de comblement est réel.",
      "Le basis CME (différence % entre futures et spot) disponible sur The Block ou Glassnode. Basis > 15% annualisé = marché très bullish institutionnellement mais potentiellement surchauffé.",
      "Backwardation (futures < spot) est rare et très baissier : les institutionnels paient une prime pour shorter BTC à terme → signal de distribution potentielle. Évite les longs.",
      "Les données d'OI du CME sont publiées par le CFTC chaque semaine (Commitment of Traders - COT report). Quand les Leveraged Funds (hedge funds) sont massivement courts sur CME futures = attention.",
    ],
  },

  {
    id: 'fed-ny-crypto',
    institution: 'Federal Reserve — New York Fed',
    country: '🇺🇸',
    category: 'institutional',
    title: 'Staff Reports on Digital Assets & Cryptocurrency',
    year: 2024,
    url: 'https://www.newyorkfed.org/research',
    institutionUrl: 'https://www.newyorkfed.org/research',
    indicators: ['Stablecoins', 'DeFi', 'Corrélations Macro', 'Dollar Index (DXY)'],
    summary: "La NY Fed quantifie la corrélation BTC/DXY (-0.7) : quand le dollar monte, BTC baisse. Les inflows stablecoins précèdent statistiquement les hausses.",
    explanation:
      "La Federal Reserve Bank of New York est l'une des institutions les plus influentes sur les marchés financiers mondiaux — c'est elle qui effectue les opérations de marché de la Fed américaine. Leurs chercheurs ont documenté deux corrélations fondamentales pour le trading BTC : 1) La corrélation négative BTC/DXY (Dollar Index) est de -0.7 sur les périodes longues. Autrement dit, quand le dollar se renforce fortement, Bitcoin tend à baisser, et vice versa. 2) Les entrées de stablecoins (USDT, USDC) sur les exchanges précèdent statistiquement les hausses de prix car elles représentent des capitaux attendant d'être déployés en crypto.",
    howToApply: [
      "Check DXY avant chaque trade : DXY en forte hausse (+0.5% sur la journée) = vent de face pour les longs BTC. Attends un plateau ou un retournement DXY avant d'entrer.",
      "DXY sous son EMA 50 Daily et baissier = contexte macro favorable pour tes longs BTC. Documente ce contexte dans ta checklist macro (Forex Factory : DXY trend).",
      "Le SSR (Stablecoin Supply Ratio) sur CryptoQuant mesure exactement ce que la NY Fed décrit : moins il y a de stablecoins sur les exchanges (ratio bas), plus il y a de dry powder prêt à acheter → bullish signal.",
      "Après une décision FOMC agressive (hausse de taux surprise), le DXY monte généralement → BTC subit une pression baissière à court terme. Ne trade pas long dans les 24h suivant un FOMC surprise.",
      "Suit le 'Senior Loan Officer Survey' publié par la NY Fed chaque trimestre : un resserrement du crédit bancaire précède souvent une pression sur les actifs risqués incluant crypto.",
    ],
  },

  // ══════════════════ ON-CHAIN & ANALYTICS ══════════════════

  {
    id: 'glassnode-2024',
    institution: 'Glassnode Research',
    country: '🇩🇪',
    category: 'onchain',
    title: 'The Week On-Chain — Bitcoin Market Intelligence',
    year: 2024,
    url: 'https://insights.glassnode.com/the-week-onchain/',
    institutionUrl: 'https://insights.glassnode.com/research/',
    indicators: ['MVRV Z-Score', 'SOPR', 'NUPL', 'Realized Cap', 'STH / LTH', 'Reserve Risk'],
    summary: "La référence mondiale des métriques on-chain. MVRV et SOPR indiquent les phases de cycle (accumulation → distribution). STH-MVRV < 0 = zone de bas de cycle.",
    explanation:
      "Glassnode est LE standard institutionnel pour l'analyse on-chain Bitcoin. Leurs métriques clés à comprendre : 1) SOPR (Spent Output Profit Ratio) : quand les gens dépensent des coins, le vendent-ils à profit ou à perte ? Un SOPR > 1 signifie que les vendeurs sont en profit → distribution en cours. SOPR < 1 = vendeurs à perte → capitulation, souvent un creux. 2) STH (Short-Term Holders, moins de 155 jours) vs LTH (Long-Term Holders, plus de 155 jours) : les LTH ne vendent presque jamais en bear market → leur comportement indique la confiance long-terme dans le réseau. Quand le STH-MVRV est négatif, les acheteurs récents sont à perte → ils ne vendent pas → bullish à moyen terme.",
    howToApply: [
      "Lis 'The Week On-Chain' chaque dimanche (gratuit en résumé sur Glassnode Twitter). En 10 minutes tu as les 5 métriques clés pour calibrer ton biais de la semaine.",
      "SOPR < 1 pendant 2+ semaines consécutives = capitulation en cours → c'est historiquement la zone de bas de cycle pour accumuler. Augmente tes tailles de position si le 4H donne un signal.",
      "STH-MVRV négatif = les acheteurs récents (spéculateurs) sont à perte et ont arrêté de vendre → pression vendeuse réduite → contexte favorable pour les longs.",
      "Reserve Risk faible (la métrique Glassnode) = les LTH n'ont pas vendu malgré la hausse → conviction forte du marché → bullish macro. Reserve Risk élevé = les LTH vendent → méfiance.",
      "Croise SOPR avec ton analyse 4H : si SOPR vient de passer au-dessus de 1 (de la zone de perte vers la zone de profit) ET que tu as un signal EMA bullish → double confirmation pour un long.",
    ],
    featured: true,
  },

  {
    id: 'cryptoquant-2024',
    institution: 'CryptoQuant Research',
    country: '🇰🇷',
    category: 'onchain',
    title: 'Exchange Flows, Whale Monitoring & Derivatives Analytics',
    year: 2024,
    url: 'https://cryptoquant.com/research',
    institutionUrl: 'https://cryptoquant.com/research',
    indicators: ['Exchange Inflow / Outflow', 'Whale Alerts', 'Funding Rate', 'Long / Short Ratio'],
    summary: "Les flux d'échanges (exchange inflow/outflow) et le Funding Rate sont les métriques les plus prédictives des mouvements à court terme — directement intégrées dans le protocole.",
    explanation:
      "CryptoQuant est la plateforme d'analytics on-chain la plus utilisée par les traders professionnels pour le trading à court terme (contrairement à Glassnode plus orienté cycles longs). Leurs deux métriques les plus importantes : 1) Exchange Inflow/Outflow : quand de gros volumes de Bitcoin arrivent sur les exchanges (inflow élevé, surtout depuis des wallets de whales), c'est une intention de vendre → pression baissière. Quand des coins partent vers des cold wallets (outflow), c'est de l'accumulation → bullish. 2) Funding Rate : dans les marchés perpetuels (Hyperliquid, Binance perps), le Funding Rate est ce que paient les longs aux shorts toutes les 8h. Si le taux est très positif (>0.05%), il y a trop de longs → le marché est instable et une correction est probable.",
    howToApply: [
      "Avant chaque long : vérifie le Exchange Netflow sur CryptoQuant. Outflows importants les derniers jours (coins quittant les exchanges) = accumulation institutionnelle = bullish.",
      "Inflows massifs (surtout depuis des wallets connus comme gouvernements ou ETFs) = pression de vente potentielle = skip le long ou réduire la taille.",
      "Funding Rate > 0.05% = les longs paient les shorts → marché sur-leveraged à la hausse → pullback probable dans les 24-72h. Ne rentre pas long dans cette configuration.",
      "Funding Rate négatif (shorts dominants) = les shorts paient les longs → marché trop pessimiste → squeeze haussier possible. Les setups longs dans cette config ont statistiquement une meilleure probabilité.",
      "Whale Ratio (ratio des gros dépôts/dépôts totaux sur les exchanges) > 0.85 = les whales envoient des coins aux exchanges → vente probable → signal court terme baissier. Check ça chaque matin sur CryptoQuant Free.",
    ],
    featured: true,
  },

  {
    id: 'chainalysis-2024',
    institution: 'Chainalysis Research',
    country: '🇺🇸',
    category: 'onchain',
    title: 'Geography of Cryptocurrency & Blockchain Market Intelligence',
    year: 2024,
    url: 'https://www.chainalysis.com/blog/category/research/',
    institutionUrl: 'https://www.chainalysis.com/blog/research/',
    indicators: ['Flux Blockchain', 'Volumes Réels vs Wash', 'Clustering Wallets', 'DeFi Analytics'],
    summary: "Chainalysis filtre les volumes de washtrading et identifie les accumulations institutionnelles via clustering de wallets — utile pour valider les supports réels.",
    explanation:
      "Chainalysis est utilisée par le FBI, la SEC, l'IRS et des dizaines de gouvernements pour tracer les flux crypto. Pour les traders, leur valeur est différente : ils ont les outils les plus avancés pour identifier QUELS types d'acteurs (retail, institutions, exchanges, miners) accumulent ou distribuent. Leur « Crypto Crime Report » annuel révèle aussi la proportion de volumes fake (washtrading) sur les exchanges — en 2023, jusqu'à 70% des volumes reportés étaient faux sur certaines plateformes. Cette information est critique : si tes supports de Volume Profile sont basés sur des données fake, tes niveaux sont inexacts.",
    howToApply: [
      "Utilise uniquement les données de volume des exchanges listés comme 'Real Volume' dans les rapports CoinDesk/Kaiko : Binance, Coinbase, Kraken, Bybit, Hyperliquid. Ignore les volumes des exchanges douteux.",
      "Les rapports Chainalysis identifient quand des ETFs, des fonds ou des miners accumulent. Croise cette info avec ton MVRV Z-Score Glassnode pour confirmer les phases de cycle.",
      "Le rapport annuel 'Crypto Crime Report' (gratuit) sort en janvier. Il donne les volumes réels du marché vs volumes reportés — utile pour calibrer la vraie taille du marché.",
      "Quand Chainalysis signale une augmentation des volumes DeFi réels → on-chain activity augmente → bullish fondamental pour ETH et les tokens L2.",
      "Leur 'Entity Classification' identifie les gros wallets (Grayscale, MicroStrategy, Fidelity). Quand ces entités accumulent (detectable via leurs données ou via Arkham), c'est le signal institutionnel le plus fort.",
    ],
  },

  {
    id: 'coin-metrics-2024',
    institution: 'Coin Metrics Research',
    country: '🇺🇸',
    category: 'onchain',
    title: 'State of the Network — Weekly On-Chain Analytics',
    year: 2024,
    url: 'https://coinmetrics.io/research/',
    institutionUrl: 'https://coinmetrics.io/research/',
    indicators: ['Realized Cap', 'Adresses Actives', 'NVT Signal', 'Hash Rate', 'Fee Revenue'],
    summary: "Coin Metrics (clients BlackRock/Franklin Templeton) : le Hash Rate comme indicateur de confiance des mineurs et le NVT Signal comme P/E de Bitcoin.",
    explanation:
      "Coin Metrics fournit des données de qualité institutionnelle à BlackRock, Franklin Templeton et des dizaines de fonds. Deux métriques particulièrement utiles : 1) Le NVT Signal (Network Value to Transactions) : compare la capitalisation boursière de Bitcoin au volume de transactions réelles sur le réseau. C'est l'équivalent du ratio P/E boursier. NVT élevé = Bitcoin est cher par rapport à son utilisation réelle → prudence. NVT bas = sous-évalué fondamentalement → opportunité. 2) Le Hash Rate : la puissance de calcul totale sécurisant le réseau Bitcoin. Les miners sont des acteurs rationnels économiques — quand le Hash Rate atteint de nouveaux records, ça signifie que les miners anticipent des prix futurs plus élevés (ils investissent en matériel coûteux). C'est un signal de confiance long-terme.",
    howToApply: [
      "Check le NVT Signal mensuel (disponible gratuitement sur Coin Metrics). NVT > 150 = surévaluation fondamentale potentielle → méfie-toi des longs spéculatifs. NVT < 50 = accumulation zone intéressante.",
      "Hash Rate faisant de nouveaux ATH = miners très confiants dans le prix futur → long-terme bullish. Mais attention : si le Hash Rate crash soudainement, c'est une 'miner capitulation' qui précède souvent un creux.",
      "Revenue des Fees (frais payés aux miners sur le réseau) en croissance = activité réseau réelle en croissance → fondamentaux positifs pour BTC. Fees très bas = réseau peu utilisé = signal à intégrer.",
      "Les Adresses Actives (Unique Active Addresses) en croissance = adoption croissante → bullish long-terme. Une divergence (prix monte mais adresses actives baissent) est un signal de prudence.",
      "Coin Metrics 'State of the Network' hebdomadaire est gratuit par email. 5 min de lecture chaque mardi pour garder le contexte on-chain fondamental à jour.",
    ],
  },

  // ══════════════════ DONNÉES & MARCHÉS ══════════════════

  {
    id: 'coindesk-benchmark',
    institution: 'CoinDesk Data & Research',
    country: '🇺🇸',
    category: 'data',
    title: 'Exchange Benchmark Reports — Vrais Volumes & Liquidité',
    year: 2024,
    url: 'https://data.coindesk.com/reports',
    institutionUrl: 'https://data.coindesk.com/reports',
    indicators: ['Volumes Réels', 'Volume Profile', 'Profondeur Exchanges', 'Liquidité Réelle'],
    summary: "70%+ des volumes crypto reportés sont faux (washtrading). Seuls les volumes vérifiés de 6-8 exchanges sont fiables pour le Volume Profile et l'identification des niveaux institutionnels.",
    explanation:
      "CoinDesk Data évalue semestriellement tous les grands exchanges crypto pour distinguer les volumes réels des volumes fictifs (washtrading = l'exchange trade avec lui-même pour gonfler ses statistiques). Leur découverte choc : sur des centaines d'exchanges listant du Bitcoin, seulement 6 à 8 ont des volumes réels significatifs et vérifiables (Binance, Coinbase, Kraken, Bybit, OKX sur certains marchés, Hyperliquid pour les perps). Pourquoi c'est crucial pour toi ? Ton Volume Profile (FRVP) n'est valide que si les volumes sur lesquels il est basé sont réels. Un POC calculé avec des données fake n'indique rien — il y a personne à ce prix-là.",
    howToApply: [
      "Sur TradingView, utilise exclusivement les données spot de Binance, Coinbase ou Kraken pour tracer ton FRVP. Ne base pas ton Volume Profile sur des exchanges non-vérifiés.",
      "Pour les perpétuels, Hyperliquid et Binance Futures ont les données les plus fiables. Évite de tracer des FRVP sur des exchanges à faible OI qui peuvent avoir du fake volume.",
      "Un gros niveau S/R identifié sur Binance spot ET Coinbase spot simultanément = ce niveau est réel, vu par les deux segments du marché (retail et institutionnel américain). Forte confluence.",
      "Les rapports CoinDesk Benchmark (gratuits) classent les exchanges chaque semestre. Mets à jour ta liste d'exchanges de référence au moins 2 fois par an selon ces classements.",
      "Si un POC est à un prix X sur Binance mais à un prix Y légèrement différent sur Coinbase, le vrai niveau institutionnel est souvent la moyenne des deux — là où les deux marchés se rejoignent.",
    ],
    featured: true,
  },

  {
    id: 'kaiko-research',
    institution: 'Kaiko Research',
    country: '🇫🇷',
    category: 'data',
    title: 'Digital Asset Microstructure & Market Data Research',
    year: 2024,
    url: 'https://www.kaiko.com/pages/research',
    institutionUrl: 'https://www.kaiko.com/pages/research',
    indicators: ['Spread Bid/Ask', 'Profondeur L2 Carnet', 'Liquidité Intraday', 'Fragmentation'],
    summary: "Kaiko (partenaire Bloomberg/Reuters) prouve que le spread bid/ask le plus bas et la liquidité maximale sont concentrés pendant London/NY overlap (13h-17h UTC).",
    explanation:
      "Kaiko est une startup française qui fournit des données de microstructure crypto à Bloomberg, Reuters et des hedge funds. La microstructure, c'est tout ce qui se passe au niveau du carnet d'ordres : le spread (écart entre meilleur prix d'achat et meilleur prix de vente), la profondeur (combien d'argent est disponible à chaque niveau de prix), et la liquidité intraday (comment ça évolue au cours de la journée). Leur découverte la plus utile pour les traders : la liquidité n'est pas constante. Elle est maximale et les spreads sont minimaux pendant l'overlap London/New York (13h-17h UTC), et très mauvaise pendant la nuit asiatique. Entrer et sortir pendant les heures de mauvaise liquidité coûte bien plus en slippage.",
    howToApply: [
      "Concentre absolument tes entrées entre 13h et 17h UTC (15h-19h Paris) — c'est l'overlap London/NY documenté par Kaiko comme la période de liquidité maximale et de spread minimal.",
      "Pendant la session asiatique (00h-08h UTC), les spreads sont 3-5× plus larges. Un ordre marché coûte 0.15% de slippage au lieu de 0.03%. Sur 50 trades par an, c'est des milliers de dollars de différence.",
      "La profondeur du carnet L2 (visible sur Hyperliquid et Binance) te dit si ton ordre va déplacer le marché. Si tu dois entrer pour 100K$ et la liquidité bid côté est de 50K$, ton entrée va faire bouger le prix défavorablement.",
      "Avant toute entrée importante, vérifie la profondeur du carnet à ±0.5% de ton prix cible. Si elle est fine → attends une meilleure fenêtre de liquidité ou réduis la taille.",
      "Les rapports Kaiko 'Monthly Market Research' (partiellement gratuits) donnent les spreads et liquidités comparatifs entre exchanges. Utile pour confirmer que tu utilises l'exchange avec la meilleure exécution.",
    ],
  },

  {
    id: 'messari-research',
    institution: 'Messari Research',
    country: '🇺🇸',
    category: 'data',
    title: 'Crypto Theses & Protocol Intelligence',
    year: 2024,
    url: 'https://messari.io/research',
    institutionUrl: 'https://messari.io/research',
    indicators: ['Price / TVL', 'Revenus de Protocole', 'TVL', 'Token Economics'],
    summary: "Le ratio Price/TVL et les revenus de protocole sont les P/E de la DeFi — Messari les utilise pour identifier les tokens fondamentalement sous-évalués.",
    explanation:
      "Messari est souvent appelé le 'Bloomberg de la crypto'. Leur rapport annuel 'Crypto Theses' (150+ pages) est considéré comme la meilleure vue macro du marché crypto chaque début d'année. Pour l'analyse fondamentale des tokens DeFi et L1, leur métrique centrale est le Price/TVL : valeur boursière du token divisée par la valeur totale déposée dans le protocole. Un protocole avec 1 Mds$ de TVL mais seulement 500M$ de market cap a un ratio P/TVL de 0.5 → il vaut moins que ce qu'il gère → potentiellement sous-évalué. En bourse, l'équivalent serait une banque qui se vend moins que ses dépôts. Les Protocol Revenues (frais générés par le protocole = Uniswap, AAVE, etc.) montrent si le protocole a une vraie traction économique ou si le TVL est artificiel.",
    howToApply: [
      "Pour tout trade sur un token DeFi (UNI, AAVE, CRV, etc.) : vérifie son Price/TVL sur DeFiLlama. P/TVL < 1 = potentiellement sous-évalué. P/TVL > 5 = surévalué par rapport aux fondamentaux.",
      "Les Protocol Revenues croissants signifient que le protocole génère des frais réels → usage réel → valeur fondamentale. Un token avec revenus en hausse + P/TVL bas = double signal bullish fondamental.",
      "Lis les 'Crypto Theses' de Messari chaque janvier (payant mais résumés disponibles gratuitement). Ils donnent les tendances sectorielles clés pour l'année — calibre ton biais sur les tokens DeFi en conséquence.",
      "Pour les positions sur ETH : la 'monétisation' d'Ethereum se mesure par le P/E on-chain (market cap / revenus de frais annualisés). Ce ratio en baisse = ETH devient fondamentalement moins cher.",
      "Messari est idéal pour la diligence avant un trade altcoin long terme. Pour le trading 4H, ces métriques donnent le contexte fondamental — un token avec de mauvais fondamentaux Messari mérite un trailing stop plus serré.",
    ],
  },

  // ══════════════════ NOUVELLES SOURCES — INSTITUTIONNEL ══════════════════

  {
    id: 'blackrock-bitcoin-2024',
    institution: 'BlackRock iShares',
    country: '🇺🇸',
    category: 'institutional',
    title: 'Bitcoin: A Unique Diversifier — iShares Digital Assets Research',
    year: 2024,
    url: 'https://www.blackrock.com/us/individual/investment-ideas/bitcoin',
    institutionUrl: 'https://www.blackrock.com/us/individual/investment-ideas/bitcoin',
    indicators: ['Sharpe Ratio', 'Diversification Portfolio', 'Flux ETF IBIT', 'Corrélation Actifs'],
    summary: "BlackRock ($10 000 Mds AUM) valide Bitcoin comme diversificateur unique. Les flux quotidiens de l'ETF IBIT sont le signal institutionnel le plus direct et visible du marché.",
    explanation:
      "BlackRock est le plus grand gestionnaire d'actifs de la planète avec plus de 10 000 milliards de dollars sous gestion. Quand ils ont lancé l'ETF Bitcoin spot IBIT en janvier 2024, ça a changé structurellement le marché crypto. Leur recherche interne montre que Bitcoin a un profil de risque/rendement unique : il n'est corrélé ni aux actions, ni aux obligations, ni à l'or sur des périodes longues. Pour un portefeuille institutionnel, même une allocation de 1-2% améliore le rendement ajusté au risque. La différence avec les études précédentes ? BlackRock a maintenant 'skin in the game' avec IBIT — leurs analyses sont donc directement liées à leur business, ce qui les rend encore plus fiables sur la demande institutionnelle réelle.",
    howToApply: [
      "Suis les flux IBIT quotidiens sur farside.co.uk (gratuit). Entrées >$500M/jour = demande institutionnelle forte = contexte très favorable pour les longs BTC. Sorties nettes = signal de prudence.",
      "Quand les flux ETF sont positifs pendant 5+ jours consécutifs, BTC est statistiquement en phase d'accumulation institutionnelle — augmente légèrement ta conviction sur les setups longs.",
      "Les 5 ETF Bitcoin spot les plus importants (IBIT BlackRock, FBTC Fidelity, ARKB ARK, BITB Bitwise, HODL VanEck) ont des données de flux publiques. La somme de leurs flux = proxy de la demande institutionnelle globale.",
      "Un retrait massif des ETF (>$1 Mds en 1 semaine) précède souvent une pression baissière à court terme — évite les longs en levier dans ces périodes même avec setup 4H valide.",
      "BlackRock recommande 1-2% max d'allocation en Bitcoin dans un portefeuille diversifié. Cela confirme la règle du 1% par trade : même les institutionnels ne risquent pas plus que ça.",
    ],
    metrics: [
      { label: 'AUM BlackRock', value: '+10 000 Mds$' },
      { label: 'IBIT AUM', value: '+50 Mds$' },
    ],
    featured: true,
  },

  {
    id: 'jpmorgan-crypto-flows',
    institution: 'JPMorgan Chase — Global Research',
    country: '🇺🇸',
    category: 'institutional',
    title: 'Flows & Liquidity — Crypto Market Intelligence Reports',
    year: 2024,
    url: 'https://www.jpmorgan.com/technology/blockchain',
    institutionUrl: 'https://www.jpmorgan.com/technology/blockchain',
    indicators: ['Flux de Capitaux', 'OI Dérivés', 'Corrélation BTC/Actions', 'Valorisation Relative'],
    summary: "JPMorgan ($3 700 Mds AUM) publie des rapports hebdomadaires sur les flux crypto et la corrélation BTC/actions — leurs données OI et funding sont des signaux avancés reconnus.",
    explanation:
      "JPMorgan est l'une des plus grandes banques d'investissement mondiales. Leur département de recherche macro, dirigé par Nikolaos Panigirtzoglou, publie régulièrement des analyses sur les marchés crypto qui sont lues par des milliers d'institutionnels. Leur contribution principale : ils ont développé une méthode pour comparer la valorisation de Bitcoin à des actifs traditionnels (en le comparant à la valeur d'or détenue en investissement), ce qui donne un 'juste prix fondamental' estimé. Ils mesurent aussi en temps réel les flux entre les différents véhicules d'investissement (ETF, futures, Grayscale) pour détecter la rotation du capital institutionnel. Ces données sont disponibles partiellement dans leurs rapports publics et via les médias financiers.",
    howToApply: [
      "Lis les résumés des rapports JPMorgan crypto sur Bloomberg ou Reuters (les journalistes les reprennent gratuitement). Leurs alertes sur la 'sur-valorisation' ou 'sous-valorisation' BTC sont des indicateurs macro à prendre au sérieux.",
      "JPMorgan suit la 'position nette' des investisseurs institutionnels (CME + ETF + Grayscale). Quand cette position nette augmente fortement = entrée d'argent institutionnel frais = bullish.",
      "Leur modèle de 'juste valeur' BTC est basé sur la volatilité relative BTC/Or. Quand BTC est très au-dessus de ce modèle → surévalué à court terme → prudence sur les longs avec fort levier.",
      "Les analyses JPMorgan sur la corrélation BTC/SPX (S&P 500) sont très suivies. Corrélation >0.7 = BTC suit les actions → ton filtre QQQ doit être maximum strict. Corrélation <0.3 = BTC décorrélé → plus de liberté.",
      "Quand JPMorgan publie un rapport favorable à Bitcoin (signal d'adoption institutionnelle), c'est généralement un event macro bullish pour les 48-72h suivantes.",
    ],
    metrics: [
      { label: 'AUM JPMorgan', value: '~3 700 Mds$' },
      { label: 'Corrélation BTC/SPX', value: 'Variable' },
    ],
  },

  {
    id: 'goldman-sachs-digital',
    institution: 'Goldman Sachs Digital Assets',
    country: '🇺🇸',
    category: 'institutional',
    title: 'Crypto Outlook & Digital Assets Market Intelligence',
    year: 2024,
    url: 'https://www.goldmansachs.com/intelligence/pages/crypto.html',
    institutionUrl: 'https://www.goldmansachs.com/intelligence/pages/crypto.html',
    indicators: ['Corrélation Or / BTC', 'Flux Options', 'Implied Volatility', 'Risk Premium'],
    summary: "Goldman Sachs analyse Bitcoin vs Or comme réserves de valeur et mappe les flux du marché des options crypto pour anticiper les mouvements directionnels.",
    explanation:
      "Goldman Sachs est l'une des banques d'investissement les plus influentes du monde. Leur département Digital Assets (créé en 2021) produit des recherches sur Bitcoin et Ethereum principalement sous l'angle 'réserve de valeur' et 'prime de risque'. Leur insight le plus utile pour les traders : ils trackent le marché des options crypto (calls et puts) et publient des données sur la 'implied volatility' (la volatilité anticipée par le marché options). Une IV élevée = le marché anticipe un grand mouvement dans les prochains jours. Une IV anormalement basse = phase de compression → souvent précède un breakout violent. Goldman suit aussi la corrélation BTC/Or : quand les deux actifs se découplent, ça indique un changement de régime macro.",
    howToApply: [
      "La 'Implied Volatility' des options BTC est visible sur Deribit (plus grand exchange d'options crypto). IV > 80% annualisée = marché très agité → réduire les tailles de position et levier. IV < 40% = compression → breakout probable mais direction inconnue.",
      "L'écart call/put ratio (put/call ratio) de Goldman : si beaucoup plus de puts que de calls achetés = sentiment très baissier = potentiel contrarian long si les supports techniques tiennent.",
      "Goldman surveille la corrélation BTC/Or : quand BTC monte mais l'Or baisse = BTC est en mode 'risque-on' (spéculatif). BTC + Or montent ensemble = flux refuge → demande institutionnelle structurelle.",
      "Leurs Crypto Outlook trimestriels (disponibles en résumé sur leurs publications publiques) donnent le sentiment institutionnel de Goldman. Un ton positif = vent de dos pour les longs.",
      "Avant un trade long BTC avec fort levier, vérifie que la IV n'est pas en train d'exploser (Deribit DVOL index). IV qui monte = risque de stop hunt violent → réduire ou attendre la stabilisation.",
    ],
  },

  {
    id: 'a16z-state-of-crypto',
    institution: 'a16z (Andreessen Horowitz)',
    country: '🇺🇸',
    category: 'institutional',
    title: 'State of Crypto — Annual Report',
    year: 2024,
    url: 'https://a16zcrypto.com/posts/article/state-of-crypto-report-2024/',
    institutionUrl: 'https://a16zcrypto.com/state-of-crypto',
    indicators: ['Adresses Actives', 'Volumes DEX', 'Adoption L2', 'Cycle de Marché'],
    summary: "Le rapport le plus complet sur l'adoption crypto réelle — a16z mesure les adresses actives, volumes DEX et activité L2 pour distinguer les phases de cycle bull/bear.",
    explanation:
      "a16z (Andreessen Horowitz) est le plus grand fonds de venture capital focalisé sur la crypto (~$7.6 Mds investis). Leur rapport annuel 'State of Crypto' est unique car il mesure l'adoption réelle — pas le prix, pas le sentiment, mais les métriques d'utilisation concrète : combien d'adresses uniques actives, quel volume est tradé sur les DEX (échanges décentralisés), combien de transactions sont faites sur les Layer 2 d'Ethereum, etc. Ces métriques révèlent si un bull market est basé sur une vraie adoption ou sur de la spéculation pure. Un bull market avec adresses actives en croissance = adoption réelle = tendance plus durable. Un bull market avec prix haut mais adresses actives stagnantes = spéculation = plus fragile.",
    howToApply: [
      "Check les adresses actives BTC quotidiennes sur Glassnode (gratuit en version basique). Si les adresses actives sont en hausse pendant que le prix monte → tendance soutenue par l'adoption réelle → longs plus confiants.",
      "Les volumes DEX (disponibles sur DeFiLlama) indiquent la santé de l'écosystème DeFi/ETH. Volumes DEX en forte croissance = adoption ETH en hausse → contexte favorable pour les longs ETH.",
      "a16z identifie les cycles crypto en 4 phases via leurs métriques : innovation (prix bas, adoption en croissance) → spéculation (prix et adoption montent) → crash (prix s'effondre, adoption résiste) → maturation (adoption reprend). Identifie ta phase pour calibrer ton exposition.",
      "Lis le rapport annuel 'State of Crypto' chaque printemps (gratuit, ~50 slides). Il donne une perspective 12-18 mois sur quels secteurs ont de la traction réelle (L2, DeFi, stablecoins, gaming).",
      "Si les métriques d'adoption on-chain du rapport a16z sont en hausse mais le prix est bas → c'est une des meilleures configurations pour des longs avec conviction à moyen terme.",
    ],
    metrics: [
      { label: 'Fonds Crypto a16z', value: '$7.6 Mds' },
      { label: 'Rapport', value: 'Annuel' },
    ],
    featured: true,
  },

  {
    id: 'pantera-capital-halving',
    institution: 'Pantera Capital',
    country: '🇺🇸',
    category: 'institutional',
    title: 'Bitcoin Halving Cycle Analysis — Blockchain Letter',
    year: 2024,
    url: 'https://panteracapital.com/blockchain-letter/',
    institutionUrl: 'https://panteracapital.com/blockchain-letter/',
    indicators: ['Cycles Halving', 'Stock-to-Flow Dynamique', 'Timing de Cycle', 'Momentum Post-Halving'],
    summary: "Le fonds crypto le plus ancien (depuis 2013) analyse 3 cycles de halving complets : BTC atteint son pic statistiquement ~480 jours après chaque halving.",
    explanation:
      "Pantera Capital est le premier fonds de venture capital crypto des États-Unis, fondé en 2013 — ils ont vécu les 3 halvings Bitcoin précédents (2012, 2016, 2020) avec des données réelles d'investissement. Leur analyse des cycles est la plus documentée qui existe : en étudiant les 3 cycles complets, ils ont identifié un pattern : Bitcoin atteint son pic de cycle en moyenne 480 jours après le halving. Le halving de 2024 a eu lieu en avril 2024, ce qui placerait statistiquement le pic du cycle autour de juillet-août 2025. Ce n'est pas une prédiction exacte — c'est une probabilité basée sur 12 ans de données. Leur 'Blockchain Letter' mensuelle est gratuite et contient les analyses les plus approfondies sur les cycles Bitcoin qu'on trouve sur internet.",
    howToApply: [
      "Calcule où tu en es dans le cycle : Halving avril 2024 → Peak statistique ~juillet-août 2025 (480 jours). Plus on approche de cette date et plus le prix monte, plus il faut être vigilant et réduire progressivement les leviers.",
      "Les 12 mois post-halving sont historiquement la période la plus favorable pour les longs BTC. Pendant cette fenêtre, les pullbacks vers les EMAs sont des opportunités d'achat avec haute probabilité selon Pantera.",
      "Inscris-toi à la 'Blockchain Letter' mensuelle de Pantera (gratuit sur leur site). Ils donnent le pourcentage du cycle écoulé, les métriques on-chain clés et leur positioning — utile pour le contexte macro.",
      "L'analyse Pantera montre que les 3 mois avant un halving sont aussi une période favorable (anticipation). En trading 4H, ce contexte macro positif justifie de favoriser les longs par rapport aux shorts.",
      "Quand Pantera publie une analyse disant qu'on est dans la 'phase de distribution' (après le peak estimé), c'est le signal pour resserrer drastiquement tes stops et éviter les longs avec levier élevé.",
    ],
    metrics: [
      { label: 'Fondé en', value: '2013' },
      { label: 'Peak moyen', value: 'J+480' },
    ],
  },

  {
    id: 'vaneck-digital-assets',
    institution: 'VanEck Digital Assets Research',
    country: '🇺🇸',
    category: 'institutional',
    title: 'Bitcoin & Crypto Quarterly Outlook — Cycle Analysis',
    year: 2024,
    url: 'https://www.vaneck.com/us/en/blogs/digital-assets/',
    institutionUrl: 'https://www.vaneck.com/us/en/blogs/digital-assets/',
    indicators: ['Cycle Analysis', 'Mining Economics', 'ETF Flows', 'Altcoin Beta'],
    summary: "VanEck (gestionnaire d'ETF, $80 Mds AUM) publie des modèles de valorisation ETH basés sur l'activité réseau et analyse le 'beta' des altcoins par rapport à BTC.",
    explanation:
      "VanEck est l'un des premiers gestionnaires traditionnels à avoir lancé des ETF crypto (HODL Bitcoin ETF, ETHV Ethereum ETF). Leur équipe de recherche Digital Assets est reconnue pour deux choses : 1) leur modèle de valorisation d'Ethereum basé sur l'activité réseau (transactions, revenus de fees, staking) qui donne un 'juste prix fondamental' pour ETH. 2) Leur analyse du 'beta des altcoins' : en clair, quand BTC monte de 10%, certains altcoins montent de 20-30% (beta élevé) alors que d'autres montent seulement de 5% (beta faible). Connaître le beta d'un altcoin te permet d'optimiser tes trades selon ta tolérance au risque.",
    howToApply: [
      "Consulte le blog VanEck Digital Assets chaque semaine (gratuit). Leurs 'Bitcoin Monthly Recap' résument en 5 points les métriques clés du mois — idéal pour calibrer le biais mensuel.",
      "Le modèle de valorisation ETH de VanEck est basé sur le cash flow du protocole (fees × P/E ratio). Quand le 'juste prix' VanEck est au-dessus du prix actuel → ETH potentiellement sous-évalué → favorable pour les longs ETH.",
      "Connaître le beta d'un actif : si SOL a un beta de 2.5 par rapport à BTC, une baisse de 5% de BTC implique une baisse statistique de 12.5% de SOL. Cela justifie des stops plus serrés sur les alts et des leviers plus faibles.",
      "Quand VanEck publie des prévisions de prix BTC basées sur leur modèle économique (ils l'ont fait à $350K peak de cycle pour 2025), utilise ces niveaux comme zones de resistance psychologique pour les institutions.",
      "VanEck suit la corrélation entre les flux de leur ETF HODL et le prix BTC. Quand leurs flux ETF divergent du prix (ex : prix baisse mais flux positifs) → les institutionnels achètent la baisse → signal contrarian bullish fort.",
    ],
    metrics: [
      { label: 'AUM VanEck', value: '~80 Mds$' },
    ],
  },

  // ══════════════════ NOUVELLES SOURCES — ACADÉMIQUE ══════════════════

  {
    id: 'cambridge-ccaf-2024',
    institution: 'Cambridge Centre for Alternative Finance (CCAF)',
    country: '🇬🇧',
    category: 'academic',
    title: 'Global Cryptoasset Benchmarking Study & Cambridge Bitcoin Electricity Index',
    authors: 'Michel Rauchs et al.',
    year: 2024,
    url: 'https://ccaf.io/cbaul/cbeci',
    institutionUrl: 'https://ccaf.io',
    indicators: ['Hash Rate', 'Coût de Production BTC', 'Mining Profitability', 'Consommation Énergie'],
    summary: "Cambridge (université top-5 mondial) publie le CBECI : le coût réel de production d'un Bitcoin. Quand le prix < coût de production, les miners capitulent → creux de cycle historique.",
    explanation:
      "Le Cambridge Centre for Alternative Finance (CCAF) est la division de recherche sur la finance alternative de l'Université de Cambridge, l'une des 5 meilleures universités mondiales. Leur travail le plus connu est le CBECI (Cambridge Bitcoin Electricity Consumption Index) qui mesure la consommation électrique du réseau Bitcoin. Mais leur contribution la plus utile pour les traders est le calcul du coût de production moyen d'un Bitcoin (electricity cost × hash rate × efficiency). Ce chiffre est fondamental : quand le prix de Bitcoin tombe sous son coût de production, les miners ne sont plus rentables → ils cessent d'investir, parfois vendent leurs réserves → c'est un signal de capitulation classique qui marque historiquement les creux de cycle. C'est arrivé en décembre 2018, mars 2020 et novembre 2022.",
    howToApply: [
      "Le coût de production BTC estimé par Cambridge (actualisé sur CCAF.io) est une zone de support fondamentale. Si BTC approche ce niveau, c'est la zone d'achat institutionnel la plus solide qui existe.",
      "Quand le prix BTC est 2-3× au-dessus du coût de production, les miners sont très profitables → ils accumulent → moins de vente → bullish structurel.",
      "Le Hash Rate (disponible sur Cambridge CBECI en temps réel) est l'indicateur de santé du réseau. Hash Rate à ATH = miners très confiants = signal long-terme positif. Hash Rate qui chute -20% = miners capitulent = potentiel creux.",
      "Combine coût de production CCAF avec MVRV Z-Score Glassnode : si les deux signalent une zone de sous-évaluation simultanément → c'est la configuration la plus solide pour des longs à moyen terme.",
      "Le 'Profitability Index' des miners (prix / coût de production) est disponible sur Hashrate Index. Ratio > 3 = miners très profitables → peu de pression vendeuse de leur part. Ratio < 1.2 = pression de vente miner → contexte difficile.",
    ],
    metrics: [
      { label: 'Institution', value: 'Cambridge' },
      { label: 'Données', value: 'Temps réel' },
    ],
  },

  {
    id: 'imf-crypto-gfsr',
    institution: 'Fonds Monétaire International (FMI)',
    country: '🌐',
    category: 'institutional',
    title: 'Global Financial Stability Report — Crypto Asset Markets',
    year: 2024,
    url: 'https://www.imf.org/en/Publications/GFSR',
    institutionUrl: 'https://www.imf.org/en/Topics/fintech',
    indicators: ['Risque Systémique', 'Corrélation Marchés Émergents', 'Contagion', 'Stablecoins'],
    summary: "Le FMI (190 pays membres) quantifie les risques systémiques crypto et mesure leur contagion potentielle vers les marchés traditionnels — essentiel pour comprendre les crashes de corrélation.",
    explanation:
      "Le Fonds Monétaire International (FMI) est l'organisation économique internationale la plus importante du monde, représentant 190 pays. Leur rapport semestriel Global Financial Stability Report (GFSR) inclut depuis 2021 une analyse approfondie des marchés crypto. Leur apport unique : ils mesurent la 'contagion' entre les marchés crypto et les marchés financiers traditionnels. En 2022, ils ont prouvé que la corrélation entre Bitcoin et les marchés d'actions émergents avait augmenté de façon alarmante, rendant crypto moins utile comme diversificateur. Ils ont aussi documenté le risque de 'stablecoin run' (l'équivalent d'une panique bancaire en crypto) et son impact potentiel sur la liquidité des marchés.",
    howToApply: [
      "Lis la section 'Crypto Assets' du GFSR chaque octobre et avril (gratuit sur imf.org). Si le FMI sonne l'alarme sur la corrélation crypto/marchés émergents, c'est le signal de réduire les leviers sur tous tes trades.",
      "Le FMI publie aussi des 'Crypto Risk Scores' par pays. Quand des économies majeures (Turquie, Argentine, Nigeria) voient une adoption crypto explosive, ça peut créer des flux déstabilisateurs sur BTC/USDT.",
      "Les recommandations réglementaires du FMI précèdent souvent les décisions des gouvernements. Si le FMI recommande de 'limiter les transactions crypto' dans un rapport → risque réglementaire élevé à 6-12 mois → méfiance sur les longs long-terme.",
      "Le FMI a documenté que les crashes de stablecoins (type UST 2022) peuvent déclencher des ventes forcées sur BTC/ETH dans les 48h → si un stablecoin majeur vacille (USDT, USDC), réduis IMMÉDIATEMENT toute exposition leverage.",
      "Leur indicateur de 'crypto-isation' (adoption crypto dans les économies en développement) préfigure parfois la demande future. Une forte adoption dans les pays à haute inflation = demande structurelle de long terme pour BTC.",
    ],
    metrics: [
      { label: 'Pays membres', value: '190' },
      { label: 'Rapport', value: '2×/an' },
    ],
  },

  // ══════════════════ NOUVELLES SOURCES — ON-CHAIN ══════════════════

  {
    id: 'nansen-smart-money',
    institution: 'Nansen Research',
    country: '🇸🇬',
    category: 'onchain',
    title: 'Smart Money On-Chain Tracking — Ethereum & DeFi Intelligence',
    year: 2024,
    url: 'https://research.nansen.ai/',
    institutionUrl: 'https://research.nansen.ai/',
    indicators: ['Smart Money Wallets', 'Token Transfers Institutionnels', 'DeFi Flows', 'NFT Whales'],
    summary: "Nansen identifie les wallets 'smart money' (hedge funds, family offices crypto) et tracke leurs mouvements en temps réel — si les pros achètent, c'est un signal fort.",
    explanation:
      "Nansen est une plateforme d'analytics on-chain fondée à Singapour et utilisée par les meilleurs hedge funds crypto. Leur innovation principale : ils ont étiqueté des millions de wallets Ethereum en fonction de leur comportement historique. Un wallet qui a systématiquement acheté des tokens avant leurs grandes hausses est identifié comme 'Smart Money'. Un wallet associé à un exchange ou un fonds connu est étiqueté directement. En suivant les transactions de ces wallets 'smart money' en temps réel, tu peux détecter qu'un token ou actif est en train d'être accumulé par les professionnels avant que ça soit visible sur le graphique. C'est l'équivalent d'avoir accès aux relevés de comptes des meilleurs traders.",
    howToApply: [
      "Nansen a une version gratuite avec des alertes basiques. Crée une alerte pour les gros mouvements de wallets 'Smart Money' vers des tokens que tu surveilles. Un cluster d'achats smart money = signal d'entrée potentiel.",
      "Pour ETH et les L2 tokens, vérifie sur Nansen les 'Smart Money Flow' avant un trade. Si les smart money ont accumulé dans les 48-72h → le setup technique a une probabilité plus haute de fonctionner.",
      "Nansen 'Wallet Profiler' permet de voir l'historique de performance d'un wallet. Si un wallet avec 90%+ de trades gagnants accumule un token → information précieuse à croiser avec ton analyse 4H.",
      "Les alertes Nansen sur les sorties massives de tokens vers des exchanges par des smart money wallets = signal de distribution institutionnelle → skip les longs sur ces actifs dans les 24h.",
      "Le rapport hebdomadaire Nansen 'State of DeFi' (partiellement gratuit) résume les flux DeFi de la semaine — utile pour le contexte fondamental de tes positions ETH/L2.",
    ],
    metrics: [
      { label: 'Wallets étiquetés', value: '200M+' },
      { label: 'Temps réel', value: 'Oui' },
    ],
  },

  {
    id: 'theblock-research',
    institution: 'The Block Research',
    country: '🇺🇸',
    category: 'data',
    title: 'Crypto Data Dashboard — OI, Volumes, Stablecoins & Fundamentals',
    year: 2024,
    url: 'https://www.theblock.co/data/crypto-markets',
    institutionUrl: 'https://www.theblock.co/research',
    indicators: ['OI Total Marché', 'Volume DEX/CEX', 'Supply Stablecoins', 'Revenus Miners'],
    summary: "The Block agrège les données de l'ensemble du marché crypto en tableaux en temps réel — le meilleur dashboard unique pour l'OI total, les volumes DEX et la supply de stablecoins.",
    explanation:
      "The Block est l'un des médias de recherche crypto les plus respectés. Leur dashboard de données (partiellement gratuit) agrège des centaines de métriques du marché crypto en un seul endroit : Open Interest total sur tous les exchanges (pas seulement un), volumes DEX vs CEX, supply totale des stablecoins, revenus des miners Bitcoin, etc. La valeur ajoutée : au lieu de vérifier 5 plateformes différentes, The Block te donne tout en une page. Leur métrique 'Stablecoin Supply on Exchanges' est particulièrement utile : plus il y a de stablecoins sur les exchanges, plus il y a de 'dry powder' (argent disponible pour acheter) → bullish. Cette métrique est l'équivalent on-chain du SSR de CryptoQuant mais sur une échelle plus large.",
    howToApply: [
      "Bookmarke theblock.co/data. Avant chaque session de trading, regarde l'OI total du marché (haut de tableau). OI en forte hausse depuis la semaine dernière = levier élevé → risque de cascade = prudence sur les longs avec levier.",
      "La 'Stablecoin Supply on Exchanges' sur The Block est un indicateur de dry powder. Supply élevée et croissante = beaucoup d'argent attendant d'acheter → bullish pour les prochains jours.",
      "Compare le volume DEX/CEX ratio : un ratio croissant (plus de trading on-chain) = marché plus décentralisé et actif → souvent corrélé aux bull markets ETH/DeFi.",
      "Quand les revenus des miners BTC (fees + block reward en $) sont en forte hausse = blocs très demandés = activité réseau intense = phase de marché généralement active et haussière.",
      "Utilise The Block pour vérifier si les volumes actuels sont anormalement bas ou élevés. Volume très bas pendant une consolidation = faible conviction = breakout moins fiable dans un sens ou dans l'autre.",
    ],
  },
]

// ─────────────────────────────────────────────────────────────
// CONFIG CATÉGORIES
// ─────────────────────────────────────────────────────────────

const CATEGORY_META = [
  { id: 'all' as const, label: 'Tout', icon: Layers },
  { id: 'academic' as const, label: 'Académique', icon: GraduationCap },
  { id: 'institutional' as const, label: 'Institutionnel', icon: Building2 },
  { id: 'onchain' as const, label: 'On-Chain', icon: Activity },
  { id: 'data' as const, label: 'Données & Marchés', icon: Database },
]

const CATEGORY_LABELS: Record<Category, string> = {
  academic: 'Académique',
  institutional: 'Institutionnel',
  onchain: 'On-Chain',
  data: 'Données',
}

const CATEGORY_ICONS: Record<Category, typeof GraduationCap> = {
  academic: GraduationCap,
  institutional: Building2,
  onchain: Activity,
  data: Database,
}

const CATEGORY_CONFIG: Record<
  Category,
  {
    color: string
    glow: string
    badge: string
    indicator: string
    iconBg: string
    activeTab: string
    metricBg: string
    applyBg: string
  }
> = {
  academic: {
    color: '#6366f1',
    glow: 'rgba(99,102,241,0.12)',
    badge: 'bg-accent/10 text-accent border border-accent/25',
    indicator: 'bg-accent/8 text-accent border border-accent/15',
    iconBg: 'bg-accent/15 border-accent/30 text-accent',
    activeTab: 'border-accent/40 bg-accent/10 text-accent shadow-[0_0_20px_rgba(99,102,241,0.15)]',
    metricBg: 'from-accent/5 to-transparent',
    applyBg: 'bg-accent/5 border-accent/15',
  },
  institutional: {
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.12)',
    badge: 'bg-amber-500/10 text-amber-400 border border-amber-500/25',
    indicator: 'bg-amber-500/8 text-amber-400 border border-amber-500/15',
    iconBg: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
    activeTab: 'border-amber-500/40 bg-amber-500/10 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.15)]',
    metricBg: 'from-amber-500/5 to-transparent',
    applyBg: 'bg-amber-500/5 border-amber-500/15',
  },
  onchain: {
    color: '#34D399',
    glow: 'rgba(52,211,153,0.12)',
    badge: 'bg-profit/10 text-profit border border-profit/25',
    indicator: 'bg-profit/8 text-profit border border-profit/15',
    iconBg: 'bg-profit/15 border-profit/30 text-profit',
    activeTab: 'border-profit/40 bg-profit/10 text-profit shadow-[0_0_20px_rgba(52,211,153,0.15)]',
    metricBg: 'from-profit/5 to-transparent',
    applyBg: 'bg-profit/5 border-profit/15',
  },
  data: {
    color: '#60a5fa',
    glow: 'rgba(96,165,250,0.12)',
    badge: 'bg-blue-500/10 text-blue-400 border border-blue-500/25',
    indicator: 'bg-blue-500/8 text-blue-400 border border-blue-500/15',
    iconBg: 'bg-blue-500/15 border-blue-500/30 text-blue-400',
    activeTab: 'border-blue-500/40 bg-blue-500/10 text-blue-400 shadow-[0_0_20px_rgba(96,165,250,0.15)]',
    metricBg: 'from-blue-500/5 to-transparent',
    applyBg: 'bg-blue-500/5 border-blue-500/15',
  },
}

// ─────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────

export default function SourcesPage() {
  const [activeCategory, setActiveCategory] = useState<'all' | Category>('all')
  const [search, setSearch] = useState('')

  const counts = useMemo(() => {
    const acc: Record<string, number> = { all: SOURCES.length }
    for (const s of SOURCES) {
      acc[s.category] = (acc[s.category] ?? 0) + 1
    }
    return acc
  }, [])

  const filtered = useMemo(() => {
    return SOURCES.filter((s) => {
      const matchCat = activeCategory === 'all' || s.category === activeCategory
      const q = search.trim().toLowerCase()
      const matchSearch =
        !q ||
        s.institution.toLowerCase().includes(q) ||
        s.title.toLowerCase().includes(q) ||
        (s.authors?.toLowerCase().includes(q) ?? false) ||
        s.indicators.some((i) => i.toLowerCase().includes(q)) ||
        s.summary.toLowerCase().includes(q) ||
        s.explanation.toLowerCase().includes(q) ||
        s.howToApply.some((h) => h.toLowerCase().includes(q))
      return matchCat && matchSearch
    })
  }, [activeCategory, search])

  const featured = useMemo(() => SOURCES.filter((s) => s.featured), [])
  const showFeatured =
    activeCategory === 'all' && !search.trim() && filtered.length > 0
  const regularFiltered = showFeatured
    ? filtered.filter((s) => !s.featured)
    : filtered

  const hasActiveFilters = search.trim() !== '' || activeCategory !== 'all'

  return (
    <div className="min-h-screen bg-bg-base">
      {/* ── Hero ── */}
      <header className="relative overflow-hidden border-b border-border">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 20% -10%, rgba(99,102,241,0.18) 0%, transparent 55%), radial-gradient(ellipse 60% 50% at 85% 0%, rgba(52,211,153,0.08) 0%, transparent 50%)',
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(10,11,15,0.4)_100%)]" aria-hidden="true" />

        <div className="relative mx-auto max-w-6xl px-6 py-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-start gap-5">
              <div className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 shadow-[0_0_32px_rgba(99,102,241,0.2)]">
                <Library size={26} className="text-accent" aria-hidden="true" />
                <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border border-amber-500/40 bg-amber-500/20">
                  <Sparkles size={10} className="text-amber-400" aria-hidden="true" />
                </div>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                  Bibliothèque de recherche
                </p>
                <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
                  Sources Fiables
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-secondary">
                  Chaque carte contient l&apos;explication vulgarisée et les étapes concrètes pour appliquer la recherche dans ton trading — sans lire l&apos;article complet.
                </p>
              </div>
            </div>

            {/* Stats KPI */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[420px]">
              {[
                { value: SOURCES.length, label: 'Sources', icon: FileText, color: 'text-text-primary', bg: 'bg-bg-card' },
                { value: counts.academic ?? 0, label: 'Académique', icon: GraduationCap, color: 'text-accent', bg: 'bg-accent/5' },
                { value: counts.institutional ?? 0, label: 'Institutionnel', icon: Landmark, color: 'text-amber-400', bg: 'bg-amber-500/5' },
                { value: featured.length, label: 'Vedettes', icon: Star, color: 'text-profit', bg: 'bg-profit/5' },
              ].map(({ value, label, icon: Icon, color, bg }) => (
                <div
                  key={label}
                  className={cn(
                    'rounded-xl border border-border px-4 py-3 transition-colors hover:border-border-strong',
                    bg,
                  )}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <Icon size={14} className={cn('opacity-70', color)} aria-hidden="true" />
                  </div>
                  <p className={cn('font-mono text-2xl font-bold tabular-nums', color)}>{value}</p>
                  <p className="mt-0.5 text-xs text-text-muted">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ── Barre de filtres ── */}
      <div className="sticky top-0 z-30 border-b border-border bg-bg-base/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div
            className="flex flex-wrap gap-1 rounded-xl border border-border bg-bg-surface p-1"
            role="tablist"
            aria-label="Filtrer par catégorie"
          >
            {CATEGORY_META.map((cat) => {
              const active = activeCategory === cat.id
              const Icon = cat.icon
              const activeCls =
                cat.id !== 'all' && cat.id in CATEGORY_CONFIG
                  ? CATEGORY_CONFIG[cat.id as Category].activeTab
                  : 'border-accent/40 bg-accent/10 text-accent shadow-[0_0_20px_rgba(99,102,241,0.15)]'

              return (
                <button
                  key={cat.id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-200',
                    active
                      ? activeCls
                      : 'border-transparent text-text-secondary hover:bg-bg-hover hover:text-text-primary',
                  )}
                >
                  <Icon size={14} aria-hidden="true" />
                  <span className="hidden sm:inline">{cat.label}</span>
                  <span className="sm:hidden">{cat.label.split(' ')[0]}</span>
                  <span
                    className={cn(
                      'rounded-md px-1.5 py-0.5 font-mono text-xs tabular-nums',
                      active ? 'bg-black/20' : 'bg-bg-elevated text-text-muted',
                    )}
                  >
                    {counts[cat.id] ?? 0}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="relative w-full lg:w-72">
            <Search
              size={15}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Indicateur, institution, concept…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Rechercher dans les sources"
              className="w-full rounded-xl border border-border bg-bg-card py-2.5 pl-10 pr-9 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                aria-label="Effacer la recherche"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-text-muted transition-colors hover:bg-bg-hover hover:text-text-primary"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Contenu ── */}
      <div className="mx-auto max-w-6xl px-6 py-8">
        {filtered.length === 0 ? (
          <EmptyState onReset={() => { setSearch(''); setActiveCategory('all') }} />
        ) : (
          <div className="space-y-10">
            {hasActiveFilters && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-text-muted">
                  <span className="font-mono font-semibold tabular-nums text-text-secondary">
                    {filtered.length}
                  </span>{' '}
                  source{filtered.length > 1 ? 's' : ''} trouvée{filtered.length > 1 ? 's' : ''}
                </p>
                <button
                  onClick={() => { setSearch(''); setActiveCategory('all') }}
                  className="text-xs font-medium text-accent transition-colors hover:text-accent/80"
                >
                  Effacer les filtres
                </button>
              </div>
            )}

            {showFeatured && (
              <section aria-labelledby="featured-heading">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10">
                    <Star size={15} className="fill-amber-400 text-amber-400" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 id="featured-heading" className="text-base font-bold text-text-primary">
                      Études vedettes
                    </h2>
                    <p className="text-xs text-text-muted">Clique sur « Voir l'analyse complète » pour l'explication et les étapes d'application</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {featured.map((source, i) => (
                    <SourceCard key={source.id} source={source} featured index={i} />
                  ))}
                </div>
              </section>
            )}

            {regularFiltered.length > 0 && (
              <section aria-labelledby="all-sources-heading">
                {showFeatured && (
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-bg-elevated">
                      <BookOpen size={15} className="text-text-secondary" aria-hidden="true" />
                    </div>
                    <div>
                      <h2 id="all-sources-heading" className="text-base font-bold text-text-primary">
                        Toutes les sources
                      </h2>
                      <p className="text-xs text-text-muted">{regularFiltered.length} études et rapports</p>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {regularFiltered.map((source, i) => (
                    <SourceCard key={source.id} source={source} index={i} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        <footer className="mt-14 rounded-xl border border-border bg-bg-surface px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-accent/10">
              <Library size={15} className="text-accent" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">À propos de cette bibliothèque</p>
              <p className="mt-1 text-xs leading-relaxed text-text-muted">
                Toutes les sources proviennent d&apos;institutions académiques reconnues, de gestionnaires d&apos;actifs
                réglementés ou de fournisseurs de données institutionnels. Les explications et étapes d&apos;application
                sont rédigées pour être utilisées directement dans la pratique du trading.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// SOUS-COMPOSANTS
// ─────────────────────────────────────────────────────────────

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-bg-surface/50 py-24 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-bg-elevated">
        <BookOpen size={28} className="text-text-disabled" aria-hidden="true" />
      </div>
      <p className="text-lg font-semibold text-text-secondary">Aucune source trouvée</p>
      <p className="mt-2 max-w-sm text-sm text-text-muted">
        Essayez un autre terme de recherche ou sélectionnez une autre catégorie
      </p>
      <button
        onClick={onReset}
        className="mt-6 rounded-xl border border-accent/30 bg-accent/10 px-5 py-2.5 text-sm font-medium text-accent transition-colors hover:bg-accent/20"
      >
        Réinitialiser les filtres
      </button>
    </div>
  )
}

function SourceCard({
  source,
  featured = false,
  index = 0,
}: {
  source: Source
  featured?: boolean
  index?: number
}) {
  const [expanded, setExpanded] = useState(false)
  const config = CATEGORY_CONFIG[source.category]
  const CategoryIcon = CATEGORY_ICONS[source.category]
  const sameUrl = source.url === source.institutionUrl

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-bg-card transition-all duration-300 motion-safe:animate-fade-in',
        expanded
          ? 'border-border-strong shadow-[0_12px_40px_rgba(0,0,0,0.4)]'
          : 'hover:-translate-y-0.5 hover:border-border-strong hover:shadow-[0_8px_32px_rgba(0,0,0,0.35)]',
        featured
          ? 'border-amber-500/25 shadow-[0_0_24px_rgba(245,158,11,0.08)]'
          : 'border-border',
      )}
      style={{
        animationDelay: `${Math.min(index * 40, 400)}ms`,
        boxShadow: featured && !expanded ? undefined : `0 0 0 1px transparent, 0 4px 24px ${config.glow}`,
      }}
    >
      {/* Bandeau couleur catégorie */}
      <div
        className="h-1 w-full flex-shrink-0"
        style={{ background: `linear-gradient(90deg, ${config.color}, ${config.color}44)` }}
        aria-hidden="true"
      />

      <div className="flex flex-1 flex-col gap-4 p-5">
        {/* En-tête carte */}
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border',
              config.iconBg,
            )}
          >
            <CategoryIcon size={18} aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn('rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide', config.badge)}>
                {CATEGORY_LABELS[source.category]}
              </span>
              {source.year && (
                <span className="rounded-md border border-border bg-bg-elevated px-2 py-0.5 font-mono text-[11px] tabular-nums text-text-muted">
                  {source.year}
                </span>
              )}
              {featured && (
                <span className="ml-auto flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-400">
                  <Star size={9} className="fill-amber-400 text-amber-400" aria-hidden="true" />
                  Vedette
                </span>
              )}
            </div>
            <p className="mt-2 truncate text-xs font-medium text-text-muted">
              <span aria-hidden="true">{source.country} </span>
              {source.institution}
            </p>
          </div>
        </div>

        {/* Titre & auteurs */}
        <div>
          <h3 className="text-[15px] font-bold leading-snug text-text-primary transition-colors group-hover:text-white">
            {source.title}
          </h3>
          {source.authors && (
            <p className="mt-1.5 text-xs italic text-text-muted">{source.authors}</p>
          )}
        </div>

        {/* Indicateurs */}
        <div className="flex flex-wrap gap-1.5" aria-label="Indicateurs validés">
          {source.indicators.slice(0, 4).map((ind) => (
            <span
              key={ind}
              className={cn('rounded-md px-2 py-0.5 text-[11px] font-medium', config.indicator)}
            >
              {ind}
            </span>
          ))}
          {source.indicators.length > 4 && (
            <span className="rounded-md border border-border bg-bg-elevated px-2 py-0.5 text-[11px] text-text-muted">
              +{source.indicators.length - 4}
            </span>
          )}
        </div>

        {/* Résumé court */}
        <p className={cn('text-xs leading-relaxed text-text-secondary', !expanded && 'line-clamp-2')}>
          {source.summary}
        </p>

        {/* Section dépliable — explication + application */}
        {expanded && (
          <div className="space-y-4 border-t border-border pt-4">
            {/* Explication vulgarisée */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <BookOpen size={13} className="text-text-muted" aria-hidden="true" />
                <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">De quoi ça parle</p>
              </div>
              <p className="text-xs leading-relaxed text-text-secondary">
                {source.explanation}
              </p>
            </div>

            {/* Comment l'appliquer */}
            <div className={cn('rounded-xl border p-4', config.applyBg)}>
              <div className="mb-3 flex items-center gap-2">
                <Zap size={13} style={{ color: config.color }} aria-hidden="true" />
                <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: config.color }}>
                  Comment l'appliquer
                </p>
              </div>
              <ul className="space-y-2.5">
                {source.howToApply.map((step, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle2
                      size={13}
                      className="mt-0.5 flex-shrink-0"
                      style={{ color: config.color, opacity: 0.7 }}
                      aria-hidden="true"
                    />
                    <span className="text-xs leading-relaxed text-text-secondary">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Métriques */}
        {source.metrics && source.metrics.length > 0 && (
          <div
            className={cn(
              'grid gap-px overflow-hidden rounded-xl border border-border bg-border',
              source.metrics.length === 2 ? 'grid-cols-2' : 'grid-cols-3',
            )}
          >
            {source.metrics.map((m) => (
              <div
                key={m.label}
                className={cn('bg-gradient-to-b px-3 py-2.5 text-center', config.metricBg, 'to-bg-card')}
              >
                <p className="font-mono text-sm font-bold tabular-nums text-text-primary">{m.value}</p>
                <p className="mt-0.5 text-[10px] leading-tight text-text-muted">{m.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 border-t border-border bg-bg-surface/50 p-4">
        {/* Toggle explication */}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-semibold transition-all',
            expanded
              ? 'border-border-strong bg-bg-elevated text-text-primary'
              : 'border-border text-text-secondary hover:border-border-strong hover:bg-bg-hover hover:text-text-primary',
          )}
        >
          {expanded ? (
            <>
              <ChevronUp size={13} aria-hidden="true" />
              Réduire
            </>
          ) : (
            <>
              <ChevronDown size={13} aria-hidden="true" />
              Voir l&apos;analyse complète
            </>
          )}
        </button>

        {/* Liens */}
        <div className="flex gap-2">
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent/10 px-3 py-2 text-xs font-semibold text-accent transition-all hover:bg-accent/20 hover:shadow-[0_0_16px_rgba(99,102,241,0.2)]"
          >
            <ExternalLink size={12} aria-hidden="true" />
            Lire l&apos;étude
          </a>
          {!sameUrl && (
            <a
              href={source.institutionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-bg-card px-3 py-2 text-xs font-medium text-text-secondary transition-all hover:border-border-strong hover:text-text-primary"
            >
              <ChevronRight size={12} aria-hidden="true" />
              Portail recherche
            </a>
          )}
        </div>
      </div>
    </article>
  )
}
