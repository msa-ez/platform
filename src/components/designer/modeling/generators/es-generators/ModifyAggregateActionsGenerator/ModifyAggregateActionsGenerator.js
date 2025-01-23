const FormattedJSONAIGenerator = require("../../FormattedJSONAIGenerator");
const { ESValueSummaryGenerator } = require("..");
const ESAliasTransManager = require("../../es-ddl-generators/modules/ESAliasTransManager");
const { ESValueSummarizeWithFilter } = require("../helpers");
const ESActionsUtil = require("../../es-ddl-generators/modules/ESActionsUtil");
const ESFakeActionsUtil = require("../../es-ddl-generators/modules/ESFakeActionsUtil");

class ModifyAggregateActionsGenerator extends FormattedJSONAIGenerator {
    constructor(client) {
        super(client);

        this.checkInputParamsKeys = ["targetBoundedContext", "description", "modificationOptions", "esValue", "userInfo", "information", "isAccumulated"];
        this.progressCheckStrings = ["overviewThoughts", "actions"];
    }

    __buildAgentRolePrompt() {
        return `You are a Domain-Driven Design (DDD) expert specializing in:
1. Analyzing and modifying existing domain models based on user requirements
2. Designing and refining bounded contexts and aggregates
3. Implementing event sourcing and CQRS patterns
4. Enhancing maintainable and scalable domain structures

Focus on:
- Strategic DDD principles
- Aggregate modification best practices
- Clear and consistent domain boundaries
- Precise naming conventions`;
    }

    __buildTaskGuidelinesPrompt() {
        return `Follow these guidelines when modifying Event Storming elements:
1. Analyze the user's chat history and requested modifications.
2. Identify the specific Event Storming elements (Bounded Context, Aggregate, Command, Event, ReadModel, Actor) that need to be added, modified, or deleted.
3. For each identified element, determine the appropriate action:
   - **Add**: Introduce new elements that fulfill the updated requirements.
   - **Modify**: Update existing elements to better align with the new requirements.
   - **Delete**: Remove elements that are no longer necessary or redundant.
4. Ensure that all actions maintain the integrity and consistency of the overall Event Storming model.
5. Provide clear and concise descriptions for each suggested action.
6. Validate that modifications do not violate existing domain rules or constraints.`;
    }

    __buildRequestFormatPrompt() {
        return `Format your response in JSON, detailing the actions required for each Event Storming element. The JSON should contain a list of actions with the following structure:
{
    "actions": [
        {
            "elementType": "<BoundedContext|Aggregate|Command|Event|ReadModel|Actor>",
            "elementName": "<Name of the element>",
            "action": "<Add|Modify|Delete>",
            "details": "<Detailed description of the action>"
        },
        ...
    ]
}`;
    }

    __buildResponseFormatPrompt() {
        const jsonFormat = this.__buildJsonResponseFormat();
        const afterJsonFormat = this.__buildAfterJsonResponseFormat();

        if (!jsonFormat) return "";
        return `You should return a list containing JSON objects for performing specific actions.
The returned format should be as follows.
\`\`\`json
${jsonFormat.trim()}
\`\`\`

${afterJsonFormat.trim()}
`;
    }

    __buildJsonResponseFormat() {
        return `
{
    "actions": [
        {
            "elementType": "<BoundedContext|Aggregate|Command|Event|ReadModel|Actor>",
            "elementName": "<Name of the element>",
            "action": "<Add|Modify|Delete>",
            "details": "<Detailed description of the action>"
        }
    ]
}
`;
    }

    __buildAfterJsonResponseFormat() {
        return `Ensure that the JSON is well-formatted and all necessary actions are included based on the user's requirements. Do not include any additional information outside the JSON structure.`;
    }

    __buildJsonExampleInputFormat() {
        return {
            "chatHistory": "User wants to modify the Order Aggregate by changing the event 'OrderCreated' to include shipping details and adding a new command 'ShipOrder'.",
            "elementsToModify": ["Aggregate: Order", "Event: OrderCreated", "Command: CreateOrder"],
            "additionalInfo": "Ensure that the modifications align with the existing order processing workflow and maintain data consistency."
        };
    }

    __buildJsonExampleOutputFormat() {
        return {
            "actions": [
                {
                    "elementType": "Event",
                    "elementName": "OrderCreated",
                    "action": "Modify",
                    "details": "Update the 'OrderCreated' event to include shipping details such as shipping address and estimated delivery date."
                },
                {
                    "elementType": "Command",
                    "elementName": "ShipOrder",
                    "action": "Add",
                    "details": "Introduce a new command 'ShipOrder' to initiate the shipping process for an order."
                }
            ]
        };
    }

    __buildJsonUserQueryInputFormat() {
        return {
            "chatHistory": this.client.input.chatHistory,
            "elementsToModify": this.client.input.elementsToModify,
            "additionalInfo": this.client.input.additionalInfo
        };
    }
}

module.exports = ModifyAggregateActionsGenerator;