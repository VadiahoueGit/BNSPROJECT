import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParametreComponent } from './parametre.component';
import { ParametreRoutingModule } from './parametre-routing.module';



@NgModule({
  declarations: [ParametreComponent],
  imports: [
    ParametreRoutingModule,
    CommonModule
  ]
})
export class ParametreModule { }
