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
  updateData: any = {};
  regroupementId: number = 0;
  vehiculeId: number = 0;
  mode: string = 'IMMEDIATE';
  isRdv: boolean = false;
  rdvDate: string = '';
  articlesLivres: any = [];
  emballageRecup: any = [];
  currentStep: number = 1;
  totalSteps: number = 4;

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
    this.articleService.GetListCommandeClientById(id).then(
      (response: any) => {
        this.updateData = response.data;
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
    this.activiteService.GetRegroupementByCommandeId(commandeId).then(
      (res: any) => {
        if (!res.data) {
          this.toastr.warning('Cette commande n\'est pas encore regroupée.');
          this.location.back();
          return;
        }
        this.regroupementId = res.data.id || 0;
        this.vehiculeId = res.data.vehicule?.id || 0;
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

  get step3Valid(): boolean {
    if (this.mode === 'APPOINTMENT') {
      return !!this.rdvDate;
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
      if (this.currentStep === 3) this.toastr.warning('Veuillez saisir la date du RDV.');
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
    this.mode = m;
  }

  valider() {
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

    const articlesRetour = this.emballageRecup.map((article: any) => ({
      quantite: article.emballage.quantite ?? article.liquide.quantite,
      codeArticle: article.emballage.code,
      venteChineArticleId: article.id,
      libelle: article.emballage.libelle,
      liquideId: article.liquide.id,
      emballageId: article.emballage.id,
      prixUnitaire: Number(article.prixUnitaireEmballage),
      prixUnitaireEmballage: Number(article.prixUnitaireEmballage)
    }));

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
            articles: articlesRetour,
            interchanges: [],
            ...((this.mode === 'APPOINTMENT' || this.mode === 'COMPTANT') && {
              appointmentDate: this.isRdv ? this.rdvDate : null
            }),
            signatureBase64: 'data:image/'
          }
        };

        console.log('livraisonId:', livraisonId, 'payload:', payload);
        this.activiteService.LivrerAvecRetour(payload).then(
          (response: any) => {
            this._spinner.hide();
            if (response.statusCode == 201) {
              this.toastr.success('Succès', response.message);
              this._router.navigate(['feature/activites/commandes-clients']);
            } else {
              this.toastr.error('', response.message);
            }
          },
          (error: any) => {
            this._spinner.hide();
            this.toastr.error('Erreur!', error.message);
          }
        );
      },
      (error: any) => {
        this._spinner.hide();
        this.toastr.error('Erreur lors de la création de la livraison', error?.error?.message || error.message);
      }
    );
  }
}
