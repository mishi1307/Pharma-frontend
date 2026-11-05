import { CurrencyPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { catchError, of } from 'rxjs';
import { ProductoMasVendido } from '../ventas/models/venta.model';
import { VentaService } from '../ventas/services/venta-service';

@Component({
  selector: 'app-mas-vendidos',
  imports: [CurrencyPipe],
  templateUrl: './mas-vendidos.html',
  styleUrl: './mas-vendidos.css',
})
export class MasVendidos implements OnInit {
  private readonly ventas = inject(VentaService);
  protected readonly filas = signal<ProductoMasVendido[]>([]);

  ngOnInit(): void {
    this.ventas.productosMasVendidos()
      .pipe(catchError(() => of([] as ProductoMasVendido[])))
      .subscribe((filas) => this.filas.set(filas));
  }
}