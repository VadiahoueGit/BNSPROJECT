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
      title: 'Événement du jour',
      color: { primary: '#ad2121', secondary: '#FAE3E3' },
    },
  ];
  @Input() locale: string = 'EN';
  loading: boolean = true;
  operation: string = '';
  isModalOpen = false;
  VisiteForm: FormGroup;
  typeVisite = [
    { id: 1, name: 'test1' },
    { id: 2, name: 'test2' },
    { id: 3, name: 'test3' },
  ];
  constructor(
    private _spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    // this.toastr.success('Hello world!', 'Toastr fun!');
    this.VisiteForm = this.fb.group({
      typeVisite: [null, Validators.required],
      commercialId: [null, Validators.required],
      pointDeVenteId: [null, Validators.required],
      dateVisite: [null, Validators.required],
    });
  }
  OnCloseModal() {
    this.isModalOpen = false;
    console.log(this.isModalOpen);
  }
  OnCreate() {
    // this.isEditMode = false;
    this.isModalOpen = true;
    this.operation = 'create';
    console.log(this.isModalOpen);
  }
  onSubmit(): void {}

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
}