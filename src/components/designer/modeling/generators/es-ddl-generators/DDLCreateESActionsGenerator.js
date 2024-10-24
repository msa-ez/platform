const JsonAIGenerator = require("../JsonAIGenerator");
const GlobalPromptUtil = require("./modules/GlobalPromptUtil");
const ESActionUtil = require("./modules/ESActionsUtil")

class DDLCreateESActionsGenerator extends JsonAIGenerator{
    constructor(client){
        super(client);
        
        this.model = "gpt-4o-2024-08-06"
        this.generatorName = 'DDLCreateESActionsGenerator'
        this.inputedParams = null

        this.temperature = 1.0
        this.top_p = 0.6
    }
    

    createPrompt(){
        try {

            for(let optionKey of ["ddl", "suggestedStructures", "boundedContexts", "functionRequests", "userInfo", "information"])
                if(this.client.input[optionKey] === null) 
                    throw new Error(`${optionKey} 파라미터가 전달되지 않았습니다.`)
            this.inputedParams = {
                ddl: this.client.input.ddl,
                suggestedStructures: this.client.input.suggestedStructures,
                boundedContexts: this.client.input.boundedContexts,
                functionRequests: this.client.input.functionRequests,
                userInfo: this.client.input.userInfo,
                information: this.client.input.information
            }
            
            console.log(`[*] ${this.generatorName}에 대한 프롬프트 생성중...`, {inputedParams: this.inputedParams})


            const prompt = this._getSystemPrompt() + this._getUserPrompt(
                this.inputedParams.ddl, this.inputedParams.suggestedStructures,
                this.inputedParams.boundedContexts, this.inputedParams.functionRequests
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
1. Create new BoundedContexts from the ones provided, and create event storming actions to generate the user-directed structure in the appropriate Bounded Context.
2. All properties in a given DDL must be included in the Aggregate or ValueObject or GeneralClass you created.
3. You can utilize basic Java data types such as String and Long for Aggregate properties, or predefined properties such as Address, Portrait, Rating, Money, and Email. Other properties must be defined in the corresponding Aggregate as Enumeration or ValueObject or GeneralClass.
4. If the Bounded Context name is not in English, you will need to change it to an appropriate English name. ex) 고객 -> Customer Service
5. If the names of Aggregate, Enumeration, ValueObject, and GeneralClass used in the user-supplied structure are not English, you must change them to appropriate English names.
6. Create events, commands, and actions as appropriate to satisfy the functional requirements communicated.
7. You must create and utilize only the Bounded Contexts provided in “Bounded Contexts to Create and Utilize”; do not create any additional Bounded Contexts.
8. When the value of a Enumeration or ValueObject or GeneralClass is utilised by the Aggregate Root, the corresponding material type must be used, not String. Ex) String > OrderStatus
9. Do not write comments in the output JSON object.

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
            // Choose one from BoundedContext, Aggregate, Enumeration, ValueObject, GeneralClass, Command, Event.
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
ValueObjects are immutable objects defined by their attributes rather than their identity.
They are used to group related attributes that should be treated as a single unit.
If there is no appropriate Aggregate that this ValueObject can belong to, it must be newly created through a query.
You can utilize the properties in the DDL to define a ValueObject.

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

# objectType: GeneralClass
- Description
An object containing GeneralClass information that can be used in an Aggregate.
Unlike ValueObjects, GeneralClasses are mutable objects with their own identity and lifecycle.
They represent complex domain concepts that don't qualify as Aggregates but need more flexibility than ValueObjects.
If there is no appropriate Aggregate that this GeneralClass can belong to, it must be newly created through a query.
You can utilize the properties in the DDL to define a GeneralClass.

- Return format
{
    "objectType": "GeneralClass",
    "ids": {
        "boundedContextId": "<boundedContextId>",
        "aggregateId": "<aggregateId>",
        "generalClassId": "<generalClassId>"
    },
    "args": {
        "generalClassName": "<generalClassName>",
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

# objectType: Command
- Description
Generate commands in the aggregate to satisfy the given functional requirements.

- Return format
{
    "objectType": "Command",
    "ids": {
        "boundedContextId": "<boundedContextId>",
        "aggregateId": "<aggregateId>",
        "commandId": "<commandId>"
    },
    "args": {
        "commandName": "<commandName>",
        "api_verb": <"POST" | "DELETE" | "PUT">,
        "outputEventIds": ["<outputEventId>"], // List of event IDs generated by this command. Must write existing event IDs.
        "actor": "<actorName>" // The name of the actor performing the action. Should include names like user, admin, etc. If there is no specific actor, leave it empty.
    }
}

# objectType: Event
- Description
Generate events in the aggregate to satisfy the given functional requirements.

- Return format
{
    "objectType": "Event",
    "ids": {
        "boundedContextId": "<boundedContextId>",
        "aggregateId": "<aggregateId>",
        "eventId": "<eventId>"
    },
    "args": {
        "eventName": "<eventName>",

        // Specific events can call commands within other BoundedContexts to change states.
        // Examples of such call information are as follows.
        // 1. If the patient's preference information has changed and there is an updated latest date of the patient's preference information in the patient information, it should be written to reflect this.
        // 2. If the quantity of ordered products has changed and there is information related to the total quantity of ordered products in the order product information, it should be written to reflect this.
        // 3. If a customer has purchased a new product with points and there are remaining points in the customer information, the points should be reduced to reflect this.
        // Notes are as follows.
        // 1. Do not call a command to change the primary key. The primary key is an unchanging attribute.
        // 2. Specify which attribute is being changed by calling the command.
        "outputCommandIds": [{
            "commandId": "<outputCommandId>", // The ID of the command being called. Must write existing command IDs.
            "relatedAttribute": "<relatedAttribute>", // Specify which attribute is being updated by calling the command. Write the attribute name of the Aggregate to which the called command belongs.
            "reason": "<reason>" // Specify the reason for calling this command.
        }]
    }
}
`
    }

    __getExamplePrompt(){
        return `Let me give you an example.
[INPUT]
- DDL
CREATE TABLE orders (
    order_id INT PRIMARY KEY,
    customer_id INT,
    order_date DATE,
    total_amount DECIMAL(10, 2),
    status VARCHAR(20),
    shipping_address_id INT
);

CREATE TABLE shipping_addresses (
    address_id INT PRIMARY KEY,
    street VARCHAR(200),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    delivery_instructions TEXT
);

CREATE TABLE order_items (
    item_id INT PRIMARY KEY,
    order_id INT,
    product_id INT,
    quantity INT,
    unit_price DECIMAL(10, 2),
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

CREATE TABLE customers (
    customer_id INT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    loyalty_points INT
);

CREATE TABLE products (
    product_id INT PRIMARY KEY,
    name VARCHAR(100),
    description TEXT,
    price DECIMAL(10, 2),
    stock_quantity INT
);

- The EventStorming structure you need to create 
[{"aggregateRoot":"주문","generalClasses":["배송주소"],"valueObjects":["주문상세"]},{"aggregateRoot":"고객","generalClasses":[],"valueObjects":[]},{"aggregateRoot":"상품","generalClasses":[],"valueObjects":[]}]

- Bounded Contexts to Create and Utilize
주문 관리, 고객 관리, 상품 관리

- Functional Requirements
고객이 주문을 생성할 수 있어야 합니다.
주문 생성 시 재고를 확인하고 감소시켜야 합니다.
주문 완료 시 고객의 로열티 포인트가 증가해야 합니다.
고객이 주문을 취소할 수 있어야 합니다.
주문 취소 시 재고를 원복하고 로열티 포인트를 차감해야 합니다.
고객이 주문시 배송 주소를 입력할 수 있어야 합니다.
배송 주소는 여러 주문에서 재사용될 수 있어야 합니다.

[OUTPUT]
\`\`\`json
{"actions":[{"objectType":"BoundedContext","ids":{"boundedContextId":"bc-order"},"args":{"boundedContextName":"Order Management"}},{"objectType":"Aggregate","ids":{"boundedContextId":"bc-order","aggregateId":"agg-order"},"args":{"aggregateName":"Order","properties":[{"name":"orderId","type":"Long","isKey":true},{"name":"customerId","type":"Long"},{"name":"orderDate","type":"Date"},{"name":"totalAmount","type":"Money"},{"name":"orderDetail","type":"OrderDetail"},{"name":"orderStatus","type":"OrderStatus"},{"name":"shippingAddress","type":"ShippingAddress"}]}},{"objectType":"Enumeration","ids":{"boundedContextId":"bc-order","aggregateId":"agg-order","enumerationId":"enum-order-status"},"args":{"enumerationName":"OrderStatus","properties":[{"name":"CREATED"},{"name":"PAID"},{"name":"SHIPPED"},{"name":"DELIVERED"},{"name":"CANCELLED"}]}},{"objectType":"ValueObject","ids":{"boundedContextId":"bc-order","aggregateId":"agg-order","valueObjectId":"vo-order-detail"},"args":{"valueObjectName":"OrderDetail","properties":[{"name":"itemId","type":"Long","isKey":true},{"name":"productId","type":"Long"},{"name":"quantity","type":"Integer"},{"name":"unitPrice","type":"Money"}]}},{"objectType":"GeneralClass","ids":{"boundedContextId":"bc-order","aggregateId":"agg-order","generalClassId":"gc-shipping-address"},"args":{"generalClassName":"ShippingAddress","properties":[{"name":"addressId","type":"Long","isKey":true},{"name":"street"},{"name":"city"},{"name":"state"},{"name":"postalCode"},{"name":"country"},{"name":"deliveryInstructions"}]}},{"objectType":"Command","ids":{"boundedContextId":"bc-order","aggregateId":"agg-order","commandId":"cmd-create-order"},"args":{"commandName":"CreateOrder","api_verb":"POST","outputEventIds":["evt-order-created"],"actor":"Customer"}},{"objectType":"Event","ids":{"boundedContextId":"bc-order","aggregateId":"agg-order","eventId":"evt-order-created"},"args":{"eventName":"OrderCreated","outputCommandIds":[{"commandId":"cmd-decrease-stock-quantity","relatedAttribute":"stockQuantity","reason":"Decrease product stock quantity after order creation"}]}},{"objectType":"Command","ids":{"boundedContextId":"bc-order","aggregateId":"agg-order","commandId":"cmd-cancel-order"},"args":{"commandName":"CancelOrder","api_verb":"PUT","outputEventIds":["evt-order-cancelled"],"actor":"Customer"}},{"objectType":"Event","ids":{"boundedContextId":"bc-order","aggregateId":"agg-order","eventId":"evt-order-cancelled"},"args":{"eventName":"OrderCancelled","outputCommandIds":[{"commandId":"cmd-increase-stock-quantity","relatedAttribute":"stockQuantity","reason":"Restore product stock quantity after order cancellation"},{"commandId":"cmd-decrease-loyalty-points","relatedAttribute":"loyaltyPoints","reason":"Decrease customer loyalty points after order cancellation"}]}},{"objectType":"BoundedContext","ids":{"boundedContextId":"bc-customer"},"args":{"boundedContextName":"Customer Management"}},{"objectType":"Aggregate","ids":{"boundedContextId":"bc-customer","aggregateId":"agg-customer"},"args":{"aggregateName":"Customer","properties":[{"name":"customerId","type":"Long","isKey":true},{"name":"name","type":"String"},{"name":"email","type":"Email"},{"name":"loyaltyPoints","type":"Integer"}]}},{"objectType":"Command","ids":{"boundedContextId":"bc-customer","aggregateId":"agg-customer","commandId":"cmd-decrease-loyalty-points"},"args":{"commandName":"DecreaseLoyaltyPoints","api_verb":"PUT","outputEventIds":["evt-loyalty-points-decreased"],"actor":"System"}},{"objectType":"Event","ids":{"boundedContextId":"bc-customer","aggregateId":"agg-customer","eventId":"evt-loyalty-points-decreased"},"args":{"eventName":"LoyaltyPointsDecreased"}},{"objectType":"Command","ids":{"boundedContextId":"bc-customer","aggregateId":"agg-customer","commandId":"cmd-increase-loyalty-points"},"args":{"commandName":"IncreaseLoyaltyPoints","api_verb":"PUT","outputEventIds":["evt-loyalty-points-increased"],"actor":"System"}},{"objectType":"Event","ids":{"boundedContextId":"bc-customer","aggregateId":"agg-customer","eventId":"evt-loyalty-points-increased"},"args":{"eventName":"LoyaltyPointsIncreased"}},{"objectType":"BoundedContext","ids":{"boundedContextId":"bc-product"},"args":{"boundedContextName":"Product Management"}},{"objectType":"Aggregate","ids":{"boundedContextId":"bc-product","aggregateId":"agg-product"},"args":{"aggregateName":"Product","properties":[{"name":"productId","type":"Long","isKey":true},{"name":"name","type":"String"},{"name":"description","type":"String"},{"name":"price","type":"Money"},{"name":"stockQuantity","type":"Integer"}]}},{"objectType":"Command","ids":{"boundedContextId":"bc-product","aggregateId":"agg-product","commandId":"cmd-decrease-stock-quantity"},"args":{"commandName":"DecreaseStockQuantity","api_verb":"PUT","outputEventIds":["evt-stock-quantity-decreased"],"actor":"System"}},{"objectType":"Event","ids":{"boundedContextId":"bc-product","aggregateId":"agg-product","eventId":"evt-stock-quantity-decreased"},"args":{"eventName":"StockQuantityDecreased","outputCommandIds":[{"commandId":"cmd-increase-loyalty-points","relatedAttribute":"loyaltyPoints","reason":"Increase customer loyalty points after successful order"}]}},{"objectType":"Command","ids":{"boundedContextId":"bc-product","aggregateId":"agg-product","commandId":"cmd-increase-stock-quantity"},"args":{"commandName":"IncreaseStockQuantity","api_verb":"PUT","outputEventIds":["evt-stock-quantity-increased"],"actor":"System"}},{"objectType":"Event","ids":{"boundedContextId":"bc-product","aggregateId":"agg-product","eventId":"evt-stock-quantity-increased"},"args":{"eventName":"StockQuantityIncreased"}}]}
\`\`\`

`
    }

    _getUserPrompt(ddl, suggestedStructures, boundedContexts, functionRequests){
        return `Now let's process the user's input.
[INPUT]
- DDL
${ddl}

- The EventStorming structure you need to create 
${JSON.stringify(suggestedStructures)}

- Bounded Contexts to Create and Utilize
${boundedContexts.join(", ")}

- Functional Requirements
${functionRequests}

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