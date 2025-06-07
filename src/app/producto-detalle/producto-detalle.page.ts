import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { getDatabase, ref, child, get } from 'firebase/database';
import { CarritoService, CartItem } from '../services/carrito.service';
import { FirebaseService } from '../services/firebase.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-producto-detalle',
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    RouterModule
  ],
  templateUrl: './producto-detalle.page.html',
  styleUrls: ['./producto-detalle.page.scss'],
})
export class ProductoDetallePage implements OnInit {
  producto: any = null;
  carritoCount = 0;
  nombreUsuario: string = '';
  idUsuario: string = '';
  direccion: string = 'Cargando dirección...';
  mostrarZoom: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private carritoService: CarritoService,
    private firebaseService: FirebaseService
  ) {}

  async ngOnInit() {
    this.actualizarContador();
    this.nombreUsuario = localStorage.getItem('nombreUsuario') || 'Usuario';
    this.idUsuario = localStorage.getItem('id') || this.route.snapshot.paramMap.get('id') || '';
    if (this.idUsuario) {
      this.obtenerDireccion();
    }

    const productoId = this.route.snapshot.paramMap.get('id');
    if (productoId) {
      const db = getDatabase();
      const dbRef = ref(db);
      const snapshot = await get(child(dbRef, `productos/${productoId}`));

      if (snapshot.exists()) {
        this.producto = snapshot.val();
        this.producto.id = productoId;
      } else {
        console.log('Producto no encontrado.');
      }
    }
  }

  async obtenerDireccion() {
    try {
      const usuario = await this.firebaseService.getUsuarioPorId(this.idUsuario);
      if (usuario) {
        this.direccion = usuario.direccion || '⚠️ Dirección no registrada';
      } else {
        this.direccion = '⚠️ Usuario no encontrado';
      }
    } catch (error) {
      this.direccion = '⚠️ Error al obtener dirección';
    }
  }

  agregarAlCarrito() {
    const item: CartItem = {
      name: this.producto.nombre,
      price: this.producto.precio,
      quantity: 1,
      image: this.producto.imagen
    };
    this.carritoService.addItem(item);
    this.actualizarContador();
  }

  actualizarContador() {
    const items = this.carritoService.getItems();
    this.carritoCount = items.reduce((acc, item) => acc + item.quantity, 0);
  }

  irAPago() {
    this.router.navigate(['/pago'], {
      queryParams: {
        id: this.producto.id, // ← PASAMOS EL ID para restar unidades
        nombre: this.producto.nombre,
        precio: this.producto.precio,
        imagen: this.producto.imagen
      }
    });
  }

  irAEditarPerfil() {
    if (this.idUsuario) {
      this.router.navigate(['/editar-usuario', this.idUsuario]);
    }
  }

  cerrarSesion() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  abrirZoom() {
    this.mostrarZoom = true;
  }

  cerrarZoom() {
    this.mostrarZoom = false;
  }
}
