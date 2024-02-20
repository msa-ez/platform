Cypress.on('uncaught:exception', (err, runnable) => {
  return false
})

describe('Modeling Test', () => {
  
  beforeEach(() => {
    cy.session('mySession', () => {
      cy.login()
      cy.wait(20000);
    })
  })

  
  
  it('Modeling Test.', () => {
    cy.visit('https://www.msaez.io:8081/#/')
    
    cy.get('.v-avatar').click()
    
    cy.get('.cp-github-login').click()
    
    cy.wait(9000);

    cy.wait(4000);

    cy.get('.main-nav-modeling-is-mobile').click({force: true});

    cy.wait(1000);

    cy.get('.cp-create-model-img').eq(0).click();

    cy.wait(5000);

    cy.get('.cp-panel-folding').click();
    cy.wait(500);
    

    // Event
    cy.get('.cp-sticker').eq(0).trigger('mousedown', { which: 1 }) 
    cy.wait(500);
    cy.get('body').trigger('mousemove');
    cy.wait(500);
    cy.get('body').trigger('mouseup').dblclick();
    cy.wait(500);

    cy.get('#elementName').type('OrderPlaced')
    cy.get('.v-btn__content').eq(6).click({force: true})

    cy.get('body').trigger('mousedown', { which: 1 }) 
    cy.wait(500);
    cy.get('body').trigger('mousemove', { pageX: 405, pageY: 300 });
    cy.wait(500);
    cy.get('body').trigger('mouseup', { pageX: 405, pageY: 300 });
    cy.wait(1000);


    cy.get('.cp-sticker').eq(0).trigger('mousedown', { which: 1 }) 
    cy.wait(500);
    cy.get('body').trigger('mousemove');
    cy.wait(500);
    cy.get('body').trigger('mouseup').dblclick();
    cy.wait(500);

    cy.get('#elementName').type('OrderCanceled')
    cy.get('.v-btn__content').eq(6).click({force: true})

    cy.get('body').trigger('mousedown', { which: 1 }) 
    cy.wait(500);
    cy.get('body').trigger('mousemove', { pageX: 405, pageY: 415 });
    cy.wait(500);
    cy.get('body').trigger('mouseup', { pageX: 405, pageY: 415 });
    cy.wait(1000);


    cy.get('.cp-sticker').eq(0).trigger('mousedown', { which: 1 }) 
    cy.wait(500);
    cy.get('body').trigger('mousemove');
    cy.wait(500);
    cy.get('body').trigger('mouseup').dblclick();
    cy.wait(500);

    cy.get('#elementName').type('DeliveryStarted')
    cy.get('.v-btn__content').eq(6).click({force: true})

    cy.get('body').trigger('mousedown', { which: 1 }) 
    cy.wait(500);
    cy.get('body').trigger('mousemove', { pageX: 900, pageY: 300 });
    cy.wait(500);
    cy.get('body').trigger('mouseup', { pageX: 900, pageY: 300 });
    cy.wait(1000);


    cy.get('.cp-sticker').eq(0).trigger('mousedown', { which: 1 }) 
    cy.wait(500);
    cy.get('body').trigger('mousemove');
    cy.wait(500);
    cy.get('body').trigger('mouseup').dblclick();
    cy.wait(500);

    cy.get('#elementName').type('DeliveryCanceled')
    cy.get('.v-btn__content').eq(6).click({force: true})

    cy.get('body').trigger('mousedown', { which: 1 }) 
    cy.wait(500);
    cy.get('body').trigger('mousemove', { pageX: 900, pageY: 415 });
    cy.wait(500);
    cy.get('body').trigger('mouseup', { pageX: 900, pageY: 415 });
    cy.wait(1000);

    // Command
    cy.get('.cp-sticker').eq(1).trigger('mousedown', { which: 1 }) 
    cy.wait(500);
    cy.get('body').trigger('mousemove');
    cy.wait(500);
    cy.get('body').trigger('mouseup').dblclick();
    cy.wait(500);

    cy.get('#elementName').type('order')
    cy.get('.v-btn__content').eq(6).click({force: true})

    cy.get('body').trigger('mousedown', { which: 1 }) 
    cy.wait(500);
    cy.get('body').trigger('mousemove', { pageX: 220, pageY: 300 });
    cy.wait(500);
    cy.get('body').trigger('mouseup', { pageX: 220, pageY: 300 });
    cy.wait(1000);


    cy.get('.cp-sticker').eq(1).trigger('mousedown', { which: 1 }) 
    cy.wait(500);
    cy.get('body').trigger('mousemove');
    cy.wait(500);
    cy.get('body').trigger('mouseup').dblclick();
    cy.wait(500);

    cy.get('#elementName').type('cancel')
    cy.get('.v-btn__content').eq(6).click({force: true})

    cy.get('body').trigger('mousedown', { which: 1 }) 
    cy.wait(500);
    cy.get('body').trigger('mousemove', { pageX: 220, pageY: 415 });
    cy.wait(500);
    cy.get('body').trigger('mouseup', { pageX: 220, pageY: 415 });
    cy.wait(1000);


    // Policy
    cy.get('.cp-sticker').eq(2).trigger('mousedown', { which: 1 }) 
    cy.wait(500);
    cy.get('body').trigger('mousemove');
    cy.wait(500);
    cy.get('body').trigger('mouseup').dblclick();
    cy.wait(500);

    cy.get('#elementName').type('start delivery')
    cy.get('.v-btn__content').eq(6).click({force: true})

    cy.get('body').trigger('mousedown', { which: 1 }) 
    cy.wait(500);
    cy.get('body').trigger('mousemove', { pageX: 715, pageY: 300 });
    cy.wait(500);
    cy.get('body').trigger('mouseup', { pageX: 715, pageY: 300 });
    cy.wait(1000);

    cy.get('.cp-sticker').eq(2).trigger('mousedown', { which: 1 }) 
    cy.wait(500);
    cy.get('body').trigger('mousemove');
    cy.wait(500);
    cy.get('body').trigger('mouseup').dblclick();
    cy.wait(500);

    cy.get('#elementName').type('cancel delivery')
    cy.get('.v-btn__content').eq(6).click({force: true})

    cy.get('body').trigger('mousedown', { which: 1 }) 
    cy.wait(500);
    cy.get('body').trigger('mousemove', { pageX: 715, pageY: 415 });
    cy.wait(500);
    cy.get('body').trigger('mouseup', { pageX: 715, pageY: 415 });
    cy.wait(1000);

    // Actor

    // cy.get('.cp-sticker').eq(10).trigger('mousedown', { which: 1 }) 
    // cy.wait(500);
    // cy.get('body').trigger('mousemove');
    // cy.wait(500);
    // cy.get('body').trigger('mouseup').dblclick();
    // cy.wait(500);

    // cy.get('#elementName').type('customer')
    // cy.get('.v-btn__content').eq(6).click({force: true})

    // cy.get('body').trigger('mousedown', { which: 1 }) 
    // cy.wait(500);
    // cy.get('body').trigger('mousemove', { pageX: 125, pageY: 300 });
    // cy.wait(500);
    // cy.get('body').trigger('mouseup', { pageX: 125, pageY: 300 });
    // cy.wait(1000);


    // cy.get('.cp-sticker').eq(10).trigger('mousedown', { which: 1 }) 
    // cy.wait(500);
    // cy.get('body').trigger('mousemove');
    // cy.wait(500);
    // cy.get('body').trigger('mouseup').dblclick();
    // cy.wait(500);

    // cy.get('#elementName').type('customer')
    // cy.get('.v-btn__content').eq(6).click({force: true})

    // cy.get('body').trigger('mousedown', { which: 1 }) 
    // cy.wait(500);
    // cy.get('body').trigger('mousemove', { pageX: 125, pageY: 415 });
    // cy.wait(500);
    // cy.get('body').trigger('mouseup', { pageX: 125, pageY: 415 });
    // cy.wait(1000);


    // Aggregate
    cy.get('.cp-sticker').eq(3).trigger('mousedown', { which: 1 }) 
    cy.wait(500);
    cy.get('body').trigger('mousemove');
    cy.wait(500);
    cy.get('body').trigger('mouseup').dblclick();
    cy.wait(500);

    cy.get('#elementName').type('Order')
    cy.get('.attribute-name').type('userId{enter}');
    cy.get('.attribute-name').type('productId{enter}');
    cy.get('.attribute-name').type('productName{enter}');
    // cy.get('.mr-2').eq(4).click();
    // cy.wait(500);
    // cy.get('.cp-save-button').click();    
    cy.get('.v-btn__content').eq(6).click({force: true})

    cy.get('body').trigger('mousedown', { which: 1 }) 
    cy.wait(500);
    cy.get('body').trigger('mousemove', { pageX: 313, pageY: 370 });
    cy.wait(500);
    cy.get('body').trigger('mouseup', { pageX: 313, pageY: 370 });
    cy.wait(1000);


    cy.get('.cp-sticker').eq(3).trigger('mousedown', { which: 1 }) 
    cy.wait(500);
    cy.get('body').trigger('mousemove');
    cy.wait(500);
    cy.get('body').trigger('mouseup').dblclick();
    cy.wait(500);

    cy.get('#elementName').type('Delivery')
    cy.get('.attribute-name').type('orderId{enter}');
    cy.get('.attribute-name').type('userId{enter}');
    cy.get('.attribute-name').type('productId{enter}');
    cy.get('.attribute-name').type('productName{enter}');
    // cy.get('.mr-2').eq(4).click();
    // cy.wait(500);
    // cy.get('.cp-save-button').click();    
    cy.get('.v-btn__content').eq(6).click({force: true})

    cy.get('body').trigger('mousedown', { which: 1 }) 
    cy.wait(500);
    cy.get('body').trigger('mousemove', { pageX: 808, pageY: 370 });
    cy.wait(500);
    cy.get('body').trigger('mouseup', { pageX: 808, pageY: 370 });
    cy.wait(1000);


    // BoundedContext
    cy.get('.cp-sticker').eq(8).trigger('mousedown', { which: 1 }) 
    cy.wait(500);
    cy.get('body').trigger('mousemove');
    cy.wait(500);
    cy.get('body').trigger('mouseup').dblclick();
    cy.wait(500);

    cy.get('#elementName').clear().type('order')
    cy.get('.v-btn__content').eq(6).click({force: true})

    cy.get('body').trigger('mousedown', { which: 1 }) 
    cy.wait(500);
    cy.get('body').trigger('mousemove', { pageX: 283, pageY: 340 });
    cy.wait(500);
    cy.get('body').trigger('mouseup', { pageX: 283, pageY: 340 });
    cy.wait(1000);

    cy.get('.cp-sticker').eq(8).trigger('mousedown', { which: 1 }) 
    cy.wait(500);
    cy.get('body').trigger('mousemove');
    cy.wait(500);
    cy.get('body').trigger('mouseup').dblclick();
    cy.wait(500);

    cy.get('#elementName').clear().type('delivery')
    cy.get('.v-btn__content').eq(6).click({force: true})

    cy.get('body').trigger('mousedown', { which: 1 }) 
    cy.wait(500);
    cy.get('body').trigger('mousemove', { pageX: 808, pageY: 340 });
    cy.wait(500);
    cy.get('body').trigger('mouseup', { pageX: 808, pageY: 340 });
    cy.wait(1000);

    // Relations
    cy.clickAt(220, 300);
    cy.wait(500);
    cy.clickAt(280, 346);
    cy.wait(500);
    cy.clickAt(405, 300);
    cy.wait(2000);

    cy.clickAt(220, 415);
    cy.wait(500);
    cy.clickAt(280, 458);
    cy.wait(500);
    cy.clickAt(405, 415);
    cy.wait(2000);

    cy.clickAt(405, 300);
    cy.wait(500);
    cy.clickAt(464, 346);
    cy.wait(500);
    cy.clickAt(715, 300);
    cy.wait(2000);

    cy.clickAt(405, 415);
    cy.wait(500);
    cy.clickAt(464, 458);
    cy.wait(500);
    cy.clickAt(715, 415);
    cy.wait(2000);

    cy.get('.cp-es-save-btn').click();
    // 테스트때마다 변경필요.
    cy.contains('label', '* Definition ID(Unique ID)').next('input').clear({force:true}).type('modeling-test21');
    cy.wait(1000);
    cy.get('.cp-es-dialog-save').click();
    cy.wait(8000);

    cy.get('.cp-panel-folding').click();
    cy.wait(1000);

    cy.get('.cp-es-share-btn').click();
    cy.contains('label', 'User to invite').next('input').type('rbtn110@gmail.com{enter}');
    cy.wait(1000);
    cy.get('.cp-es-apply-btn').click();
    cy.wait(5000);
  })
})

