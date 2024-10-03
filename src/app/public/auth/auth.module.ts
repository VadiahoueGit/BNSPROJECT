import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';
import { AuthRoutingModule } from './auth-routing.module';
import { SharedComponentModule } from 'src/app/Features/shared-component/shared-component.module';
import { ForgetPasswordComponent } from './forget-password/forget-password.component';
import { OtpScreenComponent } from './otp-screen/otp-screen.component';
import { NgOtpInputModule } from 'ng-otp-input';
import { NewPasswordComponent } from './new-password/new-password.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    LoginComponent,
    LogoutComponent,
    ForgetPasswordComponent,
    OtpScreenComponent,
    NewPasswordComponent
  ],
  imports: [
    CommonModule,
    NgOtpInputModule,
    AuthRoutingModule,
    SharedComponentModule,
    ReactiveFormsModule,
    FormsModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AuthModule { }
