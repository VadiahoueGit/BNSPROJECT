import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { storage_keys } from '../Features/shared-component/utils';
import { ConfigService } from './config-service.service';
import { LocalStorageService } from './local-storage.service';

@Injectable({ providedIn: 'root' })
export class RapportService {

  token: string;
  apiUrl: any;

  constructor(
    private localstorage: LocalStorageService,
    private _http: HttpClient,
    private configService: ConfigService,
    private _spinner: NgxSpinnerService
  ) {
    this.apiUrl = this.configService.apiUrl;
    this.token = this.localstorage.getItem(storage_keys.STOREToken) || '';
  }

  execProcedure(procedure: string, params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });
      this._http
        .post(`${this.apiUrl}/v1/rapport/procedure`, { procedure, params }, { headers })
        .subscribe(
          (res: any) => resolve(res),
          (err) => {
            this._spinner.hide();
            reject(err);
          }
        );
    });
  }

  execQuery(query: string, params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });
      this._http
        .post(`${this.apiUrl}/v1/rapport/query`, { query, params }, { headers })
        .subscribe(
          (res: any) => resolve(res),
          (err) => { this._spinner.hide(); reject(err); }
        );
    });
  }

  getPerso(): Promise<any> {
    return new Promise((resolve, reject) => {
      const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });
      this._http.get(`${this.apiUrl}/v1/rapport/perso`, { headers })
        .subscribe((res: any) => resolve(res), (err) => reject(err));
    });
  }

  savePerso(titre: string, sql: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });
      this._http.post(`${this.apiUrl}/v1/rapport/perso`, { titre, sql }, { headers })
        .subscribe((res: any) => resolve(res), (err) => reject(err));
    });
  }

  deletePerso(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });
      this._http.delete(`${this.apiUrl}/v1/rapport/perso/${id}`, { headers })
        .subscribe((res: any) => resolve(res), (err) => reject(err));
    });
  }
}
