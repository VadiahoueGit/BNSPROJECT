# Specs — BNSPROJECT (Frontend)

Ce dossier contient les spécifications fonctionnelles de chaque composant Angular.
Chaque fichier décrit la logique métier, les règles de validation, les états possibles et les appels API du composant.

**Règle :** avant de modifier un composant, lire son spec. Avant de corriger un bug, vérifier que le correctif ne contredit pas une règle documentée ici.

## Structure

| Dossier | Module |
|---------|--------|
| `activites/` | Commandes clients, livraisons, retours, vente chine, vente dépôt |
| `achats/` | Commandes fournisseurs, réception marchandise, validation |
| `finances/` | Paiements, validation, comptabilité, sous-comptes |
| `stocks/` | Mouvements, inventaire, transferts |
| `parametre/` | Articles, emballages, liquides, prix, utilisateurs |
| `partenaires/` | Revendeurs, fournisseurs, clients OSR |
| `donnees-de-references/` | Dépôts, zones, localités, groupes clients |
| `shared/` | Composants partagés, utilitaires |
