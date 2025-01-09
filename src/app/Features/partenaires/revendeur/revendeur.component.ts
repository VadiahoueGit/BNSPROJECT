import { Location } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ArticleServiceService } from 'src/app/core/article-service.service';
import { CoreServiceService } from 'src/app/core/core-service.service';

@Component({
  selector: 'app-revendeur',
  templateUrl: './revendeur.component.html',
  styleUrls: ['./revendeur.component.scss'],
})
export class RevendeurComponent {
  dataList: any[] = [];
  produits: any[] = [];
  depots: any[] = [];
  zoneLivraison: any[] = [];
  localites: any[] = [];
  categories: any[] = [];
  clientTypes: any[] = [];
  ListGroupesArticles: any[] = [];
  currentPage: number;
  rowsPerPage: any;
  revendeurForm!: FormGroup;
  operation: string = '';
  isModalOpen: boolean = false;
  constructor(
    private cd: ChangeDetectorRef,
    private fb: FormBuilder,
    private location: Location,
    private coreService: CoreServiceService,
    private _articleService: ArticleServiceService,
    private _spinner: NgxSpinnerService,
    
  ) {}
  ngOnInit(): void {
     this.revendeurForm = this.fb.group({
      groupeClientId: [null, Validators.required],
      categorieClientId: [null,],
      codeApplication: [null, Validators.required],
      codeClient: [null],
      userLogin: [null, Validators.required],
      registreCommerce: [null],
      raisonSociale: [null, Validators.required],
      agentCommercial: [null],
      contact: [null],
      localisation: [null,Validators.required],
      telephone: [null, [Validators.required, Validators.pattern(/^[+]?[\d\s-]+$/)]],
      localiteId: [null,],
      depotId: [null, Validators.required],
      zoneDeLivraisonId: [null,Validators.required],
      nomProprietaire: [null,Validators.required],
      telProprietaire: [null,Validators.required],
      nomGerant: [null,Validators.required],
      telGerant: [null,Validators.required],
      quantiteMinimum: [null, Validators.min(0)],
      compteContribuable: [null,Validators.required],
      familleProduitId: [null,Validators.required]
    });
    console.log(this.revendeurForm.value,'form value')
    this._articleService.ListGroupeRevendeurs.subscribe((res: any) => {
      console.log(res, 'res client groupe');
      this.clientTypes = res;
    });
    this.coreService.listLocalite.subscribe((res: any) => {
      console.log(res, 'res localites');
      this.localites = res;
    });
    this._articleService.ListGroupesArticles.subscribe((res: any) => {
      console.log(res, 'res ListGroupesArticles');
      this.ListGroupesArticles = res;
    });
  
    // this.GetLocaliteList();
    this.GetDepotList();
    this.GetZoneList();
  }
  goBack() {
    this.location.back();
  }
  onPage(event: any) {
    this.currentPage = event.first / event.rows + 1; // Calculer la page actuelle (1-based index)
    this.rowsPerPage = event.rows;
    // this.GetClientOSRList(this.currentPage);
  }
  OnCreate() {
    this.isModalOpen = true;
    this.operation = 'create';
  }
  OnCloseModal() {
    this.isModalOpen = false;
  }
  onDepotChange(event: any): void {
    const depotId = event?.id;
    console.log(event, 'depotId');
    if (depotId) {
      this.getDepotDetails(depotId);
    }
  }
  GetDepotList() {
    let data = {
      paginate: false,
      page: 1,
      limit: 8,
    };
    this._spinner.show();
    this.coreService.GetDepotList(data).then((res: any) => {
      this.depots = res.data;
      console.log('GetDepotList:::>', this.depots);
      this._spinner.hide();
    });
  }
  GetZoneList() {
    let data = {
      paginate: false,
      page: 1,
      limit: 8,
    };
    this._spinner.show();
    this.coreService.GetZoneList(data).then((res: any) => {
      console.log('GetZoneList:::>', res);
      this.zoneLivraison = res.data;
      this._spinner.hide();
    });
  }
  getDepotDetails(depotId: number): void {
    this.coreService
      .GetDepotDetail(depotId)
      .then((response: any) => {
        if (response) {
          console.log(response, 'response');
          this.revendeurForm.patchValue({
            localiteId: response.data.zone.localite?.id || null,
          });
        }
      })
      .catch((error: any) => {
        console.error(
          'Erreur lors de la récupération des informations du dépôt:',
          error
        );
      });
  }
  onSubmit() {
    console.log(this.revendeurForm.value,'form value')
  }
  OnEdit(id: number) {}
  OnValidate(id: number) {}
  OnDelete(id: number) {}
}
