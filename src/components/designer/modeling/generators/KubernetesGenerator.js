import AIGenerator from "./AIGenerator";
const yaml = require('js-yaml');
let partialParse = require('partial-json-parser');


export default class KubernetesGenerator extends AIGenerator{

    constructor(client){
        super(client);
        this.defaultUserStory = "for Service"
    }
    
    createPrompt(){
        return `Create all yaml specifications for the kubernetes components needed to meet the following requirements.

        ${this.client.userStory ? this.client.userStory:this.defaultUserStory}

        The format must be as follows:\n

        {
            "elements": {
                deployments: [{
                    "name": "kubernetes component Name",
                    "kind": "kubernetes component Kind",
                    "yaml": "A yaml specification into which kubernetes components can be deployed"
                }],
                services: [{
                    "name": "kubernetes component Name",
                    "kind": "kubernetes component Kind",
                    "yaml": "A yaml specification into which kubernetes components can be deployed."
                }],
                ingresses: [{
                    "name": "kubernetes component Name",
                    "kind": "kubernetes component Kind",
                    "yaml": "A yaml specification into which kubernetes components can be deployed."
                }],
            }
        
        }\n
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
        let model = partialParse(text);
        let me = this;

        let modelValue = {
            elements: {},
            relations: {}
        }

        if(model['elements']){
            Object.keys(model['elements']).forEach((key) => {

                let elementView = {
                    '_type': "",
                    'id': "",
                    'x': 150,
                    'y': 200,
                    'width': 100,
                    'height': 100,
                    'style': JSON.stringify({}),
                    'angle': 0,
                }
                
                if(model['elements'][key] && key=="deployments"){
                    for(let i=0; i<model['elements']['deployments'].length; i++){
                        let deployment = model['elements']['deployments'][i]
                        let uuid = me.uuid()
                        let element = {}
                        let eleSpec = yaml.load(deployment.yaml)

                        elementView._type = "Deployment"
                        elementView.id = uuid
                        elementView.x = 150 + i*200
                        elementView.y = 200
                        
                        element = {
                            _type: "Deployment",
                            name: deployment.name,
                            namespace: '',
                            elementView: elementView,
                            object: JSON.parse(JSON.stringify(eleSpec)),
                            advancedAttributePaths: {
                                "metadata.annotataions": {
                                    "kubernetes.io/change-cause": ""
                                },
                                "spec.template.spec.containers[0].resources[0]": {
                                    "limits": { 
                                        "cpu": "100m", 
                                        "mem": "512Mi"
                                    }
                                },
                            },
                            outboundVolumes: [],
                            outboundConfigMaps: [],
                            inboundHPA: null,
                            connectableType: ["PersistentVolumeClaim", "ConfigMap", "Secret"],
                            status: null,
                            replicasStatus: "",
                            inboundDestinationRule: null,
                            outboundSecrets: [],
                        }

                        modelValue.elements[uuid] = element
                    }
                }

                if(model['elements'][key] && key=="services"){
                    for(let i=0; i<model['elements']['services'].length; i++){
                        let service = model['elements']['services'][i]
                        let uuid = me.uuid()
                        let element = {}
                        let eleSpec = yaml.load(service.yaml)

                        elementView._type = "Service"
                        elementView.id = uuid
                        elementView.x = 150 + i*200
                        elementView.y = 400

                        element = {
                            _type: "Service",
                            name: service.name,
                            namespace: '',
                            host: '',
                            path: '',
                            elementView: elementView,
                            object: JSON.parse(JSON.stringify(eleSpec)),
                            outboundDeployment: null,
                            outboundPod: null,
                            outboundReplicaSet: null,
                            outboundStatefulSet: null,
                            outboundDaemonSet: null,
                            outboundRollout: null,
                            connectableType: ["Deployment", "Pod", "ReplicaSet", "StatefulSet", "DaemonSet", "Rollout"],
                            status: null,
                        }

                        modelValue.elements[uuid] = element
                    }
                }

                // if(eleSpec.kind=="Deployment"){
                //     element = {
                //         _type: "Deployment",
                //         name: ele.name,
                //         namespace: '',
                //         elementView: elementView,
                //         object: JSON.parse(JSON.stringify(eleSpec)),
                //         advancedAttributePaths: {
                //             "metadata.annotataions": {
                //                 "kubernetes.io/change-cause": ""
                //             },
                //             "spec.template.spec.containers[0].resources[0]": {
                //                 "limits": { 
                //                     "cpu": "100m", 
                //                     "mem": "512Mi"
                //                 }
                //             },
                //         },
                //         outboundVolumes: [],
                //         outboundConfigMaps: [],
                //         inboundHPA: null,
                //         connectableType: ["PersistentVolumeClaim", "ConfigMap", "Secret"],
                //         status: null,
                //         replicasStatus: "",
                //         inboundDestinationRule: null,
                //         outboundSecrets: [],
                //     }

                // }else if(eleSpec.kind=="Service"){
                //     element = {
                //         _type: "Service",
                //         name: '',
                //         namespace: '',
                //         host: '',
                //         path: '',
                //         elementView: elementView,
                //         object: JSON.parse(JSON.stringify(eleSpec)),
                //         outboundDeployment: null,
                //         outboundPod: null,
                //         outboundReplicaSet: null,
                //         outboundStatefulSet: null,
                //         outboundDaemonSet: null,
                //         outboundRollout: null,
                //         connectableType: ["Deployment", "Pod", "ReplicaSet", "StatefulSet", "DaemonSet", "Rollout"],
                //         status: null,
                //     }


                // }
            })
        }

        return modelValue;

    }


}