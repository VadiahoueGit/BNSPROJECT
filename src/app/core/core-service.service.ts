import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from './config-service.service';
import { LocalStorageService } from './local-storage.service';
import { storage_keys } from '../Features/shared-component/utils';

@Injectable({
  providedIn: 'root'
})
export class CoreServiceService {
  token:string;
  apiUrl: string;
  constructor(private localstorage:LocalStorageService,private _http: HttpClient, private configService: ConfigService) {
    this.apiUrl = this.configService.apiUrl;
    this.token = this.localstorage.getItem(storage_keys.STOREToken) || '';
  }
  ToConnect(data:any){
    return new Promise((resolve: any, reject: any) => {
      this._http.post(`${this.apiUrl}/v1/auth/login`, data)
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
      this._http.post(`${this.apiUrl}/v1/auth/forgot-password`, data)
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
