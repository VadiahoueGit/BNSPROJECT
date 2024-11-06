import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  CalendarDayViewBeforeRenderEvent,
  CalendarEvent,
  CalendarEventTimesChangedEvent,
  CalendarView,
} from 'angular-calendar';
import { ResizeCursors } from 'angular-resizable-element';
import { endOfDay, startOfDay } from 'date-fns';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ActiviteService } from 'src/app/core/activite.service';
import { UtilisateurResolveService } from 'src/app/core/utilisateur-resolve.service';
@Component({
  selector: 'app-gestionvisite',
  templateUrl: './gestionvisite.component.html',
  styleUrls: ['./gestionvisite.component.scss'],
})
export class GestionvisiteComponent {
  @Input() viewDate: Date = new Date();
  view: CalendarView = CalendarView.Month;
  events: CalendarEvent[] = [
    {
      start: startOfDay(new Date()), // Début de l'événement
      end: endOfDay(new Date()), // Fin de l'événement
      title: '',
      color: { primary: '#ad2121', secondary: '#FAE3E3' },
    },
  ];
  @Input() locale: string = 'EN';
  loading: boolean = true;
  operation: string = '';
  isModalOpen = false;
  isEditMode= false;
  VisiteForm: FormGroup;
  updateData:any
  articleId:number
  typeVisite = [];
  pointDeVente = []
  commerciaux = []
  constructor(
    private _spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private activiteService:ActiviteService,
    private utilisateurService:UtilisateurResolveService
  ) {
    // this.toastr.success('Hello world!', 'Toastr fun!');
    this.VisiteForm = this.fb.group({
      typeVisite: [null, Validators.required],
      commercialId: [null, Validators.required],
      pointDeVenteIds: [null, Validators.required],
      dateVisite: [null, Validators.required],
      IsRepetitive: [false, Validators.required],
    });
  }
  ngOnInit() {
    this.LoadTypeVisite();
    this.LoadCommercial();
    this.LoadPdv();
    this.LoadVisite()
  }

  LoadVisite()
  {
    let data = {
      paginate: true,
      page: 1,
      limit: 8,
    };
    this._spinner.show()
    this.activiteService.GetVisiteList(data).then((res:any)=>{
      res.data.forEach((item:any) => {
        this.events = [
          ...this.events,
          {
            start: startOfDay(new Date(item.dateVisite)),
            title: item.typeVisite.libelle+' de '+ item.commercial.nom+' '+item.commercial.prenom,
            color: { primary: '#1e90ff', secondary: '#D1E8FF' },
          },
        ];
      });
      this._spinner.hide()
      console.log('Visite',res)
    })
  }

  OnCloseModal() {
    this.isModalOpen = false;
    console.log(this.isModalOpen);
  }
  OnEdit(data: any) {
    this.isEditMode = true;
    console.log(data);
    this.updateData = data;
    this.articleId = data.id;
    this.isModalOpen = true;
    // this.loadArticleDetails();
    this.operation = 'edit';
    console.log(this.isModalOpen);
  }

  OnCreate() {
    this.isEditMode = false;
    this.isModalOpen = true;
    this.operation = 'create';
    console.log(this.isModalOpen);
  }

  onSubmit(): void {
    this._spinner.show()
    console.log(this.VisiteForm.value);
    if (this.VisiteForm.valid) {
      // const formValues = this.ArticleForm.value;
      const formValues = {
        "commercialId": this.VisiteForm.value.commercialId,
        "pointDeVenteIds": this.VisiteForm.value.pointDeVenteIds,
        "dateDeVisite": this.VisiteForm.value.dateVisite,
        "IsRepetitive": this.VisiteForm.value.IsRepetitive,
        "typeVisite": this.VisiteForm.value.typeVisite
      };
      console.log('formValues', formValues);

      if (this.isEditMode) {
        this.activiteService.UpdateVisite(this.articleId, formValues).then(
          (response: any) => {
            console.log('visite mis à jour avec succès', response);
            this._spinner.hide()
            this.OnCloseModal();
            this.toastr.success(response.message);
          },
          (error: any) => {
            this.toastr.error('Erreur!', 'Erreur lors de la mise à jour.');
            console.error('Erreur lors de la mise à jour', error);
          }
        );
      } else {
        this.activiteService.CreateVisite(formValues).then(
          (response: any) => {
            this.OnCloseModal();
            this._spinner.hide()
            this.VisiteForm.reset();
            this.toastr.success(response.message);

            console.log('Nouvelle visite créé avec succès', response);
          },
          (error: any) => {
            this.toastr.error('Erreur!', 'Erreur lors de la création.');
            console.error('Erreur lors de la création', error);
          }
        );
      }
    }
  }

  addEvent(): void {
    console.log(this.events,'events')
    this.events = [
      ...this.events,
      {
        start: startOfDay(new Date()),
        title: 'Nouvel événement',
        color: { primary: '#1e90ff', secondary: '#D1E8FF' },
      },
    ];
  }

  LoadTypeVisite()
  {
    let data = {
      paginate: true,
      page: 1,
      limit: 8,
    };
    this.activiteService.GetTypeVisiteList(data).then((res:any)=>{
      this.typeVisite = res.data;
      console.log('typeVisite',res)
    })
  }

  LoadCommercial()
  {
    let data = {
      paginate: true,
      page: 1,
      limit: 8,
    };
    this.utilisateurService.GetCommercialList(data).then((res:any)=>{
      this.commerciaux = res.data
      console.log('commerciaux',res)
    })
  }



  LoadPdv()
  {
    let data = {
      paginate: true,
      page: 1,
      limit: 8,
    };
    this.utilisateurService.GetPointDeVenteList(data).then((res:any)=>{
      this.pointDeVente = res.data
      console.log('pointDeVente',res)
    })
  }
}
