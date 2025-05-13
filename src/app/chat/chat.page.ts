import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';  // Importa IonicModule
import { FormsModule } from '@angular/forms';  // Importa FormsModule para usar ngModel

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule]  // Asegúrate de importar FormsModule aquí
})
export class ChatPage {
  nombreUsuario = localStorage.getItem('nombreUsuario') || 'Invitado';
  otroUsuario = 'Usuario2'; // Cambia según el caso
  nuevoMensaje: string = '';
  mensajes: any[] = [
    { sender: 'Usuario2', text: 'Hola, ¿cómo estás?' },
    { sender: 'Invitado', text: 'Bien, ¿y tú?' },
    { sender: 'Usuario2', text: 'Todo bien, gracias por preguntar.' }
  ];

  constructor() {}

  enviarMensaje() {
    if (this.nuevoMensaje.trim() === '') return;

    this.mensajes.push({
      sender: this.nombreUsuario,
      text: this.nuevoMensaje
    });

    this.nuevoMensaje = '';
  }
}
