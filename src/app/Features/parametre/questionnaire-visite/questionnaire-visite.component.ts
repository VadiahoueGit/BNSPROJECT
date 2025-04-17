import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Table } from 'primeng/table';
import { ALERT_QUESTION } from '../../shared-component/utils';
import { ActiviteService } from 'src/app/core/activite.service';

@Component({
  selector: 'app-questionnaire-visite',
  templateUrl: './questionnaire-visite.component.html',
  styleUrls: ['./questionnaire-visite.component.scss']
})
export class QuestionnaireVisiteComponent {
  dataList!:[]
  @ViewChild('dt2') dt2!: Table;
  isEditMode: boolean = false;
  isModalOpen: boolean = false;
  operation: string = '';
  updateData: any;
  questionId:number
  questionForm:FormGroup
  currentPage: number;
  rowsPerPage: any;
  totalPages: number;
  constructor(private activiteService:ActiviteService,private location: Location,private cd: ChangeDetectorRef,private _spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private toastr: ToastrService) {
    this.questionForm = this.fb.group({
      texte: ['', Validators.required],
      questionnaireId: [1, Validators.required]
    });
  }
  ngOnInit() {
    this.GetQuestionList(1)
  }
  OnCloseModal() {
    this.isModalOpen = false;
    console.log(this.isModalOpen);
  }
  OnCreate() {
    this.isEditMode = false;
    this.isModalOpen = true;
    this.operation = 'create';
    console.log(this.isModalOpen);
  }
  OnEdit(data: any) {
    this.isEditMode = true;
    console.log(data);
    this.updateData = data;
    this.questionId = data.id;
    this.questionForm.patchValue(data);
    this.isModalOpen = true;
    this.operation = 'edit';
    console.log(this.isModalOpen);
  }
  onPage(event: any) {
    this.currentPage = event.first / event.rows + 1; // Calculer la page actuelle (1-based index)
    this.rowsPerPage = event.rows;
    this.GetQuestionList(this.currentPage);
  }
  onSubmit() {
    if (this.isEditMode) {
      this._spinner.show();
      this.activiteService.UpdateQuestion(this.questionId, this.questionForm.value).then((res:any) => {
        this._spinner.hide();
        this.isModalOpen = false;
        this.toastr.success(res.message);
        this.GetQuestionList(1)
        console.log(res)
      },
        (error: any) => {
          this.isModalOpen = false;
          this.toastr.error('Erreur!', 'Erreur lors de la mise à jour.');
          console.error('Erreur lors de la création', error);
        })
    } else {
      this._spinner.show();
      this.activiteService.CreateQuestion(this.questionForm.value).then((res:any) => {
        this.GetQuestionList(1)
        this.toastr.success(res.message);
        this.isModalOpen = false;
        this._spinner.hide();
        console.log(res)
      },
      (error: any) => {
        this.isModalOpen = false;
        this.toastr.error('Erreur!', "Erreur lors de l'enregistrement.");
        console.error('Erreur lors de la création', error);
      })
    }

  }
  OnDelete(Id: any) {
    ALERT_QUESTION('warning', 'Attention !', 'Voulez-vous supprimer?').then(
      (res) => {
        if (res.isConfirmed == true) {
          this._spinner.show();
          this.activiteService.DeleteQuestion(Id).then((res: any) => {
            console.log('DATA:::>', res);
            this._spinner.hide();
          });
        } else {
        }
      }
    );
  }
  GetQuestionList(page:number)
  {
    this._spinner.show();
    let data = {
      paginate: false,
      page: page,
      limit: 8,
    };
    this.activiteService.GetQuestionList(data).then((res:any)=>{
      this.dataList = res.data
      this.totalPages = res.totalPages * data.limit; // nombre total d’enregistrements

      console.log('GetQuestionList:::>', res);
      this._spinner.hide();
    })
  }

  goBack() {
    this.location.back()
  }
}
