import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, onValue, update } from 'firebase/database';
import emailjs from 'emailjs-com';

@Component({
  selector: 'app-ventas-vendedor',
  standalone: true,
  templateUrl: './ventas-vendedor.page.html',
  styleUrls: ['./ventas-vendedor.page.scss'],
  imports: [CommonModule, IonicModule, FormsModule]
})
export class VentasVendedorPage implements OnInit {
  ventas: any[] = [];
  vendedorId: string = '';

  usuariosMap: any = {}; // Mapa de usuarios (email → datos usuario)

  estadosOrden = [
    'Paquete dentro de centro de distribución',
    'Paquete en camino',
    'Paquete llega en 3 minutos',
    'Fue entregado exitosamente'
  ];

  ngOnInit() {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    this.vendedorId = currentUser.uid;

    this.cargarUsuarios(() => {
      this.cargarVentas();
    });
  }

  cargarUsuarios(callback: () => void) {
    const db = getDatabase();
    const usuariosRef = ref(db, 'usuarios');

    onValue(usuariosRef, (snapshot) => {
      const data = snapshot.val() || {};
      this.usuariosMap = {};

      Object.entries(data).forEach(([id, usuario]: any) => {
        this.usuariosMap[usuario.correo] = {
          direccion: usuario.direccion || '',
          region: usuario.region || '',
          rut: usuario.rut || '',
          telefono: usuario.telefono || ''
        };
      });

      // Luego de cargar usuarios, cargamos las ventas
      callback();
    });
  }

  cargarVentas() {
    const db = getDatabase();
    const ventasRef = ref(db, 'ventas');

    onValue(ventasRef, (snapshot) => {
      const data = snapshot.val() || {};
      this.ventas = Object.entries(data)
        .map(([id, venta]: any) => {
          const usuarioExtra = this.usuariosMap[venta.compradorEmail] || {
            direccion: 'Desconocida',
            region: 'Desconocida',
            rut: 'Desconocido',
            telefono: 'Desconocido'
          };

          return {
            id,
            ...venta,
            direccion: usuarioExtra.direccion,
            region: usuarioExtra.region,
            rut: usuarioExtra.rut,
            telefono: usuarioExtra.telefono
          };
        })
        .filter(venta => venta.vendedorId === this.vendedorId);
    });
  }

  actualizarEstado(venta: any, nuevoEstado: string) {
    const db = getDatabase();
    const ventaRef = ref(db, `ventas/${venta.id}`);

    update(ventaRef, { estado: nuevoEstado })
      .then(() => {
        console.log('Estado actualizado:', nuevoEstado);
        this.enviarCorreoEstado(venta, nuevoEstado);
      })
      .catch(error => {
        console.error('Error al actualizar estado:', error);
      });
  }

  enviarCorreoEstado(venta: any, nuevoEstado: string) {
    const templateParams = {
      to_name: venta.compradorNombre,
      user_email: venta.compradorEmail,
      producto_nombre: venta.productoNombre,
      estado_actualizado: nuevoEstado,
      mensaje: `El estado de su pedido ha cambiado a: "${nuevoEstado}"`
    };

    emailjs.send('service_17lzgkc', 'template_ecwohrd', templateParams, '089yXtpwCl6dhowXI')
      .then((response) => {
        console.log('Correo enviado con éxito:', response.status, response.text);
      }, (err) => {
        console.error('Error al enviar el correo:', err);
      });
  }

  esEstadoActivo(estadoActual: string, estadoBoton: string): boolean {
    const indexActual = this.estadosOrden.indexOf(estadoActual);
    const indexBoton = this.estadosOrden.indexOf(estadoBoton);
    return indexActual >= indexBoton && indexActual !== -1 && indexBoton !== -1;
  }

  abrirEnGoogleMaps(direccion: string) {
    const query = encodeURIComponent(direccion);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  }
}
