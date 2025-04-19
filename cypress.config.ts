import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8099',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack',
    },
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
  },
  video: false,
  screenshotOnRunFailure: true,
}); 