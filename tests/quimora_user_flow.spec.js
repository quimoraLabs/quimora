import { test, expect } from '@playwright/test';

test.describe('Quimora Interactive User Flow Tests', () => {

  test('User can fill login form, toggle password visibility, and navigate to register', async ({ page }) => {
    // 1. Go to Login Page
    await page.goto('/login');

    // 2. Type email and password like a real user
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[placeholder="••••••••"]');
    
    await emailInput.fill('testuser@quimora.com');
    await passwordInput.fill('MySecretPassword123');

    // Verify values were typed into inputs
    await expect(emailInput).toHaveValue('testuser@quimora.com');
    await expect(passwordInput).toHaveValue('MySecretPassword123');

    // 3. Toggle Password Visibility (Eye icon button)
    const togglePassBtn = page.locator('form button[type="button"]');
    await togglePassBtn.click();
    
    // Expect input type to become text (password visible)
    await expect(page.locator('input[value="MySecretPassword123"]')).toHaveAttribute('type', 'text');

    // 4. Click 'ENLIST NOW' (Register link)
    const registerLink = page.getByRole('link', { name: /ENLIST NOW/i });
    await registerLink.click();

    // Verify redirected to /register
    await expect(page).toHaveURL(/.*register/);
  });

});
