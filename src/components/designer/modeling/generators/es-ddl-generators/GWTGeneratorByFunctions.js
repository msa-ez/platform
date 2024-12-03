const FormattedJSONAIGenerator = require("../FormattedJSONAIGenerator");
const ESValueSummarizeUtil = require("./modules/ESValueSummarizeUtil")
const ESAliasTransManager = require("./modules/ESAliasTransManager")

class GWTGeneratorByFunctions extends FormattedJSONAIGenerator{
    constructor(client){
        super(client);

        this.checkInputParamsKeys = ["targetBoundedContext", "description", "esValue"]
        this.progressCheckStrings = ["step1-requirementsAnalysis", "\"requirements\"", "step2-testCaseAnalysis", "step3-GWTGeneration", "step4-GWTEvaluation", "\"overallScore\""]
    }


    onGenerateBefore(inputParams){
        this.esAliasTransManager = new ESAliasTransManager(inputParams.esValue)
    }


    __buildAgentRolePrompt(){
        return `You are an experienced test engineer and behavior-driven development (BDD) specialist. Your expertise lies in:
- Creating comprehensive test scenarios using Given-When-Then format
- Analyzing business requirements to identify testable behaviors
- Ensuring test coverage across different use cases
- Designing maintainable and reusable test cases
- Understanding domain-driven design concepts and event-driven systems
`
    }

    __buildTaskGuidelinesPrompt(){
        return `You need to extract the right GWT (Given, When, Then) cases from the user's requirements and add them to the right commands in the given bounded context.

Please follow these rules.
1. Extract GWTs from user requirements that cover as many different cases as possible.
2. You must add GWT using only the Id of the command in the given Bounded Context.
3. The generated GWTs will be used later in code generation, so we need unique, non-duplicated GWTs that are sufficiently helpful in code generation. 
4. Do not write comments in the output JSON object.

`
    }

    __buildRequestFormatPrompt(){
        return ESValueSummarizeUtil.getGuidePrompt()
    }

    __buildJsonResponseFormat() {
        return `
{
    "thoughtProcess": {
        // From the requirements requested by the user, derive scenarios that can be tested with the given commands.
        "step1-requirementsAnalysis": {
            "thought": "thought process for request analysis",
            "reflection": "re-evaluate your thought to see if there's anything you can strengthen.",
            "result": {
                "requirements": [
                    {"name": "requirement-name", "description": "requirement-description", "commandId": "command-id"},
                    ...
                ]
            }
        },

        // Analyse the different scenarios in which GWTs can be derived from the requirements identified in Step 1.
        "step2-testCaseAnalysis": {
            "thought": "thought process for request analysis",
            "reflection": "re-evaluate your thought to see if there's anything you can strengthen.",
            "result": {
                "<requirement-name>": {
                    "scenarios": [
                        {"name": "scenario-name", "description": "scenario-description"},
                        ...
                    ]
                }
            }
        },

        // Based on your analysis in steps 1 and 2, create a set of possible GWTs for each requirement.
        // Generate the appropriate GWTs for each scenario analysed in STEP2.
        "step3-GWTGeneration": {
            "thought": "thought process for GWT generation",
            "reflection": "re-evaluate your thought to see if there's anything you can strengthen.",
            "result": {
                "<requirement-name>": {
                    "targetCommandId": "<targetCommandId>",
                    "gwts": [
                        {
                            "given": {
                                "name": "<givenName>", // You can write the name of Aggregate
                                "values": {
                                    // There are three types of attribute values you can write.
                                    // 1. Write an actual possible value(You can write String, Number, Boolean, Array, Object, etc.)
                                    // 2. If the current value is empty, write null.
                                    // 3. If the attribute seems unrelated to this GWT, write "N/A".
                                    "<attributeName>": <attributeValue|null|"N/A">
                                }
                            },

                            "when": {
                                "name": "<whenName>", // You can write the name of Command
                                "values": {
                                    "<attributeName>": <attributeValue|null|"N/A">
                                }
                            },

                            "then": {
                                "name": "<thenName>", // You can write the name of Event
                                "values": {
                                    "<attributeName>": <attributeValue|null|"N/A">
                                }
                            }
                        }
                    ]
                }
            }
        },

        "step4-GWTEvaluation": {
            "thought": "Evaluate the completeness and quality of generated GWTs",
            "reflection": "Consider if the GWTs fully cover all scenarios and follow best practices",
            "result": {
                "evaluationCriteria": {
                    "requirementsCoverage": {
                        "score": "<0-100>",
                        "details": ["<requirement coverage detail>", ...],
                        "missingScenarios": ["<missing scenario>", ...]
                    },
                    "gwtQuality": {
                        "score": "<0-100>",
                        "details": ["<GWT quality detail>", ...],
                        "improvements": ["<suggested improvement>", ...]
                    },
                    "testScenarioCompleteness": {
                        "score": "<0-100>",
                        "details": ["<test scenario detail>", ...],
                        "gaps": ["<identified gap>", ...]
                    },
                    "bestPracticesAlignment": {
                        "score": "<0-100>",
                        "details": ["<best practice alignment detail>", ...],
                        "violations": ["<best practice violation>", ...]
                    },
                    "commandAlignment": {
                        "score": "<0-100>",
                        "details": ["<command alignment detail>", ...],
                        "matchedCommands": [
                            {
                                "commandId": "<command id>",
                                "implementedGWTs": ["<GWT name>", ...],
                                "missingAspects": ["<missing aspect>", ...]
                            }
                        ],
                        "unmatchedCommands": ["<command without GWT>", ...]
                    }
                },
                "overallScore": "<0-100>",
                "recommendedImprovements": [
                    {
                        "area": "<improvement area>",
                        "description": "<improvement description>",
                        "suggestedGWTs": ["<GWT name>", ...]
                    }
                ],
                "needsIteration": "<true|false>" // true if overallScore < 80
            }
        }
    }
}`
    }

    __buildJsonExampleInputFormat() {
        return {
            "Functional Requirements": `
We need to create a 'Room Reservation' screen and a 'Reservation Status' screen for managing meeting room reservations.

The 'Room Reservation' screen consists of two main sections: requester information and reservation details. The requester information section displays the requester's name, department, employee ID, office phone, mobile number, request date (YYYY.MM.DD), and approver information. Users can search and select a different approver by clicking a search button that opens a popup.

The reservation details section includes room selection, purpose, meeting type, number of participants, required equipment, reservation period, catering service, and additional notes. Room selection allows users to search available rooms with filters for location (building/floor) and capacity. Meeting type can be selected from a dropdown menu (internal, client meeting, training). The number of participants must be entered as a number. Required equipment can be selected from multiple checkboxes (projector, video conference system, whiteboard). Reservation period requires both date (YYYY.MM.DD) and time (HH:MM) selection using a calendar and time picker. Catering service is optional and includes meal type selection and number of meals if selected. Additional notes is a text field for special requests.

The 'Reservation Status' screen shows all reservations made by the user. It includes filters for date range (reservation date or meeting date) and status (all, pending, approved, rejected, cancelled). The result table displays reservation number, meeting purpose, department, requester name, employee ID, meeting date, request date, approval date, and status. Users can click on individual reservations to view details in a popup window.

The detail popup includes buttons for modification, cancellation, and printing. Modifications are only allowed for reservations in 'pending' status. Cancellation changes the status to 'cancelled' and can only be done before the meeting start time. The print button generates a printable version of the reservation details.

All fields except additional notes are required for submission. The submit button should only be activated when all required fields are filled. All data must be stored in the database upon successful submission.`
        }

    }

    __buildJsonExampleOutputFormat() {
        return{}
    }

    __buildJsonUserQueryInputFormat() {
        // TODO: 주어진 esValue에서 현재 대상 Bounded Context 관련 정보만 추출해서 요약 정보를 전달시켜서 최종적인 전달 흐름 완성하기
        // BCReGenerateCreateActionsGenerator 참고
        ESValueSummarizeUtil.getSummarizedBoundedContextValue(
            this.client.input.esValue,
            this.client.input.targetBoundedContext
        )

        return {
            "Current Bounded Context": this.esAliasTransManager.transToAliasInSummarizedESValue(

            ),

            "Functional Requirements": this.client.input.description,

            "Final Check List": `
* Make sure each command has an appropriate GWT from the user's requirements.
* Make sure your scenarios reflect the best use of GWT in your code generation.
`
        }
    }


    onCreateModelGenerating(returnObj) {
        returnObj.directMessage = `Generating GWTs for ${this.client.input.targetBoundedContext.name} Bounded Context... (${returnObj.modelRawValue.length} characters generated)`
    }

    onCreateModelFinished(returnObj) {
        console.log(returnObj.modelValue.aiOutput.thoughtProcess["step3-GWTGeneration"].result)
        returnObj.directMessage = `Generating GWTs for ${this.client.input.targetBoundedContext.name} Bounded Context... (${returnObj.modelRawValue.length} characters generated)`
    }
}

module.exports = GWTGeneratorByFunctions;