const { defineConfig } = require("cypress");

require('dotenv').config()

module.exports = defineConfig({
  e2e: {
    experimentalStudio: true,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
