import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/auth/auth.service';
@Component({ selector:'app-login', standalone:true, imports:[ReactiveFormsModule,RouterLink], templateUrl:'./login.html', styleUrl:'./login.css' })
export class Login {
  private readonly fb=inject(FormBuilder); private readonly auth=inject(AuthService); private readonly router=inject(Router); private readonly route=inject(ActivatedRoute);
  readonly enviando=signal(false); readonly error=signal(this.route.snapshot.queryParamMap.get('expirada')==='1'?'Su sesión expiró. Inicie sesión nuevamente.':'');
  readonly form=this.fb.nonNullable.group({ username:['',[Validators.required]], password:['',[Validators.required]] });
  ingresar():void { if(this.form.invalid){this.form.markAllAsTouched();return;} this.enviando.set(true);this.error.set('');this.auth.iniciarSesion(this.form.getRawValue()).subscribe({next:()=>{const dest=this.route.snapshot.queryParamMap.get('returnUrl')||'/inicio';void this.router.navigateByUrl(dest);},error:(e:HttpErrorResponse)=>{this.error.set(e.status===0?'No se pudo conectar con el servidor. Verifica que el backend esté iniciado.':e.error?.message||'Usuario o contraseña incorrectos.');this.enviando.set(false);}}); }
}

