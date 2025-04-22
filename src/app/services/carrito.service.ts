import { Injectable } from '@angular/core';

export interface CartItem {
  name: string;
  price: number;
  quantity: number;
  image: string;
}

@Injectable({
  providedIn: 'root'
})
export class CarritoService {

  private cartItems: CartItem[] = [];

  constructor() { }

  getItems(): CartItem[] {
    return this.cartItems;
  }

  addItem(item: CartItem): void {
    const existing = this.cartItems.find(p => p.name === item.name);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      this.cartItems.push(item);
    }
  }

  removeItem(item: CartItem): void {
    this.cartItems = this.cartItems.filter(p => p !== item);
  }

  clearCart(): void {
    this.cartItems = [];
  }

  getTotal(): number {
    return this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }
}
