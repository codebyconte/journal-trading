'use client'

import { PageShell, PageSection, PAGE_GUTTER_X } from '@/components/ui/PageShell'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  BookOpen, Brain, TrendingUp, TrendingDown, Shield, Zap, Target,
  AlertTriangle, CheckCircle2, XCircle, ExternalLink, Clock,
  Globe, Activity, BarChart2, Eye, Layers, Info, AlertOctagon,
  Lightbulb, Lock, Flame, ArrowRight, BarChart, Scale, BookMarked,
  ChevronRight, GitBranch, Crosshair, LineChart, Hash,
} from 'lucide-react'
import { MoodIcon } from '@/components/ui/TradingIcons'
import {
  Callout,
  SectionHeading,
  SubHeading,
  DataTable,
  Step,
  BiasCard,
  ConfluenceTag,
} from '@/components/ui/DocComponents'
import { Button } from '@/components/catalyst/button'

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'regle',       label: 'Règle Zéro',     icon: Brain        },
  { id: 'routine',     label: 'Routine',         icon: Clock        },
  { id: 'mtf',         label: 'Multi-Timeframe', icon: Layers       },
  { id: 'structure',   label: 'Market Structure',icon: GitBranch    },
  { id: 'technique',   label: 'Indicateurs',     icon: TrendingUp   },
  { id: 'onchain',     label: 'On-Chain',        icon: Activity     },
  { id: 'arkham',      label: 'Arkham',          icon: Eye          },
  { id: 'execution',   label: 'Exécution',       icon: Target       },
  { id: 'gestion',     label: 'Gestion Trade',   icon: Crosshair    },
  { id: 'macro',       label: 'Macro',           icon: Globe        },
  { id: 'psycho',      label: 'Psychologie',     icon: BookMarked   },
  { id: 'circuit',     label: 'Circuit-Breaker', icon: Shield       },
  { id: 'correlation', label: 'Corrélations',    icon: LineChart    },
] as const

type TabId = typeof TABS[number]['id']

// ─── Onglet : Règle Zéro ──────────────────────────────────────────────────────

function TabRegleZero() {
  return (
    <div className="space-y-6">
      <SectionHeading>Règle Zéro — L'État Émotionnel Prime sur Tout le Reste</SectionHeading>

      <Callout type="danger" title="Principe fondamental — Aucune exception">
        Je ne trade jamais sur une intuition. Chaque trade passe par les 7 étapes obligatoires du protocole. Si une seule étape échoue → pas de trade. Même si le setup semble "parfait". L'état émotionnel est évalué <strong className="text-white">avant toute ouverture de graphique</strong>.
      </Callout>

      <Callout type="warning" title="Pourquoi c'est scientifiquement fondé — Pas une opinion">
        <ul className="space-y-2">
          <li>• <strong className="text-white">Edgewonk Trading Journal — 50 000 trades analysés (2024)</strong> : Win rate 23% inférieur en état anxieux. Un système à 48% de WR normal descend à 37% en état dégradé — le rendant déficitaire.</li>
          <li>• <strong className="text-white">Kahneman & Tversky, "Prospect Theory" — Prix Nobel 2002</strong> : L'aversion aux pertes fait ressentir la douleur 2.25× plus intensément que le plaisir équivalent, biaisant systématiquement les décisions sous pression.</li>
          <li>• <strong className="text-white">Lo & Repin, "The Psychophysiology of Real-Time Financial Risk Processing" (2002)</strong> : Les traders montrant des réponses émotionnelles intenses ont des performances significativement inférieures à ceux qui maintiennent l'équanimité.</li>
        </ul>
      </Callout>

      <SubHeading icon={<Brain size={18} />}>Échelle d'État Émotionnel — 5 Niveaux</SubHeading>
      <div className="space-y-3">
        {[
          { score: 5, label: 'Optimal',  desc: 'Calme, reposé (7h+ de sommeil), concentré, sans distractions majeures ni émotion intense.', action: 'Trade avec pleine confiance. Taille normale.', color: 'profit' as const },
          { score: 4, label: 'Bon',      desc: 'Légèrement fatigué ou distrait mais maîtrisé. Pas de stress particulier. Sommeil correct.', action: 'Trade normalement. Taille normale.', color: 'profit' as const },
          { score: 3, label: 'Neutre',   desc: 'Quelques distractions, légère tension. Aucun biais émotionnel dominant identifiable.', action: 'Trade avec vigilance accrue. Taille normale.', color: 'neutral' as const },
          { score: 2, label: 'Dégradé',  desc: 'Stress, fatigue notable, récente perte douloureuse, anxiété, manque de sommeil, mauvaise nouvelle.', action: 'PAS DE TRADE — Ferme TradingView.', color: 'loss' as const },
          { score: 1, label: 'Critique', desc: 'En colère, euphorique après gains, devasté après perte, < 5h de sommeil, problèmes personnels majeurs.', action: 'FERME TOUT — Reviens demain.', color: 'loss' as const },
        ].map((r) => (
          <div key={r.score} className={cn(
            'flex items-center gap-4 rounded-xl border p-4',
            r.color === 'profit'  && 'border-emerald-500/20 bg-zinc-900',
            r.color === 'neutral' && 'border-amber-500/20 bg-zinc-900',
            r.color === 'loss'    && 'border-red-500/30 bg-red-500/10',
          )}>
            <MoodIcon score={r.score} size={28} />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white">{r.score}/5 — {r.label}</p>
              <p className="text-sm text-zinc-400 mt-0.5">{r.desc}</p>
            </div>
            <span className={cn(
              'text-sm font-bold flex-shrink-0 text-right ml-4',
              r.color === 'profit' && 'text-emerald-400',
              r.color === 'neutral' && 'text-amber-400',
              r.color === 'loss' && 'text-red-400',
            )}>{r.action}</span>
          </div>
        ))}
      </div>

      <SubHeading icon={<CheckCircle2 size={18} />}>Vue d'ensemble — Les 7 Étapes du Protocole</SubHeading>
      <div className="space-y-2">
        {[
          { n: '0', label: 'Règle Zéro', desc: 'État émotionnel ≥ 3/5. Évaluation mentale avant tout graphique.', tab: 'regle' },
          { n: '1', label: 'Analyse Multi-Timeframe', desc: 'Contexte hebdomadaire → Quotidien → 4H. Direction macro d\'abord.', tab: 'mtf' },
          { n: '2', label: 'Market Structure', desc: 'HH/HL/LH/LL → BOS/ChoCH. Confirme que la tendance est intacte.', tab: 'structure' },
          { n: '3', label: 'Indicateurs Techniques', desc: 'EMA Ribbon + RSI divergence + Volume Profile. Minimum 4/6 confluences.', tab: 'technique' },
          { n: '4', label: 'On-Chain + Arkham', desc: 'CryptoQuant 4/7 validés. Glassnode hebdo. Arkham alertes.', tab: 'onchain' },
          { n: '5', label: 'Filtres Macro', desc: 'Pas d\'événement rouge dans 48h. DXY contexte. VIX nominal.', tab: 'macro' },
          { n: '6', label: 'Exécution + Gestion', desc: 'Ordre Limite. SL ATR. TP calculé. Gestion active après entrée.', tab: 'execution' },
        ].map((s) => (
          <div key={s.n} className="flex items-center gap-4 rounded-xl border border-white/10 bg-zinc-900 px-4 py-3.5 hover:bg-white/5 transition-colors">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-500/15 border border-indigo-500/30 font-bold text-indigo-400">{s.n}</div>
            <div className="flex-1">
              <p className="font-semibold text-white">{s.label}</p>
              <p className="text-sm text-zinc-400">{s.desc}</p>
            </div>
            <ChevronRight size={16} className="text-zinc-500 flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Onglet : Routine ─────────────────────────────────────────────────────────

function TabRoutine() {
  return (
    <div className="space-y-6">
      <SectionHeading>Routine Quotidienne & Hebdomadaire</SectionHeading>

      <Callout type="success" title="Études sur l'importance de la routine">
        Enquête 4 200 traders actifs (2023) : <strong className="text-white">78% des traders profitables sur 3 ans+ ont une routine pré-session documentée</strong>. La routine élimine la "charge décisionnelle" (concept de Baumeister, 1998) et garantit un état d'esprit structuré plutôt que réactif.
      </Callout>

      <SubHeading icon={<Clock size={18} />}>Check Matin — 10 minutes, avant d'ouvrir un seul graphique</SubHeading>
      <div className="space-y-0">
        <Step num="1" title="Évalue ton état émotionnel (Règle Zéro)">
          <p>Prends 60 secondes. Note ton score /5. Si ≤ 2 → ferme tout, reviens demain.</p>
          <p>Questions : Ai-je bien dormi (7h+) ? Suis-je calme ou agité ? Y a-t-il une émotion forte présente ?</p>
        </Step>
        <Step num="2" title="Vérifie Forex Factory — Événement rouge dans les 24h ?">
          <p><a href="https://forexfactory.com" target="_blank" className="text-indigo-400 hover:underline inline-flex items-center gap-1">forexfactory.com <ExternalLink size={12} /></a> — Filtre : rouge uniquement.</p>
          <p>Événement rouge dans 24h → pas de nouveau trade. NFP dans 24h → taille réduite 50%.</p>
        </Step>
        <Step num="3" title="Arkham + ETF Flows — 3 minutes (flux institutionnels)">
          <p><strong className="text-red-400">Alerte gouvernement ≥ $50M vers exchange</strong> → pas de long. Si Whale Ratio {'>'} 0.85 + structure 4H baissière → setup short potentiel.</p>
          <p><strong className="text-amber-400">CEX Deposit ≥ $20M</strong> → croiser avec Whale Ratio. Whale Ratio ≥ 0.85 + 4H baissier → signal short actionnable.</p>
          <p><strong className="text-indigo-400">ETF Flows J-1</strong> → <a href="https://farside.co.uk" target="_blank" className="text-indigo-400 hover:underline inline-flex items-center gap-1">farside.co.uk <ExternalLink size={12} /></a> (30 secondes). 3 jours consécutifs outflows {'>'} $100M total → réduis taille longs à 0.5%. Outflows {'>'} $500M hier → pas de long.</p>
          <p><strong className="text-emerald-400">Tout neutre</strong> → continue le protocole normalement.</p>
        </Step>
        <Step num="4" title="BTC Dominance (BTC.D) — Contexte rapide">
          <p>BTC.D {'>'} 55% et montant → privilégie BTC uniquement, altcoins sous pression.</p>
          <p>BTC.D {'<'} 50% et descendant → ETH et SOL peuvent surperformer BTC.</p>
        </Step>
        <Step num="5" title="TradingView — Scan hebdomadaire + 4H (5 minutes max)">
          <p><strong className="text-white">Commence TOUJOURS par le weekly</strong> → puis daily → puis 4H. Jamais l'inverse.</p>
          <p>Y a-t-il une zone technique de retest à surveiller ? Si oui → protocole complet. Si non → alerte TradingView + ferme les graphiques.</p>
        </Step>
        <Step num="6" title="Token Unlocks — pour SOL et tout altcoin (pas BTC/ETH) — 30 secondes">
          <p><a href="https://tokenomist.ai" target="_blank" className="text-indigo-400 hover:underline inline-flex items-center gap-1">tokenomist.ai <ExternalLink size={12} /></a> → cherche l'actif que tu veux trader. <strong className="text-red-400">Unlock {'>'} 5% de l'offre circulante dans les 5 prochains jours → ne trade pas cet actif.</strong></p>
          <p className="text-zinc-500 text-sm">Pourquoi : les bénéficiaires de vesting (équipe, investisseurs VC) vendent mécaniquement à la réception. Pression vendeuse prévisible et documentée. Source : "Token Vesting and Investor Returns" (SSRN 2023). Pour BTC : non applicable.</p>
        </Step>
      </div>

      <Callout type="info" title="Limite de temps absolue">
        10 minutes. Pas plus. Si tu n'as pas de setup identifiable en 10 minutes → le marché ne te donne rien aujourd'hui. Les meilleures opportunités sont évidentes rapidement.
      </Callout>

      <SubHeading icon={<BookOpen size={18} />}>Check Dimanche — 20 minutes, une fois par semaine</SubHeading>
      <div className="space-y-0">
        <Step num="1" title="CME FedWatch + DXY + US10Y — Contexte macro de la semaine">
          <p>Ces 3 données définissent l'environnement de risque pour toute la semaine.</p>
        </Step>
        <Step num="2" title="VIX + QQQ vs EMA 200 weekly — Filtre de risque global">
          <p>QQQ sous EMA 200 weekly → très sélectif sur les longs crypto, taille réduite 30%.</p>
          <p>VIX {'>'} 30 → réduis taille 25%. VIX {'>'} 40 → demi-taille maximum.</p>
        </Step>
        <Step num="3" title="BTC weekly — Tendance macro">
          <p>BTC fermé au-dessus EMA 20 weekly ? Ruban EMA weekly haussier ? Confirme le biais directionnel long.</p>
        </Step>
        <Step num="4" title="Glassnode — NUPL, STH-MVRV, Accumulation Score">
          <p>Une fois par semaine suffit. Ces indicateurs bougent sur des semaines, pas des jours.</p>
        </Step>
        <Step num="5" title="DeFiLlama + CME Gaps — 2 minutes (contexte ETH/SOL + aimants BTC)">
          <p><a href="https://defillama.com" target="_blank" className="text-indigo-400 hover:underline inline-flex items-center gap-1">defillama.com <ExternalLink size={12} /></a> → vérifie la tendance TVL hebdomadaire pour ETH et SOL. <strong className="text-red-400">TVL DeFi -20% sur 7 jours</strong> = risk-off DeFi = filtre baissier pour ETH/SOL longs, réduis taille 30%. TVL stable ou hausse = neutre.</p>
          <p>CME Gaps BTC : sur TradingView, actif <strong className="text-white">BTC1!</strong> (CME futures) → identifie les gaps ouverts (espaces entre vendredi soir et dimanche soir). Gap non rempli sous le prix = aimant baissier à surveiller. Gap non rempli au-dessus = cible TP potentielle.</p>
          <p className="text-zinc-500 text-sm">Token Terminal (tokenterminal.com) : utile uniquement pour les positions long terme sur la valorisation fondamentale des protocoles. Non pertinent pour le timing 4H.</p>
        </Step>
        <Step num="6" title="Revue de la semaine écoulée + note de contexte journal">
          <p>7 questions de revue hebdomadaire. Une seule amélioration concrète pour la semaine suivante.</p>
        </Step>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Check matin', value: '10 min/jour' },
          { label: 'Protocole complet', value: '30 min si setup' },
          { label: 'Journal post-trade', value: '5 min max' },
          { label: 'Revue hebdo dimanche', value: '25-35 min' },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-white/10 bg-zinc-900 p-4 text-center">
            <p className="text-sm text-zinc-400 mb-1">{label}</p>
            <p className="font-bold text-white">{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Onglet : Multi-Timeframe ─────────────────────────────────────────────────

function TabMTF() {
  return (
    <div className="space-y-6">
      <SectionHeading>Analyse Multi-Timeframe (MTF) — Le Filtre le Plus Important</SectionHeading>

      <Callout type="danger" title="Erreur numéro 1 des traders débutants">
        Analyser uniquement sur le 4H sans vérifier les timeframes supérieurs. Le 4H montre un rebond sur EMA 50 — mais si le weekly est en tendance baissière sous EMA 200, ce "rebond" est en réalité un pullback dans une tendance baissière macro. Tu trades <strong className="text-white">contre le courant</strong>.
      </Callout>

      <Callout type="success" title={'Principe validé — "Higher Timeframe Bias" (HTF Bias)'}>
        <strong className="text-white">Stan Weinstein "Secrets for Profiting in Bull and Bear Markets" (1988)</strong>, <strong className="text-white">Mark Minervini "Trade Like a Stock Market Wizard" (2013)</strong>, <strong className="text-white">Mark Douglas "Trading in the Zone" (2000)</strong> : Les 3 convergent sur le même principe — le timeframe supérieur définit le biais directionnel. Le timeframe inférieur fournit l'entrée précise. Ne jamais inverser cet ordre.
      </Callout>

      <SubHeading icon={<Layers size={18} />}>La Hiérarchie des Timeframes — Top Down</SubHeading>

      <div className="space-y-3">
        {[
          {
            tf: 'Weekly (1W)',
            role: 'Tendance macro — Direction de fond',
            questions: ['Les EMA weekly sont-elles haussières (EMA 20 > 50 > 200) ?', 'Sommes-nous au-dessus ou en dessous de l\'EMA 200 weekly ?', 'Quelle est la structure de marché weekly (HH/HL = uptrend) ?'],
            decision: 'Définit si on peut trader LONG, SHORT, ou les deux. C\'est le filtre le plus important.',
            color: 'border-emerald-500/30 bg-emerald-500/10',
          },
          {
            tf: 'Daily (1D)',
            role: 'Setup identification — Zone d\'intérêt',
            questions: ['Y a-t-il un setup de retest en formation sur le daily ?', 'Les EMA daily confirment-elles la tendance weekly ?', 'Quelle est la structure de marché daily ?'],
            decision: 'Identifie la zone où le 4H doit présenter un signal. Confirme l\'alignement weekly-daily.',
            color: 'border-indigo-500/30 bg-indigo-500/5',
          },
          {
            tf: '4H (le trigger)',
            role: 'Signal d\'entrée — Exécution',
            questions: ['La bougie 4H est-elle fermée sur la zone identifiée sur le daily ?', 'Y a-t-il une bougie de confirmation (engulfing, pin bar) ?', 'Le RSI et le volume confirment-ils ?'],
            decision: 'C\'est là que tu places l\'ordre. Mais SEULEMENT si weekly et daily sont alignés.',
            color: 'border-white/10 bg-zinc-900',
          },
        ].map((row) => (
          <div key={row.tf} className={cn('rounded-xl border p-5', row.color)}>
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <p className="font-bold text-white text-base">{row.tf}</p>
                <p className="text-sm text-zinc-400">{row.role}</p>
              </div>
            </div>
            <div className="mb-3">
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-400 mb-2">Questions à se poser</p>
              <ul className="space-y-1">
                {row.questions.map((q, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-400">
                    <ChevronRight size={14} className="text-indigo-400 flex-shrink-0 mt-0.5" />
                    {q}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg bg-zinc-900/80 border border-white/10 px-3 py-2">
              <p className="text-sm font-semibold text-white">{row.decision}</p>
            </div>
          </div>
        ))}
      </div>

      <SubHeading icon={<CheckCircle2 size={18} />}>Matrice d'Alignement MTF — Avant Toute Entrée</SubHeading>

      <DataTable
        headers={['Scénario', 'Weekly', 'Daily', '4H', 'Décision']}
        rows={[
          ['Alignement parfait', <span className="text-emerald-400">✓ Haussier</span>, <span className="text-emerald-400">✓ Haussier</span>, <span className="text-emerald-400">✓ Signal long</span>, <span className="text-emerald-400 font-bold">LONG — Taille normale (1%)</span>],
          ['Alignement partiel', <span className="text-emerald-400">✓ Haussier</span>, <span className="text-amber-400">Neutre/range</span>, <span className="text-emerald-400">✓ Signal long</span>, <span className="text-amber-400 font-semibold">LONG possible — Taille 0.5%</span>],
          ['Contre-tendance', <span className="text-red-400">✗ Baissier</span>, <span className="text-amber-400">Rebond</span>, <span className="text-emerald-400">Signal long</span>, <span className="text-red-400 font-bold">PAS DE LONG — Tu trades contre le courant</span>],
          ['Convergence short', <span className="text-red-400">✓ Baissier</span>, <span className="text-red-400">✓ Baissier</span>, <span className="text-red-400">✓ Signal short</span>, <span className="text-red-400 font-bold">SHORT — Taille normale (1%)</span>],
        ]}
      />

      <Callout type="tip" title="Règle pratique — L'analogie du courant">
        Trader avec tous les timeframes alignés, c'est nager dans le sens du courant. Trader avec 1 timeframe contre les autres, c'est nager contre le courant. Techniquement possible mais épuisant et statistiquement sous-optimal. Les meilleures opportunités n'ont besoin d'aucun effort de raisonnement — elles sont évidentes sur tous les timeframes simultanément.
      </Callout>

      <SubHeading icon={<BarChart2 size={18} />}>Exemple concret — BTC Long setup</SubHeading>
      <div className="rounded-xl border border-white/10 bg-zinc-900 p-5 font-mono text-sm space-y-3">
        <div className="space-y-2">
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-wide">Weekly</p>
          <p className="text-zinc-400">BTC weekly : EMA 20 {'>'} 50 {'>'} 200 → Ruban haussier. Dernier weekly a fermé au-dessus de l'EMA 20. → <span className="text-emerald-400 font-bold">Biais LONG confirmé</span></p>
        </div>
        <div className="h-px bg-border" />
        <div className="space-y-2">
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-wide">Daily</p>
          <p className="text-zinc-400">BTC daily : Prix revient sur EMA 50 daily. RSI daily à 48. Volume profile POC daily aligné avec EMA 50. → <span className="text-indigo-400 font-bold">Zone d'intérêt identifiée</span></p>
        </div>
        <div className="h-px bg-border" />
        <div className="space-y-2">
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-wide">4H</p>
          <p className="text-zinc-400">Bougie 4H fermée sur EMA 50 avec mèche basse rejetée. RSI 4H en divergence haussière. Volume de la bougie de rejet {'>'} 150% moyenne. → <span className="text-emerald-400 font-bold">Signal d'entrée validé — Protocole complet requis</span></p>
        </div>
      </div>

      <SubHeading icon={<BarChart2 size={18} />}>Exemple concret — BTC Short setup</SubHeading>
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-5 font-mono text-sm space-y-3">
        <div className="space-y-2">
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-wide">Weekly</p>
          <p className="text-zinc-400">BTC weekly : EMA 20 {'<'} 50 {'<'} 200 → Ruban baissier. Dernier weekly a fermé en dessous de l'EMA 20. Prix sous EMA 200 weekly. → <span className="text-red-400 font-bold">Biais SHORT confirmé</span></p>
        </div>
        <div className="h-px bg-border" />
        <div className="space-y-2">
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-wide">Daily</p>
          <p className="text-zinc-400">BTC daily : Prix remonte tester l'EMA 50 daily par le dessous (l'EMA est devenue résistance). RSI daily à 52. Structure LH/LL intacte. → <span className="text-red-400 font-bold">Zone de résistance identifiée</span></p>
        </div>
        <div className="h-px bg-border" />
        <div className="space-y-2">
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-wide">4H</p>
          <p className="text-zinc-400">Bougie 4H fermée sous EMA 50 après rejet (mèche haute longue). RSI 4H en divergence baissière (prix nouveau sommet + RSI sommet plus bas). Volume du rejet {'>'} 150% moyenne. → <span className="text-red-400 font-bold">Signal d'entrée SHORT validé — Protocole complet requis</span></p>
        </div>
      </div>
    </div>
  )
}

// ─── Onglet : Market Structure ────────────────────────────────────────────────

function TabStructure() {
  return (
    <div className="space-y-6">
      <SectionHeading>Market Structure — Lire le Marché Comme les Institutionnels</SectionHeading>

      <Callout type="info" title="Pourquoi la market structure est fondamentale">
        La market structure est la représentation visuelle de l'offre et de la demande au fil du temps. Elle est utilisée par les desks propriétaires, les hedge funds et les market makers. <strong className="text-white">C'est le "langage" du marché</strong>, indépendant de tout indicateur. Comprendre la structure te permet d'identifier si une tendance est intacte ou en train de changer — avant que les indicateurs ne le montrent.
      </Callout>

      <SubHeading icon={<TrendingUp size={18} />}>Les Bases — Swing Highs & Swing Lows</SubHeading>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-3">
          <p className="font-bold text-emerald-400">Uptrend — Structure Haussière</p>
          <div className="space-y-1.5 text-sm text-zinc-400">
            <p>• <strong className="text-white">Higher Highs (HH)</strong> : Chaque sommet est plus haut que le précédent</p>
            <p>• <strong className="text-white">Higher Lows (HL)</strong> : Chaque creux est plus haut que le précédent</p>
          </div>
          <p className="text-sm font-bold text-emerald-400">→ Structure intacte = LONG uniquement</p>
          <div className="rounded-lg bg-zinc-900 border border-white/10 px-3 py-2 font-mono text-sm text-zinc-400">
            HL1 → HH1 → HL2 → HH2 → HL3 → HH3
          </div>
        </div>
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 space-y-3">
          <p className="font-bold text-red-400">Downtrend — Structure Baissière</p>
          <div className="space-y-1.5 text-sm text-zinc-400">
            <p>• <strong className="text-white">Lower Highs (LH)</strong> : Chaque sommet est plus bas que le précédent</p>
            <p>• <strong className="text-white">Lower Lows (LL)</strong> : Chaque creux est plus bas que le précédent</p>
          </div>
          <p className="text-sm font-bold text-red-400">→ Structure intacte = SHORT uniquement</p>
          <div className="rounded-lg bg-zinc-900 border border-white/10 px-3 py-2 font-mono text-sm text-zinc-400">
            LH1 → LL1 → LH2 → LL2 → LH3 → LL3
          </div>
        </div>
      </div>

      <SubHeading icon={<GitBranch size={18} />}>Break of Structure (BOS) et Change of Character (ChoCH)</SubHeading>

      <Callout type="warning" title="Distinction critique — BOS vs ChoCH">
        Un <strong className="text-white">BOS (Break of Structure)</strong> confirme la continuation de tendance. Un <strong className="text-white">ChoCH (Change of Character)</strong> est le premier signal d'un potentiel retournement. Les traders d'élite distinguent systématiquement les deux.
      </Callout>

      <DataTable
        headers={['Signal', 'Définition', 'Ce que ça signifie', 'Décision']}
        rows={[
          [
            <span className="font-bold text-emerald-400">BOS Haussier</span>,
            'Le prix casse et ferme au-dessus du dernier Higher High identifié',
            'La structure haussière est confirmée et continue. Les acheteurs dominent.',
            <span className="text-emerald-400">Renforce la conviction pour les longs. Setup en cours reste valide.</span>,
          ],
          [
            <span className="font-bold text-red-400">BOS Baissier</span>,
            'Le prix casse et ferme en dessous du dernier Lower Low',
            'La structure baissière continue. Les vendeurs dominent.',
            <span className="text-red-400">Confirme les shorts. Pas de long contre-tendance.</span>,
          ],
          [
            <span className="font-bold text-amber-400">ChoCH Haussier</span>,
            'Dans un downtrend : le prix casse et ferme au-dessus du LH précédent pour la PREMIÈRE fois',
            'Premier signal de retournement potentiel. Pas encore confirmé.',
            <span className="text-amber-400">Surveiller. Attendre confirmation (Higher Low formé + 2ème BOS haussier).</span>,
          ],
          [
            <span className="font-bold text-amber-400">ChoCH Baissier</span>,
            'Dans un uptrend : le prix casse en dessous du HL précédent pour la PREMIÈRE fois',
            'Premier signal d\'affaiblissement haussier. Potentiel retournement.',
            <span className="text-amber-400">Réduire les longs. SL au breakeven sur positions ouvertes. Surveiller confirmation.</span>,
          ],
        ]}
      />

      <Callout type="danger" title="Règle des 3 règles de lecture de structure">
        <div className="space-y-2">
          <p><strong className="text-white">Règle 1 :</strong> Fermeture de bougie obligatoire. Un simple wick qui dépasse un niveau ne constitue PAS un BOS valide.</p>
          <p><strong className="text-white">Règle 2 :</strong> Sur le timeframe où tu trades (4H) ET sur le timeframe supérieur (Daily). Un BOS haussier sur 4H mais structure baissière sur Daily = signal faible.</p>
          <p><strong className="text-white">Règle 3 :</strong> Un ChoCH seul ne suffit JAMAIS à entrer. Attends toujours une structure confirmée (HH/HL formés) pour les longs ou (LH/LL formés) pour les shorts.</p>
        </div>
      </Callout>

      <SubHeading icon={<Target size={18} />}>Points de Liquidité — Où les Stops se Trouvent</SubHeading>

      <Callout type="tip" title="Concept utilisé par les prop traders et market makers">
        Les <strong className="text-white">stop losses de la majorité</strong> se concentrent sous les swing lows évidents (uptrend) et au-dessus des swing highs évidents (downtrend). Les institutionnels cherchent ces zones de liquidité pour entrer à meilleur prix. On appelle ça une <strong>"stop hunt"</strong> ou <strong>"liquidity grab"</strong>.
      </Callout>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-zinc-900 p-4 space-y-2">
          <p className="font-bold text-white">Stop Hunt Haussier (Buy Side)</p>
          <p className="text-sm text-zinc-400">Le prix descend brièvement sous un swing low évident (déclenchant tous les SL), puis remonte immédiatement avec force au-dessus.</p>
          <p className="text-sm font-bold text-emerald-400">Signal : si le rejet est rapide et la bougie ferme haut → signal d'achat contrarian puissant. Combine avec EMA + RSI.</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-zinc-900 p-4 space-y-2">
          <p className="font-bold text-white">Stop Hunt Baissier (Sell Side)</p>
          <p className="text-sm text-zinc-400">Le prix monte brièvement au-dessus d'un swing high évident, puis retombe immédiatement avec force.</p>
          <p className="text-sm font-bold text-red-400">Signal : si le rejet est rapide → signal de vente contrarian. Combine avec résistance + RSI {'>'} 65.</p>
        </div>
      </div>

      <SubHeading icon={<Hash size={18} />}>Zones de Support et Résistance Clés</SubHeading>

      <DataTable
        headers={['Type de niveau', 'Comment l\'identifier', 'Force relative', 'Utilisation dans le protocole']}
        rows={[
          ['Swing Highs/Lows historiques', 'Sommets et creux majeurs sur weekly et daily', <span className="text-emerald-400 font-bold">Très forte</span>, 'Support/Résistance principale. TP ou SL selon direction.'],
          ['Point of Control (FRVP)', 'Zone de plus grand volume échangé sur le range', <span className="text-emerald-400 font-bold">Forte</span>, 'Entrée SEULEMENT si aligné avec EMA. Seul il est insuffisant.'],
          ['EMA 200 daily', 'Moyenne mobile exponentielle 200 périodes daily', <span className="text-emerald-400 font-bold">Très forte</span>, 'Niveau institutionnel global. Frontière bull/bear macro.'],
          ['EMA 50 daily', 'Moyenne mobile exponentielle 50 périodes daily', <span className="text-emerald-400">Forte</span>, 'Retest setup principal. Fréquent et fiable en uptrend.'],
          ['Zones de liquidité (equal highs/lows)', 'Doubles sommets/creux → stops concentrés', <span className="text-amber-400">Modérée</span>, 'Anticiper la stop hunt. Ne pas mettre SL à ces niveaux évidents.'],
          ['Fibonacci 0.618 (golden ratio)', 'Retracement de Fibonacci du dernier swing', <span className="text-amber-400">Modérée</span>, 'Confluence supplémentaire quand aligné avec EMA. Renforce la zone.'],
        ]}
      />
    </div>
  )
}

// ─── Onglet : Indicateurs Techniques ─────────────────────────────────────────

function TabTechnique() {
  return (
    <div className="space-y-6">
      <SectionHeading>Indicateurs Techniques — EMA, RSI, Volume Profile, Fibonacci, ATR</SectionHeading>

      <Callout type="success" title="Fondation académique — Trend Following">
        "A Century of Evidence on Trend Following" (Hurst, Ooi, Pedersen — Journal of Portfolio Management, 2017) : le trend following génère des rendements positifs sur 100 ans dans toutes les classes d'actifs. SSRN (2024) : CAGR 15.19% avec alpha annualisé 6.18% sur 1991-2024. Ces résultats justifient la stratégie basée sur EMA + confirmation.
      </Callout>

      {/* EMA */}
      <SubHeading icon={<TrendingUp size={18} />}>EMA Ribbon — 20 / 50 / 100 / 200</SubHeading>

      <Callout type="info" title="Pourquoi l'EMA plutôt que la SMA">
        L'EMA (Exponential Moving Average) donne un poids exponentiel plus important aux prix récents. Elle réagit plus rapidement aux changements de tendance que la SMA. <strong className="text-white">Les algorithmes institutionnels et les desks prop trading utilisent l'EMA 50/200 comme niveaux de référence</strong> — ce qui crée une prophétie auto-réalisatrice partielle.
      </Callout>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {[
          { title: 'Bull Market Parfait', desc: 'EMA 20 > 50 > 100 > 200 — toutes orientées à la hausse. Prix au-dessus de toutes les EMA.', rule: 'Seuls les LONGS. Structure idéale.', color: 'border-emerald-500/30 bg-emerald-500/10', tcolor: 'text-emerald-400' },
          { title: 'Bear Market Confirmé', desc: 'EMA 20 < 50 < 100 < 200 — toutes orientées à la baisse. Prix sous toutes les EMA.', rule: 'Seuls les SHORTS ou cash.', color: 'border-red-500/30 bg-red-500/10', tcolor: 'text-red-400' },
          { title: 'Retest (Setup principal)', desc: 'Prix revient sur EMA 50 ou 200 par le dessus en bull market. Bougie 4H fermée. Volume > 120%.', rule: 'Zone d\'entrée Long idéale — C\'est là que tu attends.', color: 'border-indigo-500/30 bg-indigo-500/5', tcolor: 'text-indigo-400' },
          { title: 'No Man\'s Land', desc: 'Prix entre deux EMA sans support/résistance clair. EMA entremêlées sans ordre.', rule: 'PAS DE TRADE. Attends la réorganisation.', color: 'border-amber-500/30 bg-amber-500/10', tcolor: 'text-amber-400' },
        ].map((r) => (
          <div key={r.title} className={cn('rounded-xl border p-4 space-y-2', r.color)}>
            <p className={cn('font-bold text-base', r.tcolor)}>{r.title}</p>
            <p className="text-sm text-zinc-400">{r.desc}</p>
            <p className={cn('text-sm font-bold', r.tcolor)}>{r.rule}</p>
          </div>
        ))}
      </div>

      <DataTable
        headers={['EMA', 'Rôle', 'Timeframe pertinent', 'Priorité']}
        rows={[
          [<span className="font-mono font-bold text-red-400">EMA 200</span>, 'Frontière macro bull/bear. Niveau institutionnel mondial. Plus grand volume de référence.', 'Daily (obligatoire) + 4H', <span className="text-emerald-400 font-bold">#1 — Setup EMA 200 retest = le plus fort</span>],
          [<span className="font-mono font-bold text-emerald-400">EMA 50</span>, 'Tendance intermédiaire. Zone de retest principale en bull market sain.', '4H + Daily', <span className="text-emerald-400">#2 — Setup fréquent et fiable</span>],
          [<span className="font-mono font-bold text-amber-400">EMA 100</span>, 'Support intermédiaire entre 50 et 200. Valide si 50 cassée proprement.', '4H', '#3 — Secondaire seulement'],
          [<span className="font-mono font-bold text-indigo-400">EMA 20</span>, 'Momentum court terme. Premier signal de pression sur l\'EMA 50.', '4H', 'Momentum uniquement — pas d\'entrée directe'],
        ]}
      />

      <Callout type="danger" title="Règle de confirmation de bougie — La plus violée">
        N'entre <strong>JAMAIS</strong> pendant qu'une bougie 4H est encore ouverte. Attends la clôture (00h00 / 04h00 / 08h00 / 12h00 / 16h00 / 20h00 UTC). Une bougie ouverte peut complètement s'inverser dans les 30 dernières minutes. C'est la source numéro 1 des fausses entrées.
      </Callout>

      {/* Fibonacci */}
      <SubHeading icon={<Hash size={18} />}>Retracements de Fibonacci — La Confluence Géométrique</SubHeading>

      <Callout type="info" title="Fondation — Robert Fischer (1993) + Ralph Elliott (1930s)">
        Le ratio de Fibonacci (0.618 = "Golden Ratio") est présent dans la nature, l'architecture et les marchés financiers. Dans les marchés, il fonctionne parce qu'assez de traders et d'algorithmes l'utilisent comme référence — créant une zone de demande réelle autour du 0.618.
      </Callout>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 mb-3">
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-zinc-400">
          <p className="font-bold text-emerald-400 mb-1">LONG — Comment tracer (uptrend)</p>
          <p>TradingView → "Fibonacci Retracement" → <strong className="text-white">du dernier swing low au dernier swing high</strong>. Les niveaux 0.618/0.705 sous le swing high = zones d'entrée long au retest.</p>
        </div>
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-zinc-400">
          <p className="font-bold text-red-400 mb-1">SHORT — Comment tracer (downtrend)</p>
          <p>TradingView → "Fibonacci Retracement" → <strong className="text-white">du dernier swing high au dernier swing low</strong>. Les niveaux 0.618/0.705 au-dessus du swing low = zones de résistance et d'entrée short au retest.</p>
        </div>
      </div>

      <DataTable
        headers={['Niveau Fibonacci', 'Valeur', 'Signification', 'Force']}
        rows={[
          ['0.382', '38.2%', 'Retracement superficiel. Uptrend fort.', 'Faible — seulement si EMA confirme'],
          ['0.500', '50.0%', 'Niveau psychologique. Mi-chemin du swing.', 'Modérée'],
          [<span className="font-bold text-emerald-400">0.618 (Golden Ratio)</span>, '61.8%', '"Golden Pocket" — niveau institutionnel de référence. Zone d\'accumulation documentée.', <span className="text-emerald-400 font-bold">Forte — combiné EMA = setup élite</span>],
          [<span className="font-bold text-indigo-400">0.705</span>, '70.5%', 'Extension du Golden Pocket. Alternative si 0.618 cassé.', <span className="text-indigo-400">Forte</span>],
          ['0.786', '78.6%', 'Retracement profond. Dernier support avant invalidation.', 'Modérée — si cassé → structure compromise'],
        ]}
      />

      <Callout type="success" title="Confluence Fibonacci + EMA = Setup Élite">
        Quand le niveau Fibonacci 0.618 ou 0.705 coïncide avec l'EMA 50 ou EMA 200 sur le même prix → double confluence géométrique + dynamique. <strong className="text-white">C'est la zone d'entrée la plus précise du protocole.</strong> Le R/R est mécaniquement meilleur car le SL peut être serré sous le niveau fib.
      </Callout>

      {/* RSI */}
      <SubHeading icon={<BarChart2 size={18} />}>RSI 14 Périodes — Divergences Régulières et Cachées</SubHeading>

      <Callout type="success" title="Backtest BTC 4H 2020-2024 (Altrady Research)">
        RSI divergences + EMA confluence → <strong className="text-white">68% de précision sur 4H</strong>. Sans divergence RSI, ce chiffre tombe à 54%. La divergence RSI est le signal le plus prédictif de la stratégie.
      </Callout>

      <div className="grid grid-cols-1 gap-4">
        <div className="rounded-xl border border-white/10 bg-zinc-900 p-5">
          <p className="font-bold text-white text-base mb-4">Les 4 Types de Divergences RSI</p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {[
              {
                name: 'Divergence Régulière Haussière',
                color: 'border-emerald-500/30 bg-emerald-500/10',
                tc: 'text-emerald-400',
                usage: 'Signal de retournement LONG',
                price: 'Prix : nouveau creux plus bas',
                rsi: 'RSI : creux plus haut',
                meaning: 'Le momentum baissier s\'affaiblit. Les vendeurs épuisés. Retournement probable.',
              },
              {
                name: 'Divergence Régulière Baissière',
                color: 'border-red-500/30 bg-red-500/10',
                tc: 'text-red-400',
                usage: 'Signal de retournement SHORT',
                price: 'Prix : nouveau sommet plus haut',
                rsi: 'RSI : sommet plus bas',
                meaning: 'Le momentum haussier s\'affaiblit. Acheteurs épuisés. Correction probable.',
              },
              {
                name: 'Divergence Cachée Haussière',
                color: 'border-indigo-500/30 bg-indigo-500/5',
                tc: 'text-indigo-400',
                usage: 'Signal de CONTINUATION Long (pullback)',
                price: 'Prix : creux plus haut (HL formé)',
                rsi: 'RSI : creux plus bas',
                meaning: 'Le prix forme un Higher Low (uptrend intact) mais RSI descend plus bas. Continuation haussière probable.',
              },
              {
                name: 'Divergence Cachée Baissière',
                color: 'border-amber-500/30 bg-amber-500/10',
                tc: 'text-amber-400',
                usage: 'Signal de CONTINUATION Short',
                price: 'Prix : sommet plus bas (LH formé)',
                rsi: 'RSI : sommet plus haut',
                meaning: 'Continuation baissière probable. Évite les longs counter-trend.',
              },
            ].map((d) => (
              <div key={d.name} className={cn('rounded-xl border p-4 space-y-2', d.color)}>
                <p className={cn('font-bold', d.tc)}>{d.name}</p>
                <p className={cn('text-sm font-semibold', d.tc)}>{d.usage}</p>
                <div className="space-y-1 text-sm text-zinc-400">
                  <p>• {d.price}</p>
                  <p>• {d.rsi}</p>
                </div>
                <p className="text-sm text-zinc-400 italic">{d.meaning}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-emerald-500/20 bg-zinc-900 px-4 py-3">
          <p className="text-sm text-zinc-400">Règle entrée LONG — RSI au moment d'entrer</p>
          <p className="font-bold text-emerald-400 text-base">RSI &lt; 60 obligatoire</p>
          <p className="text-sm text-zinc-400">RSI {'>'}  65 au moment d'entrer = acheter un actif en surachat = R/R dégradé</p>
        </div>
        <div className="rounded-xl border border-red-500/20 bg-zinc-900 px-4 py-3">
          <p className="text-sm text-zinc-400">Règle entrée SHORT — RSI au moment d'entrer</p>
          <p className="font-bold text-red-400 text-base">RSI &gt; 40 obligatoire</p>
          <p className="text-sm text-zinc-400">RSI {'<'} 35 au moment d'entrer short = vendre un actif en survente = R/R dégradé</p>
        </div>
      </div>

      {/* Volume Profile */}
      <SubHeading icon={<BarChart size={18} />}>Volume Profile FRVP + OBV</SubHeading>

      <Callout type="info" title="Market Profile Theory — Peter Steidlmayer (CBOT, 1985)">
        La théorie originale du Volume Profile a été développée au Chicago Board of Trade par Peter Steidlmayer. Le principe : le marché cherche la "valeur juste" à travers les échanges. Les zones de fort volume = consensus de valeur. Les zones de faible volume = déséquilibre que le prix traverse rapidement.
      </Callout>

      <Callout type="tip" title="Règle FRVP non-discrétionnaire">
        Ton FRVP couvre <strong className="text-white">TOUJOURS</strong> depuis le dernier ATH ou ATL de BTC jusqu'à aujourd'hui. Cette règle fixe rend le POC identique peu importe tes biais du moment — élimine le confirmation bias sur le range.
      </Callout>

      <DataTable
        headers={['Zone FRVP', 'Description', 'Utilisation dans le protocole']}
        rows={[
          [<span className="font-mono font-bold text-white">POC</span>, 'Point of Control — Prix avec le plus grand volume échangé du range', 'Entrée SEULEMENT si aligné avec EMA (double confluence). Seul il est insuffisant.'],
          [<span className="font-mono font-bold text-emerald-400">VAH</span>, 'Value Area High — borne haute de la zone de 70% du volume', 'Résistance principale → 1er Take Profit pour les longs'],
          [<span className="font-mono font-bold text-amber-400">VAL</span>, 'Value Area Low — borne basse de la zone de 70% du volume', 'Support → SL de référence pour les shorts depuis POC'],
          ['LVN (Low Volume Node)', 'Zones avec peu de volume échangé', 'Le prix les traverse rapidement → peu de résistance entre entrée et TP'],
          ['HVN (High Volume Node)', 'Pics de volume multiples', 'Zones de magnétisme → le prix y revient fréquemment'],
        ]}
      />

      <p className="font-bold text-white mt-4">OBV — On-Balance Volume (accumulation cachée)</p>
      <DataTable
        headers={['Signal OBV', 'Interprétation', 'Décision']}
        rows={[
          ['OBV monte + Prix monte', 'Hausse confirmée. Pression acheteuse saine.', <span className="text-emerald-400">Conforme — trade long valide</span>],
          [<span className="font-semibold text-emerald-400">OBV monte + Prix descend/stagne</span>, 'Accumulation cachée. Des institutions achètent discrètement pendant que le prix est bas.', <span className="text-emerald-400 font-bold">Signal fort de retournement long imminent</span>],
          [<span className="font-semibold text-red-400">OBV descend + Prix monte</span>, 'Distribution cachée. La hausse n\'est pas soutenue par le volume réel.', <span className="text-red-400 font-bold">Méfie-toi. Taille réduite ou pas de long.</span>],
          ['OBV descend + Prix descend', 'Baisse confirmée. Tendance baissière saine.', <span className="text-red-400">Pas de long prématuré</span>],
        ]}
      />

      <SubHeading icon={<BarChart2 size={18} />}>CVD — Cumulative Volume Delta (l'empreinte des agresseurs)</SubHeading>

      <Callout type="success" title="Quantitative Brokers Research (2022) + Standard des desks prop trading">
        Le CVD est fondamentalement différent de l'OBV. <strong className="text-white">L'OBV compte le volume de chaque bougie entière. Le CVD calcule pour chaque transaction si elle s'est exécutée au prix ask (acheteur agressif) ou au bid (vendeur agressif)</strong>, puis cumule. Résultat : tu vois qui initie réellement les mouvements — les institutionnels ou le retail paniqué.
      </Callout>

      <Callout type="tip" title="TradingView → indicateur gratuit 'Cumulative Volume Delta'">
        Paramètres : Close type = Close. Appliqué sur le graphique 4H. Ne remplace pas l'OBV — les deux sont complémentaires. Le CVD est plus précis pour confirmer la force d'un breakout.
      </Callout>

      <DataTable
        headers={['CVD', 'Prix', 'Signal', 'Interprétation', 'Décision']}
        rows={[
          [
            <span className="text-emerald-400 font-bold">↑ Monte</span>,
            <span className="text-emerald-400 font-bold">↑ Monte</span>,
            <span className="text-emerald-400 font-bold">Haussier sain</span>,
            'Les acheteurs agressifs initient la hausse. Le mouvement est organique, pas un short squeeze.',
            <span className="text-emerald-400">Long confirmé. Setup de haute conviction.</span>,
          ],
          [
            <span className="text-red-400 font-bold">↓ Descend</span>,
            <span className="text-emerald-400 font-bold">↑ Monte</span>,
            <span className="text-amber-400 font-bold">Divergence — méfiance</span>,
            'La hausse est portée par des shorts qui couvrent, pas par de vrais acheteurs. Mouvement fragile.',
            <span className="text-amber-400">Long à éviter ou TP réduit. Risque de retournement élevé.</span>,
          ],
          [
            <span className="text-emerald-400 font-bold">↑ Monte</span>,
            <span className="text-red-400 font-bold">↓ Descend</span>,
            <span className="text-emerald-400 font-bold">Absorption — accumulation</span>,
            'Des acheteurs agressifs absorbent la vente. Les institutionnels accumulent pendant que le retail vend.',
            <span className="text-emerald-400">{'Signal de retournement long fort. Combine avec STH-SOPR < 1.'}</span>,
          ],
          [
            <span className="text-red-400 font-bold">↓ Descend</span>,
            <span className="text-red-400 font-bold">↓ Descend</span>,
            <span className="text-red-400 font-bold">Baissier sain</span>,
            'Les vendeurs agressifs initient la baisse. Le mouvement est organique.',
            <span className="text-red-400">Short confirmé. Pas de long contre-tendance.</span>,
          ],
        ]}
      />

      {/* ATR */}
      <SubHeading icon={<Scale size={18} />}>ATR — Average True Range (volatilité adaptative)</SubHeading>

      <Callout type="success" title="J. Welles Wilder Jr. — 'New Concepts in Technical Trading Systems' (1978)">
        L'ATR mesure la volatilité réelle moyenne sur N périodes, indépendamment de la direction. <strong className="text-white">Un SL basé sur l'ATR s'adapte automatiquement à la volatilité actuelle</strong> du marché — contrairement à un % fixe qui peut être trop serré en période volatile ou trop large en période calme.
      </Callout>

      <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-5 font-mono text-sm space-y-3">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-zinc-400 font-bold">Configuration TradingView</p>
          <p className="text-white">ATR(14) sur le graphique 4H — période standard de 14 bougies</p>
        </div>
        <div className="h-px bg-border" />
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-zinc-400 font-bold">Formule Stop Loss basé ATR</p>
          <p className="text-white">SL Long = Prix d'entrée − (ATR × <span className="text-emerald-400">1.5</span>)</p>
          <p className="text-white">SL Short = Prix d'entrée + (ATR × <span className="text-red-400">1.5</span>)</p>
        </div>
        <div className="h-px bg-border" />
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-zinc-400 font-bold">Exemple — BTC 4H, ATR = 800$</p>
          <p className="text-zinc-400">SL Long = Prix entrée − (800 × 1.5) = Prix entrée − 1 200$</p>
          <p className="text-zinc-500 text-xs mt-1">Si prix d'entrée = 65 000$ → SL = 63 800$ (distance = 1.85%)</p>
        </div>
      </div>

      <Callout type="tip" title="ATR vs % fixe — Pourquoi l'ATR est supérieur">
        Un SL à -1.5% en période de volatilité normale BTC (ATR = 1%) sera touché aléatoirement. Un SL à -1.5% en période de forte volatilité (ATR = 3%) est trop serré. L'ATR × 1.5 s'adapte automatiquement. C'est la méthode utilisée par les desks prop trading professionnels (source : Schwager "Market Wizards Series").
      </Callout>
    </div>
  )
}

// ─── Onglet : On-Chain ────────────────────────────────────────────────────────

function TabOnChain() {
  return (
    <div className="space-y-6">
      <SectionHeading>Étapes 2 & 3 — CryptoQuant + Glassnode</SectionHeading>

      <Callout type="info" title="Avantage informationnel unique au crypto">
        Contrairement aux actions, la blockchain est publique. Tu peux voir ce que font les baleines, les exchanges et les institutions en temps réel. C'est un avantage informationnel qui n'existe dans aucun autre marché. <strong className="text-white">Les indicateurs on-chain sont des données primaires</strong> — pas des dérivés de prix comme les indicateurs techniques.
      </Callout>

      <SubHeading icon={<Activity size={18} />}>CryptoQuant — Checklist Pré-Trade (minimum 4/7)</SubHeading>

      <Callout type="warning" title="Seuil de validation">
        <strong className="text-white">Minimum 4 critères sur 7 validés</strong> pour entrer. 3 ou moins → pas de trade ou taille réduite à 50%. Les 7 indicateurs ne seront pas toujours tous alignés — c'est normal. On cherche une majorité claire. <strong className="text-white">Le Funding Rate et le Whale Ratio sont obligatoires</strong> dans les 4 — ce sont les deux signaux les plus prédictifs à court terme.
      </Callout>

      <div className="space-y-4">
        {[
          {
            name: '1. Coinbase Premium Gap',
            how: 'Différence entre prix BTC sur Coinbase Pro (US institutions) vs Binance (global retail)',
            ok: 'Positif ou remontant — les institutionnels US achètent avec prime sur Coinbase Pro',
            bad: 'Très négatif (< -0.1%) — les institutionnels US vendent activement',
            why: 'Coinbase Pro est l\'exchange de référence des gestionnaires de fonds américains (BlackRock, Fidelity). Quand ils achètent avec prime, c\'est un signal institutionnel de qualité supérieure à tout indicateur retail.',
          },
          {
            name: '2. Exchange Whale Ratio',
            how: 'Ratio des 10 plus gros dépôts sur le total des dépôts sur les exchanges',
            ok: '< 0.85 — les baleines ne déposent pas massivement pour vendre',
            bad: '> 0.90 — concentration élevée de gros dépôts = pression de vente imminente',
            why: 'Un Whale Ratio élevé signifie que les "mains intelligentes" (institutions, gros traders) déposent en masse sur les exchanges pour vendre. Historiquement corrélé aux corrections de prix sur BTC.',
          },
          {
            name: '3. Open Interest (OI) Futures',
            how: 'Nombre total de contrats futures ouverts sur l\'ensemble des exchanges',
            ok: 'Stable ou hausse progressive avec le prix — tendance saine',
            bad: 'OI très élevé + prix bloqué ou OI monte sans prix monter = sur-leverage instable',
            why: 'Un OI disproportionné par rapport au spot volume = marché sur-leveragé = un mouvement adverse peut déclencher des liquidations en cascade. L\'OI seul ne dit rien sans le contexte du prix.',
          },
          {
            name: '4. Estimated Leverage Ratio',
            how: 'Ratio OI / Réserves exchange BTC — mesure le levier systémique global',
            ok: '< 0.25 — levier global modéré = mouvements plus organiques et moins volatils',
            bad: '> 0.30 — marché sur-leveragé = risque élevé de liquidation en cascade sur une baisse',
            why: 'C\'est le "thermomètre du levier systémique". Plus il est élevé, plus le marché est fragile aux sell-offs soudains. Les corrections de type "flash crash" surviennent systématiquement quand ce ratio est élevé.',
          },
          {
            name: '5. Exchange Reserve BTC',
            how: 'Total de BTC détenu sur l\'ensemble des exchanges — proxy de l\'offre potentielle disponible',
            ok: 'En baisse — retraits vers cold wallets = hodlers retirent = moins d\'offre disponible',
            bad: 'En hausse soudaine (+15 000 BTC en 24h) = dépôts entrants = préparatifs de vente',
            why: 'La quantité de BTC sur les exchanges = l\'offre "prête à vendre". Moins il y en a, moins le prix peut être impacté par de la vente. La tendance long terme baissière des réserves exchanges est fondamentalement haussière.',
          },
          {
            name: '6. Stablecoin Supply Ratio (SSR)',
            how: 'Market cap BTC / Market cap total stablecoins — mesure le "carburant" disponible',
            ok: 'SSR bas < 8 — beaucoup de stablecoins disponibles = fort pouvoir d\'achat en attente',
            bad: 'SSR élevé > 15 — peu de stablecoins = carburant haussier épuisé = difficile de monter davantage',
            why: 'Si les stablecoins représentent une grosse partie de la capitalisation, il y a beaucoup de liquidités "prêtes à s\'investir" en crypto. Un SSR bas = conditions favorables pour une hausse soutenue.',
          },
          {
            name: '7. Funding Rate (Perpetual Futures)',
            how: 'Taux payé toutes les 8h entre longs et shorts sur les marchés perpetual (Binance, Bybit, Hyperliquid). Taux positif = les longs paient les shorts. Négatif = les shorts paient les longs.',
            ok: 'Entre -0.01% et +0.03% : coût de portage neutre à modéré. Pas de déséquilibre extrême dans les deux sens. Long viable. Pour short : > 0.03% = les longs sur-représentés paient une prime élevée = setup short favorable.',
            bad: '> 0.05%/8h : marché sur-leveragé long. 73% de probabilité de correction dans les 72h (CryptoQuant Research 2024). Pour short : < -0.02% = les shorts sont majoritaires et paient = squeeze haussier possible = évite le short.',
            why: 'Le Funding Rate est le seul indicateur qui mesure en temps réel le déséquilibre entre longs et shorts. Un taux élevé force mécaniquement les longs à fermer leurs positions (le coût érode les profits), créant une pression vendeuse systémique. C\'est un signal primaire, pas dérivé du prix.',
          },
        ].map((item) => (
          <div key={item.name} className="rounded-xl border border-white/10 bg-zinc-900 p-5">
            <p className="font-bold text-white text-base mb-1">{item.name}</p>
            <p className="text-sm text-zinc-400 mb-3 italic">{item.how}</p>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2.5">
                <p className="text-xs font-bold text-emerald-400 mb-1 uppercase tracking-wide">Signal Long OK</p>
                <p className="text-sm text-zinc-400">{item.ok}</p>
              </div>
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2.5">
                <p className="text-xs font-bold text-red-400 mb-1 uppercase tracking-wide">Signal de Prudence</p>
                <p className="text-sm text-zinc-400">{item.bad}</p>
              </div>
              <div className="rounded-lg bg-zinc-900/80 border border-white/10 px-3 py-2.5">
                <p className="text-xs font-bold text-indigo-400 mb-1 uppercase tracking-wide">Pourquoi ça compte</p>
                <p className="text-sm text-zinc-400">{item.why}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <SubHeading icon={<BarChart2 size={18} />}>Matrice OI + Direction du Prix — Lecture Obligatoire</SubHeading>

      <Callout type="info" title="Source — Glassnode Insights + CryptoQuant Institutional Desk (2023-2024)">
        Le niveau d'OI ne suffit pas. C'est la <strong className="text-white">combinaison OI + direction du prix</strong> qui révèle qui entre ou sort du marché. Cette matrice est standard dans tous les desks crypto professionnels.
      </Callout>

      <DataTable
        headers={['Prix', 'OI', 'Signal', 'Interprétation', 'Décision']}
        rows={[
          [
            <span className="text-emerald-400 font-bold">↑ Monte</span>,
            <span className="text-emerald-400 font-bold">↑ Monte</span>,
            <span className="text-emerald-400 font-bold">Haussier fort</span>,
            'Nouveaux longs entrent. Les acheteurs ouvrent des positions — tendance haussière soutenue et saine.',
            <span className="text-emerald-400">Long valide — continuation probable. R/R favorable.</span>,
          ],
          [
            <span className="text-emerald-400 font-bold">↑ Monte</span>,
            <span className="text-red-400 font-bold">↓ Descend</span>,
            <span className="text-amber-400 font-bold">Rally suspect</span>,
            'Shorts couvrent leurs pertes (short squeeze). Hausse mécanique, pas d\'acheteurs frais.',
            <span className="text-amber-400">Long possible mais fragile. Évite les entrées tardives. TP réduit.</span>,
          ],
          [
            <span className="text-red-400 font-bold">↓ Descend</span>,
            <span className="text-emerald-400 font-bold">↑ Monte</span>,
            <span className="text-red-400 font-bold">Baissier fort</span>,
            'Nouveaux shorts entrent. Les vendeurs ouvrent des positions — tendance baissière soutenue et saine.',
            <span className="text-red-400">Short valide — continuation probable. Pas de long counter-trend.</span>,
          ],
          [
            <span className="text-red-400 font-bold">↓ Descend</span>,
            <span className="text-red-400 font-bold">↓ Descend</span>,
            <span className="text-amber-400 font-bold">Capitulation</span>,
            'Longs ferment leurs positions (stop outs). Vente mécanique, pas de nouveaux vendeurs.',
            <span className="text-emerald-400">Zone d\'entrée long potentielle. Combine avec STH-SOPR et structure 4H.</span>,
          ],
        ]}
      />

      <SubHeading icon={<BarChart2 size={18} />}>Glassnode — Macro On-Chain (une fois/semaine)</SubHeading>

      <Callout type="warning" title="Fréquence de consultation obligatoire — Hebdomadaire uniquement">
        Ces indicateurs se mesurent sur des semaines et des mois. Les checker quotidiennement est contre-productif et source de sur-réaction aux bruit court terme. <strong className="text-white">Une fois le dimanche, intégrés dans la revue hebdomadaire.</strong>
      </Callout>

      <div className="space-y-4">
        {[
          {
            name: 'MVRV Z-Score',
            def: 'Market Value (prix spot) vs Realised Value (prix moyen d\'acquisition de chaque BTC) en Z-Score.',
            long: 'Zone rouge (score < 0) : le prix spot est inférieur à la valeur réalisée → acheteurs récents en perte → zone d\'accumulation documentée sur tous les cycles depuis 2013.',
            caution: 'Score > 7 : surévaluation extrême. Correspond aux tops de cycles (Déc 2017 : 9.7, Nov 2021 : 8.9). Réduis fortement les longs.',
            source: 'Awe & Wonder (2018) — standard dans les fonds crypto',
          },
          {
            name: 'NUPL (Net Unrealized Profit/Loss)',
            def: 'Mesure le ratio de profits/pertes non-réalisés de l\'ensemble des détenteurs BTC. Proxy du sentiment macro.',
            long: '0–0.25 = "Espoir/Peur" : zone historique d\'accumulation. 0.25–0.50 = "Optimisme sain" : uptrend sain. Ces deux zones = conditions favorables pour les longs.',
            caution: '> 0.75 = "Euphorie" : tops de cycles. > 0.90 = "Avidité extrême" : réduction drastique des longs recommandée. Prise de profits partiels.',
            source: 'Glassnode Research (2019)',
          },
          {
            name: 'STH-MVRV (Short-Term Holder)',
            def: 'MVRV calculé uniquement pour les BTC achetés dans les 155 derniers jours (mains récentes).',
            long: '< 1.0 : les acheteurs récents sont en perte non-réalisée → ils n\'ont pas intérêt à vendre → zone de soutien de prix → accumulation potentielle.',
            caution: '> 1.3 : acheteurs récents en profit significatif → forte tentation de vendre → pression sur les prix à surveiller.',
            source: 'Glassnode Research',
          },
          {
            name: 'STH-SOPR (Short-Term Holder SOPR)',
            def: 'Ratio entre le prix vendu et le prix d\'acquisition pour les BTC déplacés des mains récentes (< 155j).',
            long: '< 1.0 : capitulation des mains faibles (vendent à perte). Signal d\'achat contrarian le plus fort. Documenté sur tous les cycles depuis 2013 par Glassnode Machine Learning (2024).',
            caution: '> 1.05 en tendance décroissante : distribution en cours. Les mains récentes prennent leurs profits activement.',
            source: 'Glassnode Research (2021) + ML Study (2024)',
          },
          {
            name: 'Accumulation Trend Score',
            def: 'Score 0-1 mesurant si les grandes entités (baleines, fonds) accumulent ou distribuent activement.',
            long: '> 0.7 : accumulation forte et large — institutions et baleines achètent activement. Signal de soutien haussier à moyen terme.',
            caution: '< 0.3 : distribution active confirmée. Ne pas aller long tant que ce score est bas. Attendre le passage au-dessus de 0.5.',
            source: 'Glassnode',
          },
          {
            name: 'HODL Waves',
            def: 'Distribution des BTC par ancienneté de détention — montre qui "bouge" ses coins.',
            long: 'Les bandes de détenteurs 1 an+ augmentent → les mains fortes accumulent et ne revendent pas → offre circulante réduite → bull market potentiel.',
            caution: 'Bandes < 1 mois en forte hausse → spéculation court terme dominante → marché fragile → les corrections sont amplifiées.',
            source: 'Glassnode',
          },
        ].map((item) => (
          <div key={item.name} className="rounded-xl border border-white/10 bg-zinc-900 p-5">
            <div className="flex items-start justify-between gap-3 mb-1">
              <p className="font-bold text-white text-base">{item.name}</p>
              <span className="text-xs text-zinc-400 flex-shrink-0">{item.source}</span>
            </div>
            <p className="text-sm text-zinc-400 italic mb-3">{item.def}</p>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2.5">
                <p className="text-xs font-bold text-emerald-400 mb-1.5 uppercase tracking-wide">Signal Long Fort</p>
                <p className="text-sm text-zinc-400 leading-relaxed">{item.long}</p>
              </div>
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2.5">
                <p className="text-xs font-bold text-red-400 mb-1.5 uppercase tracking-wide">Signal de Prudence</p>
                <p className="text-sm text-zinc-400 leading-relaxed">{item.caution}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Onglet : Arkham ──────────────────────────────────────────────────────────

function TabArkham() {
  return (
    <div className="space-y-6">
      <SectionHeading>Étape 4 — Arkham Intelligence (Flux Institutionnels)</SectionHeading>

      <Callout type="info" title="Qu'est-ce qu'Arkham Intelligence ?">
        Arkham identifie {'>'} 800M d'adresses liées à {'>'} 450 000 entités (2025). Il transforme des adresses anonymes en information actionnable sur qui fait quoi. <strong className="text-white">Règle absolue : Arkham ne déclenche jamais un trade seul.</strong> Il filtre ou invalide un setup technique existant.
      </Callout>

      <SubHeading icon={<Eye size={18} />}>Les 4 Types d'Alertes</SubHeading>

      <div className="space-y-4">
        {[
          {
            type: 'Gouvernements ≥ $50M vers exchange',
            severity: 'danger' as const,
            meaning: 'Un gouvernement (US DOJ, Allemagne, etc.) vend des BTC saisis. Historique documenté : -2 à -5% sur BTC dans les 2-4 jours suivants. Le marché anticipe l\'offre supplémentaire.',
            action: 'Pas de long ce jour. Si structure 4H baissière (LH/LL formés) ET Whale Ratio ≥ 0.85 → setup short valide : entrée sur retest résistance EMA. Sans confluence technique → attends absorption (2-4 jours). Si le prix tient malgré la vente → signal de force pour le long suivant.',
            actionColor: 'text-red-400',
          },
          {
            type: 'CEX Deposits ≥ $20M (whale individuelle)',
            severity: 'warning' as const,
            meaning: 'Une grosse baleine dépose sur un exchange, potentiellement pour vendre. Attention : 30-40% de ces transferts sont des rééquilibrages internes entre wallets du même acteur.',
            action: 'Filtre baissier. Si Whale Ratio ≥ 0.85 ET structure 4H baissière (LH/LL) → signal short actionnable : traite-le comme le setup short #1 ou #2. Si Whale Ratio < 0.85 → doute, pas de trade dans les deux sens. Ne jamais décider sur cette alerte seule (30-40% de rééquilibrages internes).',
            actionColor: 'text-amber-400',
          },
          {
            type: 'BlackRock / Fidelity ≥ $50M vers Coinbase Custody',
            severity: 'success' as const,
            meaning: 'Direction vers Coinbase Custody = achat ETF = haussier fort et durable. Direction vers exchange de trading = vente possible. La destination change tout.',
            action: 'Signal haussier fort si direction Custody. Renforce la conviction long. Taille normale.',
            actionColor: 'text-emerald-400',
          },
          {
            type: 'Stablecoin Inflows ≥ $30M vers exchange',
            severity: 'tip' as const,
            meaning: 'Des stablecoins arrivent massivement sur un exchange. Cet argent est prêt à acheter. Les whales ont choisi leur niveau d\'entrée et attendent.',
            action: 'Signal pré-haussier. Renforce les setups longs techniques. Le carburant arrive avant le mouvement.',
            actionColor: 'text-emerald-400',
          },
        ].map((alert) => (
          <div key={alert.type} className="rounded-xl border border-white/10 bg-zinc-900 p-5 space-y-3">
            <p className="font-bold text-white text-base">{alert.type}</p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">Ce que ça signifie</p>
                <p className="text-sm text-zinc-400 leading-relaxed">{alert.meaning}</p>
              </div>
              <div className="rounded-lg bg-zinc-900/80 border border-white/10 px-3 py-2.5 space-y-1">
                <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">Action recommandée</p>
                <p className={cn('text-sm font-semibold leading-relaxed', alert.actionColor)}>{alert.action}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Callout type="warning" title="Piège fréquent — 30-40% des gros transferts sont des rééquilibrages internes">
        Binance wallet A → Binance wallet B = transfert interne qui apparaît comme un "dépôt baleine". Arkham améliore sa détection mais ne discrimine pas toujours parfaitement. <strong className="text-white">Attends la confirmation croisée avec le Whale Ratio CryptoQuant avant de conclure.</strong>
      </Callout>

      <SubHeading icon={<Activity size={18} />}>ETF Spot BTC — Flux Institutionnels Quotidiens (Farside Investors)</SubHeading>

      <Callout type="success" title="Signal actif depuis le 10 janvier 2024 — Approbation ETF spot BTC par la SEC">
        Les ETF spot BTC (BlackRock IBIT, Fidelity FBTC, ARK ARKB, etc.) représentent plus de <strong className="text-white">$120 milliards d'AUM cumulés (2026)</strong>. Les flux entrants et sortants de ces véhicules reflètent les décisions d'achat/vente des plus grands gestionnaires de fonds au monde. Source : <strong className="text-white">Farside Investors (farside.co.uk)</strong> — données journalières gratuites, publiées le lendemain matin.
      </Callout>

      <DataTable
        headers={['Signal ETF Flows', 'Interprétation', 'Décision']}
        rows={[
          [
            <span className="text-emerald-400 font-bold">Inflows {'>'} $300M/jour</span>,
            'Achat institutionnel massif. Demande physique directe sur BTC.',
            <span className="text-emerald-400 font-bold">Signal haussier fort. Renforce la conviction long.</span>,
          ],
          [
            <span className="text-emerald-400">Inflows modérés $50-300M</span>,
            'Achat institutionnel sain, rythme normal.',
            <span className="text-emerald-400">Contexte favorable. Trade long normalement.</span>,
          ],
          [
            <span className="text-amber-400">Flows proches de zéro (±$50M)</span>,
            'Neutralité institutionnelle. Ni accumulation ni distribution.',
            <span className="text-zinc-400">Contexte neutre. Aucun ajustement.</span>,
          ],
          [
            <span className="text-amber-400 font-bold">3 jours consécutifs outflows ({'>'} $100M total)</span>,
            'Distribution institutionnelle en cours. Les gestionnaires de fonds réduisent leurs positions.',
            <span className="text-amber-400 font-semibold">Filtre baissier. Réduis la taille des longs à 0.5%.</span>,
          ],
          [
            <span className="text-red-400 font-bold">Outflows {'>'} $500M sur 1 journée</span>,
            'Sortie institutionnelle massive. Stress ou rééquilibrage de portefeuille.',
            <span className="text-red-400 font-bold">Filtre baissier fort. Pas de long ce jour.</span>,
          ],
        ]}
      />

      <Callout type="tip" title="Workflow — 30 secondes chaque matin">
        <a href="https://farside.co.uk/bitcoin-etf-flow-all-data-in-excel/" target="_blank" className="text-indigo-400 hover:underline inline-flex items-center gap-1">farside.co.uk <ExternalLink size={12} /></a> → données J-1 disponibles chaque matin. Regarde les 3 derniers jours de flux nets. Un seul jour n'est pas un signal — c'est la tendance sur 3 jours qui compte.
      </Callout>
    </div>
  )
}

// ─── Onglet : Exécution ───────────────────────────────────────────────────────

function TabExecution() {
  return (
    <div className="space-y-6">
      <SectionHeading>Étape 5 — Exécution : Ordres, Calcul de Taille, Checklist</SectionHeading>

      <Callout type="info" title="L'état d'esprit du professionnel">
        Tu places un ordre Limite à l'avance sur une zone définie. Tu attends que le marché vienne <strong>à toi</strong>. Si le marché ne revient pas → pas de trade. Ce n'est pas un échec, c'est la discipline.
      </Callout>

      <SubHeading icon={<Flame size={18} />}>Coinglass Liquidation Heatmap — Cibler les TP et Placer les SL</SubHeading>

      <Callout type="success" title="Outil utilisé par tous les traders crypto professionnels — coinglass.com/pro/liquidation-heatmap">
        La Liquidation Heatmap affiche en temps réel où se concentrent les liquidations potentielles (stop losses + leviers) sur l'ensemble des exchanges. Ces zones sont des <strong className="text-white">aimants de prix</strong> : le marché est attiré vers ces niveaux car les market makers et institutions savent exactement où se trouvent les stops.
      </Callout>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 space-y-3">
          <p className="font-bold text-emerald-400">Utilisation pour les Take Profit</p>
          <div className="space-y-2 text-sm text-zinc-400">
            <p>• Les zones de forte densité de liquidations <strong className="text-white">au-dessus du prix</strong> = liquidations de shorts = aimants haussiers. Place ton TP <strong>juste en dessous</strong> de ces clusters.</p>
            <p>• Évite de mettre ton TP exactement SUR le niveau — le prix peut s'en approcher et se retourner avant. Marge de sécurité : 0.3-0.5% en deçà du cluster.</p>
            <p>• Les clusters de liquidation coïncident souvent avec les résistances EMA et les swing highs historiques — confluence = TP optimal.</p>
          </div>
        </div>
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 space-y-3">
          <p className="font-bold text-red-400">Utilisation pour les Stop Loss</p>
          <div className="space-y-2 text-sm text-zinc-400">
            <p>• Les zones de forte densité de liquidations <strong className="text-white">sous le prix</strong> = stop hunts probables. Ne place PAS ton SL dans ces clusters évidents.</p>
            <p>• Si ton SL calculé (ATR × 1.5) tombe exactement sur un cluster de liquidation → décale-le légèrement au-delà pour éviter la stop hunt mécanique.</p>
            <p>• Les "equal lows" visibles sur le graphique = stop hunt classique. La Heatmap te montre leur importance en termes de volume de liquidations.</p>
          </div>
        </div>
      </div>

      <Callout type="tip" title="Workflow en 30 secondes avant toute entrée">
        1. Ouvre coinglass.com → Liquidation Heatmap → 24h timeframe. 2. Identifie le prochain cluster de liquidation dans la direction de ton trade. 3. Vérifie que ton TP est juste en dessous (long) ou au-dessus (short) de ce cluster. 4. Vérifie que ton SL ne tombe pas dans un cluster de liquidation adverse.
      </Callout>

      <SubHeading icon={<Target size={18} />}>Types d'Ordres — Règle Absolue</SubHeading>
      <div className="space-y-3">
        {[
          { type: 'Ordre Limite', usage: 'TOUTES tes entrées', why: 'Zéro slippage. Frais maker (moins chers). Prix exact choisi à l\'avance. Sur 5x levier, 0.5% de slippage = 2.5% de perte avant de commencer.', color: 'border-emerald-500/30 bg-emerald-500/10', tc: 'text-emerald-400', icon: <CheckCircle2 size={18} className="text-emerald-400" /> },
          { type: 'Stop Market', usage: 'Ton Stop Loss UNIQUEMENT', why: 'Exécution garantie même en flash crash. Mieux vaut 0.1% de slippage qu\'une liquidation totale. Le SL en Stop Market est obligatoire.', color: 'border-amber-500/30 bg-amber-500/10', tc: 'text-amber-400', icon: <CheckCircle2 size={18} className="text-amber-400" /> },
          { type: 'Ordre Market', usage: 'JAMAIS pour l\'entrée', why: 'Slippage 0.1-0.5% + frais taker (1.5-3× plus chers). Sur 100 trades, la différence de rentabilité est significative. Aucune justification valable.', color: 'border-red-500/30 bg-red-500/10', tc: 'text-red-400', icon: <XCircle size={18} className="text-red-400" /> },
        ].map((r) => (
          <div key={r.type} className={cn('rounded-xl border p-4', r.color)}>
            <div className="flex items-center gap-2 mb-2">{r.icon}<p className={cn('font-bold text-base', r.tc)}>{r.type} → {r.usage}</p></div>
            <p className="text-sm text-zinc-400">{r.why}</p>
          </div>
        ))}
      </div>

      <SubHeading icon={<TrendingUp size={18} />}>Les 3 Setups LONG — Par Priorité</SubHeading>
      <div className="space-y-4">
        {[
          {
            rank: '1', label: 'Retest EMA 200', color: 'border-emerald-500/40 bg-emerald-500/10', tc: 'text-emerald-400',
            entry: 'EMA 200 × 1.003 à 1.005', sl: 'Prix entrée − (ATR × 1.5) ou mèche basse × 0.99', tp: 'Prochaine résistance majeure — R/R ≥ 1:3 obligatoire', time: '72h',
            note: 'Le setup le plus puissant. Maximum de confluence institutionnelle.',
          },
          {
            rank: '2', label: 'Retest EMA 50', color: 'border-indigo-500/30 bg-indigo-500/5', tc: 'text-indigo-400',
            entry: 'EMA 50 × 1.002 à 1.003', sl: 'Prix entrée − (ATR × 1.5) ou 1-1.5% sous mèche basse', tp: 'EMA 20, ATH local, ou résistance — R/R ≥ 1:2', time: '48h',
            note: 'Setup fréquent et fiable. Valide uniquement si weekly est haussier.',
          },
          {
            rank: '3', label: 'Retest POC + EMA (confluence)', color: 'border-white/10 bg-zinc-900', tc: 'text-zinc-400',
            entry: 'POC exact + 0.2% (si coïncide avec EMA)', sl: 'Sous VAL − 0.5%', tp: 'VAH comme 1er objectif', time: '72h',
            note: 'Valide SEULEMENT si POC = EMA. Seul le POC est insuffisant.',
          },
        ].map((s) => (
          <div key={s.rank} className={cn('rounded-xl border p-5', s.color)}>
            <div className="flex items-center gap-2 mb-4">
              <span className={cn('flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold text-white', s.tc === 'text-emerald-400' ? 'bg-emerald-600' : s.tc === 'text-indigo-400' ? 'bg-indigo-600' : 'bg-zinc-700 text-zinc-400')}>{s.rank}</span>
              <p className={cn('font-bold text-base', s.tc)}>{s.label}</p>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3 mb-3">
              {[['Entrée (Limite)', s.entry], ['Stop Loss (Stop Market)', s.sl], ['Take Profit (Limite)', s.tp]].map(([lbl, val]) => (
                <div key={lbl} className="rounded-lg bg-zinc-900 border border-white/10 p-3">
                  <p className="text-xs font-bold text-zinc-400 uppercase mb-2">{lbl}</p>
                  <p className="text-sm text-white font-mono">{val}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-zinc-400"><span className="font-semibold">Validité :</span> {s.time} maximum. Annule l'ordre si non déclenché. <span className="italic">{s.note}</span></p>
          </div>
        ))}
      </div>

      <SubHeading icon={<TrendingDown size={18} />}>Les 3 Setups SHORT — Par Priorité</SubHeading>
      <Callout type="info" title="Symétrie long/short — même rigueur, même sélectivité">
        Un short se trade exactement comme un long : un niveau de référence devenu résistance, une structure confirmée (LH/LL formés), une entrée Limite, un R/R ≥ 1:2. La seule différence : le timeframe supérieur doit être baissier (EMA 20 {'<'} 50 {'<'} 200, ou ChoCH baissier validé).
      </Callout>
      <div className="space-y-4">
        {[
          {
            rank: '1', label: 'Retest EMA 200 par dessous (breakdown confirmé)', color: 'border-red-500/40 bg-red-500/10', tc: 'text-red-400',
            entry: 'EMA 200 × 0.997 à 0.995 (juste sous la EMA)', sl: 'Prix entrée + (ATR × 1.5) — ou mèche haute × 1.005', tp: 'Prochain support majeur (POC, VAL, ATL local) — R/R ≥ 1:3', time: '72h',
            note: 'Le setup short le plus puissant. EMA 200 devient résistance institutionnelle après breakdown. Valide uniquement si prix était au-dessus et a cassé de façon décisive (bougie de clôture, pas une mèche).',
          },
          {
            rank: '2', label: 'Retest EMA 50 comme résistance (LH formé)', color: 'border-amber-500/30 bg-amber-500/10', tc: 'text-amber-400',
            entry: 'EMA 50 × 0.998 à 0.997', sl: 'Prix entrée + (ATR × 1.5) ou 1-1.5% au-dessus de la mèche haute', tp: 'Prochain support identifiable — R/R ≥ 1:2', time: '48h',
            note: 'Setup fréquent en tendance baissière confirmée. Valide uniquement si weekly est baissier (EMA 20 < 50 daily) ET un LH est formé sur le graphe 4H.',
          },
          {
            rank: '3', label: 'Retest POC par dessous + rejection (confluence)', color: 'border-white/10 bg-zinc-900', tc: 'text-zinc-400',
            entry: 'POC exact − 0.2% sur rejection (si coïncide avec EMA)', sl: 'Au-dessus du VAH + 0.5%', tp: 'VAL comme 1er objectif', time: '72h',
            note: 'Valide SEULEMENT si POC = zone EMA. Le POC seul sans EMA est insuffisant. Nécessite une bougie de rejection (mèche haute longue) sur le POC.',
          },
        ].map((s) => (
          <div key={s.rank} className={cn('rounded-xl border p-5', s.color)}>
            <div className="flex items-center gap-2 mb-4">
              <span className={cn('flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold text-white', s.tc === 'text-red-400' ? 'bg-loss' : s.tc === 'text-amber-400' ? 'bg-neutral' : 'bg-border text-zinc-400')}>{s.rank}</span>
              <p className={cn('font-bold text-base', s.tc)}>{s.label}</p>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3 mb-3">
              {[['Entrée (Limite)', s.entry], ['Stop Loss (Stop Market)', s.sl], ['Take Profit (Limite)', s.tp]].map(([lbl, val]) => (
                <div key={lbl} className="rounded-lg bg-zinc-900 border border-white/10 p-3">
                  <p className="text-xs font-bold text-zinc-400 uppercase mb-2">{lbl}</p>
                  <p className="text-sm text-white font-mono">{val}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-zinc-400"><span className="font-semibold">Validité :</span> {s.time} maximum. Annule l'ordre si non déclenché. <span className="italic">{s.note}</span></p>
          </div>
        ))}
      </div>

      <SubHeading icon={<Scale size={18} />}>Formule de Taille de Position — Obligatoire</SubHeading>
      <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-5 font-mono space-y-4">
        {[
          { step: '1', label: 'Risque USDT', formula: 'Capital total × 0.01', ex: 'Capital 50 000$ → Risque = 500$' },
          { step: '2', label: 'Distance SL', formula: '|Prix entrée − Prix SL| ÷ Prix entrée', ex: 'Entrée 65 000$ → SL 63 800$ → Distance = 1.85%' },
          { step: '3', label: 'Taille position', formula: 'Risque USDT ÷ Distance SL (décimal)', ex: '500$ ÷ 0.0185 = 27 027$ de position' },
          { step: '4', label: 'Marge utilisée', formula: 'Taille position ÷ Levier', ex: '27 027$ ÷ 3 = 9 009$ de marge (18% du capital)' },
        ].map((r) => (
          <div key={r.step} className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-zinc-400 font-bold">Étape {r.step} — {r.label}</p>
            <p className="text-base text-white">{r.formula}</p>
            <p className="text-sm text-zinc-400">{r.ex}</p>
            {r.step !== '4' && <div className="h-px bg-border mt-3" />}
          </div>
        ))}
      </div>

      <p className="text-sm font-bold text-white">Table de référence — Capital 10 000$, Risque 1% = 100$</p>
      <DataTable
        headers={['Distance SL', 'Taille position', 'Levier 2× → Marge', 'Levier 3× → Marge', 'Levier 5× → Marge']}
        rows={[
          ['1.0%', '10 000$', '5 000$', '3 333$', '2 000$'],
          ['1.5%', '6 667$',  '3 333$', '2 222$', '1 333$'],
          ['2.0%', '5 000$',  '2 500$', '1 667$', '1 000$'],
          ['2.5%', '4 000$',  '2 000$', '1 333$', '800$'],
          ['3.0%', '3 333$',  '1 667$', '1 111$', '667$'],
        ]}
      />

      <SubHeading icon={<CheckCircle2 size={18} />}>Checklist Hyperliquid — Ordre Strict</SubHeading>
      <div className="space-y-2">
        {[
          { n: '01', text: 'Sélectionne l\'actif (BTC-PERP, ETH-PERP, SOL-PERP)', critical: false },
          { n: '02', text: 'Clique LONG ou SHORT selon le setup identifié', critical: false },
          { n: '03', text: 'Règle le levier (2-3× max recommandé, 5× absolu maximum)', critical: false },
          { n: '04', text: 'CRITIQUE : Mode Marge Isolée (Isolated) — protège le capital global en cas de liquidation', critical: true },
          { n: '05', text: 'Sélectionne "Limit" — JAMAIS Market pour l\'entrée', critical: false },
          { n: '06', text: 'Entre le prix calculé selon la formule du setup', critical: false },
          { n: '07', text: 'CRITIQUE : Coche TP/SL avant de valider — SL = Stop Market, TP = Limit', critical: true },
          { n: '08', text: 'CRITIQUE : Vérifie le prix de liquidation — il doit être au minimum 2× l\'écart SL au-delà', critical: true },
          { n: '09', text: 'Confirme l\'ordre → Ouvre le journal de trading dans les 5 minutes', critical: false },
        ].map(({ n, text, critical }) => (
          <div key={n} className={cn('flex items-start gap-3 rounded-xl border px-4 py-3', critical ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-white/10 bg-zinc-900/80')}>
            <span className="font-mono text-sm text-zinc-400 flex-shrink-0 w-6">{n}</span>
            <span className="text-sm text-zinc-400 leading-relaxed">{text}</span>
          </div>
        ))}
      </div>

      <Callout type="danger" title="Règle d'or Hyperliquid">
        Si le prix de liquidation est plus proche de ton entrée que ton Stop Loss → ton levier est trop élevé. Réduis le levier immédiatement. Une liquidation efface tout le capital de la position.
      </Callout>

      <SubHeading icon={<AlertTriangle size={18} />}>Les 6 Erreurs Fatales d'Exécution</SubHeading>
      <DataTable
        headers={['Erreur', 'Conséquence réelle', 'Règle correcte']}
        rows={[
          [<span className="font-semibold text-red-400">Entrer au Market</span>, 'Slippage + frais taker = 1-3% de perte avant le début du trade', 'Toujours Limit. Si le prix part sans toi → ce n\'était pas ton prix.'],
          [<span className="font-semibold text-red-400">SL trop serré ({'<'} ATR)</span>, 'BTC fait des ±0.5-1% normalement → sorti avant le mouvement', 'SL = ATR × 1.5 ou minimum sous la structure technique'],
          [<span className="font-semibold text-red-400">SL posé après entrée</span>, 'Flash crash 3% en 90 secondes = liquidation sans SL', 'TP + SL posés EN MÊME TEMPS que l\'ordre d\'entrée'],
          [<span className="font-semibold text-red-400">TP au-delà d\'une résistance</span>, 'Prix bloque à la résistance. Tu refuses de fermer. Retournement.', 'TP toujours AVANT la prochaine résistance identifiable'],
          [<span className="font-semibold text-red-400">Averaging Down</span>, 'Martingale = ruine mathématique. 1 → 2 → 4 → liquidation.', '1 trade = 1 entrée. SL touché = trade terminé.'],
          [<span className="font-semibold text-red-400">Déplacer SL en perte</span>, 'Perte -1% → -3% → -8% → liquidation. Documenté des milliers de fois.', 'SL ne se déplace JAMAIS dans la direction adverse. JAMAIS.'],
        ]}
      />
    </div>
  )
}

// ─── Onglet : Gestion du Trade ────────────────────────────────────────────────

function TabGestion() {
  return (
    <div className="space-y-6">
      <SectionHeading>Gestion du Trade Après l'Entrée — Le Secret de la Rentabilité</SectionHeading>

      <Callout type="success" title="Pourquoi la gestion post-entrée est aussi importante que l'entrée elle-même">
        <strong className="text-white">Linda Bradford Raschke (Market Wizards, Schwager 1992)</strong> : "Entry is 20% of the trade. Management is 80%." Les traders amateurs fixent leur sortie et n'y touchent plus. Les traders professionnels gèrent activement leur position selon des règles prédéfinies.
      </Callout>

      <SubHeading icon={<Crosshair size={18} />}>Plan de Gestion Standard — 4 Étapes</SubHeading>

      <div className="space-y-3">
        {[
          {
            milestone: 'À +1R (profit = 1× le risque initial)',
            action: 'Déplace le Stop Loss au prix d\'entrée (Breakeven)',
            why: 'Le trade devient "free" — risque réel = 0. Si le marché retourne au prix d\'entrée → sortie sans perte. Protège le capital tout en laissant courir le profit.',
            color: 'border-indigo-500/30 bg-indigo-500/5',
            tc: 'text-indigo-400',
          },
          {
            milestone: 'À +1.5R (profit = 1.5× le risque initial)',
            action: 'Ferme 30-50% de la position (Take Profit partiel)',
            why: 'Sécurise un profit réel. La position restante est maintenant "bonus" — peu importe ce qui arrive, tu as déjà gagné quelque chose. Réduit l\'anxiété qui pousse à fermer trop tôt.',
            color: 'border-emerald-500/20 bg-zinc-900',
            tc: 'text-emerald-400',
          },
          {
            milestone: 'À +2R (profit = 2× le risque initial)',
            action: 'Déplace le SL sous le dernier swing low significatif (trailing)',
            why: 'Commence à "locker" les profits en suivant la structure de marché. Le SL n\'est plus statique — il suit le mouvement en préservant un maximum de gain si retournement.',
            color: 'border-emerald-500/30 bg-emerald-500/10',
            tc: 'text-emerald-400',
          },
          {
            milestone: 'À +3R ou TP atteint',
            action: 'Ferme la totalité de la position restante',
            why: '+3R sur une position de 1% = +3% net sur le capital. C\'est le R/R cible minimum du protocole. Si le TP technique est atteint avant +3R → ferme quand même.',
            color: 'border-emerald-500/40 bg-emerald-500/10',
            tc: 'text-emerald-400',
          },
        ].map((s, i) => (
          <div key={i} className={cn('rounded-xl border p-5 space-y-2', s.color)}>
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">{i + 1}</span>
              <p className={cn('font-bold text-base', s.tc)}>{s.milestone}</p>
            </div>
            <p className="text-sm font-bold text-white pl-9">{s.action}</p>
            <p className="text-sm text-zinc-400 pl-9">{s.why}</p>
          </div>
        ))}
      </div>

      <Callout type="tip" title="Exemple concret — BTC Long à 65 000$, risque 1R = 1 000$">
        <div className="font-mono text-sm space-y-1.5 mt-1">
          <p>Entrée : 65 000$ | SL initial : 63 800$ (−1 200$ = 1R) | TP : 68 600$ (= +3R)</p>
          <p className="text-indigo-400">@ 66 200$ (+1R) → SL déplacé à 65 000$ (breakeven)</p>
          <p className="text-emerald-400">@ 66 800$ (+1.5R) → Ferme 40% → +720$ sécurisés</p>
          <p className="text-emerald-400">@ 67 400$ (+2R) → SL déplacé à 66 200$ (dernier HL)</p>
          <p className="text-emerald-400">@ 68 600$ (+3R) → Ferme 100% restant → +2 880$ total</p>
        </div>
      </Callout>

      <Callout type="tip" title="Exemple concret — BTC Short à 65 000$, risque 1R = 1 000$">
        <div className="font-mono text-sm space-y-1.5 mt-1">
          <p className="text-zinc-500 text-xs">Note : en short, le SL est AU-DESSUS de l'entrée. Le trailing descend avec les LH formés.</p>
          <p>Entrée : 65 000$ | SL initial : 66 200$ (+1 200$ = 1R) | TP : 61 400$ (= +3R)</p>
          <p className="text-indigo-400">@ 63 800$ (+1R) → SL déplacé à 65 000$ (breakeven)</p>
          <p className="text-red-400">@ 63 200$ (+1.5R) → Ferme 40% → +720$ sécurisés</p>
          <p className="text-red-400">@ 62 600$ (+2R) → SL déplacé à 63 800$ (dernier LH)</p>
          <p className="text-red-400">@ 61 400$ (+3R) → Ferme 100% restant → +2 880$ total</p>
        </div>
      </Callout>

      <SubHeading icon={<Shield size={18} />}>Règles de Gestion — Ce qu'il ne faut JAMAIS faire</SubHeading>

      <div className="space-y-2">
        {[
          { rule: 'Ne jamais déplacer le SL dans la direction adverse', detail: 'Déplacer de breakeven vers l\'entrée initiale après une correction = tu prends de nouveau du risque sur un trade qui était "free". Interdit.' },
          { rule: 'Ne jamais annuler le TP parce que "ça a l\'air de vouloir continuer"', detail: 'Le TP est posé sur une résistance identifiée AVANT l\'entrée. L\'annuler = changer les règles en cours de partie = biais de confirmation en action.' },
          { rule: 'Ne jamais garder une position ouverte à travers un événement FOMC/CPI', detail: 'Si un FOMC tombe alors que tu es en position → ferme ou réduis à 50% et déplace SL au breakeven. La volatilité macro rend toute analyse technique inutile pendant ces fenêtres.' },
          { rule: 'Ne jamais rajouter à une position perdante (averaging down)', detail: 'Si le trade va contre toi → le marché dit que ton analyse était incorrecte. Rajouter = doubler sur une erreur. La mathematique du Martingale mène à la ruine certaine.' },
          { rule: 'Ne jamais garder une position overnight si l\'état émotionnel du lendemain est incertain', detail: 'Si tu ne peux pas te permettre de voir un -3% "flash crash" à 3h du matin et rester calme → réduis la taille ou ferme avant de dormir.' },
        ].map((r, i) => (
          <div key={i} className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
            <div className="flex items-start gap-2">
              <XCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">{r.rule}</p>
                <p className="text-sm text-zinc-400 mt-1">{r.detail}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <SubHeading icon={<BarChart2 size={18} />}>Analyse Post-Trade — Les 5 Minutes Qui Font la Différence</SubHeading>

      <Callout type="info" title="Études sur le feedback loop en trading">
        <strong className="text-white">Brett Steenbarger "Enhancing Trader Performance" (2007)</strong> : Les traders qui analysent systématiquement chaque trade (WON ou LOST) progressent 3× plus vite que ceux qui ne le font pas. L'objectif n'est pas de critiquer — c'est d'identifier des patterns.
      </Callout>

      <div className="rounded-xl border border-white/10 bg-zinc-900 p-5 space-y-3">
        <p className="font-bold text-white">Pour chaque trade fermé — Réponds à ces questions dans le journal</p>
        <div className="space-y-2">
          {[
            'Le setup respectait-il 100% le protocole (7 étapes) ?',
            'Mon état émotionnel était-il ≥ 3/5 au moment de l\'entrée ?',
            'Ai-je respecté le plan de gestion (breakeven à 1R, TP partiel à 1.5R) ?',
            'Si trade perdant : le SL était-il bien placé ou trop serré ?',
            'Si trade gagnant fermé trop tôt : quelle émotion m\'a poussé à fermer prématurément ?',
            'Y a-t-il une leçon concrète et unique à retenir pour le prochain trade ?',
          ].map((q, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-zinc-400">
              <ChevronRight size={14} className="text-indigo-400 flex-shrink-0 mt-0.5" />
              {q}
            </div>
          ))}
        </div>
      </div>

      <Callout type="success" title="Mathématique du plan de gestion — Pourquoi ça change tout">
        <div className="font-mono text-sm space-y-2 mt-1">
          <p className="text-white font-bold">Scénario A — Gestion passive (fermer au TP ou SL) : Win Rate 45%, R/R 1:2.5</p>
          <p className="text-zinc-400">(45 × 2.5R) − (55 × 1R) = 112.5 − 55 = <span className="text-emerald-400 font-bold">+57.5R sur 100 trades</span></p>
          <div className="h-px bg-border" />
          <p className="text-white font-bold">Scénario B — Gestion active (breakeven + TP partiel) : Win Rate 45%, R/R moyen 2R</p>
          <p className="text-zinc-400">(45 × 2R) − (45 × 0R breakeven) − (10 × 1R vraies pertes) = 90 − 10 = <span className="text-emerald-400 font-bold">+80R sur 100 trades</span></p>
        </div>
        <p className="mt-2 text-sm">La gestion active augmente significativement le R/R réel même avec le même win rate.</p>
      </Callout>
    </div>
  )
}

// ─── Onglet : Macro ───────────────────────────────────────────────────────────

function TabMacro() {
  return (
    <div className="space-y-6">
      <SectionHeading>Étape 0 — Filtres Macro Hebdomadaires</SectionHeading>

      <Callout type="info" title="Fréquence et rôle">
        Ce check se fait <strong className="text-white">une fois par semaine (dimanche)</strong>. Il définit le contexte macro pour toute la semaine. Il ne génère pas de signal de trade en lui-même — il définit si les conditions sont favorables et quelle taille utiliser.
      </Callout>

      <SubHeading icon={<BarChart2 size={18} />}>BTC Dominance (BTC.D) — Filtre Crypto Spécifique</SubHeading>
      <Callout type="tip" title="Indicateur souvent ignoré — Critique pour ETH et SOL">
        Le BTC.D mesure la part de marché de BTC dans la capitalisation crypto totale. Il détermine si les flux vont vers BTC (dominance montante) ou vers les altcoins (dominance descendante).
      </Callout>
      <DataTable
        headers={['BTC.D', 'Signal', 'Décision pour ETH/SOL']}
        rows={[
          ['> 55% et montant', <span className="text-amber-400">BTC domine — altcoins sous pression</span>, 'Trader uniquement BTC. ETH/SOL : taille réduite 50% ou pas de trade.'],
          ['50-55% stable', 'Marché équilibré', 'Trading normal sur tous les actifs'],
          ['< 50% et descendant', <span className="text-emerald-400">Altcoin season potentiel</span>, 'ETH et SOL peuvent fortement surperformer BTC. Opportunités amplifiées.'],
          ['BTC.D chute brusque de 3%+ en 1 semaine', <span className="text-emerald-400">Rotation rapide vers altcoins</span>, 'Signal fort de surperformance ETH/SOL à court terme'],
        ]}
      />

      <SubHeading icon={<Globe size={18} />}>CME FedWatch Tool</SubHeading>
      <DataTable
        headers={['Scénario FedWatch', 'Impact crypto', 'Ajustement']}
        rows={[
          ['Baisse de taux > 50% prob.', <span className="text-emerald-400">Dovish — favorable actifs risqués</span>, 'Trade normalement, taille normale'],
          ['Statu quo attendu', 'Neutre', 'Trade normalement'],
          ['Hausse de taux > 50% prob.', <span className="text-amber-400">Hawkish — pression crypto</span>, <span className="text-amber-400 font-semibold">Taille réduite 30%</span>],
          ['FOMC dans les 48h', <span className="text-red-400">Volatilité imprévisible</span>, <span className="text-red-400 font-semibold">Pas de nouveau trade. SL au breakeven.</span>],
        ]}
      />
      <Callout type="tip" title="C'est la surprise qui fait les grands mouvements">
        Si le marché anticipe une pause à 80% et que la Fed fait une pause → aucun mouvement. Si la Fed baisse alors que 60% attendaient une pause → explosion haussière. L'écart entre l'attendu et le réel = volatilité.
      </Callout>

      <SubHeading icon={<BarChart size={18} />}>DXY — Dollar Index</SubHeading>
      <DataTable
        headers={['Signal DXY', 'Impact BTC', 'Ajustement']}
        rows={[
          ['DXY sous EMA 50 et en baisse', <span className="text-emerald-400">Dollar faible → vents porteurs</span>, 'Trade normalement'],
          ['DXY au-dessus EMA 50 et monte', <span className="text-amber-400">Dollar fort → vent de face</span>, 'Plus sélectif sur les longs'],
          ['DXY casse EMA 200 vers le bas', <span className="text-emerald-400 font-semibold">Signal haussier durable</span>, 'Conditions excellentes pour longs'],
          ['DXY zone neutre', 'Pas de biais', 'Pas d\'ajustement'],
        ]}
      />

      <SubHeading icon={<AlertTriangle size={18} />}>Forex Factory — Événements Rouges</SubHeading>
      <DataTable
        headers={['Événement', 'Fréquence', 'Règle']}
        rows={[
          [<strong className="text-white">FOMC Meeting + Rate Decision</strong>, '8×/an', <span className="text-red-400 font-semibold">Pas de trade 48h avant ET après</span>],
          [<strong className="text-white">Fed Chair Press Conference</strong>, 'Après chaque FOMC', <span className="text-red-400 font-semibold">Identique FOMC — Jay Powell peut retourner un marché en une phrase</span>],
          [<strong className="text-white">CPI</strong>, 'Mensuel', <span className="text-amber-400">Pas de nouveau trade ce jour — SL au breakeven si position ouverte</span>],
          ['NFP', '1er vendredi du mois', 'Taille réduite 50% dans les 24h'],
          ['GDP Quarterly', 'Trimestriel', 'Surveille la surprise'],
        ]}
      />

      <SubHeading icon={<Activity size={18} />}>VIX, US10Y & Fear and Greed</SubHeading>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          {
            title: 'VIX (TradingView : VIX)',
            rows: [
              { v: '< 12', z: 'Complaisance', a: 'Prudence longs', c: 'text-amber-400' },
              { v: '12–20', z: 'Normal', a: 'Trade librement', c: 'text-emerald-400' },
              { v: '20–30', z: 'Tension', a: 'Taille −25%', c: 'text-amber-400' },
              { v: '> 30', z: 'Peur', a: 'Zone contrarian', c: 'text-emerald-400' },
              { v: '> 50', z: 'Panique', a: 'Opportunité rare', c: 'text-emerald-400' },
            ],
          },
          {
            title: 'US10Y (TradingView : US10Y)',
            rows: [
              { v: '< 4.0%',   z: 'Favorable',  a: 'Normal',             c: 'text-emerald-400' },
              { v: '4.0–4.5%', z: 'Neutre',     a: 'Normal',             c: 'text-zinc-400' },
              { v: '4.5–5.0%', z: 'Pression',   a: 'Vigilance',          c: 'text-amber-400' },
              { v: '> 5.0%',   z: 'Hostile',    a: 'Réduis exposition',  c: 'text-red-400' },
            ],
          },
          {
            title: 'Fear & Greed',
            rows: [
              { v: '0–25',   z: 'Peur extrême', a: 'Accumulation historique', c: 'text-emerald-400' },
              { v: '26–59',  z: 'Peur → Neutre', a: 'Normal',                c: 'text-zinc-400' },
              { v: '60–75',  z: 'Avidité',       a: 'Vigilance',             c: 'text-amber-400' },
              { v: '76–100', z: 'Avidité extrême', a: 'Prudence maximale',   c: 'text-red-400' },
            ],
          },
        ].map((card) => (
          <div key={card.title} className="rounded-xl border border-white/10 bg-zinc-900 p-4">
            <p className="font-bold text-white mb-3">{card.title}</p>
            <div className="space-y-1.5">
              {card.rows.map(({ v, z, a, c }) => (
                <div key={v} className="flex items-center justify-between text-sm border-b border-white/10 last:border-0 pb-1.5 last:pb-0">
                  <span className="font-mono text-zinc-400 w-16 flex-shrink-0">{v}</span>
                  <span className="text-zinc-400 flex-1 mx-2 text-xs">{z}</span>
                  <span className={cn('font-medium text-xs text-right', c)}>{a}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <SubHeading icon={<BarChart size={18} />}>CME Gaps — Aimants de Prix Documentés (BTC uniquement)</SubHeading>

      <Callout type="success" title="Kaiko Research (2023) + CryptoQuant Blog (2024) — Backtest 2018-2024">
        Les futures BTC sur le CME (Chicago Mercantile Exchange) ferment le <strong className="text-white">vendredi ~22h UTC</strong> et rouvrent le <strong className="text-white">dimanche ~23h UTC</strong>. La différence entre le prix de clôture du vendredi et l'ouverture du dimanche crée un "gap". Backtests documentés : <strong className="text-white">~78-82% des gaps inférieurs à 2% sont remplis dans les 2-3 semaines</strong> suivantes. Ces gaps agissent comme des aimants de prix.
      </Callout>

      <DataTable
        headers={['Taille du gap', 'Taux de remplissage documenté', 'Utilisation dans le protocole']}
        rows={[
          [<span className="text-emerald-400 font-bold">{'<'} 1%</span>, <span className="text-emerald-400 font-bold">82-85%</span>, 'Très fort aimant. Si gap non rempli sous le prix actuel → aimant baissier → vérifie que ton TP long est au-dessus de ce niveau ou que le gap est déjà fermé.'],
          [<span className="text-emerald-400">1% — 2%</span>, <span className="text-emerald-400">78-80%</span>, 'Fort aimant. Même logique. Priority target pour les TP.'],
          [<span className="text-amber-400">2% — 5%</span>, <span className="text-amber-400">60-65%</span>, 'Aimant modéré. Contexte macro doit confirmer.'],
          [<span className="text-red-400">{'>'} 5%</span>, <span className="text-red-400">35-45%</span>, 'Taux bas. Contexte macro domine sur le gap. Ne pas compter dessus.'],
        ]}
      />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 space-y-2">
          <p className="font-bold text-emerald-400">Gap NON rempli au-DESSUS du prix actuel</p>
          <p className="text-sm text-zinc-400">= Aimant haussier. Le prix est susceptible de monter combler ce gap. Utilise-le comme <strong className="text-white">cible TP pour un long</strong>. Si ton TP calculé (résistance EMA) coïncide avec un gap au-dessus → confluence TP maximale.</p>
        </div>
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 space-y-2">
          <p className="font-bold text-red-400">Gap NON rempli en DESSOUS du prix actuel</p>
          <p className="text-sm text-zinc-400">= Aimant baissier. Le prix est susceptible de descendre combler ce gap. Si tu vises un long et qu'un gap important non rempli se trouve sous ton SL → risque d'attraction additionnelle vers le bas.</p>
        </div>
      </div>

      <Callout type="tip" title="Comment trouver les gaps CME — TradingView">
        Passe sur <strong className="text-white">BTC1! (CME BTC Futures)</strong> ou cherche les discontinuités entre le vendredi soir et le dimanche soir sur BTCUSD. Les gaps apparaissent comme des espaces vides entre deux bougies. Vérifie les 3-5 derniers gaps non remplis.
      </Callout>
    </div>
  )
}

// ─── Onglet : Psychologie ─────────────────────────────────────────────────────

function TabPsychologie() {
  return (
    <div className="space-y-6">
      <SectionHeading>Psychologie — Protocoles Mentaux d'Élite</SectionHeading>
      <Callout type="success" title="Études de référence — Base scientifique">
        <ul className="space-y-1.5">
          <li>• <strong className="text-white">Kahneman & Tversky — Prix Nobel 2002</strong> : Aversion aux pertes = 2.25× le plaisir équivalent</li>
          <li>• <strong className="text-white">Barber & Odean (2000) — 66 000 comptes</strong> : Le day trading perd systématiquement. Le swing trend-following conserve l'edge.</li>
          <li>• <strong className="text-white">Edgewonk 50 000 trades (2024)</strong> : Trades en état anxieux = WR 23% inférieur</li>
          <li>• <strong className="text-white">Van Tharp (2008) — 500 traders</strong> : 94% des survivants 5 ans+ risquent ≤ 2% par trade</li>
          <li>• <strong className="text-white">Lo & Repin (2002), MIT</strong> : Les réponses émotionnelles intenses = performances inférieures</li>
          <li>• <strong className="text-white">Steenbarger (2007)</strong> : Journal + analyse post-trade = progression 3× plus rapide</li>
        </ul>
      </Callout>

      <SubHeading icon={<Brain size={18} />}>Les 7 Biais qui Détruisent les Comptes</SubHeading>
      <div className="space-y-4">
        <BiasCard num={1} name="Biais de Confirmation" desc="Tu cherches inconsciemment des raisons qui confirment ce que tu veux déjà faire, en ignorant les signaux contraires. Ton cerveau te montre ce qu'il veut voir, pas ce qui est là." fix="Règle des 3 Invalidations : avant toute entrée, écris OBLIGATOIREMENT 3 raisons pour lesquelles le trade pourrait échouer. Si tu n'en trouves pas 3 → analyse insuffisante → pas de trade." />
        <BiasCard num={2} name="Revenge Trading" desc="Après une perte, tu prends des trades pour 'récupérer', souvent avec plus de risque et moins d'analyse. Le cortisol monte après une perte, la prise de risque augmente de 40% biologiquement." fix="Circuit-breaker automatique : perte ≥ 1.5% du capital = 24h d'arrêt total. Cette règle se définit MAINTENANT dans le calme, pas après la perte." />
        <BiasCard num={3} name="Déplacement du Stop Loss" desc="Le trade va contre toi. Tu déplaces le SL 'pour lui donner une chance'. Une perte -1% devient -3% devient liquidation. Documenté comme la cause principale de pertes catastrophiques." fix="RÈGLE D'ACIER : Le SL ne se déplace JAMAIS dans la direction adverse après l'entrée. JAMAIS. Il peut uniquement aller vers le breakeven ou en profit." />
        <BiasCard num={4} name="FOMO (Fear Of Missing Out)" desc="BTC monte 8% sans toi. Tu veux entrer maintenant. Les entrées tardives après +5% ont un R/R moyen de 0.8 — mathématiquement négatif sur la durée." fix="Règle du train parti : si l'actif a déjà bougé de plus de 5% depuis la zone identifiée, le train est parti. Je note le prochain niveau de retest et j'attends. Il y a toujours un prochain setup." />
        <BiasCard num={5} name="Surconfiance post-gains" desc="Après 3-5 trades gagnants, tu augmentes la taille ou prends des setups moins solides. La surconfiance précède statistiquement la prochaine grosse perte." fix="La taille = TOUJOURS 1% du capital actuel. Même après 5 gagnants. La taille de position ne varie jamais avec la confiance subjective." />
        <BiasCard num={6} name="Aversion aux Pertes (Kahneman, 2002)" desc="Tu refuses de clore un trade perdant car c'est émotionnellement douloureux. Tu espères que le marché revienne. Les pertes font 2.25× plus mal que les gains." fix="Recadrage : un SL n'est pas une perte. C'est le coût d'une information. Le marché t'a dit que ton analyse était incorrecte. Tu as payé 1% pour savoir ça — c'est un service." />
        <BiasCard num={7} name="Biais de Récence" desc="Après 2 pertes : 'Ma stratégie est cassée'. Après 3 gains : 'Je suis invincible'. Tu surponds les derniers trades par rapport à l'ensemble de l'historique." fix="Règle des 50 trades : Mon système s'évalue sur les 50 derniers trades MINIMUM. En dessous, les statistiques ne sont pas significatives — c'est du bruit, pas du signal." />
      </div>

      <SubHeading icon={<AlertOctagon size={18} />}>Signaux d'Alarme — Stop Immédiat</SubHeading>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {[
          'Je regarde les graphiques > 10 fois en 1h sans raison précise',
          'Je pense à récupérer une perte avec un autre trade',
          'J\'ai envie d\'augmenter la taille pour compenser',
          'Je me sens euphorique ou invincible',
          'J\'ai du mal à dormir à cause d\'une position ouverte',
          'Je cherche des validations sur Twitter / Discord / Telegram',
          'Je change de stratégie après 2-3 pertes consécutives',
          'J\'ai ouvert un trade sans protocole complet',
          'Je surveille mon P&L toutes les 5 minutes sur swing',
          'J\'entre sur un actif non prévu parce qu\'il monte fort',
        ].map((s) => (
          <div key={s} className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
            <AlertOctagon size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-zinc-400">{s}</span>
          </div>
        ))}
      </div>

      <SubHeading icon={<CheckCircle2 size={18} />}>5 Pratiques Quotidiennes d'Élite</SubHeading>
      <div className="space-y-3">
        {[
          { n: '01', t: 'Routine pré-session 15 min', d: '5 min de respiration ou méditation (réduit le cortisol). Relis tes 3 règles principales. Note l\'état émotionnel /5 avant d\'ouvrir un graphique.' },
          { n: '02', t: 'Maximum 2 checks/jour', d: 'Swing trading 4H = max 2 vérifications (matin ~8h, soir ~20h). La surveillance excessive crée de l\'anxiété et pousse à intervenir inutilement.' },
          { n: '03', t: 'Déconnexion totale après une perte', d: 'Après un SL : ferme tout. Sors marcher 20 min. L\'exercice réduit le cortisol et la réactivité émotionnelle — scientifiquement documenté.' },
          { n: '04', t: 'Penser en % et R, jamais en argent concret', d: 'Pense "1R" ou "1%", jamais en "€ perdus" ou "appartements". La contextualisation émotionnelle de l\'argent biaisse chaque décision.' },
          { n: '05', t: 'Review de fin de session 5 min', d: 'Une seule amélioration concrète pour la prochaine session. Pas 10, pas une autocritique totale. Une amélioration unique et actionnaire.' },
        ].map((p) => (
          <div key={p.n} className="flex gap-4 rounded-xl border border-white/10 bg-zinc-900 p-4">
            <span className="flex-shrink-0 font-mono text-base font-bold text-indigo-400">{p.n}</span>
            <div><p className="font-bold text-white">{p.t}</p><p className="text-sm text-zinc-400 mt-1.5 leading-relaxed">{p.d}</p></div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Onglet : Circuit-Breaker ─────────────────────────────────────────────────

function TabCircuit() {
  return (
    <div className="space-y-6">
      <SectionHeading>Circuit-Breaker — Règles Non-Négociables</SectionHeading>
      <Callout type="danger" title="Ces règles se définissent MAINTENANT, dans le calme">
        Pas après la perte, quand le cortisol parle. Pas après 3 gains, quand tu te sens invincible. Le circuit-breaker existe précisément parce que le cerveau humain n'est pas fiable sous émotion.
      </Callout>

      <div className="space-y-3">
        {[
          { cond: 'Perte ≥ 1.5% du capital sur un seul trade', action: '24h d\'arrêt total — pas d\'écran, pas de graphique', why: 'Perte > 1.5% = risque 1% dépassé. Analyser pourquoi avant de continuer.', sev: 'medium' },
          { cond: '2 pertes consécutives', action: '48h d\'arrêt + revue des 2 trades dans le journal', why: '2 pertes = marché hostile OU problème d\'analyse OU état mental. Les deux méritent une revue honnête.', sev: 'medium' },
          { cond: '3 pertes consécutives', action: '1 semaine d\'arrêt — mode observation uniquement', why: 'Ton edge est absent. Le marché t\'a dit 3 fois que tu avais tort. Écoute.', sev: 'high' },
          { cond: 'Perte cumulée ≥ 5% sur 7 jours glissants', action: '1 semaine d\'arrêt + revue journal semaine', why: '5% drawdown hebdo dépasse les normes d\'un système sain. Réévaluation nécessaire.', sev: 'high' },
          { cond: 'Perte cumulée ≥ 10% sur 30 jours', action: '2 semaines d\'arrêt + révision complète stratégie + journal', why: '10% drawdown mensuel = seuil critique. Tout remettre à plat sans urgence.', sev: 'critical' },
          { cond: 'FOMC/CPI dans les 24h', action: 'Pas de nouveau trade. Positions existantes : SL au breakeven.', why: 'La volatilité macro rend toute analyse technique inutile dans ces fenêtres.', sev: 'medium' },
        ].map((cb) => {
          const sevMap: Record<string, { tag: string; label: string }> = { medium: { tag: 'bg-neutral/20 text-amber-400 border-amber-500/40 bg-amber-500/10', label: 'MODÉRÉ' }, high: { tag: 'border-red-500/30 bg-red-500/10', label: 'ÉLEVÉ' }, critical: { tag: 'border-red-500/40 bg-red-500/10', label: 'CRITIQUE' } }
          const sev = sevMap[cb.sev] ?? sevMap['medium']
          return (
            <div key={cb.cond} className={cn('rounded-xl border p-4 space-y-2', sev.tag)}>
              <div className="flex items-start justify-between gap-3">
                <p className="font-bold text-white">{cb.cond}</p>
                <span className={cn('flex-shrink-0 rounded-md px-2 py-0.5 text-xs font-bold', cb.sev === 'critical' ? 'bg-loss text-white' : cb.sev === 'high' ? 'bg-loss/20 text-red-400' : 'bg-neutral/20 text-amber-400')}>{sev.label}</span>
              </div>
              <p className="text-sm font-semibold text-red-400 flex items-center gap-2"><ArrowRight size={14} className="flex-shrink-0" />{cb.action}</p>
              <p className="text-sm text-zinc-400 italic">{cb.why}</p>
            </div>
          )
        })}
      </div>

      <SubHeading icon={<Zap size={18} />}>Feux de Signalisation — Taille par Contexte</SubHeading>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { color: 'border-emerald-500/30 bg-emerald-500/10', icon: <CheckCircle2 size={18} className="text-emerald-400" />, iconBg: 'bg-profit', label: 'VERT — 1%', items: ['5+ filtres alignés', 'État émotionnel ≥ 3/5', 'Pas d\'événement macro 48h', 'VIX < 25', 'Structure MTF alignée'], tc: 'text-emerald-400' },
          { color: 'border-amber-500/30 bg-amber-500/10', icon: <AlertTriangle size={18} className="text-amber-400" />, iconBg: 'bg-neutral', label: 'JAUNE — 0.5%', items: ['3-4 filtres alignés', 'VIX 25-35', 'Contexte macro incertain', 'MTF partiellement aligné'], tc: 'text-amber-400' },
          { color: 'border-red-500/30 bg-red-500/10', icon: <XCircle size={18} className="text-red-400" />, iconBg: 'bg-loss', label: 'ROUGE — Pas de trade', items: ['< 3 filtres alignés', 'État émotionnel ≤ 2/5', 'FOMC/CPI dans 48h', 'No Man\'s Land EMA', 'Circuit-breaker actif'], tc: 'text-red-400' },
        ].map((s) => (
          <div key={s.label} className={cn('rounded-xl border p-5 space-y-3', s.color)}>
            <div className="flex items-center gap-2">
              <div className={cn('h-8 w-8 rounded-full flex items-center justify-center', s.iconBg)}>{s.icon}</div>
              <p className={cn('font-bold text-base', s.tc)}>{s.label}</p>
            </div>
            <ul className="space-y-1.5">
              {s.items.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-zinc-400">
                  <ChevronRight size={12} className={cn('flex-shrink-0 mt-1', s.tc)} />{item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Onglet : Corrélations ────────────────────────────────────────────────────

function TabCorrelation() {
  return (
    <div className="space-y-6">
      <SectionHeading>Corrélations BTC / NASDAQ / S&P 500 / DXY</SectionHeading>

      <Callout type="success" title="Sources — arxiv 2501.09911 (2025) + CME Group + Stoic.ai (2026)">
        Le NASDAQ 100 est l'actif le plus corrélé à BTC avec une corrélation atteignant <strong className="text-white">0.87 à 0.92</strong>. BTC se comporte comme un "NASDAQ leveragé" : même direction générale, amplitude 3-5× supérieure.
      </Callout>

      <DataTable
        headers={['Actif', 'Corrélation avec BTC', 'Nature de la relation']}
        rows={[
          [<strong className="text-white">NASDAQ 100 (QQQ)</strong>, <span className="text-emerald-400 font-bold">0.76 à 0.92 — #1</span>, 'Relation la plus forte. BTC = NASDAQ leveragé. 60%+ de tech dans l\'indice. Même profil d\'investisseur.'],
          [<strong className="text-white">S&P 500 (SPX/SPY)</strong>, <span className="text-emerald-400">0.70 à 0.87 — #2</span>, 'Forte depuis ETF BTC jan 2024. Renforcée par les flux institutionnels communs.'],
          [<strong className="text-white">DXY</strong>, <span className="text-red-400">-0.65 à -0.75 — inverse</span>, 'Dollar fort = pression BTC. Dollar faible = vents porteurs crypto.'],
          [<strong className="text-white">US Treasuries (TLT)</strong>, 'Faible à négative', 'Risk-off (crise) : vente BTC + achat bonds. En régime normal : peu de corrélation.'],
        ]}
      />

      <SubHeading icon={<BarChart2 size={18} />}>Données chiffrées historiques</SubHeading>
      <div className="rounded-xl border border-white/10 bg-zinc-900 p-5 font-mono">
        <div className="grid grid-cols-4 gap-4 text-sm border-b border-white/10 pb-3 mb-3">
          <span className="text-zinc-500 font-bold">Année</span>
          <span className="text-zinc-400 font-bold">NASDAQ</span>
          <span className="text-zinc-400 font-bold">BTC</span>
          <span className="text-indigo-400 font-bold">Ratio</span>
        </div>
        {[
          { y: '2024', n: '+24%', b: '+135%', r: '×5.6' },
          { y: '2023', n: '+43%', b: '+147%', r: '×3.4' },
          { y: '2022', n: '-33%', b: '-65%',  r: '×2.0' },
          { y: '2021', n: '+27%', b: '+60%',  r: '×2.2' },
        ].map(({ y, n, b, r }) => (
          <div key={y} className="grid grid-cols-4 gap-4 text-sm py-2 border-b border-white/10 last:border-0">
            <span className="text-zinc-500">{y}</span>
            <span className={n.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}>{n}</span>
            <span className={b.startsWith('+') ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>{b}</span>
            <span className="text-indigo-400">{r}</span>
          </div>
        ))}
      </div>

      <Callout type="warning" title="Limite — Corrélation asymétrique crisis vs bull">
        La corrélation est <strong className="text-white">plus forte en risk-off (crise)</strong>. En régime de crise, BTC et NASDAQ chutent ensemble (corrélation 0.90+). En régime haussier, BTC peut surperformer ou sous-performer selon les dynamiques crypto-natives. Le NASDAQ est un filtre de contexte, pas une règle mécanique.
      </Callout>

      <SubHeading icon={<Layers size={18} />}>Filtre QQQ / EMA 200 — Le Plus Important</SubHeading>
      <DataTable
        headers={['Position QQQ vs EMA 200 weekly', 'Implication pour BTC/ETH/SOL', 'Ajustement']}
        rows={[
          [<span className="text-emerald-400 font-bold">QQQ au-dessus EMA 200 weekly</span>, 'Tendance macro favorable pour actifs risqués — conditions normales', 'Trade normalement'],
          [<span className="text-amber-400 font-bold">QQQ frôle EMA 200 weekly (±2%)</span>, 'Zone de décision critique — macro incertaine', 'Taille réduite 30%. Trades uniquement si confluence maximale.'],
          [<span className="text-red-400 font-bold">QQQ sous EMA 200 weekly</span>, 'Tendance macro négative — pression institutionnelle sur tout actif risqué', <span className="text-red-400 font-bold">Très sélectif. Taille réduite 50%. Favorise CASH ou shorts.</span>],
        ]}
      />

      <SubHeading icon={<TrendingUp size={18} />}>Catalyseurs qui Brisent la Corrélation</SubHeading>
      <DataTable
        headers={['Événement crypto-natif', 'Impact', 'Comportement attendu']}
        rows={[
          ['Halving Bitcoin', 'Coupe l\'offre nouvelle de 50%', 'BTC peut surperformer fortement même si NASDAQ plat'],
          ['Approbation ETF BTC', 'Nouveaux flux institutionnels directs', 'BTC réagit indépendamment et violemment'],
          ['Hack majeur exchange (type FTX)', 'Crise de confiance interne crypto', 'BTC baisse même si NASDAQ monte'],
          ['Réglementation SEC agressive', 'Incertitude légale', 'BTC réagit indépendamment'],
          ['MicroStrategy / achat corporate massif', 'Demande directe on-chain', 'BTC surperforme le NASDAQ'],
        ]}
      />

      <SubHeading icon={<BarChart size={18} />}>Williams %R — Pour SPX et NASDAQ uniquement</SubHeading>
      <Callout type="info" title="QuantifiedStrategies — analyse comparative 2024-2026">
        Le Williams %R est légèrement supérieur au RSI pour le swing trading sur les <strong className="text-white">indices (SPX, QQQ)</strong>. Sur BTC/ETH/SOL, le RSI reste la référence.
      </Callout>
      <DataTable
        headers={['W%R', 'Zone', 'Signal SPX/QQQ']}
        rows={[
          ['0 à -20', <span className="text-red-400">Surachat</span>, 'Prudence sur nouveaux longs. Potentiel de correction.'],
          ['-20 à -50', 'Normale haussière', 'Pas de biais.'],
          ['-50 à -80', 'Normale baissière', 'Pas de biais.'],
          ['-80 à -100', <span className="text-emerald-400">Survente</span>, 'Signal long potentiel si structure technique confirme.'],
        ]}
      />
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function ProtocolPage() {
  const [activeTab, setActiveTab] = useState<TabId>('regle')

  const content: Record<TabId, React.ReactNode> = {
    regle:       <TabRegleZero />,
    routine:     <TabRoutine />,
    mtf:         <TabMTF />,
    structure:   <TabStructure />,
    technique:   <TabTechnique />,
    onchain:     <TabOnChain />,
    arkham:      <TabArkham />,
    execution:   <TabExecution />,
    gestion:     <TabGestion />,
    macro:       <TabMacro />,
    psycho:      <TabPsychologie />,
    circuit:     <TabCircuit />,
    correlation: <TabCorrelation />,
  }

  return (
    <PageShell variant="document">
      {/* Header */}
      <div className={cn('border-b border-white/10 bg-zinc-950 py-5', PAGE_GUTTER_X)}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-3 text-2xl/8 font-semibold text-white sm:text-xl/8">
              <BookMarked data-slot="icon" className="size-6 text-indigo-400" aria-hidden="true" />
              Protocole de Trading
            </h1>
            <p className="mt-1 text-base/7 text-zinc-300 sm:text-sm/6">
              Swing Trading 4H · BTC, ETH, SOL, S&P 500, NASDAQ · 7 étapes obligatoires · Sources académiques vérifiées
            </p>
          </div>
          <div className="hidden items-center gap-2 rounded-lg bg-indigo-500/10 px-4 py-2.5 ring-1 ring-indigo-500/20 md:flex">
            <Lock data-slot="icon" className="size-3.5 text-indigo-400" aria-hidden="true" />
            <span className="text-sm font-semibold text-indigo-400">Protocole verrouillé</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/10 bg-zinc-950">
        <div className={cn('flex overflow-x-auto', PAGE_GUTTER_X)}>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                'flex items-center gap-2 whitespace-nowrap px-4 py-4 text-sm font-medium transition-all border-b-2 -mb-px',
                activeTab === id
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-zinc-400 hover:text-white hover:border-white/20',
              )}
            >
              <Icon size={15} className={activeTab === id ? 'text-indigo-400' : 'text-zinc-500'} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <PageSection className="py-8">
        {content[activeTab]}
      </PageSection>

      {/* Footer */}
      <div className={cn('mx-6 mb-8 rounded-xl border border-indigo-500/20 bg-indigo-500/5 px-6 py-5 lg:mx-10')}>
        <p className="text-sm font-semibold text-indigo-400 mb-1">Protocole Swing Trading 4H — Version 2.0</p>
        <p className="text-sm text-zinc-300">
          Sources : SSRN (Hurst 2017), Glassnode Research, Edgewonk (2024), Van Tharp (2008), Kahneman & Tversky (2002), Barber & Odean (2000), Lo & Repin (2002), Steenbarger (2007), Peter Steidlmayer (1985), Fischer (1993), Weinstein (1988), Schwager Market Wizards Series
        </p>
        <p className="mt-2 text-sm text-zinc-400 italic">
          "Ce n'est pas la stratégie d'entrée qui distingue les traders profitables. C'est la gestion du SL, la cohérence de la taille et la discipline psychologique." — Van Tharp, Trade Your Way to Financial Freedom
        </p>
      </div>
    </PageShell>
  )
}
