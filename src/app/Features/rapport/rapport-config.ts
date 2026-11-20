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
  defaultValue?: any;
  hidden?: boolean;
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
  { id: 'activites',  label: 'Activités',   icone: 'fas fa-calendar-check',couleur: 'green',  description: 'Suivi des visites et activités commerciales' },
  { id: 'emballages', label: 'Emballages',  icone: 'fas fa-box-open',      couleur: 'teal',   description: 'Suivi des retours et mouvements d\'emballages' },
];

export const RAPPORTS: RapportConfig[] = [

  // ─── VENTES ──────────────────────────────────────────────────────────────
  {
    id: 'ventes-generales-sap',
    titre: 'Ventes générales avec numéro SAP',
    sousTitre: 'Ventes Chine + commandes revendeurs par dépôt, agent et produit',
    icone: 'fas fa-receipt',
    couleur: 'blue',
    categorie: 'ventes',
    procedure: 'sp_ventes_generales_sap',
    filtres: [],
    colonnes: [],
    colonnesDynamiques: true,
    colonnesFixees: [
      { key: 'depot',      label: 'Dépôt',   type: 'text',  align: 'left'   },
      { key: 'agent',      label: 'Agent',   type: 'text',  align: 'left'   },
      { key: 'numero_sap', label: 'N° SAP',  type: 'text',  align: 'left'   },
      { key: 'type',       label: 'Type',    type: 'badge', align: 'center',
        badgeMap: { 'Vente Chine': 'info', 'Revendeur': 'success' } },
    ],
    colonnesExclure: [],
    colonnesTotaux: true,
    kpis: [
      { key: '_totalClients',     label: 'Lignes',        icone: 'fas fa-list',      type: 'number', couleur: 'blue'   },
      { key: '_totalDepots',      label: 'Dépôts',        icone: 'fas fa-warehouse', type: 'number', couleur: 'orange' },
      { key: '_totalCasiers',     label: 'Total casiers', icone: 'fas fa-boxes',     type: 'number', couleur: 'teal'   },
    ],
  },

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

  // ─── ACTIVITÉS ───────────────────────────────────────────────────────────
  {
    id: 'ventes-clients-visites',
    titre: 'Ventes par clients visités',
    sousTitre: 'Commandes passées par les clients visités par commercial sur la période',
    icone: 'fas fa-route',
    couleur: 'blue',
    categorie: 'activites',
    procedure: 'sp_ventes_clients_visites',
    filtres: [],
    colonnes: [],
    colonnesDynamiques: true,
    colonnesFixees: [
      { key: 'commercial',         label: 'Commercial',         type: 'text',   align: 'left'  },
      { key: 'depot',              label: 'Dépôt',              type: 'text',   align: 'left'  },
      { key: 'client',             label: 'Client',             type: 'text',   align: 'left'  },
      { key: 'nombre_visites',     label: 'Visites assignées',  type: 'number', align: 'right' },
      { key: 'visites_effectuees', label: 'Visites effectuées', type: 'number', align: 'right' },
    ],
    colonnesExclure: ['client_id'],
    colonnesTotaux: true,
    kpis: [
      { key: '_totalClients',      label: 'Clients',             icone: 'fas fa-store',          type: 'number', couleur: 'blue'   },
      { key: 'nombre_visites',     label: 'Total visites',       icone: 'fas fa-calendar-alt',   type: 'number', couleur: 'orange' },
      { key: 'visites_effectuees', label: 'Visites effectuées',  icone: 'fas fa-calendar-check', type: 'number', couleur: 'green'  },
      { key: '_totalCasiers',      label: 'Total casiers',       icone: 'fas fa-boxes',          type: 'number', couleur: 'teal'   },
    ],
  },

  {
    id: 'visites-combo',
    titre: 'Visites assignées vs terminées',
    sousTitre: 'Comparatif visites assignées et terminées par commercial sur la période',
    icone: 'fas fa-calendar-check',
    couleur: 'green',
    categorie: 'activites',
    procedure: 'sp_visites_combo',
    filtres: [],
    colonnes: [
      { key: 'commercial',               label: 'Commercial', type: 'text',   align: 'left'  },
      { key: 'email',                    label: 'Email',      type: 'text',   align: 'left'  },
      { key: 'nombre_visites_assignees', label: 'Assignées',  type: 'number', align: 'right' },
      { key: 'nombre_visites_terminees', label: 'Terminées',  type: 'number', align: 'right' },
    ],
    colonnesTotaux: true,
    kpis: [
      { key: '_totalClients',            label: 'Commerciaux',     icone: 'fas fa-user-tie',       type: 'number', couleur: 'blue'   },
      { key: 'nombre_visites_assignees', label: 'Total assignées', icone: 'fas fa-calendar-plus',  type: 'number', couleur: 'orange' },
      { key: 'nombre_visites_terminees', label: 'Total terminées', icone: 'fas fa-calendar-check', type: 'number', couleur: 'green'  },
    ],
  },

  // ─── FINANCES ────────────────────────────────────────────────────────────
  {
    id: 'rapport-financier',
    titre: 'Rapport financier',
    sousTitre: 'Montants attendus, encaissés et validés — par commercial, client ou en détail',
    icone: 'fas fa-sack-dollar',
    couleur: 'purple',
    categorie: 'finances',
    procedure: 'sp_rapport_financier',
    filtres: [
      {
        key: 'mode',
        label: 'Vue',
        type: 'select',
        defaultValue: 'TOUS',
        options: [
          { label: 'Tous',                 value: 'TOUS'       },
          { label: 'Par commercial',       value: 'COMMERCIAL' },
          { label: 'Par client',           value: 'CLIENT'     },
          { label: 'Détail transactions',  value: 'DETAIL'     },
        ],
        required: true,
      },
      {
        key: 'commercialId',
        label: 'Commercial',
        type: 'select',
        defaultValue: null,
        hidden: true,
      },
    ],
    colonnes: [],
    colonnesDynamiques: true,
    colonnesFixees: [],
    colonnesExclure: ['transaction_id', 'commercial_id'],
    colonnesTotaux: true,
    kpis: [
      { key: '_totalClients',    label: 'Lignes',           icone: 'fas fa-list',              type: 'number',   couleur: 'blue'   },
      { key: 'montant_attendu',  label: 'Montant attendu',  icone: 'fas fa-clock',             type: 'currency', couleur: 'orange' },
      { key: 'montant_encaisse', label: 'Montant encaissé', icone: 'fas fa-hand-holding-usd',  type: 'currency', couleur: 'green'  },
      { key: 'montant_valide',   label: 'Montant validé',   icone: 'fas fa-check-circle',      type: 'currency', couleur: 'purple' },
    ],
  },

  // ─── EMBALLAGES ──────────────────────────────────────────────────────────
  {
    id: 'emballages-rendus',
    titre: 'Emballages rendus',
    sousTitre: 'Emballages rendus par commercial et revendeur sur la période',
    icone: 'fas fa-box-open',
    couleur: 'teal',
    categorie: 'emballages',
    procedure: 'sp_rapport_emballages_rendus',
    filtres: [
      {
        key: 'mode',
        label: 'Vue',
        type: 'select',
        defaultValue: 'DETAIL',
        options: [
          { label: 'Détail (ligne par ligne)', value: 'DETAIL'     },
          { label: 'Résumé par commercial',    value: 'COMMERCIAL' },
          { label: 'Résumé par revendeur',     value: 'REVENDEUR'  },
        ],
        required: true,
      },
    ],
    colonnes: [],
    colonnesDynamiques: true,
    colonnesFixees: [
      { key: 'commercial',  label: 'Commercial',  type: 'text', align: 'left' },
      { key: 'status',      label: 'Statut',      type: 'text', align: 'left' },
      { key: 'type_client', label: 'Type client', type: 'text', align: 'left' },
      { key: 'client',      label: 'Client',      type: 'text', align: 'left' },
    ],
    colonnesExclure: ['retour_id'],
    colonnesTotaux: true,
    kpis: [
      { key: '_totalClients',  label: 'Lignes',         icone: 'fas fa-list',  type: 'number', couleur: 'blue' },
      { key: '_totalCasiers',  label: 'Total casiers',  icone: 'fas fa-boxes', type: 'number', couleur: 'teal' },
    ],
  },

  // ─── STOCKS / TARIFS ─────────────────────────────────────────────────────
  {
    id: 'liste-prix',
    titre: 'Liste des prix',
    sousTitre: 'Prix liquide par produit et par type de prix',
    icone: 'fas fa-tags',
    couleur: 'green',
    categorie: 'stocks',
    procedure: 'sp_liste_prix',
    filtres: [],
    colonnes: [],
    colonnesDynamiques: true,
    colonnesFixees: [
      { key: 'reference', label: 'Référence', type: 'text',   align: 'left'  },
      { key: 'libelle',   label: 'Libellé',   type: 'text',   align: 'left'  },
      { key: 'format',    label: 'Format',    type: 'text',   align: 'center' },
    ],
    colonnesExclure: [],
    colonnesTotaux: false,
    kpis: [
      { key: '_totalClients', label: 'Produits', icone: 'fas fa-box', type: 'number', couleur: 'blue' },
    ],
  },

];
