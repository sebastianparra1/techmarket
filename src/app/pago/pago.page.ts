import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import emailjs, { EmailJSResponseStatus } from 'emailjs-com';
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

  // Campos adicionales del comprador
  nombre: string = '';
  apellido: string = '';
  emailComprador: string = '';
  codigoPostal: string = '';
  rut: string = '';
  direccion: string = '';
  region: string = '';

  // Variables del producto
  productoId: string = '';
  productoNombre: string = '';
  productoPrecio: number = 0;
  productoImagen: string = '';
  vendedorId: string = '';  // vendedorId recibido

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.productoId = params['id'] || '';
      this.productoNombre = params['nombre'] || '';
      this.productoPrecio = params['precio'] || 0;
      this.productoImagen = params['imagen'] || '';
      this.vendedorId = params['vendedorId'] || '';
    });
  }

  filtrarRut(event: any) {
    let valor = (event.detail.value || '').toLowerCase();
    valor = valor.replace(/[^0-9k]/g, '');
    valor = valor.slice(0, 9);
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

    let suma = 0;
    let multiplo = 2;

    for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += parseInt(cuerpo.charAt(i)) * multiplo;
      multiplo = multiplo < 7 ? multiplo + 1 : 2;
    }

    const dvCalculado = 11 - (suma % 11);
    let dvFinal = '';

    if (dvCalculado === 11) dvFinal = '0';
    else if (dvCalculado === 10) dvFinal = 'k';
    else dvFinal = dvCalculado.toString();

    return dvIngresado === dvFinal;
  }

  pagar() {
    const camposObligatorios = [
      this.numero,
      this.nombreTitular,
      this.vencimiento,
      this.cvv,
      this.nombre,
      this.apellido,
      this.emailComprador,
      this.codigoPostal,
      this.rut,
      this.direccion,
      this.region
    ];

    const hayCampoVacio = camposObligatorios.some(campo => !campo || campo.trim() === '');

    if (hayCampoVacio) {
      alert('Por favor, completa todos los campos antes de continuar.');
      return;
    }

    if (!this.esRutValido(this.rut)) {
      alert('RUT inválido. Por favor revisa el rut ingresado.');
      return;
    }

    const templateParams = {
      to_name: this.nombre + ' ' + this.apellido,
      user_email: this.emailComprador,
      producto_nombre: this.productoNombre,
      producto_precio: `$${this.productoPrecio}`,
      producto_imagen: this.productoImagen,
      mensaje: 'Su paquete va camino al centro de distribución'
    };

    emailjs.send('service_17lzgkc', 'template_ecwohrd', templateParams, '089yXtpwCl6dhowXI')
      .then((response: EmailJSResponseStatus) => {
        console.log('SUCCESS!', response.status, response.text);
        alert('¡Se ha enviado un correo con su recibo!');

        if (this.productoId) {
          const db = getDatabase();
          const productoRef = ref(db, `productos/${this.productoId}`);

          get(productoRef).then((snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.val();
              const unidadesActuales = +data.unidades || 0;
              const nuevasUnidades = unidadesActuales > 0 ? unidadesActuales - 1 : 0;

              update(productoRef, { unidades: nuevasUnidades })
                .then(() => {
                  console.log('Unidades actualizadas:', nuevasUnidades);

                  // GUARDAR VENTA EN 'ventas'
                  const ventasRef = ref(db, 'ventas');
                  const nuevaVentaRef = push(ventasRef);

                  set(nuevaVentaRef, {
                    vendedorId: this.vendedorId,
                    compradorId: '',
                    compradorNombre: this.nombre + ' ' + this.apellido,
                    compradorEmail: this.emailComprador,
                    productoId: this.productoId,
                    productoNombre: this.productoNombre,
                    productoImagen: this.productoImagen,  // importante para las notificaciones
                    estado: 'Pendiente'
                  })
                    .then(() => {
                      console.log('Venta registrada con éxito.');

                      // GUARDAR NOTIFICACION PARA EL VENDEDOR
                      if (this.vendedorId) {
                        const notiVendedorRef = ref(db, `notificacionesVendedor/${this.vendedorId}`);
                        const nuevaNotiRef = push(notiVendedorRef);

                        set(nuevaNotiRef, {
                          mensaje: `El usuario ${this.nombre} ${this.apellido} ha comprado tu producto ${this.productoNombre}.`,
                          productoNombre: this.productoNombre,
                          compradorNombre: this.nombre + ' ' + this.apellido,
                          productoImagen: this.productoImagen,
                          leida: false,
                          timestamp: Date.now()
                        })
                          .then(() => {
                            console.log('Notificación enviada al vendedor.');
                          })
                          .catch(error => {
                            console.error('Error al guardar notificación:', error);
                          });
                      }
                    })
                    .catch(error => {
                      console.error('Error al registrar la venta:', error);
                    });
                })
                .catch(error => {
                  console.error('Error al actualizar unidades:', error);
                });
            }
          });
        }

      }, (err) => {
        console.log('FAILED...', err);
        alert('Error al enviar el correo. Intente nuevamente.');
      });
  }
}
