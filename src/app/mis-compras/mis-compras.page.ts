import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router'; // ✅ IMPORTARLO
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, onValue } from 'firebase/database';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-mis-compras',
  standalone: true,
  templateUrl: './mis-compras.page.html',
  styleUrls: ['./mis-compras.page.scss'],
  imports: [CommonModule, IonicModule, FormsModule, RouterModule] // ✅ AGREGARLO AQUÍ
})
export class MisComprasPage implements OnInit {
  compras: any[] = [];
  currentUserEmail: string = '';
  productoIdSeleccionado: string = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    this.currentUserEmail = currentUser.email || '';

    // leer productoId de la notificación (si viene)
    this.route.queryParams.subscribe(params => {
      this.productoIdSeleccionado = params['productoId'] || '';
    });

    this.cargarCompras();
  }

  cargarCompras() {
    const db = getDatabase();
    const ventasRef = ref(db, 'ventas');

    onValue(ventasRef, (snapshot) => {
      const data = snapshot.val() || {};
      this.compras = Object.entries(data)
        .map(([id, venta]: any) => ({ id, ...venta }))
        .filter(venta => venta.compradorEmail === this.currentUserEmail);
    });
  }

  obtenerEstadoIndex(estado: string): number {
    const estados = [
      'Pedido confirmado',
      'Paquete dentro de centro de distribución',
      'Paquete en camino',
      'Paquete llega en 3 minutos',
      'Fue entregado exitosamente'
    ];

    // Si es venta recién creada, estado será "Pendiente"
    if (estado === 'Pendiente') return 0;

    const index = estados.indexOf(estado);
    return index >= 0 ? index : 0;
  }
}
