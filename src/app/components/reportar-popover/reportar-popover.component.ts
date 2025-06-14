import { Component, Input } from '@angular/core';
import { IonButton, IonContent, IonList, IonItem } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { getDatabase, ref, push, get, child, update } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import emailjs, { EmailJSResponseStatus } from 'emailjs-com';

@Component({
  selector: 'app-reportar-popover',
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonList, IonItem, IonButton],
  template: `
    <ion-content class="ion-padding">
      <ion-list>
        <ion-item button (click)="reportar()">Reportar este producto</ion-item>
      </ion-list>
    </ion-content>
  `,
})
export class ReportarPopoverComponent {
  @Input() productoId!: string;
  @Input() currentUserId!: string;
  @Input() productoNombre!: string;
  @Input() productoCreadoPor!: string;

  async reportar() {
    const db = getDatabase();
    const reporteRef = ref(db, `reportes/${this.productoId}`);

    try {
      // Obtener reporte actual
      const snapshot = await get(child(ref(db), `reportes/${this.productoId}`));
      let reporteActual = snapshot.exists() ? snapshot.val() : { usuarios: [], totalReportes: 0 };

      // Verificar si ya reportó
      if (reporteActual.usuarios.includes(this.currentUserId)) {
        alert('Ya has reportado este producto.');
        return;
      }

      // Añadir nuevo reporte
      reporteActual.usuarios.push(this.currentUserId);
      reporteActual.totalReportes++;
      await update(reporteRef, reporteActual);

      // Obtener info del vendedor
      const vendedorSnapshot = await get(child(ref(db), `usuarios/${this.productoCreadoPor}`));
      const vendedorData = vendedorSnapshot.exists()
  ? {
      nombre: vendedorSnapshot.val().nombreUsuario || 'Sin nombre',
      correo: vendedorSnapshot.val().correo || 'Sin correo'
    }
  : { nombre: 'Desconocido', correo: 'N/A' };


      // Parámetros para EmailJS
      const templateParams = {
        producto_nombre: this.productoNombre,
        producto_id: this.productoId,
        usuario_reportador: this.currentUserId,
        vendedor_id: this.productoCreadoPor,
        vendedor_nombre: vendedorData.nombre,
        vendedor_correo: vendedorData.correo,
        total_reportes: reporteActual.totalReportes,
        link_producto: `https://localhost:8100/producto-detalle/${this.productoId}`
        // En producción cambia a: `https://techmarket.com/producto-detalle/${this.productoId}`
      };

      // Enviar correo
      emailjs.send('service_17lzgkc', 'template_udker7b', templateParams, '089yXtpwCl6dhowXI')
        .then((response: EmailJSResponseStatus) => {
          console.log('Correo de reporte enviado correctamente!', response.status, response.text);
          alert('¡Gracias por reportar! Se ha notificado a los administradores.');
        })
        .catch((error) => {
          console.error('Error al enviar el correo de reporte:', error);
        });

    } catch (error) {
      console.error('Error al reportar producto:', error);
      alert('Error al reportar. Intenta nuevamente.');
    }
  }
}
