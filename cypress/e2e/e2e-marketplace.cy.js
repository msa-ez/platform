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
      cy.wait(15000);

      cy.get('.cp-panel-folding').click();
      cy.wait(1000);

      cy.get('.cp-es-code-viewer-btn').click();
      cy.wait(90000);
      
      cy.wait(1000);
      cy.get('.cp-download-btn').click();
      cy.wait(1000); 

      cy.get('.cp-git-btn').click();
      cy.wait(1000);
      cy.get('.v-btn').eq(39).click(); 
      cy.wait(20000);
      cy.get('.cp-git-btn').click();
      cy.wait(1000);

      cy.get('.v-treeview-node__root').eq(1).click({force: true});
      cy.wait(1000);
      cy.get('.cp-explain-project-text').type('파일에 대해 설명해줘{enter}')
      cy.wait(20000);
      cy.get('.cp-explain-project-close').click();
      
      
      cy.get('.v-treeview-node__root').eq(8).click({force: true});
      cy.wait(1000);
      cy.get('.cp-explain-code').click();
      cy.wait(20000);
      cy.get('.cp-explain-code-close').click();
    })
  })
  
  