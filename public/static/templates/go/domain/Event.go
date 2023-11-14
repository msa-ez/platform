forEach: Event
fileName: {{namePascalCase}}.go
path: {{boundedContext.name}}/{{boundedContext.name}}
---
package {{boundedContext.name}}

import (
	"time"
)

//<<< DDD / Domain Event
type {{namePascalCase}} struct{
	EventType string	`json:"eventType" type:"string"`
	TimeStamp string 	`json:"timeStamp" type:"string"`
	{{#fieldDescriptors}}
	{{namePascalCase}} {{#typeCheck className}} {{/typeCheck}} `json:"{{nameCamelCase}}" type:"{{#typeCheck className}}{{/typeCheck}}"` 
	{{/fieldDescriptors}}
	
}

func New{{namePascalCase}}() *{{namePascalCase}}{
	event := &{{namePascalCase}}{EventType:"{{namePascalCase}}", TimeStamp:time.Now().String()}

	return event
}
//>>> DDD / Domain Event

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