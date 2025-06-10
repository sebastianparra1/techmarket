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
import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { getDatabase, ref, get, set } from 'firebase/database';

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

      // Leer nombre y foto del usuario desde la base de datos
      const db = getDatabase();
      const snapshot = await get(ref(db, `usuarios/${uid}`));
      if (snapshot.exists()) {
        const data = snapshot.val();
        localStorage.setItem('nombreUsuario', data.nombreUsuario || '');
        localStorage.setItem('fotoPerfil', data.fotoPerfil || '');
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

  // Helper para verificar si un campo está completo
  campoCompleto(valor: any): boolean {
    return valor !== undefined && valor !== null && valor.toString().trim() !== '';
  }

  // Login con Google → redirige a Editar Perfil si es nuevo o incompleto
  async loginConGoogle() {
    this.error = '';
    const auth = getAuth();
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const uid = user.uid;
      const nombreUsuario = user.displayName || '';
      const correo = user.email || '';
      const fotoPerfil = user.photoURL || '';

      const db = getDatabase();
      const userRef = ref(db, `usuarios/${uid}`);
      const snapshot = await get(userRef);

      let redirigirAEditarPerfil = false;

      if (!snapshot.exists()) {
        // Usuario nuevo → lo creamos en la DB con campos vacíos
        await set(userRef, {
          nombreUsuario: nombreUsuario,
          correo: correo,
          rut: '', // faltante
          telefono: '',
          direccion: '',
          rol: 'comprador',
          fotoPerfil: fotoPerfil
        });

        redirigirAEditarPerfil = true;
      } else {
        // Usuario ya existe → revisamos si tiene campos obligatorios vacíos
        const data = snapshot.val();

        if (
          !this.campoCompleto(data.rut) ||
          !this.campoCompleto(data.telefono) ||
          !this.campoCompleto(data.direccion)
        ) {
          redirigirAEditarPerfil = true;
        }
      }

      // Guardar datos en localStorage
      localStorage.setItem('id', uid);
      localStorage.setItem('nombreUsuario', nombreUsuario);
      localStorage.setItem('correo', correo);
      localStorage.setItem('fotoPerfil', fotoPerfil);

      // Redirigir según corresponda
      if (redirigirAEditarPerfil) {
        this.router.navigate(['/editar-usuario', uid]);
      } else {
        this.router.navigate(['/home']);
      }

    } catch (err: any) {
      console.error('Error al iniciar sesión con Google:', err);
      this.error = 'Error al iniciar sesión con Google.';
    }
  }
}
