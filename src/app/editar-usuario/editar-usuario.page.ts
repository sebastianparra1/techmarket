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
export class EditarUsuarioPage implements OnInit, AfterViewInit {
  usuario: any = {
    nombreUsuario: '',
    rut: '',
    telefono: '',
    direccion: ''
  };

  id: string = '';

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
        // Espera a que se monte el input y lo rellena
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

  async guardarCambios() {
    try {
      await this.firebaseService.actualizarUsuario(this.id, this.usuario);
      const toast = await this.toastCtrl.create({
        message: 'Cambios guardados correctamente.',
        duration: 2000,
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
