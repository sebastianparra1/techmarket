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

  categorias: string[] = ['Periféricos', 'Electrónica', 'Monitores', 'Audio'];
  destacados = [
    {
      nombre: 'Monitor LG UltraGear 27"',
      precio: 129990,
      imagen: 'https://www.profesionalreview.com/wp-content/uploads/2019/09/Acer-XV3-Monitor-gaming.png',
      descripcion: 'Monitor de 27" con 165Hz y 1ms'
    },
    {
      nombre: 'Audífonos Logitech G733',
      precio: 99990,
      imagen: 'https://www.basurto.cl/cdn/shop/files/product_202109281025402071626389-2ef54fbb-5c34-4bab-92ad-f8968ad937e0.png?v=1719253494',
      descripcion: 'Audífonos Logitech G733 Wireless Black'
    },
    {
      nombre: 'Teclado Logitech',
      precio: 39990,
      imagen: 'https://resource.logitech.com/content/dam/gaming/en/products/pro-keyboard/pro-keyboard-gallery/pan-pro-gaming-keyboard-gallery-topdown.png',
      descripcion: 'Teclado Logitech mecánico RGB'
    }
  ];

  constructor(
    private productosService: ProductoService,
    private carritoService: CarritoService,
    private router: Router,
    private route: ActivatedRoute,
    private firebaseService: FirebaseService
  ) {}

  ngOnInit() {
    this.actualizarContador();
    this.nombreUsuario = localStorage.getItem('nombreUsuario') || 'Usuario';
    this.idUsuario = localStorage.getItem('id') || this.route.snapshot.paramMap.get('id') || '';
    if (this.idUsuario) {
      this.obtenerDireccion();
    }
    this.obtenerTodosLosUsuarios();
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

  async obtenerTodosLosUsuarios() {
    try {
      this.usuarios = await this.firebaseService.getUsuarios();
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    }
  }

  agregarAlCarrito(producto: any) {
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

  irAEditarPerfil() {
    if (this.idUsuario) {
      this.router.navigate(['/editar-usuario', this.idUsuario]);
    }
  }

  cerrarSesion() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
