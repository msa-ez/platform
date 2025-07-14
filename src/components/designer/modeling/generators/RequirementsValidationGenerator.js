const JsonAIGenerator = require("./JsonAIGenerator");

class RequirementsValidationGenerator extends JsonAIGenerator {
    constructor(client) {
        super(client, {}, "thinkingModel");
        this.generatorName = 'RequirementsValidationGenerator';

        this.recursive = false;

        this.previousChunkSummary = {
            events: [],
            actors: []
        };
    }

    createPrompt() {
        return `
You are an expert business analyst and domain-driven design specialist tasked with creating a Big Picture Event Storming model from requirements.

IMPORTANT: 
Take a look requirements detail before generating events and actors. 
Except for the events that are CRUD operations or search operations, you must generate events for all state changes without omission.

1. User Story Analysis
   - Focus on business goals and user actions
   - Extract key user scenarios and workflows
   - Identify business rules and constraints
   - Map dependencies between processes

2. Event Discovery
   - Convert EVERY significant business moment into domain events
   - Do not skip or summarize any processes
   - Ensure ALL state changes are captured as events
   - Include ALL happy path and exception flows
   - Use past participle form for event names (e.g., OrderPlaced)

3. Actor Identification
   - Group events by responsible actors
   - Establish clear process ownership
   - Define interaction points between actors
   - Create clear swimlanes for visualization

4. Event Flow Validation
   - Ensure each user story is represented by events
   - Verify business rules are reflected in events
   - Validate complete process coverage
   - Check event chain completeness

Requirements to analyze:
${this.client.input['requirements']['userStory']}

${this.getPreviousChunkSummary()}

${this.isValidationPrompt()}
{
    "type": "ANALYSIS_RESULT",
    "content": {
        "recommendedBoundedContextsNumber": "Number of recommended bounded contexts based on actor interactions, domain boundaries, and business capabilities" // type is number (at least 3, maximum 15),
        "reasonOfRecommendedBoundedContextsNumber": "detailed analysis explaining: 1) which specific bounded contexts are recommended and why, 2) the business domains and responsibilities of each bounded context, 3) the rationale for the number of bounded contexts based on actor interactions, event complexity, and domain boundaries, 4) how the bounded contexts align with business capabilities and organizational structure",
        "events": [
            {
                "name": "name of event", // PascalCase & Past Participle (e.g., OrderPlaced, PaymentProcessed)
                "displayName": "display name of event", // Natural language & Past Participle (e.g., "주문 완료됨")
                "actor": "actor of event", // Must match an actor name from actors array
                "level": "number", // Event sequence priority (start from 1)
                "description": "detailed description of what happened and why",
                "inputs": ["required data or conditions for this event"],
                "outputs": ["resulting data or state changes"],
                "nextEvents": ["subsequent event names in the process flow"]
            }
        ],
        "actors": [
            {
                "name": "actor name", // Human or System name
                "events": ["associated event names"], // Events owned by this actor
                "lane": number // Vertical position for swimlane (0-based index)
            }
        ]
    }
}

Guidelines:
1. Focus on business-significant state changes
2. Use clear, action-oriented event names
3. Ensure complete process coverage
4. Include exception scenarios
5. Maintain clear event sequences
6. Keep actor responsibilities distinct
7. Reflect all business rules
`
    }

    isValidationPrompt() {
        // if(!this.recursive) {
        if(false) {
            return `
Validation Criteria (ALL must be met for complete requirements):
1. Clarity
   - Each requirement must have a single, unambiguous interpretation
   - All terms and concepts must be clearly defined
   - Process flows must be explicitly stated

2. Completeness
   - All essential actors must be identified
   - All key processes must be described
   - Input/output for each process must be specified
   - Business rules and constraints must be defined

3. Consistency
   - No contradictions between requirements
   - Process flows must be logically connected
   - Actor responsibilities must not overlap

4. Verifiability
   - All processes must have measurable outcomes
   - Success criteria must be clearly defined
   - Time constraints and performance metrics must be specified

5. Modifiability
   - Requirements must be modular
   - Dependencies must be clearly identified
   - Configuration parameters should be separate from core logic

6. Traceability
   - Each process must link to business objectives
   - Actor roles must align with organizational structure
   - Process flows must show clear end-to-end paths

Based on these criteria, provide ONE of these responses:

IF requirements are incomplete:
{
    "type": "ENHANCEMENT_GUIDE",
    "content": {
        "missingElements": {
            "processes": ["missing processes"],
            "flows": ["missing flows"],
            "teams": ["missing team interactions"]
        },
        "recommendations": {
            "immediate": ["what to add"],
            "questions": ["questions to ask stakeholders"]
        }
    }
}

IF requirements are complete:`
        } else {
            return `
JSON format must be follow:`
        }
    }

    getPreviousChunkSummary() {
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

    uuid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }

    createEvent(event, elementId, x, y) {
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

    createActor(actor, actorId, x, y) {
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

    createSwimLane(laneId, y, startX, endX) {
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

    createRelation(fromEvent, toEvent, relationId, level) {
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

    createModel(text) {
        try {
            let model = super.createModel(text);
            
            if(model && model.type === "ANALYSIS_RESULT") {
                if(this.state === "end")
                    console.log(`[*] 요구사항이 충분하여 프로세스 분석 결과를 생성을 완료했습니다.`, {model, text, input: this.client.input})
                else
                    console.log(`[*] 요구사항이 충분하여 프로세스 분석 결과를 생성 중입니다.`, {textLength: text.length})
                
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

                
                if(model.content && model.content.actors && model.content.events) {
                    // Actor 생성 및 위치 설정
                    model.content.actors.forEach((actor, idx) => {
                        const actorUuid = this.uuid();
                        const laneY = INITIAL_Y + idx * LANE_HEIGHT;
                        actorLanes[actor.name] = idx;
                        
                        // Actor 생성
                        modelElements[actorUuid] = this.createActor(
                            actor,
                            actorUuid,
                            ACTOR_MARGIN_LEFT,
                            laneY
                        );
        
                        // 스윔레인 라인 생성
                        if (idx < model.content.actors.length) {
                            const laneUuid = this.uuid();
                            relations[laneUuid] = this.createSwimLane(
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
                            const elementUuid = this.uuid();
                            const eventElement = this.createEvent(
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
                                    const relationId = this.uuid();
                                    relations[relationId] = this.createRelation(
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
    
                let esvalue = {
                    elements: modelElements,
                    relations: relations,
                };
    
                return {
                    type: "ANALYSIS_RESULT",
                    projectName: "Requirements Analysis",
                    content: esvalue,
                    analysisResult: model.content,
                    currentGeneratedLength: text.length
                };
            } else if (model.type === "ENHANCEMENT_GUIDE") {
                console.log("[*] 요구사항이 불충분하여 개선 가이드를 생성했습니다.");
                return model;
            }
    
            return model;
        } catch(e) {
            console.log(e);
            return {
                type: "ENHANCEMENT_GUIDE",
                content: {
                    missingElements: {
                        processes: [],
                        flows: [],
                        teams: []
                    }
                }
            };
        }
    }
}

module.exports = RequirementsValidationGenerator;