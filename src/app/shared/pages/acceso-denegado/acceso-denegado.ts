import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({selector:'app-acceso-denegado',standalone:true,imports:[RouterLink],template:`<main style="max-width:640px;margin:12vh auto;padding:32px;text-align:center;font-family:Arial,sans-serif"><h1>Acceso denegado</h1><p>Tu cuenta no tiene permisos para acceder a esta sección.</p><a routerLink="/inicio">Volver al inicio</a></main>`})
export class AccesoDenegado {}
