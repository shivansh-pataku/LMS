import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000", // Corrected: colon before port
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setupNodeEvents(_on, _config) {
      // implement node event listeners here
      // and load any plugins
      // For example, if you were to use a plugin:
      // _on('task', { myTask: () => { ... } });
      // return _config;
    },
    supportFile: 'cypress/support/e2e.ts', // or e2e.js if you prefer JavaScript
  },
});
