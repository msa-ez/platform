describe('empty spec', () => {
  it('passes', () => {
    cy.visit('https://example.cypress.io')
    /* ==== Generated with Cypress Studio ==== */
    cy.get('.dropdown-toggle').click();
    cy.get('.dropdown-menu > :nth-child(2) > a').click();
    /* ==== End Cypress Studio ==== */
  })
})