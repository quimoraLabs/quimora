import { test, expect } from '@playwright/test';

test.describe('Quimora Frontend Tests', () => {
  test('should load the home / login page', async ({ page }) => {
    // Navigates to baseURL (http://localhost:5173/)
    await page.goto('/');
    
    // Check page title or presence of main content
    await expect(page).toHaveTitle(/Quimora/i);
  });
});
