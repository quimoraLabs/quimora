import { test, expect } from '@playwright/test';

test.describe('Quimora Application & Performance Tests', () => {

  test('Page Load & Performance Benchmark - Homepage', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/public');
    const loadTimeMs = Date.now() - startTime;

    // Check page loaded successfully
    await expect(page.locator('body')).toBeVisible();

    console.log(`🚀 Homepage Loaded in: ${loadTimeMs} ms`);
    expect(loadTimeMs).toBeLessThan(10000);
  });

  test('Page Load & Performance Benchmark - Login Page', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/login');
    const loadTimeMs = Date.now() - startTime;

    // Verify email and password input fields exist
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    
    await expect(emailInput.first()).toBeVisible();
    await expect(passwordInput.first()).toBeVisible();

    console.log(`🔐 Login Page Loaded in: ${loadTimeMs} ms`);
    expect(loadTimeMs).toBeLessThan(10000);
  });

  test('Page Load & Performance Benchmark - About Page', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/about');
    const loadTimeMs = Date.now() - startTime;

    await expect(page.locator('body')).toBeVisible();
    console.log(`ℹ️ About Page Loaded in: ${loadTimeMs} ms`);
    expect(loadTimeMs).toBeLessThan(10000);
  });

});
