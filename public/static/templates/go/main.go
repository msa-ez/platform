forEach: BoundedContext
fileName: main.go
path: {{name}}
---
package main

import(
	"log"
	"{{name}}/{{name}}"
	"{{name}}/config"
)

func main() {
	config.ConfigMode()
	options := config.Reader(config.GetMode())
	log.Printf("option : %v", options)
	{{#aggregates}}
	{{../name}}.{{namePascalCase}}DBInit()
	{{/aggregates}}
	{{#views}}
	{{../name}}.{{namePascalCase}}DBInit()
	{{/views}}
	go {{name}}.InitProducer(config.GetMode())
	{{#policyExists policies}}
	// view 와 같이 사용시 InitConsumer 가 중복으로 호출될수 있으니, 하나는 삭제 필요
	go {{name}}.InitConsumer(config.GetMode())
	{{/policyExists}}
	{{^policyExists policies}}
	{{/policyExists}}
	{{#views}}
	// policy 와 같이 사용시 InitConsumer 가 중복으로 호출될수 있으니, 하나는 삭제 필요
	go {{../name}}.InitConsumer(config.GetMode())
	{{/views}}
	e := {{name}}.RouteInit()

	e.Logger.Fatal(e.Start(":{{portGenerated}}"))
}

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
