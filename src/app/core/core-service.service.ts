import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from './config-service.service';
import { LocalStorageService } from './local-storage.service';
import { storage_keys } from '../Features/shared-component/utils';
import { BehaviorSubject, Observable } from 'rxjs';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class CoreServiceService {
  token: string;
  apiUrl: any;
  isauth: boolean = false
  listLocalite: BehaviorSubject<any[]> = new BehaviorSubject<any>([]);
  ListZoneLivraison: BehaviorSubject<any[]> = new BehaviorSubject<any>([]);

  constructor(private localstorage: LocalStorageService, private _http: HttpClient, private configService: ConfigService) {
    this.token = this.localstorage.getItem(storage_keys.STOREToken) || '';
  }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> | Promise<any> | any {
    return new Promise<void>((resolve, reject) => {
      this.listLocalite.next([]);
      this.ListZoneLivraison.next([]);


      let data = {};
      Promise.all([
        this.listLocalite.getValue().length === 0
          ? this.GetLocaliteList(data)
          : this.Nothing(),
        this.ListZoneLivraison.getValue().length === 0
          ? this.GetZoneList(data)
          : this.Nothing(),

      ]).then(() => {
        resolve();
      }, () =>
      {
        reject();
      });
    });
  }

  private Nothing() {
    return true;
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
          console.log(this.apiUrl)
          resolve(res);
        }
          , err => {
            console.log(err);
            reject(err);
          });
    })
  }

  async GetNotifiaction(data: any) {
    await this.initializeApiUrl();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    });
    return new Promise((resolve: any, reject: any) => {

      this._http.get(`${this.apiUrl}/v1/alertes?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`, { headers })
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

  async UpdatePasswordFirstConnexion(data: any) {
    await this.initializeApiUrl();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    });
    return new Promise((resolve: any, reject: any) => {

      this._http.post(`${this.apiUrl}/v1/auth/update-password`, data, { headers })
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
  async GetGoogleJWT() {
    await this.initializeApiUrl();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    });
    return new Promise((resolve: any, reject: any) => {

      this._http.get(`${this.apiUrl}/v1/google-auth/token`, { headers })
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

  async ToVerifyPassword(data: any) {
    await this.initializeApiUrl();
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
  async CreateDepot(data: any) {
    await this.initializeApiUrl();
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

 async GetDepotDetail(id:number) {
  await this.initializeApiUrl();
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http
        .get(
          `${this.apiUrl}/v1/depot/${id}`, { headers }
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
 async GetDepotList(data: any) {
  await this.initializeApiUrl();
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
  async UpdateDepot(id: number, data: any) {
    await this.initializeApiUrl();
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

  async DeleteDepot(id: number) {
    await this.initializeApiUrl();
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

  //DEVISE
  async CreateCurrency(data: any) {
    await this.initializeApiUrl();
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.post(`${this.apiUrl}/v1/devises`, data, { headers }).subscribe(
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

  async GetCurrencyList(data: any) {
    await this.initializeApiUrl();
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http
        .get(
          `${this.apiUrl}/v1/devises?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`, { headers }
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

  async UpdateCurrency(id: number, data: any) {
    await this.initializeApiUrl();
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.put(`${this.apiUrl}/v1/devises/${id}`, data, { headers }).subscribe(
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

  async DeleteCurrency(id: number) {
    await this.initializeApiUrl();
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http
        .delete(`${this.apiUrl}/v1/devises/${id}`, { headers })
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
  // PAYS
 async GetPaysList(data: any) {
    await this.initializeApiUrl();
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http
        .get(
          `${this.apiUrl}/v1/pays?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`, { headers }
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

  //groupe client
  async CreateGroupeClient(data: any) {
    await this.initializeApiUrl();
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.post(`${this.apiUrl}/v1/groupe-revendeur`, data, { headers }).subscribe(
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

  async GetGroupeClientList(data: any) {
    await this.initializeApiUrl();
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http
        .get(
          `${this.apiUrl}/v1/groupe-revendeur?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`, { headers }
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

  async UpdateGroupeClient(id: number, data: any) {
    await this.initializeApiUrl();
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.put(`${this.apiUrl}/v1/groupe-revendeur/${id}`, data, { headers }).subscribe(
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

 async DeleteGroupeClient(id: number) {
  await this.initializeApiUrl();
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http
        .delete(`${this.apiUrl}/v1/groupe-revendeur/${id}`, { headers })
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
  async CreateZone(data: any) {
    await this.initializeApiUrl();
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

  async GetZoneList(data: any) {
    await this.initializeApiUrl();
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
            this.ListZoneLivraison.next(res.data)
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

  async UpdateZone(id: number, data: any) {
    await this.initializeApiUrl();
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

  async DeleteZone(id: number) {
    await this.initializeApiUrl();
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
  async CreateLocalite(data: any) {
    await this.initializeApiUrl();
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

  async GetLocaliteList(data: any) {
    await this.initializeApiUrl();
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
            this.listLocalite.next(res.data)
            resolve(res);
          },
          (err) => {
            console.log(err);
            reject(err);
          }
        );
    });
  }
  async UpdateLocalite(id: number, data: any) {
    await this.initializeApiUrl();
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

  async DeleteLocalite(id: number) {
    await this.initializeApiUrl();
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

  //ANNONCE
  async CreateAnnonce(data: any) {
    await this.initializeApiUrl();
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.post(`${this.apiUrl}/v1/annonces`, data, { headers }).subscribe(
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
  async GetAnnnonce() {
    await this.initializeApiUrl();
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http
        .get(
          `${this.apiUrl}/v1/annonces?paginate=${false}&page=${1}&limit=${8}&search=${''}`, { headers }
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
  async DeleteAnnonce(id: number) {
    await this.initializeApiUrl();
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http
        .delete(`${this.apiUrl}/v1/annonces/${id}`, { headers })
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
  //DASHBOARD
  async GetKpiCommande() {
    await this.initializeApiUrl();
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http
        .get(
          `${this.apiUrl}/v1/kpi-commande
          `, { headers }
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

  async GetBestSeller(data:any) {
    await this.initializeApiUrl();
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http
        .get(
          `${this.apiUrl}/v1/kpi-commande/top-articles?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`, { headers }
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
}
