import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfigService } from './config-service.service';
import { LocalStorageService } from './local-storage.service';
import { storage_keys } from '../Features/shared-component/utils';

@Injectable({ providedIn: 'root' })
export class SapService {
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

  private async ensureApiUrl(): Promise<void> {
    if (!this.apiUrl) {
      await this.configService.loadConfig();
      this.apiUrl = this.configService.apiUrl;
    }
  }

  async getConfig(): Promise<any> {
    await this.ensureApiUrl();
    return new Promise((resolve, reject) => {
      this.http.get(`${this.apiUrl}/v1/sap-config`, { headers: this.headers }).subscribe(
        (res: any) => resolve(res),
        (err) => reject(err),
      );
    });
  }

  updateConfig(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.patch(`${this.apiUrl}/v1/sap-config`, data, { headers: this.headers }).subscribe(
        (res: any) => resolve(res),
        (err) => reject(err),
      );
    });
  }

  testConnexion(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.apiUrl}/v1/sap-config/test-connexion`, data, { headers: this.headers }).subscribe(
        (res: any) => resolve(res),
        (err) => reject(err),
      );
    });
  }

  runNow(date?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.apiUrl}/v1/sap-config/run-now`, { date }, { headers: this.headers }).subscribe(
        (res: any) => resolve(res),
        (err) => reject(err),
      );
    });
  }

  getSyncLog(page: number, limit: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(`${this.apiUrl}/v1/sap-config/sync-log?page=${page}&limit=${limit}`, { headers: this.headers }).subscribe(
        (res: any) => resolve(res),
        (err) => reject(err),
      );
    });
  }

  getBusinessPartners(page: number, limit: number, search?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(`${this.apiUrl}/v1/sap-config/business-partners?page=${page}&limit=${limit}&search=${search || ''}`, { headers: this.headers }).subscribe(
        (res: any) => resolve(res),
        (err) => reject(err),
      );
    });
  }

  getPriceLists(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(`${this.apiUrl}/v1/sap-config/price-lists`, { headers: this.headers }).subscribe(
        (res: any) => resolve(res),
        (err) => reject(err),
      );
    });
  }

  getItems(page: number, limit: number, search?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(`${this.apiUrl}/v1/sap-config/items?page=${page}&limit=${limit}&search=${search || ''}`, { headers: this.headers }).subscribe(
        (res: any) => resolve(res),
        (err) => reject(err),
      );
    });
  }

  getDocuments(type: string, page: number, limit: number, search?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(`${this.apiUrl}/v1/sap-config/documents?type=${type}&page=${page}&limit=${limit}&search=${search || ''}`, { headers: this.headers }).subscribe(
        (res: any) => resolve(res),
        (err) => reject(err),
      );
    });
  }
}
