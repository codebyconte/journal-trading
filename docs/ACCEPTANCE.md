# Critères d'acceptation — phase 1

| Fonction | Critère concret | Vérification |
|---|---|---|
| Migration | Un ancien journal et son capital survivent aux migrations additives | Test PGlite avec données sentinelles |
| Grand livre | Sorties partielles, coûts et shorts corrects ; surclôture refusée ; R initial stable | Tests finance + script integration |
| Risque | Multiplicateur/conversion explicites, arrondi inférieur, marge distincte du risque | Tests finance, page Gestion du risque |
| Idempotence | Répéter une requête ne double pas position, événement ou évaluation | Scripts API |
| Analyses | Chaque sauvegarde crée une révision ; conflit concurrent refusé | Script integration |
| Décision | Aucun P&L dans la grille ; une donnée manquante reste insuffisante ; abstention admise | Tests learning + saisie vérifiée au navigateur |
| Preuves | Critère évalué/non applicable justifié ; source et version existantes obligatoires | Schémas + script learning-check |
| Corrections | Original intact, lien conservé, double correction refusée | Tests learning + script learning-check |
| Biais de résultat | Sortie/valorisation/résultat connu entraîne classement rétrospectif | Script learning-check |
| Erreurs | Exemples consultables, dédoublonnage par décision, infirmation conservée | Tests learning |
| Actions | Critère, compétence et échéance obligatoires ; preuve existante ; version précise liée | Script learning-check |
| Comparaison | Correction tardive ne déplace pas l'observation initiale après l'entraînement | Test learning |
| Bilans | Revues libres/hebdo/mensuelles/trimestrielles versionnées ; compteurs descriptifs | Interface et moteur de documents partagé |
| Sauvegarde | JSON conserve événements, révisions, imports et évaluations ; restauration non destructive | Script restore-check |
| CSV | Identifiants conservés, doublons reconnus, dates ambiguës refusées | Tests import + script integration |
| Accès privé | Production sans session refusée, cookie altéré refusé, POST autre origine refusé | Script auth-check sur base temporaire |
| Interface | Navigation principale et enregistrement d'une évaluation, affichage mobile | Vérification navigateur ; pas une couverture E2E exhaustive |

Les scripts d'intégration ajoutent uniquement des fixtures aux bases de test. Les vérifications ne certifient pas un avantage financier et ne constituent pas un audit de sécurité indépendant. Un test automatique pour chaque variante visuelle n'est pas fourni.

## Critères multi-actifs

| Fonction | Critère | Contrôle |
|---|---|---|
| Contrats | Un instrument nouveau et une nouvelle classe se créent sans code ; multiplier/pas figés dans chaque position | API multiasset, saisie TESTBOND au navigateur |
| Comptes | EUR/USD distincts, apports idempotents, changement de devise après utilisation refusé | Suite API |
| Saisie imparfaite | SOL sans stop et hors stratégie accepté ; risque et R inconnus | Unitaires/API ; XAUUSD au navigateur |
| Coûts inconnus | Le net n’est pas inventé ; réconciliation explicite requise | Tests finance |
| Change | EURUSD et USDJPY utilisent des conversions explicites ; pas de défaut 1 entre devises distinctes | Unitaires/API |
| Corrections | Original conservé, recalcul exact, surclôture refusée | Unitaires/API |
| Sources | Actifs, type, thème et preuve filtrables ; recherches personnelles versionnées et citations figées | API/navigateur |
| Archivage | Motif requis, restauration possible, archives incluses dans le JSON | API/restore |
| Analytics | Comptes, instruments, actifs, stratégies, dates et environnements filtrables ; résultats incomplets exclus et signalés | API/navigateur |
| Mobile | Aucun débordement horizontal sur les 9 routes inspectées à 390 px | Navigateur |
| CI | Contrôles financiers, migrations/API/auth, production et parcours Chromium prévus | Workflow livré ; exécution distante non réalisée |
