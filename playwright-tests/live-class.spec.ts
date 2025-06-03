import { test, expect, Page, BrowserContext } from '@playwright/test';
import { loginUser } from './utils/loginUtils'; // Reverted to utils subfolder

const teacherEmail = process.env.TEST_TEACHER_EMAIL;
const teacherPassword = process.env.TEST_TEACHER_PASSWORD;
const studentEmail = process.env.TEST_STUDENT_EMAIL;
const studentPassword = process.env.TEST_STUDENT_PASSWORD;

// Example Course ID - replace with a valid one from your test DB
const courseIdForLiveClass = '1'; // Make sure this course exists and is suitable for testing

test.describe('Live Class Functionality - Teacher View', () => {
  let page: Page;

  test.beforeAll(() => {
    if (!teacherEmail || !teacherPassword) {
      throw new Error('Test teacher credentials (TEST_TEACHER_EMAIL, TEST_TEACHER_PASSWORD) are not set in environment variables for Teacher View.');
    }
    // Ensure loginUser is available; if loginUtils.ts is missing, this won't resolve the underlying issue
    if (typeof loginUser !== 'function') {
      throw new Error('loginUser function is not imported correctly. Check loginUtils.ts.');
    }
  });

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await loginUser(page, teacherEmail!, teacherPassword!);
    await page.waitForURL(/.*dashboard/);
    // Navigate to the specific course page where live classes can be managed
    // This URL will depend on your application's routing for course management
    await page.goto(`/${courseIdForLiveClass}`); // Adjust if your course URL is different
    await page.waitForURL(new RegExp(`.*${courseIdForLiveClass}`));

    // Click the "Live Class" tab/button if it exists
    // This selector needs to match how you switch to the live class section in the UI
    const liveClassTab = page.getByRole('tab', { name: 'Live Class' });
    if (await liveClassTab.isVisible()) {
        await liveClassTab.click();
    } else {
        // Fallback or error if tab is not found - adjust as necessary
        console.warn('Live Class tab not found by role, ensure UI is as expected or update selector.');
        // Example: try a more generic selector if needed, but role-based is preferred
        // await page.locator('button:has-text("Live Class")').click();
    }
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('should display create live class form for a teacher', async () => {
    await expect(page.getByRole('heading', { name: 'Create New Live Class' })).toBeVisible();
    await expect(page.getByLabel('Topic:')).toBeVisible();
    await expect(page.getByLabel('Description (Optional):')).toBeVisible();
    await expect(page.getByLabel('Schedule Date & Time (Optional):')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create Class' })).toBeVisible();
  });

  test('teacher should be able to create and see a new live class', async () => {
    const uniqueTopic = `Test Live Class ${Date.now()}`;
    await page.getByLabel('Topic:').fill(uniqueTopic);
    await page.getByLabel('Description (Optional):').fill('This is a test description.');
    // Optionally fill in date/time
    // const now = new Date();
    // const futureTime = new Date(now.getTime() + 5 * 60000); // 5 minutes in the future
    // const formattedDateTime = `${futureTime.getFullYear()}-${String(futureTime.getMonth() + 1).padStart(2, '0')}-${String(futureTime.getDate()).padStart(2, '0')}T${String(futureTime.getHours()).padStart(2, '0')}:${String(futureTime.getMinutes()).padStart(2, '0')}`;
    // await page.getByLabel("Schedule Date & Time (Optional):").fill(formattedDateTime);

    await page.getByRole('button', { name: 'Create Class' }).click();

    // Wait for the class to appear in the list
    // The selector for the list item needs to be specific to your UI
    await expect(page.locator('ul li button:has-text("' + uniqueTopic + '")').first()).toBeVisible({ timeout: 10000 });
    // Or, if it's just text in a div/p:
    // await expect(page.getByText(uniqueTopic, { exact: false })).toBeVisible({ timeout: 10000 });
  });
});


test.describe('Live Class Functionality - Student View', () => {
  let studentPage: Page;
  let teacherPage: Page; // To create a class
  let teacherContext: BrowserContext; // To isolate teacher actions

  test.beforeAll(async ({ browser }) => {
    if (!teacherEmail || !teacherPassword || !studentEmail || !studentPassword) {
      throw new Error('Test credentials (TEST_TEACHER_EMAIL, TEST_TEACHER_PASSWORD, TEST_STUDENT_EMAIL, TEST_STUDENT_PASSWORD) are not fully set for Student View beforeAll.');
    }
    // Ensure loginUser is available
    if (typeof loginUser !== 'function') {
        throw new Error('loginUser function is not imported correctly. Check loginUtils.ts for Student View.');
    }
    // Setup teacher context and page
    teacherContext = await browser.newContext();
    teacherPage = await teacherContext.newPage();
    await loginUser(teacherPage, teacherEmail!, teacherPassword!);
    await teacherPage.waitForURL(/.*dashboard/);
    await teacherPage.goto(`/${courseIdForLiveClass}`);
    await teacherPage.waitForURL(new RegExp(`.*${courseIdForLiveClass}`));
    
    const liveClassTabTeacher = teacherPage.getByRole('tab', { name: 'Live Class' });
    if (await liveClassTabTeacher.isVisible()) {
        await liveClassTabTeacher.click();
    } else {
        console.warn('Teacher: Live Class tab not found by role.');
    }

    // Create a live class for the student to see
    const liveClassTopic = `Student View Test Class ${Date.now()}`;
    await teacherPage.getByLabel('Topic:').fill(liveClassTopic);
    await teacherPage.getByRole('button', { name: 'Create Class' }).click();
    await expect(teacherPage.locator('ul li button:has-text("' + liveClassTopic + '")').first()).toBeVisible({ timeout: 10000 });
    // Store the topic to look for it in the student view
    process.env.LIVE_CLASS_TOPIC_FOR_STUDENT_TEST = liveClassTopic;
  });

  test.afterAll(async () => {
    // Safely close teacherPage and teacherContext
    if (teacherPage) {
      await teacherPage.close();
    }
    if (teacherContext) {
      await teacherContext.close();
    }
    delete process.env.LIVE_CLASS_TOPIC_FOR_STUDENT_TEST;
  });

  test.beforeEach(async ({ browser }) => {
    studentPage = await browser.newPage();
    await loginUser(studentPage, studentEmail!, studentPassword!);
    await studentPage.waitForURL(/.*dashboard/);
    // Student navigates to the course page
    await studentPage.goto(`/courses`); // Assuming students go to a general courses page first
    await studentPage.waitForURL(/.*courses/);
    // Click on the specific course card to go to its details page
    // This selector needs to match your course card structure
    await studentPage.locator(`.item:has-text("${courseIdForLiveClass}")`).or(studentPage.locator(`article:has-text("${courseIdForLiveClass}")`)).first().click(); // Adjust selector
    await studentPage.waitForURL(new RegExp(`.*${courseIdForLiveClass}`));

    const liveClassTabStudent = studentPage.getByRole('tab', { name: 'Live Class' });
     if (await liveClassTabStudent.isVisible()) {
        await liveClassTabStudent.click();
    } else {
        console.warn('Student: Live Class tab not found by role.');
    }
  });

  test.afterEach(async () => {
    await studentPage.close();
  });

  test('should display list of scheduled live classes and not the create form', async () => {
    await expect(studentPage.getByRole('heading', { name: 'Create New Live Class' })).not.toBeVisible();
    await expect(studentPage.getByRole('heading', { name: 'Scheduled/Existing Classes:' })).toBeVisible();
    const liveClassTopic = process.env.LIVE_CLASS_TOPIC_FOR_STUDENT_TEST;
    if (liveClassTopic) {
      await expect(studentPage.locator('ul li button:has-text("' + liveClassTopic + '")').first()).toBeVisible();
    } else {
      test.skip(true, 'Live class topic not set, skipping assertion for specific class.');
    }
  });

  test('student should be able to join a class and see Jitsi embed', async () => {
    const liveClassTopic = process.env.LIVE_CLASS_TOPIC_FOR_STUDENT_TEST;
    if (!liveClassTopic) {
      test.skip(true, 'Live class topic not set, cannot test joining.');
      return;
    }

    // Click the button to join the class created by the teacher
    await studentPage.locator('ul li button:has-text("' + liveClassTopic + '")').first().click();
    
    // Wait for Jitsi embed to be visible
    // The Jitsi embed is usually in an iframe. The selector needs to target the iframe.
    // The JitsiMeetEmbed component might render an iframe with a specific title or name attribute.
    // For example, if your JitsiMeetEmbed component renders <iframe title="Jitsi Meet Conference"...>
    const jitsiIframe = studentPage.frameLocator('iframe[title="Jitsi Meet Conference"]'); // Adjust selector if needed
    
    // Check for an element within the Jitsi iframe to confirm it loaded
    // This is a common element, but might change based on Jitsi version/config
    await expect(jitsiIframe.locator('[aria-label*="Meeting title"]')).toBeVisible({ timeout: 20000 });
    // Or check for the "toolbar"
    // await expect(jitsiIframe.locator('.toolbar')).toBeVisible({ timeout: 20000 });

    // Check if the "Back to Classes List" button is visible (indicating we are in the Jitsi view)
    await expect(studentPage.getByRole('button', { name: 'Back to Classes List' })).toBeVisible();
  });
});
