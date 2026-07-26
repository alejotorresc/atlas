import { test, expect } from '@playwright/test';

/**
 * End-to-end smoke path per spec §16: sign in, register an expense, verify
 * it appears in transactions and updates the relevant balance/dashboard.
 *
 * Requires a configured Supabase project (NEXT_PUBLIC_SUPABASE_URL /
 * NEXT_PUBLIC_SUPABASE_ANON_KEY) with a seeded test user and at least one
 * account — see supabase/seed.sql. Not runnable in this environment since
 * no live Supabase project is configured; see docs/build-status.md for the
 * exact remaining verification steps.
 */

const TEST_EMAIL = process.env.E2E_TEST_EMAIL;
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD;

test.skip(!TEST_EMAIL || !TEST_PASSWORD, 'Set E2E_TEST_EMAIL / E2E_TEST_PASSWORD against a seeded Supabase project to run this test.');

test('sign in, register an expense, see it reflected in transactions and dashboard', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Correo electronico').fill(TEST_EMAIL!);
  await page.getByLabel('Contrasena').fill(TEST_PASSWORD!);
  await page.getByRole('button', { name: 'Ingresar' }).click();

  await expect(page).toHaveURL('/');
  const safeToSpendBefore = await page.getByText('Puedes gastar').locator('..').textContent();

  await page.goto('/transactions');
  await page.getByRole('button', { name: 'Registrar movimiento' }).click();
  await page.getByLabel('Monto').fill('50.00');
  await page.getByLabel('Descripcion').fill('Prueba E2E almuerzo');
  await page.getByRole('combobox', { name: 'Cuenta' }).selectOption({ index: 1 });
  await page.getByRole('button', { name: 'Guardar' }).click();

  await expect(page.getByText('Prueba E2E almuerzo')).toBeVisible();

  await page.goto('/');
  const safeToSpendAfter = await page.getByText('Puedes gastar').locator('..').textContent();
  expect(safeToSpendAfter).not.toEqual(safeToSpendBefore);
});
