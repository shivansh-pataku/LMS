import { test, expect, Page } from '@playwright/test';
import { loginUser } from './utils/loginUtils'; // Reverted to utils subfolder

const studentEmail = process.env.TEST_STUDENT_EMAIL;
const studentPassword = process.env.TEST_STUDENT_PASSWORD;

test.describe('Student Courses Area', () => {
  test.beforeAll(() => {
    if (!studentEmail || !studentPassword) {
      throw new Error('Test student credentials (TEST_STUDENT_EMAIL, TEST_STUDENT_PASSWORD) are not set in environment variables.');
    }
  });

  test.beforeEach(async ({ page }) => {
    // Add a check here to satisfy TypeScript and skip if beforeAll didn't catch it
    if (!studentEmail || !studentPassword) {
      test.skip(true, 'Student credentials not provided for Student Courses Area, skipping tests in this describe block.');
      return; // Ensure no further execution in this block if skipped
    }

    await page.goto('/login');
    await page.getByPlaceholder('E-mail').fill(studentEmail); // studentEmail is now guaranteed to be a string
    await page.getByPlaceholder('Password').fill(studentPassword); // studentPassword is now guaranteed to be a string
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL(/.*\/dashboard\/student/, { timeout: 20000 });
    
    // CoursesSTUDENT.tsx is the default view on student dashboard.
    // It shows <h4 class="classic_heading"...>Your Courses</h4>
    await expect(page.getByRole('heading', { name: 'Your Courses', level: 4 })).toBeVisible({ timeout: 15000 });
  });

  test('should display "Your Courses" heading for student', async ({ page }) => {
    // This is verified by beforeEach, but an explicit check here is fine.
    await expect(page.getByRole('heading', { name: 'Your Courses', level: 4 })).toBeVisible();
  });

  test('should display course cards for student', async ({ page }) => {
    // In CoursesSTUDENT.tsx, the container is <div className={styles.Container_Classes}>
    // Using partial class match for CSS Modules from CoursesSTUDENT.module.css (assuming styles.Container_Classes maps to something like Container_Classes_Container_Classes__XXXXX)
    const courseCardsContainer = page.locator('div[class*="Container_Classes_Container_Classes"]'); 
    await expect(courseCardsContainer).toBeVisible();

    // Check for at least one course card.
    // Each card is <div key={course.id} className={styles.item}>
    const firstCourseCard = courseCardsContainer.locator('div[class*="item_item"]').first(); 
    await expect(firstCourseCard).toBeVisible({ timeout: 10000 });

    // Verify elements within the card, e.g., teacher name, course code, course name
    // Example: <span className={styles.description} ...>{course.teacher_name}</span>
    await expect(firstCourseCard.locator('span[class*="description_description"]', { hasText: /.+/ }).first()).toBeVisible(); 
    // Course name is a span with specific style and onClick handler in CoursesSTUDENT.tsx
    await expect(firstCourseCard.locator('span[class*="description_description"][style*="font-weight: 700"]')).toBeVisible(); 
  });

  test('should navigate to course details when a course card is clicked', async ({ page }) => {
    // Clickable element is <span className={styles.description} style={{... fontWeight: "700" ...}} onClick={() => handleCourseClick(course)}> {course.course_name} </span>
    // from CoursesSTUDENT.tsx
    const firstCourseNameSpan = page.locator('div[class*="item_item"] span[style*="font-weight: 700"]').first();
    await expect(firstCourseNameSpan).toBeVisible({ timeout: 10000 });
    const courseNameText = await firstCourseNameSpan.textContent();
    expect(courseNameText).not.toBeNull();

    await firstCourseNameSpan.click();

    // After clicking, StudentCourses.tsx component is rendered.
    // It includes a "Back to Courses" button and tabs.
    await expect(page.getByRole('button', { name: '← Back to Courses' })).toBeVisible({ timeout: 10000 });
    
    // Verify tabs within StudentCourses.tsx (rendered by a <Tabs> component)
    await expect(page.getByRole('tab', { name: 'Details' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Content' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Live Class' })).toBeVisible();

    // Optionally, verify the course name is displayed in the details view (StudentCourses.tsx passes `course` prop)
    // This might be in a heading or specific element within the active tab content.
    // For example, if the "Details" tab shows the course name prominently:
    // await expect(page.getByRole('heading', { name: courseNameText! })).toBeVisible(); // Adjust selector as needed
  });
});
