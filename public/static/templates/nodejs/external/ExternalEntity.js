forEach: RelationCommandInfo
fileName: {{commandValue.aggregate.namePascalCase}}.js
path: {{boundedContext.name}}/external
---
{{#commandValue.aggregate}}
class {{namePascalCase}}{
    constructor(){
        {{#aggregateRoot.fieldDescriptors}}
        this.{{nameCamelCase}} = null;
        {{/aggregateRoot.fieldDescriptors}}
    }
}

module.exports = {{namePascalCase}};
{{/commandValue.aggregate}}

