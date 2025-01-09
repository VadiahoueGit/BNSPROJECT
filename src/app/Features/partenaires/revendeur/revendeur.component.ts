import { Location } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  ListZoneLivraison: any[] = [];
  localites: any[] = [];
  categories: any[] = [];
  clientTypes: any[] = [];
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
    private _articleService: ArticleServiceService
  ) {}
  ngOnInit(): void {
    this.revendeurForm = this.fb.group({
      photo: [null, Validators.required],
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      latitude: ['', [Validators.required]],
      longitude: ['', [Validators.required]],
      contactGerant: ['', [Validators.required]],
      telephone: ['', [Validators.required]],
      localiteId: [null],
      zoneLivraisonId: [null, Validators.required],
      groupeClientId: [null, Validators.required],
      depotId: [null, Validators.required],
      nomEtablissement: [null, Validators.required],
    });
    this._articleService.ListGroupeRevendeurs.subscribe((res: any) => {
      console.log(res, 'res client groupe');
      this.clientTypes = res;
    });
    this.coreService.listLocalite.subscribe((res: any) => {
      console.log(res, 'res localites');
      this.localites = res;
    });
    this.coreService.ListZoneLivraison.subscribe((res: any) => {
      console.log(res, 'res ListDepots');
      this.ListZoneLivraison = res;
    });
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
  onSubmit() {}
  OnEdit(id: number) {}
  OnValidate(id: number) {}
  OnDelete(id: number) {}
}
