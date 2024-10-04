const JsonAIGenerator = require("./JsonAIGenerator");
const VODefinitions = require("./VODefinitions");
//let partialParse = require('partial-json-parser');
let changeCase = require('change-case');

class DDLDraftGenerator extends JsonAIGenerator{

    constructor(client){
        super(client);
        
        this.model = "gpt-4o"
    }
    
    createPrompt(){
        return `You are a DDD architecture transition consultant. 
        Given the following existing DDL, create a proposal for how to define them into several aggregates.
        Or suggest a way to reorganize the given aggregates into a single bounded context.
        
        There must be no omissions in the following DDL or Aggregates: 
        ${this.client.input.DDL}

        Generate bounded contexts and aggregates according to the following request.
        Create bounded context only that corresponds to the request:
        ${this.client.input.boundedContextLists}
        
        ${this.processDDL()}
        
        Recommendation Instructions:
        - The aggregates to be created in each Bounded Context can have value objects as entity information and have relationships with the aggregate root, or they can have multiple aggregate roots themselves.
        - Accordingly, I want to create aggregate information for each bounded context with multiple recommended domain entities so that one can be chosen from several options.
        - Perspectives on consistency, scalability, performance, concurrency, complexity, etc. must be fundamentally included.
        - For each recommendation option, you should present AggregateRoots or value objects for each BoundedContext. Attributes are not necessary.
        - We also draw conclusions about recommended options by considering each point of view.

        The format must be as follows:
        {
            "processingDDL": Currently processing one DDL table name,
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
                        "pros": "keyword: pros for this entity",
                        "cons": "keyword: cons for this entity"
                        ]
                    },
                ],
                "conclusions": "reason of choice: Write a conclusion for each option, explaining in which cases it would be best to choose that option."
                }
            ]
        }
        
        - pros and cons examples:
          Balanced Complexity: This design keeps order and order details together, which simplifies handling things like cancellations or refunds where you need to manage the entire order in one go.
          Low Cohesion: The design spreads the responsibilities for order management across multiple aggregates, which might lead to inconsistencies or difficulties in maintaining a single consistent view of an order across different parts of the application.
          ....
    `
    }

    processDDL(){
        let text = ''
        
        if(this.client.canvasType == 'cm' || this.client.canvasType == 'context-mapping-model-canvas'){
            text += `
            We will process the DDL sequentially, also we will create bounded contexts for only one DDL at a time.
            Add the currently processed DDL to processedDDLs.
            Ignore DDLs that have already been processed.

            These are the aggregate Object and Value Object for each Bounded Context processed so far.
            Determine which Bounded Context the Aggregate to be newly created in DDL should belong to.
            Then, determine whether the newly added Aggregate can be entered into the entity or value object of the existing Aggregate, or whether it should be added together as a new aggregate, and create it:
            ${this.client.input.DDLDraftTable}
            
            The current processing status is as follows:
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
                    items: []
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
                }

    
                tables[bc.name] = table;
            });

            return {
                processingDDL: parsedJson.processingDDL,
                processedDDLs: parsedJson.processedDDLs,
                numberRemainingDDLs: parsedJson.numberRemainingDDLs,
                tables: tables,
                DDL: this.client.input.DDL,
                boundedContextLists: this.client.input.boundedContextLists
            };
        } catch(e){
            console.log(e)
            let tables = {};
            return {
                processingDDL: null,
                processedDDLs: [],
                numberRemainingDDLs: 0,
                tables: tables,
                DDL: this.client.input.DDL,
                boundedContextLists: this.client.input.boundedContextLists
            };
        }
    }

}


module.exports = DDLDraftGenerator;