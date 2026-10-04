import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { getHttpErrorDetails } from '../../../../core/utils/http-error';
import { ClienteRequest } from '../../models/cliente.model';
import { ClienteService } from '../../services/cliente-service';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-cliente-form',
  templateUrl: './cliente-form.html',
  styleUrl: './cliente-form.css',
})
export class ClienteForm implements OnInit {
  readonly id = input<string>();
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ClienteService);
  private readonly router = inject(Router);

  protected readonly editando = computed(() => !!this.id());
  protected readonly guardando = signal(false);
  protected readonly cargando = signal(false);
  protected readonly error = signal('');
  protected readonly validationErrors = signal<string[]>([]);
  protected readonly form = this.fb.group({
    dni: ['', [Validators.required, Validators.pattern(/^\\d{8}$/)]],
    nombres: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    apellidos: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    telefono: ['', [Validators.pattern(/^\\d{9}$/)]],
    direccion: ['', [Validators.maxLength(250)]],
    estado: [true, [Validators.required]],
  });

  ngOnInit(): void {
    const id = this.id();
    if (!id) return;

    this.cargando.set(true);
    this.service.obtener(Number(id)).subscribe({
      next: (cliente) => {
        this.form.patchValue({
          dni: cliente.dni,
          nombres: cliente.nombres,
          apellidos: cliente.apellidos,
          email: cliente.email,
          telefono: cliente.telefono ?? '',
          direccion: cliente.direccion ?? '',
          estado: cliente.estado,
        });
        this.cargando.set(false);
      },
      error: (error: unknown) => {
        const detalles = getHttpErrorDetails(error);
        this.error.set(detalles.message);
        this.validationErrors.set(detalles.validationErrors);
        this.cargando.set(false);
      },
    });
  }

  protected guardar(): void {
    this.error.set('');
    this.validationErrors.set([]);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valor = this.form.getRawValue();
    const dto: ClienteRequest = {
      dni: (valor.dni ?? '').trim(),
      nombres: (valor.nombres ?? '').trim(),
      apellidos: (valor.apellidos ?? '').trim(),
      email: (valor.email ?? '').trim(),
      telefono: (valor.telefono ?? '').trim() || null,
      direccion: (valor.direccion ?? '').trim() || null,
      estado: valor.estado ?? false,
    };

    this.guardando.set(true);
    const id = this.id();
    const solicitud = id
      ? this.service.actualizar(Number(id), dto)
      : this.service.crear(dto);

    solicitud.subscribe({
      next: () => this.router.navigate(['/clientes']),
      error: (error: unknown) => {
        const detalles = getHttpErrorDetails(error);
        this.error.set(detalles.message);
        this.validationErrors.set(detalles.validationErrors);
        this.guardando.set(false);
      },
    });
  }
}