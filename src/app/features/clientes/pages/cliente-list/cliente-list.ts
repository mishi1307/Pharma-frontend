import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PaginaResponse } from '../../../../core/models/pagina-response';
import { getHttpErrorDetails } from '../../../../core/utils/http-error';
import { Cliente } from '../../models/cliente.model';
import { CampoOrdenCliente, ClienteService } from '../../services/cliente-service';

@Component({
  imports: [RouterLink],
  selector: 'app-cliente-list',
  templateUrl: './cliente-list.html',
  styleUrl: './cliente-list.css',
})
export class ClienteList implements OnInit {
  private readonly service = inject(ClienteService);

  protected readonly pagina = signal(0);
  protected readonly tamanio = signal(10);
  protected readonly campoOrden = signal<CampoOrdenCliente>('apellidos');
  protected readonly direccion = signal<'asc' | 'desc'>('asc');
  protected readonly respuesta = signal<PaginaResponse<Cliente> | null>(null);
  protected readonly filtro = signal('');
  protected readonly cargando = signal(true);
  protected readonly error = signal('');

  protected readonly clientes = computed(() => this.respuesta()?.contenido ?? []);
  protected readonly filtrados = computed(() => {
    const consulta = this.filtro().trim().toLocaleLowerCase();
    return this.clientes().filter((cliente) => {
      const nombreCompleto = (cliente.nombres + ' ' + cliente.apellidos).toLocaleLowerCase();
      return cliente.dni.toLocaleLowerCase().includes(consulta) || nombreCompleto.includes(consulta);
    });
  });
  protected readonly totalPaginas = computed(() => Math.max(this.respuesta()?.totalPaginas ?? 0, 1));
  protected readonly anteriorDeshabilitado = computed(() => this.cargando() || this.pagina() === 0);
  protected readonly siguienteDeshabilitado = computed(() => {
    const pagina = this.respuesta();
    return this.cargando() || !pagina || pagina.ultima;
  });

  ngOnInit(): void {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.service
      .listar(this.pagina(), this.tamanio(), this.campoOrden(), this.direccion())
      .subscribe({
        next: (pagina) => {
          this.respuesta.set(pagina);
          this.cargando.set(false);
        },
        error: (error: unknown) => {
          this.error.set(getHttpErrorDetails(error).message);
          this.cargando.set(false);
        },
      });
  }

  protected cambiarTamanio(valor: string): void {
    const nuevoTamanio = Number(valor);
    if (![5, 10, 20].includes(nuevoTamanio)) return;
    this.tamanio.set(nuevoTamanio);
    this.pagina.set(0);
    this.cargar();
  }

  protected cambiarPagina(cambio: -1 | 1): void {
    const nuevaPagina = this.pagina() + cambio;
    const pagina = this.respuesta();
    if (nuevaPagina < 0 || (pagina && nuevaPagina >= pagina.totalPaginas)) return;
    this.pagina.set(nuevaPagina);
    this.cargar();
  }

  protected ordenarPor(campo: CampoOrdenCliente): void {
    if (this.campoOrden() === campo) {
      this.direccion.update((actual) => (actual === 'asc' ? 'desc' : 'asc'));
    } else {
      this.campoOrden.set(campo);
      this.direccion.set('asc');
    }
    this.cargar();
  }

  protected actualizarFiltro(valor: string): void {
    this.filtro.set(valor);
  }

  protected eliminar(cliente: Cliente): void {
    const nombre = cliente.nombres + ' ' + cliente.apellidos;
    if (!window.confirm('¿Dar de baja a ' + nombre + '? El cliente quedará inactivo.')) return;

    this.error.set('');
    this.service.eliminar(cliente.id).subscribe({
      next: () => this.cargar(),
      error: (error: unknown) => this.error.set(getHttpErrorDetails(error).message),
    });
  }
}