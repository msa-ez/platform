describe('Auto Modeling Test', () => {
  
  it('visit page and log in.', () => {
    cy.login('rbtn110@uengine.org', 'Rlarbtn135!')
    
    cy.visit('https://www.msaez.io:8081/#/')
    
    cy.get('.v-avatar').click()
    
    cy.get('.git-button').click()
    

    const yourText = '음식 배달 앱';
    cy.get('.auto-modeling-text').type(`${yourText}{enter}`);

    cy.get('.auto-cjm').click()
  })
})