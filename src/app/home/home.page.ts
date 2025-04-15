import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonAvatar, IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonChip, IonFab, IonFabButton, IonIcon, IonButtons } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';  // Importar RouterModule aquí
import { add, cartOutline } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,  // Asegúrate de incluir RouterModule aquí
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
    IonButtons
  ],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  add = add;

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
