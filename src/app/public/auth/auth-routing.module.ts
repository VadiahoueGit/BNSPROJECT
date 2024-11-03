import { RouterModule, Routes } from "@angular/router";
import { LoginComponent } from "./login/login.component";
import { LogoutComponent } from "./logout/logout.component";
import { NgModule } from "@angular/core";
import { ForgetPasswordComponent } from "./forget-password/forget-password.component";
import { OtpScreenComponent } from "./otp-screen/otp-screen.component";
import { NewPasswordComponent } from "./new-password/new-password.component";

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'forget-password', component: ForgetPasswordComponent },
    { path: 'otp-screen', component: OtpScreenComponent },
    { path: 'new-password', component: NewPasswordComponent },
    { path: 'deconnexion', component: LogoutComponent }
  ];
  
  @NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
  export class AuthRoutingModule { }