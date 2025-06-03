import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs'; // Import fs module at the top

test.describe('Signup Page Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signup');
  });

  test('should display signup form elements', async ({ page }) => {
    await expect(page.getByPlaceholder('First Name')).toBeVisible();
    await expect(page.getByPlaceholder('Last Name')).toBeVisible();
    await expect(page.getByPlaceholder('Contact')).toBeVisible();
    await expect(page.getByPlaceholder('Email')).toBeVisible();
    await expect(page.getByPlaceholder('Date of Birth')).toBeVisible(); // Placeholder is "Date of Birth"
    await expect(page.locator('select[name="role"]')).toBeVisible();
    await expect(page.locator('select[name="department"]')).toBeVisible();
    await expect(page.getByPlaceholder('City/Town')).toBeVisible();
    await expect(page.getByPlaceholder('State')).toBeVisible();
    await expect(page.getByPlaceholder('Country')).toBeVisible();
    await expect(page.getByPlaceholder('Please set a strong password')).toBeVisible();
    await expect(page.locator('label[for="profile-image"]')).toBeVisible();
    await expect(page.locator('label[for="profile-image"]')).toContainText('Upload Profile Picture');
    await expect(page.getByRole('button', { name: 'Sign Up' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Signing you up' })).toBeVisible();
  });

  test('should show HTML5 validation error for empty required fields', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign Up' }).click();
    // Example: Check validation for the first name input
    const firstNameInput = page.getByPlaceholder('First Name');
    const isInvalid = await firstNameInput.evaluate(element => !(element as HTMLInputElement).checkValidity());
    expect(isInvalid).toBe(true);
    // Similar checks can be added for other required fields
  });

  test('contact field should only accept numbers and max 10 digits', async ({ page }) => {
    const contactInput = page.getByPlaceholder('Contact');
    
    // Use pressSequentially to allow the component's onChange to process character by character
    await contactInput.pressSequentially('abcdef12345ghi'); 
    
    // Wait for the input's value to be processed by the component's onChange handler
    // The component's onChange is: e.target.value.replace(/[^0-9]/g, '')
    await page.waitForFunction((expectedValue) => {
      const inputElement = document.querySelector('input[name="contact"]') as HTMLInputElement;
      return inputElement && inputElement.value === expectedValue;
    }, '12345', { timeout: 5000 }); // Wait up to 5 seconds

    await expect(contactInput).toHaveValue('12345');

    // Test maxLength: Clear the input first, then fill with pressSequentially
    await contactInput.fill(''); // Clear previous value
    await contactInput.pressSequentially('1234567890123'); 
    
    await page.waitForFunction((expectedValue) => {
      const inputElement = document.querySelector('input[name="contact"]') as HTMLInputElement;
      return inputElement && inputElement.value === expectedValue;
    }, '1234567890', { timeout: 5000 });

    await expect(contactInput).toHaveValue('1234567890'); // Component logic enforces maxLength 10
  });

  test('profile image upload should update label', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]#profile-image');
    const imageLabel = page.locator('label[for="profile-image"]');

    await expect(imageLabel).toContainText('Upload Profile Picture');

    // Create a dummy file for upload
    const filePath = path.join(__dirname, 'assets', 'dummy-image.png'); // Ensure this file exists
    // If dummy-image.png doesn't exist, create a simple one or use a text file for simplicity if content doesn't matter
    // For a real image test, ensure the file exists. For this example, we'll assume it does.
    // If not, you can use `setInputFiles` with buffer content.
    // await fileInput.setInputFiles({ name: 'dummy.png', mimeType: 'image/png', buffer: Buffer.from('dummy') });
    
    // Check if the dummy file exists, if not, skip or handle
    if (!fs.existsSync(filePath)) {
      console.warn(`Dummy image not found at ${filePath}, skipping exact label check for image upload. Creating a dummy file for test purposes.`);
      // Create a dummy file if it doesn't exist for the test to run
      if (!fs.existsSync(path.join(__dirname, 'assets'))){
        fs.mkdirSync(path.join(__dirname, 'assets'));
      }
      fs.writeFileSync(filePath, 'dummy content for test image');
    }
    
    await fileInput.setInputFiles(filePath);
    await expect(imageLabel).toContainText('Image Selected ✓', { timeout: 5000 });
  });

  test('should allow filling the form with valid data and simulate signup', async ({ page }) => {
    const uniqueEmail = `testuser_${Date.now()}@example.com`;
    await page.getByPlaceholder('First Name').fill('Test');
    await page.getByPlaceholder('Last Name').fill('User');
    await page.getByPlaceholder('Contact').fill('1234567890');
    await page.getByPlaceholder('Email').fill(uniqueEmail);
    await page.getByPlaceholder('Date of Birth').fill('2000-01-01');
    await page.locator('select[name="role"]').selectOption('student');
    await page.locator('select[name="department"]').selectOption('MCA');
    await page.getByPlaceholder('City/Town').fill('TestCity');
    await page.getByPlaceholder('State').fill('TestState');
    await page.getByPlaceholder('Country').fill('TestCountry');
    await page.getByPlaceholder('Please set a strong password').fill('Password123!');

    // Optionally, test image upload as part of this flow
    const filePath = path.join(__dirname, 'assets', 'dummy-image.png');
     if (!fs.existsSync(filePath)) {
      if (!fs.existsSync(path.join(__dirname, 'assets'))){ fs.mkdirSync(path.join(__dirname, 'assets')); }
      fs.writeFileSync(filePath, 'dummy content for test image');
    }
    await page.locator('input[type="file"]#profile-image').setInputFiles(filePath);


    // Check if all fields have the expected values
    await expect(page.getByPlaceholder('First Name')).toHaveValue('Test');
    await expect(page.locator('select[name="role"]')).toHaveValue('student');
    
    // Submit the form (optional, as this might create actual users)
    // await page.getByRole('button', { name: 'Sign Up' }).click();
    // Add assertions for successful signup if submission is tested
    // e.g., await expect(page.getByText('Signup successful!')).toBeVisible();
    // await page.waitForURL(/.*login/); // Or whatever the post-signup page is
  });
});
// No changes related to login flow.
// Ensure locators match app/signup/page.tsx:
// - Date of Birth input: page.getByPlaceholder('Date of Birth') or page.locator('input[name="DOB"]')
// - Role select: page.locator('select[name="role"]')
// - Department select: page.locator('select[name="department"]')
// - Profile image label: page.locator('label[for="profile-image"]')
// - Signup button: page.getByRole('button', { name: 'Sign Up' }) or page.locator('input[type="submit"][value="Sign Up"]')
