import { Component, computed, effect, inject, signal } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-aviso-sesion',
  standalone: true,
  templateUrl: './aviso-sesion.html',
  styleUrl: './aviso-sesion.css',
})
export class AvisoSesion {
  private readonly auth = inject(AuthService);
  protected readonly visible = computed(() => this.auth.porVencer() && !this.oculto());
  protected readonly cuentaRegresiva = computed(() => {
    const segundos = this.auth.segundosRestantes();
    const minutos = Math.floor(segundos / 60);
    const resto = segundos % 60;
    return `${String(minutos).padStart(2, '0')}:${String(resto).padStart(2, '0')}`;
  });
  private readonly oculto = signal(false);

  constructor() {
    effect(() => {
      if (this.auth.sesion()) this.oculto.set(false);
    });
  }

  protected cerrarSesion(): void { this.auth.cerrarSesion(); }
  protected ocultar(): void { this.oculto.set(true); }
}
