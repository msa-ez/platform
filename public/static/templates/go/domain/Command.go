forEach: Command
representativeFor: Command
fileName: {{namePascalCase}}Command.go
path: {{boundedContext.name}}/{{boundedContext.name}}
except: {{#except fieldDescriptors}}{{/except}}
---
package {{boundedContext.name}}

type {{namePascalCase}}Command struct{
{{#fieldDescriptors}}
    {{#isKey}}
    {{namePascalCase}} {{#typeCheck className}} {{/typeCheck}} `gorm:"primaryKey" json:"{{nameCamelCase}}" type:"{{#typeCheck className}} {{/typeCheck}}"`
    {{/isKey}}
    {{^isKey}}
    {{namePascalCase}} {{#typeCheck className}} {{/typeCheck}} `json:"{{nameCamelCase}}" type:"{{#typeCheck className}}{{/typeCheck}}"`
    {{/isKey}}
{{/fieldDescriptors}}
}

<function>
window.$HandleBars.registerHelper('except', function (fieldDescriptors) {
    return (fieldDescriptors && fieldDescriptors.length == 0);
});

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
