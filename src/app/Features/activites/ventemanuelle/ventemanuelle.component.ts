import {Component} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {NgxSpinnerService} from "ngx-spinner";
import {ArticleServiceService} from "../../../core/article-service.service";
import {ToastrService} from "ngx-toastr";
import {Location} from "@angular/common";
import {of} from 'rxjs';
import {NgWizardConfig, NgWizardService, StepChangedArgs, StepValidationArgs, STEP_STATE, THEME} from 'ng-wizard';
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
  rdvDate: string = '';
  articlesVendus: any = []
  emballageRecup: any = []
  pointDeVente: any = []
  client: any
  stepStates = {
    normal: STEP_STATE.normal,
    disabled: STEP_STATE.disabled,
    error: STEP_STATE.error,
    hidden: STEP_STATE.hidden,
  };

  config: NgWizardConfig = {
    selected: 0,
    theme: THEME.arrows,
    lang: {
      next: 'Suivant ➡',
      previous: '⬅ Retour'
    },
    toolbarSettings: {
      toolbarExtraButtons: [
        {
          text: 'Valider',
          class: 'btn btn-success',
          event: () => {
            this.valider();
          },
        },
      ],
    },
  };

  search: string = '';

  constructor(private utilisateurService: UtilisateurResolveService, private activiteService: ActiviteService, private fb: FormBuilder, private ngWizardService: NgWizardService, private route: ActivatedRoute, private _spinner: NgxSpinnerService, private toastr: ToastrService,
              private articleService: ArticleServiceService, private location: Location) {
    this.route.queryParams.subscribe(params => {
      this.venteId = params['id'];
      this.GetListVenteChineById(this.venteId)
    });
    this.VenteForm = this.fb.group({
      commercialId: [null, Validators.required],
      articles: this.fb.array([]),
      articlesGratuit: this.fb.array([]),
    });
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

    this.emballageRecup = (this.updateData.articles || [])
      .filter((article: any) => article.liquide?.quantite > 0) // garder uniquement ceux dont le liquide a une quantité > 0
      .map((article: any) => article)                 // extraire l’emballage
      .filter((emballage: any) => !!emballage);                 // sécurité pour éviter null/undefined


    console.log(this.emballageRecup)
  }

  emballageCalcul(article: any) {
    article.prixEmballage = article.emballage.quantite ? article.prixUnitaireEmballage * article.emballage.quantite :  article.prixUnitaireEmballage * article.liquide.quantite || 0
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
    const montantTotal = articles.reduce((sum: any, a: any) => sum + a.montantTotal, 0);
    const emballage = this.emballageRecup.map((a: any) => a.emballage);

    const data = {
      "venteChineId": Number(this.venteId),
      "clientId": this.client.id,
      "montantTotal": montantTotal,
      "articles": articles,
      "articlesGratuit": [],
      "signatureBase64": "xxxx"
    }
    // const articlesObject = this.emballageRecup.map((article: any) => ({
    //   codeArticle: article.emballage.code,
    //   quantite: article.emballage.quantite,
    //   prixUnitaireEmballage: Number(article.prixUnitaireEmballage)
    // }));

    let articlesVente: any[] = [];
    let articlesObject: any[] = [];

    if (this.mode === 'COMPTANT') {
      this.emballageRecup.forEach((article: any) => {
        const quantite = Number(article.emballage.quantite);

        if (quantite > 0) {
          // Article avec quantité spécifiée → vente
          articlesVente.push({
            codeArticle: article.emballage.code,
            quantite,
            prixUnitaireEmballage: Number(article.prixUnitaireEmballage)
          });
        } else {
          // Sinon, il reste dans le panier
          articlesObject.push(article);
        }
      });
    } else {
      // Si ce n’est pas COMPTANT, on garde tout dans le panier d'origine
      articlesObject = [...this.emballageRecup];
    }

// 🔄 On remplace le panier original par la version mise à jour
    this.emballageRecup = articlesObject;

    const returnObject = {
      "depotId": this.updateData.commercial.depot.id,
      "commandeCliOrGratuitCode": this.updateData.numVenteChine,
      "venteChineId": Number(this.venteId),
      "returnType": this.mode,
      ...((this.mode === 'APPOINTMENT' || this.mode === 'COMPTANT') && { "appointmentDate": "2023-10-15T10:00:00Z" }),
      "montantAPercevoir": this.mode === 'COMPTANT' ? articlesObject.map((a:any)=>{ return ++a.prixUnitaireEmballage;}) : 0,
      "clientId": this.client.id,
      "clientType": "POINT DE VENTE",
      "articles": articlesObject,
      "signatureBase64": "",
      "articlesVente": articlesVente
    }
    console.log(returnObject)
    console.log(this.emballageRecup)
    this.activiteService.CreateVenteGlobal(data).then(
      (response: any) => {
        console.log(response);
        if (response.statusCode == 201) {
          this.toastr.success('Succès', response.message);
          this.activiteService.RetourEmballageManual(returnObject).then(
            (res: any) => {
              if (res.statusCode == 201) {
                this.toastr.success('Succès', response.message);
              } else {
                this.toastr.error('Erreur!', response.message);
              }
            },
            (error: any) => {
              this.toastr.error('Erreur!', error.message);
            }
          );
        } else {
          this.toastr.error('Erreur!', response.message);
        }
      },
      (error: any) => {
        this.toastr.error('Erreur!', error.message);
      }
    );
  }

  retour() {
    console.log('Retour en arrière');
  }


  showPreviousStep(event?: Event) {
    this.ngWizardService.previous();
  }

  showNextStep(event?: Event) {
    this.ngWizardService.next();
  }

  resetWizard(event?: Event) {
    this.ngWizardService.reset();
  }

  setTheme(theme: THEME) {
    this.ngWizardService.theme(theme);
  }

  stepChanged(args: StepChangedArgs) {
    console.log(args.step);
  }

  isValidTypeBoolean: boolean = true;

  isValidFunctionReturnsBoolean(args: StepValidationArgs) {
    return true;
  }

  isValidFunctionReturnsObservable(args: StepValidationArgs) {
    return of(true);
  }

  protected readonly console = console;
}
