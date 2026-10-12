import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { getHttpErrorDetails } from '../../../../core/utils/http-error';
import { VentaPorCategoria } from '../../models/reporte.model';
import { ReporteService } from '../../services/reporte-service';

@Component({
  selector: 'app-ventas-categoria',
  imports: [CurrencyPipe, FormsModule],
  templateUrl: './ventas-categoria.html',
  styleUrl: './ventas-categoria.css',
})
export class VentasCategoria implements OnInit {
  private readonly reporteService = inject(ReporteService);

  protected readonly desde = signal('');
  protected readonly hasta = signal('');
  protected readonly filas = signal<VentaPorCategoria[]>([]);
  protected readonly cargando = signal(false);
  protected readonly error = signal('');
  protected readonly totalUnidades = computed(() => this.filas().reduce((total, fila) => total + Number(fila.cantidadVendida), 0));
  protected readonly montoTotal = computed(
    () => this.filas().reduce((totalEnCentimos, fila) => totalEnCentimos + Math.round(Number(fila.montoTotal) * 100), 0) / 100,
  );
  protected readonly montoMayor = computed(() => Math.max(0, ...this.filas().map((fila) => Number(fila.montoTotal))));

  ngOnInit(): void {
    this.generar();
  }

  protected generar(): void {
    this.error.set('');

    if (this.desde() && this.hasta() && this.desde() > this.hasta()) {
      this.filas.set([]);
      this.error.set('La fecha “desde” no puede ser posterior a “hasta”.');
      return;
    }

    this.cargando.set(true);
    this.filas.set([]);

    this.reporteService.ventasPorCategoria(this.desde() || null, this.hasta() || null).subscribe({
      next: (filas) => {
        this.filas.set(filas);
        this.cargando.set(false);
      },
      error: (error: unknown) => {
        this.error.set(getHttpErrorDetails(error).message);
        this.cargando.set(false);
      },
    });
  }

  protected porcentajeMonto(fila: VentaPorCategoria): number {
    const mayor = this.montoMayor();
    return mayor > 0 ? (Number(fila.montoTotal) / mayor) * 100 : 0;
  }

  protected imprimir(): void {
    window.print();
  }
}
