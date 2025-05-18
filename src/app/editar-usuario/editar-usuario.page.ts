import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';

@Component({
  selector: 'app-editar-usuario',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './editar-usuario.page.html',
  styleUrls: ['./editar-usuario.page.scss'],
})
export class EditarUsuarioPage implements OnInit {
  usuario: any = {
    nombreUsuario: '',
    clave: '',
    rut: '',
    telefono: '',
    direccion: '',
    comuna: '',
    region: ''
  };

  id: string = '';

  constructor(
    private route: ActivatedRoute,
    private firebaseService: FirebaseService,
    private toastCtrl: ToastController,
    private router: Router
  ) {}

  async ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    console.log('ID recibido:', this.id);

    try {
      const user = await this.firebaseService.getUsuarioPorId(this.id);
      if (user) {
        this.usuario = user;
      } else {
        console.warn('Usuario no encontrado');
      }
    } catch (error) {
      console.error('Error al cargar usuario:', error);
    }
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
      this.router.navigate(['/']); // Cambia esta ruta si necesitas redirigir a otro lugar
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
