// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
import '@4tw/cypress-drag-drop'

Cypress.Commands.add('login', (username, password) => {
    cy.visit('https://github.com/login')

    cy.get('input[name="login"]').type(username)
    cy.get('input[name="password"]').type(password)

    cy.get('input[type="submit"]').click()
})

Cypress.Commands.add('dragToPosition', { prevSubject: 'element' }, (subject, x, y) => {
    cy.wrap(subject)
      .trigger('mousedown', { which: 1 , force: true})
      .trigger('mousemove', { x: x, y: y, force: true })
  });