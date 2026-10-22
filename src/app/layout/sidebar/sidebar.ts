import {Component,computed,inject} from '@angular/core';import {RouterLink,RouterLinkActive} from '@angular/router';import {MENU} from '../../core/config/menu';import {AuthService} from '../../core/auth/auth.service';
@Component({imports:[RouterLink,RouterLinkActive],selector:'app-sidebar',templateUrl:'./sidebar.html',styleUrl:'./sidebar.css'})
export class Sidebar{private readonly auth=inject(AuthService);protected readonly menu=computed(()=>MENU.filter(item=>!item.permiso||this.auth.tienePermiso(item.permiso)))}
