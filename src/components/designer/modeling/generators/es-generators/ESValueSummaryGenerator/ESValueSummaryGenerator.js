
const FormattedJSONAIGenerator = require("../../FormattedJSONAIGenerator");
const { ESValueSummarizeWithFilter } = require("../helpers")
const ESAliasTransManager = require("../../es-ddl-generators/modules/ESAliasTransManager")
const { TokenCounter } = require("../../utils")
const { z } = require("zod")
const { zodResponseFormat } = require("../../utils")

class ESValueSummaryGenerator extends FormattedJSONAIGenerator{
    constructor(client){
        super(client);

        this.checkInputParamsKeys = ["context", "esValue", "keysToFilter", "maxTokens", "tokenCalcModel", "esAliasTransManager"]
        this.progressCheckStrings = ["result"]
        this.response_format = zodResponseFormat(
            z.object({
                result: z.object({
                    sortedElementIds: z.array(z.string())
                }).strict()
            }).strict(),
            "instruction"
        )
    }

    /**
     * @description 이벤트 스토밍 모델의 데이터를 주어진 토큰 제한에 맞게 요약하여 반환하는 함수입니다.
     * 주어진 컨텍스트를 기반으로 중요도에 따라 요소들을 정렬하고, 토큰 제한을 초과하는 경우
     * 우선순위가 낮은 요소들을 제거하여 요약된 결과를 생성합니다.
     * 
     * @example 기본적인 토큰 제한 요약
     * // 토큰 제한이 800인 경우의 기본 사용 예시
     * const esValue = mocks.getEsValue("libraryService")
     * const summary = await ESValueSummaryGenerator.getSummarizedESValueWithMaxTokenSummarize(
     *     "도서 관련 커맨드 생성 작업을 수행해야 함",    // 현재 작업 컨텍스트
     *     esValue,                                    // 전체 이벤트 스토밍 모델 데이터
     *     [],                                         // 필터링할 키 목록 (빈 배열은 필터링 없음)
     *     800,                                        // 최대 토큰 수
     *     "gpt-4o",                                   // 토큰 계산 모델
     *     new ESAliasTransManager(esValue)            // 별칭 관리자
     * );
     * console.log("[*] 요약된 ESValue 토큰 수 :", TokenCounter.getTokenCount(
     *     JSON.stringify(summary), "gpt-4o"
     * ));
     * 
     * @note
     * - 토큰 제한을 초과하지 않는 경우 원본 데이터를 그대로 반환합니다.
     * - 컨텍스트를 기반으로 요소들의 우선순위를 결정하므로, 명확한 컨텍스트 제공이 중요합니다.
     * - 토큰 계산 모델은 정확한 토큰 수 계산을 위해 실제 사용할 모델과 일치해야 합니다.
     * - 필터링할 키 목록에는 ["properties", "events", "name"] 와 같은 속성 키가 들어 갈 수 있습니다.
     */
    static async getSummarizedESValueWithMaxTokenSummarize(context, esValue, keysToFilter, maxTokens, tokenCalcModel, esAliasTransManager){
        const summarizedESValue = ESValueSummarizeWithFilter.getSummarizedESValue(
            esValue, keysToFilter, esAliasTransManager
        )

        const tokenCount = TokenCounter.getTokenCount(JSON.stringify(summarizedESValue), tokenCalcModel)
        if(tokenCount <= maxTokens)
            return summarizedESValue


        return new Promise((resolve, reject) => {
            const esValueSummaryGenerator = new ESValueSummaryGenerator({
                input: {
                    "context": context,
                    "esValue": esValue,
                    "keysToFilter": keysToFilter,
                    "maxTokens": maxTokens,
                    "tokenCalcModel": tokenCalcModel,
                    "esAliasTransManager": esAliasTransManager
                },
    
                onModelCreated: (returnObj) => {
                    
                },
    
                onGenerationSucceeded: (returnObj) => {
                    resolve(returnObj.modelValue.summary)
                },

                onRetry: (returnObj) => {
                    reject(returnObj.errorMessage)
                }
            })
    
            esValueSummaryGenerator.generate()
        })
    }

    onInputParamsCheckBefore(inputParams) {
        inputParams.esValue = JSON.parse(JSON.stringify(inputParams.esValue))
        if(!inputParams.esAliasTransManager)
            inputParams.esAliasTransManager = new ESAliasTransManager(inputParams.esValue)
    }

    onGenerateBefore(inputParams){
        if(inputParams.keysToFilter.includes("id"))
            throw new Error("id 속성은 정렬에 사용되기 때문에 필터링에서 제외되어야 합니다.")
 
        inputParams.summarizedESValue = ESValueSummarizeWithFilter.getSummarizedESValue(
            inputParams.esValue, inputParams.keysToFilter, inputParams.esAliasTransManager
        )
    }


    __buildAgentRolePrompt(){
        return `You are an expert context analyzer and DDD specialist focusing on event storming elements. Your expertise includes:
- Analyzing relationships between different event storming elements in a given context
- Understanding dependencies and hierarchies in domain-driven design
- Evaluating the relevance and importance of elements based on context
- Organizing and prioritizing elements based on their contextual relationships
- Identifying core domain concepts and their supporting elements
`
    }

    __buildTaskGuidelinesPrompt(){
        return `You are given a list of IDs for each element used in event stemming, and you need to return them sorted in order of relevance to the context in which they were passed.

Please follow these rules:
1. Do not write comments in the output JSON object.

Here's what each prefix in the element IDs means:
- bc-: Bounded Context
- act-: Actor
- agg-: Aggregate
- cmd-: Command
- evt-: Event
- rm-: Read Model
- enum-: Enumeration
- vo-: Value Object

For example, "bc-bookManagement" represents a Bounded Context named "bookManagement".
`
    }

    __buildJsonResponseFormat() {
        return `
{
    "result": {
        "sortedElementIds": [
            "<id1>",
            ...
        ]
    }
}        
`
    }

    __buildInferenceGuidelinesPrompt() {
        return `
Inference Guidelines:
1. The process of reasoning should be directly related to the output result, not a reference to a general strategy.

2. Contextual Analysis:
    - Analyze the given context to understand the primary business domain and the specific scenario.
    - Identify the core elements and their relationships within the context.
    - Determine how each element relates to the overall business process or user interaction.

3. Element Relationships:
    - Examine the dependencies and connections between different EventStorming elements.
    - Identify direct relationships, such as commands triggering events or aggregates containing entities.
    - Consider indirect relationships, such as read models being updated by events.

4. Sorting Strategy:
    - Prioritize elements that are directly involved in the main process or scenario described in the context.
    - Place elements with direct relationships closer together in the sorted list.
    - Consider the order of operations or the flow of data when determining the sequence.
    - Elements with less direct relevance should be placed lower in the priority.

5. Additional Considerations:
    - Think about any potential side effects or downstream impacts of the main process.
    - Consider how the ordering of elements might affect system understanding, documentation, or future development.
    - Identify any elements that might have implications for other parts of the system.
`   
    }

    __buildJsonExampleInputFormat() {
        return {
            "Context": "Adding cancel order command to Order aggregate",
            "EventStorming Element Ids": [
                "bc-orderManagement",
                "bc-productCatalog",
                "bc-userManagement",
                "act-customer",
                "act-admin",
                "agg-order",
                "agg-product",
                "agg-user",
                "cmd-cancelOrder",
                "cmd-createOrder",
                "cmd-updateProduct",
                "evt-orderCanceled",
                "evt-orderCreated",
                "evt-productUpdated",
                "rm-orderHistory",
                "rm-productInventory",
                "enum-orderStatus",
                "enum-productCategory",
                "vo-address",
                "vo-money"
            ]
        }
    }

    __buildJsonExampleOutputFormat() {
        return {
            "result": {
                "sortedElementIds": [
                    "bc-orderManagement",
                    "agg-order",
                    "cmd-cancelOrder",
                    "evt-orderCanceled",
                    "act-customer",
                    "act-admin",
                    "enum-orderStatus",
                    "rm-orderHistory",
                    "cmd-createOrder",
                    "evt-orderCreated",
                    "vo-money",
                    "bc-productCatalog",
                    "agg-product",
                    "cmd-updateProduct",
                    "evt-productUpdated",
                    "rm-productInventory",
                    "enum-productCategory",
                    "bc-userManagement",
                    "agg-user",
                    "vo-address"
                ]
            }
        }
    }

    __buildJsonUserQueryInputFormat() {
        return {
            "Context": this.client.input.context,
            "EventStorming Element Ids": this._getIdsFromSummarizedESValue(this.client.input.summarizedESValue),
        }
    }

    _getIdsFromSummarizedESValue(summarizedESValue) {
        const ids = new Set();

        const extractIds = (obj) => {
            if (!obj || typeof obj !== 'object') return;
    
            if (obj.id) {
                ids.add(obj.id);
            }
    
            if (Array.isArray(obj)) {
                obj.forEach(item => extractIds(item));
            } else {
                Object.values(obj).forEach(value => extractIds(value));
            }
        };
    
        extractIds(summarizedESValue);
        return Array.from(ids);
    }


    onCreateModelGenerating(returnObj){
        returnObj.directMessage = `Summarizing EventStorming Model... (${returnObj.modelRawValue.length} characters generated)`
    }

    onCreateModelFinished(returnObj){
        const sortedElementIds = returnObj.modelValue.aiOutput.result.sortedElementIds
        console.log("[*] 생성된 엘리먼트 Id 정렬 순서: ", JSON.parse(JSON.stringify(sortedElementIds)))

        const reSortedElementIds = this._resortWithPriority(this.client.input.summarizedESValue, sortedElementIds)
        console.log("[*] 재정렬된 엘리먼트 Id 정렬 순서: ", JSON.parse(JSON.stringify(reSortedElementIds)))

        const summary = this._getSummaryWithinTokenLimit(
            this.client.input.summarizedESValue,
            reSortedElementIds,
            this.client.input.maxTokens,
            this.client.input.tokenCalcModel
        )

        returnObj.modelValue = {
            ...returnObj.modelValue,
            summary: summary,
        }
        returnObj.directMessage = `Summarizing EventStorming Model... (${returnObj.modelRawValue.length} characters generated)`
    }

    _resortWithPriority(summarizedESValue, sortedElementIds) {
        const bcGroups = new Map();
        const nonBcElements = new Set(sortedElementIds);
    

        summarizedESValue.boundedContexts.forEach(bc => {
            bcGroups.set(bc.id, {
                bc: bc.id,
                aggs: new Map(),
                originalOrder: sortedElementIds.indexOf(bc.id)
            });
            nonBcElements.delete(bc.id);

            if(bc.aggregates)
                bc.aggregates.forEach(agg => {
                    const group = bcGroups.get(bc.id)

                    group.aggs.set(agg.id, {
                        agg: agg.id,
                        elements: [],
                        originalOrder: sortedElementIds.indexOf(agg.id)
                    })
                    nonBcElements.delete(agg.id);

                    const aggGroup = group.aggs.get(agg.id)

                    
                    const aggregateElements = new Set();
                    ['valueObjects', 'enumerations', 'entities', 'commands', 'events', 'readModels'].forEach(type => {
                        if(agg[type])
                            agg[type].forEach(element => {
                                aggregateElements.add(element.id);
                            });
                    });


                    sortedElementIds.forEach(id => {
                        if (aggregateElements.has(id)) {
                            aggGroup.elements.push(id);
                            nonBcElements.delete(id);
                        }
                    });
                });
        });
    
 
        const result = [];
        Array.from(bcGroups.values())
            .sort((a, b) => a.originalOrder - b.originalOrder)
            .forEach(group => {
                result.push(group.bc);

                Array.from(group.aggs.values())
                    .sort((a, b) => a.originalOrder - b.originalOrder)
                    .forEach(agg => {
                        result.push(agg.agg);
                        result.push(...agg.elements);
                    });
            });
    
            
        sortedElementIds.forEach(id => {
            if (nonBcElements.has(id)) {
                result.push(id);
            }
        });
        return result;
    }

    _getSummaryWithinTokenLimit(summarizedESValue, sortedElementIds, maxTokens, tokenCalcModel) {
        const elementIds = [...sortedElementIds];
        let priorityIndex = elementIds.length;
    
        let result = JSON.parse(JSON.stringify(summarizedESValue));
        
        const filterByPriority = (obj) => {
            if (Array.isArray(obj)) {
                const filtered = obj
                    .filter(item => {
                        if (!item.id) return true;
                        const index = elementIds.indexOf(item.id);
                        return index !== -1 && index < priorityIndex;
                    })
                    .sort((a, b) => {
                        if (!a.id || !b.id) return 0;
                        return elementIds.indexOf(a.id) - elementIds.indexOf(b.id);
                    })
                    .map(item => filterByPriority(item));
                return filtered;
            } else if (obj && typeof obj === 'object') {
                const filtered = {};
                for (const [key, value] of Object.entries(obj)) {
                    filtered[key] = filterByPriority(value);
                }
                return filtered;
            }
            return obj;
        };
    
        while (priorityIndex > 0) {
            const filtered = filterByPriority(result);
            const jsonString = JSON.stringify(filtered);
            
            if (TokenCounter.isWithinTokenLimit(jsonString, tokenCalcModel, maxTokens)) {
                return filtered;
            }
    
            priorityIndex--;
        }
    
        return filterByPriority(result);
    }
}

module.exports = ESValueSummaryGenerator;