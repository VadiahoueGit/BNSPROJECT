import { Component } from '@angular/core';
import {FormBuilder, Validators} from "@angular/forms";
import {FinanceService} from "../../../core/finance.service";
import {ArticleServiceService} from "../../../core/article-service.service";
import {UtilisateurResolveService} from "../../../core/utilisateur-resolve.service";
import {NgxSpinnerService} from "ngx-spinner";
import {ToastrService} from "ngx-toastr";
import {calculeDateEcheance} from "../../../utils/utils";


@Component({
  selector: 'app-sous-compte',
  templateUrl: './sous-compte.component.html',
  styleUrls: ['./sous-compte.component.scss']
})

export class SousCompteComponent {
  currentPage: number;
  rowsPerPage: any;
  totalPages: number;
  dataList:any
  isModalOpen = false;
  operation: string = '';
  updateData: any = {};
  isEditMode: boolean = false;
  detail: any;
  constructor(
    private _financeService: FinanceService,
    private _articleService: ArticleServiceService,
    private utilisateurService: UtilisateurResolveService,
    private _spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {}
  ngOnInit() {
    this.GetSousCompte(1);
  }

  GetSousCompte(page: number) {
    let data = {
      paginate: true,
      page: page,
      limit: 8,
    };
    this._spinner.show();
    this._financeService.GetSousCompte(data).then((res: any) => {
      console.log('GetSousCompte:::>', res);
      this.totalPages = res.total; // nombre total d’enregistrements
      console.log('totalPages:::>', this.totalPages); // nombre total d’enregistrements

      this.dataList = res.data;
      this._spinner.hide();
    });
  }
  onPage(event: any) {
    this.currentPage = event.first / event.rows + 1; // Calculer la page actuelle (1-based index)
    this.rowsPerPage = event.rows;
    this.GetSousCompte(this.currentPage);
  }

  OnEdit(data: any) {
    this.isEditMode = true;
    console.log(data);
    this.updateData = data;
    this.isModalOpen = true;
    this.operation = 'edit';
    console.log(this.isModalOpen);
  }

  OnCloseModal() {
    this.isModalOpen = false;
    console.log(this.isModalOpen);
  }
  OnDetails(data: any) {
    this.detail = data;
    this.detail.dateEchanceCalculer = calculeDateEcheance(
      data?.createdAt,
      data?.delaiReglement
    );
    console.log(data);
    this.isModalOpen = true;
    this.operation = 'detail';
  }

  // protected readonly Data = Data;
}
