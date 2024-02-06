const { defineConfig } = require("cypress");

require('dotenv').config()

module.exports = defineConfig({
  chromeWebSecurity: false,
  projectId: '9mbede',
  e2e: {
    experimentalStudio: true,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  
});
