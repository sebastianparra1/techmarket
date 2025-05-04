import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // Importante
import { CarritoService, CartItem } from '../services/carrito.service';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonAvatar, IonButton,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonChip,
  IonFab, IonFabButton, IonIcon, IonButtons, IonBadge
} from '@ionic/angular/standalone';
import { add } from 'ionicons/icons';


@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule], // Asegúrate de incluir RouterModule aquí
  templateUrl: './productos.page.html',
  styleUrls: ['./productos.page.scss'],
})
export class ProductosPage {

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
}
