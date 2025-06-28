import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton
} from '@ionic/angular/standalone';

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential
} from 'firebase/auth';
import { getDatabase, ref, get, set } from 'firebase/database';
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.page.html',
  styleUrls: ['./admin-login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton
  ]
})
export class AdminLoginPage implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {
    if (Capacitor.getPlatform() !== 'web') {
      GoogleAuth.initialize({ mode: 'system' } as any);
    }
  }

  async loginAdminConGoogle() {
    const auth = getAuth();
    let correo = '';
    let uid = '';
    let nombreUsuario = '';
    let fotoPerfil = '';

    try {
      if (Capacitor.getPlatform() === 'web') {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        correo = user.email || '';
        uid = user.uid;
        nombreUsuario = user.displayName || '';
        fotoPerfil = user.photoURL || '';
      } else {
        const googleUser = await GoogleAuth.signIn();
        const credential = GoogleAuthProvider.credential(googleUser.authentication.idToken);
        const result = await signInWithCredential(auth, credential);
        const user = result.user;

        correo = user.email || '';
        uid = user.uid;
        nombreUsuario = user.displayName || googleUser.name || '';
        fotoPerfil = user.photoURL || googleUser.imageUrl || '';
      }

      if (correo !== 'equipotechmarket@gmail.com') {
        alert('⛔ Solo la cuenta de administración puede ingresar.');
        return;
      }

      localStorage.setItem('id', uid);
      localStorage.setItem('correo', correo);
      localStorage.setItem('nombreUsuario', nombreUsuario);
      localStorage.setItem('fotoPerfil', fotoPerfil);

      this.router.navigate(['/admin']);
    } catch (err) {
      console.error('❌ Error al iniciar sesión como admin:', err);
    }
  }
}
