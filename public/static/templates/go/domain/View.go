forEach: View
representativeFor: View
fileName: {{namePascalCase}}.go
path: {{boundedContext.name}}/{{boundedContext.name}}
---
package {{boundedContext.name}}

//<<< EDA / CQRS / Read Model
type {{namePascalCase}} struct {
	{{#fieldDescriptors}}
	{{#isKey}}
	{{namePascalCase}} int `gorm:"primaryKey" json:"id" type:"int"`
	{{/isKey}}
	{{^isKey}}
	{{namePascalCase}} {{#typeCheck className}} {{/typeCheck}} `json:"{{nameCamelCase}}" type:"{{#typeCheck className}}{{/typeCheck}}"`
	{{/isKey}}
	{{/fieldDescriptors}}
}
//>>> EDA / CQRS / Read Model
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
			return "float64"
		}
		else if(className.endsWith("BigDicimal")){
			return "float64"
		}
		else {
			return className
		}

    });
</function>