import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';
import { AvisoSesion } from '../../shared/components/aviso-sesion/aviso-sesion';

@Component({
  imports: [Header, Sidebar, RouterOutlet, AvisoSesion],
  selector: 'app-main-layout',
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {
  protected readonly menuCollapsed = signal(false);
  protected toggleMenu(): void { this.menuCollapsed.update(v => !v); }
}
