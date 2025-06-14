import { Component, OnInit } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonAvatar, IonButton,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonChip,
  IonFab, IonFabButton, IonIcon, IonButtons, IonBadge, IonPopover, IonList, IonItem,
  IonModal, IonLabel, IonThumbnail, // 👈 AÑADIDO
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { add, personOutline, pricetagOutline, chatboxEllipsesOutline, logOutOutline } from 'ionicons/icons';
import { CarritoService, CartItem } from '../services/carrito.service';
import { ProductoService } from '../services/productos.service';
import { FirebaseService } from '../services/firebase.service';
import { getDatabase, ref, child, get, onValue } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonAvatar,
    IonButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonChip,
    IonFab,
    IonFabButton,
    IonIcon,
    IonButtons,
    IonBadge,
    IonPopover,
    IonList,
    IonItem,
    IonModal,          // 👈 AÑADIDO
    IonLabel,          // 👈 AÑADIDO
    IonThumbnail,      // 👈 AÑADIDO
    FormsModule
  ],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  add = add;
  carritoCount = 0;
  nombreUsuario: string = '';
  idUsuario: string = '';
  direccion: string = 'Cargando dirección...';
  usuarios: any[] = [];
  fotoPerfil: string = '';

  categorias: string[] = ['Periféricos', 'Electrónica', 'Monitores', 'Audio'];
  destacados: any[] = [];

  // Variables para notificaciones 🚀
  currentUserEmail: string = '';
  currentUserId: string = '';
  notificaciones: any[] = [];
  notificacionesSinLeerCount = 0;
  mostrarNotificaciones = false;

  constructor(
    private productosService: ProductoService,
    private carritoService: CarritoService,
    private router: Router,
    private route: ActivatedRoute,
    private firebaseService: FirebaseService
  ) {
      addIcons({personOutline,pricetagOutline,chatboxEllipsesOutline,logOutOutline});}

  async ngOnInit() {
    this.actualizarContador();
    this.nombreUsuario = localStorage.getItem('nombreUsuario') || 'Usuario';
    this.idUsuario = localStorage.getItem('id') || this.route.snapshot.paramMap.get('id') || '';

    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      this.currentUserId = user.uid;
      this.currentUserEmail = user.email || '';
    }

    if (this.idUsuario) {
      this.obtenerDireccion();
      this.obtenerFotoPerfil();
    }

    this.obtenerTodosLosUsuarios();
    this.cargarNotificaciones(); // 🚀

    const db = getDatabase();
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, 'productos'));

    if (snapshot.exists()) {
      const data = snapshot.val();
      const productos = Object.keys(data).map(id => ({
        id,
        nombre: data[id].nombre,
        precio: data[id].precio,
        imagen: data[id].imagen,
        descripcion: data[id].descripcion || '',
        categoria: data[id].categoria || 'General',
        creadoPor: data[id].creadoPor,
        unidades: data[id].unidades || 0,
        ventas: data[id].ventas || 0
      }));

      productos.sort((a, b) => (b.ventas || 0) - (a.ventas || 0));
      this.destacados = productos.slice(0, 3);
    } else {
      console.log('No se encontraron productos para destacados.');
    }
  }

  ionViewWillEnter() {
    this.actualizarContador();
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

  async obtenerTodosLosUsuarios() {
    try {
      this.usuarios = await this.firebaseService.getUsuarios();
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    }
  }

  agregarAlCarrito(producto: any) {
    const item: CartItem = {
      id: producto.id,
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

  // 🚀 CARGAR NOTIFICACIONES (igual que productos.page.ts)
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
            productoId: venta.productoId
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
}
