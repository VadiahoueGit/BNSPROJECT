import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from './config-service.service';
import { LocalStorageService } from './local-storage.service';
import { storage_keys } from '../Features/shared-component/utils';

@Injectable({
  providedIn: 'root'
})
export class LogistiqueService {

  token:string;
  apiUrl: string;
  constructor(private localstorage:LocalStorageService,private _http: HttpClient, private configService: ConfigService) {
    this.apiUrl = this.configService.apiUrl;
    this.token = this.localstorage.getItem(storage_keys.STOREToken) || '';
  }

   // TRANSPORTEUR
   CreateTransporteur(data: any) {
    return new Promise((resolve: any, reject: any) => {
      this._http.post(`${this.apiUrl}/v1/group-article`, data).subscribe(
        (res: any) => {
          console.log(res);
          resolve(res);
        },
        (err) => {
          console.log(err);
          reject(err);
        }
      );
    });
  }

  GetTransporteurList(data: any) {
    return new Promise((resolve: any, reject: any) => {
      this._http
        .get(
          `${this.apiUrl}/v1/group-article?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`
        )
        .subscribe(
          (res: any) => {
            console.log(res);
            resolve(res);
          },
          (err) => {
            console.log(err);
            reject(err);
          }
        );
    });
  }

  UpdateTransporteur(id: number, data: any) {
    return new Promise((resolve: any, reject: any) => {
      this._http.put(`${this.apiUrl}/v1/group-article/${id}`, data).subscribe(
        (res: any) => {
          console.log(res);
          resolve(res);
        },
        (err) => {
          console.log(err);
          reject(err);
        }
      );
    });
  }

  DeleteTransporteur(id: number) {
    return new Promise((resolve: any, reject: any) => {
      this._http
        .delete(`${this.apiUrl}/v1/group-article/${id}`)
        .subscribe(
          (res: any) => {
            console.log(res);
            resolve(res);
          },
          (err) => {
            console.log(err);
            reject(err);
          }
        );
    });
  }

   // VEHICULE
   CreateVehicule(data: any) {
    return new Promise((resolve: any, reject: any) => {
      this._http.post(`${this.apiUrl}/v1/vehicule`, data).subscribe(
        (res: any) => {
          console.log(res);
          resolve(res);
        },
        (err) => {
          console.log(err);
          reject(err);
        }
      );
    });
  }

  GetVehiculeList(data: any) {
    return new Promise((resolve: any, reject: any) => {
      this._http
        .get(
          `${this.apiUrl}/v1/vehicule?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`
        )
        .subscribe(
          (res: any) => {
            console.log(res);
            resolve(res);
          },
          (err) => {
            console.log(err);
            reject(err);
          }
        );
    });
  }

  UpdateVehicule(id: number, data: any) {
    return new Promise((resolve: any, reject: any) => {
      this._http.put(`${this.apiUrl}/v1/vehicule/${id}`, data).subscribe(
        (res: any) => {
          console.log(res);
          resolve(res);
        },
        (err) => {
          console.log(err);
          reject(err);
        }
      );
    });
  }

  DeleteVehicule(id: number) {
    return new Promise((resolve: any, reject: any) => {
      this._http
        .delete(`${this.apiUrl}/v1/vehicule/${id}`)
        .subscribe(
          (res: any) => {
            console.log(res);
            resolve(res);
          },
          (err) => {
            console.log(err);
            reject(err);
          }
        );
    });
  }
}
