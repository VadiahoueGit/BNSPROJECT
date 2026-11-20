import { Component } from '@angular/core';
import { ALERT_QUESTION } from '../../shared-component/utils';
import { ArticleServiceService } from 'src/app/core/article-service.service';
import { CoreServiceService } from 'src/app/core/core-service.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-article-interchangeable',
  templateUrl: './article-interchangeable.component.html',
  styleUrls: ['./article-interchangeable.component.scss'],
})
export class ArticleInterchangeableComponent {
  // Toutes les listes, chacune avec son fournisseur et ses articles (emballages et plastiques)
  listes: any[] = [];
  listeSelectionnee: any = null;
  dataListFournisseurs: any[] = [];
  dataListTypePrix: any[] = [];
  // Emballages / plastiques ajoutables à la liste sélectionnée (dans aucune liste, du fournisseur de la liste)
  emballagesDisponibles: any[] = [];
  plastiquesDisponibles: any[] = [];
  articlesFiltres: any[] = [];
  filters: any = { libelle: '' };

  // Modale liste (création / modification)
  isModalListeOpen = false;
  operationListe: string = '';
  listeEnEditionId: number | null = null;
  listeForm!: FormGroup;

  // Modale ajout d'un emballage ou d'un plastique à la liste sélectionnée
  isModalOpen = false;
  articleForm!: FormGroup;

  constructor(
    private articleService: ArticleServiceService,
    private _coreService: CoreServiceService,
    private _spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.listeForm = this.fb.group({
      libelle: ['', Validators.required],
      fournisseurId: [null, Validators.required],
      typePrixId: [null, Validators.required],
    });
    this.articleForm = this.fb.group({
      type: ['emballage', Validators.required],
      articleId: [null, Validators.required],
    });
    this.GetListes();
    this.GetFournisseursList();
    this.GetTypePrixList();
  }

  // ── Listes ──────────────────────────────────────────────────────────────

  GetListes(listeIdASelectionner?: number) {
    this._spinner.show();
    this.articleService.GetListesInterchangeables().then(
      (res: any) => {
        this.listes = res.data || [];
        const id = listeIdASelectionner ?? this.listeSelectionnee?.id;
        this.listeSelectionnee = this.listes.find((l: any) => l.id === id) || this.listes[0] || null;
        this.majVue();
        this._spinner.hide();
      },
      () => this._spinner.hide()
    );
  }

  OnSelectListe(liste: any) {
    this.listeSelectionnee = liste;
    this.filters.libelle = '';
    this.majVue();
  }

  OnCreateListe() {
    this.listeForm.reset();
    this.listeEnEditionId = null;
    this.operationListe = 'create';
    this.isModalListeOpen = true;
  }

  OnEditListe(liste: any, event: Event) {
    event.stopPropagation();
    this.listeForm.reset();
    this.listeForm.patchValue({ libelle: liste.libelle, fournisseurId: liste.fournisseurId, typePrixId: liste.typePrixId });
    this.listeEnEditionId = liste.id;
    this.operationListe = 'edit';
    this.isModalListeOpen = true;
  }

  OnCloseModalListe() {
    this.isModalListeOpen = false;
    this.listeForm.reset();
  }

  onSubmitListe(): void {
    if (this.listeForm.invalid || !this.listeForm.value.libelle?.trim()) {
      this.toastr.warning('Veuillez saisir le nom de la liste et choisir le fournisseur et la liste de prix.');
      return;
    }
    const data = {
      libelle: this.listeForm.value.libelle.trim(),
      fournisseurId: this.listeForm.value.fournisseurId,
      typePrixId: this.listeForm.value.typePrixId,
    };
    this._spinner.show();
    const requete =
      this.operationListe === 'edit'
        ? this.articleService.UpdateListeInterchangeable(this.listeEnEditionId!, data)
        : this.articleService.CreateListeInterchangeable(data);
    requete.then(
      (response: any) => {
        this._spinner.hide();
        this.OnCloseModalListe();
        this.toastr.success(response.message);
        this.GetListes(response.data?.id);
      },
      (error: any) => {
        this._spinner.hide();
        this.toastr.error(this.messageErreur(error, "Erreur lors de l'enregistrement."), 'Erreur!');
      }
    );
  }

  OnDeleteListe(liste: any, event: Event) {
    event.stopPropagation();
    const nb = liste.articles?.length || 0;
    const message = nb
      ? `Supprimer la liste « ${liste.libelle} » et ses ${nb} article(s) ?`
      : `Supprimer la liste « ${liste.libelle} » ?`;
    ALERT_QUESTION('warning', 'Attention !', message).then((res) => {
      if (res.isConfirmed == true) {
        this._spinner.show();
        this.articleService.DeleteListeInterchangeable(liste.id).then(
          (res: any) => {
            this._spinner.hide();
            this.toastr.success(res.message);
            if (this.listeSelectionnee?.id === liste.id) this.listeSelectionnee = null;
            this.GetListes();
          },
          (error: any) => {
            this._spinner.hide();
            this.toastr.error(this.messageErreur(error, 'Erreur lors de la suppression.'), 'Erreur!');
          }
        );
      }
    });
  }

  // ── Articles de la liste sélectionnée ───────────────────────────────────

  // Libellé affiché d'une ligne : emballage ou plastique
  article(row: any) {
    return row.emballage || row.plastiqueNu || {};
  }

  // Recalcule le tableau filtré de la liste sélectionnée
  majVue() {
    const articles = this.listeSelectionnee?.articles || [];
    const recherche = (this.filters.libelle || '').trim().toLowerCase();
    this.articlesFiltres = recherche
      ? articles.filter((a: any) => (this.article(a).libelle || '').toLowerCase().includes(recherche))
      : articles;
  }

  filterGlobal() {
    this.majVue();
  }

  OnCreate() {
    if (!this.listeSelectionnee) {
      this.toastr.warning("Créez ou sélectionnez d'abord une liste.");
      return;
    }
    if (!this.listeSelectionnee.fournisseurId) {
      this.toastr.warning("Renseignez d'abord le fournisseur de la liste (bouton modifier).");
      return;
    }
    this.articleForm.reset({ type: 'emballage', articleId: null });
    this.GetArticlesDisponibles(this.listeSelectionnee.id);
  }

  // Emballages / plastiques proposés : calculés par le serveur à l'ouverture de la modale
  // (dans aucune liste, et du fournisseur de la liste)
  GetArticlesDisponibles(listeId: number) {
    this._spinner.show();
    this.articleService.GetArticlesDisponiblesInterchangeables(listeId).then(
      (res: any) => {
        this._spinner.hide();
        const libeller = (a: any) => ({ ...a, label: `${a.code} — ${a.libelle}` });
        this.emballagesDisponibles = (res.data?.emballages || []).map(libeller);
        this.plastiquesDisponibles = (res.data?.plastiques || []).map(libeller);
        this.isModalOpen = true;
      },
      (error: any) => {
        this._spinner.hide();
        this.toastr.error(this.messageErreur(error, 'Erreur lors du chargement des articles.'), 'Erreur!');
      }
    );
  }

  OnChangeType(type: string) {
    this.articleForm.patchValue({ type, articleId: null });
  }

  OnCloseModal() {
    this.isModalOpen = false;
    this.articleForm.reset({ type: 'emballage', articleId: null });
  }

  onSubmit(): void {
    if (this.articleForm.invalid) {
      this.toastr.warning(
        this.articleForm.value.type === 'plastique' ? 'Veuillez choisir un plastique.' : 'Veuillez choisir un emballage.'
      );
      return;
    }
    const { type, articleId } = this.articleForm.value;
    const data: any = { listeId: this.listeSelectionnee.id };
    if (type === 'plastique') data.plastiqueNuId = articleId;
    else data.emballageId = articleId;
    this._spinner.show();
    this.articleService.AddArticleInterchangeable(data).then(
      (response: any) => {
        this._spinner.hide();
        this.OnCloseModal();
        this.GetListes();
        this.toastr.success(response.message);
      },
      (error: any) => {
        this._spinner.hide();
        this.toastr.error(this.messageErreur(error, "Erreur lors de l'ajout."), 'Erreur!');
      }
    );
  }

  OnDelete(id: any) {
    ALERT_QUESTION('warning', 'Attention !', 'Voulez-vous retirer cet article de la liste ?').then((res) => {
      if (res.isConfirmed == true) {
        this._spinner.show();
        this.articleService.DeleteArticleInterchangeable(id).then(
          (res: any) => {
            this._spinner.hide();
            this.toastr.success(res.message);
            this.GetListes();
          },
          (error: any) => {
            this._spinner.hide();
            this.toastr.error(this.messageErreur(error, 'Erreur lors de la suppression.'), 'Erreur!');
          }
        );
      }
    });
  }

  // Les erreurs de validation Nest arrivent sous forme de tableau de messages
  private messageErreur(error: any, defaut: string) {
    const message = error?.error?.message;
    if (Array.isArray(message)) return message.join(', ');
    return message || defaut;
  }

  // ── Référentiels ────────────────────────────────────────────────────────

  GetFournisseursList() {
    this._coreService.GetFournisseurList().then((res: any) => {
      this.dataListFournisseurs = res.data || [];
    });
  }

  GetTypePrixList() {
    let data = {
      paginate: false,
      page: 1,
      limit: 8,
    };
    this.articleService.GetListTypePrix(data).then((res: any) => {
      this.dataListTypePrix = (res.data || []).sort((a: any, b: any) => (a.libelle || '').localeCompare(b.libelle || ''));
    });
  }
}
