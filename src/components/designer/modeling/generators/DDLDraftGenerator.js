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

There must be no omissions in the following all DDL tables or Aggregates: 
${this.client.input.DDL}

Generate only the Bounded Context requested below, and do not create any other Bounded Contexts:
${this.client.input.boundedContextLists ? this.client.input.boundedContextLists : 'Define only the minimum bounded context'}

Generate commands and events at scenario only for the mentioned domains as requested below:
${this.client.input.scenario ? this.client.input.scenario : ''}

Scenario Instructions:
1. Only generate commands and events that are directly mentioned domain in the given request.
2. Never create for a domain that is not mentioned.
3. If no scenario is provided domain, do not generate any commands or events.

${this.processDDL()}

Recommendation Instructions:
- The aggregates to be created in each Bounded Context can have value objects as entity information and have relationships with the aggregate root, or they can have multiple aggregate roots themselves.
- Accordingly, I want to create aggregate information for each bounded context with multiple recommended domain entities so that one can be chosen from several options.
- Create options based on different perspectives in DDD.
- For each recommendation option, you should present AggregateRoots or value objects for each BoundedContext. Attributes are not necessary.
- Draw conclusions about recommended options by considering each point of view.
- There must be at least two options for each Bounded context.


The format must be as follows:
{
    "processingDDL": [Currently processing DDL table names],
    "processedDDLs": [Currently Processing DDL and previously processed DDL table name],
    "numberRemainingDDLs": From the total number of DDLs, the number of DDLs that have not been processed,
    "boundedContexts": [ // create only one of the requested boundedContexts or etc boundedContext
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
            "ddl": [processing ddl table names for this bounded context],
            "scenario": [Commands and events mentioned in the request]
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

        if(this.client.input.reGenerate){
            text += `
            You previously provided recommendations for a Bounded Context based on the DDL:
            ${JSON.stringify(this.client.input.reGenerateTable)}

            This is the DDL used when creating this recommendation. Just use these again to create:
            ${this.client.input.ProcessingDDLs}

            Please create new recommendations, excluding the results you've already given.
            Use only the bounded context names exactly as they appear above and generate them.
            Since newly generated Recommendations will overwrite the results, start the option numbers from 1.
            `
            return text;

        }else if(this.client.canvasType == 'cm' || this.client.canvasType == 'context-mapping-model-canvas'){
            text += `
            Important Instructions:
            1. Create boundedContexts one by one in order.
            2. Process DDL tables related to the recommendations of the boundedContexts currently being generated.
            3. Never handle DDL that has already been processed, as it is contained in ProcessedDDLs.
            4. All DDL must be included without omission in the requested bounded contexts list and etc bounded context.
            5. All requested boundedContexts must be used.
            6. For DDL tables that are difficult to include in certain boundedContexts, create and include 'etc' boundedContext.
            7. When creating an 'etc' boundedContext, DDL tables that have not yet been processed are included.

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
                    recommendations: [],
                    conclusions: '',
                    ddl: ''
                };

                if (Array.isArray(bc.recommendations)) {
                    bc.recommendations.forEach(rec => {
                        let aggregatesStr = '';
                        if (Array.isArray(rec.aggregates) && rec.aggregates.length > 0) {
                            aggregatesStr = rec.aggregates.map(agg => {
                                const entities = Array.isArray(agg.entities) ? agg.entities.join(', ') : '';
                                const valueObjects = Array.isArray(agg.valueObjects) ? agg.valueObjects.join(', ') : '';
                                let result = `${agg.name || ''}`;
                                if(entities) result += ` / Entities: ${entities}`;
                                if(valueObjects) result += ` / ValueObjects: ${valueObjects}`;
                                return result;
                            }).join('|||');
                        }
        
                        table.recommendations.push({
                            option: rec.option || '',
                            aggregates: aggregatesStr,
                            pros: rec.pros || '',
                            cons: rec.cons || ''
                        });
                    });

                    if (bc.conclusions) {
                        table.conclusions = bc.conclusions;
                    }

                    if (bc.ddl) {
                        table.ddl = bc.ddl || '';
                    }

                    if (bc.scenario) {
                        table.scenario = bc.scenario || '';
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
                processingDDL: [],
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