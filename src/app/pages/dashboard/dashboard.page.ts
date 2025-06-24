import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import Chart from 'chart.js/auto';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { getDatabase, get, ref } from 'firebase/database';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  @ViewChild('ventasChartCanvas', { static: false }) ventasChartCanvas!: ElementRef;
  @ViewChild('ingresosChartCanvas', { static: false }) ingresosChartCanvas!: ElementRef;

  totalProductos = 0;
  totalIntercambios = 0;
  ventasRealizadas = 0;
  mensajeSinDatos = '';
  chart: any;
  ingresosChart: any;
  gananciasTotales = 0;
  gananciasDetectadas = 0;
  ventasDetectadas = 0;
  

  ventasAgrupadasPorMes: { [mes: string]: any[] } = {};
  totalesPorMes: { [mes: string]: number } = {};

  constructor(public firebaseService: FirebaseService) {}

  async ngOnInit() {
    const uid = localStorage.getItem('id');
    if (!uid) return;

    const productos = await this.firebaseService.getProductosDeUsuario(uid);
    this.totalProductos = productos.length;

    const intercambios = await this.firebaseService.getIntercambios(uid);
    this.totalIntercambios = intercambios.length;

    const ventas = await this.firebaseService.getVentasDelUsuario(uid);
    this.ventasRealizadas = ventas.length;

    await this.cargarIngresosPorMes(uid);
    await this.cargarHistorialVentas(uid);
    

    setTimeout(() => {
      this.cargarGrafico(uid);
    }, 300);
  }

  // Clasificación automática por nombre
  detectarCategoria(nombre: string): string {
    const texto = nombre.toLowerCase();
    if (texto.includes('teclado')) return 'Periféricos';
    if (texto.includes('mouse')) return 'Periféricos';
    if (texto.includes('audífono') || texto.includes('headset')) return 'Audio';
    if (texto.includes('monitor') || texto.includes('pantalla')) return 'Pantallas';
    if (texto.includes('cable') || texto.includes('adaptador')) return 'Accesorios';
    if (texto.includes('silla') || texto.includes('mesa')) return 'Mobiliario';
    if (texto.includes('notebook') || texto.includes('laptop')) return 'Computadores';
    return 'General';
  }

  // Formatear precios en CLP
  formatearPrecio(valor: number): string {
    return '$' + valor.toLocaleString('es-CL');
  }

  // Formatear fechas en español
  formatearFecha(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  async cargarGrafico(uid: string) {
    const datos = await this.firebaseService.getProductosAgrupadosPorMes(uid);
    const labels = Object.keys(datos);
    const values = Object.values(datos);

    if (labels.length === 0) {
      this.mensajeSinDatos = 'Aún no hay productos registrados este mes.';
      return;
    }

    if (this.chart) this.chart.destroy();

    this.chart = new Chart(this.ventasChartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Productos agregados por mes',
          data: values,
          backgroundColor: '#3b82f6',
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true }
        }
      }
    });
  }

  async cargarIngresosPorMes(uid: string) {
    const datos = await this.firebaseService.getIngresosPorMes(uid);
    const labels = Object.keys(datos);
    const values = Object.values(datos);

    if (this.ingresosChart) this.ingresosChart.destroy();

    this.ingresosChart = new Chart(this.ingresosChartCanvas.nativeElement, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Ingresos por mes',
          data: values,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true }
        }
      }
    });
  }


  async cargarHistorialVentas(uid: string) {

    let sumaDetectada = 0;
    let cantidadDetectada = 0;
  const db = getDatabase();
  const ventasSnap = await get(ref(db, 'ventas'));
  const productosSnap = await get(ref(db, 'productos'));

  const agrupadas: { [mes: string]: any[] } = {};
  const totales: { [mes: string]: number } = {};

  ventasSnap.forEach(child => {
    const venta = child.val();
    if (
      venta.vendedorId === uid &&
      venta.fecha &&
      venta.productoNombre
    ) {
      const date = new Date(venta.fecha);
      const mes = date.toLocaleString('default', { month: 'short', year: 'numeric' });

      // Buscar producto por nombre
      let precio = venta.total || 0; // ✅ Preferimos el total directo desde la venta
      let categoria = 'General';
      const productoId = venta.productoId;

      if ((!precio || precio === 0) && productoId && productosSnap.hasChild(productoId)) {
        const producto = productosSnap.child(productoId).val();
        precio = producto.precio || 0;
        categoria = producto.categoria || 'General';
      }
      

      // Asignar al objeto venta
      venta.precio = precio;
      venta.categoria = categoria;

      if (!agrupadas[mes]) agrupadas[mes] = [];
      agrupadas[mes].push(venta);

      totales[mes] = (totales[mes] || 0) + precio;
    }
  });

  this.ventasAgrupadasPorMes = agrupadas;
  this.totalesPorMes = totales;
  this.gananciasTotales = Object.values(totales).reduce((sum, val) => sum + val, 0);

// ✅ Ganancias detectadas desde agrupadas
  const todasLasVentas = ([] as any[]).concat(...Object.values(agrupadas));
  this.ventasDetectadas = todasLasVentas.length;
  this.gananciasDetectadas = todasLasVentas.reduce(
  (sum: number, venta: any) => sum + (venta.precio || 0), 0);




}

getTotalPorGrupo(grupo: any[]): number {
  return grupo.reduce((sum: number, v: any) => sum + (v.precio || 0), 0);
}



}
