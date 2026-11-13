import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { getHttpErrorDetails } from '../../../../core/utils/http-error';
import { VentaComprobante } from './venta-comprobante';
import { Cliente } from '../../../clientes/models/cliente.model';
import { ClienteService } from '../../../clientes/services/cliente-service';
import { Venta } from '../../models/venta.model';
import { VentaService } from '../../services/venta-service';

@Component({ selector: 'app-venta-detalle', imports: [RouterLink, VentaComprobante], templateUrl: './venta-detalle.html', styleUrl: './venta-detalle.css' })
export class VentaDetalle implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(VentaService);
  private readonly clientesApi = inject(ClienteService);
  protected readonly venta = signal<Venta | null>(null);
  protected readonly cliente = signal<Cliente | null>(null);
  protected readonly error = signal('');
  protected readonly mensaje = signal('');
  protected readonly cargando = signal(true);
  protected readonly imprimirAlCargar = signal(false);
  private readonly impresionAutomaticaPendiente = signal(false);
  protected readonly impresoEn = new Date();
  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.mensaje.set(history.state?.mensaje ?? '');
    this.impresionAutomaticaPendiente.set(this.route.snapshot.queryParamMap.get('imprimir') === '1');
    this.api.obtener(id).subscribe({ next: venta => { this.venta.set(venta); this.clientesApi.obtener(venta.clienteId).subscribe({ next: c => this.cliente.set(c) }); this.cargando.set(false); }, error: (e: unknown) => { this.error.set(getHttpErrorDetails(e).message); this.cargando.set(false); } });
  }
  protected imprimir(): void { this.impresionAutomaticaPendiente.set(true); this.imprimirAlCargar.set(true); }
  protected comprobanteListo(): void { if (this.impresionAutomaticaPendiente()) { this.impresionAutomaticaPendiente.set(false); setTimeout(() => window.print(), 100); } }
}
