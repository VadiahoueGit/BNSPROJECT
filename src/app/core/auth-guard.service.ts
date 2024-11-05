import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { CoreServiceService } from './core-service.service';
import { LocalStorageService } from './local-storage.service';
import { storage_keys } from '../Features/shared-component/utils';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService {
  isauth: boolean = false;

  constructor(private authService: CoreServiceService,private router: Router, private localStorage: LocalStorageService) {   console.log('AuthGuardService instantié');}
  canActivate(): boolean {
    const token = this.localStorage.getItem(storage_keys.STOREToken);
    console.log('Token exists:', !!token); 
    if (token) {
      this.isauth = true
      return true;
    } else {
      this.isauth = false
      this.router.navigate(['auth/login']);
      return false;
    }
  }
}
