forEach: RelationEventInfo
fileName: {{eventValue.namePascalCase}}.js
path: {{boundedContext.name}}/event
---
const AbstractEvent = require('./AbstractEvent');

class {{eventValue.namePascalCase}} extends AbstractEvent{
    constructor(){
        super();
        {{#eventValue.fieldDescriptors}}
        this.{{nameCamelCase}} = null;
        {{/eventValue.fieldDescriptors}}
    }
}

module.exports = {{eventValue.namePascalCase}};
