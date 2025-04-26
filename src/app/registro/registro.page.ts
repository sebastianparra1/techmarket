import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // 👈 IMPORTANTE
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule], // 👈 AGREGA FormsModule AQUÍ
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage {
  nombre: string = '';
  correo: string = '';
  contrasena: string = '';

  registrarUsuario() {
    console.log('Usuario registrado:', this.nombre, this.correo, this.contrasena);
    alert('Registro exitoso');
  }
}
