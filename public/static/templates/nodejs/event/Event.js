forEach: Event
fileName: {{namePascalCase}}.js
path: {{boundedContext.name}}/event
---
const AbstractEvent = require('./AbstractEvent')

class {{namePascalCase}} extends AbstractEvent{
    constructor(){
        super();
        {{#fieldDescriptors}}
        this.{{nameCamelCase}} = null;
        {{/fieldDescriptors}}
    }
}

module.exports = {{namePascalCase}};