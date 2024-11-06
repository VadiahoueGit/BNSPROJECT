import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from './config-service.service';
import { LocalStorageService } from './local-storage.service';
import { storage_keys } from '../Features/shared-component/utils';

@Injectable({
  providedIn: 'root'
})
export class CoreServiceService {
  token:string;
  apiUrl: any;
  isauth: boolean = false
  constructor(private localstorage:LocalStorageService,private _http: HttpClient, private configService: ConfigService) {
    this.token = this.localstorage.getItem(storage_keys.STOREToken) || '';
  }

  
  private async initializeApiUrl() {
    if (!this.apiUrl) {
      await this.configService.loadConfig();
      this.apiUrl = this.configService.apiUrl;
      console.log(this.apiUrl)
    }
  }


  async ToConnect(data:any){
    await this.initializeApiUrl();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    });
    return new Promise((resolve: any, reject: any) => {
   
      this._http.post(`${this.apiUrl}/v1/auth/login`, data,{headers})
        .subscribe((res: any) => {
          console.log(res)
          resolve(res);
        }
          , err => {
            console.log(err);
            reject(err);
          });
        })
  }
  ToVerifyPassword(data:any){
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.post(`${this.apiUrl}/v1/auth/forgot-password`, data,{headers})
        .subscribe((res: any) => {
          console.log(res)
          resolve(res);
        }
          , err => {
            console.log(err);
            reject(err);
        })
      })
  }
}
