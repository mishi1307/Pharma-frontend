import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, Permiso, Sesion } from './auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private expiryTimer?: ReturnType<typeof setTimeout>;
  private readonly state = signal<Sesion | null>(this.restore());
  readonly sesion = this.state.asReadonly();
  readonly autenticado = computed(() => !!this.state() && this.state()!.expiraEn > Date.now());

  constructor() { this.scheduleExpiry(); }

  iniciarSesion(datos: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, datos).pipe(tap(respuesta => {
      const sesion: Sesion = { ...respuesta, expiraEn: Date.now() + respuesta.expiraEnSegundos * 1000 };
      sessionStorage.setItem('pharmasoft.sesion', JSON.stringify(sesion));
      this.state.set(sesion);
      this.scheduleExpiry();
    }));
  }

  cerrarSesion(motivo?: 'expirada', volverA?: string): void {
    if (this.expiryTimer) clearTimeout(this.expiryTimer);
    sessionStorage.removeItem('pharmasoft.sesion');
    this.state.set(null);

    const queryParams: Record<string, string> = {};
    if (motivo === 'expirada') queryParams['expirada'] = '1';
    if (volverA && volverA !== '/login') queryParams['returnUrl'] = volverA;
    void this.router.navigate(['/login'], { queryParams });
  }

  tienePermiso(permiso: Permiso): boolean { return this.autenticado() && !!this.state()?.permisos.includes(permiso); }
  tieneAlguno(permisos: Permiso[]): boolean { return permisos.some(p => this.tienePermiso(p)); }

  private restore(): Sesion | null {
    try {
      const raw = sessionStorage.getItem('pharmasoft.sesion');
      if (!raw) return null;
      const sesion = JSON.parse(raw) as Sesion;
      if (!sesion.token || !sesion.expiraEn || sesion.expiraEn <= Date.now()) { sessionStorage.removeItem('pharmasoft.sesion'); return null; }
      return sesion;
    } catch { sessionStorage.removeItem('pharmasoft.sesion'); return null; }
  }
  private scheduleExpiry(): void {
    if (this.expiryTimer) clearTimeout(this.expiryTimer);
    const sesion = this.state();
    if (sesion) this.expiryTimer = setTimeout(() => this.cerrarSesion('expirada', this.router.url), Math.max(0, sesion.expiraEn - Date.now()));
  }
}
