import { Routes } from '@angular/router';
import { permisoGuard } from './core/auth/permiso.guard';
import { authGuard, invitadoGuard } from './core/auth/auth.guards';
import { Permiso } from './core/auth/auth.models';
const read = (permiso:Permiso) => ({canActivate:[permisoGuard],data:{permiso}});
export const routes:Routes=[
 {path:'login',canActivate:[invitadoGuard],loadComponent:()=>import('./features/auth/login').then(m=>m.Login),title:'Iniciar sesión'},
 {path:'acceso-denegado',loadComponent:()=>import('./shared/pages/acceso-denegado/acceso-denegado').then(m=>m.AccesoDenegado),title:'Acceso denegado'},
 {path:'',canActivate:[authGuard],loadComponent:()=>import('./layout/main-layout/main-layout').then(m=>m.MainLayout),children:[
  {path:'',pathMatch:'full',redirectTo:'inicio'},
  {path:'inicio',loadComponent:()=>import('./features/inicio/inicio').then(m=>m.Inicio)},
  {path:'categorias',...read('CATALOGO_LEER'),loadChildren:()=>import('./features/categorias/categorias.routes').then(m=>m.CATEGORIAS_ROUTES)},
  {path:'productos',...read('CATALOGO_LEER'),loadChildren:()=>import('./features/productos/productos.routes').then(m=>m.PRODUCTOS_ROUTES)},
  {path:'clientes',...read('CLIENTES_LEER'),loadChildren:()=>import('./features/clientes/clientes.routes').then(m=>m.CLIENTES_ROUTES)},
  {path:'ventas',...read('VENTAS_LEER'),loadChildren:()=>import('./features/ventas/ventas.routes').then(m=>m.VENTAS_ROUTES)},
  {path:'reportes/ventas-categoria',...read('REPORTES_VER'),loadComponent:()=>import('./features/ventas/pages/ventas-categoria/ventas-categoria').then(m=>m.VentasCategoria),title:'Reporte de ventas por categoría'}
 ]},
 {path:'**',loadComponent:()=>import('./shared/pages/no-encontrado/no-encontrado').then(m=>m.NoEncontrado)}
];

