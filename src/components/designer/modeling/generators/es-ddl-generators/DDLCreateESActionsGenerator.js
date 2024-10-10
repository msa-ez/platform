const JsonAIGenerator = require("../JsonAIGenerator");
const GlobalPromptUtil = require("./modules/GlobalPromptUtil");
const ESActionUtil = require("./modules/ESActionsUtil")

class DDLCreateESActionsGenerator extends JsonAIGenerator{
    constructor(client){
        super(client);
        
        this.model = "gpt-4o-2024-08-06"
        this.temperature = 0.6
        this.generatorName = 'DDLCreateESActionsGenerator'
        this.inputedParams = null
    }
    

    createPrompt(){
        try {

            for(let optionKey of ["ddl", "selectedOption", "boundedContexts", "userInfo", "information"])
                if(this.client.input[optionKey] === null) 
                    throw new Error(`${optionKey} 파라미터가 전달되지 않았습니다.`)
            this.inputedParams = {
                ddl: this.client.input.ddl,
                selectedOption: this.client.input.selectedOption,
                boundedContexts: this.client.input.boundedContexts,
                userInfo: this.client.input.userInfo,
                information: this.client.input.information
            }
            
            console.log(`[*] ${this.generatorName}에 대한 프롬프트 생성중...`, {inputedParams: this.inputedParams})


            const prompt = this._getSystemPrompt() + this._getUserPrompt(
                this.inputedParams.ddl, this.inputedParams.selectedOption, this.inputedParams.boundedContexts
            )

            console.log(`[*] LLM에게 ${this.generatorName}에서 생성된 프롬프트 전달중...`, {prompt})
            return prompt

        } catch(e) {

            console.error(`[!] GetRelatedESValueByDDLGenerator에 대한 프롬프트 생성 도중에 오류 발생!`, {esValue, ddl, error:e})
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
        return `You will need to write actions that utilize the given DDL to create the event stemming structure presented.

Please follow these rules.
1. Create new BoundedContexts from the ones provided, and create event stemming actions to generate the user-directed structure in the appropriate Bounded Context.
2. All properties in a given DDL must be included in the Aggregate or ValueObject you created.
3. You can utilize basic Java data types such as String and Long for Aggregate properties, or predefined properties such as Address, Portrait, Rating, Money, and Email. Other properties must be defined in the corresponding Aggregate as Enumeration or ValueObject.
4. If the Bounded Context name is not in English, you will need to change it to an appropriate English name. ex) 고객 -> Customer Service
5. If the names of Aggregate, ValueObject, and Enumeration used in the user-supplied structure are not English, you must change them to appropriate English names.
6. Do not write comments in the output JSON object.

`
    }

    __getOutputSyntaxGuidePrompt() {
        return `You should return a list containing JSON objects for performing specific actions.
The returned format should be as follows.
\`\`\`json
{
    "actions": [
        {
            // This attribute indicates what type of object information is being modified.
            // Choose one from BoundedContext, Aggregate, Enumeration, ValueObject, Command, Event.
            "objectType": "<objectType>",

            // This attribute contains the ID information of the object on which the action is performed.
            "ids": {
                "<idName>": "<idValue>"
            },

            // This attribute contains the parameters required for the action.
            "args": {
                "<argName>": "<argValue>"
            }
        }
    ]
}
\`\`\`

I will explain the ids and args used in each objectType.
You cannot use any arbitrary parameters not described in this explanation in ids or args.

# objectType: BoundedContext
- Description
Used to create a Bounded Context specified by the user, and that BoundedContextId should be utilized by other actions.

- Return format
{
    "objectType": "BoundedContext",
    "ids": {
        "boundedContextId": "<boundedContextId>"
    },
    "args": {
        "boundedContextName": "<boundedContextName>"
    }
}

# objectType: Aggregate
- Description
You can define an Aggregate by utilizing the properties found in the DDL.
aggregateId can be used when defining ValueObjects, Enumerations that belong to an Aggregate.

- Return format
{
    "objectType": "Aggregate",
    "ids": {
        "boundedContextId": "<boundedContextId>",
        "aggregateId": "<aggregateId>"
    },
    "args": {
        "aggregateName": "<aggregateName>",

        // Please list as many attributes used in the transaction as possible.
        "properties": [
            {
                "name": "<propertyName>",
                ["type": "<propertyType>"], // If the type is String, do not specify the type.
                ["isKey": true] // Write only if there is a primary key.
            }
        ]
    }
}

# objectType: Enumeration
- Description
An object containing enumeration information that can be used in an Aggregate.
If there is no appropriate Aggregate that this Enumeration can belong to, it must be newly created through a query.
You can utilize the properties in the DDL to define an Enumeration.

- Return format
{
    "objectType": "Enumeration",
    "ids": {
        "boundedContextId": "<boundedContextId>",
        "aggregateId": "<aggregateId>",
        "enumerationId": "<enumerationId>"
    },
    "args": {
        "enumerationName": "<enumerationName>",
        "properties": [
            {
                "name": "<propertyName>"
            }
        ]
    }
}

# objectType: ValueObject
- Description
An object containing ValueObject information that can be used in an Aggregate.
If there is no appropriate Aggregate that this ValueObject can belong to, it must be newly created through a query.
You can utilize the properties in the DDL to define an ValueObject.

- Return format
{
    "objectType": "ValueObject",
    "ids": {
        "boundedContextId": "<boundedContextId>",
        "aggregateId": "<aggregateId>",
        "valueObjectId": "<valueObjectId>"
    },
    "args": {
        "valueObjectName": "<valueObjectName>",
        "properties": [
            {
                "name": "<propertyName>",
                ["type": "<propertyType>"], // If the type is String, do not specify the type.
                ["isKey": true], // Write only if there is a primary key.
                ["isForeignProperty": true] // Whether it is a foreign key. Write only if this attribute references another table's attribute.
            }
        ],
    }
}

`
    }

    __getExamplePrompt(){
        return `Let me give you an example.
[INPUT]
- DDL
CREATE TABLE store (
    store_id INT PRIMARY KEY,
    store_name VARCHAR(100) NOT NULL,
    address VARCHAR(200) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    business_hours VARCHAR(100)
);

CREATE TABLE product (
    product_id INT PRIMARY KEY,
    store_id INT,
    product_name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INT NOT NULL,
    FOREIGN KEY (store_id) REFERENCES store(store_id)
);

CREATE TABLE order (
    order_id INT PRIMARY KEY,
    store_id INT,
    product_id INT,
    order_date TIMESTAMP NOT NULL,
    quantity INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (store_id) REFERENCES store(store_id),
    FOREIGN KEY (product_id) REFERENCES product(product_id)
);

- The EventStorming structure you need to create 
상점 (Entities: 상점, 상품, ValueObjects: 연락처, 주소)
주문 (Entities: 주문, ValueObjects: 주문상세)

- Bounded Contexts to Create and Utilize
상점, 주문

[OUTPUT]
\`\`\`json
{"actions":[{"objectType":"BoundedContext","ids":{"boundedContextId":"bc-store"},"args":{"boundedContextName":"StoreService"}},{"objectType":"Aggregate","ids":{"boundedContextId":"bc-store","aggregateId":"agg-store"},"args":{"aggregateName":"Store","properties":[{"name":"storeId","type":"Long","isKey":true},{"name":"storeName"},{"name":"businessHours"},{"name":"phoneNumber","type":"Contact"},{"name":"address","type":"Address"}]}},{"objectType":"ValueObject","ids":{"boundedContextId":"bc-store","aggregateId":"agg-store","valueObjectId":"vo-store-contact"},"args":{"valueObjectName":"Contact","properties":[{"name":"phoneNumber"}]}},{"objectType":"ValueObject","ids":{"boundedContextId":"bc-store","aggregateId":"agg-store","valueObjectId":"vo-store-address"},"args":{"valueObjectName":"Address","properties":[{"name":"address"}]}},{"objectType":"Aggregate","ids":{"boundedContextId":"bc-store","aggregateId":"agg-product"},"args":{"aggregateName":"Product","properties":[{"name":"productId","type":"Long","isKey":true},{"name":"productName"},{"name":"price","type":"Money"},{"name":"stockQuantity","type":"Long"},{"name":"storeId","type":"Long","isForeignProperty":true}]}},{"objectType":"BoundedContext","ids":{"boundedContextId":"bc-order"},"args":{"boundedContextName":"OrderService"}},{"objectType":"Aggregate","ids":{"boundedContextId":"bc-order","aggregateId":"agg-order"},"args":{"aggregateName":"Order","properties":[{"name":"orderId","type":"Long","isKey":true},{"name":"orderDate","type":"Date"},{"name":"totalAmount","type":"Money"},{"name":"storeId","type":"Long","isForeignProperty":true},{"name":"orderDetail","type":"OrderDetail"}]}},{"objectType":"ValueObject","ids":{"boundedContextId":"bc-order","aggregateId":"agg-order","valueObjectId":"vo-order-detail"},"args":{"valueObjectName":"OrderDetail","properties":[{"name":"productId","type":"Long","isForeignProperty":true},{"name":"quantity","type":"Long"}]}}]}
\`\`\`

`
    }

    _getUserPrompt(ddl, selectedOption, boundedContexts){
        return `Now let's process the user's input.
[INPUT]
- DDL
${ddl}

- The EventStorming structure you need to create 
${selectedOption}

- Bounded Contexts to Create and Utilize
${boundedContexts.join(", ")}

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
            const actions = GlobalPromptUtil.parseToJson(text).actions
            const createdESValue = ESActionUtil.getActionAppliedESValue(actions, this.inputedParams.userInfo, this.inputedParams.information)
            
            const outputResult = {
                generatorName: this.generatorName,
                modelValue: {
                    actions: actions,
                    createdESValue: createdESValue
                },
                modelRawValue: text,
                inputedParams: this.inputedParams
            }
            console.log(`[*] ${this.generatorName}에서 결과 파싱 완료!`, {outputResult})

            return outputResult

        } catch(e) {

            console.error(`[!] ${this.modelName}에서 결과 파싱중에 오류 발생!`, {text, error:e})

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


module.exports = DDLCreateESActionsGenerator;