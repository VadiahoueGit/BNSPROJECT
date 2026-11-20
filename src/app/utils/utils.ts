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
  VALIDEE = 'Validée',
  REJETEE = 'Rejetée'
}

// Motifs de rejet proposés à l'agent lors du rejet d'une commande client en attente de
// validation — liste figée, pas de CRUD admin pour l'instant (cf. décision produit).
export const MOTIFS_REJET_COMMANDE: string[] = [
  'Erreur de prix',
  'Stock insuffisant',
  'Informations client incorrectes',
  'Litige en cours avec le client',
  'Doublon de commande',
  'Autre',
];

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
  EN_COURS = 'Encours',
  INVENTAIRE = 'Inventaire',
  TERMINE = 'Terminé',
  PAYE = 'Payé',
  RECUE = 'Reçue'
}
export enum TypeSource {
  ENTREE_GRATUITE = 'ENTREE_GRATUITE',
  COMMANDE = 'COMMANDE'
}

export type ActionPermission = 'voir' | 'creer' | 'modifier' | 'supprimer';

// Autorisations définies indépendamment par module et par action (voir/créer/modifier/supprimer).
// `action` par défaut à 'voir' pour ne pas casser les appels existants qui ne gèrent que la
// visibilité d'un écran/lien de menu.
export function hasPermission(existingPermissionName: string, action: ActionPermission = 'voir'): boolean {
  const raw = localStorage.getItem(storage_keys.STOREUser);

  try {
    const bytes = CryptoJS.AES.decrypt(raw || '', 'secret');
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);

    const user = JSON.parse(decryptedData || '{}');
    const rolePermissions: any[] = user?.role?.rolePermissions || [];
    const flagKey = 'peut' + action.charAt(0).toUpperCase() + action.slice(1);
    return rolePermissions.some(rp => rp.name === existingPermissionName && !!rp[flagKey]);
  } catch (e) {
    return false;
  }

}



export function isAdminRole(): boolean {
  const raw = localStorage.getItem(storage_keys.STOREUser);
  try {
    const bytes = CryptoJS.AES.decrypt(raw || '', 'secret');
    const user = JSON.parse(bytes.toString(CryptoJS.enc.Utf8) || '{}');
    const roleName: string = user?.role?.name || '';
    return roleName === 'ADMIN' || roleName === 'Super admin';
  } catch { return false; }
}

// Seul le dépôt hôte (ex: Bingerville) peut agir pour le compte d'un autre dépôt (choisir un
// dépôt différent du sien sur un filtre ou un formulaire). Le backend impose déjà cette règle
// pour chaque écran concerné ; ceci ne sert qu'à adapter l'UI (masquer/désactiver le sélecteur).
export function isDepotHote(): boolean {
  const raw = localStorage.getItem(storage_keys.STOREUser);
  try {
    const bytes = CryptoJS.AES.decrypt(raw || '', 'secret');
    const user = JSON.parse(bytes.toString(CryptoJS.enc.Utf8) || '{}');
    return !!user?.depot?.hote;
  } catch { return false; }
}

// Dépôt de l'utilisateur connecté, pour pré-sélectionner/verrouiller un sélecteur de dépôt
// sur un formulaire quand l'utilisateur n'est pas rattaché au dépôt hôte (cf. isDepotHote).
export function getUserDepot(): any | null {
  const raw = localStorage.getItem(storage_keys.STOREUser);
  try {
    const bytes = CryptoJS.AES.decrypt(raw || '', 'secret');
    const user = JSON.parse(bytes.toString(CryptoJS.enc.Utf8) || '{}');
    return user?.depot || null;
  } catch { return null; }
}

export function calculeDateEcheance(date: string, delai: number): Date | null {
  const dateCreation = new Date(date);

  if (isNaN(dateCreation.getTime()) || delai === null || delai === undefined) {
    return null;
  }

  dateCreation.setDate(dateCreation.getDate() + delai);
  return dateCreation;
}
