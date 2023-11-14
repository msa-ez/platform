forEach: RelationCommandInfo
fileName: {{commandValue.aggregate.namePascalCase}}.py
path: {{boundedContext.name}}/external
---
{{#commandValue.aggregate}}
class {{namePascalCase}}:
    {{#aggregateRoot.fieldDescriptors}}
    {{nameCamelCase}} : {{#typeCheck className}}{{/typeCheck}}
    {{/aggregateRoot.fieldDescriptors}}

    def __init__(self):
        {{#aggregateRoot.fieldDescriptors}}
        {{nameCamelCase}} = None
        {{/aggregateRoot.fieldDescriptors}}
{{/commandValue.aggregate}}

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