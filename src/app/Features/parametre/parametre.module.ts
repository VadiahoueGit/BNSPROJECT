import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParametreComponent } from './parametre.component';
import { ParametreRoutingModule } from './parametre-routing.module';
import { ArticlesEtPrixComponent } from './articles-et-prix/articles-et-prix.component';



@NgModule({
  declarations: [ParametreComponent, ArticlesEtPrixComponent],
  imports: [
    ParametreRoutingModule,
    CommonModule
  ]
})
export class ParametreModule { }
