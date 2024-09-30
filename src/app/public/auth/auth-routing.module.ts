import { RouterModule, Routes } from "@angular/router";
import { LoginComponent } from "./login/login.component";
import { LogoutComponent } from "./logout/logout.component";
import { NgModule } from "@angular/core";
import { ForgotPasswordComponent } from "./forgot-password/forgot-password.component";

const routes: Routes = [
    { path: '', component: LoginComponent },
    { path: 'deconnexion', component: LogoutComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent}
  ];
  
  @NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
  export class AuthRoutingModule { }