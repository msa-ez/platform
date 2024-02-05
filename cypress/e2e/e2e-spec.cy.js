describe('Auto Modeling Test', () => {
  
  it('visit page and log in.', () => {
    cy.visit('https://localhost:8081/#/')

    const yourText = '음식 배달 앱';
    cy.get('.auto-modeling-text').type(`${yourText}{enter}`);

    cy.get('.auto-cjm').click()
  })
})