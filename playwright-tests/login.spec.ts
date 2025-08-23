import { test, expect } from '@playwright/test';

const studentEmail = process.env.TEST_STUDENT_EMAIL;
const studentPassword = process.env.TEST_STUDENT_PASSWORD;
const incorrectPassword = 'incorrectPassword123';

test.describe('Login Page Functionality', () => {
  test.beforeAll(() => {
    if (!studentEmail || !studentPassword) {
      // Note: Some tests might only need studentEmail (e.g., for incorrect password test)
      // but successful login test needs both.
      console.warn('Warning: TEST_STUDENT_EMAIL or TEST_STUDENT_PASSWORD might not be set. Some login tests may fail or be skipped.');
    }
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login form elements', async ({ page }) => {
    // Check for email input
    await expect(page.getByPlaceholder('E-mail')).toBeVisible();
    // Check for password input
    await expect(page.getByPlaceholder('Password')).toBeVisible();
    // Check for login button
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
    // Check for "Forgot password?" link
    await expect(page.getByRole('link', { name: 'Forgot password?' })).toBeVisible();
    // Assuming the main heading on the login page is "Login to explore"
    await expect(page.getByRole('heading', { name: 'Login to explore' })).toBeVisible();
  });

  test('should show HTML5 validation error for empty email', async ({ page }) => {
    // Click login button without filling fields
    await page.getByRole('button', { name: 'Login' }).click();
    const emailInput = page.getByPlaceholder('E-mail');
    // Check for the browser's built-in validation message.
    // This can be tricky to assert directly in a cross-browser way.
    // A common approach is to check if the input is invalid.
    const isInvalid = await emailInput.evaluate(element => !(element as HTMLInputElement).checkValidity());
    expect(isInvalid).toBe(true);
  });

  test('should show HTML5 validation error for invalid email format', async ({ page }) => {
    const emailInput = page.getByPlaceholder('E-mail');
    await emailInput.fill('invalidemail');
    await page.getByRole('button', { name: 'Login' }).click(); // Attempt submission or move focus

    // Check if the input is invalid (HTML5 validation for type="email")
    // Need to attempt form submission or lose focus for some browsers to show native validation
    const isInvalid = await emailInput.evaluate(element => !(element as HTMLInputElement).checkValidity());
    expect(isInvalid).toBe(true);
  });

  test('should show server-side error for incorrect password', async ({ page }) => {
    if (!studentEmail) {
      test.skip(true, 'TEST_STUDENT_EMAIL not set, skipping incorrect password test.');
      return;
    }
    await page.getByPlaceholder('E-mail').fill(studentEmail);
    await page.getByPlaceholder('Password').fill(incorrectPassword);
    await page.getByRole('button', { name: 'Login' }).click();

    // From app/login/page.tsx, error is displayed in <p id="error">{error}</p>
    const errorMessage = page.locator('#error');
    await expect(errorMessage).toBeVisible({ timeout: 10000 }); // Wait for server response
    await expect(errorMessage).not.toBeEmpty(); // Or check for specific text if known
    // Example: await expect(errorMessage).toContainText('Invalid credentials');
    
    // Ensure still on login page
    await expect(page).toHaveURL(/.*login/);
  });

  test('should navigate to forgot password page', async ({ page }) => {
    await page.getByRole('link', { name: 'Forgot password?' }).click();
    await page.waitForURL(/.*forgot-password/);
    await expect(page).toHaveURL(/.*forgot-password/);
    // Add an assertion for an element on the forgot password page if available
    // e.g., await expect(page.getByRole('heading', { name: 'Reset Password' })).toBeVisible();
  });

  // Test for successful login is implicitly covered by `loginAs` in other suites.
  // If a dedicated successful login test is needed here:
  test('should login successfully with correct credentials and redirect to dashboard', async ({ page }) => {
    if (!studentEmail || !studentPassword) {
      test.skip(true, 'Student credentials not provided, skipping successful login test.');
      return;
    }
    await page.getByPlaceholder('E-mail').fill(studentEmail);
    await page.getByPlaceholder('Password').fill(studentPassword);
    await page.getByRole('button', { name: 'Login' }).click();

    // Expect redirection to the student-specific dashboard path
    await page.waitForURL(/.*\/dashboard\/student/, { timeout: 15000 });
    await expect(page).toHaveURL(/.*\/dashboard\/student/);
    // Verify a common dashboard element
    await expect(page.locator('div[class*="Dashboard_boxB1"]')).toBeVisible({ timeout: 10000 });
  });
});
