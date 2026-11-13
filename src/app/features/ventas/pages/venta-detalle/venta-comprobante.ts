import { CurrencyPipe, DatePipe } from '@angular/common';
import { AfterViewInit, Component, input, output } from '@angular/core';
import { Cliente } from '../../../clientes/models/cliente.model';
import { Venta } from '../../models/venta.model';

@Component({
  selector: 'app-venta-comprobante',
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './venta-comprobante.html',
  styleUrl: './venta-comprobante.css',
})
export class VentaComprobante implements AfterViewInit {
  readonly venta = input.required<Venta>();
  readonly cliente = input<Cliente | null>(null);
  readonly impresoEn = input.required<Date>();
  readonly listo = output<void>();

  ngAfterViewInit(): void {
    this.listo.emit();
  }
}
