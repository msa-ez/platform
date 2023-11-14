forEach: Event
fileName: {{namePascalCase}}.py
path: {{boundedContext.name}}
---
from AbstractEvent import AbstractEvent
import json
from datetime import datetime

class {{namePascalCase}}(AbstractEvent):
    {{#fieldDescriptors}}
    {{nameCamelCase}} : {{#typeCheck className}}{{/typeCheck}}
    {{/fieldDescriptors}}
    
    def __init__(self):
        super().__init__()
        {{#fieldDescriptors}}
        self.{{nameCamelCase}} = None
        {{/fieldDescriptors}}


<function>
    window.$HandleBars.registerHelper('typeCheck', function (className) {
        if(className.endsWith("String")){
            return "str"
        }
		else if(className.endsWith("Integer")){
			return "int"
		}
		else if(className.endsWith("Float")){
			return "float"
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