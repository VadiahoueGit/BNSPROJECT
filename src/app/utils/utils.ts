export enum StatutCommande {
  ATTENTE_VALIDATION = 'Attente de Validation',
  PLANIFICATION_LIVRAISON = 'Planification de Livraison',
  ATTENTE_LIVRAISON = 'Attente Livraison',
  COMMANDE_LIVREE = 'Commande Livrée',
  APPROUVEE = 'Approuvée',
  NON_APPROUVEE = 'Non approuvée',
  NON_REGROUPE = 'Non regroupé',
  VALIDEE = 'Validée'
}

export enum TypeCommandeFournisseur {
  BNS_VERS_FOURNISSEUR = 'COMMANDE DEPOT',
  REVENDEUR_VERS_BNS = 'REVENDEUR_VERS_BNS',
  BNS_VERS_REVENDEUR = 'COMMANDE REVENDEUR',
}

export enum MotifRetour {
  APPOINTMENT = 'APPOINTMENT',
  IMMEDIATE = 'IMMEDIATE',
  COMPTANT = 'COMPTANT',
  CONSIGNE = 'CONSIGNE'
}

export enum Status {
  ATTENTE = 'En attente',
  VALIDE = 'Validé',
  TERMINE = 'TERMINE',
  PAYE = 'Payé',
  RECUE = 'Reçue'
}
export enum TypeSource {
  ENTREE_GRATUITE = 'ENTREE_GRATUITE',
  COMMANDE = 'COMMANDE'
}



export function calculeDateEcheance(date: string, delai: number): Date | null {
  const dateCreation = new Date(date);

  if (isNaN(dateCreation.getTime()) || delai === null || delai === undefined) {
    return null;
  }

  dateCreation.setDate(dateCreation.getDate() + delai);
  return dateCreation;
}
