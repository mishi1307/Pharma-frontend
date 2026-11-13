import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { describe, expect, it } from 'vitest';
import { getHttpErrorDetails } from './http-error';

describe('getHttpErrorDetails', () => {
  it('shows the request id from the backend error body', () => {
    const error = new HttpErrorResponse({
      error: { message: 'No se encontró el registro.', requestId: 'request-789' },
      status: 404,
    });

    expect(getHttpErrorDetails(error)).toMatchObject({
      message: 'No se encontró el registro. Código de seguimiento: request-789',
      requestId: 'request-789',
    });
  });

  it('uses the response header if an error body has no request id', () => {
    const error = new HttpErrorResponse({
      error: { message: 'Error interno.' },
      headers: new HttpHeaders({ 'X-Request-Id': 'header-321' }),
      status: 500,
    });

    expect(getHttpErrorDetails(error)).toMatchObject({
      message: 'Error interno. Código de seguimiento: header-321',
      requestId: 'header-321',
    });
  });
});
