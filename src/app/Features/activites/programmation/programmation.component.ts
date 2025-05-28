import {Component, ViewChild} from '@angular/core';
import {NgxSpinnerService} from "ngx-spinner";
import {ActiviteService} from "../../../core/activite.service";
import {Table} from "primeng/table";

@Component({
  selector: 'app-programmation',
  templateUrl: './programmation.component.html',
  styleUrls: ['./programmation.component.scss']
})
export class ProgrammationComponent {
  @ViewChild('dt2') dt2!: Table;
  dataList!: any[];
  isModalOpen: boolean = false;
  totalPages: number = 0;
  currentPage:any
  rowsPerPage:any
  filters: any = {
    dateDebut: '',
    dateFin: '',
    commercialNomPrenom: ''
  };
  updateData:any;
  operation:string = ''
  constructor(
    private _spinner: NgxSpinnerService,
    private activiteService: ActiviteService
  ) { }

  ngOnInit() {
    this.LoadVisite(1);
  }
  ViewDetails(data: any) {
    this.operation = 'edit'
    this.isModalOpen = true;
    console.log(data);
    this.updateData = data;
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

  OnCloseModal() {
    this.isModalOpen = false;
    console.log(this.isModalOpen);
  }


  // Méthode pour gérer la pagination
  onPage(event: any) {
    this.currentPage = event.first / event.rows + 1; // Calculer la page actuelle (1-based index)
    this.rowsPerPage = event.rows;

    this.LoadVisite(this.currentPage);
  }
}
