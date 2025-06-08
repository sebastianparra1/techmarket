import { Component } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonAvatar, IonButton,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonChip,
  IonFab, IonFabButton, IonIcon, IonButtons, IonBadge, IonicModule,
  IonSearchbar
} from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
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
  unidades?: number;
}

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonicModule,
    FormsModule
  ],
  templateUrl: './productos.page.html',
  styleUrls: ['./productos.page.scss'],
})
export class ProductosPage {
  carritoCount = 0;
  mensajeCount = 0;
  nombreUsuario: string = '';
  currentUserEmail: string = '';
  currentUserId: string = '';

  productos: Producto[] = [];
  productosOriginales: Producto[] = [];
  productosFiltrados: Producto[] = [];
  terminoBusqueda: string = '';

  notificaciones: any[] = [];
  notificacionesSinLeerCount = 0;
  mostrarNotificaciones = false;

  constructor(
    private carritoService: CarritoService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.actualizarContador();
    this.nombreUsuario = localStorage.getItem('nombreUsuario') || 'Usuario';

    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      this.currentUserId = user.uid;
      this.currentUserEmail = user.email || '';
    }

    const db = getDatabase();
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, 'productos'));

    if (snapshot.exists()) {
      const data = snapshot.val();
      this.productosOriginales = Object.keys(data).map(id => ({
        id,
        nombre: data[id].nombre,
        precio: data[id].precio,
        imagen: data[id].imagen,
        descripcion: data[id].descripcion || '',
        categoria: data[id].categoria || 'General',
        creadoPor: data[id].creadoPor,
        unidades: data[id].unidades || 0
      }));

      this.productosFiltrados = [...this.productosOriginales];
    } else {
      console.log('No se encontraron productos.');
    }

    this.cargarContadorMensajes();
    this.cargarNotificaciones();
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

  filtrarProductos() {
    const termino = this.terminoBusqueda.toLowerCase();

    this.productosFiltrados = this.productosOriginales.filter(p =>
      p.nombre.toLowerCase().includes(termino) ||
      (p.descripcion || '').toLowerCase().includes(termino) ||
      (p.categoria || '').toLowerCase().includes(termino)
    );
  }

  cargarNotificaciones() {
    const db = getDatabase();

    // Notificaciones de COMPRADOR
    const ventasRef = ref(db, 'ventas');
    onValue(ventasRef, (snapshot) => {
      const data = snapshot.val() || {};
      const nuevasNotificaciones: any[] = [];

      Object.entries(data).forEach(([id, venta]: any) => {
        if (venta.compradorEmail === this.currentUserEmail) {
          nuevasNotificaciones.push({
            tipo: 'Estado de pedido',
            productoNombre: venta.productoNombre,
            estado: venta.estado,
            productoImagen: venta.productoImagen,
            productoId: venta.productoId // ✅ Aquí lo agrego para que se pase a mis-compras
          });
        }
      });

      // Notificaciones de VENDEDOR
      const notiVendedorRef = ref(db, `notificacionesVendedor/${this.currentUserId}`);
      onValue(notiVendedorRef, (snap) => {
        const dataVendedor = snap.val() || {};

        Object.values(dataVendedor).forEach((noti: any) => {
          nuevasNotificaciones.push({
            tipo: 'Nueva compra recibida',
            productoNombre: noti.productoNombre,
            mensaje: noti.mensaje,
            productoImagen: noti.productoImagen
          });
        });

        // Actualizamos lista completa
        this.notificaciones = nuevasNotificaciones;
        this.notificacionesSinLeerCount = nuevasNotificaciones.length;
      });
    });
  }

  abrirNotificaciones() {
    this.mostrarNotificaciones = true;
    this.notificacionesSinLeerCount = 0;
  }

  cerrarNotificaciones() {
    this.mostrarNotificaciones = false;
  }

  irAMisCompras(noti: any) {
    if (noti.productoId) {
      this.router.navigate(['/mis-compras'], {
        queryParams: { productoId: noti.productoId }
      });
    } else {
      // Si no es de tipo Estado de pedido, simplemente ir a /mis-compras
      this.router.navigate(['/mis-compras']);
    }
  }
}
