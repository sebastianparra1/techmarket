import { Component } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonAvatar, IonButton,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonChip,
  IonFab, IonFabButton, IonIcon, IonButtons, IonBadge, IonicModule
} from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { add, cartOutline, chatboxEllipsesOutline } from 'ionicons/icons';
import { CarritoService, CartItem } from '../services/carrito.service';
import { getDatabase, ref, get, child, onValue } from 'firebase/database';
import { getAuth } from 'firebase/auth';

interface Producto {
  id: string;
  nombre: string;
  precio: number;
  imagen: string;
  categoria?: string;
  descripcion?: string;
  creadoPor: string;
}

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonicModule
  ],
  templateUrl: './productos.page.html',
  styleUrls: ['./productos.page.scss'],
})
export class ProductosPage {
  add = add;
  carritoCount = 0;
  mensajeCount = 0;
  nombreUsuario: string = '';
  productos: Producto[] = [];
  currentUserId: string = '';

  constructor(
    private carritoService: CarritoService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.actualizarContador();
    this.nombreUsuario = localStorage.getItem('nombreUsuario') || 'Usuario';

    const auth = getAuth();
    const user = auth.currentUser;
    if (user) this.currentUserId = user.uid;

    const db = getDatabase();
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, 'productos'));

    if (snapshot.exists()) {
      const data = snapshot.val();
      this.productos = Object.keys(data).map(id => ({
        id,
        nombre: data[id].nombre,
        precio: data[id].precio,
        imagen: data[id].imagen,
        descripcion: data[id].descripcion || '',
        categoria: data[id].categoria || 'General',
        creadoPor: data[id].creadoPor
      }));
    } else {
      console.log('No se encontraron productos.');
    }

    this.cargarContadorMensajes();
  }

  ionViewWillEnter() {
    this.actualizarContador();
  }

  agregarAlCarrito(producto: Producto) {
    const item: CartItem = {
      name: producto.nombre,
      price: producto.precio,
      quantity: 1,
      image: producto.imagen
    };
    this.carritoService.addItem(item);
    this.actualizarContador();
  }

  actualizarContador() {
    const items = this.carritoService.getItems();
    this.carritoCount = items.reduce((acc, item) => acc + item.quantity, 0);
  }

  cargarContadorMensajes() {
    const db = getDatabase();
    const chatsRef = ref(db, 'chats');

    onValue(chatsRef, (snapshot) => {
      let count = 0;
      snapshot.forEach(chatSnap => {
        const chatId = chatSnap.key || '';
        if (chatId.includes(this.currentUserId)) {
          const mensajes = chatSnap.val();
          for (let key in mensajes) {
            if (mensajes[key].sender !== this.nombreUsuario && !mensajes[key].leido) {
              count++;
            }
          }
        }
      });
      this.mensajeCount = count;
    });
  }

  verTusChats() {
    this.router.navigate(['/ver-chats']);
  }
}
