import {Component,output} from '@angular/core';import {RouterLink} from '@angular/router';
@Component({imports:[RouterLink],selector:'app-header',templateUrl:'./header.html',styleUrl:'./header.css'})
export class Header{readonly toggleMenu=output<void>()}
