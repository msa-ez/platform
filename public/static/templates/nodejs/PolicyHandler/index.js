forEach: BoundedContext
fileName: index.js
path: {{name}}/PolicyHandler
---
const db = require('../models');
const util = require('../util/util');
{{#aggregates}}
{{nameCamelCase}}Repository = require('../repository/{{namePascalCase}}Repository')
{{/aggregates}}

{{#policies}}
{{#relationEventInfo}}
{{eventValue.nameCamelCase}} = require('../event/{{eventValue.namePascalCase}}')
{{/relationEventInfo}}
{{/policies}}

const policyhandler = {}

{{#policies}}
{{#relationEventInfo}}
function whenever{{eventValue.namePascalCase}}_{{../namePascalCase}}(event){
    entity = new db.{{../../namePascalCase}}();

    {{nameCamelCase}}Repository.save(entity).then(result=>{
        console.log(result.dataValue);
    })
}

policyhandler.whenever{{eventValue.namePascalCase}}_{{../namePascalCase}} = whenever{{eventValue.namePascalCase}}_{{../namePascalCase}};
{{/relationEventInfo}}
{{/policies}}



module.exports = policyhandler;