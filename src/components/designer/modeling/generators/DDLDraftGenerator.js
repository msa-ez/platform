const JsonAIGenerator = require("./JsonAIGenerator");
const VODefinitions = require("./VODefinitions");
//let partialParse = require('partial-json-parser');
let changeCase = require('change-case');

class DDLDraftGenerator extends JsonAIGenerator{

    constructor(client){
        super(client);
        
        this.model = "gpt-4o"
        this.DDL = this.client.input.DDL
    }
    
    createPrompt(){
        return `Please create an event storming model in json for following DDL: 
        ${this.client.input.DDL}

        Generate bounded contexts and aggregates according to the following request:
        ${this.client.input.boundedContextLists}

        Extract DDD Aggregates and Bounded Contexts from the provided DDL, ensuring that:
        1. All tables from the DDL are included without omission.
        2. Tables are grouped into cohesive Aggregates based on their relationships and domain logic.
        3. Aggregates are organized into appropriate Bounded Contexts as specified (${this.client.input.boundedContextLists}).
        4. Each Bounded Context may contain one or more Aggregates.
        5. All information from the DDL should be represented in the model, even if it means creating additional Aggregates within the specified Bounded Contexts.
        6. If a table is closely related to multiple Bounded Contexts, consider creating a reference or summary in each relevant context.
        7. Normalize and combine related tables within each Aggregate where appropriate.

        Additional requirements:
        - Ensure that all tables from the original DDL are represented in the generated model, distributed across the specified Bounded Contexts.
        - When grouping tables into Aggregates, consider their relationships and domain logic. Tables that are closely related or form a cohesive unit should be part of the same Aggregate.
        - When organizing Aggregates into Bounded Contexts, adhere to the specified contexts (${this.client.input.boundedContextLists}) while ensuring all data is represented.
        - If an Aggregate references entities from another Bounded Context, use the appropriate ID reference (e.g., CustomerId) instead of including the entire entity.
        - Ensure that domain events flow between Bounded Contexts in a way that allows for policy invocation across contexts.
    
        Specific instructions:
        - Do not omit any tables from the original DDL. If a table (e.g., stores) seems to not fit directly into the specified Bounded Contexts, consider how it relates to the existing contexts and include it in the most appropriate one.
        - When creating Aggregates, combine closely related entities. For example, orders and payments could be part of the same Aggregate in the Order context, rather than separate Aggregates.
        - Ensure that all fields from the original tables are represented in the Aggregates, even if they are combined or restructured.
        - Create meaningful relationships between Aggregates across different Bounded Contexts using appropriate references (e.g., CustomerId in the Order Aggregate to reference the Customer Aggregate).
        
        Recommendation Instructions:
        - The aggregates to be created in each Bounded Context can have value objects as entity information and have relationships with the aggregate root, or they can have multiple aggregate roots themselves.
        - Accordingly, I want to create aggregate information for each bounded context with multiple recommended domain entities so that one can be chosen from several options.
        - There should be at least three recommendations per BoundedContext.
        - For each recommendation option, you should present AggregateRoots or value objects for each BoundedContext. Attributes are not necessary.


        The format must be as follows:
        {
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
                        "merit": "merit for this entity",
                        "disadvantage": "disadvantage for this entity"
                        ]
                    },
                ]
                }
            ]
        }
    `
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
        
            // 파싱에 실패했거나 결과가 예상한 형식이 아니면 null을 반환합니다.
            if (!parsedJson || !parsedJson.boundedContexts) {
                return null;
            }

            let tables = {};

            parsedJson.boundedContexts.forEach(bc => {
                let table = {
                    headers: [
                        { text: 'Option', value: 'option' },
                        { text: 'Aggregates', value: 'aggregates' },
                        { text: 'Merit', value: 'merit' },
                        { text: 'Disadvantage', value: 'disadvantage' }
                    ],
                    items: []
                };

                bc.recommendations.forEach(rec => {
                    let aggregatesStr = rec.aggregates.map(agg => 
                        `${agg.name} (Entities: ${agg.entities.join(', ')}, ValueObjects: ${agg.valueObjects.join(', ')})`
                    ).join('\n');

                    table.items.push({
                        option: rec.option,
                        aggregates: aggregatesStr,
                        merit: rec.merit,
                        disadvantage: rec.disadvantage
                    });
                });

                tables[bc.name] = table;
            });

            return tables;
        } catch(e){
            console.log(e)
            let tables = {};
            return tables;
        }
    }

}


module.exports = DDLDraftGenerator;