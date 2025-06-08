import { Component, OnInit, AfterViewInit } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';

declare const google: any;

@Component({
  selector: 'app-editar-usuario',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './editar-usuario.page.html',
  styleUrls: ['./editar-usuario.page.scss'],
})
export class EditarUsuarioPage implements AfterViewInit {
  usuario: any = {
    nombreUsuario: '',
    rut: '',
    telefono: '',
    direccion: '',
    comuna: '',
    region: '',
    fotoPerfil: '' // añadimos fotoPerfil
  };

  id: string = '';
  selectedFile: File | null = null;
  fotoPerfilURL: string = '';

  constructor(
    private firebaseService: FirebaseService,
    private toastCtrl: ToastController,
    private router: Router
  ) {}

  async ngOnInit() {
    this.id = localStorage.getItem('id') || '';
    if (!this.id) return;

    try {
      const user = await this.firebaseService.getUsuarioPorId(this.id);
      if (user) {
        this.usuario = user;
        this.fotoPerfilURL = user.fotoPerfil || ''; // cargar foto actual
        setTimeout(() => {
          const input = document.getElementById('autocomplete') as HTMLInputElement;
          if (input) input.value = this.usuario.direccion || '';
        }, 500);
      }
    } catch (error) {
      console.error('Error al cargar usuario:', error);
    }
  }

  ngAfterViewInit() {
    const input = document.getElementById('autocomplete') as HTMLInputElement;
    if (!input) return;

    const autocomplete = new google.maps.places.Autocomplete(input, {
      componentRestrictions: { country: 'cl' },
      types: ['geocode']
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place && place.formatted_address) {
        this.usuario.direccion = place.formatted_address;
      }
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  async uploadImage(): Promise<string> {
    if (!this.selectedFile) return '';

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('upload_preset', 'ecommerce_upload'); // tu preset

    const response = await fetch('https://api.cloudinary.com/v1_1/doa5jzxjx/image/upload', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    return data.secure_url;
  }

  async guardarCambios() {
    try {
      let nuevaFotoPerfil = this.fotoPerfilURL;

      if (this.selectedFile) {
        nuevaFotoPerfil = await this.uploadImage();
      }

      await this.firebaseService.actualizarUsuario(this.id, {
        ...this.usuario,
        fotoPerfil: nuevaFotoPerfil
      });

      const toast = await this.toastCtrl.create({
        message: 'Cambios guardados correctamente. Reinicia la app para ver los cambios.',
        duration: 3000,
        color: 'success'
      });
      await toast.present();
      this.router.navigate(['/home']);
    } catch (error) {
      const toast = await this.toastCtrl.create({
        message: 'Error al guardar los cambios.',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    }
  }
}
