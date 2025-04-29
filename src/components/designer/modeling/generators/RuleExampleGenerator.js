const JsonAIGenerator = require("./JsonAIGenerator");

class RuleExampleGenerator extends JsonAIGenerator {
    constructor(client){
        super(client);
    }

    createPrompt(){
        let rule = this.client.rule
        // let attrebutesFormat = JSON.stringify(this.client.ruleAttribute)

        var givenFields
        var givenAtt = ""
        var whenFields
        var whenAtt = ""
        var thenFields = ""
        var whenType = 'event'
        var givenElement = null
        var thenElement = []

        givenFields = rule.givenItems[0].name + ' {'+ '\n'
        rule.givenItems[0].aggregateRoot.fieldDescriptors.forEach(function (field){
            givenAtt = `${givenAtt}    ${field.className} ${field.name}\n`
        })
        givenFields = givenFields + givenAtt + '}'
        givenElement = rule.givenItems[0].aggregateRoot.entities.elements

        if(rule.whenItems[0]._type.includes("Command")){
            whenType = 'command'
        }
        whenFields = rule.whenItems[0].name + ' {'+ '\n'
        rule.whenItems[0].fieldDescriptors.forEach(function (field){
            whenAtt = `${whenAtt}    ${field.className} ${field.name}\n`
        })
        whenFields = whenFields + whenAtt + '}'

        rule.thenItems.forEach(function (item){
            var itemFields = ""
            var thenAtt = ""
            itemFields = item.name + ' {'+ '\n'

            if(item._type.includes("Aggregate")){
                item.aggregateRoot.fieldDescriptors.forEach(function (field){
                    thenAtt = `${thenAtt}    ${field.className} ${field.name}\n`
                })
            }else{
                item.fieldDescriptors.forEach(function (field){
                    thenAtt = `${thenAtt}    ${field.className} ${field.name}\n`
                })
            }
            
            itemFields = itemFields + thenAtt + '}\n' 
            thenFields = thenFields + itemFields
            if(item._type.includes("Aggregate")){
                thenElement.push(item.aggregateRoot.entities.elements)
            }else{
                thenElement.push(item)
            }
        })


        return `create example mappings for test. 

our business rule description is:

${rule.description}

If there is a request for results based on conditions, all results must be provided.

let's say we have this given, when, then :

given aggregate has following fields:
${givenFields}

when ${whenType} has following fields:
${whenFields}

then event has following fields:
${thenFields}

No matter what happens, all events within each field must be generated. 
Additionally, the value of each event must be generated as a generated value or as a default value (N/A).

given elements:
${JSON.stringify(givenElement)}

then elements:
${JSON.stringify(thenElement)}

Please refer to the given and then elements provided to generate values for fields or items.
If it is an enum class, one of the values ​​of the Items that the element has must be selected.
If it is a vo.Class, the value of the field of the element must be generated.

please generate the example mappings as json format below:
[
    {
        "given": [
            {
                "type": "Aggregate",
                "name": "${rule.givenItems[0].name}",
                "value": {
                    // example data here. example should be simple e.g. name: projectId, value: 1
                }
            }
        ],
        "when":[
            {
                "type": "Event",
                "name": "${rule.whenItems[0].name}",
                "value": {
                    // example data here. example should be simple e.g. name: projectId, value: 1
                }
            }
        ],
        "then":[
            {
                "type": "Event",
                "name": "then event name", // Name each event in thenFields
                "value": {
                    // example data here. example should be simple e.g. name: projectId, value: 1
                }
            },
        ]
    }
]`
// please generate more than 3 example mappings as json format below:
}
    createModel(text){
        let model = super.createModel(text)
        
        for(let i = 0; i < model.length; i++){
            if(!model[i].given){
                model[i].given = [{value:{}}]
            }
            if(!model[i].when){
                model[i].when = [{value:{}}]
            }
            if(!model[i].then){
                model[i].then = [{value:{}}]
            }
        }
        return model
    }


}


module.exports = RuleExampleGenerator;