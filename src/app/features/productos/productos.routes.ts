import { Routes } from '@angular/router';
import { permisoGuard } from '../../core/auth/permiso.guard';
export const PRODUCTOS_ROUTES: Routes = [
 {path:'',loadComponent:()=>import('./pages/producto-list/producto-list').then(m=>m.ProductoList),title:'Productos'},
 {path:'nuevo',canActivate:[permisoGuard],data:{permiso:'CATALOGO_ESCRIBIR'},loadComponent:()=>import('./pages/producto-form/producto-form').then(m=>m.ProductoForm),title:'Nuevo producto'},
 {path:':id/editar',canActivate:[permisoGuard],data:{permiso:'CATALOGO_ESCRIBIR'},loadComponent:()=>import('./pages/producto-form/producto-form').then(m=>m.ProductoForm),title:'Editar producto'}
];
