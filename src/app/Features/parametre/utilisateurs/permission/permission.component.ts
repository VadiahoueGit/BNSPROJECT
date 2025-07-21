import {Component} from '@angular/core';
import {UtilisateurResolveService} from "../../../../core/utilisateur-resolve.service";
import {CoreServiceService} from "../../../../core/core-service.service";
import {NgxSpinnerService} from "ngx-spinner";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-permission',
  templateUrl: './permission.component.html',
  styleUrls: ['./permission.component.scss']
})
export class PermissionComponent {
  statuses!: any[];
  dataList!: any[];
  UserForm!: FormGroup;
  loading: boolean = true;
  isModalOpen = false;
  activityValues: number[] = [0, 100];
  operation: string = '';
  updateData: any = {};
  userId: any = 0;
  isEditMode: boolean = false;
  dataListFormats: any = [];
  dataListConditionnements: any = [];
  dataListProduits: any = [];
  dataListGroupeArticles: any = [];
  dataListBouteilleVide: any = [];
  dataListPlastiqueNu: any = [];
  dataListLiquides: any = [];
  dataListArticlesProduits: any = [];
  dataListProfil: any;
  currentPage: number;
  rowsPerPage: any;
  totalPages: number;

  constructor(
    private _userService: UtilisateurResolveService,
    private _coreService: CoreServiceService,
    private _spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.UserForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required]
    })
  }

  ngOnInit() {
    this.GetPermissionList(1)
  }
  OnCloseModal() {
    this.isModalOpen = false;
    console.log(this.isModalOpen);
  }

  OnCreate() {
    this.UserForm.reset();
    this.isEditMode = false;
    this.isModalOpen = true;
    this.operation = 'create';
    console.log(this.isModalOpen);
  }

  OnEdit(data: any) {
    this.isEditMode = true;
    console.log(data);
    this.updateData = data;
    this.userId = data.id;
    this.isModalOpen = true;
    this.loadADetails();
    this.operation = 'edit';
    console.log(this.isModalOpen);
  }

  onPage(event: any) {
    this.currentPage = event.first / event.rows + 1; // Calculer la page actuelle (1-based index)
    this.rowsPerPage = event.rows;
    this.GetPermissionList(this.currentPage);
  }

  GetPermissionList(page: number) {
    this._spinner.show();
    let data = {
      paginate: true,
      page: page,
      limit: 8,
    };
    this._userService.GetPermissionsList(data).then((response:any) => {
      this._spinner.hide()
      this.dataList = response.data;
      this.totalPages = response.total;
    })
  }

  OnDelete(id: number) {
    let data = {
      ids:[id]
    }
    this._spinner.show();
    this._userService.DeletePermissions(data).then((response:any) => {
      this._spinner.hide()
      if (response.statusCode === 200) {
        this.toastr.success(response.message);
      }else{
        this.toastr.error(response.message);
      }
    })
  }

  loadADetails() {
    this.UserForm.patchValue({
      name:this.updateData.name,
      description:this.updateData.description,
    })
  }

  onSubmit() {
    this._spinner.show();
    if (this.isEditMode) {
      this._userService.UpdatePermissions(this.updateData.id,this.UserForm.value).then((response:any) => {
        this._spinner.hide()
        if (response.statusCode === 201) {
          this.toastr.success(response.message);
        }else{
          this.toastr.error(response.message);
        }
      })
    }else{
      this._userService.CreatePermissions(this.UserForm.value).then((response:any) => {
        this._spinner.hide();
        this.OnCloseModal()
        if(response.statusCode === 201) {
          this.toastr.success(response.message);
          this.GetPermissionList(1)
        }else{
          this.toastr.error(response.message);
        }
      })
    }

  }
}
