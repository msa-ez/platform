forEach: RelationEventInfo
fileName: {{eventValue.namePascalCase}}.go
path: {{boundedContext.name}}/{{boundedContext.name}}
---
package {{boundedContext.name}}

import (
	"time"
)

type {{eventValue.namePascalCase}} struct{
	EventType string	`json:"eventType" type:"string"`
	TimeStamp string 	`json:"timeStamp" type:"string"`
	{{#eventValue.fieldDescriptors}}
	{{namePascalCase}} {{#typeCheck className}} {{/typeCheck}} `json:"{{nameCamelCase}}" type:"{{#typeCheck className}}{{/typeCheck}}"` 
	{{/eventValue.fieldDescriptors}}
	
}

func New{{eventValue.namePascalCase}}() *{{eventValue.namePascalCase}}{
	event := &{{eventValue.namePascalCase}}{EventType:"{{eventValue.namePascalCase}}", TimeStamp:time.Now().String()}

	return event
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
			return "float64"
		}
		else if(className.endsWith("BigDicimal")){
			return "float64"
		}
		
    });
</function>