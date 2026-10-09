# Contenu, preuves et hypothèses de conception

Le protocole v0 et ses références restent sous `archive/`, explicitement non vérifiés et non exécutables. La page Sources expose l'audit ciblé : règles contradictoires (arrêt hebdomadaire 5 %/10 %, checklist 7/8 ou 8/8), statistiques promotionnelles sans référence primaire précise, confusion entre risque, marge et liquidation. Les seuils personnels actuels sont des paramètres modifiables.

Hurst, Ooi et Pedersen, *A Century of Evidence on Trend-Following Investing* (2017), est une recherche identifiable sur le trend following multi-marchés. Elle ne démontre pas la rentabilité de la stratégie discrétionnaire EMA200/BBW crypto 4H de l'utilisateur : https://www.aqr.com/insights/research/journal-article/a-century-of-evidence-on-trend-following-investing

Les chiffres attribués à Edgewonk (23 %, 37 %, 50 000 trades), CryptoQuant (73 %), RSI (68 % contre 54 %) et transferts internes (30–40 %) n'ont pas été rattachés à une publication primaire précise lors de la vérification ciblée. Ils sont retirés des règles actives. « Non vérifié » ne signifie pas « réfuté ».

## Apprentissage et jugement

Baron et Hershey (1988), *Outcome Bias in Decision Evaluation*, étudient l'influence du résultat sur l'évaluation d'une décision : https://bear.warrington.ufl.edu/brenner/mar7588/Papers/baron-hershey-jpsp1988.pdf

La séparation processus/résultat s'inspire de ce problème établi expérimentalement. Le formulaire ne garantit pas une évaluation en aveugle : le trader peut déjà connaître l'issue. Le logiciel conserve cette limite et l'horodatage.

Macnamara, Hambrick et Oswald (2014), méta-analyse sur pratique délibérée et performance : https://www.psychologicalscience.org/journals/psychological-science/0956797614535810/ ; corrigendum : https://journals.sagepub.com/doi/10.1177/0956797618769891 . L'association varie selon les domaines et n'établit pas que ce journal améliore causalement la rentabilité d'un trader. Définitions et mesures font également débat.

**Hypothèses de conception propres au produit** : la grille process-v1, son minimum de deux critères respectés, le seuil de deux situations pour une piste récurrente, les 17 domaines de compétence et le rythme hebdomadaire. Ils sont transparents et révisables ; aucun n'est présenté comme un seuil scientifique de compétence. Les propositions d'exercices sont des consignes personnelles à tester.

Le verdict « processus documenté et cohérent » décrit uniquement les auto-évaluations renseignées. Il ne certifie ni bonne stratégie ni bonne analyse objective. Les pertes associées à une erreur ne sont jamais présentées comme son coût causal ou comme un gain qui aurait été réalisé autrement.

## Données externes et sécurité

Le CSV d'import suit un sous-ensemble explicite des champs de fills documentés par Hyperliquid, pas un format universel garanti pour tous les exports : https://hyperliquid.gitbook.io/Hyperliquid-docs/for-developers/api/info-endpoint . Il n'envoie aucune donnée au courtier.

Next.js a été mis à jour depuis la version ancienne du projet. `npm audit --omit=dev` ne signalait aucune vulnérabilité connue lors de la vérification de cette livraison ; ce n'est pas une garantie de sécurité absolue. Les outils de développement comportent encore des alertes transitives à traiter séparément.

## Dépendances Bitcoin et sources multi-actifs

Les références à Bitcoin subsistant dans les modules courants sont des compétences spécifiques, des ressources étiquetées BTC et des tests. Elles ne conditionnent aucune saisie sur un autre marché. Le schéma Trade historique conserve ses anciens indicateurs pour éviter une perte lors des migrations ; ses anciennes mutations sont retirées. La liste des fichiers retirés est conservée dans retired-files.json et leur contenu dans archive.

Les fiches de Time Series Momentum, A Century of Evidence on Trend-Following Investing et The Golden Dilemma décrivent leur périmètre sans inventer de statistiques ni extrapoler en 4H. Le catalogue institutionnel distingue données officielles, documentation et études ; les nombres d’échantillons et coûts non vérifiés restent inconnus. Checkonchain, VanEck et Grayscale sont conservés avec lien à revérifier. La consultation des résumés/publications ne constitue pas une reproduction indépendante.
