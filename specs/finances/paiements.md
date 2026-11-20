# Spec — Finances / Paiements

## Composants couverts
- `finances/paiement-bo/`
- `finances/paiement-groupe/`
- `finances/paiementenattente/`
- `finances/validation-paiements/`
- `finances/validation/`
- `finances/sous-compte/`
- `finances/comptes/`
- `finances/suivi-comptes/`

---

## Modèle de crédit client

### Création du crédit
- Créé lors de l'approbation de la commande
- `soldeLiquide` = montant commande - paiements déjà reçus

### Mise à jour à la livraison
- Si livraison partielle : le crédit est ajusté (réduction de la dette)
- Si excédent payé (client a payé plus que livré) : l'excédent va en **sous-compte** (`sousSoldeLiquide`)

---

## Sous-comptes

### Règles de création
- Un sous-compte est créé automatiquement si un excédent est détecté à la livraison
- Il est lié au client via `codeClient` + `clientType`

### Champs
| Champ | Description |
|-------|-------------|
| `sousSoldeLiquide` | Excédent en argent |
| `sousSoldeEmballage` | Excédent en emballage |
| `totalSousSolde` | sousSoldeLiquide + sousSoldeEmballage |

---

## Transactions paiement

### Motifs
| Motif | Contexte |
|-------|---------|
| `COMMANDE CLIENT` | Paiement lié à une commande client |
| `COMMANDE GRATUITE` | Paiement lié à une commande gratuite |
| `CONSIGNE` | Retour/vente d'emballage (COMPTANT ou APPOINTMENT+IMMEDIATE) |

### Statuts
| Statut | Description |
|--------|-------------|
| `EN_ATTENTE` | Paiement déclaré, non validé |
| `EN_COURS` | En cours de traitement |
| `PAYE` | Validé par la comptabilité |
| `ANNULE` | Annulé |

### Règle annulation à la livraison
- Si `montantTotalPercu > montantLivré` → les paiements EN_ATTENTE excédentaires sont annulés ou réduits (du plus récent au plus ancien)

---

## Validation paiements (back office)

- La comptabilité valide les paiements EN_ATTENTE → statut PAYE
- La validation d'un paiement CONSIGNE réduit le `soldeEmballage` du client
