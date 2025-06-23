import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { getDatabase, ref, child, get, onValue } from 'firebase/database';
import { CarritoService, CartItem } from '../services/carrito.service';
import { FirebaseService } from '../services/firebase.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-producto-detalle',
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    RouterModule
  ],
  templateUrl: './producto-detalle.page.html',
  styleUrls: ['./producto-detalle.page.scss'],
})
export class ProductoDetallePage implements OnInit {
  producto: any = null;
  carritoCount = 0;
  nombreUsuario: string = '';
  idUsuario: string = '';
  direccion: string = 'Cargando dirección...';
  mostrarZoom: boolean = false;
  fotoPerfil: string = '';
  notificaciones: any[] = [];
  notificacionesSinLeerCount = 0;
  mostrarNotificaciones = false;
  currentUserEmail: string = '';
  currentUserId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private carritoService: CarritoService,
    private firebaseService: FirebaseService
  ) {}

  async ngOnInit() {
    this.actualizarContador();
    this.nombreUsuario = localStorage.getItem('nombreUsuario') || 'Usuario';
    this.idUsuario = localStorage.getItem('id') || this.route.snapshot.paramMap.get('id') || '';

    const authUser = localStorage.getItem('correo');
    if (authUser) this.currentUserEmail = authUser;
    if (this.idUsuario) {
      this.obtenerDireccion();
      this.obtenerFotoPerfil();
      this.currentUserId = this.idUsuario;
    }

    this.cargarNotificaciones();

    const productoId = this.route.snapshot.paramMap.get('id');
    if (productoId) {
      const db = getDatabase();
      const dbRef = ref(db);
      const snapshot = await get(child(dbRef, `productos/${productoId}`));

      if (snapshot.exists()) {
        this.producto = snapshot.val();
        this.producto.id = productoId;
      } else {
        console.log('Producto no encontrado.');
      }
    }
  }

  async obtenerDireccion() {
    try {
      const usuario = await this.firebaseService.getUsuarioPorId(this.idUsuario);
      if (usuario) {
        this.direccion = usuario.direccion || '⚠️ Dirección no registrada';
      } else {
        this.direccion = '⚠️ Usuario no encontrado';
      }
    } catch (error) {
      this.direccion = '⚠️ Error al obtener dirección';
    }
  }

  async obtenerFotoPerfil() {
    try {
      const usuario = await this.firebaseService.getUsuarioPorId(this.idUsuario);
      if (usuario) {
        this.fotoPerfil = usuario.fotoPerfil || '';
      }
    } catch (error) {
      console.error('Error al obtener foto de perfil:', error);
    }
  }

  cargarNotificaciones() {
    const db = getDatabase();
    const nuevasNotificaciones: any[] = [];

    const ventasRef = ref(db, 'ventas');
    onValue(ventasRef, (snapshot) => {
      const data = snapshot.val() || {};
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

        const notiCompradorRef = ref(db, `notificacionesComprador/${this.currentUserId}`);
        onValue(notiCompradorRef, (snap2) => {
          const dataComprador = snap2.val() || {};
          Object.values(dataComprador).forEach((noti: any) => {
            nuevasNotificaciones.push({
              tipo: 'Compra realizada',
              productoNombre: noti.productoNombre,
              mensaje: noti.mensaje,
              productoImagen: noti.productoImagen
            });
          });

          this.notificaciones = nuevasNotificaciones;
          this.notificacionesSinLeerCount = nuevasNotificaciones.length;
        });
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

  irAEditarPerfil() {
    if (this.idUsuario) {
      this.router.navigate(['/editar-usuario', this.idUsuario]);
    }
  }

  verTusChats() {
    this.router.navigate(['/ver-chats']);
  }

  cerrarSesion() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  agregarAlCarrito() {
    const item: CartItem = {
      id: this.producto.id,
      name: this.producto.nombre,
      price: this.producto.precio,
      quantity: 1,
      image: this.producto.imagen
    };
    this.carritoService.addItem(item);
    this.actualizarContador();
  }

  actualizarContador() {
    const items = this.carritoService.getItems();
    this.carritoCount = items.reduce((acc, item) => acc + item.quantity, 0);
  }

  irAPago() {
  this.router.navigate(['/pago'], {
    queryParams: {
      id: this.producto.id,
      nombre: this.producto.nombre,
      precio: this.producto.precio,
      imagen: this.producto.imagen,
      vendedorId: this.producto.creadoPor,
      fecha: Date.now()
    }
  });
}

  abrirZoom() {
    this.mostrarZoom = true;
  }

  cerrarZoom() {
    this.mostrarZoom = false;
  }
}
