describe('Homepage', () => {
  beforeEach(() => {
    // Assumes baseUrl is set in cypress.config.ts (e.g., 'http://localhost:3000')
    cy.visit('/'); // Visits the root of your site before each test
  });

  it('successfully loads and displays key elements with specific attributes', () => {
    // Approach 1: Using data-testid attributes for more resilient selectors
    // (You would need to add `data-testid="main-heading"` to your H1 tag in the HTML)
    // cy.get('[data-testid="main-heading"]')
    //   .should('be.visible')
    //   .and('contain.text', 'Welcome to our Learning Platform!'); // Chained assertion

    // Current approach (fallback if data-testid is not yet implemented)
    // IMPORTANT: Replace 'Welcome to our Learning Platform!' with the actual H1 text.
    cy.get('h1')
      .should('be.visible')
      .and('contain.text', 'Welcome to our Learning Platform!');
  });

  it('should have a visible navigation bar and specific navigation links', () => {
    // Approach 2: Using aliases and testing multiple items within the navigation
    // (You would need to add `data-testid="main-navigation"` to your nav tag)
    // cy.get('[data-testid="main-navigation"]').as('mainNav');
    // cy.get('@mainNav').should('be.visible');
    // cy.get('@mainNav').find('a[href="/courses"]').should('be.visible').and('contain.text', 'Courses');
    // cy.get('@mainNav').find('a[href="/about"]').should('be.visible').and('contain.text', 'About Us');

    // Current approach (simplified)
    // Replace 'nav' with a more specific selector for your navigation bar if needed
    cy.get('nav').should('be.visible');
    // Example: Further check for a link within the nav
    // (You would need a link with text 'Courses' in your nav)
    // cy.get('nav').contains('a', 'Courses').should('be.visible');
  });

  it('should navigate to the login page when the login link/button is clicked', () => {
    // Approach 3: More specific selector for the login link and clearer assertions
    // (You would need to add `data-testid="login-link"` to your login link/button)
    // cy.get('[data-testid="login-link"]').as('loginLink');
    // cy.get('@loginLink').should('be.visible').and('contain.text', 'Login'); // Or appropriate text
    // cy.get('@loginLink').click();

    // Current approach
    // Replace 'Login' with the actual text or a more specific selector of your login button/link
    cy.contains('Login').click(); // Assumes there's an element containing the text "Login"

    cy.url().should('include', '/login'); // Assumes your login page URL is /login

    // Example: Verify a unique element on the login page
    // (You would need to add `data-testid="login-form-heading"` to a heading on the login page)
    // cy.get('[data-testid="login-form-heading"]').should('be.visible').and('contain.text', 'Sign In');
    cy.get('h2').should('contain.text', 'Sign In'); // Assuming login page has an H2 with "Sign In"
  });

  // Approach 4: Testing for non-existence of an element (example)
  // it('should not display admin controls for a regular user', () => {
  //   // (This assumes that admin controls would have a specific selector like '[data-testid="admin-dashboard-link"]')
  //   cy.get('[data-testid="admin-dashboard-link"]').should('not.exist');
  // });
});
