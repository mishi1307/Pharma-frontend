import {provideHttpClient,withInterceptors} from '@angular/common/http';
import {ApplicationConfig,provideBrowserGlobalErrorListeners} from '@angular/core';
import {provideRouter,withComponentInputBinding} from '@angular/router';
import {routes} from './app.routes';
import {authInterceptor} from './core/auth/auth.interceptor';
import {errorInterceptor} from './core/auth/error.interceptor';
export const appConfig:ApplicationConfig={providers:[provideBrowserGlobalErrorListeners(),provideHttpClient(withInterceptors([authInterceptor,errorInterceptor])),provideRouter(routes,withComponentInputBinding())]};
