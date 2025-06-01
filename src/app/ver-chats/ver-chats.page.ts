import { Component, OnInit } from '@angular/core';
import { getDatabase, ref, onValue } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { get } from 'firebase/database';

@Component({
  selector: 'app-ver-chats',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './ver-chats.page.html',
  styleUrls: ['./ver-chats.page.scss']
})
export class VerChatsPage implements OnInit {
  chats: { id: string, nombre: string }[] = [];
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

      for (const chatId in data) {
        if (chatId.includes(this.currentUserId)) {
          const otroUid = chatId.replace(this.currentUserId, '').replace('_', '');

          if (!ids.has(otroUid)) {
            ids.add(otroUid);

            const userRef = ref(db, `usuarios/${otroUid}`);
            const userSnap = await get(userRef);
            const nombre = userSnap.exists() ? userSnap.val().nombreUsuario || 'Usuario' : 'Usuario';

            this.chats.push({ id: otroUid, nombre });
          }
        }
      }
    });
  }

  abrirChat(uid: string) {
    this.router.navigate(['/chat', uid]);
  }
}
