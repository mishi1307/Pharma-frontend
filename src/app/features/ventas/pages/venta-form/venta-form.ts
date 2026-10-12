import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { FormArray, FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { getHttpErrorDetails } from '../../../../core/utils/http-error';
import { redondear } from '../../../../core/utils/numeros';
import { coincide } from '../../../../core/utils/texto';
import { Cliente } from '../../../clientes/models/cliente.model';
import { ClienteService } from '../../../clientes/services/cliente-service';
import { Producto } from '../../../productos/models/producto.model';
import { ProductoService } from '../../../productos/services/producto-service';
import { VentaRequest } from '../../models/venta.model';
import { VentaService } from '../../services/venta-service';

type LineaForm = FormGroup<{ productoId: FormControl<number>; cantidad: FormControl<number> }>;

@Component({
  selector: 'app-venta-form', imports: [ReactiveFormsModule, RouterLink, CurrencyPipe],
  templateUrl: './venta-form.html', styleUrl: './venta-form.css',
})
export class VentaForm implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly ventasApi = inject(VentaService);
  private readonly clientesApi = inject(ClienteService);
  private readonly productosApi = inject(ProductoService);
  private readonly router = inject(Router);
  protected readonly clientes = signal<Cliente[]>([]);
  protected readonly productos = signal<Producto[]>([]);
  protected readonly cargando = signal(true);
  protected readonly confirmando = signal(false);
  protected readonly guardando = signal(false);
  protected readonly imprimir = signal(true);
  protected readonly error = signal('');
  protected readonly buscarCliente = new FormControl('', { nonNullable: true });
  protected readonly buscarProducto = new FormControl('', { nonNullable: true });
  private readonly textoCliente = toSignal(this.buscarCliente.valueChanges, { initialValue: '' });
  private readonly textoProducto = toSignal(this.buscarProducto.valueChanges, { initialValue: '' });
  protected readonly form = this.fb.group({
    clienteId: this.fb.control<number | null>(null, Validators.required),
    detalles: new FormArray<LineaForm>([], Validators.required),
  });
  protected readonly clientesEncontrados = computed(() => {
    const query = this.textoCliente().trim();
    return query ? this.clientes().filter(c => c.estado && coincide(query, c.nombres, c.apellidos, c.dni)).slice(0, 6) : [];
  });
  protected readonly productosEncontrados = computed(() => {
    const query = this.textoProducto().trim();
    return query ? this.productos().filter(p => p.estado && p.stock > 0 && coincide(query, p.nombre, p.categoria?.nombre ?? '')).slice(0, 6) : [];
  });
  private readonly valor = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });
  protected readonly lineas = computed(() => (this.valor().detalles ?? []).map(linea => {
    const producto = this.productos().find(p => p.id === linea.productoId);
    const cantidad = Number(linea.cantidad) || 0;
    const precio = Number(producto?.precio ?? 0);
    return { producto, cantidad, precio, subtotal: redondear(precio * cantidad), excedeStock: !!producto && cantidad > producto.stock };
  }));
  protected readonly total = computed(() => redondear(this.lineas().reduce((s, l) => s + l.subtotal, 0)));
  protected readonly clienteElegido = computed(() => {
    this.valor();
    return this.clientes().find(c => c.id === this.form.controls.clienteId.value);
  });
  protected get detalles(): FormArray<LineaForm> { return this.form.controls.detalles; }

  ngOnInit(): void {
    forkJoin({ clientes: this.clientesApi.listar(0, 100), productos: this.productosApi.listar() }).subscribe({
      next: ({ clientes, productos }) => {
        this.clientes.set(clientes.contenido.filter(c => c.estado));
        this.productos.set(productos);
        this.cargando.set(false);
      },
      error: (error: unknown) => { this.error.set(getHttpErrorDetails(error).message); this.cargando.set(false); },
    });
  }

  protected elegirCliente(cliente: Cliente): void { this.form.controls.clienteId.setValue(cliente.id); this.buscarCliente.setValue(''); }
  protected cambiarCliente(): void { this.form.controls.clienteId.setValue(null); }
  protected agregarProducto(producto: Producto): void {
    const actual = this.detalles.controls.find(linea => linea.controls.productoId.value === producto.id);
    if (actual) actual.controls.cantidad.setValue(actual.controls.cantidad.value + 1);
    else this.detalles.push(this.fb.group({ productoId: this.fb.control(producto.id), cantidad: this.fb.control(1, [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]) }));
    this.buscarProducto.setValue('');
  }
  protected agregarPrimero(event: Event): void { event.preventDefault(); const p = this.productosEncontrados()[0]; if (p) this.agregarProducto(p); }
  protected quitarLinea(i: number): void { this.detalles.removeAt(i); }
  protected cantidadEnDetalle(id: number): number { return this.valor().detalles?.find(d => d.productoId === id)?.cantidad ?? 0; }
  protected revisar(): void {
    this.error.set('');
    if (this.form.invalid || this.lineas().some(l => l.excedeStock)) { this.form.markAllAsTouched(); return; }
    this.confirmando.set(true);
  }
  protected volver(): void { this.confirmando.set(false); }
  protected confirmar(): void {
    const request: VentaRequest = { clienteId: this.form.controls.clienteId.value!, detalles: this.detalles.controls.map(linea => ({ productoId: linea.controls.productoId.value, cantidad: Number(linea.controls.cantidad.value) })) };
    this.guardando.set(true);
    this.ventasApi.registrar(request).subscribe({
      next: venta => this.router.navigate(['/ventas', venta.id], { queryParams: this.imprimir() ? { imprimir: 1 } : undefined, state: { mensaje: 'Venta registrada correctamente.' } }),
      error: (error: unknown) => { this.guardando.set(false); this.confirmando.set(false); this.error.set(getHttpErrorDetails(error).message); },
    });
  }
}
