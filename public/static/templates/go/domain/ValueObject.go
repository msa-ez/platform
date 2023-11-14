forEach: ValueObject
fileName: {{namePascalCase}}.go
path: {{boundedContext.name}}/{{boundedContext.name}}
---
package {{boundedContext.name}}

{{#setDiscriminator relations nameCamelCase}}{{/setDiscriminator}}
type {{namePascalCase}} struct {
    {{#fieldDescriptors}}
    {{namePascalCase}} {{#typeCheck className}} {{/typeCheck}} `json:"{{nameCamelCase}}"`
    {{/fieldDescriptors}}
}

<function>
window.$HandleBars.registerHelper('typeCheck', function (className) {
    if(className.endsWith("String")){
        return "string"
    }
    else if(className.endsWith("Integer")){
        return "int"
    }
    else if(className.endsWith("Float")){
        return "float64"
    }
    else if(className.endsWith("Long")){
        return "int"
    }
    else if(className.endsWith("Boolean")){
        return "bool"
    }
    else if(className.endsWith("Double")){
        return "int"
    }

});

</function>