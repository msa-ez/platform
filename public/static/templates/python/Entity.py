forEach: Aggregate
fileName: {{namePascalCase}}.py
path: {{boundedContext.name}}
---
from sqlalchemy.ext.declarative import declarative_base 
from sqlalchemy import Column, String, Integer, event, Float, Boolean
from datetime import datetime

import util
{{#events}}
from {{namePascalCase}} import {{namePascalCase}}
{{#relationCommandInfo}}
{{#commandValue}}
from external.{{aggregate.namePascalCase}} import {{aggregate.namePascalCase}}
from external.{{aggregate.namePascalCase}}Service import {{namePascalCase}}
{{/commandValue}}
{{/relationCommandInfo}}
{{/events}}

Base = declarative_base()

class {{namePascalCase}}(Base):
    __tablename__ = '{{namePascalCase}}_table'
    {{#aggregateRoot.fieldDescriptors}}
    {{#isKey}}
    {{nameCamelCase}} = Column(Integer, primary_key=True)
    {{/isKey}}
    {{^isKey}}
    {{nameCamelCase}} = Column({{#typeCheckinEntity className}}{{/typeCheckinEntity}})
    {{/isKey}}
    {{/aggregateRoot.fieldDescriptors}}

    def __init__(self):
        {{#aggregateRoot.fieldDescriptors}}
        self.{{nameCamelCase}} = None
        {{/aggregateRoot.fieldDescriptors}}

{{#lifeCycles}}
@event.listens_for({{../namePascalCase}}, '{{#triggerCheck trigger}}{{/triggerCheck}}')
def {{trigger}}(mapper, connection, target):
    {{#events}}
    event = {{namePascalCase}}()
    event = util.AutoBinding(target, event)

    event.Publish()
    
    {{#relationCommandInfo}}
    {{#commandValue}}
    {{aggregate.nameCamelCase}} = {{aggregate.namePascalCase}}()
    response = {{namePascalCase}}({{aggregate.nameCamelCase}})

    print(response)
    {{/commandValue}}
    {{/relationCommandInfo}}
    {{/events}}

    
{{/lifeCycles}}


<function>
    window.$HandleBars.registerHelper('switch', function(className, options){
        this.switch_value = className;
        return options.fn(this)
    });
    window.$HandleBars.registerHelper('case', function(value, options){
        if(value == this.switch_value){
            return options.fn(this)
        }
    })
    window.$HandleBars.registerHelper('typeCheckinEntity', function (className) {
        if(className.endsWith("String")){
            return "String(50)"
        }
		else if(className.endsWith("Integer")){
			return "Integer"
		}
		else if(className.endsWith("Float")){
			return "Float"
		}
		else if(className.endsWith("Long")){
			return "Integer"
		}
		else if(className.endsWith("Boolean")){
			return "Boolean"
		}
		else if(className.endsWith("Double")){
			return "Float"
		}
		
    });

    window.$HandleBars.registerHelper('triggerCheck', function (trigger) {
        if(trigger.endsWith("PreRemove")){
            return "before_delete"
        }
        else if(trigger.endsWith("PostRemove")){
            return "after_delete"
        }
		else if(trigger.endsWith("PrePersist")){
			return "before_insert"
		}
		else if(trigger.endsWith("PostPersist")){
			return "after_insert"
		}
		else if(trigger.endsWith("PreUpdate")){
			return "before_update"
		}
		else{
			return "after_update"
		}
    });
    window.$HandleBars.registerHelper('commandValueExists', function(events, options){
		for(var ele in events){
			if(events[ele]['relationCommandInfo'].length!=0){
				return options.fn(this)
			}
		}
		return options.inverse(this)
		
	})
</function>