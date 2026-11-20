# Spec — Livraison

**Composant :** `activites/livraison/livraison.component.ts`

---

## Rôle

Gérer la livraison des commandes regroupées. L'agent livreur valide chaque commande sur le terrain via l'app mobile ; le back office supervise et peut livrer manuellement.

---

## Règles métier

### Livraison avec retour simultané (`livrer-avec-retour`)
- Livraison et retour d'emballages dans une seule transaction atomique
- Types de retour supportés : IMMEDIATE, COMPTANT, APPOINTMENT
- Voir spec API : `bns_api/specs/livraison/livrer-avec-retour.md`

### Statuts livraison
| Statut | Description |
|--------|-------------|
| `EN_COURS` | Livraison démarrée |
| `LIVREE` | Commande livrée et signée |
| `ANNULEE` | Livraison annulée |

### Signature BL
- La signature est capturée en base64
- Elle est transmise à `livrer-avec-retour` et enregistrée sur la Livraison
- La signature déclenche en arrière-plan la génération du bon de livraison signé

---

## Règles de stock

- À la livraison, le stock du dépôt est débité des quantités livrées
- Si livraison partielle : seules les quantités réellement livrées sont débitées
- Les emballages retournés en IMMEDIATE sont crédités au stock dépôt immédiatement
