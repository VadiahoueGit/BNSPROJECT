import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { CoreServiceService } from './core-service.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(private authService: CoreServiceService,private router: Router) { }
  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      return true; // Autorise l'accès si l'utilisateur est authentifié
    } else {
      this.router.navigate(['/auth']); // Redirige vers la page de connexion
      return false; // Bloque l'accès si l'utilisateur n'est pas authentifié
    }
  }
}
