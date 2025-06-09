import { Component, AfterViewInit } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';

declare const google: any;

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage implements AfterViewInit {
  nombre: string = '';
  correo: string = '';
  contrasena: string = '';
  rut: string = '';
  telefono: string = '';
  direccion: string = '';
  rolSeleccionado: string = 'comprador';

  selectedFile: File | null = null;
  fotoPerfilURL: string = '';

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

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  async uploadImage(): Promise<string> {
    if (!this.selectedFile) return '';

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('upload_preset', 'ecommerce_upload'); // tu preset en Cloudinary

    const response = await fetch('https://api.cloudinary.com/v1_1/doa5jzxjx/image/upload', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    return data.secure_url;
  }

  async registrarUsuario() {
    if (
      !this.nombre ||
      !this.correo ||
      !this.contrasena ||
      !this.rut ||
      !this.telefono ||
      !this.direccion
    ) {
      const toast = await this.toastCtrl.create({
        message: 'Por favor, completa todos los campos.',
        duration: 2000,
        color: 'danger',
      });
      await toast.present();
      return;
    }

    if (!this.esRutValido(this.rut)) {
      const toast = await this.toastCtrl.create({
        message: 'El RUT ingresado no es válido.',
        duration: 2000,
        color: 'danger',
      });
      await toast.present();
      return;
    }

    const telefonoValido = /^[0-9]{9,}$/.test(this.telefono);
    if (!telefonoValido) {
      const toast = await this.toastCtrl.create({
        message: 'El teléfono debe tener solo números y al menos 9 dígitos.',
        duration: 2000,
        color: 'danger',
      });
      await toast.present();
      return;
    }

    try {
      const fotoPerfilURL = this.selectedFile ? await this.uploadImage() : '';

      await this.firebaseService.registrarUsuario(
        this.nombre,
        this.correo,
        this.contrasena,
        this.rut,
        this.telefono,
        this.direccion,
        this.rolSeleccionado || 'comprador',
        fotoPerfilURL
      );

      const toast = await this.toastCtrl.create({
        message: '¡Registro exitoso!',
        duration: 2000,
        color: 'success',
      });
      await toast.present();
      this.router.navigate(['/login']);
    } catch (error) {
      const toast = await this.toastCtrl.create({
        message: 'Error al registrar. Intenta nuevamente.',
        duration: 2000,
        color: 'danger',
      });
      await toast.present();
    }
  }

  ngAfterViewInit() {
    const input = document.getElementById('autocomplete') as HTMLInputElement;
    if (!input) return;

    const autocomplete = new google.maps.places.Autocomplete(input, {
      componentRestrictions: { country: 'cl' },
      types: ['geocode'],
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place && place.formatted_address) {
        this.direccion = place.formatted_address;
      }
    });
  }
}
