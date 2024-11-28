import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ArticleServiceService } from 'src/app/core/article-service.service';
import { CoreServiceService } from 'src/app/core/core-service.service';


@Component({
  selector: 'app-transfert-de-stock',
  templateUrl: './transfert-de-stock.component.html',
  styleUrls: ['./transfert-de-stock.component.scss']
})
export class TransfertDeStockComponent implements OnInit {
  transfertForm!: FormGroup;
  articleList:any
  depotList:any
  constructor(private _coreService:CoreServiceService,private fb: FormBuilder,private location: Location,private articleService: ArticleServiceService,
    private _spinner: NgxSpinnerService) {}

  ngOnInit(): void {
    this.transfertForm = this.fb.group({
      numero: [{ value: this.generateNumero(), disabled: true }],
      dateEnregistrement: [null, Validators.required],
      magasinOrigine: [null, Validators.required],
      magasinRecepteur: [null, Validators.required],
      articles: this.fb.array([]),
    });
    this.GetArticleList(1)
    this.GetDepotList(1)
    // Ajouter un article par défaut
    this.addArticle();
  }
  goBack() {
    this.location.back()
  }
  // Génère un numéro de transfert unique
  generateNumero(): string {
    return `T-${new Date().getTime()}`;
  }

  // Accéder aux articles comme un FormArray
  get articles(): FormArray {
    return this.transfertForm.get('articles') as FormArray;
  }

  // Ajouter un article
  addArticle(): void {
    const articleForm = this.fb.group({
      codeArticle: [null, Validators.required],
      description: [''],
      quantite: [null, [Validators.required, Validators.min(1)]],
    });
    this.articles.push(articleForm);
  }

  // Supprimer un article
  removeArticle(index: number): void {
    this.articles.removeAt(index);
  }
  GetArticleList(page:number) {
    let data = {
      paginate: false,
      page: page,
      limit: 8,
    };
    this._spinner.show();
    this.articleService.GetArticleList(data).then((res: any) => {
      console.log('DATATYPEPRIX:::>', res);
      this.articleList = res.data;
      this._spinner.hide();
    });
  }

  GetDepotList(page:number) {
    let data = {
      paginate: false,
      page: page,
      limit: 8,
    };
    this._spinner.show();
    this._coreService.GetDepotList(data).then((res: any) => {
      console.log('DATATYPEPRIX:::>', res);
      this.depotList = res.data;
      this._spinner.hide();
    });
  }
  // Calculer le total des produits transférés
  get totalProduits(): number {
    return this.articles.controls.reduce((total, control) => {
      return total + (control.get('quantite')?.value || 0);
    }, 0);
  }

  // Soumission du formulaire
  onSubmit(): void {
    if (this.transfertForm.valid) {
      const formData = {
        ...this.transfertForm.getRawValue(),
        numero: this.transfertForm.get('numero')?.value,
        totalProduits: this.totalProduits,
      };
      console.log('Données du transfert :', formData);
      alert('Transfert enregistré avec succès.');
    } else {
      alert('Veuillez remplir tous les champs requis.');
    }
  }
}
