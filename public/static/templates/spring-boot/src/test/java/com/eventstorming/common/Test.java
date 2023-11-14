forEach: Rules
fileName: {{ruleName}}StepDefinition.java
path: {{boundedContext.name}}/src/test/java/{{options.package}}/common
---
package {{options.package}}.common;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import static org.assertj.core.api.Assertions.assertThat;

public class {{#makeTitle ruleName}}{{/makeTitle}}StepDefinition {
    
    {{givenValue.namePascalCase}} {{givenValue.nameCamelCase}} = new {{givenValue.namePascalCase}}();
    {{thenValue.namePascalCase}} {{thenValue.nameCamelCase}} = new {{thenValue.namePascalCase}}();
    {{aggregate.namePascalCase}} {{aggregate.nameCamelCase}} = new {{aggregate.namePascalCase}}();

    @Given("{{givenValue.name}} \\\{{#makeGivenAtt attributes}}{{/makeGivenAtt}} is published and {{aggregate.name}} \\\{{#makeAggAtt attributes}}{{/makeAggAtt}}is present")
    public void {{givenValue.name}}_is_published_and_{{aggregate.name}}_is_present({{#makeGivenParam attributes}}{{/makeGivenParam}}){
      {{#givenValue}}
      {{#fieldDescriptors}}
      // {{../nameCamelCase}}.set{{namePascalCase}}();
      {{/fieldDescriptors}}
      {{/givenValue}}
      {{#aggregate}}
      {{#aggregateRoot.fieldDescriptors}}
      // {{../nameCamelCase}}.set{{namePascalCase}}();
      {{/aggregateRoot.fieldDescriptors}}
      {{/aggregate}}
    }
    @When("{{whenValue.name}}")
    public void {{whenValue.name}}(){
        {{aggregate.nameCamelCase}}.{{whenValue.name}}();
    }
    @Then("{{thenValue.name}} \\\{{#makeThenAtt attributes}}{{/makeThenAtt}} should publish")
    public void {{thenValue.name}}_should_publish({{#makeThenParam attributes}}{{/makeThenParam}}){
      {{#thenValue}}
      {{#fieldDescriptors}}
      // {{../nameCamelCase}}.set{{namePascalCase}}();
      {{/fieldDescriptors}}
      {{/thenValue}}
    }

}

<function>
window.$HandleBars.registerHelper('getAttName', function(attName){
    if(!attName)
        return
    var name = attName.split('.')
    return name[0]    
})
window.$HandleBars.registerHelper('makeTitle', function(ruleName){
  if(!ruleName)
    return
  var name = ruleName.split(" ")
  var newName = ""
  for(var i = 0 ; i<name.length; i++){
    newName += name[i]
  }
  return newName;
})
window.$HandleBars.registerHelper('makeGivenParam', function (attributes) {
  if(attributes.length == 0){
      return
  }

  var s = ""
  var atts = attributes[0]
  
  for(var i =0; i<atts.givenAtt.length; i++){
      var now = atts.givenAtt[i].attKey
      s = s + "String "+now+", "
  }    
  
  for(var i=0; i<atts.aggregateAtt.length; i++){
    var now = atts.aggregateAtt[i].attKey
    if(i == atts.aggregateAtt.length-1)
      s = s + "String "+now
    else
      s = s + "String "+now+", "
  }
  
  return s
});

window.$HandleBars.registerHelper('makeThenParam', function (attributes) {
  if(attributes.length == 0){
      return
  }

  var s = ""
  var atts = attributes[0]
  
  for(var i=0; i<atts.thenAtt.length; i++){
    var now = atts.thenAtt[i].attKey
    if(i == atts.thenAtt.length-1)
      s = s + "String "+now
    else
      s = s + "String "+now+", "
  }
  
  return s
});

window.$HandleBars.registerHelper('makeGivenAtt', function (attributes) {
  if(attributes.length == 0){
      return
  }

  var s = "( "
  var atts = attributes[0]
  
  for(var i =0; i<atts.givenAtt.length; i++){
      var now = atts.givenAtt[i].attKey
      s = s + "{string} "
  }    
  s+=')'
  
  return s
});
window.$HandleBars.registerHelper('makeAggAtt', function (attributes) {
  if(attributes.length == 0){
      return
  }

  var s = "( "
  var atts = attributes[0]
  
  for(var i =0; i<atts.aggregateAtt.length; i++){
      var now = atts.aggregateAtt[i].attKey
      s = s + "{string} "
  }    
  s+=')'
  
  return s
});
window.$HandleBars.registerHelper('makeThenAtt', function (attributes) {
  if(attributes.length == 0){
      return
  }

  var s = "( "
  var atts = attributes[0]
  
  for(var i =0; i<atts.thenAtt.length; i++){
      var now = atts.thenAtt[i].attKey
      s = s + "{string} "
  }    
  s+=')'
  
  return s
});

window.$HandleBars.registerHelper('comma', function (name, fieldDescriptors) {
    var route = "";
    for(var i = 0; i<fieldDescriptors.length; i++){
      if(i == fieldDescriptors.length-1){
        route = route + "String " +name+"_"+fieldDescriptors[i].nameCamelCase
      }
      else{
        route = route + "String " +name+"_"+fieldDescriptors[i].nameCamelCase + ", "
      }
    }

    return route
    
});
</function>