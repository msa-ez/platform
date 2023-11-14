forEach: RelationCommandInfo
fileName: {{commandValue.namePascalCase}}Command.go
path: {{boundedContext.name}}/external
---
package external

type {{commandValue.namePascalCase}}Command struct {
{{#commandValue.fieldDescriptors}}
    {{#isKey}}
    {{/isKey}}
    {{namePascalCase}} {{#typeCheck className}} {{/typeCheck}} `json:"{{nameCamelCase}}"`
{{/commandValue.fieldDescriptors}}
}

<function>
window.$HandleBars.registerHelper('except', function (command) {
    if(command._type.endsWith('Command')) {
        return (command.fieldDescriptors && command.fieldDescriptors.length == 0);
    }
    return true;
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

    });

</function>
