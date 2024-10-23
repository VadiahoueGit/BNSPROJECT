import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ParametreComponent } from './parametre.component';
import { ArticlesEtPrixComponent } from './articles-et-prix/articles-et-prix.component';
import { LogistiqueComponent } from './logistique/logistique.component';
const routes: Routes = [
    { path: '', component: ParametreComponent },
    { path: 'articles', component: ArticlesEtPrixComponent },
    { path: 'logistique', component: LogistiqueComponent },


];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ParametreRoutingModule { }
