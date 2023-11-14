forEach: BoundedContext
fileName: PolicyHandler.go
path: {{name}}/{{name}}
---
package {{name}}

{{#policyExists policies}}
import (
	"github.com/mitchellh/mapstructure"
)
{{/policyExists}}

//<<< EDA / Event Handler
{{#policies}}
{{#relationEventInfo}}
func whenever{{eventValue.namePascalCase}}_{{../namePascalCase}}(data map[string]interface{}){
	
	event := New{{eventValue.namePascalCase}}()
	mapstructure.Decode(data,&event)

	{{../namePascalCase}}(event);
}

{{/relationEventInfo}}
{{/policies}}
//>>> EDA / Event Handler

<function>
	window.$HandleBars.registerHelper('policyExists', function (policies, options) {
		if(Object.values(policies) != ""){
			return options.fn(this)
        }
        else{
            return options.inverse(this)
        }
		
	});
</function>