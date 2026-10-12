import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { getHttpErrorDetails } from '../../../../core/utils/http-error';
import { VentaPorCategoria } from '../../models/venta.model';
import { VentaService } from '../../services/venta-service';

@Component({ selector: 'app-ventas-categoria', imports: [CurrencyPipe, FormsModule], templateUrl: './ventas-categoria.html', styleUrl: './ventas-categoria.css' })
export class VentasCategoria implements OnInit {
  private readonly api = inject(VentaService);
  protected readonly desde = signal('');
  protected readonly hasta = signal('');
  protected readonly filas = signal<VentaPorCategoria[]>([]);
  protected readonly cargando = signal(false);
  protected readonly error = signal('');
  protected readonly total = computed(() => this.filas().reduce((s, f) => s + Number(f.montoTotal), 0));
  protected readonly unidades = computed(() => this.filas().reduce((s, f) => s + Number(f.cantidadVendida), 0));
  ngOnInit(): void { this.cargar(); }
  protected cargar(): void {
    this.error.set('');
    if (this.desde() && this.hasta() && this.desde() > this.hasta()) { this.error.set('La fecha “desde” no puede ser posterior a “hasta”.'); return; }
    this.cargando.set(true);
    this.api.ventasPorCategoria(this.desde(), this.hasta()).subscribe({ next: filas => { this.filas.set(filas); this.cargando.set(false); }, error: (e: unknown) => { this.error.set(getHttpErrorDetails(e).message); this.cargando.set(false); } });
  }
  protected imprimir(): void { window.print(); }
}
