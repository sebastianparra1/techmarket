import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-carrito-de-compras',
  templateUrl: './carrito-de-compras.page.html',
  styleUrls: ['./carrito-de-compras.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class CarritoDeComprasPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
