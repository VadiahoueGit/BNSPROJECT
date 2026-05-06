export type FiltreType = 'date' | 'text' | 'select' | 'select-multi';
export type ColonneType = 'text' | 'number' | 'currency' | 'date' | 'badge' | 'percent';
export type CouleurType = 'green' | 'blue' | 'orange' | 'red' | 'purple' | 'teal';

export interface FiltreConfig {
  key: string;
  label: string;
  type: FiltreType;
  options?: { label: string; value: any }[];
  placeholder?: string;
  required?: boolean;
}

export interface ColonneConfig {
  key: string;
  label: string;
  type?: ColonneType;
  align?: 'left' | 'center' | 'right';
  badgeMap?: Record<string, 'success' | 'danger' | 'warning' | 'info'>;
  width?: string;
}

export interface KpiConfig {
  key: string;
  label: string;
  icone: string;
  type?: 'currency' | 'number' | 'text';
  couleur?: CouleurType;
}

export interface RapportConfig {
  id: string;
  titre: string;
  sousTitre: string;
  icone: string;
  couleur: CouleurType;
  categorie: string;
  procedure: string;
  filtres: FiltreConfig[];
  colonnes: ColonneConfig[];
  kpis?: KpiConfig[];
  // Pour les rapports à colonnes dynamiques (pivot)
  colonnesDynamiques?: boolean;
  colonnesFixees?: ColonneConfig[];   // colonnes toujours présentes (affichées en premier)
  colonnesExclure?: string[];         // clés à masquer (ex: client_id)
  colonnesTotaux?: boolean;           // affiche une ligne TOTAL en bas du tableau
}

export interface CategorieRapport {
  id: string;
  label: string;
  icone: string;
  couleur: string;
  description: string;
}

export const CATEGORIES_RAPPORT: CategorieRapport[] = [
  { id: 'ventes',     label: 'Ventes',      icone: 'fas fa-chart-line',    couleur: 'blue',   description: 'Rapports sur les ventes et commandes clients' },
  { id: 'finances',   label: 'Finances',    icone: 'fas fa-sack-dollar',   couleur: 'purple', description: 'Rapports financiers et comptables' },
  { id: 'stocks',     label: 'Stocks',      icone: 'fas fa-warehouse',     couleur: 'green',  description: 'État et mouvements de stock' },
  { id: 'achats',     label: 'Achats',      icone: 'fas fa-shopping-cart', couleur: 'orange', description: 'Rapports sur les achats fournisseurs' },
  { id: 'clients',    label: 'Clients',     icone: 'fas fa-users',         couleur: 'red',    description: 'Analyses clients et partenaires' },
  { id: 'livraisons', label: 'Livraisons',  icone: 'fas fa-truck',         couleur: 'teal',   description: 'Suivi des livraisons et tournées' },
];

export const RAPPORTS: RapportConfig[] = [

  // ─── VENTES ──────────────────────────────────────────────────────────────
  {
    id: 'vente-client-article',
    titre: 'Vente par client par article',
    sousTitre: 'Quantités vendues par client et par produit BNS sur la période',
    icone: 'fas fa-shopping-basket',
    couleur: 'blue',
    categorie: 'ventes',
    procedure: 'sp_vente_client_article',
    filtres: [],  // date_debut / date_fin sont toujours présents dans le viewer
    colonnes: [], // vides — extraites dynamiquement depuis les données
    colonnesDynamiques: true,
    colonnesFixees: [
      { key: 'commercial', label: 'Commercial', type: 'text', align: 'left' },
      { key: 'depot',      label: 'Dépôt',      type: 'text', align: 'left' },
      { key: 'client',     label: 'Client',      type: 'text', align: 'left' },
    ],
    colonnesExclure: ['client_id'],
    colonnesTotaux: true,
    kpis: [
      { key: '_totalClients',      label: 'Clients',      icone: 'fas fa-store',    type: 'number', couleur: 'blue'   },
      { key: '_totalCommerciaux',  label: 'Commerciaux',  icone: 'fas fa-user-tie', type: 'number', couleur: 'green'  },
      { key: '_totalDepots',       label: 'Dépôts',       icone: 'fas fa-warehouse',type: 'number', couleur: 'orange' },
      { key: '_totalCasiers',      label: 'Total casiers', icone: 'fas fa-boxes',   type: 'number', couleur: 'teal'   },
    ],
  },

];
