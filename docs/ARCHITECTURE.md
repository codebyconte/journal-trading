# Architecture et décisions

## Données

Next.js 15 / React / Prisma / PostgreSQL. Le mode local embarque PGlite, le mode hébergé utilise PostgreSQL. Les anciennes tables Trade, JournalEntry, Settings et CapitalAdjustment restent présentes. Leur environnement réel/paper n'étant pas identifiable, leurs statistiques sont isolées sous « ancien historique ».

ResearchPosition contient un plan initial immuable. PositionEvent est un journal append-only avec identifiant de requête unique. Les mutations concurrentes verrouillent la position, vérifient l'ordre chronologique et recalculent le grand livre avant validation. Une sortie excessive est refusée. Les données brutes sont conservées ; les agrégats sont recalculés.

ResearchDocument et ResearchRevision séparent identité et contenu versionné (MARKET, STRATEGY, WATCH, REVIEW, LEARNING). Le contrôle expectedVersion refuse les écrasements concurrents. Les phases d'une hypothèse restent des décisions humaines, pas une validation automatique.

DecisionAssessment contient le lien précis à la décision/version, une copie figée du contexte sans P&L, les critères et leurs justifications, la compétence, l'observation, l'interprétation, l'incertitude et l'action. Une correction ajoute un enregistrement lié par supersedesId. La datation serveur distingue avant résultat enregistré et rétrospectif ; elle ne prétend pas certifier l'ignorance du résultat.

Les plans LEARNING associent une compétence, un critère, des preuves, une action et une échéance. Les évaluations ultérieures peuvent citer la version exacte du critère. Une correction ne déplace pas la date de la situation initiale dans une comparaison avant/après.

ImportedFill conserve les lignes source, leur identifiant fournisseur et leur rapprochement éventuel. Une ligne importée n'est pas présumée être un trade complet. Une association manuelle ne modifie pas le grand livre.

## Calculs

`lib/research/finance.ts` utilise Decimal pour le P&L pondéré et le dimensionnement. Le R utilise le budget initial déclaré, conservé après déplacement du stop. Les coûts sont positifs quand payés, négatifs quand reçus. Le levier affecte la marge, pas le P&L à quantité constante. Les multiplicateurs/quantités et conversion USD sont explicités par instrument.

`metrics.ts` sépare catégories et données manquantes. Une petite moyenne positive ne prouve pas un avantage ; les intervalles de Wilson du win rate sont descriptifs et supposent une indépendance souvent imparfaite. Les cohortes ne sont pas randomisées, et leurs différences ne sont pas des effets causaux.

`learning.ts` ne reçoit aucun P&L pour qualifier le processus. Aucun score psychologique, classement ou certification de maîtrise. Le regroupement des erreurs renvoie aux observations saisies, déduplique les décisions et retire les hypothèses infirmées des pistes actives.

## Évolution prévue

Phase 2 : jeux OHLC importés avec provenance/licence, horloge historique séparée, indicateurs calculés seulement sur le préfixe visible, tentatives scellées avant révélation, règles d'exécution explicites pour bougies touchant SL et TP. Prévoir des critères de correction spécifiques au domaine et un historique des tentatives.

Phase 3 : préenregistrement des expériences, gel des jeux de test hors échantillon, suivi des variantes, estimation d'incertitude adaptée aux séries temporelles. Brier réservé aux événements binaires datés et observables, avec référence prédéfinie. Une IA éventuelle devra lire des données sélectionnées, citer leurs identifiants et distinguer observation/interprétation.

## Extension multi-actifs du 9 octobre 2026

ResearchDocument accueille ACCOUNT, INSTRUMENT et RESEARCH. Leurs révisions figent les configurations et fiches ; les positions contiennent un instantané du contrat et les décisions des recherches citées. AccountMovement conserve les apports/retraits idempotents par compte. ResearchPosition/ResearchDocument utilisent archivedAt et des documents AUDIT pour la restauration avec motif. CORRECTION référence un événement original et recalcule le grand livre sans le supprimer.

Le serveur contrôle multiplicateur, quantité minimale/pas et devise d’après le contrat choisi. Aucune validation de confluence BTC ne subsiste dans le parcours courant. Les anciennes routes de mutation répondent 410 ; les anciennes tables restent accessibles en export. Le catalogue et les comptes peuvent évoluer sans code.

Les devises des comptes et leurs environnements restent séparés. Un manque de coûts ou conversion rend le net inconnu. L’agrégat USD explicite utilise le taux enregistré dans chaque plan, constant pour ce plan. Les taux cotation→compte des sorties peuvent varier ; aucun taux live n’est déduit. Voir README pour les limites des modèles linéaires.

Le développement local utilise un cache Next distinct par port pour isoler tests et journal personnel. Les tests d’intégration démarrent une base temporaire ; les exemples ne sont jamais copiés dans le journal vierge livré.
