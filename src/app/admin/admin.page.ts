import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; // ✅ AGREGA ESTA LÍNEA
import { getDatabase, ref, get, remove } from 'firebase/database';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonSelect,
  IonSelectOption,
  IonInput
} from '@ionic/angular/standalone';

import Chart from 'chart.js/auto';

// 📦 Exportación
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Extensión para evitar error con lastAutoTable
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: { finalY: number };
  }
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule, // ✅ AGREGA ESTA LÍNEA AQUÍ
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonSelect,
    IonSelectOption,
    IonInput
  ]
})
export class AdminPage implements OnInit {
  @ViewChild('graficoPremiumCanvas', { static: false }) graficoPremiumCanvas!: ElementRef;

  usuarios: any[] = [];
  busqueda: string = '';
  filtro: 'todos' | 'premium' | 'noPremium' = 'todos';
  totalPremiumCLP: number = 0;
  chart: any;

  get usuariosFiltrados() {
    return this.usuarios.filter(u => {
      const coincideBusqueda =
        u.nombreUsuario?.toLowerCase().includes(this.busqueda.toLowerCase()) ||
        u.uid?.toLowerCase().includes(this.busqueda.toLowerCase());

      const coincideFiltro =
        this.filtro === 'todos' ||
        (this.filtro === 'premium' && u.premium) ||
        (this.filtro === 'noPremium' && !u.premium);

      return coincideBusqueda && coincideFiltro;
    });
  }

  async ngOnInit() {
    const correo = localStorage.getItem('correo');
    if (correo !== 'equipotechmarket@gmail.com') {
      alert('Acceso no autorizado');
      location.href = '/home';
      return;
    }

    const db = getDatabase();
    const snapshot = await get(ref(db, 'usuarios'));
    if (snapshot.exists()) {
      const data = snapshot.val();
      this.usuarios = Object.entries(data).map(([uid, info]: any) => ({
        uid,
        ...info
      }));
    }

    this.calcularPremium();
    setTimeout(() => this.generarGrafico(), 200);
  }

  calcularPremium() {
    const totalPremium = this.usuarios.filter(u => u.premium).length;
    this.totalPremiumCLP = totalPremium * 3000;
  }

  generarGrafico() {
    if (this.chart) this.chart.destroy();

    const premiumCount = this.usuarios.filter(u => u.premium).length;
    const noPremiumCount = this.usuarios.length - premiumCount;

    this.chart = new Chart(this.graficoPremiumCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Premium', 'No Premium'],
        datasets: [{
          data: [premiumCount, noPremiumCount],
          backgroundColor: ['#3b82f6', '#ef4444']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  async eliminarUsuario(uid: string) {
    const confirmar = window.confirm('¿Estás seguro de eliminar esta cuenta?');
    if (!confirmar) return;

    await remove(ref(getDatabase(), `usuarios/${uid}`));
    this.usuarios = this.usuarios.filter(user => user.uid !== uid);
    this.calcularPremium();
    this.generarGrafico();
  }

  exportarExcel() {
    const datos = this.usuarios.map(u => ({
      'Nombre de usuario': u.nombreUsuario || 'Sin nombre',
      'Correo': u.correo,
      'ID': u.uid,
      'Premium': u.premium ? 'Sí' : 'No'
    }));

    datos.push({
      'Nombre de usuario': '',
      'Correo': '',
      'ID': '',
      'Premium': `TOTAL PREMIUM: $${this.totalPremiumCLP.toLocaleString('es-CL')}`
    });

    const hoja = XLSX.utils.json_to_sheet(datos);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Usuarios');

    const buffer = XLSX.write(libro, { bookType: 'xlsx', type: 'array' });
    const archivo = new Blob([buffer], { type: 'application/octet-stream' });
    saveAs(archivo, 'usuarios_techmarket.xlsx');
  }

  exportarPDF() {
    const doc = new jsPDF();
    const datos = this.usuarios.map(u => [
      u.nombreUsuario || 'Sin nombre',
      u.correo,
      u.uid,
      u.premium ? 'Sí' : 'No'
    ]);

    autoTable(doc, {
      head: [['Nombre de usuario', 'Correo', 'ID', 'Premium']],
      body: datos
    });

    doc.text(`TOTAL PREMIUM: $${this.totalPremiumCLP.toLocaleString('es-CL')}`, 14, doc.lastAutoTable.finalY + 10);
    doc.save('usuarios_techmarket.pdf');
  }
}
