forEach: View
representativeFor: View
fileName: {{namePascalCase}}ViewHandler.go
path: {{boundedContext.name}}/{{boundedContext.name}}
mergeType: template
---
package {{boundedContext.name}}

import (
	"github.com/mitchellh/mapstructure"
	"log"
)

//<<< EDA / CQRS

{{#createRules}}
func when{{when.namePascalCase}}_then_{{operation}}_{{_index}} (inputEvent map[string]interface{}) {

	{{when.nameCamelCase}} := New{{when.namePascalCase}}()
	mapstructure.Decode(inputEvent, &{{when.nameCamelCase}})

	{{../nameCamelCase}} := &{{../namePascalCase}}{}
	{{#fieldMapping}}
	{{../../nameCamelCase}}.{{viewField.namePascalCase}} = {{../when.nameCamelCase}}.{{eventField.namePascalCase}}
	{{/fieldMapping}}

	// view 레파지 토리에 save
	repository := {{../namePascalCase}}Repository()
	err := repository.save({{../nameCamelCase}})
	if err != nil {
		// TODO error control
		log.Printf("Create error: %v \n", err)
	}
}
{{/createRules}}

{{#updateRules}}
func when{{when.namePascalCase}}_then_{{operation}}_{{_index}} (inputEvent map[string]interface{}) {

	{{when.nameCamelCase}} := New{{when.namePascalCase}}()
	mapstructure.Decode(inputEvent,&{{when.nameCamelCase}})

	var {{../nameCamelCase}}s []{{../namePascalCase}}
	repository := {{../namePascalCase}}Repository()
	{{#where}}
	// FIXME geom lib define snake_case as column name (eg: user_id), so if your query column is 'userId' then change 'user_id'
	err := repository.db.Where("{{viewField.nameCamelCase}} = ?", {{../when.nameCamelCase}}.{{eventField.namePascalCase}}).Find(&{{../../nameCamelCase}}s).Error
	if err != nil {
		// TODO error control
		log.Printf("Select error: %v \n", err)
	}
	for _, viewEntity := range {{../../nameCamelCase}}s {
		{{#../fieldMapping}}
		viewEntity.{{viewField.namePascalCase}} = {{../../when.nameCamelCase}}.{{eventField.namePascalCase}}
		{{/../fieldMapping}}
		err1 := repository.db.Updates(viewEntity).Error
		if err1 != nil {
			// TODO error control
			log.Printf("Update error: %v \n", err1)
		}
	}
	{{/where}}
}
{{/updateRules}}

{{#deleteRules}}
func when{{when.namePascalCase}}_then_{{operation}}_{{_index}} (inputEvent map[string]interface{}) {
	{{when.nameCamelCase}} := New{{when.namePascalCase}}()
	mapstructure.Decode(inputEvent,&{{when.nameCamelCase}})

	var {{../nameCamelCase}}s []{{../namePascalCase}}
	repository := {{../namePascalCase}}Repository()
	{{#where}}
	// FIXME geom lib define snake_case as column name (eg: user_id), so if your query column is 'userId' then change 'user_id'
	err := repository.db.Where("{{viewField.nameCamelCase}} = ?", {{../when.nameCamelCase}}.{{eventField.namePascalCase}}).Find(&{{../../nameCamelCase}}s).Error
	if err != nil {
		// TODO error control
		log.Printf("Select error: %v \n", err)
	}
	for _, viewEntity := range {{../../nameCamelCase}}s {
		err1 := repository.db.Delete(viewEntity).Error
		if err1 != nil {
			// TODO error control
			log.Printf("Delete error: %v \n", err1)
		}
	}
	{{/where}}
}
{{/deleteRules}}

//>>> EDA / CQRS
