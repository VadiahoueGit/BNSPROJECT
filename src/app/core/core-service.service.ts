import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from './config-service.service';
import { LocalStorageService } from './local-storage.service';
import { storage_keys } from '../Features/shared-component/utils';

@Injectable({
  providedIn: 'root'
})
export class CoreServiceService {
  token: string;
  apiUrl: any;
  isauth: boolean = false
  constructor(private localstorage: LocalStorageService, private _http: HttpClient, private configService: ConfigService) {
    this.token = this.localstorage.getItem(storage_keys.STOREToken) || '';
  }


  private async initializeApiUrl() {
    if (!this.apiUrl) {
      await this.configService.loadConfig();
      this.apiUrl = this.configService.apiUrl;
      console.log(this.apiUrl)
    }
  }


  async ToConnect(data: any) {
    await this.initializeApiUrl();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    });
    return new Promise((resolve: any, reject: any) => {

      this._http.post(`${this.apiUrl}/v1/auth/login`, data, { headers })
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
  ToVerifyPassword(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.post(`${this.apiUrl}/v1/auth/forgot-password`, data, { headers })
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

  //DEPOT
  CreateDepot(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.post(`${this.apiUrl}/v1/depot`, data, { headers }).subscribe(
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

  GetDepotList(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http
        .get(
          `${this.apiUrl}/v1/depot?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`, { headers }
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
  UpdateDepot(id: number, data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.put(`${this.apiUrl}/v1/depot/${id}`, data, { headers }).subscribe(
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

  DeleteDepot(id: number) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http
        .delete(`${this.apiUrl}/v1/depot/${id}`, { headers })
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

  //DEPOT
  CreateGroupeClient(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.post(`${this.apiUrl}/v1/depot`, data, { headers }).subscribe(
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

  GetGroupeClientList(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http
        .get(
          `${this.apiUrl}/v1/depot?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`, { headers }
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
  
  UpdateGroupeClient(id: number, data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.put(`${this.apiUrl}/v1/depot/${id}`, data, { headers }).subscribe(
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

  DeleteGroupeClient(id: number) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http
        .delete(`${this.apiUrl}/v1/depot/${id}`, { headers })
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

  //ZONE DE LIVRAISON
  CreateZone(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.post(`${this.apiUrl}/v1/zone-de-livraison`, data, { headers }).subscribe(
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

  GetZoneList(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http
        .get(
          `${this.apiUrl}/v1/zone-de-livraison?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`, { headers }
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

  UpdateZone(id: number, data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.put(`${this.apiUrl}/v1/zone-de-livraison/${id}`, data, { headers }).subscribe(
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

  DeleteZone(id: number) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http
        .delete(`${this.apiUrl}/v1/zone-de-livraison/${id}`, { headers })
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

  //LOCALITE
  CreateLocalite(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.post(`${this.apiUrl}/v1/localite`, data, { headers }).subscribe(
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

  GetLocaliteList(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http
        .get(
          `${this.apiUrl}/v1/localite?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`, { headers }
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
  UpdateLocalite(id: number, data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.put(`${this.apiUrl}/v1/localite/${id}`, data, { headers }).subscribe(
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

  DeleteLocalite(id: number) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http
        .delete(`${this.apiUrl}/v1/localite/${id}`, { headers })
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
