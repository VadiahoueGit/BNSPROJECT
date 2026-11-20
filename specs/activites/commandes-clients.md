# Spec — Commandes clients

## Composants couverts
- `commandes-clients/`
- `saisie-commande/`
- `suivi-commande/`
- `validation-commande/`
- `vente-au-depot/`

---

## saisie-commande

**Rôle :** Créer une commande client depuis le back office.

### Règles de saisie
- Le client (revendeur ou point de vente) doit être sélectionné avant d'ajouter des articles
- Le prix est lié au groupe client (type prix)
- Les articles sans prix valide ne peuvent pas être ajoutés
- La quantité doit être > 0

### Types de client
- `revendeur` : client grossiste
- `pointDeVente` : détaillant lié à un commercial

---

## vente-au-depot

**Rôle :** Enregistrer une vente directe au dépôt (client vient chercher sa commande).

### Spécificités
- Pas de livraison programmée
- Le paiement est immédiat (ou en attente selon le mode)
- Le stock est débité immédiatement

---

## suivi-commande

**Rôle :** Visualiser le statut des commandes en cours.

### Statuts commande
| Statut | Description |
|--------|-------------|
| `EN_ATTENTE` | Créée, pas encore approuvée |
| `APPROUVEE` | Validée par le responsable |
| `EN_COURS` | En cours de livraison |
| `LIVREE` | Livrée au client |
| `ANNULEE` | Annulée |

---

## validation-commande

**Rôle :** Approuver ou rejeter une commande créée.

### Effets de l'approbation
- Création du crédit client (soldeLiquide += montant commande - paiements déjà enregistrés)
- Statut passe à `APPROUVEE`
