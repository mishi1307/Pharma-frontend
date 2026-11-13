import { expect, test } from '@playwright/test';
import { iniciarSesion } from './apoyo';

test('el almacenero no tiene acceso al módulo Ventas', async ({ page }) => {
  await iniciarSesion(page, 'almacen');
  await expect(page.getByRole('link', { name: 'Ventas' })).toHaveCount(0);
  await page.goto('/ventas');
  await expect(page.getByRole('heading', { name: /Acceso denegado/ })).toBeVisible();
});
test('el vendedor consulta Productos sin acciones de edición', async ({ page }) => {
  await iniciarSesion(page, 'vendedor', '/productos');
  await expect(page.getByTestId('tabla-productos')).toBeVisible();
  await expect(page.getByRole('link', { name: /Nuevo producto/ })).toHaveCount(0);
});
