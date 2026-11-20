# Spec — Gestion des retours

## Composants couverts
- `gestion-des-retours/` (parent)
- `consigne/`
- `ecart-emballage/`
- `list-des-receptions-emballages/`
- `receptions-emballages/`
- `regroupement-emballages/`
- `retour-plein/`
- `suivi-des-rdv/`

---

## list-des-receptions-emballages

**Rôle :** Afficher et gérer les retours d'emballages regroupés par agent (transporteur ou commercial).

### Cycle de vie d'un groupe
1. `Encours` → l'agent collecte les retours sur le terrain
2. `Inventaire` → le ramassage est terminé, le dépôt fait l'inventaire physique
3. `Terminé` → inventaire validé

### Règles UI
- Bouton **"Terminer le ramassage"** : visible uniquement si `regroupementStatut === 'Encours'`
- Bouton **"Enregistrer l'inventaire"** : visible si `inventaires.length === 0`, désactivé si statut ≠ `'Inventaire'` OU si tous les champs "Total physique" ne sont pas renseignés
- Inputs "Total physique" : désactivés si `inventaires.length > 0` OU si statut ≠ `'Inventaire'`
- Couleur input : rouge si `receivedQuantity ≠ expectedQuantity`, vert si égal

### Règle inventaireComplet
Le bouton d'enregistrement est bloqué tant qu'un seul article a `receivedQuantity` null ou undefined.

### extractAllArticles — règles de déduplication
- Un Map par `productCode` est utilisé pour éviter les doublons
- Les articles avec `prixUnitaire === 0` sont ignorés **sauf** s'ils sont source d'un interchange
- Les interchanges ajoutent des détails `IN`/`OUT` sans créer de ligne supplémentaire dans la map si le code existe déjà

### Calcul du regroupement palette (calculate)
- `regroupementFinal` doit être réinitialisé à `{}` avant chaque appel (sinon accumulation entre deux impressions)
- Formule : `palettes = floor(totalCasiers / casiers_par_palette)`, `casier = totalCasiers % casiers_par_palette`
- La règle palette est cherchée par : fournisseur spécifique d'abord, puis règle générique, puis premier match sur le type

### PrintDoc
- Filtre les articles à `prixUnitaire > 0` avant le calcul
- Appelle `GetRetourWithArtilesListAgentPdf` avec le résultat du regroupement

---

## regroupement-emballages

**Rôle :** Afficher les retours individuels et permettre l'impression du bordereau de regroupement palette.

### Différences avec list-des-receptions-emballages
- Pas de notion d'agent : chaque ligne = un retour individuel
- L'impression appelle `GetRegroupementEmballagePdf` (endpoint différent)
- Pas d'inventaire physique ici

---

## consigne

**Rôle :** Afficher les transactions CONSIGNE EN_ATTENTE liées aux retours d'emballages.

### Règle métier consigne
- Une consigne est créée uniquement pour les retours COMPTANT (vente d'emballage) et APPOINTMENT (avec partie IMMEDIATE)
- Les retours IMMEDIATE purs ne génèrent **pas** de ligne consigne

---

## retour-plein

**Rôle :** Gérer les retours de bouteilles pleines (produit non conforme ou refusé).

---

## suivi-des-rdv

**Rôle :** Afficher les retours de type APPOINTMENT et permettre leur transformation en retour IMMEDIATE lors du rendez-vous.
