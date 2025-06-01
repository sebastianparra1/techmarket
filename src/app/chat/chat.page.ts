import { Component, OnInit } from '@angular/core';
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
export class ChatPage implements OnInit {
  nombreUsuario = localStorage.getItem('nombreUsuario') || 'Invitado';
  vendedorId: string = '';
  nombreVendedor: string = '';
  nuevoMensaje: string = '';
  mensajes: any[] = [];
  chatId: string = '';
  currentUserId: string = '';

  constructor(private route: ActivatedRoute, private router: Router) {}

  async ngOnInit() {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    this.currentUserId = user.uid;
    this.vendedorId = this.route.snapshot.paramMap.get('vendedorId') || '';

    const db = getDatabase();

    if (!this.vendedorId) {
      const chatsRef = ref(db, 'chats');
      onValue(chatsRef, (snapshot) => {
        const chats = snapshot.val();
        if (chats) {
          for (const chatId in chats) {
            if (chatId.includes(this.currentUserId)) {
              const otroUsuario = chatId.replace(this.currentUserId, '').replace('_', '');
              this.router.navigate(['/chat', otroUsuario]);
              break;
            }
          }
        }
      }, { onlyOnce: true });
      return;
    }

    const vendedorRef = ref(db, `usuarios/${this.vendedorId}`);
    const snap = await get(vendedorRef);
    this.nombreVendedor = snap.exists() ? snap.val().nombreUsuario || 'Vendedor' : 'Vendedor';

    this.chatId = this.currentUserId < this.vendedorId
      ? `${this.currentUserId}_${this.vendedorId}`
      : `${this.vendedorId}_${this.currentUserId}`;

    const chatRef = ref(db, `chats/${this.chatId}`);
    onValue(chatRef, (snapshot) => {
      const data = snapshot.val();
      const mensajesArray = [];

      for (const key in data) {
        if (data[key].text) {
          mensajesArray.push({ id: key, ...data[key] });
        }
      }

      this.mensajes = mensajesArray.sort((a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

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
