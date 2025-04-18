import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonThumbnail, IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/angular/standalone';

interface CartItem {
  name: string;
  price: number;
  quantity: number;
  image: string;
}

@Component({
  selector: 'app-carrito-de-compras',
  templateUrl: './carrito-de-compras.page.html',
  styleUrls: ['./carrito-de-compras.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonList, IonItem, IonLabel, IonThumbnail, IonButton, IonIcon,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    CommonModule, FormsModule
  ]
})
export class CarritoDeComprasPage implements OnInit {

  cartItems: CartItem[] = [
    {
      name: 'Celular Samsung',
      price: 250,
      quantity: 1,
      image: 'https://via.placeholder.com/150'
    },
    {
      name: 'Auriculares Bluetooth',
      price: 50,
      quantity: 2,
      image: 'https://via.placeholder.com/150'
    }
  ];

  constructor() { }

  ngOnInit() { }

  getTotal(): number {
    return this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  removeFromCart(itemToRemove: CartItem): void {
    this.cartItems = this.cartItems.filter(item => item !== itemToRemove);
  }

  increaseQuantity(item: CartItem): void {
    item.quantity++;
  }

  decreaseQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      item.quantity--;
    } else {
      // Opcional: preguntar si quiere eliminar el producto
      const confirmDelete = confirm('¿Quieres eliminar este producto del carrito?');
      if (confirmDelete) {
        this.removeFromCart(item);
      }
    }
  }

  checkout(): void {
    alert('¡Gracias por tu compra!');
    this.cartItems = []; // Vacía el carrito
  }

}
