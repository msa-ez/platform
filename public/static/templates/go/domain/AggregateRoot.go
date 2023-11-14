forEach: Aggregate
fileName: {{namePascalCase}}.go
path: {{boundedContext.name}}/{{boundedContext.name}}
---
package {{boundedContext.name}}

import (
	"gopkg.in/jeevatkm/go-model.v1"
	
	"gorm.io/gorm"
	"fmt"
	"{{boundedContext.name}}/external"
)

//<<< DDD / Aggregate
type {{namePascalCase}} struct {
	gorm.Model
	{{#aggregateRoot.fieldDescriptors}}
    {{#isKey}}
	{{namePascalCase}} int `gorm:"primaryKey" json:"id" type:"int"`
	{{/isKey}}
	{{^isKey}}
	{{#isVO}}
	{{namePascalCase}} {{#typeCheck className}} {{/typeCheck}}
	{{/isVO}}
	{{^isVO}}
	{{#checkRelations ../aggregateRoot.entities.relations className namePascalCase nameCamelCase}}{{/checkRelations}}
	{{/isVO}}
	{{/isKey}}
	{{/aggregateRoot.fieldDescriptors}}

}

{{#lifeCycles}}
func (self *{{../namePascalCase}}) on{{trigger}}() (err error){
	{{#events}}
	{{nameCamelCase}} := New{{namePascalCase}}()
	model.Copy({{nameCamelCase}}, self)

	{{#relationCommandInfo}}
		{{#commandValue}}
	{{aggregate.nameCamelCase}} := &external.{{aggregate.namePascalCase}}{}
	resp, err := external.{{namePascalCase}}(*{{aggregate.nameCamelCase}})
	if err != nil {
		return err
	}
	fmt.Println(resp)
		{{/commandValue}}
	{{/relationCommandInfo}}
	Publish({{nameCamelCase}} , {{nameCamelCase}}.EventType)
	{{/events}}

	{{#commands}}
		{{#relationCommandInfo}}
			{{#commandValue}}
	// Get request from {{aggregate.namePascalCase}}
	{{aggregate.nameCamelCase}} := &external.{{aggregate.namePascalCase}}{}
	resp ,err := external.Get{{aggregate.namePascalCase}}({{aggregate.nameCamelCase}}.{{aggregate.keyFieldDescriptor.namePascalCase}})
	if err != nil {
		return err
	}
	fmt.Println(resp)

			{{/commandValue}}
		{{/relationCommandInfo}}
	{{/commands}}
	return nil
}
{{/lifeCycles}}
{{#lifeCyclesUnExists lifeCycles namePascalCase}}
{{/lifeCyclesUnExists}}

//<<< Clean Arch / Port Method
{{#commands}}
{{^isRestRepository}}
func (self *{{../namePascalCase}}) {{namePascalCase}}({{#if (has fieldDescriptors)}}{{nameCamelCase}}Command *{namePascalCase}}Command{{/if}}){
	{{#triggerByCommand}}
	{{eventValue.nameCamelCase}} := New{{eventValue.namePascalCase}}()
	model.Copy({{eventValue.nameCamelCase}}, self)
	Publish({{eventValue.nameCamelCase}}, {{nameCamelCase}}.EventType)
	{{#relationCommandInfo}}
	{{#commandValue}}
	//Following code causes dependency to external APIs
	// it is NOT A GOOD PRACTICE. instead, Event-Policy mapping is recommended.
	{{aggregate.nameCamelCase}} := &external.{{aggregate.namePascalCase}}{}
	resp, err := external.Get{{aggregate.namePascalCase}}({{aggregate.nameCamelCase}}.{{aggregate.keyFieldDescriptor.namePascalCase}})
	if err != nil {
		fmt.Println(err.Error())
	}
	fmt.Println(resp)
	{{/commandValue}}
	{{/relationCommandInfo}}
	{{/triggerByCommand}}
}
{{/isRestRepository}}
{{/commands}}

{{#policyList}}
{{#relationEventInfo}}
func {{../namePascalCase}}({{eventValue.nameCamelCase}} *{{eventValue.namePascalCase}}){
	/** Example 1:  new item
	{{../../nameCamelCase}} := &{{../../namePascalCase}}{}
	{{../../nameCamelCase}}repository.save({{../../nameCamelCase}})

	{{#../relationExampleEventInfo}}
	{{eventValue.nameCamelCase}} := New{{eventValue.namePascalCase}}()
	model.Copy({{eventValue.nameCamelCase}}, {{../../../nameCamelCase}})
	Publish({{eventValue.nameCamelCase}}, {{nameCamelCase}}.EventType)
	{{/../relationExampleEventInfo}}
	*/

	/** Example 2:  finding and process
	id, _ := strconv.ParseInt({{eventValue.nameCamelCase}}.id, 10, 64)
	{{../../nameCamelCase}}, err := {{../../nameCamelCase}}repository().FindById(int(id))
	if err != nil {

	}
	*/
}
{{/relationEventInfo}}
{{/policyList}}

//>>> Clean Arch / Port Method
//>>> DDD / Aggregate

<function>
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
		else if(className.endsWith("Boolean")){
			return "bool"
		}
		else if(className.endsWith("Double")){
			return "float64"
		}
		else if(className.endsWith("BigDicimal")){
			return "float64"
		}
		else {
			return className
		}
		
    });

	window.$HandleBars.registerHelper('lifeCyclesUnExists', function(lifeCycles, namePascalCase){
		var lc_map = new Map();
		lc_map.set('PrePersist', 'first');
		lc_map.set('PostPersist', 'first');
		lc_map.set('PreUpdate', 'first');
		lc_map.set('PostUpdate', 'first');
		lc_map.set('PreRemove', 'first');
		lc_map.set('PostRemove', 'first');

		var namePascalCase;
		for(var ele in lifeCycles){
			lc_map.delete(lifeCycles[ele]['trigger'])
		}

		var text = ''
		lc_map.forEach(function (item, key, mapObj) {
			text += 'func (self *'+namePascalCase+') on' + key + '() (err error){ return nil }\n'
		});

		return text
	})

	window.$HandleBars.registerHelper('has', function (members) {
		try {
			return (members.length > 0);
		} catch(e) {
			console.log(e)
		}
	});


	window.$HandleBars.registerHelper('checkRelations', function (relations, className, namePascalCase, nameCamelCase) {
		try {
			if(typeof relations === "undefined") {
				return
			} else {
				// primitive type
				if(className.includes("String") || className.includes("Integer") || className.includes("Long") || className.includes("Double") || className.includes("Float")
						|| className.includes("Boolean") || className.includes("Date")) {
					var changeClass
						if(className.endsWith("String")){
							changeClass = "string"
						}
						else if(className.endsWith("Integer")){
							changeClass =  "int"
						}
						else if(className.endsWith("Float")){
							changeClass =  "float64"
						}
						else if(className.endsWith("Long")){
							changeClass =  "int"
						}
						else if(className.endsWith("Boolean")){
							changeClass =  "bool"
						}
						else if(className.endsWith("Double")){
							changeClass =  "int"
						}
					return ""+namePascalCase+" "+changeClass+" `json:\""+nameCamelCase+"\"`"
				} else {
					for(var i = 0; i < relations.length; i ++ ) {
						if(relations[i] != null) {
							if(className.includes(relations[i].targetElement.name) && !relations[i].relationType.includes("Generalization")) {
								// Enumeration
								if(relations[i].targetElement._type.endsWith('enum') || relations[i].targetElement._type.endsWith('Exception')) {
									return
								}
								// complex type
								if(relations[i].sourceMultiplicity == "1" &&
										(relations[i].targetMultiplicity == "1..n" || relations[i].targetMultiplicity == "0..n") || className.includes("List")
								) {
									var returnStr = ''
									returnStr += "// @OneToMany - foreignKey check plz \n "
									returnStr += "\t"+namePascalCase+" []"+className+" `gorm:\"foreignKey:id\" json:\""+nameCamelCase+"\"`"
									return returnStr

								} else if((relations[i].sourceMultiplicity == "1..n" || relations[i].sourceMultiplicity == "0..n") && relations[i].targetMultiplicity == "1"){
									var returnStr = ''
									returnStr += "// @ManyToOne - source struct check foreignKey \n "
									returnStr += "\t"+namePascalCase+" "+className+" `json:\""+nameCamelCase+"\"`"
									return returnStr
								} else if(relations[i].sourceMultiplicity == "1" && relations[i].targetMultiplicity == "1"){
									var returnStr = ''
									returnStr += "// @OneToOne - foreignKey check plz \n "
									returnStr += "\t"+namePascalCase+" "+className+" `gorm:\"foreignKey:id\" json:\""+nameCamelCase+"\"`"
									return returnStr

								} else if((relations[i].sourceMultiplicity == "1..n" || relations[i].sourceMultiplicity == "0..n") &&
										(relations[i].targetMultiplicity == "1..n" || relations[i].targetMultiplicity == "0..n") || className.includes("List")
								) {
									var sourceName = relations[i].sourceElement.nameCamelCase;
									var targetName = relations[i].targetElement.nameCamelCase;
									var returnStr = ''
									returnStr += "// @ManyToMany - many2many:source_target check plz \n "
									returnStr += "\t"+namePascalCase+" []"+className+" `gorm:\"many2many:"+sourceName+"_"+targetName+"\" json:\""+nameCamelCase+"\"`"
									return returnStr
								}
							}
						}
					}
					if(referenceClass) {
						return "@OneToOne"
					}
				}
			}
		} catch (e) {
			console.log(e)
		}
	});
</function>