import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonImg } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonToggle,
  IonButton,
  IonList,
  IonText
} from '@ionic/angular/standalone';
import { getDatabase, ref, get, update, remove } from 'firebase/database';

@Component({
  selector: 'app-editar-admin',
  templateUrl: './editar-admin.page.html',
  styleUrls: ['./editar-admin.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, // ✅ AÑADE ESTO
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonToggle,
    IonButton,
    IonList,
    IonText,
    IonImg  // 👈 AÑÁDELO AQUÍ
  ]
})
export class EditarAdminPage implements OnInit {
  uid = '';
  usuario: any = {};
  productos: any[] = [];

  constructor(private route: ActivatedRoute, private router: Router) {}

  async ngOnInit() {
    this.uid = this.route.snapshot.paramMap.get('id') || '';

    const db = getDatabase();

    // Cargar datos del usuario
    const userSnap = await get(ref(db, `usuarios/${this.uid}`));
    if (userSnap.exists()) {
      this.usuario = userSnap.val();
    }

    // Cargar productos del usuario
    const productosSnap = await get(ref(db, 'productos'));
    if (productosSnap.exists()) {
      const data = productosSnap.val();
      this.productos = Object.entries(data)
        .filter(([_, prod]: any) => prod.usuarioId === this.uid)
        .map(([id, prod]: any) => ({ id, ...prod }));
    }
  }

  async guardarCambios() {
    const db = getDatabase();
    await update(ref(db, `usuarios/${this.uid}`), {
      nombreUsuario: this.usuario.nombreUsuario || '',
      direccion: this.usuario.direccion || '',
      rut: this.usuario.rut || '',
      telefono: this.usuario.telefono || '',
      premium: !!this.usuario.premium,
      fotoPerfil: this.usuario.fotoPerfil || ''
    });
    alert('✅ Cambios guardados correctamente.');
  }

  async eliminarProducto(id: string) {
    const confirmar = confirm('¿Estás seguro de eliminar este producto?');
    if (!confirmar) return;

    await remove(ref(getDatabase(), `productos/${id}`));
    this.productos = this.productos.filter(p => p.id !== id);
  }
}
