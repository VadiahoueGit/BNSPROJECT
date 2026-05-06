import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RapportComponent } from './rapport.component';
import { RapportViewerComponent } from './viewer/rapport-viewer.component';

const routes: Routes = [
  { path: '', component: RapportComponent },
  { path: 'viewer/:id', component: RapportViewerComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RapportRoutingModule { }
