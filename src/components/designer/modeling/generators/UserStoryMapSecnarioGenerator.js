import AIGenerator from "./AIGenerator";


export default class UserStoryGenerator extends AIGenerator{

    constructor(client){
        super(client);
        this.style = "detailed usecase spec" // "given-when-then styled spec"// | "user story" | "BDD story" | "detailed usecase spec"
    }
    
    createPrompt(){

        let modelDescription = "Please refer to the information below and write a scenario for the User Story Map. \n\n"


        if(this.client.input.painpointAnalysis){
            modelDescription += "Painpoint analysis and Possible solutions: \n\n"
            let relations = this.client.input.painpointAnalysis.relations
            Object.keys(relations).forEach(key=>{
                let painPoint = relations[key].sourceElement.name
                let possibleSolution = relations[key].targetElement.name

                modelDescription += `${painPoint}:${possibleSolution}\n`
            });
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

        return `
        ${modelDescription}
        
        The response is must be in the same language with the service name.
        
        `
    }


}