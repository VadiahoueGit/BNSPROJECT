import {Component} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {NgxSpinnerService} from "ngx-spinner";
import {ArticleServiceService} from "../../../core/article-service.service";
import {ToastrService} from "ngx-toastr";
import {Location} from "@angular/common";
import {FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ActiviteService} from "../../../core/activite.service";
import {UtilisateurResolveService} from "../../../core/utilisateur-resolve.service";

@Component({
  selector: 'app-ventemanuelle',
  templateUrl: './ventemanuelle.component.html',
  styleUrls: ['./ventemanuelle.component.scss']
})
export class VentemanuelleComponent {
  venteId: number;
  updateData: any
  prixLiquide: any = {};
  prixLiquideFree: any = {};
  prixEmballage: any = {};
  prixEmballageFree: any = {};
  prixLiquideTotal: any = {};
  totalLiquide: number = 0;
  totalEmballage: number = 0;
  totalGlobal: number = 0;
  totalQte: number = 0;
  totalQteFree: number = 0;
  totalGlobalFree: number = 0;
  prixEmballageTotal: any = {};
  montantTotal: any = {};
  VenteForm: FormGroup;
  mode: string = 'IMMEDIATE';
  isRdv: boolean = false;
  rdvDate: string = '';
  articlesVendus: any = []
  articlesGratuits: any = []
  emballageRecup: any = []
  pointDeVente: any = []
  client: any = null
  currentStep: number = 1;
  totalSteps: number = 4;

  steps = [
    { num: 1, label: 'Articles',      icon: 'fas fa-box-open' },
    { num: 2, label: 'Récapitulatif', icon: 'fas fa-list-check' },
    { num: 3, label: 'Emballages',    icon: 'fas fa-recycle' },
    { num: 4, label: 'Validation',    icon: 'fas fa-check-circle' },
  ];

  constructor(
    private _router: Router,
    private utilisateurService: UtilisateurResolveService,
    private activiteService: ActiviteService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private _spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private articleService: ArticleServiceService,
    private location: Location
  ) {
    this.route.queryParams.subscribe(params => {
      this.venteId = params['id'];
      this.GetListVenteChineById(this.venteId)
    });
    this.VenteForm = this.fb.group({
      commercialId: [null, Validators.required],
      articles: this.fb.array([]),
      articlesGratuit: this.fb.array([]),
    });

    const today = new Date();
    this.rdvDate = today.toISOString().split('T')[0];
  }

  goBack() {
    this.location.back()
  }

  GetListVenteChineById(id: number) {
    this.articleService.GetListVenteChineById(id).then(
      (response: any) => {
        console.log(response);
        this.updateData = response;
        this.LoadPdv(this.updateData.commercial.depot.id)
      },
      (error: any) => {
        this.toastr.error('Erreur!', error.message);
      }
    );
  }

  get articles(): FormArray {
    return this.VenteForm.get('articles') as FormArray;
  }

  get articlesGratuit(): FormArray {
    return this.VenteForm.get('articlesGratuit') as FormArray;
  }

  // ===== TOTAUX =====
  get totalLivraison(): number {
    return (this.updateData?.articles || []).reduce((sum: number, a: any) => {
      return sum + Number(a.prixUnitaireLiquide) * (a.liquide?.quantite || 0);
    }, 0);
  }

  get totalLivraisonGratuit(): number {
    return (this.updateData?.articlesGratuit || []).reduce((sum: number, a: any) => {
      return sum + Number(a.prixUnitaireLiquide) * (a.liquide?.quantite || 0);
    }, 0);
  }

  get totalEmballageRecup(): number {
    return this.emballageRecup.reduce((sum: number, a: any) => {
      return sum + Number(a.prixUnitaireEmballage) * (a.emballage?.quantite || 0);
    }, 0);
  }

  // ===== VALIDATION ETAPES =====
  get step1Valid(): boolean {
    if (!this.client) return false;
    const hasPayant = (this.updateData?.articles || []).some((a: any) => (a.liquide?.quantite || 0) > 0);
    const hasGratuit = (this.updateData?.articlesGratuit || []).some((a: any) => (a.liquide?.quantite || 0) > 0);
    return hasPayant || hasGratuit;
  }

  get step2Valid(): boolean {
    return this.articlesVendus.length > 0 || this.articlesGratuits.length > 0;
  }

  get hasEmptyEmballageQuantite(): boolean {
    return this.emballageRecup.some(
      (a: any) => a.emballage.quantite === null || a.emballage.quantite === undefined || a.emballage.quantite === ''
    );
  }

  get step3Valid(): boolean {
    if (this.mode === 'APPOINTMENT') return !!this.rdvDate && !this.hasEmptyEmballageQuantite;
    return true;
  }

  get currentStepValid(): boolean {
    if (this.currentStep === 1) return this.step1Valid;
    if (this.currentStep === 2) return this.step2Valid;
    if (this.currentStep === 3) return this.step3Valid;
    return true;
  }

  // ===== NAVIGATION =====
  nextStep() {
    if (!this.currentStepValid) {
      if (this.currentStep === 1) {
        if (!this.client) this.toastr.warning('Veuillez sélectionner un point de vente.');
        else this.toastr.warning('Saisissez au moins une quantité pour continuer.');
      }
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
      this.validate(null);
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

  // ===== LOGIQUE METIER (inchangée) =====
  validate(data: any) {
    this.articlesVendus = (this.updateData.articles || []).filter(
      (article: any) => article.liquide?.quantite > 0
    );

    this.articlesVendus.forEach((article: any) => {
      if (article.emballage) {
        article.emballage.quantite = null
        article.emballage.quantite = article.liquide.quantite;
      }
    });

    this.articlesGratuits = (this.updateData.articlesGratuit || []).filter(
      (article: any) => article.liquide?.quantite > 0
    );

    this.articlesGratuits.forEach((article: any) => {
      if (article.emballage) {
        article.emballage.quantite = null
        article.emballage.quantite = article.liquide.quantite;
      }
    });

    const rawEmballages = [
      ...(this.updateData.articles || []),
      ...(this.updateData.articlesGratuit || [])
    ]
      .filter((article: any) => article.liquide?.quantite > 0)
      .filter((article: any) => !!article);

    const emballageMap = new Map<string, any>();
    for (const article of rawEmballages) {
      const key = article.emballage?.libelle || article.emballage?.code || article.emballage?.id;
      if (emballageMap.has(key)) {
        const existing = emballageMap.get(key);
        existing.liquide.quantite += Number(article.liquide?.quantite || 0);
        if (existing.emballage.quantite != null) {
          existing.emballage.quantite += Number(article.emballage?.quantite || 0);
        }
      } else {
        emballageMap.set(key, {
          ...article,
          emballage: { ...article.emballage },
          liquide: { ...article.liquide },
        });
      }
    }
    this.emballageRecup = Array.from(emballageMap.values());

    console.log(this.emballageRecup)
  }

  emballageCalcul(article: any) {
    article.prixEmballage = article.emballage.quantite ? article.prixUnitaireEmballage * article.emballage.quantite : article.prixUnitaireEmballage * article.liquide.quantite || 0

    if (article.emballage.quantite !== article.liquide.quantite &&
      (this.mode === 'COMPTANT' || this.mode === 'APPOINTMENT')){
      this.isRdv = true
    }else{
      this.isRdv = false
    }
  }

  decrement(article: any) {
    if (article.quantite > 0) {
      article.quantite--;
    }
  }

  ChoicePdv(item: any) {
    this.client = item
  }

  LoadPdv(item: any) {
    let data = {
      paginate: false,
      page: 1,
      limit: 8,
      id: item
    };
    this.utilisateurService.GetPointDeVenteListByDepot(data).then((res: any) => {
      this.pointDeVente = res.data
    }, (error: any) => {
      this._spinner.hide()
    })
  }

  valider() {
    if (this.client) {
      console.log(this.articlesVendus)
      const articles = this.articlesVendus.map((article: any) => {
        const quantite = article.liquide.quantite;
        const prixUnitaire = Number(article.prixUnitaireLiquide);
        return {
          venteChineArticleId: article.id,
          liquideId: article.liquide.id,
          emballageId: article.emballage.id,
          quantite: quantite,
          prixUnitaire: prixUnitaire,
          montantTotal: prixUnitaire * quantite
        };
      });

      const articlesGratuit = this.articlesGratuits.map((article: any) => {
        const quantite = article.liquide.quantite;
        // Un article gratuit ne coûte rien au client : ne pas reprendre le prix catalogue.
        return {
          venteChineArticleGratuitId: article.id,
          liquideId: article.liquide.id,
          emballageId: article.emballage.id,
          quantite: quantite,
          prixUnitaire: 0,
          montantTotal: 0
        };
      });

      const montantTotal = articles.reduce((sum: any, a: any) => sum + a.montantTotal, 0);
      const emballage = this.emballageRecup.map((a: any) => a.emballage);

      const vente = {
        "venteChineId": Number(this.venteId),
        "clientId": this.client.id,
        "montantTotal": montantTotal,
        "articles": articles,
        "commercialId": this.updateData.commercial.id,
        "articlesGratuit": articlesGratuit,
        "signatureBase64": "xxxx"
      }
      console.log(this.emballageRecup)

      let articlesVente: any[] = [];
      let articlesObject: any[] = [];
      console.log(this.mode)
      if (this.mode === 'COMPTANT') {
        this.emballageRecup.forEach((article: any) => {
          const quantite = Number(article.emballage.quantite);
          console.log(article)
          if (quantite > 0) {
            console.log(1);
            articlesVente.push({
              venteChineArticleId: article.id,
              libelle: article.emballage.libelle,
              liquideId: article.liquide.id,
              emballageId: article.emballage.id,
              prixUnitaire: Number(article.prixUnitaireEmballage),
              codeArticle: article.emballage.code,
              quantite: article.emballage.quantite ?? 0,
              prixUnitaireEmballage: Number(article.prixUnitaireEmballage)
            });
            if(quantite < article.liquide.quantite) {
              articlesObject.push({
                venteChineArticleId: article.id,
                libelle: article.emballage.libelle,
                liquideId: article.liquide.id,
                emballageId: article.emballage.id,
                prixUnitaire: Number(article.prixUnitaireEmballage),
                codeArticle: article.emballage.code,
                quantite: article.liquide.quantite - article.emballage.quantite ?? 0,
                prixUnitaireEmballage: Number(article.prixUnitaireEmballage)
              });
            }
            console.log(articlesVente)
          } else {
            console.log(2);
            articlesObject.push({
              venteChineArticleId: article.id,
              libelle: article.emballage.libelle,
              liquideId: article.liquide.id,
              emballageId: article.emballage.id,
              prixUnitaire: Number(article.prixUnitaireEmballage),
              codeArticle: article.emballage.code,
              quantite: article.liquide.quantite - article.emballage.quantite ?? 0,
              prixUnitaireEmballage: Number(article.prixUnitaireEmballage)
            });
            console.log(articlesObject)
          }
        });
      } else if (this.mode === 'IMMEDIATE'){
        console.log(2);
        this.emballageRecup.forEach((article: any) => {
          articlesObject.push({
            venteChineArticleId: article.id,
            libelle: article.emballage.libelle,
            liquideId: article.liquide.id,
            emballageId: article.emballage.id,
            prixUnitaire: Number(article.prixUnitaireEmballage),
            codeArticle: article.emballage.code,
            quantite: article.emballage.quantite ?? 0,
            prixUnitaireEmballage: Number(article.prixUnitaireEmballage)
          });
        })
      } else if (this.mode === 'APPOINTMENT') {
        this.emballageRecup.forEach((article: any) => {
          const quantite = Number(article.emballage.quantite);
          console.log(article)
          if (quantite > 0) {
            console.log(1);
            articlesVente.push({
              venteChineArticleId: article.id,
              libelle: article.emballage.libelle,
              liquideId: article.liquide.id,
              emballageId: article.emballage.id,
              prixUnitaire: Number(article.prixUnitaireEmballage),
              codeArticle: article.emballage.code,
              quantite: article.emballage.quantite ?? 0,
              prixUnitaireEmballage: Number(article.prixUnitaireEmballage)
            });
            if(quantite < article.liquide.quantite) {
              articlesObject.push({
                venteChineArticleId: article.id,
                libelle: article.emballage.libelle,
                liquideId: article.liquide.id,
                emballageId: article.emballage.id,
                prixUnitaire: Number(article.prixUnitaireEmballage),
                codeArticle: article.emballage.code,
                quantite: article.liquide.quantite - article.emballage.quantite ?? 0,
                prixUnitaireEmballage: Number(article.prixUnitaireEmballage)
              });
            }
            console.log(articlesVente)
          } else {
            console.log(2);
            articlesObject.push({
              venteChineArticleId: article.id,
              libelle: article.emballage.libelle,
              liquideId: article.liquide.id,
              emballageId: article.emballage.id,
              prixUnitaire: Number(article.prixUnitaireEmballage),
              codeArticle: article.emballage.code,
              quantite: article.liquide.quantite - article.emballage.quantite ?? 0,
              prixUnitaireEmballage: Number(article.prixUnitaireEmballage)
            });
            console.log(articlesObject)
          }
        });
      }

      const returnObject = {
        "depotId": this.updateData.commercial.depot.id,
        "commandeCliOrGratuitCode": this.updateData.numVenteChine,
        "venteChineIdRetour": Number(this.venteId),
        "returnType": this.mode,
        ...((this.mode === 'APPOINTMENT' || this.mode === 'COMPTANT') && {"appointmentDate": this.rdvDate || null }),
        "montantAPercevoir": this.mode === 'COMPTANT'
          ? articlesObject.reduce((total: number, a: any) => total + Number(a.prixUnitaireEmballage || 0), 0)
          : 0,
        "clientId": this.client.id,
        "clientType": "POINT DE VENTE",
        "articles": articlesObject,
        "signatureBase64": "",
        "articlesVente": articlesVente
      }

      const data = {
        vente: vente,
        retour: returnObject
      }
      console.log(data)
      console.log(this.isRdv)
      this.activiteService.CreateVenteGlobal(data).then(
        (response: any) => {
          console.log(response);
          console.log(this.emballageRecup)
          if (response.statusCode == 201) {
            this.toastr.success('Succès', response.message);
            this._router.navigate(['feature/activites/ventechine'])
          } else {
            this.toastr.error('', response.message);
          }
        },
        (error: any) => {
          this.toastr.error('Erreur!', error.message);
        }
      );
    } else {
      this.toastr.error('Veuillez selectionner le client !', 'Erreur!');
    }
  }

  protected readonly console = console;
}
