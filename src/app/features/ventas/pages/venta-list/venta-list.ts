import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PaginaResponse } from '../../../../core/models/pagina-response';
import { getHttpErrorDetails } from '../../../../core/utils/http-error';
import { SiPermisoDirective } from '../../../../shared/directives/si-permiso.directive';
import { Cliente } from '../../../clientes/models/cliente.model';
import { ClienteService } from '../../../clientes/services/cliente-service';
import { EstadoVenta, Venta } from '../../models/venta.model';
import { VentaService } from '../../services/venta-service';

@Component({ selector: 'app-venta-list', imports: [CurrencyPipe, DatePipe, FormsModule, RouterLink, SiPermisoDirective], templateUrl: './venta-list.html', styleUrl: './venta-list.css' })
export class VentaList implements OnInit {
  private readonly api = inject(VentaService);
  private readonly clientesApi = inject(ClienteService);
  protected readonly clientes = signal<Cliente[]>([]);
  protected readonly respuesta = signal<PaginaResponse<Venta> | null>(null);
  protected readonly cargando = signal(false);
  protected readonly error = signal('');
  protected readonly clienteId = signal('');
  protected readonly estado = signal('');
  protected readonly desde = signal('');
  protected readonly hasta = signal('');
  protected readonly direccion = signal<'asc' | 'desc'>('desc');
  protected readonly pagina = signal(0);
  protected readonly tamanio = signal(10);
  protected readonly ventas = computed(() => this.respuesta()?.contenido ?? []);
  protected readonly paginas = computed(() => Math.max(1, this.respuesta()?.totalPaginas ?? 1));
  protected readonly paginaVentas = computed(() => this.ventas());
  protected readonly totalPagina = computed(() => this.paginaVentas().reduce((s, v) => s + Number(v.total), 0));

  ngOnInit(): void {
    this.clientesApi.listar(0, 100).subscribe({ next: p => this.clientes.set(p.contenido), error: (e: unknown) => this.error.set(getHttpErrorDetails(e).message) });
    this.buscar();
  }
  protected buscar(): void {
    this.error.set('');
    if (this.desde() && this.hasta() && this.desde() > this.hasta()) { this.error.set('La fecha “desde” no puede ser posterior a “hasta”.'); return; }
    this.pagina.set(0);
    this.consultar();
  }
  private consultar(): void {
    this.cargando.set(true);
    this.api.buscar({ clienteId: this.clienteId() ? Number(this.clienteId()) : null, estado: (this.estado() || null) as EstadoVenta | null, desde: this.desde() || null, hasta: this.hasta() || null }, this.pagina(), this.tamanio(), this.direccion()).subscribe({
      next: respuesta => { this.respuesta.set(respuesta); this.cargando.set(false); }, error: (e: unknown) => { this.error.set(getHttpErrorDetails(e).message); this.cargando.set(false); },
    });
  }
  protected limpiar(): void { this.clienteId.set(''); this.estado.set(''); this.desde.set(''); this.hasta.set(''); this.buscar(); }
  protected cambiarPagina(delta: -1 | 1): void { this.pagina.update(p => Math.max(0, Math.min(this.paginas() - 1, p + delta))); this.consultar(); }
  protected imprimirConsulta(): void { window.print(); }
  protected estadoVenta(value: string): EstadoVenta | null { return value ? value as EstadoVenta : null; }
}

