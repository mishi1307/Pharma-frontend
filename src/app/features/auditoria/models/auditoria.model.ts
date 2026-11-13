export interface AuditoriaEvento {
  fecha: string;
  usuario: string;
  accion: string;
  entidad: string;
  entidadId: number | null;
  detalle: string | null;
  requestId: string | null;
}
