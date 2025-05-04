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

  pagar() {
    const datos = {
      numero: this.numero,
      nombreTitular: this.nombreTitular,
      vencimiento: this.vencimiento,
      cvv: this.cvv,
    };

    console.log('Datos ingresados:', datos);
    alert('¡Pago simulado enviado!');
  }
}
