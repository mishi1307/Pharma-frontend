import { expect, test } from '@playwright/test';
import { iniciarSesion } from './apoyo';

test('E2E-09: una venta vacía no se puede confirmar', async ({ page }) => {
  await iniciarSesion(page, 'vendedor', '/ventas/nueva');
  await expect(page.getByRole('button', { name: 'Revisar venta' })).toBeVisible();
  await page.getByRole('button', { name: 'Revisar venta' }).click();
  await expect(page.getByText('Agrega al menos un producto.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Confirmar venta' })).toHaveCount(0);
});

test('E2E-08: vender más que el stock responde 409 y no modifica inventario', async ({ page }) => {
  await iniciarSesion(page, 'vendedor', '/ventas/nueva');
  await page.getByTestId('buscar-cliente').fill('Carlos');
  const cliente = page.getByTestId('opcion-cliente').first();
  await expect(cliente).toBeVisible();
  const clienteId = Number(await cliente.getAttribute('data-cliente-id'));
  await cliente.click();
  await page.getByTestId('buscar-producto').fill('Paracetamol');
  const producto = page.getByTestId('opcion-producto').first();
  await expect(producto).toBeVisible();
  const productoId = Number(await producto.getAttribute('data-producto-id'));
  const stock = Number(await producto.getAttribute('data-stock'));
  const token = await page.evaluate(() => {
    const raw = sessionStorage.getItem('pharmasoft.sesion');
    return raw ? (JSON.parse(raw) as { token: string }).token : '';
  });
  const respuesta = await page.request.post('http://localhost:8080/api/v1/ventas', {
    headers: { Authorization: `Bearer ${token}` },
    data: { clienteId, detalles: [{ productoId, cantidad: stock + 1 }] },
  });
  expect(respuesta.status()).toBe(409);
  const verificacion = await page.request.get(`http://localhost:8080/api/v1/productos/${productoId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(verificacion.status()).toBe(200);
  expect((await verificacion.json()).stock).toBe(stock);
});

test('E2E-10: el administrador puede consultar la auditoría', async ({ page }) => {
  await iniciarSesion(page, 'admin', '/auditoria');
  await expect(page.getByRole('heading', { name: 'Auditoría' })).toBeVisible();
  await expect(page.locator('[data-testid="tabla-auditoria"], .empty h3')).toBeVisible();
});

test('E2E-15: el filtro de auditoría actualiza la URL y consulta el API', async ({ page }) => {
  await iniciarSesion(page, 'admin', '/auditoria');
  await page.getByRole('textbox', { name: 'Usuario' }).fill('admin');
  const respuesta = page.waitForResponse(r => r.url().includes('/api/v1/auditoria') && r.url().includes('usuario=admin'));
  await page.getByRole('button', { name: 'Buscar' }).click();
  expect((await respuesta).status()).toBe(200);
  await expect(page).toHaveURL(/usuario=admin/);
});

test('E2E-11: el vendedor no ve ni puede abrir la auditoría', async ({ page }) => {
  await iniciarSesion(page, 'vendedor');
  await expect(page.getByRole('link', { name: 'Auditoría' })).toHaveCount(0);
  await page.goto('/auditoria');
  await expect(page).toHaveURL(/\/acceso-denegado/);
  await expect(page.getByRole('heading', { name: /Acceso denegado/ })).toBeVisible();
});

test('E2E-12: un token alterado devuelve al login y conserva la ruta solicitada', async ({ page }) => {
  await iniciarSesion(page, 'vendedor', '/ventas');
  await page.evaluate(() => {
    const raw = sessionStorage.getItem('pharmasoft.sesion');
    if (!raw) throw new Error('No se encontró la sesión de prueba');
    const sesion = JSON.parse(raw) as { token: string };
    sesion.token = 'token.alterado.invalido';
    sessionStorage.setItem('pharmasoft.sesion', JSON.stringify(sesion));
  });
  await page.goto('/productos?pagina=0');
  await expect(page).toHaveURL(/\/login\?expirada=1/);
  await expect(page).toHaveURL(/returnUrl/);
});
