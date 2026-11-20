import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Table } from 'primeng/table';
import { CoreServiceService } from 'src/app/core/core-service.service';
import { ArticleServiceService } from 'src/app/core/article-service.service';
import { ALERT_QUESTION } from '../../shared-component/utils';

@Component({
  selector: 'app-regle-palette',
  templateUrl: './regle-palette.component.html',
  styleUrls: ['./regle-palette.component.scss'],
})
export class ReglePaletteComponent implements OnInit {
  @ViewChild('dt') dt!: Table;

  regleList: any[] = [];
  groupeList: any[] = [];
  fournisseurList: any[] = [];
  totalPages = 0;
  currentPage = 1;
  isModalOpen = false;
  isEditMode = false;
  operation = '';
  updateData: any = {};
  regleId = 0;

  regleForm!: FormGroup;

  constructor(
    private _coreService: CoreServiceService,
    private _articleService: ArticleServiceService,
    private _spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private location: Location
  ) {}

  ngOnInit() {
    this.regleForm = this.fb.group({
      format: [null, [Validators.required, Validators.min(1)]],
      casiers: [null, [Validators.required, Validators.min(1)]],
      type: [null, Validators.required],
      fournisseurId: [null],
    });
    this.GetList(1);
    this.LoadGroupes();
    this.LoadFournisseurs();
  }

  LoadGroupes() {
    this._articleService.GetGroupeArticleList({ paginate: false, page: 1, limit: 100 }).then((res: any) => {
      this.groupeList = res.data;
    });
  }

  LoadFournisseurs() {
    this._coreService.GetFournisseurList().then((res: any) => {
      this.fournisseurList = res.data;
    });
  }

  goBack() {
    this.location.back();
  }

  GetList(page: number) {
    this._spinner.show();
    this._coreService.GetReglePaletteList({ paginate: true, page, limit: 8 }).then((res: any) => {
      this.regleList = res.data;
      this.totalPages = res.total;
      this._spinner.hide();
    });
  }

  onPage(event: any) {
    this.currentPage = event.first / event.rows + 1;
    this.GetList(this.currentPage);
  }

  OnCreate() {
    this.regleForm.reset();
    this.isEditMode = false;
    this.isModalOpen = true;
    this.operation = 'create';
  }

  OnEdit(data: any) {
    this.isEditMode = true;
    this.updateData = data;
    this.regleId = data.id;
    this.isModalOpen = true;
    this.operation = 'edit';
    this.regleForm.patchValue({ format: data.format, casiers: data.casiers, type: data.type, fournisseurId: data.fournisseur?.id ?? null });
  }

  OnCloseModal() {
    this.isModalOpen = false;
  }

  onSubmit() {
    if (!this.regleForm.valid) return;
    const payload = this.regleForm.value;
    if (this.isEditMode) {
      this._coreService.UpdateReglePalette(this.regleId, payload).then((res: any) => {
        this.toastr.success(res.message);
        this.OnCloseModal();
        this.GetList(1);
      }, (err: any) => this.toastr.error(err?.error?.message || 'Erreur'));
    } else {
      this._coreService.CreateReglePalette(payload).then((res: any) => {
        this.toastr.success(res.message);
        this.OnCloseModal();
        this.GetList(1);
      }, (err: any) => this.toastr.error(err?.error?.message || 'Erreur'));
    }
  }

  OnDelete(id: number) {
    ALERT_QUESTION('warning', 'Attention !', 'Voulez-vous supprimer cette règle ?').then((res: any) => {
      if (res.isConfirmed) {
        this._spinner.show();
        this._coreService.DeleteReglePalette(id).then((res: any) => {
          this.toastr.success(res.message);
          this.GetList(1);
          this._spinner.hide();
        });
      }
    });
  }
}
