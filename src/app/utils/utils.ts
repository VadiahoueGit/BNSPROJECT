import {storage_keys} from "../Features/shared-component/utils";
import * as CryptoJS from 'crypto-js';

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

export function hasPermission(existingPermissionName: string): boolean {
  const raw = localStorage.getItem(storage_keys.STOREUser);

  try {
    const bytes = CryptoJS.AES.decrypt(raw || '', 'secret');
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);

    const user = JSON.parse(decryptedData || '{}');
    const allPermissions: any[] = user?.profil?.permissions || [];
    return allPermissions.some(p => p.name === existingPermissionName);
  } catch (e) {
    return false;
  }

}



export function calculeDateEcheance(date: string, delai: number): Date | null {
  const dateCreation = new Date(date);

  if (isNaN(dateCreation.getTime()) || delai === null || delai === undefined) {
    return null;
  }

  dateCreation.setDate(dateCreation.getDate() + delai);
  return dateCreation;
}
