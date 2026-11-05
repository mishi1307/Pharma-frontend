import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, PerfilUsuario, Permiso, Sesion } from './auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private expiryTimer?: ReturnType<typeof setTimeout>;
  private countdownTimer?: ReturnType<typeof setInterval>;
  private readonly state = signal<Sesion | null>(this.restore());
  readonly sesion = this.state.asReadonly();
  readonly segundosRestantes = signal(0);
  readonly autenticado = computed(() => !!this.state() && this.state()!.expiraEn > Date.now());
  readonly porVencer = computed(() => !!this.state() && this.segundosRestantes() <= 120);

  constructor() { this.scheduleExpiry(); }

  iniciarSesion(datos: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, datos).pipe(tap(respuesta => {
      const sesion: Sesion = { ...respuesta, expiraEn: Date.now() + respuesta.expiraEnSegundos * 1000 };
      sessionStorage.setItem('pharmasoft.sesion', JSON.stringify(sesion));
      this.state.set(sesion);
      this.scheduleExpiry();
    }));
  }

  obtenerPerfil(): Observable<PerfilUsuario> {
    return this.http.get<PerfilUsuario>(`${environment.apiUrl}/auth/me`);
  }

  cerrarSesion(motivo?: 'expirada', volverA?: string): void {
    if (this.expiryTimer) clearTimeout(this.expiryTimer);
    if (this.countdownTimer) clearInterval(this.countdownTimer);
    this.expiryTimer = undefined;
    this.countdownTimer = undefined;
    this.segundosRestantes.set(0);
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
    if (this.countdownTimer) clearInterval(this.countdownTimer);
    this.expiryTimer = undefined;
    this.countdownTimer = undefined;
    const sesion = this.state();
    if (!sesion) {
      this.segundosRestantes.set(0);
      return;
    }
    this.updateCountdown();
    this.countdownTimer = setInterval(() => this.updateCountdown(), 1000);
    this.expiryTimer = setTimeout(
      () => this.cerrarSesion('expirada', this.router.url),
      Math.max(0, sesion.expiraEn - Date.now()),
    );
  }

  private updateCountdown(): void {
    const sesion = this.state();
    if (!sesion) {
      this.segundosRestantes.set(0);
      return;
    }
    const restantes = Math.max(0, Math.floor((sesion.expiraEn - Date.now()) / 1000));
    this.segundosRestantes.set(restantes);
    if (restantes === 0) this.cerrarSesion('expirada', this.router.url);
  }
}

