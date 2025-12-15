import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from './config-service.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { LocalStorageService } from './local-storage.service';
import { storage_keys } from '../Features/shared-component/utils';

@Injectable({
  providedIn: 'root',
})
export class UtilisateurResolveService {
  apiUrl: any;
  ListUsers: BehaviorSubject<any[]> = new BehaviorSubject<any>([]);
  listPointDeVente: BehaviorSubject<any[]> = new BehaviorSubject<any>([]);
  listFournisseurs: BehaviorSubject<any[]> = new BehaviorSubject<any>([]);
  ListPermissions: BehaviorSubject<any[]> = new BehaviorSubject<any>([]);
  ListProfils: BehaviorSubject<any[]> = new BehaviorSubject<any>([]);
  token:string;
  constructor(private localstorage:LocalStorageService,private _http: HttpClient, private configService: ConfigService) {
    this.apiUrl = this.configService.apiUrl;
    this.token = this.localstorage.getItem(storage_keys.STOREToken) || '';
  }
  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> | Promise<any> | any {
    return new Promise<void>((resolve, reject) => {
      this.ListUsers.next([]);
      this.listPointDeVente.next([]);
      this.ListPermissions.next([]);
      this.ListProfils.next([]);

      let data = {
        paginate: true,
        page: 1,
        limit: 8,
      };;
      Promise.all([
        this.ListProfils.getValue().length === 0
          ? this.GetListProfil(data)
          : this.Nothing(),
        this.ListUsers.getValue().length === 0
          ? this.GetUsersList(data)
          : this.Nothing(),
        this.listPointDeVente.getValue().length === 0
          ? this.GetPointDeVenteList(data)
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
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http
        .get(
          `${this.apiUrl}/v1/users?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`,{headers}
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
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.post(`${this.apiUrl}/v1/users`, data,{headers}).subscribe(
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
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.delete(`${this.apiUrl}/v1/users/${id}`,{headers}).subscribe(
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
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.put(`${this.apiUrl}/v1/users/${id}`, data,{headers}).subscribe(
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
   CreatePointDeVente(formData: FormData) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.post(`${this.apiUrl}/v1/point-de-vente`, formData,{headers}).subscribe(
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

  GetPointDeVenteListByDepot(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http
        .get(
          `${this.apiUrl}/v1/point-de-vente/depot/${data.id}?&paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`,{ headers }
        )
        .subscribe(
          (res: any) => {
            console.log(res);
            this.listPointDeVente.next(res.data)
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
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http
        .get(
          `${this.apiUrl}/v1/point-de-vente?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}&depot=${data.depot}&etablissement=${data.etablissement}&statut=${data.statut}`,{ headers }
        )
        .subscribe(
          (res: any) => {
            console.log(res);
            this.listPointDeVente.next(res.data)
            resolve(res);
          },
          (err) => {
            console.log(err);
            reject(err);
          }
        );
    });
  }
  UpdatePointDeVente(id: number, formData: FormData) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.put(`${this.apiUrl}/v1/point-de-vente/${id}`, formData,{headers}).subscribe(
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
  GetPointDeVenteDetailById(id: number) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.get(`${this.apiUrl}/v1/point-de-vente/${id}`,{headers}).subscribe(
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
  DeletedPointDeVente(id: number) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.delete(`${this.apiUrl}/v1/point-de-vente/${id}`,{headers}).subscribe(
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
  ValidatePointDeVente(data: any){
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.patch(`${this.apiUrl}/v1/point-de-vente/validation`, data,{headers}).subscribe(
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
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http
        .get(
          `${this.apiUrl}/v1/commercial?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`,{headers}
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
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.post(`${this.apiUrl}/v1/commercial`, data,{headers}).subscribe(
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
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.delete(`${this.apiUrl}/v1/commercial/${id}`,{headers}).subscribe(
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
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.put(`${this.apiUrl}/v1/commercial/${id}`, data,{headers}).subscribe(
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
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.post(`${this.apiUrl}/v1/profil`, data,{headers}).subscribe(
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
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http
        .get(
          `${this.apiUrl}/v1/profil?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`,{headers}
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

  DeleteProfil(id: number) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
        this._http.delete(`${this.apiUrl}/v1/profil/${id}`).subscribe(
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
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    });
    return new Promise((resolve: any, reject: any) => {
      this._http.put(`${this.apiUrl}/v1/profil/${id}`, data,{headers}).subscribe(
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
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.post(`${this.apiUrl}/v1/permissions`, data,{headers}).subscribe(
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
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http
        .get(
          `${this.apiUrl}/v1/permissions?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`,{headers}
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

  AssignPermissions(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http
        .post(`${this.apiUrl}/v1/profil/assign-permissions`, data,{headers})
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
  DeletePermissions(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.delete(`${this.apiUrl}/v1/permissions/bulk-delete`, {
        headers,
        body: data
      }).subscribe(
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
  UpdatePermissions(id: number, data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.put(`${this.apiUrl}/v1/permissions/${id}`, data,{headers}).subscribe(
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

// VENTE CHINE
  CreateVenteChine(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.post(`${this.apiUrl}/v1/ventes`, data,{headers}).subscribe(
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

  GetVenteChineListAttente(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http
        .get(
          `${this.apiUrl}/v1/ventes/statut?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`,{headers}
        )
        .subscribe(
          (res: any) => {
            if (res.statusCode == 200) {
              // this.ListVentes.next(res.data);
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

  GetVenteChineList(data: any) {
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http
        .get(
          `${this.apiUrl}/v1/ventes?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`,{headers}
        )
        .subscribe(
          (res: any) => {
            if (res.statusCode == 200) {
              // this.ListVentes.next(res.data);
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
  ApprouverVente(id: any){
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.patch(`${this.apiUrl}/v1/ventes/approuver/${id}`,{headers}).subscribe(
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
  DesApprouverVente(id: any){
    return new Promise((resolve: any, reject: any) => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      this._http.patch(`${this.apiUrl}/v1/ventes/desapprouver/${id}`,{headers}).subscribe(
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

    //FOURNISSEURS
    CreateFournisseurs(data: any) {
      return new Promise((resolve: any, reject: any) => {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${this.token}`
        });
        this._http.post(`${this.apiUrl}/v1/fournisseurs`, data,{headers}).subscribe(
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

    GetFournisseursList(data: any) {
      return new Promise((resolve: any, reject: any) => {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${this.token}`
        });
        this._http
          .get(
            `${this.apiUrl}/v1/fournisseurs?paginate=${data.paginate}&page=${data.page}&limit=${data.limit}`,{ headers }
          )
          .subscribe(
            (res: any) => {
              console.log(res);
              this.listFournisseurs.next(res.data)
              resolve(res);
            },
            (err) => {
              console.log(err);
              reject(err);
            }
          );
      });
    }
    UpdateFournisseurs(id: number, data: any) {
      return new Promise((resolve: any, reject: any) => {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${this.token}`
        });
        this._http.patch(`${this.apiUrl}/v1/fournisseurs/${id}`, data,{headers}).subscribe(
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
    GetFournisseursDetailById(id: number) {
      return new Promise((resolve: any, reject: any) => {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${this.token}`
        });
        this._http.get(`${this.apiUrl}/v1/fournisseurs/${id}`,{headers}).subscribe(
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
    DeletedFournisseurs(id: number) {
      return new Promise((resolve: any, reject: any) => {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${this.token}`
        });
        this._http.delete(`${this.apiUrl}/v1/fournisseurs/${id}`,{headers}).subscribe(
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
