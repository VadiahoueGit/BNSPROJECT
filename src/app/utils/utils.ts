export enum StatutCommande {
  ATTENTE_VALIDATION = 'Attente de Validation',
  PLANIFICATION_LIVRAISON = 'Planification de Livraison',
  ATTENTE_LIVRAISON = 'Attente Livraison',
  COMMANDE_LIVREE = 'Commande Livrée',
  APPROUVEE = 'Approuvée',
  NON_APPROUVEE = 'Non approuvée',
  NON_REGROUPE= 'Non regroupé'
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
  TERMINE ='TERMINE',
  PAYE = 'Payé'
}



export function calculeDateEcheance(date: string, delai: number): Date |null {
    const dateCreation = new Date(date);
  
    if (isNaN(dateCreation.getTime()) || delai === null || delai === undefined) {
      return null;
    }
  
    dateCreation.setDate(dateCreation.getDate() + delai);
    return dateCreation;
  }
