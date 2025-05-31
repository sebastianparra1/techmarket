import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

@Component({
  selector: 'app-recuperar-clave',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './recuperar-clave.page.html',
  styleUrls: ['./recuperar-clave.page.scss'],
})
export class RecuperarClavePage {
  correo: string = '';
  mensaje: string = '';
  error: string = '';

  constructor(private toastCtrl: ToastController) {}

  async enviarCorreo() {
    this.mensaje = '';
    this.error = '';

    try {
      const auth = getAuth();
      auth.languageCode = 'es'; // 🇪🇸 Configura el idioma del correo a español

      await sendPasswordResetEmail(auth, this.correo);

      this.mensaje = '📧 Revisa tu correo para restablecer tu contraseña.';
      const toast = await this.toastCtrl.create({
        message: 'Correo de recuperación enviado.',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        this.error = 'No se encontró una cuenta con este correo.';
      } else if (err.code === 'auth/invalid-email') {
        this.error = 'El correo ingresado no es válido.';
      } else {
        this.error = 'Ocurrió un error. Intenta nuevamente.';
      }

      const toast = await this.toastCtrl.create({
        message: this.error,
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    }
  }
}
