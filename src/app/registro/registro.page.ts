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
  rolSeleccionado: string = 'comprador';

  constructor(
    private firebaseService: FirebaseService,
    private router: Router,
    private toastCtrl: ToastController
  ) {}

  esRutValido(rut: string): boolean {
    rut = rut.toLowerCase().replace(/[^0-9k]/g, '');

    if (rut.length < 2 || rut.length > 9) return false;

    const cuerpo = rut.slice(0, -1);
    const dvIngresado = rut.slice(-1);

    let suma = 0;
    let multiplo = 2;

    for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += parseInt(cuerpo.charAt(i)) * multiplo;
      multiplo = multiplo < 7 ? multiplo + 1 : 2;
    }

    const dvCalculado = 11 - (suma % 11);
    let dvFinal = '';

    if (dvCalculado === 11) dvFinal = '0';
    else if (dvCalculado === 10) dvFinal = 'k';
    else dvFinal = dvCalculado.toString();

    return dvIngresado === dvFinal;
  }

  async registrarUsuario() {
    // Validación de campos vacíos
    if (
      !this.nombre || !this.correo || !this.contrasena || !this.rut ||
      !this.telefono || !this.direccion || !this.comuna || !this.region
    ) {
      const toast = await this.toastCtrl.create({
        message: 'Por favor, completa todos los campos.',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
      return;
    }

    // Validación de RUT
    if (!this.esRutValido(this.rut)) {
      const toast = await this.toastCtrl.create({
        message: 'El RUT ingresado no es válido.',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
      return;
    }

    // Validación de teléfono (mínimo 9 dígitos, solo números)
    const telefonoValido = /^[0-9]{9,}$/.test(this.telefono);
    if (!telefonoValido) {
      const toast = await this.toastCtrl.create({
        message: 'El teléfono debe tener solo números y al menos 9 dígitos.',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
      return;
    }

    // Registro si todo es válido
    try {
      await this.firebaseService.registrarUsuario(
        this.nombre,
        this.correo,
        this.contrasena,
        this.rut,
        this.telefono,
        this.direccion,
        this.comuna,
        this.region,
        this.rolSeleccionado || 'comprador'
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
