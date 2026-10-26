import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { PerfilUsuario, Permiso } from '../../../../core/auth/auth.models';

interface PermisoVista { codigo: Permiso; nombre: string; }
interface GrupoPermisos { nombre: string; permisos: PermisoVista[]; }

@Component({
  standalone: true,
  templateUrl: './mi-cuenta.html',
  styleUrl: './mi-cuenta.css',
})
export class MiCuenta {
  private readonly auth = inject(AuthService);
  protected readonly cargando = signal(true);
  protected readonly error = signal('');
  protected readonly perfil = signal<PerfilUsuario | null>(null);
  protected readonly permisosDistintos = computed(() => {
    const perfil = this.perfil();
    const permisosSesion = this.auth.sesion()?.permisos;
    if (!perfil || !permisosSesion) return false;
    return JSON.stringify([...perfil.permisos].sort()) !== JSON.stringify([...permisosSesion].sort());
  });
  protected readonly grupos: GrupoPermisos[] = [
    { nombre: 'Catálogo', permisos: [
      { codigo: 'CATALOGO_LEER', nombre: 'Leer catálogo' },
      { codigo: 'CATALOGO_ESCRIBIR', nombre: 'Administrar catálogo' },
    ] },
    { nombre: 'Clientes', permisos: [
      { codigo: 'CLIENTES_LEER', nombre: 'Consultar clientes' },
      { codigo: 'CLIENTES_ESCRIBIR', nombre: 'Administrar clientes' },
    ] },
    { nombre: 'Ventas', permisos: [
      { codigo: 'VENTAS_LEER', nombre: 'Consultar ventas' },
      { codigo: 'VENTAS_REGISTRAR', nombre: 'Registrar ventas' },
    ] },
    { nombre: 'Reportes', permisos: [
      { codigo: 'REPORTES_VER', nombre: 'Ver reportes' },
    ] },
    { nombre: 'Usuarios', permisos: [
      { codigo: 'USUARIOS_ADMINISTRAR', nombre: 'Administrar usuarios' },
    ] },
  ];

  constructor() { this.cargar(); }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.auth.obtenerPerfil().pipe(
      finalize(() => this.cargando.set(false)),
    ).subscribe({
      next: perfil => this.perfil.set(perfil),
      error: (error: HttpErrorResponse) => {
        const mensaje = error.error && typeof error.error === 'object' && 'message' in error.error
          ? String(error.error.message)
          : '';
        this.error.set(mensaje || 'No se pudo cargar tu perfil. Inténtalo nuevamente.');
      },
    });
  }

  protected tienePermiso(perfil: PerfilUsuario, permiso: Permiso): boolean {
    return perfil.permisos.includes(permiso);
  }
}

