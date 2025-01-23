class IdentifyElementGenerator extends FormattedJSONAIGenerator {
    constructor(client) {
        super(client);
    }

    __buildAgentRolePrompt() {
        return `You are an expert in Event Storming, specializing in identifying and managing elements within bounded contexts. Your task is to analyze user inputs and determine the necessary actions (add, modify, delete) for each Event Storming element. Ensure that the identified actions align with best practices and business requirements.`;
    }

    __buildTaskGuidelinesPrompt() {
        return `Follow these guidelines when identifying elements to add, modify, or delete:
1. Analyze the user's chat history and requested modifications.
2. Identify the specific Event Storming elements (Bounded Context, Aggregate, Command, Event, ReadModel, Actor) that need changes.
3. For each identified element, determine the appropriate action:
   - **Add**: Introduce new elements that fulfill the functional requirements.
   - **Modify**: Update existing elements to better align with the requirements.
   - **Delete**: Remove elements that are no longer necessary or redundant.
4. Ensure that all actions maintain the integrity and consistency of the overall Event Storming model.
5. Provide clear and concise descriptions for each suggested action.`;
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
            "chatHistory": "User wants to update the Order Aggregate by adding a new Event 'OrderShipped'.",
            "elementsToModify": ["Aggregate: Order", "Event: OrderCreated"],
            "additionalInfo": "Ensure that the new event aligns with the existing order processing workflow."
        };
    }

    __buildJsonExampleOutputFormat() {
        return {
            "actions": [
                {
                    "elementType": "Event",
                    "elementName": "OrderShipped",
                    "action": "Add",
                    "details": "Add a new event 'OrderShipped' to the Order Aggregate to indicate when an order has been shipped."
                },
                {
                    "elementType": "Event",
                    "elementName": "OrderCreated",
                    "action": "Modify",
                    "details": "Update the 'OrderCreated' event to include the shipping details."
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