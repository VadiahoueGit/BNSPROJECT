import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PartenairesComponent } from './partenaires.component';
import { ClientosrComponent } from './clientosr/clientosr.component';
import { RevendeurComponent } from './revendeur/revendeur.component';
import { ArticleServiceService } from 'src/app/core/article-service.service';


const routes: Routes = [
    {
        path: '', component: PartenairesComponent,
    },
    { path: 'clientosr', component: ClientosrComponent },
    { path: 'revendeur', component: RevendeurComponent, resolve:{ArticleServiceService}  }

];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PartenairesRoutingModule { }
