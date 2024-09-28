import { RouterModule, Routes } from "@angular/router";

import { NgModule } from "@angular/core";
import { ListClientsComponent } from "./list-clients/list-clients.component";

const routes: Routes = [
    // { path: '', redirectTo: '/list-client', pathMatch: 'full' },
    { path: 'list-client', component: ListClientsComponent },
  ];
  
  @NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
  export class GestionClientRoutingModule { }