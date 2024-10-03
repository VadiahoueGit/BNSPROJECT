import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from './config-service.service';

@Injectable({
  providedIn: 'root'
})
export class CoreServiceService {
apiUrl: string;
  constructor(
    private _http: HttpClient,
    private configService: ConfigService
  ) {     this.apiUrl = this.configService.apiUrl;}

  ToConnect(data:any){
    return new Promise((resolve: any, reject: any) => {
      this._http.post(`${this.apiUrl}/v1/auth/login`, data)
        .subscribe((res: any) => {
          console.log(res)
        })})
  }
  ToVerifyPassword(data:any){
    return new Promise((resolve: any, reject: any) => {
      this._http.post(`${this.apiUrl}/v1/auth/forgot-password`, data)
        .subscribe((res: any) => {
          console.log(res)
        })})
  }
}
