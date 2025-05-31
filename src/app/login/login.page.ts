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
  IonText
} from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getDatabase, ref, get } from 'firebase/database';

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
    IonText
  ]
})
export class LoginPage {
  correo = '';
  clave = '';
  error = '';
  verPassword = false;

  constructor(private router: Router) {}

  toggleVerPassword() {
    this.verPassword = !this.verPassword;
  }

  async login() {
    this.error = '';
    const auth = getAuth();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, this.correo, this.clave);
      const uid = userCredential.user.uid;

      // Guardar ID en localStorage
      localStorage.setItem('id', uid);
      localStorage.setItem('correo', this.correo);

      // Leer nombre del usuario desde la base de datos
      const db = getDatabase();
      const snapshot = await get(ref(db, `usuarios/${uid}`));
      if (snapshot.exists()) {
        const data = snapshot.val();
        localStorage.setItem('nombreUsuario', data.nombreUsuario || '');
      }

      this.router.navigate(['/home']);
    } catch (err: any) {
      switch (err.code) {
        case 'auth/user-not-found':
          this.error = 'El usuario no existe.';
          break;
        case 'auth/wrong-password':
          this.error = 'Contraseña incorrecta.';
          break;
        case 'auth/invalid-email':
          this.error = 'Correo inválido.';
          break;
        default:
          this.error = 'Error al iniciar sesión.';
      }
    }
  }
}
