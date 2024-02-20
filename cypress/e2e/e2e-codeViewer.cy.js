Cypress.on('uncaught:exception', (err, runnable) => {
    return false
  })
  
  describe('Modeling Test', () => {
    
    beforeEach(() => {
      cy.session('mySession', () => {
        cy.login()
        cy.wait(30000);
      })
    })
  
    
    
    it('Modeling Test.', () => {
      cy.visit('https://www.msaez.io:8081/#/#mine')
      
      cy.get('.v-avatar').click()
      cy.get('.cp-github-login').click()
      cy.wait(11000);
  
      cy.clickAt(220, 300);
      cy.wait(10000);

      cy.get('.cp-panel-folding').click();
      cy.wait(1000);

      cy.get('.cp-es-code-viewer-btn').click();
      cy.wait(60000);
      
      cy.wait(1000);
      cy.get('.cp-download-btn').click();
      cy.wait(1000); 

      cy.get('.cp-git-btn').click();
      cy.wait(1000);
      cy.get('.v-btn').eq(39).click(); 
      cy.wait(1000);
    })
  })
  
  