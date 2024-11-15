const JsonAIGenerator = require("../JsonAIGenerator");
const GlobalPromptUtil = require("./modules/GlobalPromptUtil");
const DDLManager = require("./managers/DDLManager");

class DDLBoundedContextDistributeGenerator extends JsonAIGenerator{
    constructor(client){
        super(client);
        
        this.maxDDLForEachBoundedContext = 12

        this.model = "gpt-4o-2024-08-06"
        this.generatorName = 'DDLBoundedContextDistributeGenerator'
        this.inputedParams = null

        this.temperature = 1.0
        this.top_p = 0.6
    }
    

    createPrompt(){
        try {

            for(let optionKey of ["ddls", "suggestedBoundedContexts", "functionRequirements"])
                if(this.client.input[optionKey] === undefined) 
                    throw new Error(`${optionKey} 파라미터가 전달되지 않았습니다.`)
            this.inputedParams = {
                ddls: this.client.input.ddls,
                ddlManager: new DDLManager(this.client.input.ddls),
                suggestedBoundedContexts: this.client.input.suggestedBoundedContexts,
                functionRequirements: this.client.input.functionRequirements,
            }
            
            console.log(`[*] ${this.generatorName}에 대한 프롬프트 생성중...`, {inputedParams: this.inputedParams})

            const prompt = this._getSystemPrompt() + this._getUserPrompt(
                this.inputedParams.ddlManager, this.inputedParams.suggestedBoundedContexts, this.inputedParams.functionRequirements
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
        return `You should return a list of pairs of DDLs to use with the appropriate Bounded Context based on the DDL summary information passed in.

Please follow these rules.
1. Use the table's foreign key information or name to enclose it in a relevant Bounded Context.
2. All table names in the passed DDL summary must be utilised.
3. The number of DDLs in each Bounded Context must not exceed ${this.maxDDLForEachBoundedContext}.
4. If a user has restricted something to a Bounded Context, that Bounded Context must be included in the creation list. However, you can create a new Bounded Context if you need more.
5. Even if the user did not pass the Bounded Context name in English, you should create it with an appropriate English name. Ex) 유저 서비스 -> UserService
6. When a user communicates a feature requirement, you must write it in the appropriate BoundedContext.
7. Do not write comments in the output JSON object.

`
    }

    __getOutputSyntaxGuidePrompt() {
        return `You should return a list containing JSON objects for performing specific actions.
The returned format should be as follows.
\`\`\`json
{
    "thoughtProcess": {
        "step1": "Analyze the relationships between tables based on foreign keys",
        "step2": "Group closely related tables that share foreign key relationships",
        "step3": "Consider the suggested bounded contexts from user input",
        "step4": "Map function requirements to appropriate bounded contexts",
        "step5": "Verify all tables are assigned and constraints are met"
    },
    "boundedContexts": [
        {
            "name": "BoundedContextName",
            "ddls": ["DDLName1", "DDLName2", ...],
            "functionRequirements": ["FunctionRequirement1", "FunctionRequirement2", ...]
        }
    ]
}
\`\`\`

`
    }

    __getExamplePrompt(){
        return `Let me give you an example.
[INPUT]
- DDL Summary
users(PK: user_id)
user_profiles(PK: profile_id)(FK: user_id)
products(PK: product_id)(FK: category_id)
product_categories(PK: category_id)
orders(PK: order_id)(FK: user_id, product_id)
payments(PK: payment_id)(FK: order_id)
delivery_addresses(PK: address_id)(FK: user_id)
product_reviews(PK: review_id)(FK: user_id, product_id)

- Suggested Bounded Contexts
유저 서비스
상품 서비스

- Function Requirements
사용자 프로필 관리 기능이 필요합니다
상품 카테고리별 조회 기능이 필요합니다
주문시 결제 처리 기능이 필요합니다
배송지 관리 기능이 필요합니다

[OUTPUT]
\`\`\`json
{"thoughtProcess":{"step1":"Analyzed foreign key relationships: user_profiles and delivery_addresses are connected to users; products linked to product_categories; orders connected to users and products; payments linked to orders; product_reviews connected to users and products","step2":"Grouped tables by primary relationships: users with profiles and addresses; products with categories and reviews; orders with payments","step3":"Mapped to suggested contexts: '유저 서비스' becomes UserService, '상품 서비스' becomes ProductService, created additional OrderPaymentService for order-related tables","step4":"Assigned function requirements: user profile and delivery management to UserService, product category browsing to ProductService, payment processing to OrderPaymentService","step5":"Verified all tables are assigned and each bounded context has less than maximum allowed DDLs"},"boundedContexts":[{"name":"UserService","ddls":["users","user_profiles","delivery_addresses"],"functionRequirements":["사용자 프로필 관리 기능이 필요합니다","배송지 관리 기능이 필요합니다"]},{"name":"ProductService","ddls":["products","product_categories","product_reviews"],"functionRequirements":["상품 카테고리별 조회 기능이 필요합니다"]},{"name":"OrderPaymentService","ddls":["orders","payments"],"functionRequirements":["주문시 결제 처리 기능이 필요합니다"]}]}
\`\`\`

`
    }

    _getUserPrompt(ddlManager, suggestedBoundedContexts, functionRequirements){
        return `Now let's process the user's input.
[INPUT]
- DDL Summary
${ddlManager.getParsedDDLs().map(ddl => ddl.summaryStr).join('\n')}

- Suggested Bounded Contexts
${suggestedBoundedContexts.join('\n')}

- Function Requirements
${functionRequirements.join('\n')}

- Final Check
* Each DDL must be assigned to exactly one Bounded Context
* Each Bounded Context must not exceed ${this.maxDDLForEachBoundedContext} DDLs
* All suggested Bounded Contexts must be included in the result
* All function requirements must be assigned to appropriate Bounded Contexts
* Bounded Context names must be in English and follow PascalCase convention
* Tables with foreign key relationships should preferably be in the same Bounded Context
* Response must be a valid JSON without any comments or additional text

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


            let boundedContexts = GlobalPromptUtil.parseToJson(text).boundedContexts


            const outputResult = {
                generatorName: this.generatorName,
                modelValue: {
                    boundedContexts: boundedContexts
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


module.exports = DDLBoundedContextDistributeGenerator;