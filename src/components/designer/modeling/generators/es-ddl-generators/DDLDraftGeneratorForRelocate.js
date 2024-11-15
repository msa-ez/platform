const JsonAIGenerator = require("../JsonAIGenerator");
const GlobalPromptUtil = require("./modules/GlobalPromptUtil");
const ESValueSummarizeUtil = require("./modules/ESValueSummarizeUtil")
const ESValueSummarizeUtil_OnlyName = require("./modules/ESValueSummarizeUtil_OnlyName")
const ESAliasTransManager = require("./modules/ESAliasTransManager")

class DDLDraftGeneratorForRelocate extends JsonAIGenerator{
    constructor(client){
        super(client);

        this.model = "gpt-4o-2024-08-06"
        this.generatorName = 'DDLDraftGeneratorForRelocate'
        this.inputedParams = null

        this.temperature = 1.0
        this.top_p = 0.6
    }
    

    createPrompt(){
        try {

            for(let optionKey of ["targetBoundedContext", "esValue"])
                if(this.client.input[optionKey] === undefined) 
                    throw new Error(`${optionKey} 파라미터가 전달되지 않았습니다.`)
            this.inputedParams = {
                targetBoundedContext: this.client.input.targetBoundedContext,
                esValue: this.client.input.esValue
            }
            
            console.log(`[*] ${this.generatorName}에 대한 프롬프트 생성중...`, {inputedParams: this.inputedParams})

            this.esAliasTransManager = new ESAliasTransManager(this.inputedParams.esValue)
            const prompt = this._getSystemPrompt() + this._getUserPrompt(
                this.inputedParams.targetBoundedContext, this.inputedParams.esValue, this.esAliasTransManager
            )

            console.log(`[*] LLM에게 ${this.generatorName}에서 생성된 프롬프트 전달중...`, {prompt})
            return prompt

        } catch(e) {

            console.error(`[!] ${this.generatorName}에 대한 프롬프트 생성 도중에 오류 발생!`, {targetBoundedContext, esValue, error:e})
            console.error(e)
            throw e

        }
    }

    _getSystemPrompt(){
        return this.__getFrontGuidePrompt() +
            ESValueSummarizeUtil.getGuidePrompt() +
            this.__getOutputSyntaxGuidePrompt() +
            this.__getExamplePrompt() +
            GlobalPromptUtil.getJsonCompressGuidePrompt()
    }

    __getFrontGuidePrompt(){
        return `You will need to write a proposal for reconfiguring the contents of the existing BoundedContext to make it new again.

Please follow these rules.
1. The proposed configuration should utilise all the properties of the existing Bounded Context.
2. A given property does not necessarily have to be matched with a single Aggregate; if there are too many properties, they can be decomposed into multiple Aggregates or extracted as ValueObject or Entity.
3. Do not provide a structure as an option that duplicates the structure of the provided Bounded Context.
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
        "contextAnalysis": {
            // Describe current aggregates, entities, and value objects
            // The structure analyzed here should not be added to the suggestion options.
            "existingStructure": [
                {
                    "aggregateName": "aggregate-name",
                    "entities": ["entity-name"],
                    "valueObjects": ["value-object-name"]
                }
            ],
            "properties": "List and analyze all properties and their relationships",
            "businessRules": "Note important business rules and constraints"
        },
        "architecturalConsiderations": {
            "aggregateBoundaries": "Describe potential aggregate boundary options",
            "propertyGrouping": "Explain possible property grouping strategies",
            "entityValueObjectCandidates": "List and justify potential entities and value objects"
        },
        "acidAnalysis": {
            "atomicity": "Identify operations that need atomic guarantees",
            "consistency": "Describe consistency requirements and challenges",
            "isolation": "Analyze concurrency needs and potential conflicts",
            "durability": "Explain data persistence considerations"
        }
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
- Summarized Existing Event Storming Model
{"OrderService":{"name":"OrderService","actors":[{"name":"Customer"}],"aggregates":{"Order":{"name":"Order","entities":[],"enumerations":[],"valueObjects":[{"name":"ShippingAddress"},{"name":"PaymentInfo"}],"commands":[{"name":"CreateOrder","api_verb":"POST","outputEvents":["OrderCreated"]},{"name":"CancelOrder","api_verb":"DELETE","outputEvents":["OrderCanceled"]}],"events":[{"name":"OrderCreated","outputCommands":[]},{"name":"OrderCanceled","outputCommands":[]}]}}}}

- Target Bounded Context Info To Relocate
{"id":"bc-orderService","name":"OrderService","actors":[{"id":"act-customer","name":"Customer"}],"aggregates":{"agg-order":{"id":"agg-order","name":"Order","properties":[{"name":"orderId","type":"Long","isKey":true},{"name":"customerId","type":"Long"},{"name":"orderStatus"},{"name":"totalAmount","type":"Decimal"},{"name":"shippingAddress","type":"ShippingAddress"},{"name":"paymentInfo","type":"PaymentInfo"},{"name":"orderItems","type":"List<OrderItem>"}],"entities":[],"enumerations":[],"valueObjects":[{"id":"vo-shippingAddress","name":"ShippingAddress","properties":[{"name":"street"},{"name":"city"},{"name":"zipCode"}]},{"id":"vo-paymentInfo","name":"PaymentInfo","properties":[{"name":"cardNumber"},{"name":"expiryDate"},{"name":"cardHolderName"}]}],"commands":[{"id":"cmd-createOrder","name":"CreateOrder","api_verb":"POST","outputEvents":[{"id":"evt-orderCreated","name":"OrderCreated"}]},{"id":"cmd-cancelOrder","name":"CancelOrder","api_verb":"DELETE","outputEvents":[{"id":"evt-orderCanceled","name":"OrderCanceled"}]}],"events":[{"id":"evt-orderCreated","name":"OrderCreated","outputCommands":[]},{"id":"evt-orderCanceled","name":"OrderCanceled","outputCommands":[]}]}}}

[OUTPUT]
\`\`\`json
{"thoughtProcess":{"contextAnalysis":{"existingStructure":[{"aggregateName":"Order","entities":[],"valueObjects":["ShippingAddress","PaymentInfo"]}],"properties":"The Order aggregate contains core order properties (orderId, customerId, orderStatus, totalAmount) along with related components (ShippingAddress, PaymentInfo, OrderItems)","businessRules":"Orders must maintain consistency between total amount and order items, Orders can be created and canceled"},"architecturalConsiderations":{"aggregateBoundaries":"Can be split into Order management, Payment processing, and Order items management","propertyGrouping":"Core order properties could stay together, while payment and shipping could be separated","entityValueObjectCandidates":"OrderItem could be either an entity or part of Order aggregate, ShippingAddress and PaymentInfo are natural value objects"},"acidAnalysis":{"atomicity":"Order creation needs to ensure all components are created together","consistency":"Total amount must match order items, Payment info must be valid","isolation":"Multiple orders can be processed concurrently, Payment processing might need separate handling","durability":"Order data must be persisted reliably across all components"}},"options":[{"structure":[{"aggregateName":"Order","entities":["OrderItem"],"valueObjects":["ShippingAddress","PaymentInfo"]}],"pros":"Atomicity: All order-related data is managed in a single transaction, Consistency: Ensures order total matches items","cons":"Isolation: Large transactions might cause longer locks, Durability: Single point of failure for all order data"},{"structure":[{"aggregateName":"Order","entities":[],"valueObjects":["ShippingAddress"]},{"aggregateName":"Payment","entities":[],"valueObjects":["PaymentInfo"]},{"aggregateName":"OrderItem","entities":[],"valueObjects":[]}],"pros":"Isolation: Better concurrent processing of payments and orders, Durability: Distributed data storage reduces risk","cons":"Atomicity: Requires distributed transaction handling, Consistency: Need to maintain consistency across aggregates"}],"defaultOptionIndex":1,"conclusions":"Option 1 is suitable for systems with simpler requirements and lower concurrency needs. Option 2 (default) is better for high-traffic systems where payment processing and order management need independent scaling. The second option is selected as default because it provides better isolation and scalability, though it requires more complex consistency handling."}
\`\`\`

`
    }

    _getUserPrompt(targetBoundedContext, esValue, esAliasTransManager){
        const summarizedBoundedContextValue = ESValueSummarizeUtil.getSummarizedBoundedContextValue(esValue, targetBoundedContext)
        const summarizedBoundedContextValueWithAlias = Object.values(esAliasTransManager.transToAliasInSummarizedESValue({
            [targetBoundedContext.id]: summarizedBoundedContextValue
        }))[0]

        return `Now let's process the user's input.
[INPUT]
- Summarized Existing Event Storming Model
${JSON.stringify(ESValueSummarizeUtil_OnlyName.getFilteredSummarizedESValue(esValue))}

- Target Bounded Context Info To Relocate
${JSON.stringify(summarizedBoundedContextValueWithAlias)}

- Final Check
* Ensure all properties from the original bounded context are included in the new structure
* Each option must be significantly different from the existing structure
* Each option must have clear ACID-based reasoning in pros and cons
* Value Objects should be immutable and have no identity
* Entities must maintain their identity through state changes
* Consider the impact on existing commands and events
* Evaluate transaction boundaries and consistency requirements
* Check if the proposed structure supports all current business operations
* Ensure that the 'existingStructure' described in 'contextAnalysis' is not included in any of the 'options' structures. The options should propose new configurations that do not replicate the existing structure.

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


module.exports = DDLDraftGeneratorForRelocate;