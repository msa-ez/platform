import AIGenerator from "./AIGenerator";


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

            modelDescription += `\n\nThe response is must be in the same language with the service name. Also, please list development teams that manages this system and bounded contexts in the perspective of ${this.client.input.separationPrinciple}.`
        }


        return `
        Please generate actors and ${this.style} for ${this.client.input.title}. 

        ${modelDescription}
        
        `
    }


}