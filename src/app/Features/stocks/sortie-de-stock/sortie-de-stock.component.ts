import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ArticleServiceService } from 'src/app/core/article-service.service';
import { CoreServiceService } from 'src/app/core/core-service.service';

@Component({
  selector: 'app-sortie-de-stock',
  templateUrl: './sortie-de-stock.component.html',
  styleUrls: ['./sortie-de-stock.component.scss']
})
export class SortieDeStockComponent {
  stockForm!: FormGroup;
  articleList:any
  depotList:any
  constructor(private _coreService:CoreServiceService,private fb: FormBuilder,private location: Location,private articleService: ArticleServiceService,
    private _spinner: NgxSpinnerService) {}
  ngOnInit(): void {
    this.stockForm = this.fb.group({
      numero: [{ value: this.generateNumero(), disabled: true }], // Généré automatiquement
      dateEnregistrement: [new Date().toISOString().split('T')[0], Validators.required],
      dateDocument: ['', Validators.required],
      codeArticle: ['', Validators.required],
      description: ['', Validators.required],
      quantite: [0, [Validators.required, Validators.min(1)]],
      magasin: ['', Validators.required],
      stockDisponible: [{ value: 100, disabled: true }], // Exemple de valeur initiale
      commentaire: ['', Validators.required],
    });
    this.GetDepotList(1)
    this.GetArticleList(1)
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
  generateNumero(): string {
    return 'DSTK-' + Date.now();
  }
  goBack() {
    this.location.back()
  }
  onSubmit(): void {
    if (this.stockForm.valid) {
      const formValues = this.stockForm.getRawValue();
  
      // Simulation de déduction de stock
      const stockAvant = formValues.stockDisponible;
      const quantiteDeduite = formValues.quantite;
  
      if (quantiteDeduite > stockAvant) {
        alert("Erreur : La quantité à déduire dépasse le stock disponible.");
        return;
      }
  
      const stockApres = stockAvant - quantiteDeduite;
  
      console.log('Données soumises :', {
        ...formValues,
        stockApres
      });
  
      alert('Réduction de stock enregistrée avec succès.');
    } else {
      alert('Formulaire invalide.');
    }
  }
  
}
