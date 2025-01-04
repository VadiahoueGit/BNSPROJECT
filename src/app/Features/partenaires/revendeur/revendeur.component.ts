import { Location } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-revendeur',
  templateUrl: './revendeur.component.html',
  styleUrls: ['./revendeur.component.scss']
})
export class RevendeurComponent {
  dataList:any[] = []
  produits:any[] = []
  depots:any[] = []
  localites:any[] = []
  categories:any[] = []
  clientTypes:any[] = []
  currentPage: number;
  rowsPerPage: any;
    revendeurForm!: FormGroup;
    operation: string = '';
    isModalOpen: boolean = false
  constructor(private cd: ChangeDetectorRef, private location: Location) {}

  goBack() {
    this.location.back()
  }
  onPage(event: any) {
    this.currentPage = event.first / event.rows + 1; // Calculer la page actuelle (1-based index)
    this.rowsPerPage = event.rows;
    // this.GetClientOSRList(this.currentPage);
  }
  OnCreate(){
    this.isModalOpen = true
    this.operation = 'create'
  }
  OnCloseModal(){
    this.isModalOpen = false

  }
  onSubmit(){}
  OnEdit(id:number){}
  OnValidate(id:number){}
  OnDelete(id:number){}
}
