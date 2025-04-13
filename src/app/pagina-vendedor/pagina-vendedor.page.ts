import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-pagina-vendedor',
  templateUrl: './pagina-vendedor.page.html',
  styleUrls: ['./pagina-vendedor.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class PaginaVendedorPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
