import { Component } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonAvatar, IonButton,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonChip,
  IonFab, IonFabButton, IonIcon, IonButtons, IonBadge, IonicModule
} from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { add, cartOutline } from 'ionicons/icons';
import { CarritoService, CartItem } from '../services/carrito.service';
import { ProductoService } from '../services/productos.service';

// Definimos la interfaz Producto
interface Producto {
  nombre: string;
  precio: number;
  imagen: string;
  categoria: string;  // Agregada la propiedad categoria
}

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonicModule,  // Asegúrate de que IonicModule esté importado
  ],
  templateUrl: './productos.page.html',
  styleUrls: ['./productos.page.scss'],
})
export class ProductosPage {
  add = add;
  carritoCount = 0;
  nombreUsuario: string = '';

  // Definimos las imágenes
  imagenes: string[] = [
    'https://www.basurto.cl/cdn/shop/files/product_202109281025402071626389-2ef54fbb-5c34-4bab-92ad-f8968ad937e0.png?v=1719253494',
    'https://resource.logitech.com/content/dam/gaming/en/products/pro-keyboard/pro-keyboard-gallery/pan-pro-gaming-keyboard-gallery-topdown.png',
    'https://www.profesionalreview.com/wp-content/uploads/2019/09/Acer-XV3-Monitor-gaming.png',
    'https://www.asus.com/media/odin/websites/MX/News/qpyb6w1jhg6jrqkv/1.png',
    'https://sologamerbolivia.com/cdn/shop/products/mando-harrow.png?v=1621807993',
    'https://www.pngplay.com/wp-content/uploads/2/Gaming-Pc-Mouse-PNG-Clipart-Background.png',
    'https://cdnx.jumpseller.com/gtigx1/image/20843300/Luxury_M10-1.png?1648749993',
    'https://s3.eu-central-1.amazonaws.com/aoc.production.eu/public/media/2021/10/aoc-u28g2xu-hero-visual-2-1--big.png',
    'https://api.bg-gaming.com/uploads/product/images/main/3qkxe5ild1-BG_Range_Force_Main_pack2.png'
  ];

  // Array de productos con categoria incluida
  productos: Producto[] = [
    { nombre: 'Audifono Logitech', precio: 14990, imagen: this.imagenes[0], categoria: 'Audio' },
    { nombre: 'Teclado Logitech', precio: 39990, imagen: this.imagenes[1], categoria: 'Periféricos' },
    { nombre: 'Monitor', precio: 29990, imagen: this.imagenes[2], categoria: 'Monitores' },
    { nombre: 'NVIDIA GeForce RTX 3060 12 GB GPU', precio: 29990, imagen: this.imagenes[3], categoria: 'Tarjetas Graficas' },
    { nombre: 'Redragon Harrow - Joystick Inalámbrico para PC', precio: 29990, imagen: this.imagenes[4], categoria: 'Accesorios' },
    { nombre: 'Mouse Gamer Razer', precio: 29990, imagen: this.imagenes[5], categoria: 'Periféricos' },
    { nombre: 'Audífonos Gamer Luxury Bag Luminous M10 RGB', precio: 29990, imagen: this.imagenes[6], categoria: 'Audio' },
    { nombre: 'AOC U28G2XU con resolución 4K', precio: 29990, imagen: this.imagenes[7], categoria: 'Monitores' },
    { nombre: 'Pack Gamer Teclado + Mouse', precio: 29990, imagen: this.imagenes[8], categoria: 'Periféricos' }
  ];

  constructor(
    private productosService: ProductoService,
    private carritoService: CarritoService
  ) {}

  ngOnInit() {
    this.actualizarContador();
    this.nombreUsuario = localStorage.getItem('nombreUsuario') || 'Usuario';
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
}
