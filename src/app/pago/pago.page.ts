import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

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
codigoPostal: string = '';
rut: string = '';
direccion: string = '';
region: string = '';

filtrarRut(event: any) {
  let valor = (event.detail.value || '').toLowerCase();

  // Solo permite números y 'k'
  valor = valor.replace(/[^0-9k]/g, '');

  // Limita a 9 caracteres (máximo 8 números + 1 'k' al final)
  valor = valor.slice(0, 9);

  // Si hay una 'k', que esté solo al final
  const kIndex = valor.indexOf('k');
  if (kIndex !== -1 && kIndex !== valor.length - 1) {
    // Si 'k' no está al final, se elimina
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

    // Animación si se completan los 16 dígitos
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
  // Verifica que todos los campos estén llenos
  const camposObligatorios = [
    this.numero,
    this.nombreTitular,
    this.vencimiento,
    this.cvv,
    this.nombre,
    this.apellido,
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

  // Verifica RUT válido
  if (!this.esRutValido(this.rut)) {
    alert('RUT inválido. Por favor revisa el rut ingresado.');
    return;
  }

  const datos = {
    numero: this.numero,
    nombreTitular: this.nombreTitular,
    vencimiento: this.vencimiento,
    cvv: this.cvv,
    nombre: this.nombre,
    apellido: this.apellido,
    codigoPostal: this.codigoPostal,
    rut: this.rut,
    direccion: this.direccion,
    region: this.region
  };

  console.log('Datos ingresados:', datos);
  alert('¡Se ha enviado un correo con su resivo!');
}
  
}
