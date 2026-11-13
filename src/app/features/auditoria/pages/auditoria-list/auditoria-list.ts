import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { getHttpErrorDetails } from '../../../../core/utils/http-error';
import { Paginador } from '../../../../shared/components/paginador/paginador';
import { AuditoriaEvento } from '../../models/auditoria.model';
import { AuditoriaService } from '../../services/auditoria-service';

@Component({
  selector: 'app-auditoria-list',
  imports: [DatePipe, FormsModule, Paginador],
  templateUrl: './auditoria-list.html',
  styleUrl: './auditoria-list.css',
})
export class AuditoriaList implements OnInit {
  private readonly api = inject(AuditoriaService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly eventos = signal<AuditoriaEvento[]>([]);
  protected readonly totalElementos = signal(0);
  protected readonly totalPaginas = signal(0);
  protected readonly cargando = signal(false);
  protected readonly error = signal('');
  protected readonly usuario = signal('');
  protected readonly accion = signal('');
  protected readonly desde = signal('');
  protected readonly hasta = signal('');
  protected readonly pagina = signal(0);
  protected readonly tamanio = signal(20);

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.usuario.set(params.get('usuario') ?? '');
      this.accion.set(params.get('accion') ?? '');
      this.desde.set(params.get('desde') ?? '');
      this.hasta.set(params.get('hasta') ?? '');
      this.pagina.set(Math.max(0, Number(params.get('pagina') ?? 0) || 0));
      this.tamanio.set(Math.min(100, Math.max(1, Number(params.get('tamanio') ?? 20) || 20)));
      this.consultar();
    });
  }

  protected buscar(): void {
    this.error.set('');
    if (this.desde() && this.hasta() && this.desde() > this.hasta()) {
      this.error.set('La fecha “desde” no puede ser posterior a “hasta”.');
      return;
    }
    this.navegar({ pagina: 0 });
  }

  protected limpiar(): void {
    this.usuario.set('');
    this.accion.set('');
    this.desde.set('');
    this.hasta.set('');
    this.navegar({ usuario: null, accion: null, desde: null, hasta: null, pagina: 0 });
  }

  protected cambiarPagina(pagina: number): void { this.navegar({ pagina }); }
  protected cambiarTamanio(tamanio: number): void { this.navegar({ tamanio, pagina: 0 }); }

  private consultar(): void {
    this.cargando.set(true);
    this.api.buscar({ usuario: this.usuario(), accion: this.accion(), desde: this.desde(), hasta: this.hasta() }, this.pagina(), this.tamanio()).subscribe({
      next: respuesta => {
        this.eventos.set(respuesta.contenido);
        this.totalElementos.set(respuesta.totalElementos);
        this.totalPaginas.set(respuesta.totalPaginas);
        this.cargando.set(false);
      },
      error: (e: unknown) => {
        this.error.set(getHttpErrorDetails(e).message);
        this.cargando.set(false);
      },
    });
  }

  private navegar(cambios: Record<string, string | number | null>): void {
    void this.router.navigate([], {
      queryParams: {
        usuario: this.usuario() || null,
        accion: this.accion() || null,
        desde: this.desde() || null,
        hasta: this.hasta() || null,
        pagina: this.pagina(),
        tamanio: this.tamanio(),
        ...cambios,
      },
      queryParamsHandling: 'merge',
    });
  }
}
