import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PaginaResponse } from '../../../../core/models/pagina-response';
import { getHttpErrorDetails } from '../../../../core/utils/http-error';
import { SiPermisoDirective } from '../../../../shared/directives/si-permiso.directive';
import { Cliente } from '../../../clientes/models/cliente.model';
import { ClienteService } from '../../../clientes/services/cliente-service';
import { EstadoVenta, Venta } from '../../models/venta.model';
import { VentaService } from '../../services/venta-service';
import { Paginador } from '../../../../shared/components/paginador/paginador';

@Component({ selector: 'app-venta-list', imports: [CurrencyPipe, DatePipe, FormsModule, RouterLink, SiPermisoDirective, Paginador], templateUrl: './venta-list.html', styleUrl: './venta-list.css' })
export class VentaList implements OnInit {
  private readonly api = inject(VentaService);
  private readonly clientesApi = inject(ClienteService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
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
    this.route.queryParamMap.subscribe(params => {
      this.clienteId.set(params.get('clienteId') ?? '');
      this.estado.set(params.get('estado') ?? '');
      this.desde.set(params.get('desde') ?? '');
      this.hasta.set(params.get('hasta') ?? '');
      this.direccion.set(params.get('direccion') === 'asc' ? 'asc' : 'desc');
      this.pagina.set(Math.max(0, Number(params.get('pagina') ?? 0) || 0));
      this.tamanio.set(Math.min(100, Math.max(1, Number(params.get('tamanio') ?? 10) || 10)));
      this.consultar();
    });
  }
  protected buscar(): void {
    this.error.set('');
    if (this.desde() && this.hasta() && this.desde() > this.hasta()) { this.error.set('La fecha “desde” no puede ser posterior a “hasta”.'); return; }
    this.navegar({ pagina: 0 });
  }
  private consultar(): void {
    this.cargando.set(true);
    this.api.buscar({ clienteId: this.clienteId() ? Number(this.clienteId()) : null, estado: (this.estado() || null) as EstadoVenta | null, desde: this.desde() || null, hasta: this.hasta() || null }, this.pagina(), this.tamanio(), this.direccion()).subscribe({
      next: respuesta => { this.respuesta.set(respuesta); this.cargando.set(false); }, error: (e: unknown) => { this.error.set(getHttpErrorDetails(e).message); this.cargando.set(false); },
    });
  }
  protected limpiar(): void { this.clienteId.set(''); this.estado.set(''); this.desde.set(''); this.hasta.set(''); this.buscar(); }
  protected cambiarPagina(pagina: number): void { this.navegar({ pagina }); }
  protected cambiarTamanio(tamanio: number): void { this.navegar({ tamanio, pagina: 0 }); }
  protected cambiarDireccion(direccion: 'asc' | 'desc'): void { this.direccion.set(direccion); this.navegar({ direccion, pagina: 0 }); }
  private navegar(cambios: Record<string, string | number | null>): void {
    this.router.navigate([], { queryParams: { clienteId: this.clienteId() || null, estado: this.estado() || null, desde: this.desde() || null, hasta: this.hasta() || null, direccion: this.direccion(), tamanio: this.tamanio(), ...cambios }, queryParamsHandling: 'merge' });
  }
  protected imprimirConsulta(): void { window.print(); }
  protected estadoVenta(value: string): EstadoVenta | null { return value ? value as EstadoVenta : null; }
}

