import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { getDatabase, ref, onValue, push, set, get } from 'firebase/database';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule]
})
export class ChatPage {
  nombreUsuario = localStorage.getItem('nombreUsuario') || 'Invitado';
  vendedorId: string = '';
  nombreVendedor: string = '';
  fotoPerfilVendedor: string = '';
  nuevoMensaje: string = '';
  mensajes: any[] = [];
  chatId: string = '';
  currentUserId: string = '';
  selectedFile: File | null = null;
  previewImageUrl: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {}

  async ionViewWillEnter() {
    const uid = this.userService.getUid();
    if (!uid) return;

    this.currentUserId = uid;
    this.vendedorId = this.route.snapshot.paramMap.get('vendedorId') || '';

    if (!this.vendedorId) {
      this.subscribeToFirstAvailableChat();
      return;
    }

    this.chatId = [this.currentUserId, this.vendedorId].sort().join('_');

    const db = getDatabase();
    const vendedorRef = ref(db, `usuarios/${this.vendedorId}`);
    const snap = await get(vendedorRef);
    this.nombreVendedor = snap.exists() ? snap.val().nombreUsuario || 'Vendedor' : 'Vendedor';
    this.fotoPerfilVendedor = snap.exists() ? snap.val().fotoPerfil || '' : '';

    this.subscribeToChat();
  }

  subscribeToFirstAvailableChat() {
    const db = getDatabase();
    const chatsRef = ref(db, 'chats');
    onValue(chatsRef, (snapshot) => {
      const chats = snapshot.val();
      if (chats) {
        for (const chatId in chats) {
          const [uid1, uid2] = chatId.split('_');
          if (uid1 === this.currentUserId || uid2 === this.currentUserId) {
            const otroUsuario = uid1 === this.currentUserId ? uid2 : uid1;
            this.router.navigate(['/chat', otroUsuario]);
            return;
          }
        }
      }
    }, { onlyOnce: true });
  }

  subscribeToChat() {
    const db = getDatabase();
    const chatRef = ref(db, `chats/${this.chatId}`);
    onValue(chatRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      const mensajesArray = Object.entries(data)
        .map(([id, mensaje]: any) => ({ id, ...mensaje }))
        .sort((a, b) => new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime());

      this.mensajes = mensajesArray;

      setTimeout(() => {
        const el = document.querySelector('.messages-container');
        if (el) el.scrollTop = el.scrollHeight;
      }, 300);
    });
  }

  async enviarMensaje() {
    if (!this.currentUserId) return;

    const text = this.nuevoMensaje.trim();
    let imageUrl = '';

    if (this.selectedFile) {
      imageUrl = await this.uploadToCloudinary(this.selectedFile);
      this.selectedFile = null;
      this.previewImageUrl = '';
    }

    if (!text && !imageUrl) return;

    const db = getDatabase();
    const chatRef = ref(db, `chats/${this.chatId}`);
    const mensaje = {
      sender: this.nombreUsuario,
      senderId: this.currentUserId,
      text: text || '',
      image: imageUrl || '',
      timestamp: new Date().toISOString(),
      leido: false
    };

    const mensajeRef = push(chatRef);
    await set(mensajeRef, mensaje);
    this.nuevoMensaje = '';
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.previewImageUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  cancelarImagen() {
    this.selectedFile = null;
    this.previewImageUrl = '';
  }

  async uploadToCloudinary(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ecommerce_upload');

    const response = await fetch('https://api.cloudinary.com/v1_1/doa5jzxjx/image/upload', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    return data.secure_url;
  }
}
