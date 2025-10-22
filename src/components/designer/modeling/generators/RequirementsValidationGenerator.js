const FormattedJSONAIGenerator = require("./FormattedJSONAIGenerator");
const { z } = require("zod")
const { zodResponseFormat, DataValidationUtil, TextTraceUtil, RefsTraceUtil } = require("./utils");

class RequirementsValidationGenerator extends FormattedJSONAIGenerator {
    constructor(client) {
        super(client, {}, "thinkingModel", true);
        
        this.generatorName = 'RequirementsValidationGenerator';
        this.checkInputParamsKeys = ["requirements"];
        this.progressCheckStrings = ["type", "content", "events", "actors"];
        
        this.previousChunkSummary = {
            events: [],
            actors: []
        };

        this.initialResponseFormat = zodResponseFormat(
            z.object({
                type: z.enum(["ANALYSIS_RESULT", "ENHANCEMENT_GUIDE"]),
                content: z.object({
                    recommendedBoundedContextsNumber: z.number().min(3).max(15),
                    reasonOfRecommendedBoundedContextsNumber: z.string(),
                    events: z.array(z.object({
                        name: z.string(),
                        displayName: z.string(),
                        actor: z.string(),
                        level: z.number(),
                        description: z.string(),
                        inputs: z.array(z.string()),
                        outputs: z.array(z.string()),
                        nextEvents: z.array(z.string()),
                        refs: z.array(z.array(z.array(z.union([z.number(), z.string()]))))
                    })),
                    actors: z.array(z.object({
                        name: z.string(),
                        events: z.array(z.string()),
                        lane: z.number()
                    }))
                }).strict()
            }).strict(),
            "instruction"
        )
    }


    async onGenerateBefore(inputParams) {
        DataValidationUtil.validateData(inputParams, {
            type: 'object',
            properties: {
                requirements: {
                    type: 'object',
                    properties: {
                        userStory: {
                            type: 'string',
                            required: true,
                            minLength: 1
                        }
                    }
                }
            }
        });
    }


    __buildPersonaInfo() {
        return {
            persona: "Expert Business Analyst & Domain-Driven Design Specialist",
            goal: "To transform business requirements into a comprehensive Big Picture Event Storming model that accurately represents the domain's business processes, actors, and event flows.",
            backstory: "With extensive experience in business process analysis and domain-driven design, I specialize in decomposing complex requirements into event-driven models. I excel at identifying domain events, mapping actor responsibilities, and orchestrating event flows that capture the complete business narrative. My expertise lies in ensuring every significant business moment is represented as a domain event, creating clear bounded context boundaries, and maintaining traceability back to source requirements. I understand that a well-crafted event storming model serves as the foundation for successful microservices architecture and domain-driven design implementation."
        }
    }

    __buildTaskGuidelinesPrompt() {
        return `<instruction>
    <core_instructions>
        <title>Event Storming Model Generation Task</title>
        <task_description>Your task is to analyze business requirements and transform them into a comprehensive Big Picture Event Storming model. This model will serve as the foundation for domain-driven design and microservices architecture.</task_description>
        
        <input_description>
            <title>You will be given:</title>
            <item id="1">**Requirements Document:** Business requirements with line numbers for traceability</item>
            <item id="2">**Context from Previous Analysis:** Summary of events and actors from previous chunks (if this is a continuation)</item>
        </input_description>

        <guidelines>
            <title>Event Storming Analysis Guidelines</title>
            
            <section id="requirements_analysis">
                <title>Requirements Analysis Process</title>
                <rule id="1">**Thorough Examination:** Examine requirements in detail before generating events and actors</rule>
                <rule id="2">**Business Goals Focus:** Prioritize business objectives and user value delivery</rule>
                <rule id="3">**Scenario Extraction:** Identify and document all user scenarios and workflows</rule>
                <rule id="4">**Business Rules Capture:** Extract both implicit and explicit business rules and constraints</rule>
                <rule id="5">**Process Dependencies:** Map relationships and dependencies between business processes</rule>
            </section>

            <section id="event_discovery">
                <title>Event Discovery Methodology</title>
                <rule id="1">**Comprehensive Coverage:** Convert EVERY significant business moment into domain events</rule>
                <rule id="2">**Complete State Capture:** Ensure ALL business-significant state changes are represented as events</rule>
                <rule id="3">**Flow Completeness:** Include both happy path scenarios AND exception flows</rule>
                <rule id="4">**State Change Focus:** Generate events ONLY for business-significant state changes. Do NOT create events for read-only operations such as data lookups, views, searches, or queries, as these do not represent a state transition in the domain.</rule>
                <rule id="5">**No Omissions:** Do not skip or summarize any business processes</rule>
                <rule id="6">**Naming Convention:** Use PascalCase and past participle form for event names (e.g., OrderPlaced, PaymentProcessed)</rule>
                <rule id="7">**Primary Business Actions:** Focus on the primary business action (the cause) rather than secondary consequences or technical side effects. For example, instead of an event like "HistoryRecordCreated" or "NotificationSent", the event should be the action that *caused* the history or notification, such as "BookLoaned" or "OrderShipped". Tracking and logging are often consequences of primary events, not events themselves.</rule>
            </section>

            <section id="actor_identification">
                <title>Actor Identification Strategy</title>
                <rule id="1">**Event Ownership:** Group events by their responsible actors (human or system)</rule>
                <rule id="2">**Process Ownership:** Establish clear accountability for each business process</rule>
                <rule id="3">**Interaction Mapping:** Define clear interaction points between different actors</rule>
                <rule id="4">**Naming Consistency:** Ensure actor names are consistent with exact spacing and case matching</rule>
                <rule id="5">**Responsibility Separation:** Keep actor responsibilities distinct and non-overlapping</rule>
            </section>

            <section id="event_flow">
                <title>Event Flow and Relationships</title>
                <rule id="1">**Story Representation:** Ensure every user story is reflected through events</rule>
                <rule id="2">**Chain Completeness:** Validate that event chains are logically complete</rule>
                <rule id="3">**Event Connections:** Consider connections to existing events when defining nextEvents</rule>
                <rule id="4">**Sequence Logic:** Maintain clear and logical event sequences using level numbers</rule>
            </section>

            <section id="bounded_context">
                <title>Bounded Context Recommendation</title>
                <rule id="1">**Context Analysis:** Analyze actor interactions, domain boundaries, and business capabilities</rule>
                <rule id="2">**Recommended Number:** Suggest between 3 to 15 bounded contexts based on complexity</rule>
                <rule id="3">**Clear Justification:** Provide detailed rationale explaining which specific bounded contexts are recommended and why</rule>
                <rule id="4">**Domain Alignment:** Ensure bounded contexts align with business capabilities and organizational structure</rule>
            </section>

            <section id="traceability">
                <title>Source Traceability Requirements</title>
                <rule id="1">**Mandatory Refs:** Every event MUST include refs linking back to specific requirement lines</rule>
                <rule id="2">**Refs Format:** Use format [[[startLineNumber, "minimal_start_phrase"], [endLineNumber, "minimal_end_phrase"]]]</rule>
                <rule id="3">**Minimal Phrases:** Use 1-2 word phrases that uniquely identify the position in the line</rule>
                <rule id="4">**Valid Line Numbers:** Refs must reference valid line numbers from the requirements section</rule>
                <rule id="5">**Multiple References:** Include multiple ranges if an event references multiple parts of requirements</rule>
            </section>

            <section id="consistency">
                <title>Consistency with Previous Analysis</title>
                <rule id="1">**Actor Name Matching:** When using existing actor names from previous chunks, ensure exact spacing and case matching</rule>
                <rule id="2">**Event Continuity:** Consider potential connections to existing events when defining nextEvents</rule>
                <rule id="3">**Context Alignment:** Align event groupings with the overall bounded context structure</rule>
            </section>
        </guidelines>

        <refs_format_example>
            <title>Example of refs Format</title>
            <description>If requirements contain:</description>
            <example_requirements>
<1># Course Management System</1>
<2></2> 
<3>Students can enroll in courses</3>
<4>Instructors can create course content</4>
<5>System validates enrollment prerequisites</5>
            </example_requirements>
            <example_refs>
- "StudentEnrolled" event → refs: [[[3, "Students"], [3, "enroll"]]]
- "CourseContentCreated" event → refs: [[[4, "Instructors"], [4, "content"]]]
- "EnrollmentValidated" event → refs: [[[5, "validates"], [5, "prerequisites"]]]
            </example_refs>
        </refs_format_example>
    </core_instructions>
    
    <output_format>
        <title>JSON Output Format</title>
        <description>The output must be a JSON object structured as follows:</description>
        <schema>
{
    "type": "ANALYSIS_RESULT",
    "content": {
        "recommendedBoundedContextsNumber": (number: 3-15),
        "reasonOfRecommendedBoundedContextsNumber": "(Detailed analysis explaining: 1) Which specific bounded contexts are recommended and why, 2) The business domains and responsibilities of each bounded context, 3) The rationale for the number based on actor interactions, event complexity, and domain boundaries, 4) How the bounded contexts align with business capabilities and organizational structure)",
        "events": [
            {
                "name": "(EventName in PascalCase & Past Participle)",
                "displayName": "(Natural language display name)",
                "actor": "(ActorName - must match an actor from actors array)",
                "level": (number: event sequence priority starting from 1),
                "description": "(Detailed description of what happened and why)",
                "inputs": ["(Required data or conditions)"],
                "outputs": ["(Resulting data or state changes)"],
                "nextEvents": ["(SubsequentEventName1)", "(SubsequentEventName2)"],
                "refs": [[[(startLineNumber), "(minimal_start_phrase)"], [(endLineNumber), "(minimal_end_phrase)"]]]
            }
        ],
        "actors": [
            {
                "name": "(ActorName - exact match with event.actor values)",
                "events": ["(AssociatedEventName1)", "(AssociatedEventName2)"],
                "lane": (number: 0-based vertical position for swimlane)
            }
        ]
    }
}
        </schema>
        <field_requirements>
            <requirement id="1">All field names must match exactly as shown in the schema</requirement>
            <requirement id="2">Event names must be PascalCase and past participle form</requirement>
            <requirement id="3">Actor names must be consistent across events and actors arrays</requirement>
            <requirement id="4">Level numbers should indicate event sequence/priority</requirement>
        </field_requirements>
    </output_format>
</instruction>`;
    }


    __buildJsonUserQueryInputFormat() {
        const lineNumberedRequirements = this._getLineNumberedRequirements();
        const previousChunkSummary = this._getPreviousChunkSummary();
        
        return {
            "context_from_previous_analysis": previousChunkSummary,
            "requirements_document": lineNumberedRequirements
        };
    }

    _getLineNumberedRequirements() {
        return TextTraceUtil.addLineNumbers(this.client.input['requirements']['userStory'], 1, true);
    }

    _getPreviousChunkSummary() {
        if (!this.previousChunkSummary.events.length) {
            return `<previous_chunk_context>
    <status>first_chunk</status>
    <description>This is the first chunk. No previous context available.</description>
</previous_chunk_context>`;
        }

        const eventsXml = this.previousChunkSummary.events
            .map(e => {
                const nextEventsXml = e.nextEvents.length 
                    ? `\n            <next_events>${e.nextEvents.map(ne => `<event>${ne}</event>`).join('')}</next_events>`
                    : '';
                return `        <event>
            <name>${e.name}</name>
            <actor>${e.actor}</actor>${nextEventsXml}
        </event>`;
            })
            .join('\n');

        const actorsXml = this.previousChunkSummary.actors
            .map(a => `        <actor>
            <name>${a.name}</name>
            <handled_events>${a.events.map(evt => `<event>${evt}</event>`).join('')}</handled_events>
        </actor>`)
            .join('\n');

        return `<previous_chunk_context>
    <status>continuation</status>
    <description>This is a continuation of a previous analysis. Maintain consistency with the following existing elements.</description>
    
    <previously_identified_events>
${eventsXml}
    </previously_identified_events>
    
    <previously_identified_actors>
${actorsXml}
    </previously_identified_actors>
    
    <consistency_requirements>
        <requirement>Ensure new events and actors are consistent with these existing elements</requirement>
        <requirement>When using existing actor names, match spacing and case exactly</requirement>
        <requirement>Consider potential connections to existing events when defining nextEvents</requirement>
    </consistency_requirements>
</previous_chunk_context>`;
    }


    onModelCreatedWithThinking(returnObj) {
        if (!this.__isValidAIOutput(returnObj.modelValue.aiOutput)) return;
        
        const model = returnObj.modelValue.aiOutput;
        
        if (!model || !model.type) {
            returnObj.modelValue.output = model;
            return;
        }

        if (model.type === "ENHANCEMENT_GUIDE") {
            console.log("[*] 요구사항이 불충분하여 개선 가이드를 생성했습니다.");
            returnObj.modelValue.output = model;
            return;
        }
        
        if (model.type !== "ANALYSIS_RESULT") {
            returnObj.modelValue.output = model;
            return;
        }

        if (model.content && model.content.events && model.content.events.length > 0) {
            const lineNumberedRequirements = this._getLineNumberedRequirements();
            model.content = RefsTraceUtil.sanitizeAndConvertRefs(model.content, lineNumberedRequirements, true);
            
            const startLineOffset = (this.currentChunkStartLine) ? this.currentChunkStartLine - 1 : 0;
            RefsTraceUtil.validateRefs(model.content, this.client.input['requirements']['userStory'], startLineOffset);
        }

        // 모델 요소 생성
        const modelElements = this._createModelElements(model);
        
        const esvalue = {
            elements: modelElements.elements,
            relations: modelElements.relations,
        };

        returnObj.modelValue.output = {
            type: "ANALYSIS_RESULT",
            projectName: "Requirements Analysis",
            content: esvalue,
            analysisResult: model.content,
            currentGeneratedLength: returnObj.modelRawValue ? returnObj.modelRawValue.length : 0
        };
    }
    __isValidAIOutput(aiOutput) {
        return aiOutput && typeof aiOutput === 'object';
    }

    _createModelElements(model) {
        // 간격 설정
        const LANE_HEIGHT = 250;
        const ACTOR_MARGIN_LEFT = 150;
        const EVENT_START_X = 300;
        const EVENT_SPACING = 200;
        const INITIAL_Y = 150;
        
        let actorLanes = {};
        let modelElements = {};
        let relations = {}; 
        let eventElements = {}; 

        
        if (model.content && model.content.actors && model.content.events) {
            // Actor 생성 및 위치 설정
            model.content.actors.forEach((actor, idx) => {
                const actorUuid = this._uuid();
                const laneY = INITIAL_Y + idx * LANE_HEIGHT;
                actorLanes[actor.name] = idx;
                
                // Actor 생성
                modelElements[actorUuid] = this._createActor(
                    actor,
                    actorUuid,
                    ACTOR_MARGIN_LEFT,
                    laneY
                );

                // 스위레인 라인 생성
                if (idx < model.content.actors.length) {
                    const laneUuid = this._uuid();
                    relations[laneUuid] = this._createSwimLane(
                        laneUuid,
                        laneY + LANE_HEIGHT/2,
                        0,
                        2000
                    );
                }
            });

            // 각 Actor별 이벤트 그룹화
            let eventsByActor = {};
            model.content.events.forEach(event => {
                if (!eventsByActor[event.actor]) {
                    eventsByActor[event.actor] = [];
                }
                eventsByActor[event.actor].push(event);
            });

            // 이벤트 생성 및 배치
            Object.entries(eventsByActor).forEach(([actorName, events]) => {
                const actorLane = actorLanes[actorName];
                events.forEach((event, eventIdx) => {
                    const elementUuid = this._uuid();
                    const eventElement = this._createEvent(
                        event,
                        elementUuid,
                        EVENT_START_X + eventIdx * EVENT_SPACING,
                        INITIAL_Y + actorLane * LANE_HEIGHT
                    );
                    modelElements[elementUuid] = eventElement;
                    eventElements[event.name] = eventElement;
                });
            });

            // 이벤트 간 관계 생성
            model.content.events.forEach(event => {
                if (event.nextEvents && event.nextEvents.length > 0) {
                    const sourceEvent = eventElements[event.name];
                    
                    event.nextEvents.forEach(nextEventName => {
                        const targetEvent = eventElements[nextEventName];
                        if (sourceEvent && targetEvent) {
                            const relationId = this._uuid();
                            relations[relationId] = this._createRelation(
                                sourceEvent,
                                targetEvent,
                                relationId,
                                event.level 
                            );
                        }
                    });
                }
            });
        }

        return {
            elements: modelElements,
            relations: relations
        };
    }

    _uuid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }

    _createEvent(event, elementId, x, y) {
        return {
            _type: 'org.uengine.modeling.model.Event',
            id: elementId,
            visibility: 'public',
            name: event.name,
            oldName: '',
            displayName: event.displayName,
            namePascalCase: event.name,
            nameCamelCase: event.name.charAt(0).toLowerCase() + event.name.slice(1),
            namePlural: '',
            description: event.description || null,
            author: null,
            aggregate: {},
            boundedContext: {},
            fieldDescriptors: [
                {
                    _type: "org.uengine.model.FieldDescriptor",
                    name: "id",
                    className: "Long",
                    nameCamelCase: 'id',
                    namePascalCase: 'Id',
                    isKey: true
                }
            ],
            mirrorElement: null,
            elementView: {
                '_type': 'org.uengine.modeling.model.Event',
                'id': elementId,
                'x': x,
                'y': y,
                'width': 100,
                'height': 100,
                'style': JSON.stringify({}),
                'angle': 0,
            },
            hexagonalView: {
                '_type': 'org.uengine.modeling.model.EventHexagonal',
                'id': elementId,
                'x': x,
                'y': y,
                'subWidth': 100,
                'width': 20,
                'height': 20,
                'style': JSON.stringify({})
            },
            relationPolicyInfo: [],
            relationCommandInfo: [],
            trigger: '@PostPersist'
        };
    }

    _createActor(actor, actorId, x, y) {
        return {
            _type: 'org.uengine.modeling.model.Actor',
            id: actorId,
            name: actor.name,
            oldName: '',
            displayName: '',
            description: '',
            author: null,
            elementView: {
                '_type': 'org.uengine.modeling.model.Actor',
                'id': actorId,
                'x': x,
                'y': y,
                'width': 100,
                'height': 100,
                'style': JSON.stringify({})
            },
            boundedContext: {}
        };
    }

    _createSwimLane(laneId, y, startX, endX) {
        return {
            _type: 'org.uengine.modeling.model.Line',
            id: laneId,
            name: '',
            author: null,
            oldName: '',
            displayName: '',
            from: laneId,
            to: laneId,
            description: '',
            relationView: {
                id: laneId,
                value: `[[${startX},${y}],[${endX},${y}]]`
            },
            size: 10,
            color: '#cccccc',
            dashStyle: '3,3',
            imgSrc: 'https://www.msaez.io:8081/static/image/symbol/edge.png',
            vertices: `[[${startX},${y}],[${endX},${y}]]`
        };
    }

    _createRelation(fromEvent, toEvent, relationId, level) {
        return {
            _type: 'org.uengine.modeling.model.Relation',
            id: relationId,
            name: `${level}`,  // level을 relation의 이름으로 설정
            displayName: `${level}`,  // displayName도 함께 설정
            sourceElement: fromEvent,
            targetElement: toEvent,
            from: fromEvent.id,
            to: toEvent.id,
            relationView: {
                id: relationId,
                style: JSON.stringify({
                    "arrow-start": "none",
                    "arrow-end": "block",
                    "stroke": "grey",
                    "stroke-width": "1.4",
                    "font-size": "12px",  // 텍스트 크기 설정
                    "font-weight": "bold"  // 텍스트를 굵게 표시
                }),
                value: null,
                from: fromEvent.id,
                to: toEvent.id,
                needReconnect: true
            }
        };
    }


    updatePreviousChunkSummary(model) {
        if (!model || !model.analysisResult) return;
    
        // 이벤트 정보 수집
        const events = model.analysisResult.events.map(e => ({
            name: e.name,
            actor: e.actor,
            nextEvents: e.nextEvents || []
        }));
    
        // 액터 정보 수집
        const actors = model.analysisResult.actors.map(a => ({
            name: a.name,
            events: a.events || []
        }));
    
        this.previousChunkSummary = {
            events: [...this.previousChunkSummary.events, ...events],
            actors: [...this.previousChunkSummary.actors, ...actors]
        };
    }
}

module.exports = RequirementsValidationGenerator;