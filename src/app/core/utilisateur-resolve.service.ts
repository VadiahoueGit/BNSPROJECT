import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from './config-service.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class UtilisateurResolveService {
  apiUrl: string;
  ListUsers: BehaviorSubject<any[]> = new BehaviorSubject<any>([]);
  ListPermissions: BehaviorSubject<any[]> = new BehaviorSubject<any>([]);
  ListProfils: BehaviorSubject<any[]> = new BehaviorSubject<any>([]);

  constructor(private _http: HttpClient, private configService: ConfigService) {
    this.apiUrl = this.configService.apiUrl;
  }
  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> | Promise<any> | any {
    return new Promise<void>((resolve, reject) => {
      this.ListUsers.next([]);
      this.ListPermissions.next([]);
      this.ListProfils.next([]);

      let data = {};
      Promise.all([
        this.ListProfils.getValue().length === 0
          ? this.GetListProfil(data)
          : this.Nothing(),
        this.ListUsers.getValue().length === 0
          ? this.GetUsersList(data)
          : this.Nothing(),
        this.ListPermissions.getValue().length === 0
          ? this.GetPermissionsList(data)
          : this.Nothing(),
      ]).then(
        () => {
          resolve();
        },
        () => {
          reject();
        }
      );
    });
  }

  private Nothing() {
    return true;
  }
  // USERS
  GetUsersList(data: any) {
    return new Promise((resolve: any, reject: any) => {
      this._http
        .get(
          `${this.apiUrl}/v1/users?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`
        )
        .subscribe(
          (res: any) => {
            if (res.statusCode === 200) {
              this.ListUsers.next(res.data);
            }
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

  CreateUsers(data: any) {
    return new Promise((resolve: any, reject: any) => {
      this._http.post(`${this.apiUrl}/v1/users`, data).subscribe(
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

  DeleteUsers(id: number) {
    return new Promise((resolve: any, reject: any) => {
      this._http.delete(`${this.apiUrl}/v1/users/${id}`).subscribe(
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

  UpdateUsers(id: number, data: any) {
    return new Promise((resolve: any, reject: any) => {
      this._http.put(`${this.apiUrl}/v1/users/${id}`, data).subscribe(
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

   //POINT DE VENTE 
   CreatePointDeVente(data: any) {
    return new Promise((resolve: any, reject: any) => {
      this._http.post(`${this.apiUrl}/v1/point-de-vente`, data).subscribe(
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

  GetPointDeVenteList(data: any) {
    return new Promise((resolve: any, reject: any) => {
      this._http
        .get(
          `${this.apiUrl}/v1/point-de-vente?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`
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
  UpdatePointDeVente(id: number, data: any) {
    return new Promise((resolve: any, reject: any) => {
      this._http.put(`${this.apiUrl}/v1/point-de-vente/${id}`, data).subscribe(
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
  
  // COMMERCIAL
  GetCommercialList(data: any) {
    return new Promise((resolve: any, reject: any) => {
      this._http
        .get(
          `${this.apiUrl}/v1/commercial?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`
        )
        .subscribe(
          (res: any) => {
            if (res.statusCode === 200) {
              this.ListUsers.next(res.data);
            }
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

  CreateCommercial(data: any) {
    return new Promise((resolve: any, reject: any) => {
      this._http.post(`${this.apiUrl}/v1/commercial`, data).subscribe(
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

  DeleteCommercial(id: number) {
    return new Promise((resolve: any, reject: any) => {
      this._http.delete(`${this.apiUrl}/v1/commercial/${id}`).subscribe(
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

  UpdateCommercial(id: number, data: any) {
    return new Promise((resolve: any, reject: any) => {
      this._http.put(`${this.apiUrl}/v1/commercial/${id}`, data).subscribe(
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

  // PROFIL
  CreateProfil(data: any) {
    return new Promise((resolve: any, reject: any) => {
      this._http.post(`${this.apiUrl}/v1/profil`, data).subscribe(
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

  GetListProfil(data: any) {
    return new Promise((resolve: any, reject: any) => {
      this._http
        .get(
          `${this.apiUrl}/v1/profil?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`
        )
        .subscribe(
          (res: any) => {
            if (res.statusCode === 200) {
              this.ListProfils.next(res.data);
            }
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

  DeleteProfilBulk(ids: number[]) {
    return new Promise((resolve: any, reject: any) => {
        this._http.delete(`${this.apiUrl}/v1/profil/bulk-delete`, { body: { ids } }).subscribe(
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

  AssignPermissions(data: any) {
    return new Promise((resolve: any, reject: any) => {
      this._http
        .post(`${this.apiUrl}/v1/profil/assign-permissions`, data)
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
  DesassignPermissions(id: number) {
    return new Promise((resolve: any, reject: any) => {
      this._http.delete(`${this.apiUrl}/v1/profil/bulk-delete${id}`).subscribe(
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

  UpdateProfil(id: number, data: any) {
    return new Promise((resolve: any, reject: any) => {
      this._http.put(`${this.apiUrl}/v1/profil/${id}`, data).subscribe(
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

  // PERMISSIONS
  CreatePermissions(data: any) {
    return new Promise((resolve: any, reject: any) => {
      this._http.post(`${this.apiUrl}/v1/permissions`, data).subscribe(
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

  GetPermissionsList(data: any) {
    return new Promise((resolve: any, reject: any) => {
      this._http
        .get(
          `${this.apiUrl}/v1/permissions?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`
        )
        .subscribe(
          (res: any) => {
            if (res.statusCode == 200) {
              this.ListPermissions.next(res.data);
            }
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

  UpdatePermissions(id: number, data: any) {
    return new Promise((resolve: any, reject: any) => {
      this._http.put(`${this.apiUrl}/v1/permissions/${id}`, data).subscribe(
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

  DeletePermissions(id: number) {
    return new Promise((resolve: any, reject: any) => {
      this._http
        .delete(`${this.apiUrl}/v1/permissions/bulk-delete${id}`)
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
