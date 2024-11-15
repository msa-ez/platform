const JsonAIGenerator = require("../JsonAIGenerator");
const GlobalPromptUtil = require("./modules/GlobalPromptUtil");

class DDLDraftGeneratorForDistribution extends JsonAIGenerator{
    constructor(client){
        super(client);

        this.model = "gpt-4o-2024-08-06"
        this.generatorName = 'DDLDraftGeneratorForDistribution'
        this.inputedParams = null

        this.temperature = 1.0
        this.top_p = 0.6
    }
    

    createPrompt(){
        try {

            for(let optionKey of ["ddl", "boundedContext"])
                if(this.client.input[optionKey] === undefined) 
                    throw new Error(`${optionKey} 파라미터가 전달되지 않았습니다.`)
            this.inputedParams = {
                ddl: this.client.input.ddl,
                boundedContext: this.client.input.boundedContext,
                functionRequirements: this.client.input.functionRequirements
            }
            
            console.log(`[*] ${this.generatorName}에 대한 프롬프트 생성중...`, {inputedParams: this.inputedParams})

            const prompt = this._getSystemPrompt() + this._getUserPrompt(
                this.inputedParams.ddl, this.inputedParams.boundedContext
            )

            console.log(`[*] LLM에게 ${this.generatorName}에서 생성된 프롬프트 전달중...`, {prompt})
            return prompt

        } catch(e) {

            console.error(`[!] ${this.generatorName}에 대한 프롬프트 생성 도중에 오류 발생!`, {esValue, ddl, error:e})
            console.error(e)
            throw e

        }
    }

    _getSystemPrompt(){
        return this.__getFrontGuidePrompt() +
            this.__getOutputSyntaxGuidePrompt() +
            this.__getExamplePrompt() +
            GlobalPromptUtil.getJsonCompressGuidePrompt()
    }

    __getFrontGuidePrompt(){
        return `You are required to write a proposal on how to define multiple Aggregates in a given Bounded Context via a passed in DDL.

Please follow these rules.
1. You must make use of all the properties of the passed DDL.
2. A given DDL does not necessarily have to be matched with a single Aggregate; if there are too many properties, they can be decomposed into multiple Aggregates or extracted as ValueObject or Entity.
3. Even if you don't have a keyword like 'FOREIGN KEY' in DDL, show the flexibility to decompose into the appropriate ValueObject, Entity, etc. if it seems necessary.
4. Do not write comments in the output JSON object.

Recommendation Instructions to write proposal.
1. Aggregates inside a bounded context can have ValueObjects or Entities, and they can have relationships between them.
2. Generate different options based on each of the perspectives provided by ACID.
3. There must be at least two options for each bound context, and you can create more if needed.
4. You should ultimately choose the best option out of the several options and write why, which will be selected by default.

`
    }

    __getOutputSyntaxGuidePrompt() {
        return `You should return a list containing JSON objects for performing specific actions.
The returned format should be as follows.
\`\`\`json
{
    "thoughtProcess": {
        "ddlAnalysis": "Analyze the given DDL structure, relationships, and key properties",
        "contextConsideration": "Consider the bounded context and its business requirements",
        "aggregateIdentification": "Explain how you identified potential aggregates",
        "decompositionReasoning": "Explain your reasoning for different decomposition options",
        "tradeoffAnalysis": "Analyze the tradeoffs between different options considering ACID properties"
    },
    "options": [
        {
            "structure": [
                {
                    "aggregateName": "aggregate-name",
                    "entities": ["entity-name"],
                    "valueObjects": ["value-object-name"]
                }
            ],
            "pros": "pros keyword: pros for this option",
            "cons": "cons keyword: cons for this option"
        }
    ],
    "defaultOptionIndex": "The index of the option that is selected by default(starts from 0)",
    "conclusions": "Write a conclusion for each option, explaining in which cases it would be best to choose that option."
}
\`\`\`

`
    }

    __getExamplePrompt(){
        return `Let me give you an example.
[INPUT]
- DDL
CREATE TABLE orders (
    order_id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL,
    order_status VARCHAR(20) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    shipping_address TEXT NOT NULL,
    billing_address TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE order_items (
    item_id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

CREATE TABLE order_payments (
    payment_id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL,
    payment_method VARCHAR(20) NOT NULL,
    payment_status VARCHAR(20) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_date TIMESTAMP NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

- Target Bounded Context
Order Management

[OUTPUT]
\`\`\`json
{"thoughtProcess":{"ddlAnalysis":"The DDL defines three main tables: orders, order_items, and order_payments. The orders table serves as the core entity with order_items and order_payments having foreign key relationships to it. Each table has its own primary key and specific business-related fields.","contextConsideration":"In the Order Management bounded context, we need to handle order processing, item management, and payment processing while maintaining appropriate transaction boundaries and consistency levels.","aggregateIdentification":"Based on the table structure, we can identify potential aggregates around Order, OrderItem, and Payment concepts. The relationships between these components suggest different possible aggregate boundaries.","decompositionReasoning":"We can decompose this in multiple ways: 1) Single large aggregate for full consistency, 2) Separate Order and Payment aggregates for better performance, 3) Fully decomposed for maximum flexibility.","tradeoffAnalysis":"The key tradeoff is between consistency and performance. A single aggregate ensures strong consistency but may cause performance issues. Splitting into multiple aggregates improves performance but requires managing eventual consistency."},"options":[{"structure":[{"aggregateName":"Order","entities":["OrderItem","Payment"],"valueObjects":["Address","Money"]}],"pros":"Strong consistency: All order-related operations are atomic, Complete transaction boundary: Ensures payment and items are always consistent with the order","cons":"Large aggregate size: May impact performance for high-volume operations, Complex locking: Entire order must be locked for any changes"},{"structure":[{"aggregateName":"Order","entities":["OrderItem"],"valueObjects":["Address","Money"]},{"aggregateName":"Payment","entities":[],"valueObjects":["Money","PaymentMethod"]}],"pros":"Better performance: Smaller aggregates mean faster operations, Independent scaling: Payment processing can scale independently","cons":"Eventually consistent: Payment status updates need to be synchronized, Complex business logic: Need to handle payment-order consistency"},{"structure":[{"aggregateName":"Order","entities":[],"valueObjects":["Address"]},{"aggregateName":"OrderItem","entities":[],"valueObjects":["Money"]},{"aggregateName":"Payment","entities":[],"valueObjects":["Money","PaymentMethod"]}],"pros":"Maximum flexibility: Each component can be modified independently, Highest performance: Very small and focused aggregates","cons":"Complex consistency management: Need careful orchestration, Many moving parts: Increased complexity in system design"}],"defaultOptionIndex":1,"conclusions":"Option 1 is suitable for systems where consistency is critical and order volume is moderate. Option 2 (default) provides a good balance between consistency and performance, suitable for most e-commerce systems. Option 3 is best for high-scale systems where performance is paramount and eventual consistency is acceptable."}
\`\`\`

`
    }

    _getUserPrompt(ddl, boundedContext){
        return `Now let's process the user's input.
[INPUT]
- DDL
${ddl}

- Target Bounded Context
${boundedContext}

- Final Check
* Ensure all DDL properties are used in at least one aggregate
* Consider creating ValueObjects for complex properties (e.g., address, money-related fields)
* Check if any properties could be grouped into meaningful ValueObjects or Entities
* Verify that each option follows ACID principles differently
* Ensure at least two different structural options are provided
* Make sure the defaultOptionIndex is properly justified in the conclusions
* Consider the impact of aggregate size on performance and consistency
* Verify that relationships between aggregates are clearly defined
* Check if any technical constraints in DDL suggest specific aggregate boundaries
* The options provided should not be nearly identical or duplicate.

[OUTPUT]
\`\`\`json
`
    }


    createModel(text){
        if(this.state !== 'end') {
            console.log(`[*] ${this.generatorName}에서 결과 생성중... (현재 출력된 문자 수: ${text.length})`)

            return {
                generatorName: this.generatorName,
                modelValue: null,
                modelRawValue: text
            }
        }

        try {

            console.log(`[*] ${this.generatorName}에서 결과 파싱중...`, {text})


            let aiOutput = GlobalPromptUtil.parseToJson(text)


            const outputResult = {
                generatorName: this.generatorName,
                modelValue: {
                    ...aiOutput
                },
                modelRawValue: text,
                inputedParams: this.inputedParams
            }
            console.log(`[*] ${this.generatorName}에서 결과 파싱 완료!`, {outputResult})
            console.log(`### Aggregate Inside에서 생성한 액션 정보 ###`)
            console.log(JSON.stringify(outputResult.modelValue.actions, null, 2))

            return outputResult

        } catch(e) {

            console.error(`[!] ${this.modelName}에서 결과 파싱중에 오류 발생!`, {text, error:e})
            console.error(e)

            return {
                generatorName: this.generatorName,
                modelValue: null,
                modelRawValue: text,
                inputedParams: this.inputedParams,
                isError: true
            }

        }
    }
}


module.exports = DDLDraftGeneratorForDistribution;