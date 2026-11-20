import {Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {NgxSpinnerService} from 'ngx-spinner';
import {ToastrService} from 'ngx-toastr';
import {Location} from '@angular/common';
import {ArticleServiceService} from '../../../../core/article-service.service';
import {ActiviteService} from '../../../../core/activite.service';

@Component({
  selector: 'app-vente-au-depot',
  templateUrl: './vente-au-depot.component.html',
  styleUrls: ['./vente-au-depot.component.scss']
})
export class VenteAuDepotComponent {
  commandeId: number;
  // 'client' (défaut, CommandeClient) ou 'gratuite' (CommandeGratuite) — vient du queryParam
  // "source" passé par l'écran d'origine (saisie-commande / saisie-commande-gratuite).
  commandeSource: string = 'client';
  updateData: any = {};
  regroupementId: number = 0;
  vehiculeId: number = 0;
  transporteurId: number = 0;
  transporteur: any = null;
  mode: string = 'IMMEDIATE';
  isRdv: boolean = false;
  rdvDate: string = '';
  articlesLivres: any = [];
  emballageRecup: any = [];
  currentStep: number = 1;
  totalSteps: number = 4;
  isSubmitting: boolean = false;

  steps = [
    { num: 1, label: 'Articles',     icon: 'fas fa-box-open' },
    { num: 2, label: 'Récapitulatif', icon: 'fas fa-list-check' },
    { num: 3, label: 'Emballages',    icon: 'fas fa-recycle' },
    { num: 4, label: 'Validation',    icon: 'fas fa-check-circle' },
  ];

  constructor(
    private _router: Router,
    private activiteService: ActiviteService,
    private route: ActivatedRoute,
    private _spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private articleService: ArticleServiceService,
    private location: Location
  ) {
    this.route.queryParams.subscribe(params => {
      this.commandeId = params['id'];
      this.commandeSource = params['source'] || 'client';
      this.GetCommandeClientById(this.commandeId);
    });

    const today = new Date();
    this.rdvDate = today.toISOString().split('T')[0];
  }

  goBack() {
    this.location.back();
  }

  GetCommandeClientById(id: number) {
    this._spinner.show();
    const loader = this.commandeSource === 'gratuite'
      ? this.articleService.GetListCommandeGratuiteById(id)
      : this.articleService.GetListCommandeClientById(id);
    loader.then(
      (response: any) => {
        this.updateData = response.data;
        if (this.updateData.statut === 'Annulée') {
          this._spinner.hide();
          this.toastr.error('Cette commande a été annulée.');
          this.location.back();
          return;
        }
        (this.updateData.articles || []).forEach((a: any) => {
          a.liquide.quantite = a.quantite;
        });
        this._spinner.hide();
        this.LoadRegroupementByCommande(id);
      },
      (error: any) => {
        this._spinner.hide();
        this.toastr.error('Erreur!', error.message);
      }
    );
  }

  LoadRegroupementByCommande(commandeId: number) {
    this.activiteService.GetRegroupementByCommandeId(commandeId, this.commandeSource).then(
      (res: any) => {
        if (!res.data) {
          this.toastr.warning('Cette commande n\'est pas encore regroupée.');
          this.location.back();
          return;
        }
        this.regroupementId = res.data.id || 0;
        this.vehiculeId = res.data.vehicule?.id || 0;
        this.transporteurId = res.data.transporteur?.id || 0;
        this.transporteur = res.data.transporteur || null;
      },
      () => {
        this.toastr.error('Impossible de vérifier le regroupement.');
        this.location.back();
      }
    );
  }

  get totalLivraison(): number {
    return (this.updateData.articles || []).reduce((sum: number, a: any) => {
      const q = a.liquide?.quantite || 0;
      return sum + Number(a.prixUnitaireLiquide) * q;
    }, 0);
  }

  get totalQteLivree(): number {
    return (this.articlesLivres || []).reduce((sum: number, a: any) => sum + (a.liquide?.quantite || 0), 0);
  }

  get totalEmballage(): number {
    return this.emballageRecup.reduce((sum: number, a: any) => {
      const q = a.emballage?.quantite || 0;
      return sum + Number(a.prixUnitaireEmballage) * q;
    }, 0);
  }

  get step1Valid(): boolean {
    return (this.updateData.articles || []).some((a: any) => (a.liquide?.quantite || 0) > 0);
  }

  get step2Valid(): boolean {
    return this.articlesLivres.length > 0;
  }

  get hasEmptyEmballageQuantite(): boolean {
    return this.emballageRecup.some(
      (a: any) => a.emballage.quantite === null || a.emballage.quantite === undefined || a.emballage.quantite === ''
    );
  }

  get step3Valid(): boolean {
    if (this.mode === 'APPOINTMENT') {
      return !!this.rdvDate && !this.hasEmptyEmballageQuantite;
    }
    return true;
  }

  get currentStepValid(): boolean {
    if (this.currentStep === 1) return this.step1Valid;
    if (this.currentStep === 2) return this.step2Valid;
    if (this.currentStep === 3) return this.step3Valid;
    return true;
  }

  nextStep() {
    if (!this.currentStepValid) {
      if (this.currentStep === 1) this.toastr.warning('Saisissez au moins une quantité pour continuer.');
      if (this.currentStep === 2) this.toastr.warning('Aucun article à livrer.');
      if (this.currentStep === 3) {
        this.toastr.warning(
          this.mode === 'APPOINTMENT' && this.hasEmptyEmballageQuantite
            ? 'Veuillez saisir la quantité pour chaque emballage.'
            : 'Veuillez saisir la date du RDV.'
        );
      }
      return;
    }
    if (this.currentStep === 1) {
      this.validate();
    }
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goToStep(step: number) {
    if (step < this.currentStep) {
      this.currentStep = step;
    }
  }

  validate() {
    this.articlesLivres = (this.updateData.articles || []).filter(
      (article: any) => article.liquide?.quantite > 0
    );

    this.articlesLivres.forEach((article: any) => {
      if (article.emballage && article.emballage.code !== 'VD0') {
        article.emballage.quantite = article.liquide.quantite;
      }
    });

    this.emballageRecup = (this.updateData.articles || [])
      .filter((article: any) => article.liquide?.quantite > 0)
      .filter((article: any) => article.emballage && article.emballage.code !== 'VD0' && Number(article.prixUnitaireEmballage) > 0);

    console.log(this.emballageRecup);
  }

  emballageCalcul(article: any) {
    if (
      article.emballage.quantite !== article.liquide.quantite &&
      (this.mode === 'COMPTANT' || this.mode === 'APPOINTMENT')
    ) {
      this.isRdv = true;
    } else {
      this.isRdv = false;
    }
  }

  setMode(m: string) {
    const previousMode = this.mode;
    this.mode = m;
    // En mode RDV, la quantité récupérée plus tard doit être saisie explicitement par
    // l'utilisateur (pas de pré-remplissage avec la quantité livrée) pour éviter qu'un
    // RDV soit validé par erreur avec la totalité des emballages.
    if (m === 'APPOINTMENT' && previousMode !== 'APPOINTMENT') {
      this.emballageRecup.forEach((article: any) => {
        article.emballage.quantite = null;
      });
    } else if (previousMode === 'APPOINTMENT' && m !== 'APPOINTMENT') {
      this.emballageRecup.forEach((article: any) => {
        article.emballage.quantite = article.liquide.quantite;
      });
    }
  }

  valider() {
    if (this.isSubmitting) return;
    this.isSubmitting = true;
    const articles = this.articlesLivres.map((article: any) => ({
      venteChineArticleId: article.id,
      libelle: article.liquide.libelle,
      quantite: article.liquide.quantite,
      liquideId: article.liquide.id,
      emballageId: article.emballage.id,
      prixUnitaire: Number(article.prixUnitaireLiquide)
    }));

    const montantAPercevoirLivraison = articles.reduce(
      (sum: number, a: any) => sum + a.prixUnitaire * a.quantite, 0
    );

    const toEmballageEntry = (article: any, quantite: number) => ({
      quantite,
      codeArticle: article.emballage.code,
      venteChineArticleId: article.id,
      libelle: article.emballage.libelle,
      liquideId: article.liquide.id,
      emballageId: article.emballage.id,
      prixUnitaire: Number(article.prixUnitaireEmballage),
      prixUnitaireEmballage: Number(article.prixUnitaireEmballage)
    });

    const articlesRetour = this.emballageRecup.map((a: any) =>
      toEmballageEntry(a, a.emballage.quantite ?? a.liquide.quantite)
    );

    // APPOINTMENT / COMPTANT : split entre retour immédiat et RDV/vente
    const articlesImmediat: any[] = [];
    const articlesRDV: any[] = [];
    if (this.mode === 'APPOINTMENT') {
      // La quantité saisie par l'utilisateur dans "emballage.quantite" est celle qui doit
      // faire l'objet du RDV (à récupérer plus tard) ; le reliquat (théorique - saisie) est
      // récupéré immédiatement. Même sens que le mode COMPTANT ci-dessous — cette branche
      // avait les deux tableaux cibles inversés, faisant atterrir les articles du RDV dans
      // le retour immédiat (RDV créé vide en base, articles visibles uniquement via le
      // fallback d'affichage du Bon de Livraison).
      this.emballageRecup.forEach((article: any) => {
        const qteRdv = Number(article.emballage.quantite) || 0;
        const qteImmediat = (article.liquide.quantite || 0) - qteRdv;
        if (qteRdv > 0) articlesRDV.push(toEmballageEntry(article, qteRdv));
        if (qteImmediat > 0) articlesImmediat.push(toEmballageEntry(article, qteImmediat));
      });
    }
    if (this.mode === 'COMPTANT') {
      this.emballageRecup.forEach((article: any) => {
        const qteVente = Number(article.emballage.quantite) || 0;
        const qteRdv = (article.liquide.quantite || 0) - qteVente;
        if (qteVente > 0) articlesRDV.push(toEmballageEntry(article, qteVente));
        if (qteRdv > 0) articlesImmediat.push(toEmballageEntry(article, qteRdv));
      });
    }

    const montantAPercevoir = articlesRetour.reduce(
      (sum: number, a: any) => sum + a.prixUnitaireEmballage * a.quantite, 0
    );

    this._spinner.show();
    this.activiteService.CreateLivraison({
      regroupementId: this.updateData.regroupementId,
      NumCommande: this.updateData.NumCommande
    }).then(
      (livraisonRes: any) => {
        const livraisonId = livraisonRes?.data?.data?.id;
        const commandeId = livraisonRes?.data?.data?.commande?.id;

        const payload = {
          numCommande: this.updateData.NumCommande,
          vehiculeId: this.vehiculeId,
          regroupementId: this.updateData.regroupementId,
          commandeId: commandeId,
          livraisonId: livraisonId,
          montantAPercevoirLivraison: montantAPercevoirLivraison,
          depotId: this.updateData.depot.id,
          articlesPlein: [],
          articles: articles,
          signatureBase64: 'data:image/',
          retour: {
            clientId: this.updateData.client.id,
            clientType: 'REVENDEUR',
            commandeCliOrGratuitCode: this.updateData.NumCommande,
            returnType: this.mode,
            montantAPercevoir: montantAPercevoir,
            depotId: this.updateData.depot.id,
            articles: this.mode === 'IMMEDIATE' ? articlesRetour : articlesImmediat,
            ...((this.mode === 'COMPTANT' || this.mode === 'APPOINTMENT') && { articlesVente: articlesRDV }),
            interchanges: [],
            ...((this.mode === 'APPOINTMENT' || this.mode === 'COMPTANT') && {
              appointmentDate: this.mode === 'APPOINTMENT' ? this.rdvDate : (this.isRdv ? this.rdvDate : null)
            }),
            signatureBase64: 'data:image/'
          }
        };

        console.log('livraisonId:', livraisonId, 'payload:', payload);
        const articlesNonVendus = (this.updateData.articles || [])
          .filter((a: any) => (a.quantite - (a.liquide?.quantite || 0)) > 0)
          .map((a: any) => ({
            idArticle: a.id,
            quantite: a.quantite - (a.liquide?.quantite || 0),
            codeArticleLiquide: a.liquide?.code,
            codeArticleEmballage: a.emballage?.code !== 'VD0' ? a.emballage?.code : undefined,
            prixUnitaireLiquide: Number(a.prixUnitaireLiquide),
            prixUnitaireEmballage: Number(a.prixUnitaireEmballage),
            isFree: false
          }));

        this.activiteService.LivrerAvecRetour(payload).then(
          (response: any) => {
            if (response.statusCode == 201) {
              if (articlesNonVendus.length > 0 && this.transporteurId) {
                this.activiteService.CreateRetourPlein({
                  numCommande: this.updateData.NumCommande,
                  depotId: this.updateData.depot.id,
                  vehiculeId: this.vehiculeId,
                  transporteurId: this.transporteurId,
                  source: 'DEPOT',
                  articles: articlesNonVendus
                }).then(() => {
                  this._spinner.hide();
                  this.isSubmitting = false;
                  this.toastr.success('Succès', response.message);
                  this._router.navigate(['feature/activites/commandes-clients']);
                }).catch(() => {
                  this._spinner.hide();
                  this.isSubmitting = false;
                  this.toastr.success('Succès', response.message);
                  this._router.navigate(['feature/activites/commandes-clients']);
                });
              } else {
                this._spinner.hide();
                this.isSubmitting = false;
                this.toastr.success('Succès', response.message);
                this._router.navigate(['feature/activites/commandes-clients']);
              }
            } else {
              this._spinner.hide();
              this.isSubmitting = false;
              this.toastr.error('', response.message);
            }
          },
          (error: any) => {
            this._spinner.hide();
            this.isSubmitting = false;
            this.toastr.error('Erreur!', error.message);
          }
        );
      },
      (error: any) => {
        this._spinner.hide();
        this.isSubmitting = false;
        this.toastr.error('Erreur lors de la création de la livraison', error?.error?.message || error.message);
      }
    );
  }
}
