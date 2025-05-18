import { Component } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonAvatar, IonButton,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonChip,
  IonFab, IonFabButton, IonIcon, IonButtons, IonBadge, IonPopover, IonList, IonItem 
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { add } from 'ionicons/icons';
import { CarritoService, CartItem } from '../services/carrito.service';
import { ProductoService } from '../services/productos.service';
import { getDatabase, ref, get, child } from 'firebase/database';

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
    IonItem
  ],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  add = add;
  carritoCount = 0;
  nombreUsuario: string = '';
  idUsuario: string = '';
  direccionUsuario: string = '';

  categorias: string[] = ['Periféricos', 'Electrónica'];
  imagenes: string[] = [
    'https://www.basurto.cl/cdn/shop/files/product_202109281025402071626389-2ef54fbb-5c34-4bab-92ad-f8968ad937e0.png?v=1719253494',
    'https://resource.logitech.com/content/dam/gaming/en/products/pro-keyboard/pro-keyboard-gallery/pan-pro-gaming-keyboard-gallery-topdown.png',
    'https://www.profesionalreview.com/wp-content/uploads/2019/09/Acer-XV3-Monitor-gaming.png'
  ];

  destacados = [
    { nombre: 'Audifono Logitech', precio: 14990, imagen: this.imagenes[0] },
    { nombre: 'Teclado Logitech', precio: 39990, imagen: this.imagenes[1] },
    { nombre: 'Monitor', precio: 29990, imagen: this.imagenes[2] }
  ];

  constructor(
    private productosService: ProductoService,
    private carritoService: CarritoService,
    private router: Router
  ) {}

  ngOnInit() {
    this.actualizarContador();
    this.nombreUsuario = localStorage.getItem('nombreUsuario') || 'Usuario';
    this.idUsuario = localStorage.getItem('id') || '';

    if (this.idUsuario) {
      this.obtenerDireccion();
    }
  }

  ionViewWillEnter() {
    this.actualizarContador();
  }

  async obtenerDireccion() {
    const db = getDatabase();
    const userRef = ref(db, `usuarios/${this.idUsuario}`);

    try {
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        this.direccionUsuario = data.direccion || 'Sin dirección';
      } else {
        this.direccionUsuario = 'Sin dirección';
      }
    } catch (error) {
      console.error('Error al obtener la dirección:', error);
      this.direccionUsuario = 'Sin dirección';
    }
  }

  agregarAlCarrito(producto: any, imagen: string) {
    const item: CartItem = {
      name: producto.nombre,
      price: producto.precio,
      quantity: 1,
      image: imagen
    };
    this.carritoService.addItem(item);
    this.actualizarContador();
  }

  actualizarContador() {
    const items = this.carritoService.getItems();
    this.carritoCount = items.reduce((acc, item) => acc + item.quantity, 0);
  }

  cerrarSesion() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
