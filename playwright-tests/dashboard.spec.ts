import { test, expect, Page } from '@playwright/test';
import { loginUser } from './utils/loginUtils'; // Reverted to utils subfolder

const studentEmail = process.env.TEST_STUDENT_EMAIL;
const studentPassword = process.env.TEST_STUDENT_PASSWORD;
const teacherEmail = process.env.TEST_TEACHER_EMAIL;
const teacherPassword = process.env.TEST_TEACHER_PASSWORD;
const adminEmail = process.env.TEST_ADMIN_EMAIL;
const adminPassword = process.env.TEST_ADMIN_PASSWORD;
const masterEmail = process.env.TEST_MASTER_EMAIL;
const masterPassword = process.env.TEST_MASTER_PASSWORD;

// Helper function for logging in
// async function loginUser(page: Page, email: string | undefined, password: string | undefined, expectedPath: RegExp) {
//   if (!email || !password) {
//     test.skip(true, `Credentials (${email ? 'password' : 'email'} missing) not provided for this role, skipping test.`);
//     return; // Ensure no further execution in this function if skipped
//   }
//   await page.goto('/login');
//   await page.getByPlaceholder('E-mail').fill(email);
//   await page.getByPlaceholder('Password').fill(password);
//   await page.getByRole('button', { name: 'Login' }).click();
//   await page.waitForURL(expectedPath, { timeout: 20000 });
// }

test.describe('Dashboard Access and Content', () => {
  test('should redirect to /dashboard/student after successful student login and display student elements', async ({ page }) => {
    await loginUser(page, studentEmail, studentPassword, /.*\/dashboard\/student/);
    if (!studentEmail || !studentPassword) return; // Skip assertion if login was skipped

    await expect(page.getByRole('heading', { name: 'Menu' })).toBeVisible();
    // Assuming CoursesSTUDENT component shows a "Your Courses" heading
    await expect(page.getByRole('heading', { name: 'Your Courses' })).toBeVisible({ timeout: 10000 });
  });

  test('should display teacher dashboard elements after teacher login', async ({ page }) => {
    await loginUser(page, teacherEmail, teacherPassword, /.*\/dashboard\/teacher/);
    if (!teacherEmail || !teacherPassword) return; // Skip assertion if login was skipped

    await expect(page.getByRole('heading', { name: 'Menu' })).toBeVisible();
    // Assuming CoursesTEACHER component shows an "Allotted Courses" heading
    await expect(page.getByRole('heading', { name: 'Allotted Courses' })).toBeVisible({ timeout: 10000 });
  });

  test('should display admin dashboard elements after admin login', async ({ page }) => {
    await loginUser(page, adminEmail, adminPassword, /.*\/dashboard\/admin/);
    if (!adminEmail || !adminPassword) return; // Skip assertion if login was skipped

    await expect(page.getByRole('heading', { name: 'Menu' })).toBeVisible();
    // Assuming DashboardADMIN component shows a "Courses" heading (as per CoursesADMIN.tsx structure)
    // and an "Add New Course" button from AddCourse component
    await expect(page.getByRole('heading', { name: 'Courses' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: 'Add New Course' })).toBeVisible();
  });

  test('should display master dashboard elements after master login', async ({ page }) => {
    await loginUser(page, masterEmail, masterPassword, /.*\/dashboard\/master/);
    if (!masterEmail || !masterPassword) return; // Skip assertion if login was skipped

    await expect(page.getByRole('heading', { name: 'Menu' })).toBeVisible();
    // Assuming CoursesMASTER component shows an "Allotted Courses" heading
    await expect(page.getByRole('heading', { name: 'Allotted Courses' })).toBeVisible({ timeout: 10000 });
  });
});
