describe('MSAEZ UMLClassDiagram Test', () => {

  // Create New Project
  Cypress.Commands.add('newProject', (type) => {
    cy.get(':nth-child(6) > .v-btn__content > div').trigger('mouseenter')
    cy.get('.v-list-item-group')
      .get('.v-list-item__title')
      .contains(type)
      .click()
  })

  // Get input by label text
  Cypress.Commands.add('getByLabel', (label) => {
    cy.contains('label', label)
      .invoke('attr', 'for')
      .then((id) => {
        cy.get('input#' + id)
    })
  })

  // Add Attribute
  Cypress.Commands.add('addAttribute', (type, name) => {
    cy.get('.attribute-type').click()
    cy.get('.v-list-item__title').contains(type).click()
    cy.get('.attribute-name').find('input[type="text"]').type(name)
    cy.get('.v-btn__content').contains('ADD ATTRIBUTE').click()
  })

  

  beforeEach(() => {
    cy.visit('https://localhost:8081/#/')
    cy.get('.v-input--selection-controls__ripple').click()
  })

  it('UMLClassDiagram', () => {
    // New Project
    cy.newProject('UML Class Diagram')
    cy.wait(4000)

    // Create Entity Class
    cy.get('[_component="uml-class-definition"] > img').trigger('mousedown', { which: 1, force: true })
    
    cy.get('svg > g[_type="ROOT"]')
      .trigger('mousemove', { 
        x: 300, y: 300,
        pageX: 300, pageY: 300,
        screenX: 300, screenY: 300,
        force: true
      })
      .trigger('mouseup', { 
        x: 300, y: 300,
        pageX: 300, pageY: 300,
        screenX: 300, screenY: 300,
        force: true
      })

    cy.get('svg > g[_type="ROOT"]')
      .get('g[_shape="GROUP"]')
      .last()
      .invoke('attr', 'id')
      .as('entityClass')

    cy.get('@entityClass').then((entityClassId) => {
      cy.log(entityClassId)
      
      // Open Panel
      cy.get('g#' + entityClassId).dblclick({ force: true })
          
      // Edit Entity Class
      cy.getByLabel('Class Name').type('Pet')
      
      // Edit Attribute
      cy.addAttribute('String', 'name')
      
      // Close Panel
      cy.get('svg').click({ force: true })
    })
    //   .then(($newElement) => {
    //     entityClassId = $newElement.attr('id')
    // })


    // Create Value Object Class
    cy.get('[_component="uml-vo-class"] > img').trigger('mousedown', { which: 1, force: true })

    cy.get('svg > g[_type="ROOT"]')
      .trigger('mousemove', {
        x: 600, y: 300,
        pageX: 600, pageY: 300,
        screenX: 600, screenY: 300,
        force: true
      })
      .trigger('mouseup', {
        x: 600, y: 300,
        pageX: 600, pageY: 300,
        screenX: 600, screenY: 300,
        force: true
      })

    cy.get('svg > g[_type="ROOT"]')
      .get('g[_shape="GROUP"]')
      .last()
      .invoke('attr', 'id')
      .as('voClass')
    
    cy.get('@voClass').then((voClassId) => {
        // Open Panel
        cy.get('g#' + voClassId).dblclick({ force: true })
        
        // Edit Entity Class
        cy.getByLabel('Class Name').type('Address')
        
        // Edit Attribute
        cy.addAttribute('String', 'zipcode')
        
        // Close Panel
        cy.get('svg').click({ force: true })
    })

    // Add Relation
    cy.get('@entityClass').then((entityClassId) => {
      cy.get('g#' + entityClassId).click({ force: true })
    })
    cy.get('[id$=_GUIDE_LINE]').click({ force: true })
    cy.get('@voClass').then((voClassId) => {
      cy.get('g#' + voClassId).click({ force: true })
    })


    // // Add Relation and New Class
    // cy.get('g#' + entityClassId).click({ force: true })

    // cy.get('svg > g[_type="ROOT"] > g[id$=_GUIDE]')
    //   .get('image')
    //   .first()
    //   .click()

    // cy.get('svg > g[_type="ROOT"]')
    //   .trigger('mousemove', { x: 300, y: 300, force: true })
    //   .click({ force: true })
    
    // cy.get('svg > g[_type="ROOT"]')
    //   .get('g[_shape="GROUP"]')
    //   .last()
    //   .dblclick({ force: true })

    // Create Value Object Class
    // cy.get('[_component="uml-vo-class"] > img').trigger('mouseover')
    // cy.get('[_component="uml-vo-class"] > img').trigger('mouseenter')
    // cy.get('[_component="uml-vo-class-user"] > img').click({ force: true })

  })
})
