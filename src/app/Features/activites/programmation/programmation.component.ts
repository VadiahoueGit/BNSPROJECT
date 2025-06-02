import {Component, ViewChild} from '@angular/core';
import {NgxSpinnerService} from "ngx-spinner";
import {ActiviteService} from "../../../core/activite.service";
import {Table} from "primeng/table";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {UtilisateurResolveService} from "../../../core/utilisateur-resolve.service";
import {LogistiqueService} from "../../../core/logistique.service";
import {ToastrService} from "ngx-toastr";
import { ALERT_QUESTION } from '../../shared-component/utils';

@Component({
  selector: 'app-programmation',
  templateUrl: './programmation.component.html',
  styleUrls: ['./programmation.component.scss']
})
export class ProgrammationComponent {
  @ViewChild('dt2') dt2!: Table;
  dataList!: any[];
  daysOfWeek: string[] = [
    'Lundi',
    'Mardi',
    'Mercredi',
    'Jeudi',
    'Vendredi',
    'Samedi',
    'Dimanche'
  ];
  pointDeVente: any = []
  filteredPointDeVente: any[] = [];
  isModalOpen: boolean = false;
  totalPages: number = 0;
  currentPage:any
  VisiteForm: FormGroup;
  rowsPerPage:any
  filters: any = {
    dateDebut: '',
    dateFin: '',
    commercialNomPrenom: ''
  };
  updateData:any;
  operation:string = ''
  commerciaux = []
  vehicules = []
  typeVisite  = []
  selectedItems: any = []
  selectedItemsIds: any = []
  searchForm: FormGroup
  visiteId: number;
  constructor(
    private toastr: ToastrService,
    private fb: FormBuilder,
    private logistiqueService: LogistiqueService,
    private utilisateurService: UtilisateurResolveService,
    private _spinner: NgxSpinnerService,
    private activiteService: ActiviteService
  ) {
    this.searchForm = this.fb.group({
      searchQuery: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.LoadTypeVisite();
    this.LoadCommercial();
    this.GetVehiculeList()
    this.LoadVisite(1);
    this.VisiteForm = this.fb.group({
      typeVisite: [null, Validators.required],
      commercialId: [null, Validators.required],
      pointsDeVenteIds: [null, Validators.required],
      vehiculeId: [null, Validators.required],
      dateVisite: [null, Validators.required],
      repetitionDays: ['', Validators.required],
      repetitionDuration: [{value: 12, disabled: true},],
      IsRepetitive: [true, Validators.required],
    });
  }
  ViewDetails(data: any) {
    this.operation = 'edit'
    this.isModalOpen = true;
    console.log(data);
    this.updateData = data;
  }

  onEdit(data: any) {
    this.operation = 'create';
    this.loadDepotDetails(data)
  }

  onDelete(data: any) {
    ALERT_QUESTION('warning', 'Attention !', 'Voulez-vous supprimer?').then(
      (res:any) => {
        if (res.isConfirmed == true) {
          this._spinner.show();
          this.activiteService.DeletePlanification(data.id).then((res: any) => {
            this.isModalOpen = false;
            console.log('DATA:::>', res);
            this.toastr.success(res.message);
            this.LoadVisite(1);
            this._spinner.hide();
          });
        } else {
        }
      }
    );
  }
  loadDepotDetails(data:any): void {
    this.selectedItems = data.pointsDeVente
    this.selectedItems.forEach((pdv:any) => pdv.isChecked = true);
    this.LoadPdv(data.commercial)
    this.visiteId = data.id
    data.pointsDeVente.forEach((pdv:any) => {
      this.toggleSelection(pdv);
    });

    console.log(this.selectedItems);
    this.VisiteForm.patchValue({
      typeVisite: data.typeVisite.id,
      commercialId: data.commercial.id,
      pointsDeVenteIds: data.pointsDeVente.map((pdv:any) => pdv.id), // ✅ extraire uniquement les IDs
      vehiculeId: data.vehicule.id,
      dateVisite: data.dateDebut,
      repetitionDays: data.repetitionDays,
      repetitionDuration: data.repetitionDuration,
      IsRepetitive: true, // ✅ ne doit pas être un tableau ici
    });


  }
  filterData(): void {
    const query = this.searchForm.get('searchQuery')?.value;

    if (!query) {
      // Si la recherche est vide, on réinitialise la liste filtrée à l'ensemble des points de vente
      this.filteredPointDeVente = this.pointDeVente;
    } else {
      // Sinon, on filtre les points de vente en fonction de la recherche (case insensitive)
      this.filteredPointDeVente = this.pointDeVente.filter((item: any) =>
        item.nomEtablissement.toLowerCase().includes(query.toLowerCase())
      );
    }
  }
  filterGlobal() {
    this.LoadVisite(
      1,
      this.filters.dateDebut,
      this.filters.dateFin,
      this.filters.commercialNomPrenom
    );
  }
  LoadVisite(page: number, dateDebut?: string,dateFin?: string,commercialNomPrenom?: string,) {
    let data = {
      paginate: true,
      page: page,
      limit: 8,
      dateDebut: dateDebut || '',
      dateFin: dateFin || '',
      commercialNomPrenom: commercialNomPrenom || ''
    };
    console.log(data)
    this._spinner.show()
    this.activiteService.GetVisiteProgrammationList(data).then((res: any) => {
      this.totalPages = res.totalPages * data.limit; // nombre total d’enregistrements
      this.dataList = res.data;
      this._spinner.hide()
      console.log('Visite', res)
    }, (error: any) => {
      this._spinner.hide()
    })
  }

  LoadCommercial() {
    let data = {
      paginate: false,
      page: 1,
      limit: 8,
    };
    this.utilisateurService.GetCommercialList(data).then((res: any) => {
        this.commerciaux = res.data.map((commercial: any) => ({
          ...commercial,
          fullLabel: `${commercial.nom} ${commercial.prenoms}` // Exemple de concaténation
        }));
        console.log('commerciaux', res)
      },
      (error: any) => {
        this._spinner.hide()
      })
  }

  GetVehiculeList() {
    let data = {
      paginate: false,
      page: 1,
      limit: 8,
    };
    this.logistiqueService.GetVehiculeList(data).then((res: any) => {
        this.vehicules = res.data
      },
      (error: any) => {
        this._spinner.hide()
      })
  }

  LoadPdv(item:any) {
    let data = {
      paginate: false,
      page: 1,
      limit: 8,
      id:item.depot.id
    };
    this.utilisateurService.GetPointDeVenteListByDepot(data).then((res: any) => {
      this.pointDeVente = res.data
      this.filteredPointDeVente = this.pointDeVente;

      this.filteredPointDeVente.forEach(pdv => {
        pdv.isChecked = this.selectedItems.some((sel:any) => sel.id === pdv.id);
      });
      console.log('pointDeVente', res)
    }, (error: any) => {
      this._spinner.hide()
    })
  }
  LoadTypeVisite() {
    let data = {
      paginate: false,
      page: 1,
      limit: 8,
    };
    this.activiteService.GetTypeVisiteList(data).then((res: any) => {
        this.typeVisite = res.data;
        console.log('typeVisite', res)
      },
      (error: any) => {
        this._spinner.hide()
      })
  }

  toggleSelection(item: any): void {
    const alreadySelectedIndex = this.selectedItems.findIndex((p: any) => p.id === item.id);

    if (item.isChecked) {
      if (alreadySelectedIndex === -1) {
        this.selectedItems.push(item);
      }

      if (!this.selectedItemsIds.includes(item.id)) {
        this.selectedItemsIds.push(item.id);
      }
    } else {
      if (alreadySelectedIndex !== -1) {
        this.selectedItems.splice(alreadySelectedIndex, 1);

      }

      const idIndex = this.selectedItemsIds.indexOf(item.id);
      if (idIndex !== -1) {
        this.selectedItemsIds.splice(idIndex, 1);
      }
      this.filteredPointDeVente.forEach(pdv => {
        pdv.isChecked = this.selectedItems.some((sel:any) => sel.id === pdv.id);
      });
    }

    this.VisiteForm.controls['pointsDeVenteIds'].setValue(this.selectedItemsIds);
  }

  // toggleSelection(item: any): void {
  //   console.log('item', item);
  //
  //   if (item.isChecked) {
  //     this.selectedItems.push(item);
  //     this.selectedItemsIds.push(item.id);
  //   } else {
  //     const indexToRemove = this.selectedItems.findIndex(
  //       (selectedArticle:any) => selectedArticle.id === item.id
  //     );
  //     if (indexToRemove !== -1) {
  //       this.selectedItems.splice(indexToRemove, 1);
  //       this.selectedItemsIds.splice(indexToRemove, 1);
  //     }
  //   }
  //   this.VisiteForm.controls['pointDeVenteIds'].setValue(this.selectedItemsIds)
  // }


  removeItem(item: any): void {
    const index = this.selectedItems.findIndex((i: any) => i.id === item.id);

    if (index !== -1) {
      this.selectedItems.splice(index, 1);
    }
    item.isChecked = false;
    this.toggleSelection(item);
  }
  OnCloseModal() {
    this.isModalOpen = false;
    console.log(this.isModalOpen);
  }

  onValidate()
  {
    this._spinner.show()
    const formValues = {
      "commercialId": this.VisiteForm.value.commercialId,
      "pointsDeVenteIds": this.VisiteForm.value.pointsDeVenteIds,
      "dateDeVisite": this.VisiteForm.value.dateVisite,
      "repetitionDays": [this.VisiteForm.value.repetitionDays],
      "repetitionDuration": 12,
      "typeVisite": this.VisiteForm.value.typeVisite,
      "vehiculeId": this.VisiteForm.value.vehiculeId,
      "IsRepetitive": this.VisiteForm.value.IsRepetitive
    };
    this.activiteService.UpdateVisiteProgrammation(this.visiteId,formValues).then((res: any) => {
        this._spinner.hide()
        this.toastr.success(res
          .message);
        this.LoadVisite(1)
      },
      (error: any) => {
        this.toastr.error('Erreur!', 'Erreur lors de la mise à jour.');
        this._spinner.hide()
      })
  }

  // Méthode pour gérer la pagination
  onPage(event: any) {
    this.currentPage = event.first / event.rows + 1; // Calculer la page actuelle (1-based index)
    this.rowsPerPage = event.rows;

    this.LoadVisite(this.currentPage);
  }
}
