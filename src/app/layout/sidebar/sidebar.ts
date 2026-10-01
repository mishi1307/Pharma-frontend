import {Component} from '@angular/core';import {RouterLink,RouterLinkActive} from '@angular/router';import {MENU} from '../../core/config/menu';
@Component({imports:[RouterLink,RouterLinkActive],selector:'app-sidebar',templateUrl:'./sidebar.html',styleUrl:'./sidebar.css'})
export class Sidebar{protected readonly menu=MENU}
