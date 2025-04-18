import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-pagina-vendedor',
  templateUrl: './pagina-vendedor.page.html',
  styleUrls: ['./pagina-vendedor.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonIcon, CommonModule, FormsModule]
})
export class PaginaVendedorPage implements OnInit {

  constructor() { }

  ngOnInit() {}

  agregarProducto() {
    console.log('Agregar producto clickeado');
    // Aquí puedes poner la lógica para abrir un modal, redirigir, etc.
  }

}
