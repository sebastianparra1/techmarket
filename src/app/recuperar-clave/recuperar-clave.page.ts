import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
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
  contador: number = 5;
  temporizador: any;

  constructor(
    private toastCtrl: ToastController,
    private router: Router
  ) {}

  async enviarCorreo() {
    this.mensaje = '';
    this.error = '';

    try {
      const auth = getAuth();
      auth.languageCode = 'es';

      await sendPasswordResetEmail(auth, this.correo);

      this.mensaje = `📧 Revisa tu correo. Redirigiendo en ${this.contador} segundos...`;
      const toast = await this.toastCtrl.create({
        message: 'Correo de recuperación enviado.',
        duration: 2000,
        color: 'success'
      });
      await toast.present();

      // ⏳ Inicia el conteo regresivo
      this.temporizador = setInterval(() => {
        this.contador--;
        this.mensaje = `📧 Revisa tu correo. Redirigiendo en ${this.contador} segundos...`;

        if (this.contador === 0) {
          clearInterval(this.temporizador);
          this.router.navigate(['/login']);
        }
      }, 1000);
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
