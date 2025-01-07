
const FormattedJSONAIGenerator = require("../../FormattedJSONAIGenerator");
const { ESValueSummarizeWithFilter } = require("../helpers")
const ESAliasTransManager = require("../../es-ddl-generators/modules/ESAliasTransManager")
const { TokenCounter } = require("../../utils")

/**
 * @description EventStorming 모델의 요약 정보를 생성하고 관리하는 클래스입니다.
 * 주어진 컨텍스트에 따라 EventStorming 요소들을 분석하고 토큰 제한에 맞춰 요약된 정보를 생성합니다.
 * 
 * @class
 * @extends {FormattedJSONAIGenerator}
 * 
 * @property {string[]} checkInputParamsKeys - 필수 입력 파라미터 키 목록
 * @property {string[]} progressCheckStrings - 진행 상태 확인을 위한 문자열 목록
 * @property {ESAliasTransManager} esAliasTransManager - ES 별칭 변환 관리자
 * 
 * @constructor
 * @param {Object} client - 클라이언트 설정 객체
 * @param {Object} client.input - 입력 파라미터
 * @param {string} client.input.context - 분석 컨텍스트
 * @param {Object} client.input.esValue - EventStorming 모델 데이터
 * @param {string[]} client.input.keysToFilter - 필터링할 키 목록
 * @param {number} client.input.maxTokens - 최대 토큰 수 제한
 * @param {string} client.input.tokenCalcModel - 토큰 계산 모델
 * 
 * @throws {Error} id 속성이 keysToFilter에 포함된 경우
 * 
 * @see FormattedJSONAIGenerator
 * @see ESAliasTransManager
 * @see ESValueSummarizeWithFilter
 * 
 * @example
 * const generator = new ESValueSummaryGenerator({
 *   input: {
 *     context: "도서 관련 커맨드 생성 작업을 수행해야 함",
 *     esValue: libraryEsValue,
 *     keysToFilter: [],
 *     maxTokens: 800,
 *     tokenCalcModel: "gpt-4o"
 *   },
 *   onModelCreated: (returnObj) => {
 *     // 모델 생성 완료 시 처리
 *   },
 *   onGenerationSucceeded: (returnObj) => {
 *     // 생성 성공 시 처리
 *     console.log("요약 토큰 수:", TokenCounter.getTokenCount(
 *       JSON.stringify(returnObj.modelValue.summary),
 *       "gpt-4o"
 *     ));
 *   }
 * });
 * 
 * generator.generate();
 * 
 * @note
 * - id 속성은 정렬에 사용되므로 필터링할 수 없습니다
 * - 토큰 제한에 맞춰 자동으로 요약 정보가 조정됩니다
 * - 요약된 정보는 JSON 형식으로 제공됩니다
 */
class ESValueSummaryGenerator extends FormattedJSONAIGenerator{
    constructor(client){
        super(client);

        this.checkInputParamsKeys = ["context", "esValue", "keysToFilter", "maxTokens", "tokenCalcModel", "esAliasTransManager"]
        this.progressCheckStrings = ["overviewThoughts", "result"]
    }


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
    "overviewThoughts": {
        "summary": "Analysis of element relationships and their contextual relevance",
        "details": {
            "contextualAnalysis": "Evaluation of how elements relate to the given context and business domain",
            "elementRelationships": "Analysis of dependencies and connections between different elements",
            "sortingStrategy": "Explanation of the prioritization and sorting approach used"
        },
        "additionalConsiderations": "Potential impact of element ordering on system understanding and documentation"
    },

    "result": {
        "sortedElementIds": [
            "<id1>",
            ...
        ]
    }
}        
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
            "overviewThoughts": {
                "summary": "Analyzing elements related to order cancellation functionality",
                "details": {
                    "contextualAnalysis": "Focus on order management bounded context and order cancellation process",
                    "elementRelationships": "Direct relationships between order aggregate, cancel command, and resulting event",
                    "sortingStrategy": "Prioritizing elements directly involved in order cancellation, followed by related order management elements, then peripheral elements"
                },
                "additionalConsiderations": "Order cancellation may trigger inventory updates and affect order history views"
            },
    
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
        const summary = this._getSummaryWithinTokenLimit(
            this.client.input.summarizedESValue,
            returnObj.modelValue.aiOutput.result.sortedElementIds,
            this.client.input.maxTokens,
            this.client.input.tokenCalcModel
        )

        returnObj.modelValue = {
            ...returnObj.modelValue,
            summary: summary,
        }
        returnObj.directMessage = `Summarizing EventStorming Model... (${returnObj.modelRawValue.length} characters generated)`
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