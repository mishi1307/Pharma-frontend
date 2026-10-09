import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { getHttpErrorDetails } from '../../../../core/utils/http-error';
import { Categoria } from '../../../categorias/models/categoria.model';
import { CategoriaService } from '../../../categorias/services/categoria-service';
import { Producto } from '../../models/producto.model';
import { ProductoService } from '../../services/producto-service';

@Component({
  imports: [RouterLink, CurrencyPipe],
  selector: 'app-producto-list',
  templateUrl: './producto-list.html',
  styleUrl: './producto-list.css',
})
export class ProductoList implements OnInit {
  readonly categoriaId = input<string>();
  private readonly productosApi = inject(ProductoService);
  private readonly categoriasApi = inject(CategoriaService);
  protected readonly productos = signal<Producto[]>([]);
  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly categoriaFiltro = signal<number | null>(null);
  protected readonly cargando = signal(true);
  protected readonly error = signal('');
  protected readonly notaFiltro = computed(() => {
    const id = this.categoriaFiltro();
    if (id === null) return '';
    const nombre = this.categorias().find((categoria) => categoria.id === id)?.nombre ?? `#${id}`;
    return `Mostrando productos de la categoría ${nombre} en los primeros 100 registros.`;
  });
  protected readonly filtrados = computed(() => {
    const filtro = this.categoriaFiltro();
    return this.productos().filter((producto) => filtro === null || producto.categoria?.id === filtro);
  });

  ngOnInit(): void {
    const id = Number(this.categoriaId());
    if (this.categoriaId() && Number.isInteger(id) && id > 0) this.categoriaFiltro.set(id);
    this.categoriasApi.listar().subscribe({
      next: (categorias) => this.categorias.set(categorias),
      error: (error: unknown) => this.error.set(getHttpErrorDetails(error).message),
    });
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.productosApi.listar().subscribe({
      next: (productos) => {
        this.productos.set(productos);
        this.cargando.set(false);
      },
      error: (error: unknown) => {
        this.error.set(getHttpErrorDetails(error).message);
        this.cargando.set(false);
      },
    });
  }

  protected cambiarCategoria(valor: string): void {
    this.categoriaFiltro.set(valor ? Number(valor) : null);
  }

  protected darDeBaja(producto: Producto): void {
    if (!window.confirm(`¿Dar de baja el producto "${producto.nombre}"?`)) return;
    this.productosApi.darDeBaja(producto.id).subscribe({
      next: () => this.cargar(),
      error: (error: unknown) => this.error.set(getHttpErrorDetails(error).message),
    });
  }
}
