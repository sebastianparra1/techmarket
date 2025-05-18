import { Component } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage {
  nombre: string = '';
  correo: string = '';
  contrasena: string = '';
  rut: string = '';
  telefono: string = '';
  direccion: string = '';
  comuna: string = '';
  region: string = '';

  constructor(
    private firebaseService: FirebaseService,
    private router: Router,
    private toastCtrl: ToastController
  ) {}

  async registrarUsuario() {
    try {
      await this.firebaseService.registrarUsuario(
        this.nombre,
        this.correo,
        this.contrasena,
        this.rut,
        this.telefono,
        this.direccion,
        this.comuna,
        this.region
      );
      const toast = await this.toastCtrl.create({
        message: '¡Registro exitoso!',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
      this.router.navigate(['/login']);
    } catch (error) {
      const toast = await this.toastCtrl.create({
        message: 'Error al registrar. Intenta nuevamente.',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    }
  }
}
