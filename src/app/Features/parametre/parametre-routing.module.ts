import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ParametreComponent } from './parametre.component';
import { ArticlesEtPrixComponent } from './articles-et-prix/articles-et-prix.component';
const routes: Routes = [
    { path: '', component: ParametreComponent },
    { path: 'articles', component: ArticlesEtPrixComponent },


];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ParametreRoutingModule { }
