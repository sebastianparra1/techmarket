import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { getDatabase, ref, get, child, onValue, set, update } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { RouterModule, Router } from '@angular/router';
import {
  IonicModule,
  IonButton,
  IonIcon,
  IonBadge,
  ModalController,
  PopoverController,
  ToastController
} from '@ionic/angular';
import { CarritoService, CartItem } from '../services/carrito.service';
import { ReportarPopoverComponent } from '../components/reportar-popover/reportar-popover.component';
import { ModalPremiumComponent } from '../components/modal-premium/modal-premium.component';

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
  esPremium: boolean = false;
  diasRestantes: number = 0;

  constructor(
    private carritoService: CarritoService,
    private router: Router,
    private popoverController: PopoverController,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit() {
    this.actualizarContador();
    this.nombreUsuario = localStorage.getItem('nombreUsuario') || 'Usuario';

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

    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      this.currentUserId = user.uid;
      this.currentUserEmail = user.email || '';

      const db = getDatabase();
      const userRef = ref(db, `usuarios/${this.currentUserId}`);
      onValue(userRef, (snapshot) => {
        const userData = snapshot.val();
        this.esPremium = userData?.premium === true;

        if (this.esPremium && userData.premiumInicio) {
          const fechaInicio = new Date(Number(userData.premiumInicio));
          const fechaActual = new Date();
          const diferencia = Math.floor((fechaInicio.getTime() + 30 * 24 * 60 * 60 * 1000 - fechaActual.getTime()) / (1000 * 60 * 60 * 24));
          this.diasRestantes = Math.max(0, diferencia);

          if (this.diasRestantes === 0) {
            update(userRef, { premium: false });
            this.esPremium = false;
          }
        }
      });
    }
  }

  agregarAlCarrito(producto: Producto) {
    const item: CartItem = {
      name: producto.nombre,
      id: producto.id,
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
            productoId: venta.productoId
          });
        }
      });

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
      this.router.navigate(['/mis-compras']);
    }
  }

  async abrirMenuReportes(ev: Event, producto: Producto) {
    const popover = await this.popoverController.create({
      component: ReportarPopoverComponent,
      event: ev,
      translucent: true,
      componentProps: {
        productoId: producto.id,
        productoNombre: producto.nombre,
        currentUserId: this.currentUserId,
        productoCreadoPor: producto.creadoPor
      }
    });
    await popover.present();
  }

  async mostrarModalPremium() {
    const modal = await this.modalCtrl.create({
      component: ModalPremiumComponent
    });
    await modal.present();
  }

  async mostrarToastPremiumRequerido() {
    const toast = await this.toastCtrl.create({
      message: 'Debes hacerte Premium para acceder al intercambio de productos.',
      duration: 2500,
      position: 'bottom',
      color: 'warning'
    });
    await toast.present();
  }

  reportarProducto(productoId: string) {
    const db = getDatabase();
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      alert('Debes iniciar sesión para reportar un producto.');
      return;
    }

    const reporteRef = ref(db, `reportes/${productoId}/${currentUser.uid}`);
    set(reporteRef, {
      timestamp: new Date().toISOString(),
      usuario: currentUser.uid
    }).then(() => {
      alert('Producto reportado correctamente.');
    }).catch((error) => {
      console.error('Error al reportar producto:', error);
      alert('Error al reportar producto.');
    });
  }
}
