import JsonAIGenerator from "./JsonAIGenerator";


export default class UserStoryMapGenerator extends JsonAIGenerator{

    constructor(client){
        super(client);
        this.forEventStorming = false;
    }
    
    createPrompt(){
        let modelDescription = ""
        let persona = "Persona"
        if(this.client.input.persona){
            persona = this.client.input.persona.scenario
        }

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
Create a User Story Map by considering the contents below.

Painpoint analysis and Possible solutions: 

${modelDescription}

  {
    "user-activities": [
      {
        "name": "UserActivityName",
        "user-tasks": [
          {
            "name": "UserTaskName",
            "user-stories": [
              {
                "name": "UserStoryName"
                "as": "${persona}",
                "iWant": "Action",
                "soThat": "Purpose",
              }
            ]
          }
        ]
      }
    ]
  }
  
`
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

    createModel(text){
        let model = super.createModel(text);
        
        var me = this 

        let convertedModel = {
            elements: {},
            relations: {}
        }

        let eleView = {}
        let phasePos = 0;
        
        const BORDER = 20;
        const HEIGHT = 70;
        const START_Y = 180;
        let lastPhaseX = 200;
        const WIDTH = 170;

        // let textEleName = ['Phases', 'User Actions', 'Touch Points', 'Pain Points', 'PossibleSolutions']
        // for(var i = 0; i < 5; i++){
        //     let textUuid = me.uuid();
        //     convertedModel.elements[textUuid] = {
        //         _type: "org.uengine.modeling.model.Text",
        //         author: null,
        //         description: "",
        //         elementView: {
        //             _type: "org.uengine.modeling.model.Text",
        //             angle: 0,
        //             height: 15,
        //             id: textUuid,
        //             style: "{}",
        //             width: 35,
        //             x: 125,
        //             y: 180 + (i * 90),
    
        //         },
        //         imgSrc: "https://www.msaez.io:8081/static/image/symbol/text_element.png",
        //         name : textEleName[i],
        //         oldName: "Text"
        //     }
        // }

        // let actorUUID = me.uuid();
        // convertedModel.elements[actorUUID] = {
        //             name: model.persona,
        //             _type: me.forEventStorming ? "org.uengine.modeling.model.Actor": "Persona",
        //             elementView: {
        //                 height: HEIGHT,
        //                 id: actorUUID,
        //                 style: "{}",
        //                 width: WIDTH / 2,
        //                 x: lastPhaseX,
        //                 y: START_Y - 50
        //             }
        //         };


        if(model['user-activities']){
            model['user-activities'].forEach(function (activity, index){

                let activityUuid = me.uuid();
                let width
                if(activity['user-tasks'] && activity['user-tasks'].length){
                    width = (WIDTH + BORDER) * activity['user-tasks'].length - BORDER;
                } else {
                    width = (WIDTH + BORDER) * BORDER;
                }
                convertedModel.elements[activityUuid] = {
                    name: activity.name,
                    _type: "UserActivity",
                    elementView: {
                        height: HEIGHT + HEIGHT/2,
                        id: activityUuid,
                        style: "{}",
                        width: width,
                        x: lastPhaseX + width / 2,
                        y: START_Y
                    },
                    color: "#ED73B6"
                };

                activity['user-tasks'].forEach((task, index) => {
                        
                    let taskUuid = me.uuid();

                    let view = 
                        {   
                            _type: "UserTask",
                            id: taskUuid,
                            x: lastPhaseX + (BORDER + WIDTH) * index + WIDTH / 2,
                            y: START_Y + (HEIGHT + BORDER) * 2,
                            width: WIDTH,
                            height: HEIGHT * 2,
                            style: "{}",
                            angle: 0
                        }

                    convertedModel.elements[taskUuid] = {
                        _type: "UserTask",
                        name: task.name,
                        description: "",
                        author: null,
                        elementView: view,
                        color: "#F1A746",
                    };

                    task['user-stories'].forEach((story, index) => {

                        let storyUuid = me.uuid();
                        view = JSON.parse(JSON.stringify(view));
                        view.id = storyUuid;
                        view.height = HEIGHT * 2
                        view.y = START_Y + (HEIGHT + BORDER) * 5;

                        let personaAndStory = ""
                        if(me.client.input.persona){
                            let persona = me.client.input.persona;
                            personaAndStory += "As: \n"
                            personaAndStory += "- "+persona.persona+" ("+persona.age+" / "+persona.job+") \n"
                            personaAndStory += "- "+persona.description+"\n"
                            personaAndStory += "- "+persona.scenario+"\n\n"
                            personaAndStory += "I Want: "+story.iWant+"\n\n"
                            personaAndStory += "So That: "+story.soThat+"\n"
                        }

                        convertedModel.elements[storyUuid] = {
                            _type: "UserStory",
                            name: story.name,
                            description: personaAndStory,
                            author: null,
                            elementView: view,
                            color: "#F8D454",
                        };
                    });
                    
                });

                lastPhaseX = lastPhaseX + BORDER + width;


            });


            let lineUuid1 = me.uuid();
            convertedModel.relations[lineUuid1] = {
                _type: 'UserStoryMapLineElement',
                name: '',
                relationView: {
                    id: lineUuid1,
                    style: "{}",
                    value: "[[196,264],[1804,264]]",
                },
                size: 10,
                color: '#000000',
                dashStyle: '',
                imgSrc: 'https://www.msaez.io:8081/static/image/symbol/edge.png',
            }

            let lineUuid2 = me.uuid();
            convertedModel.relations[lineUuid2] = {
                _type: 'UserStoryMapLineElement',
                name: '',
                relationView: {
                    id: lineUuid2,
                    style: "{}",
                    value: "[[196,492],[1804,492]]",
                },
                size: 10,
                color: '#000000',
                dashStyle: '',
                imgSrc: 'https://www.msaez.io:8081/static/image/symbol/edge.png',
            }
        }

        return convertedModel;
    }



}
