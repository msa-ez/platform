const FormattedJSONAIGenerator = require("./FormattedJSONAIGenerator");
const { z } = require("zod")
const { zodResponseFormat, DataValidationUtil, TextTraceUtil, RefsTraceUtil } = require("./utils");

class RequirementsValidationGenerator extends FormattedJSONAIGenerator {
    constructor(client) {
        super(client, {}, "thinkingModel");
        
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


    async onGenerateBefore(inputParams, generatorName) {
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


    __buildAgentRolePrompt() {
        return `You are an expert business analyst and domain-driven design specialist. Your primary mission is to transform requirements into a comprehensive Big Picture Event Storming model. You possess deep expertise in:
- Business process analysis and requirements decomposition
- Domain-driven design principles and event storming methodologies
- Actor identification and responsibility mapping
- Event flow orchestration and bounded context design`;
    }

    __buildTaskGuidelinesPrompt() {
        return `## User Story Analysis Process
- **Business Goals Focus**: Prioritize business objectives and user value delivery
- **Scenario Extraction**: Identify and document all user scenarios and workflows
- **Business Rules**: Capture implicit and explicit business rules and constraints
- **Process Dependencies**: Map relationships and dependencies between processes

## Event Discovery Methodology
- **Comprehensive Coverage**: Convert EVERY significant business moment into domain events
- **Complete State Capture**: Ensure ALL state changes are represented as events
- **Flow Completeness**: Include ALL happy path scenarios AND exception flows
- **Naming Convention**: Use past participle form for event names (e.g., OrderPlaced, PaymentProcessed)
- **No Omissions**: Do not skip or summarize any business processes

## Actor Identification Strategy
- **Event Ownership**: Group events by their responsible actors (human or system)
- **Process Ownership**: Establish clear accountability for each business process
- **Interaction Mapping**: Define clear interaction points between different actors
- **Swimlane Organization**: Create logical swimlanes for visual organization

## Event Flow Validation Rules
- **Story Representation**: Ensure every user story is reflected through events
- **Business Rule Compliance**: Verify that business rules are properly represented
- **Coverage Validation**: Confirm complete process coverage without gaps
- **Chain Completeness**: Validate that event chains are logically complete

## Quality Standards
1. **Business Significance**: Focus on business-significant state changes
2. **Clarity**: Use clear, action-oriented event names
3. **Completeness**: Ensure comprehensive process coverage
4. **Exception Handling**: Include exception scenarios in the model
5. **Sequence Logic**: Maintain clear and logical event sequences
6. **Actor Separation**: Keep actor responsibilities distinct and non-overlapping
7. **Rule Reflection**: Ensure all business rules are reflected in the event model
8. **Traceability**: Always include refs linking events to specific requirement lines

## Requirements Analysis Priority
- **Detailed Examination**: Thoroughly examine requirements details before generating events and actors
- **State Change Focus**: Generate events for ALL state changes (excluding simple CRUD operations or search operations)
- **No Omissions**: Every business-significant state change must be captured

## Consistency Requirements
- **Actor Naming**: Ensure actor names are consistent (exact spacing and case matching)
- **Event Connections**: Consider connections to existing events when defining nextEvents
- **Bounded Context Alignment**: Align event groupings with recommended bounded contexts

## Format Requirements
- All field names must match exactly as shown
- Event names must be PascalCase and past participle
- Actor names must be consistent across events and actors arrays
- Refs must reference valid line numbers from the requirements section
- Level numbers should indicate event sequence/priority

## EXAMPLE of refs format
If requirements contain:
1: # Course Management System
2: 
3: Students can enroll in courses
4: Instructors can create course content
5: System validates enrollment prerequisites

And you generate events like:
- "StudentEnrolled" event -> refs: [[[3, "Students"], [3, "enroll"]]]
- "CourseContentCreated" event -> refs: [[[4, "Instructors"], [4, "content"]]]
- "EnrollmentValidated" event -> refs: [[[5, "validates"], [5, "prerequisites"]]]

The refs array contains ranges where each range is [[startLine, startPhrase], [endLine, endPhrase]].
The phrases should be MINIMAL words (1-2 words) that uniquely identify the position in the line.
Use the shortest possible phrase that can locate the specific part of requirements.
Multiple ranges can be included if an event references multiple parts of requirements.
`;
    }

    __buildJsonResponseFormat() {
        return `{
    "type": "ANALYSIS_RESULT",
    "content": {
        "recommendedBoundedContextsNumber": "Number of recommended bounded contexts based on actor interactions, domain boundaries, and business capabilities", // type: number (minimum 3, maximum 15)
        "reasonOfRecommendedBoundedContextsNumber": "Detailed analysis explaining: 1) Which specific bounded contexts are recommended and why, 2) The business domains and responsibilities of each bounded context, 3) The rationale for the number of bounded contexts based on actor interactions, event complexity, and domain boundaries, 4) How the bounded contexts align with business capabilities and organizational structure",
        "events": [
            {
                "name": "EventName", // PascalCase & Past Participle (e.g., OrderPlaced, PaymentProcessed)
                "displayName": "Event Display Name", // Natural language & Past Participle (e.g., "주문 완료됨")
                "actor": "ActorName", // Must exactly match an actor name from actors array
                "level": 1, // Event sequence priority (start from 1)
                "description": "Detailed description of what happened and why this event occurred",
                "inputs": ["Required data or conditions for this event to occur"],
                "outputs": ["Resulting data or state changes from this event"],
                "nextEvents": ["SubsequentEventName1", "SubsequentEventName2"], // Names of subsequent events in the process flow
                "refs": [[[startLineNumber, "minimal start phrase"], [endLineNumber, "minimal end phrase"]]] // Reference to source requirements. Use minimal 1-2 word phrases that uniquely identify the position
            }
        ],
        "actors": [
            {
                "name": "ActorName", // Human or System name (exact match with event.actor values)
                "events": ["AssociatedEventName1", "AssociatedEventName2"], // Event names owned by this actor
                "lane": 0 // Vertical position for swimlane (0-based index)
            }
        ]
    }
}`;
    }


    __buildJsonUserQueryInputFormat() {
        const lineNumberedRequirements = this._getLineNumberedRequirements();
        const lineNumberValidationPrompt = TextTraceUtil.getLineNumberValidationPrompt(lineNumberedRequirements);
        const previousChunkSummary = this._getPreviousChunkSummary();
        
        return {
            "Requirements Document": lineNumberedRequirements,
            "Context from Previous Analysis": previousChunkSummary,
            "Line Number Validation Note": lineNumberValidationPrompt
        };
    }

    _getLineNumberedRequirements() {
        return TextTraceUtil.addLineNumbers(
            this.client.input['requirements']['userStory']
        );
    }

    _getPreviousChunkSummary() {
        if (!this.previousChunkSummary.events.length) {
            return "None (this is the first chunk)";
        }

        const eventSummary = this.previousChunkSummary.events
            .map(e => `- Event "${e.name}" by ${e.actor}${e.nextEvents.length ? ` leads to: ${e.nextEvents.join(', ')}` : ''}`)
            .join('\n');

        const actorSummary = this.previousChunkSummary.actors
            .map(a => `- Actor "${a.name}" handles: ${a.events.join(', ')}`)
            .join('\n');

        return `
Generated Summary of Previous Chunk:
Previously identified events:
${eventSummary}

Previously identified actors:
${actorSummary}

Please ensure new events and actors are consistent with these existing elements.
Make sure that when using existing actor names, there is no difference in spacing and case difference.
Consider potential connections to these existing events when defining nextEvents.
`;
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
            model.content = RefsTraceUtil.sanitizeAndConvertRefs(model.content, lineNumberedRequirements);
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