import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { getHttpErrorDetails } from '../../../../core/utils/http-error';
import { Cliente } from '../../../clientes/models/cliente.model';
import { ClienteService } from '../../../clientes/services/cliente-service';
import { Venta } from '../../models/venta.model';
import { VentaService } from '../../services/venta-service';

@Component({ selector: 'app-venta-detalle', imports: [CurrencyPipe, DatePipe, RouterLink], templateUrl: './venta-detalle.html', styleUrl: './venta-detalle.css' })
export class VentaDetalle implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(VentaService);
  private readonly clientesApi = inject(ClienteService);
  protected readonly venta = signal<Venta | null>(null);
  protected readonly cliente = signal<Cliente | null>(null);
  protected readonly error = signal('');
  protected readonly mensaje = signal('');
  protected readonly cargando = signal(true);
  protected readonly impresoEn = new Date();
  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.mensaje.set(history.state?.mensaje ?? '');
    this.api.obtener(id).subscribe({ next: venta => { this.venta.set(venta); this.clientesApi.obtener(venta.clienteId).subscribe({ next: c => this.cliente.set(c) }); this.cargando.set(false); if (this.route.snapshot.queryParamMap.get('imprimir') === '1') setTimeout(() => window.print(), 250); }, error: (e: unknown) => { this.error.set(getHttpErrorDetails(e).message); this.cargando.set(false); } });
  }
  protected imprimir(): void { window.print(); }
}
