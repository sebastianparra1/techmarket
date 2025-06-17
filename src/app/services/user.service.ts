// src/app/services/user.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UserService {
  getUid(): string | null {
    return localStorage.getItem('id');
  }

  getNombreUsuario(): string {
    return localStorage.getItem('nombreUsuario') || 'Invitado';
  }

  isLoggedIn(): boolean {
    return !!this.getUid();
  }
} 

