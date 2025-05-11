import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonInput,
  IonButton,
  IonCard,
  IonCardContent,
  IonImg,
  IonLabel,
  IonItem,
  IonText // 👈 AÑADIDO AQUÍ
} from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonInput,
    IonButton,
    IonCard,
    IonCardContent,
    IonImg,
    IonLabel,
    IonItem,
    IonText // 👈 AÑADIDO AQUÍ TAMBIÉN
  ]
})
export class LoginPage {
  nombreUsuario = '';
  clave = '';
  error = '';
  verPassword = false;

  constructor(private firebaseService: FirebaseService, private router: Router) {}

  toggleVerPassword() {
    this.verPassword = !this.verPassword;
  }

  async login() {
    const usuario = await this.firebaseService.validarLogin(this.nombreUsuario, this.clave);
    if (usuario) {
      localStorage.setItem('nombreUsuario', usuario.nombreUsuario);
      this.router.navigate(['/home']);
    } else {
      this.error = 'Usuario o clave incorrectos';
    }
  }
}
