import { expect, test } from '@playwright/test';
import { iniciarSesion } from './apoyo';

test('el vendedor registra una venta y el catálogo refleja el nuevo stock', async ({ page }) => {
  await iniciarSesion(page, 'vendedor', '/ventas/nueva');
  await page.getByTestId('buscar-cliente').fill('Carlos');
  await page.getByTestId('opcion-cliente').first().click();
  await page.getByTestId('buscar-producto').fill('Paracetamol');
  const opcion = page.getByTestId('opcion-producto').first();
  const stockAntes = Number(await opcion.getAttribute('data-stock'));
  expect(stockAntes).toBeGreaterThanOrEqual(2);
  await opcion.click();
  await page.getByTestId('cantidad').last().fill('2');
  await expect(page.getByTestId('total-venta')).not.toHaveText('S/ 0.00');
  const registro = page.waitForResponse((r) => r.url().endsWith('/api/v1/ventas') && r.request().method() === 'POST');
  await page.getByRole('button', { name: 'Revisar venta' }).click();
  await page.getByRole('button', { name: 'Confirmar venta' }).click();
  expect((await registro).status()).toBe(201);
  await expect(page.getByRole('status')).toContainText('Venta registrada correctamente');
  await page.goto('/productos?orden=nombre&dir=asc');
  const fila = page.getByTestId('tabla-productos').locator('tr', { hasText: 'Paracetamol' }).first();
  await expect(fila).toContainText(String(stockAntes - 2));
});
