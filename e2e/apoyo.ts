import { expect, Page } from '@playwright/test';

export const USUARIOS = {
  admin: {
    usuario: process.env.PHARMA_ADMIN_USER ?? '',
    clave: process.env.PHARMA_ADMIN_PASSWORD ?? '',
  },
  vendedor: {
    usuario: process.env.PHARMA_VENDEDOR_USER ?? '',
    clave: process.env.PHARMA_VENDEDOR_PASSWORD ?? '',
  },
  almacen: {
    usuario: process.env.PHARMA_ALMACEN_USER ?? '',
    clave: process.env.PHARMA_ALMACEN_PASSWORD ?? '',
  },
} as const;

export async function iniciarSesion(page: Page, quien: keyof typeof USUARIOS, ruta = '/inicio') {
  const { usuario, clave } = USUARIOS[quien];
  if (!usuario || !clave) {
    throw new Error(`Configura PHARMA_${quien.toUpperCase()}_USER y PHARMA_${quien.toUpperCase()}_PASSWORD para ejecutar E2E.`);
  }
  await page.goto(ruta);
  await expect(page).toHaveURL(/\/login/);
  await page.getByLabel('Usuario').fill(usuario);
  await page.getByLabel('Contraseña', { exact: true }).fill(clave);
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await expect(page.getByRole('button', { name: 'Cerrar sesión' })).toBeVisible();
}
