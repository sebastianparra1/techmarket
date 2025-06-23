import { Component, OnInit } from '@angular/core';
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
import { Router, RouterModule } from '@angular/router';

import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential
} from 'firebase/auth';
import { getDatabase, ref, get, set } from 'firebase/database';
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';


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
export class LoginPage implements OnInit {
  correo = '';
  clave = '';
  error = '';
  verPassword = false;

  constructor(private angularRouter: Router) {}

  ngOnInit() {
    if (Capacitor.getPlatform() !== 'web') {
      GoogleAuth.initialize({ mode: 'system' } as any);
    }
  }

  toggleVerPassword() {
    this.verPassword = !this.verPassword;
  }

  async login() {
    this.error = '';
    const auth = getAuth();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, this.correo, this.clave);
      const uid = userCredential.user.uid; // ✅ ESTA es la línea correcta

      console.log('✅ UID con email/password:', uid);

      localStorage.setItem('id', uid);
      localStorage.setItem('uid', uid);
      localStorage.setItem('correo', this.correo);

      const db = getDatabase();
      const snapshot = await get(ref(db, `usuarios/${uid}`));
      if (snapshot.exists()) {
        const data = snapshot.val();
        localStorage.setItem('nombreUsuario', data.nombreUsuario || '');
        localStorage.setItem('fotoPerfil', data.fotoPerfil || '');
      }

      this.angularRouter.navigate(['/home']);
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

  campoCompleto(valor: any): boolean {
    return valor !== undefined && valor !== null && valor.toString().trim() !== '';
  }

  async loginConGoogle() {
  this.error = '';
  const auth = getAuth();
  let uid = '';
  let nombreUsuario = '';
  let correo = '';
  let fotoPerfil = '';

  try {
    if (Capacitor.getPlatform() === 'web') {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      uid = user.uid; // ✅ UID real
      correo = user.email || '';
      nombreUsuario = user.displayName || '';
      fotoPerfil = user.photoURL || '';

      console.log('✅ UID con Google (web):', uid);
    } else {
  const googleUser = await GoogleAuth.signIn();

  const credential = GoogleAuthProvider.credential(googleUser.authentication.idToken);
  const result = await signInWithCredential(auth, credential);
  const user = result.user;

  uid = user.uid;
  correo = user.email || '';
  nombreUsuario = user.displayName || googleUser.name || '';
  fotoPerfil = user.photoURL || googleUser.imageUrl || '';

  console.log('✅ UID con Google (móvil):', uid);
}

    const db = getDatabase();
    const userRef = ref(db, `usuarios/${uid}`);
    const snapshot = await get(userRef);

    let redirigirAEditarPerfil = false;

    if (!snapshot.exists()) {
      await set(userRef, {
        nombreUsuario,
        correo,
        rut: '',
        telefono: '',
        direccion: '',
        rol: 'comprador',
        fotoPerfil
      });
      redirigirAEditarPerfil = true;
    } else {
      const data = snapshot.val();
      if (
        !this.campoCompleto(data.rut) ||
        !this.campoCompleto(data.telefono) ||
        !this.campoCompleto(data.direccion)
      ) {
        redirigirAEditarPerfil = true;
      }
    }

    localStorage.setItem('id', uid);
    localStorage.setItem('nombreUsuario', nombreUsuario);
    localStorage.setItem('correo', correo);
    localStorage.setItem('fotoPerfil', fotoPerfil);

    if (redirigirAEditarPerfil) {
      alert('⚠️ Te recomendamos completar tu perfil más adelante.');
    }

    this.angularRouter.navigate(['/home']);
  } catch (err: any) {
    console.error('❌ Error al iniciar sesión con Google:', err);
  }
}
}