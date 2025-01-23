const FormattedJSONAIGenerator = require("../../FormattedJSONAIGenerator");
const { ESValueSummaryGenerator } = require("..");
const ESAliasTransManager = require("../../es-ddl-generators/modules/ESAliasTransManager");
const { ESValueSummarizeWithFilter } = require("../helpers");
const ESActionsUtil = require("../../es-ddl-generators/modules/ESActionsUtil");
const ESFakeActionsUtil = require("../../es-ddl-generators/modules/ESFakeActionsUtil");

class ModifyCommandActionsGenerator extends FormattedJSONAIGenerator {
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

Your task is to evaluate and modify Event Storming elements such as Commands, Events, ReadModels, and Policies based on user feedback. Ensure all modifications adhere to best practices and maintain the integrity of the overall domain model.`;
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

    onCreateModelGenerating(returnObj) {
        returnObj.directMessage = `Modifying commands for ${this.client.input.aggregateDisplayName} Aggregate... (${returnObj.modelRawValue.length} characters generated)`;

        // Return partial actions to show real-time progress
        const partialActions = returnObj.modelRawValue.match(/({"actionName".*?"objectType".*?"ids".*?"args".*?)(?=,{"actionName")/g);
        if (!partialActions || partialActions.length === 0) return;

        let actions = [];
        for (let action of partialActions) {
            try {
                const actionObj = this._parseToJson(action);
                actions.push(actionObj);
            } catch (e) {}
        }
        if (actions.length === 0) return;

        let { actions: appliedActions, createdESValue: createdESValue } = this._getActionAppliedESValue(actions, true);

        returnObj.modelValue = {
            ...returnObj.modelValue,
            actions: appliedActions,
            createdESValue: createdESValue
        };
        console.log(`[*] Partial results parsed during streaming in ModifyCommandActionsGenerator!`, { returnObj });
    }

    onCreateModelFinished(returnObj) {
        let actions = returnObj.modelValue.aiOutput.result.actions;
        let { actions: appliedActions, createdESValue: createdESValue } = this._getActionAppliedESValue(actions, false);

        returnObj.modelValue = {
            ...returnObj.modelValue,
            actions: appliedActions,
            createdESValue: createdESValue
        };
        returnObj.directMessage = `Modifying commands for ${this.client.input.aggregateDisplayName} Aggregate... (${returnObj.modelRawValue.length} characters generated)`;
    }

    _getActionAppliedESValue(actions, isAddFakeActions) {
        actions = this.client.input.esAliasTransManager.transToUUIDInActions(actions);
        this._restoreActions(actions, this.client.input.esValue, this.client.input.targetBoundedContext.name);
        actions = this._filterActions(actions);
        this._removeEventOutputCommandIdsProperty(actions);

        let esValueToModify = JSON.parse(JSON.stringify(this.client.input.esValue));

        // Add fake actions to prevent bugs when returning partial results
        if (isAddFakeActions)
            actions = ESFakeActionsUtil.addFakeActions(actions, esValueToModify);

        let createdESValue = ESActionsUtil.getActionAppliedESValue(actions, this.client.input.userInfo, this.client.input.information, esValueToModify);

        return { actions, createdESValue };
    }

    _filterActions(actions) {
        const esNames = Object.values(this.client.input.esValue.elements)
            .filter(element => element && element.name)
            .map(element => element.name);
        const displayNames = Object.values(this.client.input.esValue.elements)
            .filter(element => element && element.displayName)
            .map(element => element.displayName.replaceAll(" ", ""));

        actions = actions.filter(action => {
            if (action.objectType === "Command")
                return !esNames.includes(action.args.commandName) && !displayNames.includes(action.args.commandAlias.replaceAll(" ", "")) && !action.args.commandName.toLowerCase().includes("search") && !action.args.commandName.toLowerCase().includes("filter");
            if (action.objectType === "Event")
                return !esNames.includes(action.args.eventName) && !displayNames.includes(action.args.eventAlias.replaceAll(" ", "")) && !action.args.eventName.toLowerCase().includes("search") && !action.args.eventName.toLowerCase().includes("filter");
            if (action.objectType === "ReadModel")
                return !esNames.includes(action.args.readModelName) && !displayNames.includes(action.args.readModelAlias.replaceAll(" ", ""));
            return true;
        });

        const outputEventIds = [];
        for (let action of actions) {
            if (action.objectType === "Command")
                outputEventIds.push(...action.args.outputEventIds);
        }

        actions = actions.filter(action => {
            if (action.objectType === "Event")
                return outputEventIds.includes(action.ids.eventId);
            return true;
        });

        return actions;
    }

    _removeEventOutputCommandIdsProperty(actions) {
        for (let action of actions) {
            if (action.objectType === "Event" && action.args && action.args.outputCommandIds)
                delete action.args.outputCommandIds;
        }
    }

    __getIdByNameInEsValue(name, actions, esValue) {
        for (let action of actions) {
            if (action.args && action.args.commandName && action.args.commandName === name)
                return action.ids.commandId;
            if (action.args && action.args.eventName && action.args.eventName === name)
                return action.ids.eventId;
        }

        for (let element of Object.values(esValue.elements)) {
            if (element && element.name === name && element.id)
                return element.id;
        }

        return null;
    }

    __getTargetBoundedContext(esValue, targetBoundedContextName) {
        let targetBoundedContext = null;
        for (let element of Object.values(esValue.elements).filter(element => element)) {
            if (element._type === "org.uengine.modeling.model.BoundedContext") {
                if (element.name.toLowerCase() === targetBoundedContextName.toLowerCase()) targetBoundedContext = element;
            }
        }
        if (!targetBoundedContext) throw new Error(`${targetBoundedContextName}에 대한 정보를 찾을 수 없습니다.`);
        return targetBoundedContext;
    }
}

module.exports = ModifyCommandActionsGenerator;