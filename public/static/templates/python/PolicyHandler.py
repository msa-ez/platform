forEach: BoundedContext
fileName: PolicyHandler.py
path: {{name}}
---
import util
{{#aggregates}}
import {{namePascalCase}}DB
from {{namePascalCase}} import {{namePascalCase}}
{{nameCamelCase}}repository = {{namePascalCase}}DB.repository

{{/aggregates}}

{{#policies}}
{{#relationEventInfo}}
from {{eventValue.namePascalCase}} import {{eventValue.namePascalCase}}

def whenever{{eventValue.namePascalCase}}_{{../namePascalCase}}(data):
    event = {{eventValue.namePascalCase}}()
    event = util.AutoBinding(data, event)
    
    {{#../../aggregates}}
    {{nameCamelCase}} = {{namePascalCase}}()
    {{nameCamelCase}}repository.save({{nameCamelCase}})
    {{/../../aggregates}}
    
{{/relationEventInfo}}
{{/policies}}

