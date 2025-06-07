import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonButton, IonIcon, IonInput, IonTextarea,
  IonLabel, IonItem, IonList, IonThumbnail,
} from '@ionic/angular/standalone';

import { getAuth } from 'firebase/auth';
import { getDatabase, ref, get, set, push, update, remove, onValue } from 'firebase/database';

@Component({
  selector: 'app-pagina-vendedor',
  templateUrl: './pagina-vendedor.page.html',
  styleUrls: ['./pagina-vendedor.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonButton, IonIcon, IonInput, IonTextarea, IonThumbnail,
    IonLabel, IonItem, IonList, CommonModule, FormsModule
  ]
})
export class PaginaVendedorPage implements OnInit {
  mostrarZonaCarga = false;
  previewUrls: string[] = [];
  selectedFile: File | null = null;
  permitidoVender = false;
  nombreUsuario: string = '';
  productosVendedor: any[] = [];
  productoEditando: any = null;

  nuevoProducto: {
    nombre?: string;
    precio?: number;
    descripcion?: string;
    categoria?: string;
    unidades?: number; // AGREGAR ESTA LINEA
  } = {};

  constructor(private router: Router) {}

  ngOnInit(): void {
    const guardado = localStorage.getItem('nombreUsuario');
    if (guardado) {
      this.nombreUsuario = guardado;
    }

    this.validarAcceso();
  }

  async validarAcceso() {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      alert('Debes iniciar sesión para acceder.');
      this.router.navigate(['/login']);
      return;
    }

    const uid = currentUser.uid;
    const db = getDatabase();
    const userRef = ref(db, `usuarios/${uid}`);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      const nombre = data.nombre || data.nombreUsuario || 'Usuario';
      this.nombreUsuario = nombre;
      localStorage.setItem('nombreUsuario', nombre);

      // Se permite vender a todos los usuarios autenticados
      this.permitidoVender = true;
      this.cargarProductosDelVendedor(uid);
    } else {
      alert('No se encontró información del usuario.');
      this.router.navigate(['/productos']);
    }
  }

  cargarProductosDelVendedor(uid: string) {
    const db = getDatabase();
    const productosRef = ref(db, 'productos');

    onValue(productosRef, (snapshot) => {
      const data = snapshot.val() || {};
      this.productosVendedor = Object.entries(data)
        .map(([id, producto]: any) => ({ id, ...producto }))
        .filter(prod => prod.creadoPor === uid);
    });
  }

  agregarProducto() {
    this.mostrarZonaCarga = !this.mostrarZonaCarga;
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer?.files) {
      this.handleFiles(event.dataTransfer.files);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(input.files);
    }
  }

  handleFiles(files: FileList) {
    this.previewUrls = [];
    Array.from(files).forEach(file => {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        this.previewUrls.push(result);
      };
      reader.readAsDataURL(file);
    });
  }

  async uploadToCloudinary(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ecommerce_upload');

    const response = await fetch('https://api.cloudinary.com/v1_1/doa5jzxjx/image/upload', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    return data.secure_url;
  }

  async guardarProducto() {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const uid = currentUser.uid;

    if (!this.nuevoProducto.nombre || !this.nuevoProducto.precio || !this.selectedFile) {
      alert('Completa todos los campos y sube una imagen.');
      return;
    }

    try {
      const imageUrl = await this.uploadToCloudinary(this.selectedFile);
      const db = getDatabase();
      const productosRef = ref(db, `productos`);
      const nuevoRef = push(productosRef);

      await set(nuevoRef, {
        nombre: this.nuevoProducto.nombre,
        precio: this.nuevoProducto.precio,
        descripcion: this.nuevoProducto.descripcion || '',
        categoria: this.nuevoProducto.categoria || 'General',
        unidades: this.nuevoProducto.unidades || 0, // <--- nuevo campo
        imagen: imageUrl,
        creadoPor: uid,
        creadoEn: new Date().toISOString()
      });

      alert('Producto guardado correctamente');
      this.nuevoProducto = {};
      this.previewUrls = [];
      this.selectedFile = null;
      this.mostrarZonaCarga = false;
    } catch (error) {
      console.error('Error al guardar el producto', error);
      alert('Hubo un problema al guardar el producto');
    }
  }

  editarProducto(producto: any) {
    this.productoEditando = { ...producto };
  }

  async guardarEdicion() {
    if (!this.productoEditando.id) return;

    const db = getDatabase();
    const productoRef = ref(db, `productos/${this.productoEditando.id}`);

    await update(productoRef, {
      nombre: this.productoEditando.nombre,
      precio: this.productoEditando.precio,
      descripcion: this.productoEditando.descripcion,
      categoria: this.productoEditando.categoria || 'General'
    });

    this.productoEditando = null;
  }

  cancelarEdicion() {
    this.productoEditando = null;
  }

  async eliminarProducto(id: string) {
    const db = getDatabase();
    const productoRef = ref(db, `productos/${id}`);
    await remove(productoRef);
  }
}
