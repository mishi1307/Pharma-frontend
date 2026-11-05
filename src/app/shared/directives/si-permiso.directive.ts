import { Directive, TemplateRef, ViewContainerRef, effect, inject, input } from '@angular/core';
import { Permiso } from '../../core/auth/auth.models';
import { AuthService } from '../../core/auth/auth.service';
@Directive({ selector: '[appSiPermiso]', standalone: true })
export class SiPermisoDirective {
  private readonly auth=inject(AuthService); private readonly template=inject(TemplateRef<unknown>); private readonly view=inject(ViewContainerRef); readonly appSiPermiso=input.required<Permiso|Permiso[]>(); private shown=false;
  constructor(){effect(()=>{const permiso=this.appSiPermiso();const allowed=Array.isArray(permiso)?this.auth.tieneAlguno(permiso):this.auth.tienePermiso(permiso);if(allowed&&!this.shown){this.view.createEmbeddedView(this.template);this.shown=true}else if(!allowed&&this.shown){this.view.clear();this.shown=false}})}
}
