import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginaResponse } from '../../../core/models/pagina-response';
import { Cliente, ClienteRequest } from '../models/cliente.model';

export type CampoOrdenCliente = 'dni' | 'apellidos';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private readonly http = inject(HttpClient);
  private readonly url = environment.apiUrl + '/clientes';

  listar(
    pagina = 0,
    tamanio = 10,
    ordenarPor: CampoOrdenCliente = 'apellidos',
    direccion: 'asc' | 'desc' = 'asc',
  ): Observable<PaginaResponse<Cliente>> {
    const params = new HttpParams()
      .set('pagina', pagina)
      .set('tamanio', tamanio)
      .set('ordenarPor', ordenarPor)
      .set('direccion', direccion);

    return this.http.get<PaginaResponse<Cliente> | Cliente[]>(this.url, { params }).pipe(
      map((respuesta) => {
        if (!Array.isArray(respuesta)) return respuesta;

        const clientes = [...respuesta].sort((a, b) => {
          const valorA = a[ordenarPor];
          const valorB = b[ordenarPor];
          const comparacion = valorA.localeCompare(valorB, 'es', { numeric: true, sensitivity: 'base' });
          return direccion === 'asc' ? comparacion : -comparacion;
        });
        const inicio = pagina * tamanio;
        const totalPaginas = Math.ceil(clientes.length / tamanio);

        return {
          contenido: clientes.slice(inicio, inicio + tamanio),
          pagina,
          tamanio,
          totalElementos: clientes.length,
          totalPaginas,
          ultima: pagina >= totalPaginas - 1,
        };
      }),
    );
  }

  obtener(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(this.url + '/' + id);
  }

  crear(dto: ClienteRequest): Observable<Cliente> {
    return this.http.post<Cliente>(this.url, dto);
  }

  actualizar(id: number, dto: ClienteRequest): Observable<Cliente> {
    return this.http.put<Cliente>(this.url + '/' + id, dto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(this.url + '/' + id);
  }
}