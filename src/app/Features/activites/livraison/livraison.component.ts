import {Component, ViewChild} from '@angular/core';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import {NgxSpinnerService} from 'ngx-spinner';
import {ToastrService} from 'ngx-toastr';
import {Table} from 'primeng/table';
import {ArticleServiceService} from 'src/app/core/article-service.service';
import {UtilisateurResolveService} from 'src/app/core/utilisateur-resolve.service';
import {ALERT_QUESTION} from '../../shared-component/utils';
import {Location} from '@angular/common';
import {CoreServiceService} from '../../../core/core-service.service';

import {LogistiqueService} from '../../../core/logistique.service';
import {ActiviteService} from '../../../core/activite.service';
import {StatutCommande, isDepotHote, getUserDepot} from '../../../utils/utils';

interface RegroupementItem {
  palettes: number;
  casier: number;
  type: string;
}

@Component({
  selector: 'app-livraison',
  templateUrl: './livraison.component.html',
  styleUrls: ['./livraison.component.scss'],
})
export class LivraisonComponent {
  @ViewChild('dt2') dt2!: Table;
  statuses!: any[];
  results: any
  dataList: any[] = [
    {
      refclient: 'test',
      raisonsociale: 'test',
      localite: 'test',
      statut: 'test',
      prenom: 'test',
      nom: 'test',
    },
  ];
  allArticles: any[] = [];
  tableData: any[] = [];
  livraisonForm!: FormGroup;
  loading: boolean = true;
  isModalOpen = false;
  activityValues: number[] = [0, 100];
  operation: string = '';
  searchTerm: string = '';
  updateData: any = {};
  detailPointDevente: any = {};
  articleId: any = 0;
  isEditMode: boolean = false;
  isChoiceModalOpen: boolean = false;
  ListCommande: any = [];
  filteredList: any = [];
  dataListProduits: any = [];
  listZone: any = [];
  listTransporteur: any = [];
  listVehicule: any = [];
  listZoneFiltree: any = [];
  listTransporteurFiltre: any = [];
  listVehiculeFiltre: any = [];
  selectedArticles: any = [];
  items: any = [];
  filteredArticleList: any[] = [];
  commandeList: any[] = [];
  selectedArticle: any = [];
  dataListLiquides: any = [];
  stocksDisponibles: any = {};
  prixLiquide: any = {};
  prixEmballage: any = {};
  prixLiquideTotal: any = {};
  totalLiquide: number = 0;
  totalEmballage: number = 0;
  totalGlobal: number = 0;
  totalQte: number = 0;
  prixEmballageTotal: any = {};
  montantTotal: any = {};
  clients: any = [];
  currentPage: number =1;
  rowsPerPage: any;
  listRevendeurs: any[] = [];
  listRegroupements: any[] = [];
  truckCapacity: number = 0;
  isModalOpenDetail: boolean = false;
  isModalOpenSign: boolean = false;
  isModalOpenRetourPlein: boolean = false;
  isModalRetourPleinCommande: boolean = false;
  isModalAddCommandesOpen: boolean = false;
  selectedRegroupement: any = null;
  filteredListAdd: any[] = [];
  commandesAAjouter: string[] = [];
  searchTermAdd: string = '';
  addModalCapacite: number = 0;
  addModalCargaisonActuelle: number = 0;
  addModalCargaisonAjout: number = 0;
  selectedCommandeRetour: any = null;
  listRaisonsRetour: any[] = [];
  selectedRaisonRetourId: number | null = null;
  totalCasiers: number = 0;
  canContinue: boolean = false;
  cargaison: number = 0;
  format: number = 33;
  signature: null;
  totalPages=0
  regroupementList: any[] = [];
  regroupementTable: any[] = [];
  filterSearch: string = '';
  filterNumero: string = '';
  filterConducteur: string = '';
  filterStatut: string = '';
  filterDateDebut: string = '';
  filterDateFin: string = '';
  filterDepotId: number | null = null;
  isHote = isDepotHote();
  depotList: any[] = [];

  // Filtres du modal "Nouveau regroupement" — appliqués côté client sur ListCommande,
  // distincts des filtres de la liste principale qui eux partent au serveur.
  regrpDepotId: number | null = null;
  regrpZoneIds: number[] = [];
  regrpEtablissement: string = '';
  regrpDate: string = '';
  statutOptions = [
    { value: 'Attente de Validation', label: 'Attente de Validation' },
    { value: 'Non approuvée', label: 'Non approuvée' },
    { value: 'Approuvée', label: 'Approuvée' },
    { value: 'En attente', label: 'En attente' },
    { value: 'Livrée', label: 'Livrée' },
    { value: 'Terminé', label: 'Terminé' },
    { value: 'Annulée', label: 'Annulée' },
  ];

  loadDepotList() {
    if (!this.isHote) return;
    this.coreService.GetDepotList({ paginate: false, page: 1, limit: 0 }).then((res: any) => {
      this.depotList = res.data || [];
    });
  }

  get hasActiveFilters(): boolean {
    return !!(this.filterNumero || this.filterConducteur || this.filterStatut
      || this.filterDateDebut || this.filterDateFin || this.filterDepotId);
  }
  regroupementFinal: {
    [key: string]: Array<{ type: string; palettes: number; casier: number; totalQuantite: number; fournisseurNom?: string | null }>
  } = {};
  result: { palettes: number; casier: number } | null = null;
  casiersPerPalette: Record<number, { casiers: number; type: string; fournisseurId: number | null; fournisseurNom: string | null }[]> = {};


  constructor(
    private articleService: ArticleServiceService,
    private activiteService: ActiviteService,
    private logistiqueService: LogistiqueService,
    private _userSerive: UtilisateurResolveService,
    private coreService: CoreServiceService,
    private _spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private location: Location,
    private toastr: ToastrService
  ) {
  }

  ngOnInit() {
    this.livraisonForm = this.fb.group({
      transporteur: [null, Validators.required],
      vehicule: [null, Validators.required],
    });

    if (this.cargaison >= this.truckCapacity) {
      this.canContinue = false;
    } else {
      this.canContinue = true;
    }

    // Un dépôt non-hôte ne travaille que sur le sien : il est présélectionné et verrouillé, à la
    // fois sur la liste et dans le modal de regroupement (zones, véhicules et chauffeurs filtrés).
    if (!this.isHote) {
      const depotUtilisateur = getUserDepot();
      if (depotUtilisateur?.id) {
        this.filterDepotId = depotUtilisateur.id;
        this.regrpDepotId = depotUtilisateur.id;
      }
    }

    // this.selectedArticle = this.articles[0];
    this.GetRegroupementList(this.currentPage);
    this.loadDepotList();
    this.LoadCasiersPerPalette();
    this.GetRegroupementRules();
    this.GetTransporteurList();
    this.GetVehiculeList();
    this.GetListCommande(1);
    this.GetListZone();
    this.articleService.ListTypeArticles.subscribe((res: any) => {
      this.dataListProduits = res;
      console.log(this.dataListProduits, 'this.dataListProduits ');
    });

    this.GetArticleList(1);
    this.GetRevendeurList(1);
    // this.dataList
  }

  getTotalGeneral(commandes: any): number {
    return commandes.reduce(
      (total: any, commande: any) => total + commande.montantTotal || 0,
      0
    );
  }

  OnViewSign(data: any) {
    this.isModalOpenSign = true
    this.signature = data
  }

  removeCommande(commande: any): void {
    console.log('Retrait de la commande:', commande);

    commande.articles.forEach((article: any) => {
      const format = Number(article?.liquide?.format);
      const type = article?.groupeArticle?.libelle;

      // Vérifie si le format existe dans regroupementFinal
      if (this.regroupementFinal[format]) {
        console.log('AAA:', this.regroupementFinal)
        // Recherche le type dans le format
        const typeEntry = this.regroupementFinal[format].find((entry: any) => entry.type === type);
        if (typeEntry) {
          const casiersToRemove = article.quantite || 0;

          // Retirer la quantité
          typeEntry.casier -= casiersToRemove;  // Réduire la quantité des casiers
          console.log('LISTEN:', typeEntry.casier, casiersToRemove);

          // Si la quantité de casiers devient nulle ou inférieure à zéro, réinitialiser et supprimer l'entrée
          if (typeEntry.casier <= 0) {
            const index = this.regroupementFinal[format].indexOf(typeEntry);
            if (index !== -1) {
              // Réinitialiser le casier avant suppression pour éviter toute accumulation future
              typeEntry.casier = 0;
              typeEntry.palettes = 0;
              this.regroupementFinal[format].splice(index, 1); // Retirer l'article
            }
          } else {
            // Si le casier reste positif, mettre à jour les palettes
            const casiersParPalette = this.casiersPerPalette[format]?.find((el: any) => el.type === type)?.casiers || 0;
            if (casiersParPalette) {
              const palettes = Math.floor(typeEntry.casier / casiersParPalette);
              const casiersRestants = typeEntry.casier % casiersParPalette;

              // Réactualiser les palettes et casiers restants
              typeEntry.palettes = palettes;
              typeEntry.casier = casiersRestants;
            }
          }
        }
      }
      console.log('Après retrait, regroupementFinal:', this.regroupementFinal);
    });
    this.regroupementFinal = JSON.parse(JSON.stringify(this.regroupementFinal));
    this.updateCargaison();
  }

  calculate(commande: any): void {
    if (!this.regroupementFinal) {
      this.regroupementFinal = {};
    }
    this.result = {palettes: 0, casier: 0};

    const articlesParFormatEtType = commande.articles.reduce((acc: any, article: any) => {
      const format = Number(article?.liquide?.format) || 0;
      const type = article?.groupeArticle?.libelle || 'Autre';

      if (!acc[format]) acc[format] = {};
      if (!acc[format][type]) acc[format][type] = [];
      acc[format][type].push(article);
      return acc;
    }, {});

    Object.keys(articlesParFormatEtType).forEach((formatStr: string) => {
      const format = Number(formatStr);

      Object.entries(articlesParFormatEtType[format]).forEach(([type, articles]: [string, any]) => {
        const totalCasiers = articles.reduce(
          (total: number, article: any) => total + Number(article.quantite || 0),
          0
        );

        const fournisseurId = articles[0]?.produit?.fournisseur?.id ?? undefined;
        const regle = this.findRegle(format, type, fournisseurId);

        let palettes = 0;
        let casier = totalCasiers;
        if (regle.casiers) {
          palettes = Math.floor(totalCasiers / regle.casiers);
          casier   = totalCasiers % regle.casiers;
        }

        if (!this.regroupementFinal[format]) {
          this.regroupementFinal[format] = [];
        }

        const existingEntry = this.regroupementFinal[format].find((entry: any) => entry.type === type);
        if (existingEntry) {
          existingEntry.palettes += palettes;
          existingEntry.casier  += casier;
        } else {
          this.regroupementFinal[format].push({ type, palettes, casier, totalQuantite: totalCasiers, fournisseurNom: regle.fournisseurNom });
        }
      });
    });

    // Deep clone pour forcer la détection de changement Angular (keyvalue pipe + *ngFor)
    this.regroupementFinal = JSON.parse(JSON.stringify(this.regroupementFinal));
    this.updateCargaison();
  }

  updateCargaison(): void {
    // Réinitialiser la cargaison à 0
    this.cargaison = 0;

    // Parcours de regroupementFinal pour recalculer la cargaison
    Object.entries(this.regroupementFinal).forEach(([format, entries]: [string, any[]]) => {
      entries.forEach((entry: any) => {
        const casiersParPalette = this.casiersPerPalette[Number(format)]?.find(
          (el: any) => el.type === entry.type
        )?.casiers || 0;

        console.log(`Format: ${format}, Type: ${entry.type}, Palettes: ${entry.palettes}, Casiers: ${entry.casier}`);

        if (casiersParPalette) {
          // Recalcul de la cargaison
          this.cargaison += entry.palettes * casiersParPalette + entry.casier;
        }
      });
    });

    console.log('Cargaison après recalcul:', this.cargaison);
  }

  objectValues(obj: any): any[] {
    return Object.values(obj);
  }


  // Filtres du modal de regroupement : dépôt, zones (multi), établissement et date.
  // Critères cumulatifs ; un critère vide n'exclut rien.
  applyRegroupementFilters(): void {
    const etablissement = this.regrpEtablissement.trim().toLowerCase();

    this.filteredList = this.ListCommande
      .filter((item: any) => {
        if (this.regrpDepotId && item.client?.depot?.id !== this.regrpDepotId) {
          return false;
        }

        if (this.regrpZoneIds?.length && !this.regrpZoneIds.includes(item.client?.zoneDeLivraison?.id)) {
          return false;
        }

        if (etablissement) {
          const nom = `${item.client?.nomEtablissement ?? ''} ${item.client?.raisonSocial ?? ''}`.toLowerCase();
          if (!nom.includes(etablissement)) return false;
        }

        if (this.regrpDate) {
          const dateCommande = new Date(item.createdAt);
          const jour = `${dateCommande.getFullYear()}-${String(dateCommande.getMonth() + 1).padStart(2, '0')}-${String(dateCommande.getDate()).padStart(2, '0')}`;
          if (jour !== this.regrpDate) return false;
        }

        return true;
      })
      .sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  resetRegroupementFilters(): void {
    // Le dépôt d'un utilisateur non-hôte reste imposé, même après réinitialisation
    this.regrpDepotId = this.isHote ? null : (getUserDepot()?.id ?? null);
    this.regrpZoneIds = [];
    this.regrpEtablissement = '';
    this.regrpDate = '';
    this.filtrerOptionsParDepot();
    this.applyRegroupementFilters();
  }

  onRegroupementDepotChange(): void {
    this.filtrerOptionsParDepot();
    this.applyRegroupementFilters();
  }

  // Options proposées dans le modal de regroupement quand un dépôt est sélectionné : uniquement
  // les zones de livraison de ses clients, et les véhicules / transporteurs rattachés à ce dépôt.
  // Sans dépôt sélectionné, tout est proposé.
  filtrerOptionsParDepot(): void {
    const depotId = this.regrpDepotId;

    if (!depotId) {
      this.listZoneFiltree = this.listZone || [];
      this.listTransporteurFiltre = this.listTransporteur || [];
      this.listVehiculeFiltre = this.listVehicule || [];
      return;
    }

    const zoneIdsDuDepot = new Set(
      (this.ListCommande || [])
        .filter((item: any) => item.client?.depot?.id === depotId)
        .map((item: any) => item.client?.zoneDeLivraison?.id)
        .filter((id: any) => !!id)
    );

    this.listZoneFiltree = (this.listZone || []).filter((zone: any) => zoneIdsDuDepot.has(zone.id));
    this.listTransporteurFiltre = (this.listTransporteur || []).filter((item: any) => item.depot?.id === depotId);
    this.listVehiculeFiltre = (this.listVehicule || []).filter((item: any) => item.depot?.id === depotId);

    // Les sélections qui ne font plus partie du dépôt sont abandonnées
    this.regrpZoneIds = (this.regrpZoneIds || []).filter((id: number) => zoneIdsDuDepot.has(id));

    const transporteurId = this.livraisonForm?.controls['transporteur']?.value;
    if (transporteurId && !this.listTransporteurFiltre.some((item: any) => item.id === transporteurId)) {
      this.livraisonForm.controls['transporteur'].setValue(null);
    }

    const vehiculeId = this.livraisonForm?.controls['vehicule']?.value;
    if (vehiculeId && !this.listVehiculeFiltre.some((item: any) => item.id === vehiculeId)) {
      this.livraisonForm.controls['vehicule'].setValue(null);
    }
  }

  get hasRegroupementFilters(): boolean {
    return !!(this.regrpDepotId || this.regrpZoneIds?.length || this.regrpEtablissement || this.regrpDate);
  }


  getTotalQuantite(articles: any[]): number {
    console.log(articles)
    return articles.reduce(
      (total, article) => total + Number(article.quantite || 0),
      0
    );
  }

  async GetListCommande(page: number) {
    let data = {
      paginate: false,
      page: page,
      limit: 8,
      numeroCommande: '',
      date: '',
      etablissement: '',
      statut: StatutCommande.NON_REGROUPE,
    };
    // this._spinner.show();
    const [commandeClient, commandeGratuite]: [any, any] = await Promise.all([
      this.articleService.GetListCommandeGratuite(data),
      this.articleService.GetListCommandeClient(data),
    ]);
    // Unifier les deux objets dans un seul tableau
    this.ListCommande = [...commandeClient.data, ...commandeGratuite.data];
    console.log('ListCommande', this.ListCommande);
    this.filtrerOptionsParDepot();
    this.applyRegroupementFilters();
    console.log('filteredList', this.filteredList);

    // this._spinner.hide();
  }

  onFilterGlobal(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value;
    this.dt2.filterGlobal(value, 'contains');
  }

  goBack() {
    this.location.back();
  }

  clear(table: Table) {
    table.clear();
  }

  OnCloseModal() {
    this.cargaison = 0;
    this.truckCapacity = 0;
    this.isModalOpen = false;
    this.regroupementTable = [];
    Object.keys(this.tableData).forEach(
      (key) => delete this.regroupementFinal[key]
    );

    console.log('regroupementFinal', this.regroupementFinal);
    this.onCheckboxClear();
    console.log(this.isModalOpen);
  }

  OnCreate() {
    this.regroupementFinal = {};
    this.regroupementTable = []
    this.isEditMode = false;
    this.isModalOpen = true;
    this.operation = 'create';
    this.livraisonForm.reset();
    console.log(this.isModalOpen);
  }

  OnView(data: any) {
    console.log(data, 'regroupement');
    this.updateData = data;
    this.regroupementFinal = {};
    this.isModalOpenDetail = true;
    this.updateData.commandes.forEach((commande: any) => {
      this.calculate(commande);
    })

    this.extractAllArticles(this.updateData.commandes)
  }

  closeDetailModal() {
    this.isModalOpenDetail = false;
    this.regroupementFinal = {};
  }

  OnAnnulerRegroupement(data: any) {
    ALERT_QUESTION(
      'warning',
      'Annuler le regroupement ?',
      `Le véhicule sera libéré et les commandes redeviendront disponibles pour un nouveau regroupement. Cette action est impossible si une commande est déjà en cours ou livrée.`
    ).then((res: any) => {
      if (!res.isConfirmed) return;
      this._spinner.show();
      this.activiteService.AnnulerRegroupement(data.id).then(
        (response: any) => {
          this._spinner.hide();
          if (response.statusCode === 200) {
            this.toastr.success(response.message || 'Regroupement annulé');
            this.GetRegroupementList(this.currentPage);
          } else {
            this.toastr.error(response.message || "Erreur lors de l'annulation");
          }
        },
        (error: any) => {
          this._spinner.hide();
          this.toastr.error(error?.error?.message || "Erreur lors de l'annulation");
        }
      );
    });
  }
  closeDetailSign(){
    this.isModalOpenSign = false;
  }

  getCommandesNonLivrees(): any[] {
    return (this.updateData.commandes || []).filter(
      (c: any) =>
        c.statutCommande !== 'Livrée' &&
        c.statutCommande !== 'Commande Livrée' &&
        c.statutCommande !== 'Retournée' &&
        c.statutLivraison !== 'Annulée'
    );
  }

  isDateDepasse(date: string | Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d < today;
  }

  openRetourPleinModal() {
    this.isModalOpenRetourPlein = true;
  }

  closeRetourPleinModal() {
    this.isModalOpenRetourPlein = false;
  }

  onSubmitRetourPlein() {
    const commandesNonLivrees = (this.updateData.commandes || []).filter(
      (c: any) => c.statutCommande !== 'Livrée' && c.statutCommande !== 'Commande Livrée'
    );
    const vehiculeId = this.updateData.vehicule?.id;

    if (commandesNonLivrees.length === 0) {
      this.toastr.info('Toutes les commandes ont déjà été livrées.');
      return;
    }

    const requests = commandesNonLivrees.map((commande: any) => {
      const depotId = commande.clientInfo?.depot?.id;
      const articles = (commande.articles || []).map((a: any) => ({
        idArticle: a.id,
        quantite: a.quantite,
        prixUnitaireLiquide: a.prixUnitaireLiquide || 0,
        prixUnitaireEmballage: a.prixUnitaireEmballage || 0,
        ...(a.liquide?.code && { codeArticleLiquide: a.liquide.code }),
        ...(a.emballage?.code && { codeArticleEmballage: a.emballage.code }),
      }));
      return this.activiteService.CreateRetourPlein({
        numCommande: commande.numCommande,
        vehiculeId,
        depotId,
        transporteurId: this.updateData.transporteur?.id,
        articles,
      });
    });

    this._spinner.show();
    Promise.all(requests).then(() => {
      this._spinner.hide();
      this.toastr.success('Retours pleins créés avec succès.');
      this.closeRetourPleinModal();
      this.isModalOpenDetail = false;
      this.regroupementFinal = {};
      this.GetRegroupementList(this.currentPage);
    }).catch((err: any) => {
      this._spinner.hide();
      this.toastr.error(err?.error?.message || 'Erreur lors de la création des retours pleins.');
    });
  }
  OnEdit(data: any) {
    this.isEditMode = true;
    console.log(data);
    this.updateData = data;
    this.articleId = data.id;
    this.isModalOpen = true;
    this.loadArticleDetails();
    this.operation = 'edit';

  }
  UploadDoc(item: any) {
    console.log('CLICK UploadDoc');

    this.regroupementTable = [];
    this.regroupementFinal = {}; // 🔥 IMPORTANT reset

    const numRegroupement = item.numRegroupement;

    let regroup = this.regrouperArticles(item.commandes);

    this.calculate(regroup);

    this._spinner.show();

    if (this.regroupementFinal) {
      this.results = Object.entries(this.regroupementFinal).flatMap(([key, value]) => {
        if (!Array.isArray(value)) return [];

        const regroupementParType = value.reduce((acc, item) => {
          const type = item.type ?? "Inconnu";

          if (!acc[type]) {
            acc[type] = { casier: 0, palette: 0 };
          }

          acc[type].casier += item.casier ?? 0;
          acc[type].palette += item.palettes ?? 0;

          return acc;
        }, {} as Record<string, { casier: number, palette: number }>);

        return Object.entries(regroupementParType).map(([type, data]) => ({
          format: Number(key),
          type,
          casier: data.casier,
          palette: data.palette
        }));
      });

      this.activiteService.GetRegroupementPdf(numRegroupement, this.results).then(
        (res: any) => {
          this._spinner.hide();
        },
        (error: any) => {
          this._spinner.hide();
          this.toastr.info(error.error.message);
        }
      );
    }
  }

  regrouperArticles(commandes: any[]): any {
    let articlesRegroupes: any = [];
    let montantTotal = 0;

    // Parcours de toutes les commandes
    commandes.forEach(commande => {
      // Ajouter les articles de chaque commande à la liste des articles regroupés
      commande.articles.forEach((article: any) => {
        articlesRegroupes.push(article);
        montantTotal += parseFloat(article.montantEmballage);
      })
    });

    return {
      articles: articlesRegroupes,
      montantTotal: montantTotal
    };
  }

  GetArticleList(page: number) {
    let data = {
      paginate: false,
      page: page,
      limit: 8,
    };
    // this._spinner.show();
    this.articleService.GetArticleList(data).then((res: any) => {
      console.log('DATATYPEPRIX:::>', res);
      this.dataListLiquides = res.data;
      this.filteredArticleList = this.dataListLiquides;
      // this._spinner.hide();
    });
  }

  GetRevendeurList(page: number) {
    let data = {
      paginate: false,
      page: page,
      limit: 8,
    };
    // this._spinner.show();
    this.articleService.GetListRevendeur(data).then((res: any) => {
      console.log('GetListRevendeur:::>', res);
      this.listRevendeurs = res.data;
      // this._spinner.hide();
    });
  }

  GetRegroupementList(page:any) {
    let data = {
      paginate: false,
      page: page,
      limit: 8,
      statut: this.filterStatut,
      dateDebut: this.filterDateDebut,
      dateFin: this.filterDateFin,
      numero: this.filterNumero,
      conducteur: this.filterConducteur,
      depotId: this.filterDepotId,
    };
    this._spinner.show();
    this.activiteService.GetRegroupementList(data).then((res: any) => {
      console.log('GetRegroupementList:::>', res);
      this.listRegroupements = res.data;
      this.totalPages = res.total;
      if (this.isModalOpenDetail && this.updateData?.id) {
        const updated = res.data.find((r: any) => r.id === this.updateData.id);
        if (updated) {
          this.updateData = updated;
          this.regroupementFinal = {};
          updated.commandes.forEach((commande: any) => this.calculate(commande));
          this.extractAllArticles(updated.commandes);
        }
      }
      this._spinner.hide();
    });
  }

  LoadForm() {
    // this.for
  }

  onSubmit(): void {
    this._spinner.show();
    let data = {
      vehiculeId: this.livraisonForm.controls['vehicule'].value,
      transporteurId: this.livraisonForm.controls['transporteur'].value,
      commandes: this.commandeList,
    };
    this.activiteService.CreationRegroupement(data).then((res: any) => {
      this._spinner.hide();
      if (res.statusCode == 201) {
        this.toastr.success(res.message);
        this.isModalOpen = false;
        this.GetListCommande(1)
        this.GetRegroupementList(1);
      } else {
        this.toastr.error(res.message);
      }
      console.log(res.data);
    });
  }

  selectArticle() {
    this.isEditMode = false;
    this.isChoiceModalOpen = true;
    this.operation = 'create';
    console.log(this.isModalOpen);
  }

  validateQuantite(data: any): void {
    // Vérifier si la quantité saisie dépasse la quantité disponible
    if (data.quantite > this.stocksDisponibles[data.id]) {
      // Réinitialiser la quantité à la quantité disponible
      data.quantite = '';
      // Afficher un message de warning
      this.toastr.warning('La quantité saisie dépasse la quantité disponible.');
    } else {
      this.calculatePrix(data);
    }
  }

  calculatePrix(data: any) {
    if (this.prixLiquideTotal[data.id]) {
      this.totalEmballage -= this.prixEmballageTotal[data.id] || 0;
      this.totalLiquide -= this.prixLiquideTotal[data.id] || 0;
      this.totalGlobal -= this.montantTotal[data.id] || 0;
      this.totalQte -= data.oldQuantite || 0;
    }
    this.prixLiquideTotal[data.id] = data.quantite * this.prixLiquide[data.id];
    this.prixEmballageTotal[data.id] =
      data.quantite * this.prixEmballage[data.id];
    this.montantTotal[data.id] =
      this.prixLiquideTotal[data.id] + this.prixEmballageTotal[data.id];

    this.totalEmballage += this.prixEmballageTotal[data.id];
    this.totalLiquide += this.prixLiquideTotal[data.id];
    this.totalGlobal += this.montantTotal[data.id];
    this.totalQte += data.quantite;

    data.oldQuantite = data.quantite;
    console.log(data);
    console.log(this.totalQte, 'totalQte');
    console.log(this.totalLiquide, 'totalLiquide');
    console.log(this.totalEmballage, 'totalEmballage');
    console.log(this.totalGlobal), 'totalGlobal';
  }

  onCheckboxClear(): void {
    this.filteredList.forEach((item: any) => {
      item.isChecked = false;
    });
  }

  onCheckboxChange(commande: any): void {
    if (commande.isChecked) {
      this.calculate(commande);
      if (this.cargaison < this.truckCapacity) {
        this.commandeList.push(commande.NumCommande);
        console.log('Ajout de la commande:', this.commandeList);
      } else if (this.cargaison >= this.truckCapacity) {
        this.toastr.warning('Le véhicule est plein !');
      }
    } else {
      this.commandeList = this.commandeList.filter(
        (num) => num !== commande.NumCommande
      );
      console.log('Suppression de la commande:', this.commandeList);
      this.removeCommande(commande);
    }
  }

  async GetPrixByArticle(item: any): Promise<any> {
    let data = {
      id: item.id,
    };

    try {
      // Attendre la réponse de la promesse
      const response: any = await this.articleService.GetPrixByProduit(data);
      console.log(response);
      // Vérifier si le statusCode est 200
      if (response.data) {
        this.prixLiquide[item.id] = response.data.PrixLiquide;
        this.prixEmballage[item.id] = response.data.PrixConsigne;
        console.log('prixByArticle', this.prixLiquide[item.id]);
      }
    } catch (error: any) {
      console.log(error);
    }
  }

  afficherArticlesSelectionnes() {
    console.log(this.selectedArticles);
  }

  removeArticle(item: any): void {
    item.isChecked = false;
    this.onCheckboxChange(item);
    const index = this.selectedArticles.findIndex((i: any) => i.id === item.id);

    if (index !== -1) {
      this.selectedArticles = this.selectedArticles
        .slice(0, index)
        .concat(this.selectedArticles.slice(index + 1));
    }
  }

  onSubmitSelection() {
    this.isChoiceModalOpen = false;
  }

  OnCloseChoiceModal() {
    this.deselectAllItems();
    this.isChoiceModalOpen = false;
    console.log(this.isModalOpen);
  }

  deselectAllItems(): void {
    this.filteredList.forEach((item: any) => {
      this.onCheckboxChange(item);
      item.isChecked = false;
    });

    this.selectedArticles = [];
  }

  // onSearchClient(): void {}
  loadArticleDetails(): void {
    this.livraisonForm.patchValue({
      photo: this.updateData.photo ?? '',
      libelle: this.updateData.libelle,
      format: this.updateData.format,
      Conditionnement: this.updateData.Conditionnement,
      categorieId: this.updateData.categorieproduit.id,
      groupeId: this.updateData.groupearticle.id,
      plastiquenuId: this.updateData.plastiquenu.id,
      bouteillevideId: this.updateData.bouteillevide.id,
      liquideId: 1,
    });
  }

  onPage(event: any) {
    this.currentPage = event.first / event.rows + 1; // Calculer la page actuelle (1-based index)
    this.rowsPerPage = event.rows;
    this.GetRegroupementList(this.currentPage);
  }

  onFilterStatutChange() {
    this.currentPage = 1;
    this.GetRegroupementList(1);
  }

  onFilterDateChange() {
    this.currentPage = 1;
    this.GetRegroupementList(1);
  }

  filterGlobal() {
    this.currentPage = 1;
    this.GetRegroupementList(1);
  }

  resetFilters() {
    this.filterSearch = '';
    this.filterNumero = '';
    this.filterConducteur = '';
    this.filterStatut = '';
    this.filterDateDebut = '';
    this.filterDateFin = '';
    // Le dépôt d'un utilisateur non-hôte reste imposé, même après réinitialisation
    this.filterDepotId = this.isHote ? null : (getUserDepot()?.id ?? null);
    this.currentPage = 1;
    this.GetRegroupementList(1);
  }

  onChange(event: any): void {
    this.detailPointDevente = event;
    console.log(this.detailPointDevente, 'detailPointDevente');
  }

  GetListZone() {
    let data = {
      paginate: false,
      page: 1,
      limit: 8,
    };
    this.coreService.GetZoneList(data).then((res: any) => {
      this.listZone = res.data;
      this.filtrerOptionsParDepot();
      console.log(res.data);
    });
  }

  GetTransporteurList() {
    let data = {
      paginate: false,
      page: 1,
      limit: 8,
    };
    this.logistiqueService.GetTransporteurList(data).then((res: any) => {
      this.listTransporteur = res.data;
      this.listTransporteur = this.listTransporteur.map((item: any) => ({
        ...item,
        displayName: item.nom + ' ' + item.prenoms,
      }));
      this.filtrerOptionsParDepot();
      console.log(res.data);
    });
  }

  onVehiculeChange(event: any) {
    this.truckCapacity = event.capacite;
    console.log('truckCapacity', this.truckCapacity);
    if (event.disponible === false) {
      this.toastr.warning("Le véhicule est n'est pas disponible !");
    }
    this.cargaison = 0;
    this.regroupementTable = [];
    this.regroupementFinal = {};
    this.onCheckboxClear();
  }

  GetVehiculeList() {
    let data = {
      paginate: false,
      page: 1,
      limit: 8,
    };
    this.logistiqueService.GetVehiculeList(data).then((res: any) => {
      this.listVehicule = res.data;
      this.listVehicule = this.listVehicule.map((item: any) => ({
        ...item,
        displayName: item.marque + ' - ' + item.immatriculation,
      }));
      this.filtrerOptionsParDepot();
      console.log(res.data);
    });
  }

  OnDelete(Id: any) {
    ALERT_QUESTION('warning', 'Attention !', 'Voulez-vous supprimer?').then(
      (res: any) => {
        if (res.isConfirmed == true) {
          this._spinner.show();
          this.articleService.DeletedArticle(Id).then((res: any) => {
            console.log('DATA:::>', res);
            this.toastr.success(res.message);
            this.GetArticleList(1);
            this._spinner.hide();
          });
        } else {
        }
      }
    );
  }

  LoadCasiersPerPalette() {
    this.coreService.GetReglePaletteList({ paginate: false, page: 1, limit: 0 }).then((res: any) => {
      this.casiersPerPalette = {};
      (res.data as any[]).forEach(regle => {
        if (!this.casiersPerPalette[regle.format]) {
          this.casiersPerPalette[regle.format] = [];
        }
        this.casiersPerPalette[regle.format].push({ casiers: regle.casiers, type: regle.type, fournisseurId: regle.fournisseur?.id ?? null, fournisseurNom: regle.fournisseur?.nom ?? null });
      });
    });
  }

  findRegle(format: number, type: string, fournisseurId?: number): { casiers: number; fournisseurNom: string | null } {
    const rules = this.casiersPerPalette[format] ?? [];
    let rule: any = null;
    if (fournisseurId) rule = rules.find((r: any) => r.type === type && r.fournisseurId === fournisseurId);
    if (!rule) rule = rules.find((r: any) => r.type === type && !r.fournisseurId);
    if (!rule) rule = rules.find((r: any) => r.type === type);
    return { casiers: rule?.casiers ?? 0, fournisseurNom: rule?.fournisseurNom ?? null };
  }

  GetRegroupementRules() {
    let data = [
      {
        '33': {
          unit: 60,
          type: 'biere',
        },
        '60': {
          unit: 66,
          type: 'biere',
        },
        '25': {
          unit: 60,
          type: 'sucrerie',
        },
      },
    ];
  }


  extractAllArticles(data: any) {
    const articleMap = new Map<string, any>();

    data.forEach((retour: any) => {
      retour.articles.forEach((article: any) => {
        const libelle = article.liquide.libelle;
        const existing = articleMap.get(libelle);

        if (!existing) {
          articleMap.set(libelle, {
            libelle,
            expectedQuantity: article.quantite,
          });
        } else {
          existing.expectedQuantity += article.quantite;
        }
      });
    });

    this.allArticles = Array.from(articleMap.values());
    console.log(this.allArticles)
  }

  getQuantity(retour: any, libelle: string): number {
    let total = 0;
    retour.articles.forEach((article: any) => {
      if (article.liquide.libelle === libelle) {
        total += article.quantite;
      }
    });
    return total;
  }

  getLivraisonForCommande(numCommande: string): any | null {
    return (this.updateData?.livraisons ?? []).find(
      (l: any) => l.commande?.NumCommande === numCommande
    ) ?? null;
  }

  printBonLivraison(commande: any): void {
    const numCommande = commande?.numCommande || commande?.NumCommande;
    if (!numCommande) {
      this.toastr.warning('Numéro de commande introuvable.');
      return;
    }
    this._spinner.show();
    this.activiteService.GetBonLivraisonPdf(numCommande).then(
      () => this._spinner.hide(),
      (err: any) => {
        this._spinner.hide();
        this.toastr.error(err?.error?.message || 'Erreur lors de la génération du bon de livraison.');
      }
    );
  }

  openRetourPleinCommandeModal(cmd: any) {
    this.selectedCommandeRetour = cmd;
    this.selectedRaisonRetourId = null;
    if (this.listRaisonsRetour.length === 0) {
      this.activiteService.GetRaisonRetourPleinList().then((res: any) => {
        this.listRaisonsRetour = res.data || [];
      });
    }
    this.isModalRetourPleinCommande = true;
  }

  closeRetourPleinCommandeModal() {
    this.isModalRetourPleinCommande = false;
    this.selectedCommandeRetour = null;
    this.selectedRaisonRetourId = null;
  }

  submitRetourPleinCommande() {
    if (!this.selectedRaisonRetourId) {
      this.toastr.warning('Veuillez sélectionner un motif de retour.');
      return;
    }
    const cmd = this.selectedCommandeRetour;
    const payload = {
      numCommande: cmd.numCommande,
      vehiculeId: this.updateData.vehicule?.id,
      depotId: cmd.clientInfo?.depot?.id,
      transporteurId: this.updateData.transporteur?.id,
      raisonRetourId: this.selectedRaisonRetourId,
      source: 'BO',
      articles: (cmd.articles || []).map((a: any) => ({
        idArticle: a.id,
        quantite: a.quantite,
        prixUnitaireLiquide: a.prixUnitaireLiquide || 0,
        prixUnitaireEmballage: a.prixUnitaireEmballage || 0,
        ...(a.liquide?.code && { codeArticleLiquide: a.liquide.code }),
        ...(a.emballage?.code && { codeArticleEmballage: a.emballage.code }),
      })),
    };
    this._spinner.show();
    this.activiteService.CreateRetourPlein(payload).then(
      (res: any) => {
        this._spinner.hide();
        this.toastr.success(res.message || 'Retour plein créé avec succès.');
        const cmdInList = this.updateData.commandes?.find((c: any) => c.numCommande === cmd.numCommande);
        if (cmdInList) cmdInList.statutCommande = 'Retournée';
        this.closeRetourPleinCommandeModal();
        this.GetRegroupementList(this.currentPage);
      },
      (err: any) => {
        this._spinner.hide();
        this.toastr.error(err?.error?.message || 'Erreur lors de la création du retour plein.');
      }
    );
  }

  min100(v: number): number { return Math.min(v, 100); }

  get filteredListAddDisplay(): any[] {
    if (!this.searchTermAdd.trim()) return this.filteredListAdd;
    const term = this.searchTermAdd.toLowerCase().trim();
    return this.filteredListAdd.filter((c: any) =>
      (c.NumCommande || '').toLowerCase().includes(term) ||
      (c.client?.nomEtablissement || '').toLowerCase().includes(term) ||
      (c.client?.raisonSocial || '').toLowerCase().includes(term)
    );
  }

  openAddCommandesModal(regroupement: any) {
    this.selectedRegroupement = regroupement;
    this.commandesAAjouter = [];
    this.searchTermAdd = '';
    this.addModalCapacite = regroupement.vehicule?.capacite || 0;
    this.addModalCargaisonActuelle = (regroupement.commandes || []).reduce(
      (total: number, cmd: any) => total + this.getTotalQuantite(cmd.articles || []), 0
    );
    this.addModalCargaisonAjout = 0;
    const numsDejaPresents = new Set((regroupement.commandes || []).map((c: any) => c.NumCommande));
    this.filteredListAdd = this.ListCommande.filter((c: any) => !numsDejaPresents.has(c.NumCommande));
    this.filteredListAdd.forEach((c: any) => c.isCheckedAdd = false);
    this.isModalAddCommandesOpen = true;
  }

  closeAddCommandesModal() {
    this.isModalAddCommandesOpen = false;
    this.selectedRegroupement = null;
    this.commandesAAjouter = [];
    this.searchTermAdd = '';
    this.addModalCargaisonAjout = 0;
    this.filteredListAdd.forEach((c: any) => c.isCheckedAdd = false);
  }

  onCheckboxAddChange(commande: any) {
    if (commande.isCheckedAdd) {
      this.commandesAAjouter.push(commande.NumCommande);
    } else {
      this.commandesAAjouter = this.commandesAAjouter.filter(n => n !== commande.NumCommande);
    }
    const selected = this.filteredListAdd.filter((c: any) => c.isCheckedAdd);
    this.addModalCargaisonAjout = selected.reduce(
      (total: number, c: any) => total + this.getTotalQuantite(c.articles || []), 0
    );
  }

  submitAjouterCommandes() {
    if (this.commandesAAjouter.length === 0) {
      this.toastr.warning('Sélectionnez au moins une commande.');
      return;
    }
    this._spinner.show();
    this.activiteService.AjouterCommandesRegroupement(this.selectedRegroupement.id, this.commandesAAjouter).then(
      (res: any) => {
        this._spinner.hide();
        this.toastr.success(res.message || 'Commandes ajoutées avec succès.');
        this.closeAddCommandesModal();
        this.GetRegroupementList(this.currentPage);
        this.GetListCommande(1);
      },
      (err: any) => {
        this._spinner.hide();
        this.toastr.error(err?.error?.message || 'Erreur lors de l\'ajout des commandes.');
      }
    );
  }

  preloadInventaire(inventaires: any) {

    for (const inv of inventaires) {
      const article = this.allArticles.find((a: any) => a.codeEmballage === inv.codeEmballage);
      console.log('preloadInventaire:', article);
      if (article) {
        article.receivedQuantity = inv.receivedQuantity;
      }
    }
  }
}
