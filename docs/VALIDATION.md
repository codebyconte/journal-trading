# Rapport de livraison — 9 octobre 2026

## Périmètre livré

Journal multi-actifs avec comptes et contrats versionnés, progression personnelle, évaluations de décisions indépendantes du résultat, erreurs et actions correctives, analyses et stratégies versionnées, suivi des exécutions, risques/calculs décimaux, sources institutionnelles et personnelles, liens de recherche figés, filtres Analytics, archivage/restauration et exports/imports contrôlés.

Les tests utilisent uniquement des données fictives dans des bases locales isolées. Aucun ordre, dépôt ou retrait chez un courtier n’est effectué. Aucun déploiement ni migration d’une base de production. L’installation locale démarre sans faux capital ni trades de démonstration.

## Contrôles réellement exécutés

| Contrôle | Résultat | Limite |
|---|---|---|
| Tests unitaires et migrations | 31/31 réussis | Données sentinelles, calculs et règles explicites, pas validation de stratégie |
| Compilation de production | Réussie (Next 15.5.27) | Build local, pas déploiement |
| TypeScript | Réussi | N’est pas une garantie d’absence de bug |
| API et persistance | Suites integration, multiasset, learning, restore réussies | PGlite local, pas toute plateforme PostgreSQL distante |
| Authentification production | Refus sans session, cookie altéré, mauvaise origine ; cookie signé accepté ; LOCAL_ONLY inopérant | Mono-utilisateur, pas RBAC multi-utilisateur |
| Captures privées | Upload PNG, lecture authentifiée, accès anonyme direct et via optimiseur refusés | Stockage local persistant requis |
| Dépendances de production | npm audit --omit=dev : 0 vulnérabilité connue | Photographie à la date de contrôle |
| Dépendances de développement | Minimatch corrigé ; 11 alertes transitives restantes autour de braces | Aucune version corrigée de braces annoncée au contrôle ; ne pas importer des motifs de fichiers non fiables dans les outils de lint |
| Navigateur | Saisie/clôture BTC, ETH short avec deux sorties et funding, SOL, XAUUSD, EURUSD, contrat personnalisé | Exemples PAPER dans la prévisualisation de test ; BTC REAL aussi couvert par API |
| Interface configurable | Instrument TESTBOND ajouté sans code, recherche personnelle EURUSD enregistrée, comparaison or/Forex | Personnalisation testée sur les champs principaux |
| Mobile | 9 routes sans débordement horizontal à 390 × 844 ; inspection visuelle Sources/Risque | Pas validation sur tous les appareils et navigateurs |
| CI | Workflow et parcours Chromium livrés | CI distante et script Chromium autonome non exécutés ici ; parcours locaux opérés par le navigateur de Codex |

## Parcours demandés A–O

- **A** : BTC Hyperliquid créé, stop modifié, sortie et correction du prix par API ; entrée/clôture vérifiées dans l’interface.
- **B** : ETH short, sorties 0,4 puis 0,6, frais et coût de funding. API : net 153 USD avec 2 USD de frais d’entrée ; interface : net 155 USD sans ces 2 USD. Calculs distincts vérifiés.
- **C** : SOL enregistré sans stop, risque et R inconnus ; parcours interface clôturé à +1 USD.
- **D** : XAUUSD avec multiplicateur 100 et 0,1 lot : variation de 10 → 100 USD. Comparaison de multiplicateurs 1/100 en unitaires.
- **E** : EURUSD 100 000 unités/lot, 0,1 lot, +0,002 → 20 USD ; conversion explicite → 18 EUR testée par API. USDJPY avec conversion JPY→USD testé en unitaires.
- **F** : contrat CUSTOMIDX ajouté par API et tradé dans l’interface ; TESTBOND créé par formulaire sans code.
- **G** : absence de stop et trade hors stratégie acceptés, sans champs Bitcoin obligatoires ; incohérences de quantités refusées.
- **H** : analyse macro sans transaction enregistrée et versionnée, références Fed conservées.
- **I** : références appropriées par actif, instantané d’une recherche contradictoire sur l’or, filtre EURUSD et limites du future Euro FX vérifiés.
- **J** : sauvegarde JSON complète, corrections sans suppression de l’original, archivage/restauration réversibles avec motif, export CSV ; restauration en base vide testée et écrasement d’une base remplie refusé.
- **K** : filtres comptes/instruments/stratégies/environnements et comparaison XAUUSD/EURUSD inspectés ; résultats incomplets exclus et signalés.
- **L** : desktop et neuf vues mobiles inspectées ; les six parcours de positions exécutés dans le navigateur.
- **M** : session, origine, cookie, captures et refus du contournement en production vérifiés.
- **N** : champs inconnus (stop, coûts, conversion), erreurs API/validation et indisponibilité de base affichée avec possibilité de reprise observés. Les lectures réessayent une seule fois après une connexion interrompue (P1001/P1017), jamais une mutation ; reprise bornée testée en unitaires. Sources inaccessibles signalées ; aucun connecteur live activé. Pas de campagne exhaustive de pannes réseau.
- **O** : réimport d’un CSV identique idempotent ; rapprochement manuel conservé, sans création automatique de P&L.

## Limites fonctionnelles assumées

Le laboratoire conserve les protocoles et résultats saisis ; il n’exécute aucun backtest. Replay historique, moteur d’exercices sur graphiques masqués, révision espacée automatique, Brier, assistant IA et tests statistiques avancés restent à développer. MAE/MFE, risque de liquidation exact, TWR par compte et comptabilité complète de change ne sont pas calculés.

Les contrats pris en charge sont linéaires, à prix positif, avec P&L en devise de cotation. La marge est une estimation notionnel/levier. Les contrats inverses, options, coûts automatiques et roulements ne sont pas proposés. L’agrégation USD repose sur le taux compte→USD figé dans le plan : ce n’est pas un taux live ni une revalorisation historique quotidienne.

Les études sont sélectionnées et leurs métadonnées/résumés primaires examinés ; aucune réplication indépendante ni audit complet de chaque article d’un portail n’est prétendu. Les pourcentages historiques non étayés restent archivés comme non vérifiés.

## Préservation et utilisation

Une sauvegarde ZIP de la source originale précède la refonte. Les anciennes tables, protocoles, journaux et recherches restent conservés. Les anciens chemins de mutation répondent 410 pour empêcher une réintroduction des validations figées. Les uploads existants ne sont pas remplacés lors de la synchronisation du code.

Exporter le JSON et sauvegarder les images séparément avant toute migration distante. La restauration fournie accepte uniquement une base vide déjà migrée. Les exemples de test sur le port 3101 restent séparés du nouveau journal personnel sur le port 3100. Les dossiers work contenant une base doivent être conservés et sauvegardés ; ils ne figurent pas dans le ZIP de code.

Référence de l’alerte restante de développement : https://github.com/advisories/GHSA-vfj7-8cjw-p6xm . Les alertes transitives reflètent plusieurs dépendants du même composant, pas onze failles indépendantes dans le moteur financier.
