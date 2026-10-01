import {Component,signal} from '@angular/core';import {RouterOutlet} from '@angular/router';import {Header} from '../header/header';import {Sidebar} from '../sidebar/sidebar';
@Component({imports:[Header,Sidebar,RouterOutlet],selector:'app-main-layout',templateUrl:'./main-layout.html',styleUrl:'./main-layout.css'})
export class MainLayout{protected readonly menuCollapsed=signal(false);protected toggleMenu():void{this.menuCollapsed.update(v=>!v)}}
