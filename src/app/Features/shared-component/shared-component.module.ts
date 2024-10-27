import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from './card/card.component';
import { ToastrModule } from 'ngx-toastr';


@NgModule({
  declarations: [
    CardComponent,

  ],
  imports: [
    CommonModule,
    ToastrModule.forRoot(),
  ],
  exports: []
})
export class SharedComponentModule { }
