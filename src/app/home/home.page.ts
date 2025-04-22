import { Component } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonAvatar, IonButton,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonChip,
  IonFab, IonFabButton, IonIcon, IonButtons, IonBadge
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { add } from 'ionicons/icons';
import { CarritoService, CartItem } from '../services/carrito.service';

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
    IonBadge
  ],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  add = add;
  carritoCount = 0;

  constructor(private carritoService: CarritoService) {}

  ngOnInit() {
    this.actualizarContador();
  }

  ionViewWillEnter() {
    this.actualizarContador();
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

  destacados = [
    { nombre: 'Audifono Logitech', precio: 14990 },
    { nombre: 'Teclado Logitech', precio: 39990 },
    { nombre: 'Monitor', precio: 29990 },
  ];

  imagenes = [
    'https://www.basurto.cl/cdn/shop/files/product_202109281025402071626389-2ef54fbb-5c34-4bab-92ad-f8968ad937e0.png?v=1719253494',
    'https://resource.logitech.com/content/dam/gaming/en/products/pro-keyboard/pro-keyboard-gallery/pan-pro-gaming-keyboard-gallery-topdown.png',
    'https://www.profesionalreview.com/wp-content/uploads/2019/09/Acer-XV3-Monitor-gaming.png'
  ];

  categorias = ['Periféricos', 'Electrónica'];
}
