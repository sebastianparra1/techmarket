import { Component } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { getDatabase, ref, update } from 'firebase/database';
import emailjs from 'emailjs-com';

@Component({
  selector: 'app-modal-premium',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './modal-premium.component.html'
})
export class ModalPremiumComponent {
  numero: string = '';
  nombreTitular: string = '';
  vencimiento: string = '';
  cvv: string = '';
  mostrarTrasera: boolean = false;
  logoTarjeta: string = 'assets/default-card.png';
  nombre: string = '';
  apellido: string = '';
  emailComprador: string = '';
  codigoPostal: string = '';
  rut: string = '';

  constructor(private modalCtrl: ModalController) {}

  cerrar() {
    this.modalCtrl.dismiss();
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

  pagarPremium() {
    const camposObligatorios = [
      this.numero, this.nombreTitular, this.vencimiento, this.cvv,
      this.nombre, this.apellido, this.emailComprador, this.codigoPostal, this.rut
    ];
    if (camposObligatorios.some(campo => !campo || campo.trim() === '')) {
      alert('Por favor, completa todos los campos.');
      return;
    }
    if (!this.esRutValido(this.rut)) {
      alert('RUT inválido.');
      return;
    }

    const db = getDatabase();
    const userId = localStorage.getItem('id') || '';
    const nombreCompleto = `${this.nombre} ${this.apellido}`;
    const ahora = Date.now();

    // ✅ Actualizar a premium con fecha de inicio
    update(ref(db, `usuarios/${userId}`), {
      premium: true,
      premiumDesde: ahora // <- CAMBIO AQUÍ
    })
    .then(() => console.log('Usuario actualizado a premium'))
    .catch(err => console.error('Error al actualizar premium:', err));

    // ✅ Enviar correo
    const templateParams = {
      to_name: nombreCompleto,
      user_email: this.emailComprador,
      producto_nombre: 'Plan Premium TechMarket',
      producto_precio: '$3.000',
      producto_imagen: 'https://cdn-icons-png.flaticon.com/512/709/709790.png',
      unidades_compradas: 1,
      mensaje: '¡Gracias por apoyar TechMarket! Tu cuenta ahora es Premium.'
    };

    emailjs.send('service_17lzgkc', 'template_ecwohrd', templateParams, '089yXtpwCl6dhowXI')
      .then(() => console.log('Correo enviado'))
      .catch(err => console.error('Error al enviar correo:', err));

    alert('¡Tu cuenta ahora es Premium! 🎉');

    // ✅ Recargar vista actual para reflejar el estado Premium
    this.modalCtrl.dismiss().then(() => {
      window.location.reload();
    });
  }
}
