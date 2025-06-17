import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { getDatabase, ref, onValue, push, set, get } from 'firebase/database';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service'; // ✅ Importado

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService // ✅ Inyectado
  ) {}

  async ionViewWillEnter() {
    const uid = this.userService.getUid();
    if (!uid) {
      console.error('❌ No hay UID disponible');
      return;
    }

    this.currentUserId = uid;
    console.log('✅ currentUserId cargado desde UserService:', this.currentUserId);

    this.vendedorId = this.route.snapshot.paramMap.get('vendedorId') || '';

    if (!this.vendedorId) {
      this.subscribeToFirstAvailableChat();
      return;
    }

    this.chatId = [this.currentUserId, this.vendedorId].sort().join('_');
    console.log('🧩 chatId armado:', this.chatId);

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
      console.log('Snapshot chat:', data);

      if (!data) return;

      const mensajesArray = Object.entries(data)
        .map(([id, mensaje]: any) => ({ id, ...mensaje }))
        .filter(m => m.text)
        .sort((a, b) => {
          const t1 = new Date(a.timestamp || 0).getTime();
          const t2 = new Date(b.timestamp || 0).getTime();
          return t1 - t2;
        });

      this.mensajes = mensajesArray;
      console.log('Mensajes cargados:', this.mensajes);

      setTimeout(() => {
        const el = document.querySelector('.messages-container');
        if (el) el.scrollTop = el.scrollHeight;
      }, 300);
    });
  }

  enviarMensaje() {
    if (!this.nuevoMensaje.trim()) return;

    if (!this.currentUserId) {
      console.error('❌ UID no disponible para enviar mensaje');
      return;
    }

    const db = getDatabase();
    const chatRef = ref(db, `chats/${this.chatId}`);
    const mensaje = {
      sender: this.nombreUsuario,
      senderId: this.currentUserId,
      text: this.nuevoMensaje,
      timestamp: new Date().toISOString(),
      leido: false
    };

    console.log('📤 Enviando mensaje:', mensaje);

    const mensajeRef = push(chatRef);
    set(mensajeRef, mensaje).then(() => {
      this.nuevoMensaje = '';
    });
  }
}
