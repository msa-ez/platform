import AIGenerator from "./AIGenerator";
import JsonAIGenerator from "./JsonAIGenerator";

export default class UserStoryGenerator extends AIGenerator{

    constructor(client){
        super(client);
        this.style = "detailed usecase spec" // "given-when-then styled spec"// | "user story" | "BDD story" | "detailed usecase spec"
    }
    
    createPrompt(){

        let modelDescription = ""

        if(this.client.input.userStoryMapModel){
            let elements = this.client.input.userStoryMapModel.elements
            modelDescription += "Create only a bounded contexts by referring to the following user story.\n\n"
            modelDescription += "User story definition as follows: \n"
            Object.keys(elements).forEach(ele=>{
                if(elements[ele]._type ==="UserStory"){
                    modelDescription += "\n- user story: \n"
                    modelDescription += "story name: " + elements[ele].name + "\n"
                    modelDescription += "as: " + elements[ele].as + "\n"
                    modelDescription += "i want: " + elements[ele].iWant + "\n"
                    modelDescription += "so that: " + elements[ele].soThat + "\n"
                }
            });

            return modelDescription
        }else{
            if(this.client.input.painpointAnalysis){
                let modelPerPersona = this.client.input.painpointAnalysis
                modelDescription += "Persona definition and he(or her)'s painpoints and possible solutions as follows: \n\n"
                Object.keys(this.client.input.painpointAnalysis).forEach(persona=>{
                    modelDescription +="- "+ persona + "\n"
                    let relations = modelPerPersona[persona].relations
                    Object.keys(relations).forEach(key=>{
                        let painPoint = relations[key].sourceElement.name
                        let possibleSolution = relations[key].targetElement.name
        
                        modelDescription += `${painPoint}:${possibleSolution}\n`
                    });
                });
                // modelDescription += "Painpoint analysis and Possible solutions: \n\n"
            }else {
                if(this.client.input.personas){
                    if(this.client.input.personas.length>0){
                        let personas = this.client.input.personas
                        modelDescription += "Create pain points and possible solutions that may arise by considering the following Personas. \n\n"
                        for(var i=0; i<personas.length; i++){
                            modelDescription +="- "+ personas[i].persona + "\n"
                        }
                    }
                }
            }
    
            if(this.client.input.businessModel){
                modelDescription += "\n Detailed Business Model of the service is: \n"
                let elementsByTypes = {};
                let model = this.client.input.businessModel;
                Object.keys(model)
                    .forEach(key=>{
                        let element = model[key]; 
                        if(!elementsByTypes[element._type]) elementsByTypes[element._type]=[]; 
                        elementsByTypes[element._type].push(element.name);
                    }
                );
    
                modelDescription += "\n" +Object.keys(elementsByTypes)
                    .reduce((sum, type) => {
                        let shortType = type.split(".").pop(); 
                        let stickers = elementsByTypes[type].join(", ");
                        return sum + `${shortType}:${stickers}\n`
                    }, 
                "");
            }

            modelDescription += `\n\nThe response is must be in the same language with the service name. Also, please list bounded contexts in the perspective of ${this.client.input.separationPrinciple}.`
        }

        return `
            Please generate a comprehensive analysis for ${this.client.input.title} with the following requests:

            ${this.userStroyPrompt()}

            1. Actors:
            - List all actors (users, external systems, etc.) that interact with the system
            - Describe each actor's role and responsibilities
            
            2. User Stories (in ${this.style}):
            - Create detailed user stories for each actor
            - Each story should include "As a", "I want to", "So that" format
            - Include acceptance criteria for each story
            
            3. Business Rules:
            - Define core business rules and constraints
            - Include validation rules and business logic
            - Specify any regulatory or compliance requirements

            The response must:
            - Ensure complete traceability between actors, stories
            - Avoid any missing connections between components
            - Provide a clear, well-structured text response
        `
    }

    createModel(text){
        try{
            if (text.startsWith('```json')) {
                text = text.slice(7);
            }
            if (text.endsWith('```')) {
                text = text.slice(0, -3);
            }
            
            let model = super.createModel(text);

            if(model){
                return model;
            }else{
                return text;
            }
        }catch(e){
            console.log(e);
            return null;
        }
    }



    userStroyPrompt(){
        // 제목만 있는 경우 가상의 유저시나리오 생성
        if (!this.client.input.userStory || this.client.input.userStory.length < 100) {
            return ``
        }
        
        // 유저스토리가 100자 이상인 경우 해당 내용 기반으로 생성
        return `
            The user story is: ${this.client.input.userStory}
            
            Please generate user stories and scenarios based on the above content, staying within the scope and context provided.
        `
    }
}