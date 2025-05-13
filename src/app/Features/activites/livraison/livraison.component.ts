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
import {StatutCommande} from '../../../utils/utils';

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
  results:any
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
  currentPage: number;
  rowsPerPage: any;
  listRevendeurs: any[] = [];
  listRegroupements: any[] = [];
  truckCapacity: number = 0;
  isModalOpenDetail: boolean = false;
  totalCasiers: number = 0;
  canContinue: boolean = false;
  cargaison: number = 0;
  format: number = 33;

  regroupementList: any[] = [];
  regroupementTable: any[] = [];
  regroupementFinal: { [key: string]: Array<{ type: string; palettes: number; casier: number; totalQuantite:number }> } = {};
  result: { palettes: number; casier: number } | null = null;
  casiersPerPalette: Record<number, { casiers: number; type: string }[]> = {
    30: [{casiers: 60, type: 'SUCRERIE'}],
    33: [
      {casiers: 63, type: 'BIERE'},
      {casiers: 126, type: 'EAU'}
    ],
    25: [{casiers: 63, type: 'BIERE'}],
    50: [{casiers: 66, type: 'BIERE'}],
    60: [
      {casiers: 60, type: 'SUCRERIE'},
      {casiers: 66, type: 'BIERE'}
    ],
    100: [{casiers: 64, type: 'EAU'}],
    150: [{casiers: 64, type: 'EAU'}],
  };


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

    // this.selectedArticle = this.articles[0];
    this.GetListZone();
    this.GetRegroupementRules();
    this.GetTransporteurList();
    this.GetVehiculeList();
    this.GetListCommande(1);
    this.GetRegroupementList();
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
      (total: any, commande: any) => total + commande.montantTotal,
      0
    );
  }

  removeCommande(commande: any): void {
    console.log('Retrait de la commande:', commande);

    commande.articles.forEach((article: any) => {
      const format = Number(article?.liquide?.format);
      const type = article?.groupeArticle?.libelle;

      // Vérifie si le format existe dans regroupementFinal
      if (this.regroupementFinal[format]) {
        console.log('AAA:',this.regroupementFinal)
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
    // Recalcul de la cargaison après modification de regroupementFinal
    this.updateCargaison();
  }

  calculate(commande: any): void {
    console.log('Commande:', commande);

    // ✅ Ne réinitialise pas `regroupementFinal` complètement pour ne pas écraser les données existantes
    if (!this.regroupementFinal) {
      this.regroupementFinal = {};
    }
    console.log('fois:');
    this.result = { palettes: 0, casier: 0 };

    const articlesParFormatEtType = commande.articles.reduce((acc: any, article: any) => {
      const format = Number(article?.liquide?.format);
      const type = article?.groupeArticle?.libelle;

      if (!format || !type) {
        console.warn('Article sans format ou type non défini, ignoré:', article);
        return acc;
      }

      if (!acc[format]) {
        acc[format] = {};
      }

      if (!acc[format][type]) {
        acc[format][type] = [];
      }

      acc[format][type].push(article);
      return acc;
    }, {});

    console.log('Articles regroupés par format et type:', articlesParFormatEtType);

    Object.keys(articlesParFormatEtType).forEach((formatStr: string) => {
      const format = Number(formatStr);
      const totalCasiersParFormat: any = {};

      Object.entries(articlesParFormatEtType[format]).forEach(([type, articles]: [string, any]) => {
        const totalCasiers = articles.reduce(
          (total: number, article: any) => total + Number(article.quantite || 0),
          0
        );

        const paletteInfos = this.casiersPerPalette[format];
        if (!paletteInfos || paletteInfos.length === 0) {
          console.warn(`Format invalide ou non trouvé : ${format}`);
          return;
        }

        paletteInfos.forEach(({casiers, type: paletteType}) => {
          if (paletteType === type) {
            const palettes = Math.floor(totalCasiers / casiers);
            const casier = totalCasiers % casiers;

            // ✅ Vérifie si ce format et type existent déjà dans regroupementFinal
            if (!this.regroupementFinal[format]) {
              this.regroupementFinal[format] = [];
            }

            const existingEntry = this.regroupementFinal[format].find((entry: any) => entry.type === type);
            if (existingEntry) {
              // 🔄 Additionne les nouvelles valeurs sans écraser l'existant
              existingEntry.palettes += palettes;
              existingEntry.casier += casier;
            } else {
              // ➕ Ajoute un nouvel article s'il n'existe pas encore
              this.regroupementFinal[format].push({ type, palettes, casier, totalQuantite: 0 });
            }
          }
        });
      });
    });
// Recalcul de la cargaison après modification de regroupementFinal
    this.updateCargaison();
    console.log('Résultat final:', this.regroupementFinal);
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


  onZoneChange(zone: any | null): void {
    console.log('zoneId', zone.id);
    if (zone.id) {
      // Filtrer selon l'ID de la zone
      this.filteredList = this.ListCommande
        .filter((item: any) => item.client.zoneDeLivraison.id === zone.id)
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      // Si aucune zone n'est sélectionnée, afficher toute la liste
      this.filteredList = [...this.ListCommande];
    }
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
      page:page,
      limit: 8,
      numeroCommande: '',
      date: '',
      etablissement: '',
      statut: StatutCommande.NON_REGROUPE,
    };
    this._spinner.show();
    const [commandeClient, commandeGratuite]: [any, any] = await Promise.all([
      this.articleService.GetListCommandeGratuite(data),
      this.articleService.GetListCommandeClient(data),
    ]);
    // Unifier les deux objets dans un seul tableau
    this.ListCommande = [...commandeClient.data, ...commandeGratuite.data];
    console.log('ListCommande', this.ListCommande);
    this.filteredList = this.ListCommande
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    console.log('filteredList', this.filteredList);

    this._spinner.hide();
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
    this.isModalOpenDetail = true;
    this.updateData.commandes.forEach((commande:any)=>{
      this.calculate(commande);
    })

    this.extractAllArticles(this.updateData.commandes)
  }

  closeDetailModal() {
    this.isModalOpenDetail = false;
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
    console.log(item, 'item')
    this.regroupementTable = []
    const numRegroupement = item.numRegroupement;
    let regroup = this.regrouperArticles(item.commandes)
    console.log(regroup, 'XXX')
    this.calculate(regroup);

    this._spinner.show();
    if (this.regroupementFinal) {
       this.results = Object.entries(this.regroupementFinal).flatMap(([key, value]) => {
        // Vérifie que value est bien un tableau
        if (!Array.isArray(value)) return [];

        // Regroupement par type
        const regroupementParType = value.reduce((acc, item) => {
          const type = item.type ?? "Inconnu"; // Sécurité si le type est absent
          if (!acc[type]) {
            acc[type] = { casier: 0, palette: 0 };
          }
          console.log(item.casier )
          acc[type].casier += item.casier ?? 0;
          acc[type].palette += item.palettes ?? 0;
          return acc;
        }, {} as Record<string, { casier: number, palette: number }>);

        // Convertir l'objet en tableau
        return Object.entries(regroupementParType).map(([type, data]) => ({
          format: Number(key),
          type,
          casier: data.casier,
          palette: data.palette
        }));

      });

      console.log(this.result);


      this.activiteService.GetRegroupementPdf(numRegroupement, this.results).then(
        (res: any) => {
          console.log('DownloadGlobalFacturesById:::>', res);
          this.regroupementFinal = {}
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
    this._spinner.show();
    this.articleService.GetArticleList(data).then((res: any) => {
      console.log('DATATYPEPRIX:::>', res);
      this.dataListLiquides = res.data;
      this.filteredArticleList = this.dataListLiquides;
      this._spinner.hide();
    });
  }

  GetRevendeurList(page: number) {
    let data = {
      paginate: false,
      page: page,
      limit: 8,
    };
    this._spinner.show();
    this.articleService.GetListRevendeur(data).then((res: any) => {
      console.log('GetListRevendeur:::>', res);
      this.listRevendeurs = res.data;
      this._spinner.hide();
    });
  }

  GetRegroupementList() {
    let data = {
      paginate: false,
      page: 1,
      limit: 8,
    };
    this._spinner.show();
    this.activiteService.GetRegroupementList(data).then((res: any) => {
      console.log('GetRegroupementList:::>', res);
      this.listRegroupements = res.data;
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
        this.GetRegroupementList();
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
    this.GetArticleList(this.currentPage);
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
    this.regroupementFinal= {};
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
