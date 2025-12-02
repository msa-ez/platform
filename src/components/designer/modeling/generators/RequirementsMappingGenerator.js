const FormattedJSONAIGenerator = require("./FormattedJSONAIGenerator");
const { z } = require("zod")
const { zodResponseFormat, DataValidationUtil, TextTraceUtil, RefsTraceUtil } = require("./utils");

class RequirementsMappingGenerator extends FormattedJSONAIGenerator {
    constructor(client) {
        super(client, {}, "thinkingModel", true);

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
        inputParams.isUIBoundedContext = (inputParams.boundedContext.name === 'ui');
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


    __buildPersonaInfo() {
        return {
            persona: "Domain-Driven Design (DDD) Requirements Mapping Specialist",
            goal: "To accurately analyze requirements chunks (including text requirements, analysis results with actors/events, or DDL schemas) and determine their relevance to specific Bounded Contexts in a Domain-Driven Design architecture.",
            backstory: "I am a specialized DDD expert with deep expertise in Bounded Context analysis and domain modeling, requirements traceability and mapping, event-driven architecture patterns, database schema analysis for domain alignment, and cross-context relationship identification. My primary function is to evaluate requirements or analysis artifacts and determine which portions are relevant to a given Bounded Context, ensuring precise domain boundaries and clear responsibility separation."
        }
    }


    __buildTaskGuidelinesPrompt(){
        const frontEndMappingPrompt = this._isFrontEndMappingPrompt();
        
        return `<instruction>
    <core_instructions>
        <title>Requirements Mapping Task</title>
        <task_description>Your task is to analyze the provided requirements chunk and determine if it contains any content relevant to the specified Bounded Context. You must identify relevant requirements and provide precise traceability references.</task_description>
        
        <input_description>
            <title>You will be given:</title>
            <item id="1">**Bounded Context Information:** Name, alias, implementation strategy, importance, aggregates, and events</item>
            <item id="2">**Requirements Chunk:** Either text requirements with line numbers, analysis results with actors/events, or DDL schemas</item>
        </input_description>

        <guidelines>
            <title>Requirements Mapping Guidelines</title>
            
            <section id="relevance_assessment">
                <title>Relevance Assessment Criteria</title>
                <rule id="1">**Direct References:** Look for explicit mentions of the Bounded Context's name, alias, or aggregates</rule>
                <rule id="2">**Business Processes:** Identify workflows that this Bounded Context is responsible for</rule>
                <rule id="3">**Data Structures:** Match entities that align with the Bounded Context's aggregates</rule>
                <rule id="4">**Event Relationships:** Find events that are published or consumed by this Bounded Context</rule>
                <rule id="5">**User Stories:** Identify functionality within this Bounded Context's domain</rule>
                <rule id="6">**DDL Analysis:** Consider DDL tables whose field names (like order_id, product_id) relate to the context's aggregates, even if table names don't directly match</rule>
            </section>

            <section id="reference_precision">
                <title>Reference Traceability Requirements</title>
                <rule id="1">**Refs Format:** Each ref must contain [[startLineNumber, "minimal_start_phrase"], [endLineNumber, "minimal_end_phrase"]]</rule>
                <rule id="2">**Minimal Phrases:** Use 1-2 word phrases that uniquely identify the position in the line</rule>
                <rule id="3">**Shortest Possible:** Use the shortest possible phrase that can locate the specific part of requirements</rule>
                <rule id="4">**Valid Line Numbers:** Only reference lines that exist in the provided content</rule>
                <rule id="5">**Precision:** Point to exact line numbers and phrases for accurate traceability</rule>
            </section>

            <section id="decision_strategy">
                <title>Decision Strategy</title>
                <rule id="1">**Context Awareness:** Consider the Bounded Context's implementation strategy and importance</rule>
                <rule id="2">**Indirect Relationships:** Look for indirect relationships through aggregates and events</rule>
                <rule id="3">**Domain Alignment:** Include content if it's part of the same business domain</rule>
                <rule id="4">**Inclusion Bias:** When in doubt, err on the side of inclusion if the relationship is plausible</rule>
            </section>

${frontEndMappingPrompt}
        </guidelines>

        <refs_format_example>
            <title>Example of refs Format</title>
            <description>If requirements contain:</description>
            <example_requirements>
<1>Users can browse and purchase products</1>
<2>Payment processing with multiple providers</2>
<3>Order tracking and status updates</3>
<4>Inventory management for products</4>
            </example_requirements>
            <example_refs>
- For "Order" bounded context referencing line 1 → refs: [[1, "Users"], [1, "purchase"]]
- For "Order" bounded context referencing line 3 → refs: [[3, "Order"], [3, "tracking"]]
            </example_refs>
        </refs_format_example>
    </core_instructions>
    
    <output_format>
        <title>JSON Output Format</title>
        <description>The output must be a JSON object structured as follows:</description>
        <schema>
{
    "relevantRequirements": [
        {
            "type": "userStory" || "DDL" || "Event",
            "refs": [[startLineNumber, "minimal_start_phrase"], [endLineNumber, "minimal_end_phrase"]]
        }
    ]
}
        </schema>
        <field_requirements>
            <requirement id="1">Return empty array if no relevant content is found</requirement>
            <requirement id="2">Each relevant item must specify type ("userStory", "DDL", or "Event")</requirement>
            <requirement id="3">Provide accurate line number references with contextual phrases</requirement>
            <requirement id="4">Refs must use minimal phrases to identify exact locations</requirement>
        </field_requirements>
    </output_format>
</instruction>`;
    }

    _isFrontEndMappingPrompt(){
        if(this.client.input['boundedContext'].name === 'ui'){
            return `
            <section id="ui_bounded_context_rules">
                <title>SPECIAL INSTRUCTIONS FOR UI BOUNDED CONTEXT</title>
                <description>For UI bounded context, apply strict filtering rules to focus only on user interface concerns.</description>
                
                <subsection id="ui_mapping_scope">
                    <title>ONLY Map Requirements Related To:</title>
                    <item>User interface elements (buttons, forms, tables, charts, etc.)</item>
                    <item>Non-functional requirements</item>
                    <item>Screen layouts and navigation</item>
                    <item>User interactions (clicks, inputs, selections, etc.)</item>
                    <item>Visual design and styling requirements</item>
                    <item>User experience (UX) flows and user journeys</item>
                    <item>Display of data and information presentation</item>
                    <item>Responsive design and accessibility requirements</item>
                    <item>Frontend validation rules and error messages</item>
                    <item>User feedback and notifications</item>
                    <item>Screen transitions and animations</item>
                </subsection>
                
                <subsection id="ui_exclusions">
                    <title>MUST NOT Map:</title>
                    <exclusion>Events or Actors</exclusion>
                    <exclusion>Functional requirements</exclusion>
                    <exclusion>Business logic or backend processes</exclusion>
                    <exclusion>Data processing or calculations</exclusion>
                    <exclusion>API calls or data fetching logic</exclusion>
                    <exclusion>Database operations</exclusion>
                    <exclusion>Server-side validation</exclusion>
                    <exclusion>Authentication/authorization logic</exclusion>
                    <exclusion>Data persistence or storage</exclusion>
                </subsection>
                
                <critical_rule>Focus ONLY on what users see and interact with on the screen. If the requirement is not related to the UI, return empty array.</critical_rule>
            </section>
`;
        }

        return ``;
    }


    __buildJsonExampleInputFormat() {
        const requirementChunk = `# E-commerce Platform

Users can browse and purchase products
Payment processing with multiple providers
Order tracking and status updates
Inventory management for products`
        const lineNumberedRequirementChunk = TextTraceUtil.addLineNumbers(requirementChunk, 1, true);

        return {
            "boundedContextName": "order",
            "boundedContextAlias": "Order Management",
            "boundedContextImplementationStrategy": "microservice",
            "boundedContextImportance": "high", 
            "boundedContextAggregates": JSON.stringify([{"name": "Order"}, {"name": "OrderItem"}]),
            "boundedContextEvents": JSON.stringify(["OrderPlaced", "OrderCancelled"]),
            "requirementChunk": lineNumberedRequirementChunk
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
        this.lineNumberedRequirements = this._parseRequirements(this.client.input['requirementChunk']);

        return {
            "boundedContextName": this.client.input['boundedContext'].name,
            "boundedContextAlias": this.client.input['boundedContext'].alias,
            "boundedContextImplementationStrategy": this.client.input['boundedContext'].implementationStrategy,
            "boundedContextImportance": this.client.input['boundedContext'].importance,
            "boundedContextAggregates": JSON.stringify(this.client.input['boundedContext'].aggregates),
            "boundedContextEvents": JSON.stringify(this.client.input['boundedContext'].events),
            "requirementChunk": this.lineNumberedRequirements 
        };
    }

    _parseRequirements(requirementChunk){
        this.eventLineMap.clear();
        if(!requirementChunk.type) {
            return TextTraceUtil.addLineNumbers(requirementChunk.text, requirementChunk.startLine, true);
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
        return TextTraceUtil.addLineNumbers(markdown.trim(), 1, true);
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
            
            return TextTraceUtil.addLineNumbers(markdown.trim(), 1, true);
        }
        return TextTraceUtil.addLineNumbers(requirementChunk.text, requirementChunk.startLine, true);
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

        this._wrapRefArrayToModel(model);
        
        // UI bounded context에 대한 특별 처리
        if(this.client.input['boundedContext'].name === 'ui') {
            this._processUIRequirements(returnObj, model);
            return;
        }

        const sanitizedModel = RefsTraceUtil.sanitizeAndConvertRefs(model, this.lineNumberedRequirements, true);
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
            const sanitizedModel = RefsTraceUtil.sanitizeAndConvertRefs(model, this.lineNumberedRequirements, true);
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
        const sanitizedModel = RefsTraceUtil.sanitizeAndConvertRefs(model, this.lineNumberedRequirements, true);
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