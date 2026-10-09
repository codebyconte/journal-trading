# TradingLog — Recherche & progression

Un journal personnel en français pour améliorer la qualité des décisions, documenter les erreurs et tester des corrections. Version du 9 octobre 2026. La priorité livrée est la **phase 1 : boucle de progression**, avec les fondations de journalisation, de risque et de persistance.

## Démarrer sur ce Mac

```sh
npm ci
npm run dev:local
```

Ouvrir http://127.0.0.1:3100. Le serveur écoute uniquement sur la boucle locale. La base PostgreSQL embarquée PGlite persiste dans `work/local-database`. Ne pas supprimer ce dossier. Ce mode local de développement n'est pas un hébergement public. Il ne récupère pas automatiquement une ancienne base Neon ni les données du courtier.

## Premier parcours

1. Dans **Paramètres → Comptes**, créer chaque compte avec sa devise, son capital et son environnement. Dans **Instruments**, définir les contrats exacts de ton courtier (multiplicateur, pas, pips/ticks et coûts). Aucun lot Forex ou or n’est présumé. Le compte historique reste séparé.
2. Dans **Journal de marché**, enregistrer une analyse avec un scénario contraire et une invalidation, même sans trade. Les révisions conservent l'original.
3. Dans **Ma progression → Évaluer une décision**, choisir une position ou une version d'analyse. Justifier les critères, indiquer les informations manquantes et la connaissance éventuelle du résultat.
4. Documenter une erreur comme hypothèse, observation ou hypothèse infirmée. Choisir une action corrective avec un critère observable et une date de revue.
5. Utiliser **Mes bilans** pour la revue hebdomadaire, mensuelle ou trimestrielle. Comparer les observations suivantes au critère choisi ; aucun progrès causal n'est déduit automatiquement.

Une décision d'attendre ou de ne pas trader peut être évaluée. Aucun score global de maîtrise ni récompense liée au nombre de trades.

## Ce qui fonctionne

- Accueil centré sur la prochaine amélioration ; 17 compétences, critères explicites, évaluations sourcées et corrections conservées.
- Bibliothèque d'erreurs avec exemples précis, hypothèses infirmées, actions correctives versionnées et bilan avant/après descriptif.
- Plans de trade immuables, événements horodatés : entrées et sorties partielles, stops, coûts, notes, valorisation manuelle, revue.
- Calculs décimaux : risque initial fixe pour le R, P&L net, coûts/funding, taille/arrondi, multiplicateur du contrat et conversion USD explicites.
- Analyses versionnées, stratégies modifiables, watchlist, revues ; données externes saisies avec provenance, date, fréquence et délai.
- Analytics séparant réel/paper/backtest/ancien historique, taille des échantillons, comparaisons descriptives et incertitude du taux de réussite.
- Export JSON complet et CSV des résultats ; import CSV des fills compatible avec les champs documentés Hyperliquid, dédoublonnage et rapprochement manuel.

## Sauvegardes et migration

Exporter régulièrement le JSON depuis Paramètres et copier séparément `public/uploads` pour les images. Le JSON contient les données personnelles : le conserver dans un emplacement privé. La sauvegarde n'est pas automatique ni externalisée.

Les anciennes tables et le texte du protocole restent conservés. Les migrations sont additives. **Aucune base distante personnelle n'a été migrée pendant ce développement** : le projet fourni ne contient pas ses identifiants. Avant de migrer une base existante, effectuer un `pg_dump`, sauvegarder les images, tester une restauration sur une copie et comparer les totaux.

Pour PostgreSQL/Neon, renseigner `.env` à partir de `.env.example`, puis `npm run db:migrate`. Ne pas utiliser `db:push` ni réinitialiser la base de production. En cas d'historique Prisma divergent, établir d'abord la correspondance des migrations sur une copie. Le mode PGlite local utilise son propre registre `_local_migrations`.

Restauration JSON dans une **base vide déjà migrée**, avec `DATABASE_URL` défini :

```sh
node scripts/restore.mjs sauvegarde.json --empty-database-only
```

Le script refuse une base contenant des données ou des paramètres personnalisés. Il restaure aussi les évaluations et leurs corrections. Les fichiers images ne sont pas inclus dans le JSON.

## Hébergement privé

Définir `JOURNAL_PASSWORD` (secret long et unique, au moins 16 caractères), `APP_ORIGIN` (origine HTTPS exacte sans slash final), `DATABASE_URL` et `DIRECT_URL` côté serveur. Aucun secret `NEXT_PUBLIC_*`. Utiliser HTTPS et un stockage persistant pour les uploads ; le disque éphémère de Vercel ne convient pas aux images actuelles. Le mode production refuse le contournement `LOCAL_ONLY`.

Authentification mono-utilisateur par cookie signé HttpOnly/Secure/SameSite strict, expiration 12 h, contrôle d'origine des mutations, contrôle de session dans l'accès aux données. Limitation des connexions en mémoire par processus ; prévoir une limitation partagée et une supervision avant exposition publique à grande échelle. Aucun connecteur de passage d'ordres ni clé de courtier.

## Vérifications

```sh
npm run test
npm run typecheck
npm run build
```

31 tests unitaires et migrations. `npm run test:integration` démarre une base temporaire isolée et vérifie journalisation, multi-actifs, comptes, évaluations, archivage et restauration. `node scripts/auth-check.mjs` vérifie un serveur de production temporaire après build. La CI ajoute le parcours navigateur (`JOURNAL_BROWSER_CHECK=true`) avec Chromium. Ne jamais lancer les scripts de fixtures isolément contre un journal personnel. Voir `docs/VALIDATION.md` pour les contrôles réellement exécutés.

Les critères d'acceptation et les limites sont détaillés dans [docs/ACCEPTANCE.md](docs/ACCEPTANCE.md), l'architecture dans [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), et la distinction preuves/hypothèses dans [docs/AUDIT.md](docs/AUDIT.md).

## Périmètre restant

Le replay historique, un moteur d'exercices avec tentatives/corrections, la révision espacée, la calibration Brier et un assistant IA ne sont **pas encore implémentés**. Le laboratoire actuel conserve des protocoles et résultats saisis ; il n'exécute pas de backtests ni de tests statistiques avancés.

Les rendements sont descriptifs : pas de TWR complet avec valorisations à chaque flux, pas de courbe mark-to-market historique, pas de MAE/MFE sans historique de prix. Conversion en USD fixe par position, contrats linéaires uniquement ; pas de moteur de liquidation. L'import conserve les fills pour rapprochement mais **ne crée pas automatiquement les écritures de position**. Les exercices proposés sont des consignes manuelles, pas un simulateur masquant réellement le futur.

## Extension multi-actifs

Comptes, contrats, études personnelles et catégories évoluent par formulaires et révisions. Les trades conservent les spécifications et les recherches utilisées à leur date. Les données on-chain ne sont jamais obligatoires. Les écarts au protocole et stops absents se documentent ; une incohérence comptable reste refusée. Les corrections d’exécution conservent l’événement original. L’archivage avec motif est réversible.

La bibliothèque contient des études et des portails distincts ; la vérification d’un portail ne valide pas tous ses articles. Les sources inaccessibles restent signalées. Aucun prix ou indicateur live n’est inventé.

Le moteur traite les contrats **linéaires à prix positif**, avec P&L dans la devise de cotation et multiplicateur explicite. Les options, contrats inverses, prêts spot, roulements automatiques et liquidation propre à chaque courtier ne sont pas calculés. La marge est une estimation notionnel/levier, pas une exigence officielle d’un courtier. Les conversions cotation→compte peuvent être renseignées par sortie ; l’agrégation USD utilise le taux compte→USD enregistré dans le plan (constant pour cette position). Ce n’est pas une comptabilité de change historique complète. Les coûts inconnus masquent le net, le capital correspondant et les métriques financières ; les R exigent un budget initial connu.

Replay, calibration Brier, backtest automatique, IA et attribution causale des erreurs restent des évolutions futures. Le laboratoire actuel conserve des protocoles et résultats saisis ; il n’exécute pas de simulation historique.
