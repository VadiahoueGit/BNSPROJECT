import {Component, ViewChild} from '@angular/core';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import {NgxSpinnerService} from 'ngx-spinner';
import {ToastrService} from 'ngx-toastr';
import {Table} from 'primeng/table';
import {ArticleServiceService} from 'src/app/core/article-service.service';
import {UtilisateurResolveService} from 'src/app/core/utilisateur-resolve.service';
import {ALERT_QUESTION} from '../../shared-component/utils';
import {Location} from '@angular/common';
import {CoreServiceService} from "../../../core/core-service.service";
import {LogistiqueService} from "../../../core/logistique.service";
import {ActiviteService} from "../../../core/activite.service";
import {StatutCommande} from "../../../utils/utils";

interface RegroupementItem {
  palettes: number;
  casier: number;
  type: string;
}

@Component({
  selector: 'app-livraison',
  templateUrl: './livraison.component.html',
  styleUrls: ['./livraison.component.scss']
})

export class LivraisonComponent {
  @ViewChild('dt2') dt2!: Table;
  statuses!: any[];
  dataList: any[] = [
    {
      refclient: 'test',
      raisonsociale: 'test',
      localite: 'test',
      statut: 'test',
      prenom: 'test',
      nom: 'test'
    }
  ];

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
  result: { palettes: number; casier: number } | null = null;
  regroupementList: any[] = [];
  regroupementTable: any[] = [];
  regroupementFinal: Record<string, RegroupementItem>;
  casiersPerPalette: Record<number, { casiers: number; type: string }> = {
    33: {casiers: 63, type: 'biere'},
    25: {casiers: 63, type: 'biere'},
    50: {casiers: 66, type: 'plastique'},
    60: {casiers: 66, type: 'métal'},
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
    this.GetRegroupementRules()
    this.GetTransporteurList();
    this.GetVehiculeList();
    this.GetListCommande(1)
    this.GetRegroupementList()
    this.articleService.ListTypeArticles.subscribe((res: any) => {
      this.dataListProduits = res;
      console.log(this.dataListProduits, 'this.dataListProduits ');
    });

    this.GetArticleList(1);
    this.GetRevendeurList(1);
    // this.dataList
  }

  getTotalGeneral(commandes: any): number {
    return commandes.reduce((total: any, commande: any) => total + commande.montantTotal, 0);
  }

  removeCommande(commande: any): void {
    console.log('Retrait de la commande', commande);

    if (!this.regroupementTable || this.regroupementTable.length === 0) {
      console.warn("Aucune donnée dans regroupementTable.");
      return;
    }

    // Regrouper les articles de la commande supprimée par format
    const articlesParFormat = commande.articles.reduce((acc: any, article: any) => {
      const format = Number(article?.liquide?.format);
      if (!format) return acc;

      acc[format] = (acc[format] || 0) + Number(article.quantite || 0);
      return acc;
    }, {});

    console.log('Articles à retirer:', articlesParFormat);

    // Mettre à jour `regroupementTable`
    Object.keys(articlesParFormat).forEach((format) => {
      let totalCasiersToRemove = articlesParFormat[format];
      console.log('totalCasiersToRemove',totalCasiersToRemove)
      // On va modifier **chaque entrée** où ce format est présent
      this.regroupementTable = this.regroupementTable.map(regroupement => {
        if (regroupement[format]) {
          let casiersRestants = regroupement[format].casier;
          let palettesRestantes = regroupement[format].palettes;
          const casiersParPalette = this.casiersPerPalette[Number(format)]?.casiers || 0;

          // **1️⃣ On retire d'abord des casiers**
          let casiersÀRetirer = Math.min(totalCasiersToRemove, casiersRestants);
          casiersRestants -= casiersÀRetirer;
          totalCasiersToRemove -= casiersÀRetirer;
          this.cargaison -= casiersÀRetirer;
          console.log('cargaison',casiersÀRetirer)
          // **2️⃣ Si on doit encore retirer, on enlève des palettes**
          while (totalCasiersToRemove > 0 && palettesRestantes > 0) {
            palettesRestantes -= 1;
            casiersRestants += casiersParPalette;
            let casiersÀRetirerSupplementaire = Math.min(totalCasiersToRemove, casiersRestants);
            casiersRestants -= casiersÀRetirerSupplementaire;
            totalCasiersToRemove -= casiersÀRetirerSupplementaire;
          }

          // **3️⃣ Mettre à jour l'entrée**
          if (palettesRestantes <= 0 && casiersRestants <= 0) {
            delete regroupement[format];
          } else {
            regroupement[format].casier = casiersRestants;
            regroupement[format].palettes = palettesRestantes;
          }
        }
        return regroupement;
      }).filter(regroupement => Object.keys(regroupement).length > 0); // Supprimer les objets vides
    });

    console.log('regroupementTable après suppression:', this.regroupementTable);
    this.regrouperParFormat();
  }

  calculate(commande: any): void {
    console.log('commande', commande);
    // Regrouper les articles par format
    const articlesParFormat = commande.articles.reduce((acc: any, article: any) => {
      const format = Number(article?.liquide?.format); // S'assurer que le format est un nombre

      if (!format) {
        console.warn('Article sans format ou format non numérique détecté, ignoré:', article);
        return acc;
      }

      if (!acc[format]) {
        acc[format] = [];
      }

      acc[format].push(article);
      return acc;
    }, {});

    console.log('Articles regroupés par format:', articlesParFormat);

    // Calcul des palettes et des casiers pour chaque format
    this.result = Object.keys(articlesParFormat).reduce((result: any, formatStr: string) => {
      const format = Number(formatStr); // Convertir la clé (string) en nombre
      const totalCasiers = articlesParFormat[format].reduce(
        (total: number, article: any) => total + Number(article.quantite || 0),
        0
      );

      const paletteInfo = this.casiersPerPalette[format];
      if (!paletteInfo) {
        console.warn(`Format invalide ou non trouvé : ${format}`);
        result[format] = null;
        return result;
      }

      const {casiers, type} = paletteInfo;

      const palettes = Math.floor(totalCasiers / casiers);
      const casier = totalCasiers % casiers;
      this.cargaison += totalCasiers;
      result[format] = {palettes, casier, type};
      return result;
    }, {});
    this.regroupementTable.push(this.result);
    console.log('Résultat final', this.result);
    console.log('regroupementList', this.regroupementTable);
    this.regrouperParFormat()
  }

  regrouperParFormat(): void {
    const regroupement = this.regroupementTable.reduce((acc: any, item: any) => {
      Object.entries(item).forEach(([format, details]: [string, any]) => {
        if (!acc[format]) {
          acc[format] = {
            palettes: 0,
            casier: 0,
            type: details.type,
          };
        }

        // Ajouter les palettes et casiers au format correspondant
        acc[format].palettes += details.palettes;
        acc[format].casier += details.casier;

        // Gérer les casiers excédentaires pour compléter une palette
        const casiersParPalette = this.casiersPerPalette[Number(format)]?.casiers || 0;
        if (casiersParPalette && acc[format].casier >= casiersParPalette) {
          const palettesSupplementaires = Math.floor(acc[format].casier / casiersParPalette);
          acc[format].palettes += palettesSupplementaires;
          acc[format].casier %= casiersParPalette;
        }
      });

      return acc;
    }, {});

    console.log('Regroupement par format:', regroupement);
    this.regroupementFinal = regroupement;

    console.log('test', this.regroupementTable)
    console.log('regroupementFinal:', this.regroupementFinal);
  }


  onZoneChange(zone: any | null): void {
    console.log('zoneId', zone.id);
    if (zone.id) {
      // Filtrer selon l'ID de la zone
      this.filteredList = this.ListCommande.filter(
        (item: any) => item.client.zoneDeLivraison.id === zone.id
      );
    } else {
      // Si aucune zone n'est sélectionnée, afficher toute la liste
      this.filteredList = [...this.ListCommande];
    }
  }

  getTotalQuantite(articles: any[]): number {
    return articles.reduce((total, article) => total + Number(article.quantite || 0), 0);
  }


  async GetListCommande(page: number) {
    let data = {
      paginate: false,
      page: page,
      limit: 8,
    };
    this._spinner.show();
    const [commandeClient, commandeGratuite]: [any, any] = await Promise.all([
      this.articleService.GetListCommandeGratuite(data),
      this.articleService.GetListCommandeClient(data),
    ]);
    // Unifier les deux objets dans un seul tableau
    this.ListCommande = [...commandeClient.data, ...commandeGratuite.data];
    console.log('ListCommande', this.ListCommande);
    this.filteredList = this.ListCommande.filter((commande: any) => commande.statut === StatutCommande.NON_APPROUVEE);
    console.log('filteredList', this.filteredList);

    this._spinner.hide();

  }

  onFilterGlobal(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value;
    this.dt2.filterGlobal(value, 'contains');
  }

  goBack() {
    this.location.back()
  }

  clear(table: Table) {
    table.clear();
  }

  OnCloseModal() {
    this.cargaison = 0
    this.truckCapacity = 0;
    this.isModalOpen = false;
    this.regroupementTable = [];
    Object.keys(this.regroupementFinal).forEach(key => delete this.regroupementFinal[key]);

    console.log('regroupementFinal', this.regroupementFinal);
    this.onCheckboxClear()
    console.log(this.isModalOpen);
  }

  OnCreate() {
    this.isEditMode = false;
    this.isModalOpen = true;
    this.operation = 'create';
    this.livraisonForm.reset();
    console.log(this.isModalOpen);
  }

  OnView(data: any) {
    this.updateData = data;
    this.isModalOpenDetail = true;
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
    console.log(this.isModalOpen);
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
      "vehiculeId": this.livraisonForm.controls['vehicule'].value,
      "transporteurId": this.livraisonForm.controls['transporteur'].value,
      "commandes": this.commandeList
    }
    this.activiteService.CreationRegroupement(data).then((res: any) => {
      this._spinner.hide();
      if (res.statusCode == 201) {
        this.toastr.success(res.message);
        this.isModalOpen = false;
        this.GetRegroupementList()
      } else {
        this.toastr.error(res.message);
      }
      console.log(res.data);
    })
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
      this.calculatePrix(data)
    }
  }

  calculatePrix(data: any) {


    if (this.prixLiquideTotal[data.id]) {
      this.totalEmballage -= this.prixEmballageTotal[data.id] || 0;
      this.totalLiquide -= this.prixLiquideTotal[data.id] || 0;
      this.totalGlobal -= this.montantTotal[data.id] || 0;
      this.totalQte -= data.oldQuantite || 0
    }
    this.prixLiquideTotal[data.id] = data.quantite * this.prixLiquide[data.id];
    this.prixEmballageTotal[data.id] = data.quantite * this.prixEmballage[data.id];
    this.montantTotal[data.id] = this.prixLiquideTotal[data.id] + this.prixEmballageTotal[data.id];

    this.totalEmballage += this.prixEmballageTotal[data.id];
    this.totalLiquide += this.prixLiquideTotal[data.id];
    this.totalGlobal += this.montantTotal[data.id];
    this.totalQte += data.quantite

    data.oldQuantite = data.quantite;
    console.log(data);
    console.log(this.totalQte, 'totalQte');
    console.log(this.totalLiquide, "totalLiquide");
    console.log(this.totalEmballage, "totalEmballage");
    console.log(this.totalGlobal), "totalGlobal";
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
        this.toastr.warning('Le vehicule est plein !');
      }
    } else {
      this.commandeList = this.commandeList.filter(num => num !== commande.NumCommande);
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
      console.log(response)
      // Vérifier si le statusCode est 200
      if (response.data) {
        this.prixLiquide[item.id] = response.data.PrixLiquide;
        this.prixEmballage[item.id] = response.data.PrixConsigne;
        console.log('prixByArticle', this.prixLiquide[item.id])
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
      this.selectedArticles = this.selectedArticles.slice(0, index).concat(this.selectedArticles.slice(index + 1));
    }

  }

  onSubmitSelection() {
    this.isChoiceModalOpen = false;
  }

  OnCloseChoiceModal() {
    this.deselectAllItems()
    this.isChoiceModalOpen = false;
    console.log(this.isModalOpen)
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
    console.log(this.detailPointDevente, 'detailPointDevente')
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
    })
  }

  GetTransporteurList() {
    let data = {
      paginate: false,
      page: 1,
      limit: 8,
    };
    this.logistiqueService.GetTransporteurList(data).then((res: any) => {
      this.listTransporteur = res.data;
      this.listTransporteur = this.listTransporteur
        .map((item: any) => ({
          ...item,
          displayName:
            item.nom + ' ' + item.prenoms
        }));
      console.log(res.data);
    })
  }

  onVehiculeChange(event: any) {
    this.truckCapacity = event.capacite;
    console.log('truckCapacity', this.truckCapacity);
  }

  GetVehiculeList() {
    let data = {
      paginate: false,
      page: 1,
      limit: 8,
    };
    this.logistiqueService.GetVehiculeList(data).then((res: any) => {
      this.listVehicule = res.data;
      this.listVehicule = this.listVehicule
        .map((item: any) => ({
          ...item,
          displayName:
            item.marque + ' - ' + item.immatriculation
        }));
      console.log(res.data);
    })
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
    let data = [{
      "33": {
        unit: 60,
        type: 'biere',
      },
      "60": {
        unit: 66,
        type: 'biere',
      },
      "25": {
        unit: 60,
        type: 'sucrerie',
      }
    }]
  }
}
