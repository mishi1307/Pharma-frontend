import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, input, linkedSignal, numberAttribute, OnInit, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { getHttpErrorDetails } from '../../../../core/utils/http-error';
import { SiPermisoDirective } from '../../../../shared/directives/si-permiso.directive';
import { Categoria } from '../../../categorias/models/categoria.model';
import { CategoriaService } from '../../../categorias/services/categoria-service';
import { Producto } from '../../models/producto.model';
import { ProductoService } from '../../services/producto-service';
import { PaginaResponse } from '../../../../core/models/pagina-response';
import { Paginador } from '../../../../shared/components/paginador/paginador';

@Component({
  imports: [RouterLink, CurrencyPipe, SiPermisoDirective, Paginador],
  selector: 'app-producto-list',
  templateUrl: './producto-list.html',
  styleUrl: './producto-list.css',
})
export class ProductoList implements OnInit {
  readonly pagina = input(0, { transform: (valor: unknown) => numberAttribute(valor, 0) });
  readonly tamanio = input(20, { transform: (valor: unknown) => numberAttribute(valor, 20) });
  readonly orden = input<'id' | 'nombre' | 'precio' | 'stock', unknown>('nombre', {
    transform: (valor) => valor === 'id' || valor === 'precio' || valor === 'stock' ? valor : 'nombre',
  });
  readonly dir = input<'asc' | 'desc', unknown>('asc', {
    transform: (valor) => valor === 'desc' ? 'desc' : 'asc',
  });
  readonly categoriaId = input<number | null, unknown>(null, { transform: (valor) => valor == null || valor === '' ? null : numberAttribute(valor) });
  private readonly productosApi = inject(ProductoService);
  private readonly categoriasApi = inject(CategoriaService);
  private readonly router = inject(Router);
  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly error = signal('');
  protected readonly productosRecurso = rxResource({
    params: () => ({ pagina: this.pagina(), tamanio: this.tamanio(), ordenarPor: this.orden(), direccion: this.dir(), categoriaId: this.categoriaId() }),
    stream: ({ params }) => this.productosApi.listarPagina(params),
  });
  protected readonly pag = linkedSignal<PaginaResponse<Producto> | undefined, PaginaResponse<Producto> | undefined>({
    source: () => this.productosRecurso.value(),
    computation: (nueva, previa) => nueva ?? previa?.value,
  });
  protected readonly notaFiltro = computed(() => {
    const id = this.categoriaId();
    if (id === null) return '';
    const nombre = this.categorias().find((categoria) => categoria.id === id)?.nombre ?? `#${id}`;
    return `Mostrando productos de la categoría ${nombre}.`;
  });

  ngOnInit(): void {
    this.categoriasApi.listar().subscribe({
      next: (categorias) => this.categorias.set(categorias),
      error: (error: unknown) => this.error.set(getHttpErrorDetails(error).message),
    });
  }

  protected cambiarCategoria(valor: string): void {
    this.router.navigate([], { queryParams: { categoriaId: valor || null, pagina: 0 }, queryParamsHandling: 'merge' });
  }

  protected irAPagina(pagina: number): void { this.navegar({ pagina }); }
  protected cambiarTamanio(tamanio: number): void { this.navegar({ tamanio, pagina: 0 }); }
  protected ordenarPor(campo: 'nombre' | 'precio' | 'stock'): void {
    const dir = this.orden() === campo && this.dir() === 'asc' ? 'desc' : 'asc';
    this.navegar({ orden: campo, dir, pagina: 0 });
  }
  protected mensajeError(): string {
    const error = this.productosRecurso.error();
    return error ? getHttpErrorDetails(error).message : this.error();
  }
  private navegar(cambios: Record<string, string | number>): void {
    this.router.navigate([], { queryParams: cambios, queryParamsHandling: 'merge' });
  }

  protected darDeBaja(producto: Producto): void {
    if (!window.confirm(`¿Dar de baja el producto "${producto.nombre}"?`)) return;
    this.productosApi.darDeBaja(producto.id).subscribe({
      next: () => this.productosRecurso.reload(),
      error: (error: unknown) => this.error.set(getHttpErrorDetails(error).message),
    });
  }
}

