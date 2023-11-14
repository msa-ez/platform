forEach: RelationCommandInfo
fileName: {{commandValue.aggregate.namePascalCase}}.go
path: {{boundedContext.name}}/external
---
package external

{{#commandValue.aggregate}}
type {{namePascalCase}} struct {
	{{#aggregateRoot.fieldDescriptors}}
    {{#isKey}}
	{{namePascalCase}} int `gorm:"primaryKey" json:"id" type:"int"`
	{{/isKey}}
	{{^isKey}}
	{{namePascalCase}} {{#typeCheck className}} {{/typeCheck}} `json:"{{nameCamelCase}}" type:"{{#typeCheck className}}{{/typeCheck}}"`
	{{/isKey}}
	{{/aggregateRoot.fieldDescriptors}}
}

func (self *{{namePascalCase}}) getPrimaryKey() int {
	// FIXME if PrimaryKey is multi value, than change this method
{{#aggregateRoot.fieldDescriptors}}
{{#isKey}}
	return self.{{namePascalCase}}
{{/isKey}}
{{/aggregateRoot.fieldDescriptors}}
}
{{/commandValue.aggregate}}

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
