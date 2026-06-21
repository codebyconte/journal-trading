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
  /** Lien direct vers l'étude ou l'article */
  url: string
  /** Lien vers la page de recherche de l'institution */
  institutionUrl: string
  indicators: string[]
  summary: string
  metrics?: Metric[]
  featured?: boolean
}

// ─────────────────────────────────────────────────────────────
// DATA — 23 sources vérifiées (académiques + institutionnelles)
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
    summary:
      "Analyse horaire BTC/USD démontrant que l'alliance EMA + filtre de volatilité ATR fait passer le ratio de Sharpe de 1.1 (Buy & Hold) à 3.2. L'ATR réduit le drawdown maximum à 25% contre 85% pour le marché brut. Validation scientifique de l'apport des filtres de volatilité sur les stratégies de croisement de moyennes.",
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
    summary:
      "Plus de 15 000 variations de règles techniques appliquées à BTC, LTC, ETH et XRP sur données historiques quotidiennes. Les règles basées sur les MA et le momentum génèrent des alphas substantiels avec un pouvoir prédictif statistiquement significatif (p < 5%) supérieur au Buy & Hold passif.",
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
    summary:
      "Valide qu'attendre des confluences de filtres macro (Russell 2000, S&P 500) et signaux quantitatifs améliore la régularité des gains. La stratégie 'Pure Alpha' maintient des performances robustes après déduction des frais réels. Pionnière dans l'intégration LLM + analyse technique classique.",
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
    summary:
      "Étude fondatrice sur 31 ans de données boursières US prouvant statistiquement que les patterns graphiques contiennent de l'information prédictive significative sur les rendements futurs. Travail le plus cité de la littérature académique sur l'analyse technique — base théorique de toute stratégie chartiste.",
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
    summary:
      "Étude pivot sur 58 futures liquides (actions, obligations, matières premières, devises) sur 25 ans. Démontre que les actifs performants sur les 12 derniers mois continuent de surperformer — Sharpe moyen de 1.3. Résultats validés ultérieurement sur les marchés crypto par des études indépendantes.",
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
    summary:
      "Référence fondatrice sur 90 ans de données DJIA. Prouve que les signaux de moyennes mobiles et de rupture de range génèrent des rendements anormaux statistiquement significatifs. Pose les bases scientifiques de l'analyse technique moderne, encore citée aujourd'hui comme pierre angulaire de la discipline.",
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
    summary:
      "Agrégateur mondial de pré-publications académiques sur les marchés crypto. L'analyse des microstructures et de la liquidité intraday démontre l'avantage mathématique du statut Maker et l'efficacité des ordres limites dans les zones de forte densité de volume. Portail central pour accéder aux travaux en cours de revue par les pairs.",
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
    summary:
      "L'institution de recherche économique américaine la plus citée au monde (Harvard, MIT, Stanford, Chicago Booth). Héberge des dizaines de travaux sur les marchés crypto : comportement des investisseurs, corrélations avec les actifs traditionnels, dynamiques des cycles de volatilité et impact des régulations.",
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
    summary:
      "Recherche d'un gestionnaire gérant +4 000 Mds USD. Prouve que l'intégration asymétrique du Bitcoin (faible % de capital risqué par position) améliore significativement le Sharpe du portefeuille grâce à la décorrélation historique avec les marchés financiers traditionnels.",
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
    summary:
      "Rapport de Fidelity (~4 500 Mds$ AUM) sur le Bitcoin comme actif alternatif de portefeuille. Analyse les modèles de valorisation S2F, la décorrélation avec le portefeuille 60/40 traditionnel et le positionnement Bitcoin comme couverture contre l'inflation. Référence majeure pour comprendre les flux institutionnels.",
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
    summary:
      "Rapport annuel d'ARK Invest intégrant une analyse quantitative complète de Bitcoin. Modèles de valorisation long-terme, analyse des wallets institutionnels, corrélation entre métriques on-chain (MVRV, NVT) et cycles de prix. Indispensable pour contextualiser les grandes tendances macro du marché crypto.",
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
    summary:
      "Analyse macro-prudentielle de la BIS (banque centrale des banques centrales) quantifiant la volatilité extrême des marchés crypto et les risques de liquidité structurels. Référence pour comprendre les régimes de volatilité et les stress de marché que tout trader doit intégrer dans sa gestion de risque.",
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
    summary:
      "Rapports trimestriels de Grayscale (~23 Mds$ AUM) analysant la rotation sectorielle (L1, DeFi, RWA, Memecoins), les corrélations avec Bitcoin et les indicateurs de valorisation relative (Price/TVL). Référence pour calibrer les entrées selon le cycle de marché et la dominance Bitcoin.",
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
    summary:
      "Research de Galaxy Digital couvrant les marchés crypto institutionnels. Analyses des flux de capitaux, de l'Open Interest sur les dérivés, et des métriques on-chain Bitcoin/ETH. Particulièrement utile pour anticiper les retournements de tendance via l'évolution de l'OI et des positions nettes.",
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
    summary:
      "Analyses de la plus grande bourse de dérivés mondiale sur les marchés Bitcoin futures. Couvre la structure à terme (basis, contango, backwardation), l'Open Interest institutionnel et les patterns de volatilité autour des dates d'expiration. Essentiel pour comprendre les dynamiques dérivés.",
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
    summary:
      "La Fed de New York publie régulièrement des staff reports sur les marchés crypto. Analyses des stablecoins, du DeFi et des corrélations entre Bitcoin et les indicateurs macro (taux d'intérêt, inflation, DXY). Perspective réglementaire et macro indispensable pour positionner les trades directionnels.",
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
    summary:
      "Standard institutionnel absolu pour l'analyse des cycles Bitcoin via métriques on-chain. MVRV Z-Score identifie les zones de surachat/survente, SOPR mesure la rentabilité des dépenses, le ratio STH/LTH révèle la distribution institutionnelle vs le HODLing retail. Rapport hebdomadaire de référence mondiale.",
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
    summary:
      "Plateforme d'analytics on-chain institutionnelle. Le suivi des flux entrant/sortant des exchanges (exchange flow) est la métrique clé pour anticiper les pressions de vente avant les cassures de support. Le Funding Rate et le Long/Short Ratio complètent l'analyse des marchés dérivés perpétuels.",
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
    summary:
      "Leader mondial en analytics blockchain (utilisé par gouvernements et institutions). Les rapports annuels fournissent des données structurelles uniques : volumes réels filtrés du washtrading, concentration des wallets, activité des miners. Contexte macro indispensable pour distinguer mouvements organiques et manipulations.",
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
    summary:
      "Fournisseur de données on-chain institutionnel (clients : BlackRock, Franklin Templeton). Rapport hebdomadaire analysant le Realized Cap comme proxy de valorisation fondamentale, le NVT Signal pour détecter les bulles spéculatives, et le Hash Rate comme indicateur de santé réseau.",
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
    summary:
      "Évaluation semestrielle de la structure des marchés crypto mondiaux. Leurs analyses prouvent que le suivi des volumes réels (filtrant le washtrading) via Volume Profile est la clé pour identifier les véritables supports et résistances où les ordres institutionnels s'accumulent réellement.",
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
    summary:
      "Référence européenne en données de marché crypto institutionnelles (partenaire Bloomberg et Reuters). Analyses de microstructure : spread bid/ask, profondeur du carnet L2 en temps réel. Source de référence pour comprendre la liquidité réelle et optimiser l'exécution pour réduire les coûts de friction.",
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
    summary:
      "Rapport annuel 'Crypto Theses' (150+ pages) et analyses sectorielles continues. Métriques de valorisation fondamentale des protocoles DeFi (P/E on-chain, Price/TVL, revenus de protocole) permettant d'identifier les actifs sous-valorisés par rapport à leurs fondamentaux on-chain réels.",
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
  },
  institutional: {
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.12)',
    badge: 'bg-amber-500/10 text-amber-400 border border-amber-500/25',
    indicator: 'bg-amber-500/8 text-amber-400 border border-amber-500/15',
    iconBg: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
    activeTab: 'border-amber-500/40 bg-amber-500/10 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.15)]',
    metricBg: 'from-amber-500/5 to-transparent',
  },
  onchain: {
    color: '#34D399',
    glow: 'rgba(52,211,153,0.12)',
    badge: 'bg-profit/10 text-profit border border-profit/25',
    indicator: 'bg-profit/8 text-profit border border-profit/15',
    iconBg: 'bg-profit/15 border-profit/30 text-profit',
    activeTab: 'border-profit/40 bg-profit/10 text-profit shadow-[0_0_20px_rgba(52,211,153,0.15)]',
    metricBg: 'from-profit/5 to-transparent',
  },
  data: {
    color: '#60a5fa',
    glow: 'rgba(96,165,250,0.12)',
    badge: 'bg-blue-500/10 text-blue-400 border border-blue-500/25',
    indicator: 'bg-blue-500/8 text-blue-400 border border-blue-500/15',
    iconBg: 'bg-blue-500/15 border-blue-500/30 text-blue-400',
    activeTab: 'border-blue-500/40 bg-blue-500/10 text-blue-400 shadow-[0_0_20px_rgba(96,165,250,0.15)]',
    metricBg: 'from-blue-500/5 to-transparent',
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
        s.summary.toLowerCase().includes(q)
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
                  Études scientifiques, universitaires et institutionnelles — indicateurs backtestés et métriques crypto validées par des organismes reconnus.
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
              placeholder="Indicateur, institution, auteur…"
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
                    <p className="text-xs text-text-muted">Références essentielles à consulter en priorité</p>
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
                réglementés ou de fournisseurs de données institutionnels. Les liens s&apos;ouvrent vers les publications
                d&apos;origine dans un nouvel onglet.
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
  const config = CATEGORY_CONFIG[source.category]
  const CategoryIcon = CATEGORY_ICONS[source.category]
  const sameUrl = source.url === source.institutionUrl

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-bg-card transition-all duration-300 motion-safe:animate-fade-in',
        'hover:-translate-y-0.5 hover:border-border-strong hover:shadow-[0_8px_32px_rgba(0,0,0,0.35)]',
        featured
          ? 'border-amber-500/25 shadow-[0_0_24px_rgba(245,158,11,0.08)]'
          : 'border-border',
      )}
      style={{
        animationDelay: `${Math.min(index * 40, 400)}ms`,
        boxShadow: featured ? undefined : `0 0 0 1px transparent, 0 4px 24px ${config.glow}`,
      }}
    >
      {/* Bandeau couleur catégorie */}
      <div
        className="h-1 w-full"
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
          <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-text-primary transition-colors group-hover:text-white">
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

        {/* Résumé */}
        <p className="line-clamp-3 flex-1 text-xs leading-relaxed text-text-secondary">
          {source.summary}
        </p>

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
      <div className="flex gap-2 border-t border-border bg-bg-surface/50 p-4">
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent/10 px-3 py-2.5 text-xs font-semibold text-accent transition-all hover:bg-accent/20 hover:shadow-[0_0_16px_rgba(99,102,241,0.2)]"
        >
          <ExternalLink size={13} aria-hidden="true" />
          Lire l&apos;étude
        </a>
        {!sameUrl && (
          <a
            href={source.institutionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-bg-card px-3 py-2.5 text-xs font-medium text-text-secondary transition-all hover:border-border-strong hover:text-text-primary"
          >
            <ChevronRight size={13} aria-hidden="true" />
            Portail recherche
          </a>
        )}
      </div>
    </article>
  )
}
