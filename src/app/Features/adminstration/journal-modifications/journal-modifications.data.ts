// Types du journal des modifications.
//
// Les entrées elles-mêmes vivent côté API (bns_api/src/journal/journal.data.ts) : c'est elle qui
// les expose à cet écran et qui les envoie par mail, donc elle en est la seule source. Ce fichier
// ne garde que la forme des données.

export type StatutModification = 'Déployé' | 'En attente';
export type PerimetreModification = 'API' | 'Back-office' | 'Mobile';
export type TypeModification = 'Ajout' | 'Correction' | 'Amélioration';

export interface Modification {
  date: string;              // AAAA-MM-JJ : date de la modification
  titre: string;
  type: TypeModification;
  perimetre: PerimetreModification;
  module: string;
  description: string;
  // Demande d'origine : affichée à l'écran pour la traçabilité, mais jamais reprise dans les
  // envois par mail.
  demande?: string;
  statut: StatutModification;
  deployeLe?: string;        // AAAA-MM-JJ : mise en ligne sur l'environnement de test
  fichiers: string[];
}
