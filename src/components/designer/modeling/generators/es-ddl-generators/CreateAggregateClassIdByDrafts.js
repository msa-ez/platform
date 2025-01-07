
const FormattedJSONAIGenerator = require("../FormattedJSONAIGenerator");
const ESActionsUtil = require("./modules/ESActionsUtil")
const { ESValueSummarizeWithFilter } = require("../es-generators/helpers")
const ActionsProcessorUtils = require("./modules/ESActionsUtilProcessors/ActionsProcessorUtils")
const ESAliasTransManager = require("./modules/ESAliasTransManager")
const changeCase = require('change-case');

class CreateAggregateClassIdByDrafts extends FormattedJSONAIGenerator{
    constructor(client){
        super(client);

        this.checkInputParamsKeys = ["draftOption", "targetReferences", "esValue", "userInfo", "information"]
        this.progressCheckStrings = ["overviewThoughts", "actions"]
    }


    onGenerateBefore(inputParams){
        inputParams.esValue = JSON.parse(JSON.stringify(inputParams.esValue))
        this.esAliasTransManager = new ESAliasTransManager(inputParams.esValue)
    }


    __buildAgentRolePrompt(){
        return `You are a DDD expert specializing in:
1. Domain model design and implementation
2. Bounded context definition
3. Aggregate pattern optimization
4. Clean architecture principles

Key focus areas:
- Domain model integrity
- Aggregate boundaries
- Context mapping
- Strategic design patterns
`
    }

    __buildTaskGuidelinesPrompt(){
        return `You will need to create the appropriate ValueObject that references other Aggregates as foreign keys, based on the provided EventStorming configuration draft.

Please follow these rules:
1. Foreign Key Value Object Generation:
   * CRITICAL: Only implement ONE DIRECTION of reference between aggregates
   * When choosing direction, consider:
     - Which aggregate is the owner of the relationship
     - Which side is more stable and less likely to change
     - Query patterns and performance requirements
   * Example: In Order-Customer relationship, Order should reference Customer (not vice-versa)

2. Relationship Direction Decision:
   * NEVER create bidirectional references, even if suggested in the draft
   * For each pair of aggregates, choose only ONE direction based on:
     - Lifecycle dependency (dependent aggregate references the independent one)
     - Business invariants (aggregate enforcing rules references required data)
     - Access patterns (optimize for most frequent queries)

3. Property Replication:
   * Only replicate properties that are highly unlikely to change (e.g., birthDate, gender)
   * These near-immutable properties are safe for caching as they remain constant throughout the entity's lifecycle
   * Strictly avoid replicating volatile properties that change frequently
   * Each replicated property must be justified based on its immutability and business value
   * Examples of safe-to-replicate properties:
     - Date of birth (remains constant)
     - Gender (rarely changes)
     - Country of birth (permanent)
   * Examples of properties to avoid replicating:
     - Address (frequently changes)
     - Email (moderately volatile)
     - Phone number (changes occasionally)

4. Technical Considerations:
   * Handle composite keys appropriately when referenced Aggregate uses multiple identifiers
   * Include proper indexing hints for foreign key fields
   * Consider implementing lazy loading for referenced data
   * Maintain referential integrity through proper constraints

5. Edge Cases:
   * Handle null references and optional relationships
   * Consider cascade operations impact
   * Plan for reference cleanup in case of Aggregate deletion
   * Implement proper validation for circular references

6. Output Format:
   * Provide clean JSON without comments
   * Use consistent property naming
   * Include all required metadata
   * Specify proper data types and constraints

7. Output Limit
   * Generate the appropriate ValueObject only for the referceAggregate corresponding to the given targetReferences. However, if the creation of a ValueObject for a given targetReferences also creates bidirectional references, only one of them should be created as a ValueObject.
`
    }

    __buildRequestFormatPrompt(){
        return ESValueSummarizeWithFilter.getGuidePrompt()
    }

    __buildJsonResponseFormat() {
        return `
{
    "overviewThoughts": {
        "summary": "High-level strategic analysis of the value object's role in the domain",
        "details": {
            "domainAlignment": "How the value object fits into the broader domain model and business rules",
            "boundaryDecisions": "Key decisions about aggregate boundaries and relationships",
            "technicalImpact": "Major technical implications and architectural considerations"
        },
        "additionalConsiderations": "Any cross-cutting concerns or special cases to be aware of"
    },

    "result": {
        "actions": [
            {
                "actionThoughts": {
                    "summary": "Tactical design decisions for implementing the value object",
                    "details": {
                        "relationshipPattern": "Chosen relationship pattern and its justification",
                        "invariantProtection": "How the design maintains domain invariants",
                        "dataConsistency": "Strategy for maintaining data consistency"
                    },
                    "additionalConsiderations": "Implementation-specific concerns or limitations"
                },

                "objectType": "ValueObject",
                "ids": {
                    "boundedContextId": "<boundedContextId>",
                    "aggregateId": "<aggregateId>",
                    "valueObjectId": "<valueObjectId>"
                },
                "args": {
                    "valueObjectName": "<valueObjectName>",
                    "referenceClass": "<referenceClassName>",

                    "propertyThoughts": {
                        "summary": "Property-level design considerations",
                        "details": {
                            "immutability": "Analysis of property immutability and lifecycle",
                            "referentialIntegrity": "How references maintain integrity across aggregates",
                            "performanceImpact": "Performance implications of property choices"
                        },
                        "additionalConsiderations": "Special handling requirements for specific properties"
                    },
                    "properties": [
                        {
                            "name": "<propertyName>",
                            ["type": "<propertyType>"], // If the type is String, do not specify the type.
                            ["isKey": true] // Write only if there is a primary key.
                        }
                    ]
                }
            }
        ]
    }
}`
    }


    __buildJsonExampleInputFormat() {
        return {
            "Summarized Existing EventStorming Model": {
                "deletedProperties": ESValueSummarizeWithFilter.KEY_FILTER_TEMPLATES.aggregateOuterStickers,
                "boundedContexts": [
                    {
                        "id": "bc-order",
                        "name": "orderservice",
                        "aggregates": [
                            {
                                "id": "agg-order",
                                "name": "Order",
                                "properties": [
                                    {
                                        "name": "orderId",
                                        "type": "Long",
                                        "isKey": true
                                    },
                                    {
                                        "name": "orderDate",
                                        "type": "Date"
                                    },
                                    {
                                        "name": "totalAmount",
                                        "type": "Money"
                                    }
                                ]
                            },
                            {
                                "id": "agg-customer",
                                "name": "Customer",
                                "properties": [
                                    {
                                        "name": "customerId",
                                        "type": "Long",
                                        "isKey": true
                                    },
                                    {
                                        "name": "name"
                                    },
                                    {
                                        "name": "gender"
                                    },
                                    {
                                        "name": "birthDate",
                                        "type": "Date"
                                    },
                                    {
                                        "name": "email"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },

            "Suggested Structure": {
                "OrderManagement": [
                    {
                        "aggregate": {
                            "name": "Order",
                            "alias": "Order"
                        },
                        "valueObjects": [
                            {
                                "name": "CustomerReference",
                                "alias": "Customer Reference",
                                "referencedAggregate": {
                                    "name": "Customer",
                                    "alias": "Customer"
                                }
                            }
                        ]
                    }
                ],
                "CustomerManagement": [
                    {
                        "aggregate": {
                            "name": "Customer",
                            "alias": "Customer"
                        },
                        "valueObjects": [
                            {
                                "name": "OrderReference",
                                "alias": "Order Reference",
                                "referencedAggregate": {
                                    "name": "Order",
                                    "alias": "Order"
                                }
                            }
                        ]
                    }
                ]
            },

            "Target References": ["OrderReference", "CustomerReference"]
        }
    }

    __buildJsonExampleOutputFormat() {
        return {
            "overviewThoughts": {
                "summary": "Strategic analysis of Order-Customer relationship in the domain model",
                "details": {
                    "domainAlignment": "Order aggregate requires essential Customer information for business operations",
                    "boundaryDecisions": "Implementing unidirectional relationship from Order to Customer to maintain clear boundaries",
                    "technicalImpact": "Optimizing for query performance while ensuring data consistency"
                },
                "additionalConsiderations": "Need to carefully manage cached Customer properties in Order context"
            },
    
            "result": {
                "actions": [
                    {
                        "actionThoughts": {
                            "summary": "Implementing Customer reference within Order aggregate",
                            "details": {
                                "relationshipPattern": "Unidirectional reference from Order to Customer with selective property replication",
                                "invariantProtection": "Ensuring Customer existence through foreign key constraint",
                                "dataConsistency": "Caching only immutable Customer properties"
                            },
                            "additionalConsiderations": "Regular validation of cached property immutability"
                        },
    
                        "objectType": "ValueObject",
                        "ids": {
                            "boundedContextId": "bc-order",
                            "aggregateId": "agg-order",
                            "valueObjectId": "vo-customer-id"
                        },
                        "args": {
                            "valueObjectName": "CustomerReference",
                            "referenceClass": "Customer",
    
                            "propertyThoughts": {
                                "summary": "Careful selection of Customer properties to include",
                                "details": {
                                    "immutability": "Selected properties (gender, birthDate) are naturally immutable",
                                    "referentialIntegrity": "CustomerId ensures proper reference maintenance",
                                    "performanceImpact": "Cached properties reduce cross-aggregate queries"
                                },
                                "additionalConsiderations": "Regular monitoring of property usage patterns"
                            },
                            "properties": [
                                {
                                    "name": "customerId",
                                    "type": "Long",
                                    "isKey": true
                                },
                                {
                                    "name": "gender"
                                },
                                {
                                    "name": "birthDate",
                                    "type": "Date"
                                }
                            ]
                        }
                    }
                    // Note: Deliberately NOT including reverse reference from Customer to Order
                ]
            }
        }
    }

    __buildJsonUserQueryInputFormat() {
        const summarizedESValue = ESValueSummarizeWithFilter.getSummarizedESValue(
            JSON.parse(JSON.stringify(this.client.input.esValue)), 
            ESValueSummarizeWithFilter.KEY_FILTER_TEMPLATES.aggregateOuterStickers, this.esAliasTransManager)

        return {
            "Summarized Existing EventStorming Model": JSON.stringify(summarizedESValue),

            "Suggested Structure": JSON.stringify(this.client.input.draftOption),

            "Target References": this.client.input.targetReferences,

            "Final Check": `
CRITICAL RULES FOR REFERENCE GENERATION:
1. STRICT UNIDIRECTIONAL REFERENCE ONLY:
   - When draft shows two-way relationship, you MUST choose only ONE direction
   - Never generate both directions of references
   - Example: If Order->Customer and Customer->Order are in draft, implement ONLY Order->Customer

2. Direction Selection Criteria:
   - Choose based on dependency (dependent entity references independent one)
   - Consider lifecycle management (e.g., Order depends on Customer)
   - Optimize for most common query patterns

3. Property Guidelines:
   - Avoid adding properties that might change
   - Include only the minimum required reference properties

4. Implementation Check:
   - Verify you're generating only ONE direction of reference
   - Double-check you haven't created any bidirectional references
`,
        }
    }


    onCreateModelGenerating(returnObj){
        returnObj.directMessage = `Creating Class IDs... (${returnObj.modelRawValue.length} characters generated)`
    }

    onCreateModelFinished(returnObj){
        let actions = returnObj.modelValue.aiOutput.result.actions
        this._filterInvalidActions(actions)
        this._filterBidirectionalActions(actions)
        if(actions.length === 0)
            throw new Error("No actions generated")

        let {actions: appliedActions, createdESValue: createdESValue} = this._getActionAppliedESValue(actions)

        returnObj.modelValue = {
            ...returnObj.modelValue,
            actions: appliedActions,
            createdESValue: createdESValue
        }
        returnObj.directMessage = `Creating Class IDs... (${returnObj.modelRawValue.length} characters generated)`
    }

    _filterInvalidActions(actions){
         for(let i = actions.length - 1; i >= 0; i--) {
            const action = actions[i]
            if(!action.args || !action.args.valueObjectName) continue
            
            const isValidReference = this.client.input.targetReferences.some(
                target => action.args.valueObjectName.toLowerCase().includes(target.toLowerCase())
            );
            
            if (!isValidReference) {
                actions.splice(i, 1);
            }
        }
    }

    _filterBidirectionalActions(actions){
        for (let i = 0; i < actions.length; i++) {
            const action1 = actions[i];
            const agg1Name = this.client.input.esValue.elements[this.esAliasTransManager.getUUIDSafely(action1.ids.aggregateId)].name;
            if(!agg1Name) continue
            
            for (let j = i + 1; j < actions.length; j++) {
                const action2 = actions[j];
                const agg2Name = this.client.input.esValue.elements[this.esAliasTransManager.getUUIDSafely(action2.ids.aggregateId)].name;
                if(!agg2Name) continue
                
                if (action1.args.referenceClass === agg2Name && 
                    action2.args.referenceClass === agg1Name) {
                    actions.splice(j, 1);
                    j--; 
                }
            }
        }
    }

    _getActionAppliedESValue(actions) {
        actions = this.esAliasTransManager.transToUUIDInActions(actions)
        this._modifyActionsForReferenceClassValueObject(actions)

        let esValueToModify = JSON.parse(JSON.stringify(this.client.input.esValue))

        let createdESValue = ESActionsUtil.getActionAppliedESValue(actions, this.client.input.userInfo, this.client.input.information, esValueToModify)

        return { actions, createdESValue }
    }

    _modifyActionsForReferenceClassValueObject(actions){
        let actionsToAdd = []
        for (let action of actions) {
            if (!action.args || !action.args.properties) continue;

            const fromAggregate = this.client.input.esValue.elements[action.ids.aggregateId]
            const toAggregate = this.__getAggregateByName(this.client.input.esValue, action.args.referenceClass)
            if(!fromAggregate || !toAggregate) {
                console.warn("[*] 참조 Aggregate를 발견하지 못해서 Aggregate 관계를 형성하지 못함", {action})
                continue
            }
            

            action.args.valueObjectName = `${toAggregate.name}Id`

            const toAggregateKeyProp = toAggregate.aggregateRoot.fieldDescriptors.find(prop => prop.isKey)
            if (!toAggregateKeyProp) continue

            const actionKeyProp = action.args.properties.find(prop => prop.isKey)
            if (actionKeyProp) {
                actionKeyProp.name = toAggregateKeyProp.name
                actionKeyProp.type = toAggregateKeyProp.className
                actionKeyProp.isKey = true
                actionKeyProp.referenceClass = toAggregate.name
                actionKeyProp.isOverrideField = true
            }


            this._addAggregateRelation(fromAggregate, toAggregate, this.client.input.esValue)


            actionsToAdd.push(
                {
                    "objectType": "Aggregate",
                    "type": "update",
                    "ids": {
                        "boundedContextId": action.ids.boundedContextId,
                        "aggregateId": action.ids.aggregateId
                    },
                    "args": {
                        "properties": [
                            {
                                "name": changeCase.camelCase(action.args.valueObjectName),
                                "type": action.args.valueObjectName,
                                "referenceClass": toAggregate.name,
                                "isOverrideField": true
                            }
                        ]
                    }
                },
            )
        }
        actions.push(...actionsToAdd)
    }

    _addAggregateRelation(fromAggregate, toAggregate, esValue){
        for(const relation of Object.values(esValue.relations).filter(relation => relation)) {
            if(relation.sourceElement && relation.targetElement) {
                if(relation.sourceElement.id === fromAggregate.id && relation.targetElement.id === toAggregate.id)
                    return
            }
        }

        const aggregateRelation = ActionsProcessorUtils.getEventStormingRelationObjectBase(fromAggregate, toAggregate)
        console.log("[*] 생성된 관계 추가", {aggregateRelation})
        esValue.relations[aggregateRelation.id] = aggregateRelation   
    }


    __getAggregateByName(esValue, aggregateName){
        for(let element of Object.values(esValue.elements).filter(element => element)) {
            if(element._type === "org.uengine.modeling.model.Aggregate" && element.name === aggregateName && element.id)
                return element
        }
        return null
    }
}

module.exports = CreateAggregateClassIdByDrafts;