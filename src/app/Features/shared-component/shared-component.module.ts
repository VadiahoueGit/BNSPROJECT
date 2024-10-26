import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from './card/card.component';
import { ToastModule } from 'primeng/toast';



@NgModule({
  declarations: [
    CardComponent,

  ],
  imports: [
    CommonModule,
    ToastModule
  ],
  exports: []
})
export class SharedComponentModule { }
