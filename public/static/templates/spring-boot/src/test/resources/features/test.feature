forEach: Aggregate
fileName: {{name}}Test.feature
path: {{boundedContext.name}}/src/test/resources/features
---
Feature: {{name}}
{{#aggregateRules}}
    Scenario Outline: {{ruleName}}
        Given {{givenValue.name}} {{#getGivenAtt attributes}}{{/getGivenAtt}} is published and {{aggregate.name}} {{#getAggAtt attributes}}{{/getAggAtt}} is present
        When {{whenValue.name}}
        Then {{thenValue.name}} {{#getThenAtt attributes}}{{/getThenAtt}} should publish

        Examples:
            {{#getTableKey attributes}}{{/getTableKey}}
            {{#attributes}}
            |{{#aggregateAtt}}  {{attValue}}    |{{/aggregateAtt}}{{#givenAtt}} {{attValue}}  |{{/givenAtt}}{{#thenAtt}}  {{attValue}}  |{{/thenAtt}}
            {{/attributes}}
{{/aggregateRules}}



<function>
window.$HandleBars.registerHelper('getTableKey', function (attributes) {
    if(attributes.length == 0){
        return
    }
    
    var s = "|"
    var atts = attributes[0]
    
    
    for(var i =0; i<atts.aggregateAtt.length; i++){
        var now = atts.aggregateAtt[i].attKey
        s = s + "\t"+now+"\t|"
    }
    
    for(var i =0; i<atts.givenAtt.length; i++){
        var now = atts.givenAtt[i].attKey
        s = s + "\t"+now+"\t|"
    }
    for(var i =0; i<atts.thenAtt.length; i++){
        var now = atts.thenAtt[i].attKey
        s = s + "\t"+now+"\t|"
    }
    
    return s
});

window.$HandleBars.registerHelper('getGivenAtt', function (attributes) {
    if(attributes.length == 0){
        return
    }

    var s = "( "
    var open = '"<'
    var close = '>" '
    var atts = attributes[0]
    
    for(var i =0; i<atts.givenAtt.length; i++){
        var now = atts.givenAtt[i].attKey
        s = s + open+ now + close 
    }    
    s+=')'
    
    return s
});

window.$HandleBars.registerHelper('getAggAtt', function (attributes) {
    if(attributes.length == 0){
        return
    }

    var s = "( "
    var open = '"<'
    var close = '>" '
    var atts = attributes[0]
    
    for(var i =0; i<atts.aggregateAtt.length; i++){
        var now = atts.aggregateAtt[i].attKey
        s = s + open+ now + close 
    }    
    s+=')'
    
    return s
});

window.$HandleBars.registerHelper('getThenAtt', function (attributes) {
    if(attributes.length == 0){
        return
    }

    var s = "( "
    var open = '"<'
    var close = '>" '
    var atts = attributes[0]
    
    for(var i =0; i<atts.thenAtt.length; i++){
        var now = atts.thenAtt[i].attKey
        s = s + open+ now + close 
    }    
    s+=')'
    
    return s
});
</function>