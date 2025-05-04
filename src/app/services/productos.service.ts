import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  carrito: any[] = []; // Aquí se almacenarán los productos del carrito

  constructor() { }

  // Método para agregar un producto al carrito
  agregarAlCarrito(producto: any) {
    // Verificar si el producto ya está en el carrito
    const index = this.carrito.findIndex(item => item.id === producto.id);
    if (index === -1) {
      // Si no está, lo agregamos
      this.carrito.push(producto);
    } else {
      // Si ya está, podemos incrementar la cantidad o actualizar el producto
      this.carrito[index].cantidad += 1; // Por ejemplo, incrementamos la cantidad
    }
    console.log('Producto agregado al carrito:', this.carrito);
  }

  // Método para obtener los productos del carrito
  obtenerCarrito() {
    return this.carrito;
  }
}
