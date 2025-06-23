import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import emailjs from 'emailjs-com';
import { getDatabase, ref, get, update, push, set } from 'firebase/database';

@Component({
  selector: 'app-pago',
  standalone: true,
  templateUrl: './pago.page.html',
  styleUrls: ['./pago.page.scss'],
  imports: [CommonModule, IonicModule, FormsModule]
})
export class PagoComponent {
  numero: string = '';
  nombreTitular: string = '';
  vencimiento: string = '';
  cvv: string = '';
  mostrarTrasera: boolean = false;
  girar = false;
  animarShine = false;

  nombre: string = '';
  apellido: string = '';
  emailComprador: string = '';
  codigoPostal: string = '';
  rut: string = '';
  carrito: any[] = [];

  logoTarjeta: string = 'assets/default-card.png';

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['cart']) {
        this.carrito = JSON.parse(params['cart']).map((item: any) => ({
  ...item,
  price: Number(item.price)  // 🔥 lo convertimos a número real aquí
}));
      } else {
        this.carrito = [{
          id: params['id'] || '',
          nombre: params['nombre'] || '',
          price: params['precio'] || 0,
          image: params['imagen'] || '',
          vendedorId: params['vendedorId'] || '',
          quantity: 1
        }];
      }
    });
  }

  filtrarRut(event: any) {
    let valor = (event.detail.value || '').toLowerCase();
    valor = valor.replace(/[^0-9k]/g, '').slice(0, 9);
    const kIndex = valor.indexOf('k');
    if (kIndex !== -1 && kIndex !== valor.length - 1) {
      valor = valor.replace(/k/g, '');
    }
    this.rut = valor;
    event.target.value = this.rut;
  }

  get numeroFormateado(): string {
    return this.numero.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  }

  actualizarNumero(event: any) {
    const input = event.detail.value || '';
    const soloNumeros = input.replace(/\D/g, '').slice(0, 16);
    const formateado = soloNumeros.replace(/(.{4})/g, '$1 ').trim();
    this.numero = soloNumeros;
    event.target.value = formateado;

    if (soloNumeros.startsWith('4')) {
      this.logoTarjeta = 'assets/images/Visa.png';
    } else if (/^5[1-5]/.test(soloNumeros)) {
      this.logoTarjeta = 'assets/images/Mastercard.png';
    } else {
      this.logoTarjeta = '';
    }

    if (soloNumeros.length === 16) {
      this.animarShine = true;
      setTimeout(() => (this.animarShine = false), 1000);
    }
  }

  actualizarVencimiento(event: any) {
    let valor = (event.detail.value || '').replace(/\D/g, '').slice(0, 4);
    if (valor.length >= 3) {
      valor = valor.slice(0, 2) + '/' + valor.slice(2);
    }
    this.vencimiento = valor;
    event.target.value = valor;
  }

  actualizarCVV(event: any) {
    const valor = (event.detail.value || '').replace(/\D/g, '').slice(0, 3);
    this.cvv = valor;
    event.target.value = valor;
  }

  esRutValido(rut: string): boolean {
    rut = rut.toLowerCase().replace(/[^0-9k]/g, '');
    if (rut.length < 2 || rut.length > 9) return false;
    const cuerpo = rut.slice(0, -1);
    const dvIngresado = rut.slice(-1);
    let suma = 0, multiplo = 2;
    for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += parseInt(cuerpo.charAt(i)) * multiplo;
      multiplo = multiplo < 7 ? multiplo + 1 : 2;
    }
    const dvCalculado = 11 - (suma % 11);
    const dvFinal = dvCalculado === 11 ? '0' : dvCalculado === 10 ? 'k' : dvCalculado.toString();
    return dvIngresado === dvFinal;
  }

  pagar() {
    const camposObligatorios = [
      this.numero, this.nombreTitular, this.vencimiento, this.cvv,
      this.nombre, this.apellido, this.emailComprador, this.codigoPostal, this.rut
    ];
    if (camposObligatorios.some(campo => !campo || campo.trim() === '')) {
      alert('Por favor, completa todos los campos antes de continuar.');
      return;
    }
    if (!this.esRutValido(this.rut)) {
      alert('RUT inválido. Por favor revisa el rut ingresado.');
      return;
    }

    const db = getDatabase();
    const compradorId = localStorage.getItem('id') || '';
    const compradorNombreCompleto = this.nombre + ' ' + this.apellido;

    for (const item of this.carrito) {
  const nombreProducto = item.name || item.nombre;
  const vendedorId = item.vendedorId || '';

  const templateParams = {
    to_name: compradorNombreCompleto,
    user_email: this.emailComprador,
    producto_nombre: nombreProducto,
    producto_precio: `$${item.price}`,
    producto_imagen: item.image,
    unidades_compradas: item.quantity,
    mensaje: 'Su paquete va camino al centro de distribución'
  };

  emailjs.send('service_17lzgkc', 'template_ecwohrd', templateParams, '089yXtpwCl6dhowXI')
    .then(() => console.log('Correo enviado para', nombreProducto))
    .catch(err => console.error('Error al enviar correo', err));


  const productoRef = ref(db, `productos/${item.id}`);
  get(productoRef).then(snapshot => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const nuevasUnidades = Math.max((+data.unidades || 0) - item.quantity, 0);
      update(productoRef, { unidades: nuevasUnidades });

      const ventasRef = ref(db, 'ventas');
      const nuevaVentaRef = push(ventasRef);
      set(nuevaVentaRef, {
        vendedorId,
        compradorId,
        compradorNombre: compradorNombreCompleto,
        compradorEmail: this.emailComprador,
        productoId: item.id,
        productoNombre: nombreProducto,
        productoImagen: item.image,
        cantidad: item.quantity,
        estado: 'Pendiente'
      });

      // 🔔 Notificación para el comprador
      const notiCompradorRef = ref(db, `notificacionesComprador/${compradorId}`);
      push(notiCompradorRef, {
        productoNombre: nombreProducto,
        productoImagen: item.image,
        mensaje: `Compraste ${item.quantity} unidad(es)`
      });

      // 🔔 Notificación para el vendedor
      const notiVendedorRef = ref(db, `notificacionesVendedor/${vendedorId}`);
      push(notiVendedorRef, {
        productoNombre: nombreProducto,
        productoImagen: item.image,
        compradorNombre: compradorNombreCompleto,
        mensaje: `El usuario ${compradorNombreCompleto} ha comprado tu producto ${nombreProducto} (${item.quantity} unidad(es))`,
        leida: false,
        timestamp: Date.now()

          const ventasRef = ref(db, 'ventas');
          const nuevaVentaRef = push(ventasRef);
          set(nuevaVentaRef, {
            vendedorId: item.vendedorId || '',
            compradorId: '',
            compradorNombre: this.nombre + ' ' + this.apellido,
            compradorEmail: this.emailComprador,
            productoId: item.id,
            productoNombre: item.nombre,
            productoImagen: item.image,
            precio: Number(item.price),  // ✅ fuerza a que se guarde como número
            cantidad: item.quantity,
            estado: 'Pendiente',
            fecha: Date.now()

          });
        }
 c17ccae (dashboard)
      });
    }
  });
}

    alert('¡Compra Realizada!');
    setTimeout(() => {
      this.router.navigate(['/home']);
    }, 1000);
  }
}
