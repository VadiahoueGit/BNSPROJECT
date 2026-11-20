import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfigService } from './config-service.service';
import { LocalStorageService } from './local-storage.service';
import { storage_keys } from '../Features/shared-component/utils';

@Injectable({ providedIn: 'root' })
export class ParametreService {
  private apiUrl: string;
  private get token(): string {
    return this.localStorage.getItem(storage_keys.STOREToken) || '';
  }
  private get headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.token}` });
  }

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private localStorage: LocalStorageService,
  ) {
    this.apiUrl = this.configService.apiUrl;
  }

  async getEntrepriseConfig(): Promise<any> {
    if (!this.apiUrl) {
      await this.configService.loadConfig();
      this.apiUrl = this.configService.apiUrl;
    }
    return new Promise((resolve, reject) => {
      this.http.get(`${this.apiUrl}/v1/entreprise-config`, { headers: this.headers }).subscribe(
        (res: any) => resolve(res),
        (err) => reject(err),
      );
    });
  }

  updateEntrepriseConfig(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.patch(`${this.apiUrl}/v1/entreprise-config`, data, { headers: this.headers }).subscribe(
        (res: any) => resolve(res),
        (err) => reject(err),
      );
    });
  }

  uploadEntrepriseLogo(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('logo', file);
    return new Promise((resolve, reject) => {
      this.http.post(`${this.apiUrl}/v1/entreprise-config/logo`, formData, { headers: new HttpHeaders({ Authorization: `Bearer ${this.token}` }) }).subscribe(
        (res: any) => resolve(res),
        (err) => reject(err),
      );
    });
  }
}
