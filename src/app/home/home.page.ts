import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { getDatabase, ref, child, get, onValue, update } from 'firebase/database';
import { getAuth } from 'firebase/auth';

import { ModalPremiumComponent } from '../components/modal-premium/modal-premium.component';
import { CarritoService, CartItem } from '../services/carrito.service';
import { ProductoService } from '../services/productos.service';
import { FirebaseService } from '../services/firebase.service';
<<<<<<< HEAD
import { getDatabase, ref, child, get, update } from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
=======
>>>>>>> 3f75c91a24fa77bc0be1c7679a825451a4241688

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    IonicModule, // ✅ solo este para evitar conflictos
  ],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  carritoCount = 0;
  nombreUsuario: string = '';
  idUsuario: string = '';
  direccion: string = 'Cargando dirección...';
  usuarios: any[] = [];
  fotoPerfil: string = '';
  categorias: string[] = ['Periféricos', 'Electrónica', 'Monitores', 'Audio'];
  destacados: any[] = [];
  currentUserEmail: string = '';
  currentUserId: string = '';
  notificaciones: any[] = [];
  notificacionesSinLeerCount = 0;
  mostrarNotificaciones = false;
  esPremium: boolean = false;
  diasRestantes: number = 0;

  constructor(
    private productosService: ProductoService,
    private carritoService: CarritoService,
    private router: Router,
    private route: ActivatedRoute,
    private firebaseService: FirebaseService,
    private toastController: ToastController,
    private modalCtrl: ModalController
  ) {}

  async ngOnInit() {
    this.actualizarContador();
    this.nombreUsuario = localStorage.getItem('nombreUsuario') || 'Usuario';
    this.idUsuario = localStorage.getItem('id') || this.route.snapshot.paramMap.get('id') || '';

    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        this.currentUserId = user.uid;
        this.currentUserEmail = user.email || '';

        const db = getDatabase();
        const userRef = ref(db, `usuarios/${this.currentUserId}`);
        const snapshot = await get(userRef);
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

        await this.cargarNotificaciones();
      }
    });

    if (this.idUsuario) {
      this.obtenerDireccion();
      this.obtenerFotoPerfil();
    }

    this.obtenerTodosLosUsuarios();

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
      this.direccion = usuario?.direccion || '⚠️ Dirección no registrada';
    } catch {
      this.direccion = '⚠️ Error al obtener dirección';
    }
  }

  async obtenerFotoPerfil() {
    try {
      const usuario = await this.firebaseService.getUsuarioPorId(this.idUsuario);
      this.fotoPerfil = usuario?.fotoPerfil || '';
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
      image: producto.imagen,
      vendedorId: producto.creadoPor || ''  // 👈 esto es lo que faltaba
    };
    this.carritoService.addItem(item);
    this.actualizarContador();
  }

  actualizarContador() {
    const items = this.carritoService.getItems();
    this.carritoCount = items.reduce((acc, item) => acc + item.quantity, 0);
  }

  async cargarNotificaciones() {
    if (!this.currentUserId || !this.currentUserEmail) return;

    const db = getDatabase();
    let nuevas: any[] = [];

    try {
      const [ventasSnap, vendedorSnap, compradorSnap] = await Promise.all([
        get(ref(db, 'ventas')),
        get(ref(db, `notificacionesVendedor/${this.currentUserId}`)),
        get(ref(db, `notificacionesComprador/${this.currentUserId}`))
      ]);

      const ventasData = ventasSnap.val() || {};
      for (const venta of Object.values<any>(ventasData)) {
        if (venta.compradorEmail === this.currentUserEmail) {
          nuevas.push({
            tipo: 'Estado de pedido',
            productoNombre: venta.productoNombre,
            estado: venta.estado,
            productoImagen: venta.productoImagen,
            productoId: venta.productoId
          });
        }
      }

      const vendedorData = vendedorSnap.val() || {};
      for (const noti of Object.values<any>(vendedorData)) {
        nuevas.push({
          tipo: 'Nueva compra recibida',
          productoNombre: noti.productoNombre,
          mensaje: noti.mensaje,
          productoImagen: noti.productoImagen
        });
      }

      const compradorData = compradorSnap.val() || {};
      for (const noti of Object.values<any>(compradorData)) {
        nuevas.push({
          tipo: 'Compra realizada',
          productoNombre: noti.productoNombre,
          mensaje: noti.mensaje,
          productoImagen: noti.productoImagen
        });
      }

      this.notificaciones = [...nuevas];
      this.notificacionesSinLeerCount = this.notificaciones.length;

    } catch (err) {
      console.error('Error cargando notificaciones:', err);
    }
  }

  abrirNotificaciones() {
    this.mostrarNotificaciones = true;
    this.notificacionesSinLeerCount = 0;
  }

  cerrarNotificaciones() {
    this.mostrarNotificaciones = false;
  }

  irAMisCompras(noti: any) {
    const queryParams = noti.productoId ? { productoId: noti.productoId } : {};
    this.router.navigate(['/mis-compras'], { queryParams });
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

  irAProductoDetalle(producto: any) {
    this.router.navigate(['/producto-detalle', producto.id]);
  }

  irAChat(vendedorId: string) {
    this.router.navigate(['/chat', vendedorId]);
  }

  async mostrarModalPremium() {
    const userId = localStorage.getItem('id');
    if (!userId) {
      const toast = await this.toastController.create({
        message: 'Debes iniciar sesión para hacerte Premium.',
        duration: 3000,
        color: 'danger',
        position: 'bottom'
      });
      await toast.present();
      return;
    }

    const modal = await this.modalCtrl.create({
      component: ModalPremiumComponent
    });
    await modal.present();
  }

  async mostrarAvisoPremium() {
    const toast = await this.toastController.create({
      message: 'Debes ser usuario Premium para proponer intercambios.',
      duration: 2500,
      position: 'bottom',
      color: 'warning'
    });
    await toast.present();
  }
}
