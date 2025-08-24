import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    // `baseURL` is automatically prepended to '/'
    await page.goto('/');
  });

  test('successfully loads and has a main heading', async ({ page }) => {
    // app/page.tsx renders Container_Classes with selectedItem="All Courses"
    // Container_Classes.tsx renders this in an h2 with styles.selection
    // Use getByRole for more specific targeting of the heading.
    const heading = page.getByRole('heading', { name: 'All Courses', level: 2 });
    await expect(heading).toBeVisible();
    // The text itself is "All Courses"
    await expect(heading).toContainText('All Courses');

    // If "Jupyter" in the Navbar is your main H1, you would use:
    // const siteTitle = page.getByRole('link', { name: 'Jupiter' }); // Assuming it's a link
    // await expect(siteTitle).toBeVisible();
    // Or if it's an h1:
    // const siteTitleH1 = page.getByRole('heading', { name: 'Jupiter', level: 1 });
    // await expect(siteTitleH1).toBeVisible();
  });

  test('should have a visible navigation bar', async ({ page }) => {
    // The main Navbar is a div containing a "Jupiter" link and a "SignIn" link.
    const navBar = page.locator('div')
      .filter({ has: page.getByRole('link', { name: 'Jupiter' }) })
      .filter({ has: page.getByRole('link', { name: 'SignIn' }) });
    await expect(navBar).toBeVisible();

    // Alternative, if the above is not stable or you add a data-testid:
    // e.g., <div data-testid="main-navbar" className={styles.navbar}>
    // const navBar = page.getByTestId('main-navbar');
    // await expect(navBar).toBeVisible();
  });

  test('should navigate to the login page when login button is clicked', async ({ page }) => {
    // Navbar.tsx has <Link href="/login" className={styles.signupLogin}> <b>SignIn</b> </Link>
    // Using getByRole for links is robust. The link text is "SignIn".
    await page.getByRole('link', { name: 'SignIn' }).click();

    // Explicitly wait for the URL to change to contain /login
    await page.waitForURL(/.*login/);

    // Assumes your login page URL is /login or includes 'login'
    await expect(page).toHaveURL(/.*login/);

    // Verify the heading on the login page.
    // app/login/page.tsx has an <h2> with "Login to explore"
    const loginHeading = page.getByRole('heading', { name: 'Login to explore', level: 2 });
    await expect(loginHeading).toBeVisible();
    // await expect(loginHeading).toContainText('Login to explore'); // getByRole with name already checks this.
  });

  test('should navigate to the signup page when signup button is clicked', async ({ page }) => {
    // Navbar.tsx has <Link href="/signup" className={styles.signupLogin}> <b>SignUp</b> </Link>
    await page.getByRole('link', { name: 'SignUp' }).click();

    // Explicitly wait for the URL to change to contain /signup
    await page.waitForURL(/.*signup/);

    // Assumes your signup page URL is /signup
    await expect(page).toHaveURL(/.*signup/);

    // Verify the heading on the signup page.
    // app/signup/page.tsx has an <h2> with "Signing you up"
    const signupHeading = page.getByRole('heading', { name: 'Signing you up', level: 2 });
    await expect(signupHeading).toBeVisible();
  });
});
// No changes related to login flow.
// Ensure locators match app/page.tsx and components/Navbar.tsx
// - Main heading: page.getByRole('heading', { name: 'All Courses', level: 2 }) (from Container_Classes.tsx via app/page.tsx)
// - Navbar: page.locator('div').filter({ has: page.getByRole('link', { name: 'Jupiter' }) }).filter({ has: page.getByRole('link', { name: 'SignIn' }) })
// - SignIn link: page.getByRole('link', { name: 'SignIn' })
// - SignUp link: page.getByRole('link', { name: 'SignUp' })
// - Login page heading after click: page.getByRole('heading', { name: 'Login to explore', level: 2 })
// - Signup page heading after click: page.getByRole('heading', { name: 'Signing you up', level: 2 })
