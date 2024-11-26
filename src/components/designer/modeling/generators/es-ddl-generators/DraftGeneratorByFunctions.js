const JsonAIGenerator = require("../JsonAIGenerator");
const GlobalPromptUtil = require("./modules/GlobalPromptUtil");

class DraftGeneratorByFunctions extends JsonAIGenerator{
    constructor(client){
        super(client);

        this.model = "gpt-4o-2024-11-20"
        this.generatorName = 'DraftGeneratorByFunctions'
        this.inputedParams = null
        this.isFirstResponse = true

        this.preferredLanguage = this.preferredLanguage ? this.preferredLanguage : "English"
        this.temperature = 1.0
        this.top_p = 0.6
    }
    

    createPrompt(){
        try {

            for(let optionKey of ["description", "boundedContext"])
                if(this.client.input[optionKey] === undefined) 
                    throw new Error(`${optionKey} 파라미터가 전달되지 않았습니다.`)
            this.inputedParams = {
                description: this.client.input.description,
                targetBoundedContext: this.client.input.boundedContext
            }
            
            console.log(`[*] ${this.generatorName}에 대한 프롬프트 생성중...`, {inputedParams: this.inputedParams})

            const prompt = this._getSystemPrompt() + this._getUserPrompt(
                this.inputedParams.description
            )

            console.log(`[*] LLM에게 ${this.generatorName}에서 생성된 프롬프트 전달중...`, {prompt})
            this.isFirstResponse = true
            return prompt

        } catch(e) {

            console.error(`[!] ${this.generatorName}에 대한 프롬프트 생성 도중에 오류 발생!`, {inputedParams: this.inputedParams, error:e})
            console.error(e)
            throw e

        }
    }

    _getSystemPrompt(){
        return this.__getFrontGuidePrompt() +
            this.__getOutputSyntaxGuidePrompt() +
            this.__getExamplePrompt() +
            GlobalPromptUtil.getJsonCompressGuidePrompt()
    }

    __getFrontGuidePrompt(){
        return `You are required to write a proposal on how to define multiple Aggregates in a given Bounded Context via a passed in functional requirements.

Please follow these rules.
1. Generate suggestions that match all functional requirements requested by users.
2. Instead of putting all properties into a single Aggregate, put multiple Aggregates or some properties into ValueObjects and Entities for better maintainability.
3. Avoid creating unnecessary ValueObjects and Entities with only one property, and only create them if they are useful enough.
4. In the draft, the name of each object should be written in English, and the rest of the content (alias, pros, cons, conclusions, etc.) should be written in ${this.preferredLanguage} language so that it is easily understood by the user.
5. Do not write comments in the output JSON object.

Recommendation Instructions to write proposal.
1. Aggregates inside a bounded context can have ValueObjects or Entities, and they can have relationships between them.
2. Generate different options based on each of the perspectives provided by ACID.
3. Create at least two unique, non-duplicate options.
4. You should ultimately choose the best option out of the several options and write why, which will be selected by default.

`
    }

    __getOutputSyntaxGuidePrompt() {
        return `You should return a list containing JSON objects for performing specific actions.
The returned format should be as follows.
\`\`\`json
{
    "thoughtProcess": {
        // Analyse the user's needs as much as possible and rewrite the requirements to be specific and clear.
        "step1-requirementsAnalysis": {
            "thought": "thought process for request analysis",
            "reflection": "re-evaluate your thought to see if there's anything you can strengthen.",
            "result": {
                "requirements": [
                    {name: "requirement-name", description: "requirement-description"},
                    ...
                ]
            }
        },

        // Figure out how Aggregate, ValueObject, and Entity can be configured with the requirements you identified in step 1.
        "step2-designPossibleAggregates": {
            "thought": "thought process for aggregate design",
            "reflection": "re-evaluate your thought to see if there's anything you can strengthen.",
            "result": {
                "aggregates": [
                    {
                        "name": "aggregate-name",
                        "alias": "aggregate-alias",
                        "entities": ["entity-name-1", ...],
                        "valueObjects": ["value-object-name-1", ...],
                        "usedRequestNames": ["requirement-name-1", ...]
                    }
                ]
            }
        },

        // Consider how you can leverage the Aggregates you configured in step2 to create your own options.
        "step3-designPossibleOptions": {
            "thought": "thought process for option design",
            "reflection": "re-evaluate your thought to see if there's anything you can strengthen.",
            "result": {
                "options": [
                    {
                        "structure": [
                            {
                                "aggregate": {
                                    "name": "aggregate-name",
                                    "alias": "aggregate-alias"
                                },
                                "entities": [{
                                    "name": "entity-name",
                                    "alias": "entity-alias"
                                }],
                                "valueObjects": [{
                                    "name": "value-object-name",
                                    "alias": "value-object-alias"
                                }]
                            }
                        ],
                        "pros": "pros keyword: pros for this option",
                        "cons": "cons keyword: cons for this option"
                    }
                ],
                "defaultOptionIndex": "The index of the option that is selected by default(starts from 0)",
                "conclusions": "Write a conclusion for each option, explaining in which cases it would be best to choose that option."
            }
        }
    }
}
\`\`\`

`
    }

    __getExamplePrompt(){
        return `Let me give you an example.
[INPUT]
- Functional Requirements
We need to create a 'Room Reservation' screen and a 'Reservation Status' screen for managing meeting room reservations.

The 'Room Reservation' screen consists of two main sections: requester information and reservation details. The requester information section displays the requester's name, department, employee ID, office phone, mobile number, request date (YYYY.MM.DD), and approver information. Users can search and select a different approver by clicking a search button that opens a popup.

The reservation details section includes room selection, purpose, meeting type, number of participants, required equipment, reservation period, catering service, and additional notes. Room selection allows users to search available rooms with filters for location (building/floor) and capacity. Meeting type can be selected from a dropdown menu (internal, client meeting, training). The number of participants must be entered as a number. Required equipment can be selected from multiple checkboxes (projector, video conference system, whiteboard). Reservation period requires both date (YYYY.MM.DD) and time (HH:MM) selection using a calendar and time picker. Catering service is optional and includes meal type selection and number of meals if selected. Additional notes is a text field for special requests.

The 'Reservation Status' screen shows all reservations made by the user. It includes filters for date range (reservation date or meeting date) and status (all, pending, approved, rejected, cancelled). The result table displays reservation number, meeting purpose, department, requester name, employee ID, meeting date, request date, approval date, and status. Users can click on individual reservations to view details in a popup window.

The detail popup includes buttons for modification, cancellation, and printing. Modifications are only allowed for reservations in 'pending' status. Cancellation changes the status to 'cancelled' and can only be done before the meeting start time. The print button generates a printable version of the reservation details.

All fields except additional notes are required for submission. The submit button should only be activated when all required fields are filled. All data must be stored in the database upon successful submission.

[OUTPUT]
\`\`\`json
{"thoughtProcess":{"step1-requirementsAnalysis":{"thought":"The requirements describe a meeting room reservation system with two main functionalities: room reservation and reservation management. Let's break down the core requirements and identify key entities.","reflection":"We should consider the relationship between reservations and rooms, and how to handle the approval workflow efficiently.","result":{"requirements":[{"name":"reservation-creation","description":"Users must be able to create room reservations with requester details and meeting specifications"},{"name":"room-management","description":"System needs to manage meeting rooms with their properties and availability"},{"name":"approval-workflow","description":"Reservations require approval process with different status management"},{"name":"equipment-handling","description":"Rooms can have different equipment configurations that need to be tracked"},{"name":"catering-service","description":"Optional catering services can be added to reservations"}]}},"step2-designPossibleAggregates":{"thought":"We need to identify the main aggregates that will form the core of our domain model. The reservation process seems to be the main focus.","reflection":"We should consider separating room management from reservations to allow independent scaling and maintenance.","result":{"aggregates":[{"name":"Reservation","alias":"reservation","entities":["Requester","Approver"],"valueObjects":["ReservationPeriod","CateringDetails"],"usedRequestNames":["reservation-creation","approval-workflow","catering-service"]},{"name":"Room","alias":"room","entities":["Equipment"],"valueObjects":["Location","Capacity"],"usedRequestNames":["room-management","equipment-handling"]}]}},"step3-designPossibleOptions":{"thought":"Let's create different options for organizing these aggregates, considering various trade-offs.","reflection":"We should consider both tight and loose coupling approaches between Room and Reservation.","result":{"options":[{"structure":[{"aggregate":{"name":"Reservation","alias":"Reservation"},"entities":[{"name":"Requester","alias":"Requester"},{"name":"Approver","alias":"Approver"}],"valueObjects":[{"name":"ReservationPeriod","alias":"ReservationPeriod"},{"name":"CateringDetails","alias":"CateringDetails"}]},{"aggregate":{"name":"Room","alias":"Room"},"entities":[{"name":"Equipment","alias":"Equipment"}],"valueObjects":[{"name":"Location","alias":"Location"},{"name":"Capacity","alias":"Capacity"}]}],"pros":"Each aggregate is managed independently providing good scalability, clear separation of responsibilities between room management and reservation management","cons":"Requires querying between two aggregates when checking reservation availability"},{"structure":[{"aggregate":{"name":"RoomReservation","alias":"RoomReservation"},"entities":[{"name":"Room","alias":"Room"},{"name":"Requester","alias":"Requester"},{"name":"Approver","alias":"Approver"}],"valueObjects":[{"name":"ReservationPeriod","alias":"ReservationPeriod"},{"name":"Equipment","alias":"Equipment"},{"name":"CateringDetails","alias":"CateringDetails"}]}],"pros":"All reservation-related information is managed in a single aggregate, making queries simple","cons":"The aggregate may become too large making changes difficult, and room management functionality may be limited to expand"}],"defaultOptionIndex":0,"conclusions":"The first option provides better scalability and maintainability by clearly separating room management and reservation management responsibilities. The second option is easier to implement in simple systems but may become harder to manage as the system grows."}}}}
\`\`\`

`
    }

    _getUserPrompt(description){
        return `Now let's process the user's input.
[INPUT]
- Functional Requirements
${description}

- Final Check List
* Have you adequately addressed all of your users' needs?
* Are there no Entities, ValueObjects with one property or unnecessary properties?
* Are there any options that are redundant and effectively meaningless?
* Did you write the name property of the object you created in English and the alias property in ${this.preferredLanguage} language?

[OUTPUT]
\`\`\`json
`
    }


    createModel(text){
        const isFirstResponse = this.isFirstResponse
        this.isFirstResponse = false

        if(this.state !== 'end') {
            console.log(`[*] ${this.generatorName}에서 결과 생성중... (현재 출력된 문자 수: ${text.length})`)

            return {
                generatorName: this.generatorName,
                modelValue: null,
                modelRawValue: text,
                isFirstResponse: isFirstResponse
            }
        }

        try {

            console.log(`[*] ${this.generatorName}에서 결과 파싱중...`, {text})


            let aiOutput = GlobalPromptUtil.parseToJson(text)


            const outputResult = {
                generatorName: this.generatorName,
                modelValue: {
                    thoughtProcess: aiOutput.thoughtProcess,
                    output: aiOutput.thoughtProcess["step3-designPossibleOptions"].result
                },
                modelRawValue: text,
                inputedParams: this.inputedParams,
                isFirstResponse: isFirstResponse
            }
            console.log(`[*] ${this.generatorName}에서 결과 파싱 완료!`, {outputResult})

            return outputResult

        } catch(e) {

            console.error(`[!] ${this.modelName}에서 결과 파싱중에 오류 발생!`, {text, error:e})
            console.error(e)

            return {
                generatorName: this.generatorName,
                modelValue: null,
                modelRawValue: text,
                inputedParams: this.inputedParams,
                isError: true,
                isFirstResponse: isFirstResponse
            }

        }
    }
}


module.exports = DraftGeneratorByFunctions;