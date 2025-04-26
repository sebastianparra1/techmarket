import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // Importante

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule], // Asegúrate de incluir RouterModule aquí
  templateUrl: './productos.page.html',
  styleUrls: ['./productos.page.scss'],
})
export class ProductosPage {}
