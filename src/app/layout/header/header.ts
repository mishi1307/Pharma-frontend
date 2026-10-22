import {Component,computed,inject,output} from '@angular/core';import {RouterLink} from '@angular/router';import {AuthService} from '../../core/auth/auth.service';
@Component({imports:[RouterLink],selector:'app-header',templateUrl:'./header.html',styleUrl:'./header.css'})
export class Header{readonly toggleMenu=output<void>();private readonly auth=inject(AuthService);protected readonly sesion=this.auth.sesion;protected readonly roles=computed(()=>this.sesion()?.roles.join(', ')||'');protected salir():void{this.auth.cerrarSesion()}}


