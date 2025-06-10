import { Component, OnInit } from '@angular/core';
import { getDatabase, ref, onValue, get } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ver-chats',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './ver-chats.page.html',
  styleUrls: ['./ver-chats.page.scss']
})
export class VerChatsPage implements OnInit {
  chats: { id: string, nombre: string, ultimoMensaje?: string }[] = [];
  currentUserId: string = '';

  constructor(private router: Router) {}

  async ngOnInit() {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    this.currentUserId = user.uid;

    const db = getDatabase();
    const chatsRef = ref(db, 'chats');

    onValue(chatsRef, async (snapshot) => {
      const data = snapshot.val();
      const ids = new Set<string>();

      this.chats = []; // 🚀 Limpiar array para evitar duplicados

      for (const chatId in data) {
        const [uid1, uid2] = chatId.split('_');
        if (uid1 === this.currentUserId || uid2 === this.currentUserId) {
          const otroUid = uid1 === this.currentUserId ? uid2 : uid1;

          if (!ids.has(otroUid)) {
            ids.add(otroUid);

            // Obtener nombre del otro usuario
            const userRef = ref(db, `usuarios/${otroUid}`);
            const userSnap = await get(userRef);
            const nombre = userSnap.exists() ? userSnap.val().nombreUsuario || 'Usuario' : 'Usuario';

            // Obtener el último mensaje (protegiendo timestamp)
            const mensajes = data[chatId];
            const mensajesArray = Object.values(mensajes || {}) as any[];

            const ultimo = mensajesArray.sort((a, b) => {
              const t1 = new Date(a.timestamp || 0).getTime();
              const t2 = new Date(b.timestamp || 0).getTime();
              return t2 - t1; // orden descendente → más reciente primero
            })[0];

            this.chats.push({
              id: otroUid,
              nombre,
              ultimoMensaje: ultimo?.text || ''
            });
          }
        }
      }
    });
  }

  abrirChat(uid: string) {
    this.router.navigate(['/chat', uid]);
  }
}
