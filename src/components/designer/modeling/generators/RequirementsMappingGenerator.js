const FormattedJSONAIGenerator = require("./FormattedJSONAIGenerator");
const { z } = require("zod")
const { zodResponseFormat, DataValidationUtil, TextTraceUtil, RefsTraceUtil } = require("./utils");

class RequirementsMappingGenerator extends FormattedJSONAIGenerator {
    constructor(client) {
        super(client);
        this.generatorName = 'RequirementsMappingGenerator';
        this.checkInputParamsKeys = ['boundedContext', 'requirementChunk'];
        this.progressCheckStrings = ['relevantRequirements'];
        this.lineNumberedRequirements = '';
        this.eventLineMap = new Map();

        this.initialResponseFormat = zodResponseFormat(
            z.object({
                relevantRequirements: z.array(z.object({
                    type: z.enum(["userStory", "DDL", "Event"]),
                    refs: z.array(z.array(z.union([z.number(), z.string()])))
                }))
            }).strict(),
            "instruction"
        )
    }


    async onGenerateBefore(inputParams, generatorName) {
        this.__sanitizeInputParams(inputParams);
        this.__validateClientInput(inputParams);
    }
    __sanitizeInputParams(inputParams){
        if(inputParams.boundedContext) {
            if(!inputParams.boundedContext.aggregates) inputParams.boundedContext.aggregates = []
            if(!inputParams.boundedContext.events) inputParams.boundedContext.events = []
        }
    }
    __validateClientInput(clientInput){
        const clientInputSchema = {
            type: 'object',
            properties: {
                boundedContext: {
                    type: 'object',
                    properties: {
                        name: { type: 'string', required: true, minLength: 1 },
                        alias: { type: 'string', required: true, minLength: 1 },
                        implementationStrategy: { type: 'string', required: true, minLength: 1 },
                        importance: { type: 'string', required: true, minLength: 1 },
                        aggregates: { required: true },
                        events: { required: true }
                    }
                },
                requirementChunk: {
                    type: 'object',
                    required: true
                }
            }
        };
        if (!DataValidationUtil.isValidData(clientInput, clientInputSchema)) {
            throw new Error('Invalid client input');
        }

        const requirementChunk = clientInput.requirementChunk;
        if (!requirementChunk.type) {
            const textRequirementSchema = {
                type: 'object',
                properties: {
                    text: { type: 'string', required: true, minLength: 1 },
                    startLine: { type: 'number', required: true }
                }
            };
            if (!DataValidationUtil.isValidData(requirementChunk, textRequirementSchema)) {
                throw new Error('Invalid requirementChunk');
            }

            if (requirementChunk.startLine < 1) {
                throw new Error('Invalid requirementChunk');
            }

            return;
        }

        const analysisResultSchema = {
            type: 'object',
            properties: {
                events: { required: true }
            }
        };
        if (!DataValidationUtil.isValidData(requirementChunk, analysisResultSchema)) {
            throw new Error('Invalid requirementChunk');
        }

        return;
    }


    __buildAgentRolePrompt(){
        return `Role: Domain-Driven Design (DDD) Requirements Mapping Specialist

Goal: To accurately analyze requirements chunks (including text requirements, analysis results with actors/events, or DDL schemas) and determine their relevance to specific Bounded Contexts in a Domain-Driven Design architecture.

Backstory: I am a specialized DDD expert with deep expertise in:
- Bounded Context analysis and domain modeling
- Requirements traceability and mapping
- Event-driven architecture patterns
- Database schema analysis for domain alignment
- Cross-context relationship identification

My primary function is to evaluate requirements or analysis artifacts and determine which portions are relevant to a given Bounded Context, ensuring precise domain boundaries and clear responsibility separation.`;
    }

    __buildTaskGuidelinesPrompt(){
        const frontEndMappingPrompt = this._isFrontEndMappingPrompt();
        
        return `Your task is to analyze the provided requirements chunk and determine if it contains any content relevant to the specified Bounded Context.

Key Analysis Guidelines:

1. **Relevance Assessment:**
   - Direct references to the Bounded Context's name, alias, or aggregates
   - Business processes or workflows that this Bounded Context is responsible for
   - Data structures or entities that align with the Bounded Context's aggregates
   - Events that are published or consumed by this Bounded Context
   - User stories that describe functionality within this Bounded Context's domain
   - DDL tables whose field names (like order_id, product_id) relate to the context's aggregates

2. **Reference Precision:**
   - Create precise 'refs' arrays pointing to exact line numbers and phrases
   - Each ref must contain: [[startLineNumber, "minimal start phrase"], [endLineNumber, "minimal end phrase"]]
   - The phrase should be MINIMAL words (1-2 words) that uniquely identify the position in the line
   - Use the shortest possible phrase that can locate the specific part of requirements
   - Only reference lines that exist in the provided content

3. **Decision Strategy:**
   - Consider the Bounded Context's implementation strategy and importance
   - Look for indirect relationships through aggregates and events
   - Include content if it's part of the same business domain
   - When in doubt, err on the side of inclusion if the relationship is plausible

${frontEndMappingPrompt}

4. **Output Requirements:**
   - Return empty array if no relevant content is found
   - Each relevant item must specify type ("userStory", "DDL", or "Event")
   - Provide accurate line number references with contextual phrases`;
    }

    _isFrontEndMappingPrompt(){
        if(this.client.input['boundedContext'].name === 'ui'){
            return `
SPECIAL INSTRUCTIONS FOR UI BOUNDED CONTEXT:
            
For ui bounded context, ONLY map requirements that are related to:
    - User interface elements (buttons, forms, tables, charts, etc.)
    - Only non-functional requirements
    - Screen layouts and navigation
    - User interactions (clicks, inputs, selections, etc.)
    - Visual design and styling requirements
    - User experience (UX) flows and user journeys
    - Display of data and information presentation
    - Responsive design and accessibility requirements
    - Frontend validation rules and error messages
    - User feedback and notifications
    - Screen transitions and animations
    
    MUST NOT mapping:
    - Events or Actors
    - functional requirements
    - Business logic or backend processes
    - Data processing or calculations
    - API calls or data fetching logic
    - Database operations
    - Server-side validation
    - Authentication/authorization logic
    - Data persistence or storage
    
Focus ONLY on what users see and interact with on the screen.
If the requirement is not related to the UI, return empty array.
            `
        }

        return `
Important Instructions:

1. Consider the following aspects when determining relevance:
    - Direct references to the Bounded Context's name, alias, or aggregates
    - Business processes or workflows that this Bounded Context is responsible for
    - Data structures or entities that align with the Bounded Context's aggregates
    - Events that are published or consumed by this Bounded Context
    - User stories that describe functionality within this Bounded Context's domain
    - Even if a DDL table name does not directly match the Bounded Context, if its field names (such as order_id, product_id, etc.) are clearly related to the Bounded Context's aggregates, entities, or events, consider it relevant.

2. Include content if it:
    - Directly mentions or relates to the Bounded Context's core responsibilities
    - Describes processes or data that this Bounded Context manages
    - Contains events that this Bounded Context handles
    - Includes user stories that fall within this Bounded Context's domain
    - References entities or concepts that are part of this Bounded Context's aggregates
    - When in doubt, include the content

3. When in doubt:
    - Consider the Bounded Context's implementation strategy and importance
    - Look for indirect relationships through the aggregates and events
    - Include content if it's part of the same business domain
    - Err on the side of inclusion if the relationship is plausible
`;
    }

    __buildJsonResponseFormat() {
        return `{
    "relevantRequirements": [
        {
            "type": "userStory" || "DDL" || "Event",
            "refs": [[startLineNumber, "minimal start phrase"], [endLineNumber, "minimal end phrase"]]
        }
    ]
}`;
    }

    __buildJsonExampleInputFormat() {
        return {
            "boundedContextName": "order",
            "boundedContextAlias": "Order Management",
            "boundedContextImplementationStrategy": "microservice",
            "boundedContextImportance": "high", 
            "boundedContextAggregates": JSON.stringify([
                {"name": "Order", "properties": ["orderId", "customerId", "items"]},
                {"name": "OrderItem", "properties": ["productId", "quantity", "price"]}
            ]),
            "boundedContextEvents": JSON.stringify([
                {"name": "OrderPlaced", "actor": "Customer"},
                {"name": "OrderCancelled", "actor": "System"}
            ]),
            "requirementChunk": `1: # E-commerce Platform
2: 
3: Users can browse and purchase products
4: Payment processing with multiple providers
5: Order tracking and status updates
6: Inventory management for products`
        };
    }

    __buildJsonExampleOutputFormat() {
        return {
            "relevantRequirements": [
                {
                    "type": "userStory",
                    "refs": [[3, "Users"], [3, "purchase"]]
                },
                {
                    "type": "userStory", 
                    "refs": [[5, "Order"], [5, "tracking"]]
                }
            ]
        };
    }

    __buildJsonUserQueryInputFormat() {
        const parsedRequirements = this._parseRequirements(this.client.input['requirementChunk']);
        const lineNumberValidationPrompt = TextTraceUtil.getLineNumberValidationPrompt(parsedRequirements);

        return {
            "boundedContextName": this.client.input['boundedContext'].name,
            "boundedContextAlias": this.client.input['boundedContext'].alias,
            "boundedContextImplementationStrategy": this.client.input['boundedContext'].implementationStrategy,
            "boundedContextImportance": this.client.input['boundedContext'].importance,
            "boundedContextAggregates": JSON.stringify(this.client.input['boundedContext'].aggregates),
            "boundedContextEvents": JSON.stringify(this.client.input['boundedContext'].events),
            "requirementChunk": parsedRequirements,
            "lineNumberValidationNote": lineNumberValidationPrompt
        };
    }

    _parseRequirements(requirementChunk){
        this.eventLineMap.clear();
        this.lineNumberedRequirements = '';

        if(!requirementChunk.type) {
            this.lineNumberedRequirements = TextTraceUtil.addLineNumbers(requirementChunk.text, requirementChunk.startLine);
            return this.lineNumberedRequirements;
        }

        if(this.client.input['boundedContext'].name === 'ui') {
            return this._parseUIRequirements(requirementChunk);
        }

        let markdown = '### Events\n\n';
        let currentLine = 3;

        requirementChunk.events.forEach((event, index) => {
            const eventMarkdown = this._makeEventMarkdown(event);
            const lineCount = eventMarkdown.split('\n').length;
            for(let i=0; i<lineCount; i++){
                this.eventLineMap.set(currentLine + i, { type: 'event', index: index });
            }

            markdown += eventMarkdown + '\n';
            currentLine += lineCount;
        });
        
        this.lineNumberedRequirements = TextTraceUtil.addLineNumbers(markdown.trim());
        return this.lineNumberedRequirements;
    }

    _parseUIRequirements(requirementChunk) {
        // UI 요구사항을 파싱하는 로직
        if (requirementChunk.events && requirementChunk.events.length > 0) {
            let markdown = '### UI Requirements\n\n';
            let currentLine = 3;

            requirementChunk.events.forEach((event, index) => {
                const eventMarkdown = this._makeEventMarkdown(event);
                const lineCount = eventMarkdown.split('\n').length;
                for(let i=0; i<lineCount; i++){
                    this.eventLineMap.set(currentLine + i, { type: 'event', index: index });
                }

                markdown += eventMarkdown + '\n';
                currentLine += lineCount;
            });
            
            this.lineNumberedRequirements = TextTraceUtil.addLineNumbers(markdown.trim());
            return this.lineNumberedRequirements;
        }
        
        // 일반 텍스트 요구사항인 경우
        this.lineNumberedRequirements = TextTraceUtil.addLineNumbers(requirementChunk.text, requirementChunk.startLine);
        return this.lineNumberedRequirements;
    }

    _makeEventMarkdown(event){
        let eventMarkdown = `**Event: ${event.name} (${event.displayName})**\n`;
        eventMarkdown += `- **Actor:** ${event.actor}\n`;
        eventMarkdown += `- **Description:** ${event.description}\n`;
        if (event.inputs && event.inputs.length > 0) {
            eventMarkdown += `- **Inputs:** ${event.inputs.join(', ')}\n`;
        }
        if (event.outputs && event.outputs.length > 0) {
            eventMarkdown += `- **Outputs:** ${event.outputs.join(', ')}\n`;
        } 
        return eventMarkdown;
    }


    onModelCreatedWithThinking(returnObj) {
        if (!returnObj.modelValue.aiOutput) return;

        const model = returnObj.modelValue.aiOutput;

        if(!model || !model.relevantRequirements || model.relevantRequirements.length === 0){
            returnObj.modelValue.output = {
                boundedContext: this.client.input['boundedContext'].name,
                requirements: []
            };
            return;
        }

        // UI bounded context에 대한 특별 처리
        if(this.client.input['boundedContext'].name === 'ui') {
            this._processUIRequirements(returnObj, model);
            return;
        }

        this._wrapRefArrayToModel(model);
        const sanitizedModel = RefsTraceUtil.sanitizeAndConvertRefs(model, this.lineNumberedRequirements);
        model.relevantRequirements = sanitizedModel.relevantRequirements;

        const requirementChunk = this.client.input['requirementChunk'];
        if(!requirementChunk.type) {
            const finalRequirements = model.relevantRequirements.map(req => {
                if (!req.refs || req.refs.length === 0) return null;

                const referencedTexts = TextTraceUtil.getReferencedUserRequirements(
                    requirementChunk.text, req.refs, requirementChunk.startLine - 1
                );
                if (referencedTexts.length === 0 || referencedTexts.every(t => t.trim() === '')) return null;

                return {
                    ...req,
                    text: referencedTexts[0]
                };
            }).filter(Boolean);

            returnObj.modelValue.output = {
                boundedContext: this.client.input['boundedContext'].name,
                requirements: finalRequirements
            };
            return;
        }

        // 1. Get all refs from relevant requirements (already converted by sanitizeAndConvertRefs)
        const allRefs = model.relevantRequirements.flatMap(r => r.refs);

        const referencedLines = new Set();
        allRefs.forEach(ref => {
            if(!ref || !ref[0] || !ref[1]) return;
            const startLine = ref[0][0];
            const endLine = ref[1][0];
            for (let i = startLine; i <= endLine; i++) {
                referencedLines.add(i);
            }
        });

        // 2. Map line numbers to original event objects
        const allRelevantEvents = new Map();
        for (const line of referencedLines) {
            if(this.eventLineMap.has(line)) {
                const { index } = this.eventLineMap.get(line);
                const originalEvent = requirementChunk.events[index];
                if (originalEvent && !allRelevantEvents.has(index)) {
                    allRelevantEvents.set(index, {
                        type: "Event",
                        text: JSON.stringify(originalEvent, null, 2),
                        refs: originalEvent.refs // Use original refs
                    });
                }
            }
        }

        const finalRequirements = Array.from(allRelevantEvents.values());
        returnObj.modelValue.output = {
            boundedContext: this.client.input['boundedContext'].name,
            requirements: finalRequirements
        };
    }

    _processUIRequirements(returnObj, model) {
        const requirementChunk = this.client.input['requirementChunk'];
        
        // UI 요구사항에 대한 처리
        if(!requirementChunk.type) {
            // 텍스트 기반 UI 요구사항 처리
            this._wrapRefArrayToModel(model);
            const sanitizedModel = RefsTraceUtil.sanitizeAndConvertRefs(model, this.lineNumberedRequirements);
            model.relevantRequirements = sanitizedModel.relevantRequirements;
            
            const finalRequirements = model.relevantRequirements.map(req => {
                if (!req.refs || req.refs.length === 0) return null;

                const referencedTexts = TextTraceUtil.getReferencedUserRequirements(
                    requirementChunk.text, req.refs, requirementChunk.startLine - 1
                );
                if (referencedTexts.length === 0 || referencedTexts.every(t => t.trim() === '')) return null;

                return {
                    ...req,
                    text: referencedTexts[0]
                };
            }).filter(Boolean);

            returnObj.modelValue.output = {
                boundedContext: this.client.input['boundedContext'].name,
                requirements: finalRequirements
            };
            return;
        }

        // 이벤트 기반 UI 요구사항 처리
        this._wrapRefArrayToModel(model);
        const sanitizedModel = RefsTraceUtil.sanitizeAndConvertRefs(model, this.lineNumberedRequirements);
        model.relevantRequirements = sanitizedModel.relevantRequirements;

        // 1. Get all refs from relevant requirements (already converted by sanitizeAndConvertRefs)
        const allRefs = model.relevantRequirements.flatMap(r => r.refs);

        const referencedLines = new Set();
        allRefs.forEach(ref => {
            if(!ref || !ref[0] || !ref[1]) return;
            const startLine = ref[0][0];
            const endLine = ref[1][0];
            for (let i = startLine; i <= endLine; i++) {
                referencedLines.add(i);
            }
        });

        // 2. Map line numbers to original event objects
        const allRelevantEvents = new Map();
        for (const line of referencedLines) {
            if(this.eventLineMap.has(line)) {
                const { index } = this.eventLineMap.get(line);
                const originalEvent = requirementChunk.events[index];
                if (originalEvent && !allRelevantEvents.has(index)) {
                    allRelevantEvents.set(index, {
                        type: "Event",
                        text: JSON.stringify(originalEvent, null, 2),
                        refs: originalEvent.refs // Use original refs
                    });
                }
            }
        }

        const finalRequirements = Array.from(allRelevantEvents.values());
        returnObj.modelValue.output = {
            boundedContext: this.client.input['boundedContext'].name,
            requirements: finalRequirements
        };
    }

    // 기존 유틸을 그대로 사용하기 위해서 refs 속성을 []로 한번 더 감싸기
    _wrapRefArrayToModel(model){
        for(const req of model.relevantRequirements){
            if(!req.refs || req.refs.length === 0) continue;
            req.refs = [req.refs];
        }
    }
}

module.exports = RequirementsMappingGenerator;