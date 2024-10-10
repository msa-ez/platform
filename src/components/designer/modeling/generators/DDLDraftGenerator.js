const JsonAIGenerator = require("./JsonAIGenerator");
const VODefinitions = require("./VODefinitions");
//let partialParse = require('partial-json-parser');
let changeCase = require('change-case');

class DDLDraftGenerator extends JsonAIGenerator{

    constructor(client){
        super(client);
        
        this.model = "gpt-4o-2024-08-06"
        this.temperature = 0.5
        this.generatorName = 'DDLDraftGenerator'
    }
    
    createPrompt(){
        console.log("[*] 전달된 DDL을 기반으로 초안 생성을 위한 프롬프트 생성중...", {ddl: this.client.input.DDL, boundedContextLists: this.client.input.boundedContextLists})

        const prompt = `You are a DDD architecture transition consultant. 
Given the following existing DDL, create a proposal for how to define them into several aggregates.
Or suggest a way to reorganize the given aggregates into a single bounded context.

There must be no omissions in the following table DDLs or Aggregates: 
${this.client.input.DDL}

Generate only the Bounded Context requested below, and do not create any other Bounded Contexts:
${this.client.input.boundedContextLists ? this.client.input.boundedContextLists : 'Define only the minimum bounded context'}

${this.processDDL()}

Recommendation Instructions:
- The aggregates to be created in each Bounded Context can have value objects as entity information and have relationships with the aggregate root, or they can have multiple aggregate roots themselves.
- Accordingly, I want to create aggregate information for each bounded context with multiple recommended domain entities so that one can be chosen from several options.
- Create options based on different perspectives in DDD.
- For each recommendation option, you should present AggregateRoots or value objects for each BoundedContext. Attributes are not necessary.
- We also draw conclusions about recommended options by considering each point of view.
- Option creates a variety of possible cases and at least two options are recommended.


The format must be as follows:
{
    "processingDDL": [Currently processing DDL table names],
    "processedDDLs": [processed DDL table name],
    "numberRemainingDDLs": Number of remaining DDLs,
    "boundedContexts": [
        {
            "name": "BoundedContext-name",
            "recommendations": [
                {
                    "option": option number,
                    "aggregates": [
                        {
                        "name": "aggregate-name",
                        "entities": ["entity-name"],
                        "valueObjects": ["value-object-name"]
                        },
                    "pros": "props keyword: pros for this entity",
                    "cons": "cons keyword: cons for this entity"
                    ]
                },
            ],
            "conclusions": "Write a conclusion for each option, explaining in which cases it would be best to choose that option.",
            "ddl": "used ddl table names for this option"
        }
    ]
}

- pros and cons examples:
    Balanced Complexity: This design keeps order and order details together, which simplifies handling things like cancellations or refunds where you need to manage the entire order in one go.
    Low Cohesion: The design spreads the responsibilities for order management across multiple aggregates, which might lead to inconsistencies or difficulties in maintaining a single consistent view of an order across different parts of the application.
    ....
`

        console.log("[*] DDL 기반 초안 생성을 위한 프롬프트를 LLM에게 전달중...", {prompt: prompt})
        return prompt
    }

    processDDL(){
        let text = ''
        
        if(this.client.canvasType == 'cm' || this.client.canvasType == 'context-mapping-model-canvas'){
            text += `
            Process only the DDLs related to the recommendations of the boundedContexts currently being generated, and add them to processedDDLs when processing is complete.
            Ignore the DDLs that have been processed.
            Handle ddl tables that are difficult to define in a certain bounded context with 'etc' bounded context.

            The current processing status is as follows:
            Status of Current Bounded Context and Aggregates: ${this.client.input.DDLDraftTable}
            Processed DDLs: ${this.client.input.processedDDLs}
            Number of remaining DDLs: ${this.client.input.numberRemainingDDLs}
            `
        }else if(this.client.canvasType == 'es'){
            text += `
            Reconstruct the Aggregates into various Entities and Value Objects within a single bounded context.

            
            The current processing status is as follows:
            boundedContextName: ${this.client.input.boundedContextName}
            Processed DDLs: null
            Number of remaining DDLs: 0
            `
        }

        return text
    }

    createModel(text){
        try{
            var me = this

            if(this.state === 'end')
                console.log("[*] DDL 초안 관련 LLM 결과를 파싱중...", {text})
            
            if (text.startsWith('```json')) {
                text = text.slice(7);
            }
            if (text.endsWith('```')) {
                text = text.slice(0, -3);
            }

            let parsedJson = super.createModel(text);

            let tables = {};

            parsedJson.boundedContexts.forEach(bc => {
                let table = {
                    headers: [
                        { text: 'Option', value: 'option' },
                        { text: 'Aggregates', value: 'aggregates' },
                        { text: 'Pros', value: 'pros' },
                        { text: 'Cons', value: 'cons' }
                    ],
                    items: [],
                    ddl: ''
                };

                if (Array.isArray(bc.recommendations)) {
                    bc.recommendations.forEach(rec => {
                        let aggregatesStr = '';
                        if (Array.isArray(rec.aggregates) && rec.aggregates.length > 0) {
                            aggregatesStr = rec.aggregates.map(agg => {
                                const entities = Array.isArray(agg.entities) ? agg.entities.join(', ') : '';
                                const valueObjects = Array.isArray(agg.valueObjects) ? agg.valueObjects.join(', ') : '';
                                if(entities && valueObjects){
                                    return `${agg.name || ''} (Entities: ${entities}, ValueObjects: ${valueObjects})`;
                                }else if(entities){
                                    return `${agg.name || ''} (Entities: ${entities})`;
                                }else if(valueObjects){
                                    return `${agg.name || ''} (ValueObjects: ${valueObjects})`;
                                }
                            }).join(' / ');
                        }
        
                        table.items.push({
                            option: rec.option || '',
                            aggregates: aggregatesStr,
                            pros: rec.pros || '',
                            cons: rec.cons || ''
                        });
                    });

                    if (bc.conclusions) {
                        table.items.push({
                            option: 'Conclusion',
                            aggregates: bc.conclusions,
                            pros: '',
                            cons: '',
                            isConclusion: true
                        });
                    }

                    if (bc.ddl) {
                        table.ddl = bc.ddl || ''
                    }
                }

    
                tables[bc.name] = table;
            });

            const output = {
                processingDDL: parsedJson.processingDDL,
                processedDDLs: parsedJson.processedDDLs,
                numberRemainingDDLs: parsedJson.numberRemainingDDLs,
                tables: tables,
                DDL: this.client.input.DDL,
                boundedContextLists: this.client.input.boundedContextLists,
                generatorName: this.generatorName
            };

            if(this.state === 'end')
                console.log("[*] DDL 초안 생성 관련 파싱 결과가 반환됨", {output})

            return output
        } catch(e){
            console.log(e)
            let tables = {};
            return {
                processingDDL: null,
                processedDDLs: [],
                numberRemainingDDLs: 0,
                tables: tables,
                DDL: this.client.input.DDL,
                boundedContextLists: this.client.input.boundedContextLists,
                generatorName: this.generatorName
            };
        }
    }

}


module.exports = DDLDraftGenerator;