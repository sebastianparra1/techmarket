import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, onValue, push, set, get } from 'firebase/database';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule]
})
export class ChatPage {
  nombreUsuario = localStorage.getItem('nombreUsuario') || 'Invitado';
  vendedorId: string = '';
  nombreVendedor: string = '';
  nuevoMensaje: string = '';
  mensajes: any[] = [];
  chatId: string = '';
  currentUserId: string = '';

  constructor(private route: ActivatedRoute, private router: Router) {}

  async ionViewWillEnter() {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    this.currentUserId = user.uid;
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
        .filter(m => m.text)
        .sort((a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

      this.mensajes = mensajesArray;

      setTimeout(() => {
        const el = document.querySelector('.messages-container');
        if (el) el.scrollTop = el.scrollHeight;
      }, 100);
    });
  }

  enviarMensaje() {
    if (!this.nuevoMensaje.trim()) return;

    const db = getDatabase();
    const chatRef = ref(db, `chats/${this.chatId}`);
    const mensaje = {
      sender: this.nombreUsuario,
      text: this.nuevoMensaje,
      timestamp: new Date().toISOString(),
      leido: false
    };

    const mensajeRef = push(chatRef);
    set(mensajeRef, mensaje).then(() => {
      this.nuevoMensaje = '';
    });
  }
}