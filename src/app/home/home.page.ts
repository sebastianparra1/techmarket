import { Component, OnInit } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonAvatar, IonButton,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonChip,
  IonFab, IonFabButton, IonIcon, IonButtons, IonBadge, IonPopover, IonList, IonItem
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { add } from 'ionicons/icons';
import { CarritoService, CartItem } from '../services/carrito.service';
import { ProductoService } from '../services/productos.service';
import { FirebaseService } from '../services/firebase.service';
import { getDatabase, ref, child, get } from 'firebase/database';

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

  constructor(
    private productosService: ProductoService,
    private carritoService: CarritoService,
    private router: Router,
    private route: ActivatedRoute,
    private firebaseService: FirebaseService
  ) {}

  async ngOnInit() {
    this.actualizarContador();
    this.nombreUsuario = localStorage.getItem('nombreUsuario') || 'Usuario';
    this.idUsuario = localStorage.getItem('id') || this.route.snapshot.paramMap.get('id') || '';

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

  irAEditarPerfil() {
    if (this.idUsuario) {
      this.router.navigate(['/editar-usuario', this.idUsuario]);
    }
  }

  verTusChats() { // 🚀 NUEVA FUNCIÓN
    this.router.navigate(['/ver-chats']);
  }

  cerrarSesion() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
