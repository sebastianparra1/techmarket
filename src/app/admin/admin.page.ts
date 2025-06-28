import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { getDatabase, ref, get, remove } from 'firebase/database';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent
  ]
})
export class AdminPage implements OnInit {
  usuarios: any[] = [];

  async ngOnInit() {
    const correo = localStorage.getItem('correo');
    if (correo !== 'equipotechmarket@gmail.com') {
      alert('Acceso no autorizado');
      location.href = '/home';
      return;
    }

    const db = getDatabase();
    const snapshot = await get(ref(db, 'usuarios'));
    if (snapshot.exists()) {
      const data = snapshot.val();
      this.usuarios = Object.entries(data).map(([uid, info]: any) => ({
        uid,
        ...info
      }));
    }
  }

  async eliminarUsuario(uid: string) {
    const confirmar = window.confirm('¿Estás seguro de eliminar esta cuenta?');
    if (!confirmar) return;

    await remove(ref(getDatabase(), `usuarios/${uid}`));
    this.usuarios = this.usuarios.filter(user => user.uid !== uid);
  }
}
