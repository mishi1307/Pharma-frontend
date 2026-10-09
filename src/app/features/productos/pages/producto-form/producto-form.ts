import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { getHttpErrorDetails } from '../../../../core/utils/http-error';
import { Categoria } from '../../../categorias/models/categoria.model';
import { CategoriaService } from '../../../categorias/services/categoria-service';
import { ProductoRequest } from '../../models/producto.model';
import { ProductoService } from '../../services/producto-service';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-producto-form',
  templateUrl: './producto-form.html',
  styleUrl: './producto-form.css',
})
export class ProductoForm implements OnInit {
  readonly id = input<string>();
  private readonly fb = inject(FormBuilder);
  private readonly productosApi = inject(ProductoService);
  private readonly categoriasApi = inject(CategoriaService);
  private readonly router = inject(Router);
  protected readonly editando = computed(() => !!this.id());
  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly categoriaOriginal = signal<number | null>(null);
  protected readonly cargando = signal(true);
  protected readonly guardando = signal(false);
  protected readonly error = signal('');
  protected readonly validationErrors = signal<string[]>([]);
  protected readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    precio: [0.01, [Validators.required, Validators.min(0.01)]],
    stock: [0, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
    categoriaId: [null as number | null, [Validators.required, Validators.min(1)]],
  });
  protected readonly opcionesCategoria = computed(() => {
    const original = this.categoriaOriginal();
    return this.categorias().filter((categoria) => categoria.estado || categoria.id === original);
  });
  protected readonly hayCategoriasActivas = computed(() => this.opcionesCategoria().some((categoria) => categoria.estado));

  ngOnInit(): void {
    const id = this.id();
    if (!id) {
      this.categoriasApi.listar().subscribe({
        next: (categorias) => { this.categorias.set(categorias); this.cargando.set(false); },
        error: (error: unknown) => this.fallarCarga(error),
      });
      return;
    }
    forkJoin({ categorias: this.categoriasApi.listar(), producto: this.productosApi.obtener(Number(id)) }).subscribe({
      next: ({ categorias, producto }) => {
        this.categorias.set(categorias);
        this.categoriaOriginal.set(producto.categoria?.id ?? null);
        this.form.patchValue({ nombre: producto.nombre, precio: producto.precio, stock: producto.stock, categoriaId: producto.categoria?.id ?? null });
        this.cargando.set(false);
      },
      error: (error: unknown) => this.fallarCarga(error),
    });
  }

  protected guardar(): void {
    this.error.set('');
    this.validationErrors.set([]);
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const value = this.form.getRawValue();
    const categoria = this.categorias().find((item) => item.id === value.categoriaId);
    if (!categoria || (!categoria.estado && categoria.id !== this.categoriaOriginal())) {
      this.error.set('Selecciona una categoría activa para el producto.');
      return;
    }
    const dto: ProductoRequest = { nombre: (value.nombre ?? '').trim(), precio: Number(value.precio), stock: Number(value.stock), categoriaId: Number(value.categoriaId) };
    const id = this.id();
    this.guardando.set(true);
    (id ? this.productosApi.actualizar(Number(id), dto) : this.productosApi.crear(dto)).subscribe({
      next: () => this.router.navigate(['/productos']),
      error: (error: unknown) => {
        const details = getHttpErrorDetails(error);
        this.error.set(details.message);
        this.validationErrors.set(details.validationErrors);
        this.guardando.set(false);
      },
    });
  }

  private fallarCarga(error: unknown): void {
    const details = getHttpErrorDetails(error);
    this.error.set(details.message);
    this.validationErrors.set(details.validationErrors);
    this.cargando.set(false);
  }
}
