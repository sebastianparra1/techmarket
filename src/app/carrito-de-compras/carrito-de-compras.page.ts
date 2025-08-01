import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonList, IonItem, IonLabel, IonThumbnail, IonButton, IonIcon,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent
} from '@ionic/angular/standalone';
import { CarritoService, CartItem } from '../services/carrito.service';
import { RouterModule, Router } from '@angular/router';
import { getDatabase, ref, update, get, child } from 'firebase/database';

@Component({
  selector: 'app-carrito-de-compras',
  templateUrl: './carrito-de-compras.page.html',
  styleUrls: ['./carrito-de-compras.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonList, IonItem, IonLabel, IonThumbnail, IonButton, IonIcon,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    CommonModule, FormsModule,
    RouterModule
  ]
})
export class CarritoDeComprasPage implements OnInit {
  cartItems: CartItem[] = [];

  constructor(private carritoService: CarritoService, private router: Router) {}

  ngOnInit() {
    this.cartItems = this.carritoService.getItems();
  }

  getTotal(): number {
    return this.carritoService.getTotal();
  }

  removeFromCart(item: CartItem): void {
    this.carritoService.removeItem(item);
    this.cartItems = this.carritoService.getItems();
  }

  increaseQuantity(item: CartItem): void {
    item.quantity++;
  }

  decreaseQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      item.quantity--;
    } else {
      const confirmDelete = confirm('¿Quieres eliminar este producto del carrito?');
      if (confirmDelete) {
        this.removeFromCart(item);
      }
    }
  }

  irAPagar() {
    this.router.navigate(['/pago'], {
      queryParams: {
        cart: JSON.stringify(this.cartItems)
      }
    });
  }
}