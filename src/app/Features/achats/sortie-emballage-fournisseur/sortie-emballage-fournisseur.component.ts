import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ArticleServiceService } from 'src/app/core/article-service.service';
import { UtilisateurResolveService } from 'src/app/core/utilisateur-resolve.service';
import { LocalStorageService } from 'src/app/core/local-storage.service';
import { storage_keys } from 'src/app/Features/shared-component/utils';

@Component({
  selector: 'app-sortie-emballage-fournisseur',
  templateUrl: './sortie-emballage-fournisseur.component.html',
  styleUrls: ['./sortie-emballage-fournisseur.component.scss'],
})
export class SortieEmballageFournisseurComponent implements OnInit {
  dataList: any[] = [];
  totalPages = 0;
  currentPage = 1;

  isModalOpen = false;
  isRetourModalOpen = false;
  isChoiceModalOpen = false;

  fournisseurList: any[] = [];
  commandeList: any[] = [];
  emballageList: any[] = [];
  filteredEmballageList: any[] = [];
  searchTerm = '';

  selectedFournisseur: any = null;
  selectedCommande: any = null;
  commentaire = '';
  articlesSelectionnes: any[] = [];

  selectedSortie: any = null;
  articlesRetour: any[] = [];

  UserInfo: any;

  constructor(
    private articleService: ArticleServiceService,
    private utilisateurService: UtilisateurResolveService,
    private localstorage: LocalStorageService,
    private _spinner: NgxSpinnerService,
    private toastr: ToastrService,
  ) {}

  ngOnInit() {
    this.UserInfo = this.localstorage.getItem(storage_keys.STOREUser);
    this.GetList(1);
    this.LoadFournisseurs();
    this.LoadEmballages();
  }

  GetList(page: number) {
    this._spinner.show();
    this.articleService.GetListSortieEmballageFournisseur({ page, limit: 10 }).then(
      (res: any) => {
        this._spinner.hide();
        this.dataList = res.data ?? [];
        this.totalPages = res.total ?? 0;
      },
      () => this._spinner.hide()
    );
  }

  LoadFournisseurs() {
    this.utilisateurService.GetFournisseursList({ paginate: false, page: 1, limit: 100 }).then(
      (res: any) => { this.fournisseurList = res.data ?? []; },
      () => {}
    );
  }

  LoadEmballages() {
    this.articleService.GetEmballageList({ paginate: false, page: 1, limit: 200 }).then(
      (res: any) => {
        this.emballageList = (res.data ?? []).map((e: any) => ({ ...e, quantiteSortie: 0, isSelected: false }));
        this.filteredEmballageList = [...this.emballageList];
      },
      () => {}
    );
  }

  OnLoadCommandes() {
    if (!this.selectedFournisseur) { this.commandeList = []; return; }
    // Commandes fournisseur dont la réception est partiellement rendue (toutes, sans pagination)
    this.articleService.GetListReceptionCommandeFournisseurs({
      paginate: false, page: 1, limit: 10000,
      numeroReception: '', numeroBonLivraison: '', dateDebut: '', dateFin: '',
      statuts: ['PARTIELLEMENT_RENDU'],
    }).then(
      (res: any) => {
        const commandes = (res.data ?? [])
          .map((r: any) => r.commande)
          .filter((c: any) => c && c.fournisseur?.id === this.selectedFournisseur.id);
        this.commandeList = commandes
          .filter((c: any, i: number) => commandes.findIndex((x: any) => x.id === c.id) === i)
          .map((c: any) => ({ ...c, _bonLabel: c.bonLivraison || c.bonEmballage || c.NumCommande }));
      },
      () => {}
    );
  }

  OnCreate() {
    this.isModalOpen = true;
    this.selectedFournisseur = null;
    this.selectedCommande = null;
    this.commentaire = '';
    this.articlesSelectionnes = [];
    this.emballageList.forEach(e => { e.quantiteSortie = 0; e.isSelected = false; });
  }

  OnCloseModal() {
    this.isModalOpen = false;
  }

  OpenChoixEmballage() {
    this.filteredEmballageList = [...this.emballageList];
    this.searchTerm = '';
    this.isChoiceModalOpen = true;
  }

  filterEmballages() {
    const term = this.searchTerm.toLowerCase();
    this.filteredEmballageList = this.emballageList.filter(e =>
      !term || (e.libelle || '').toLowerCase().includes(term) || (e.code || '').toLowerCase().includes(term)
    );
  }

  onCheckEmballage(emballage: any) {
    if (emballage.isSelected) {
      if (!this.articlesSelectionnes.find(a => a.id === emballage.id)) {
        this.articlesSelectionnes.push({ ...emballage, quantiteSortie: 1 });
      }
    } else {
      this.articlesSelectionnes = this.articlesSelectionnes.filter(a => a.id !== emballage.id);
    }
  }

  removeArticle(article: any) {
    this.articlesSelectionnes = this.articlesSelectionnes.filter(a => a.id !== article.id);
    const emb = this.emballageList.find(e => e.id === article.id);
    if (emb) emb.isSelected = false;
  }

  onSubmit() {
    if (!this.selectedFournisseur) { this.toastr.warning('Veuillez sélectionner un fournisseur.'); return; }
    if (this.articlesSelectionnes.length === 0) { this.toastr.warning('Veuillez ajouter au moins un emballage.'); return; }
    const invalid = this.articlesSelectionnes.find(a => !a.quantiteSortie || a.quantiteSortie <= 0);
    if (invalid) { this.toastr.warning('Veuillez saisir une quantité valide pour chaque emballage.'); return; }

    const payload = {
      fournisseurId: this.selectedFournisseur.id,
      depotId: this.UserInfo?.depot?.id,
      commandeId: this.selectedCommande?.id ?? null,
      commentaire: this.commentaire || null,
      articles: this.articlesSelectionnes.map(a => ({ emballageId: a.id, quantiteSortie: Number(a.quantiteSortie) })),
    };

    this._spinner.show();
    this.articleService.CreateSortieEmballageFournisseur(payload).then(
      (res: any) => {
        this._spinner.hide();
        if (res.statusCode === 201) {
          this.toastr.success(res.message);
          this.OnCloseModal();
          this.GetList(this.currentPage);
        } else {
          this.toastr.error(res.message);
        }
      },
      (err) => { this._spinner.hide(); this.toastr.error(err.error?.message || 'Erreur'); }
    );
  }

  OnRetour(sortie: any) {
    this.selectedSortie = sortie;
    this.articlesRetour = sortie.articles.map((a: any) => ({
      ...a,
      quantiteARetourner: 0,
      restant: a.quantiteSortie - a.quantiteRetournee,
    }));
    this.isRetourModalOpen = true;
  }

  OnCloseRetourModal() {
    this.isRetourModalOpen = false;
    this.selectedSortie = null;
  }

  onSubmitRetour() {
    const articles = this.articlesRetour
      .filter(a => a.quantiteARetourner > 0)
      .map(a => ({ articleId: a.id, quantiteRetournee: Number(a.quantiteARetourner) }));

    if (articles.length === 0) { this.toastr.warning('Veuillez saisir au moins une quantité retournée.'); return; }

    this._spinner.show();
    this.articleService.EnregistrerRetourSortieEmballageFournisseur(this.selectedSortie.id, { articles }).then(
      (res: any) => {
        this._spinner.hide();
        if (res.statusCode === 200) {
          this.toastr.success(res.message);
          this.OnCloseRetourModal();
          this.GetList(this.currentPage);
        } else {
          this.toastr.error(res.message);
        }
      },
      (err) => { this._spinner.hide(); this.toastr.error(err.error?.message || 'Erreur'); }
    );
  }

  onPage(event: any) {
    this.currentPage = event.first / event.rows + 1;
    this.GetList(this.currentPage);
  }

  getStatutLabel(statut: string): string {
    const map: any = { EN_ATTENTE: 'En attente', PARTIELLEMENT_RETOURNE: 'Partiellement retourné', RETOURNE: 'Retourné' };
    return map[statut] ?? statut;
  }

  getStatutClass(statut: string): string {
    const map: any = { EN_ATTENTE: 'bg-warning text-dark', PARTIELLEMENT_RETOURNE: 'bg-info text-dark', RETOURNE: 'bg-success' };
    return map[statut] ?? '';
  }
}
