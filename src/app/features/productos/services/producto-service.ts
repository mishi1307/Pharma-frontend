import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginaResponse } from '../../../core/models/pagina-response';
import { OrdenProducto, Producto, ProductoRequest } from '../models/producto.model';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/productos`;

  listarPagina(
    consulta: { pagina: number; tamanio: number; ordenarPor: OrdenProducto; direccion: 'asc' | 'desc'; categoriaId?: number | null; buscar?: string },
  ): Observable<PaginaResponse<Producto>> {
    const params = new HttpParams()
      .set('pagina', consulta.pagina)
      .set('tamanio', consulta.tamanio)
      .set('ordenarPor', consulta.ordenarPor)
      .set('direccion', consulta.direccion);
    const query = consulta.categoriaId == null ? params : params.set('categoriaId', consulta.categoriaId);
    const filtros = consulta.buscar ? query.set('buscar', consulta.buscar) : query;
    return this.http.get<PaginaResponse<Producto>>(this.url, { params: filtros });
  }

  listar(): Observable<Producto[]> {
    return this.listarPagina({ pagina: 0, tamanio: 100, ordenarPor: 'nombre', direccion: 'asc' }).pipe(
      map((respuesta) => respuesta.contenido),
    );
  }

  obtener(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.url}/${id}`);
  }

  crear(dto: ProductoRequest): Observable<Producto> {
    return this.http.post<Producto>(this.url, dto);
  }

  actualizar(id: number, dto: ProductoRequest): Observable<Producto> {
    return this.http.put<Producto>(`${this.url}/${id}`, dto);
  }

  darDeBaja(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
