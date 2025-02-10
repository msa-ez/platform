<template>
    <div>
        <!-- <v-row class="marketplace-card-row" style="align-items: self-end;">
            <v-col cols="12" lg="2" md="3" sm="6" v-for="(openAPI,index) in lists" :key="index">
                <v-card flat>
                    <div style="text-align: right;" v-if="!openAPI.basic">
                        <v-icon small @click="removeOpenAPI(openAPI, index)">mdi-minus</v-icon>
                    </div>
                </v-card>
                <v-card class="marketplace-card" outlined>
                    <div @click="appendPBC(openAPI)">
                        <div class="marketplace-image-text-container">
                            <v-img  v-if="openAPI.imageUrl" class="marketplace-card-image" :src="openAPI.imageUrl"></v-img>
                            <v-card-subtitle class="marketplace-card-subtitle">{{ openAPI.description }}</v-card-subtitle>
                        </div>
                        <v-card-title class="marketplace-card-title">{{ openAPI.name }}</v-card-title>
                    </div>
                </v-card>
            </v-col>
            <v-col cols="12" lg="2" md="3" sm="6">
                <v-card class="marketplace-card" outlined>
                    <div v-if="editMode" style="text-align: center;width: 100%;height: 265px;">
                        <v-card-text>
                            <v-text-field
                                    v-model="openAPICard.name"
                                    color="primary"
                                    label="Display Name"
                                    dense
                            ></v-text-field>
                            <v-text-field
                                    v-model="openAPICard.path"
                                    color="primary"
                                    label="Path"
                                    :rules="rules"
                                    dense
                            ></v-text-field>
                            <v-text-field
                                    v-model="openAPICard.imageUrl"
                                    color="primary"
                                    label="Image Url"
                                    dense
                            ></v-text-field>
                            <v-text-field
                                    v-model="openAPICard.description"
                                    color="primary"
                                    label="Description"
                                    dense
                            ></v-text-field>
                        </v-card-text>
                        <v-card-actions style="justify-content: end;">
                            <v-btn @click="appendOpenAPI()"  :disabled="!(openAPICard.name && openAPICard.path)" color="primary" text small>Save</v-btn>
                            <v-btn @click="cancelOpenAPI()" text small>Cancel</v-btn>
                        </v-card-actions>
                    </div>
                    <div v-else style="text-align: center;width: 100%;height: 215px;">
                        <v-btn text style="width: 100%; height: 100%;" large @click="editOpenAPI()"> + </v-btn >
                    </div>
                </v-card>
            </v-col>
        </v-row> -->
    </div>
</template>

<script>
    import OpenAPIToPBC from './OpenAPIToPBC';
    import getParent from '../../../utils/getParent';
    const changeCase = require('change-case');
    const pluralize = require('pluralize');

    export default {
        name: 'open-api-pbc',
        props: {
            value: Array, // OpenAPILists
            pbc: Object   // element
        },
        data() {
            return {
                canvas: null,
                editMode: false,
                lists: [],
                openAPICard: {
                    description: "",
                    imageUrl: "",
                    name: "",
                    rating: 5,
                    path: ""
                },
                rules: [
                    value => (value && value.includes('http')) || 'Please check url.',
                ],
            }
        },
        created: function () {
            this.canvas = getParent(this.$parent, "event-storming-model-canvas");
            // this.setBasicOpenAPILists()
        },
        methods:{
            setBasicOpenAPILists(){
                /*
                    setting openAPI Basic Lists
                */
                var me = this
                let localList = localStorage.getItem('openAPILists')
                let basic = [];

                // basic.push({
                //     description:"Test for OpenAPI",
                //     imageUrl:"https://github.com/kibum0405/topping-wijmo/assets/59447401/3cf4bb64-9128-4eae-8aba-7e70cb8b55fb",
                //     name:"OpenAPI(url)",
                //     rating:5,
                //     path:"https://github.com/sooheon45/pbc-gitlab/blob/main/openapi.yaml",
                //     basic: true
                // })
                // basic.push({
                //     description:"Test for OpenAPI",
                //     imageUrl:"https://github.com/kibum0405/topping-wijmo/assets/59447401/3cf4bb64-9128-4eae-8aba-7e70cb8b55fb",
                //     name:"OpenAPI(url)2",
                //     rating:5,
                //     path:"https://github.com/sooheon45/pbc-gitlab/blob/main/test/name/open/openapi.yaml",
                //     basic: true
                // })

                if(me.value.length > 0){
                    me.lists = basic.concat(me.value);
                }
                if(localList){
                    me.lists = basic.concat(JSON.parse(localList));
                }
            },
            async appendPBC(openAPIObj){
                try {
                    if(!openAPIObj.path) return;

                    let element = await this.convert(openAPIObj.path, this.pbc, openAPIObj);
                    this.canvas.addElementAction(element);
                    // this.$set(this.canvas.value.elements, element.elementView.id, element);

                    this.$emit('result', true)
                    return true;
                } catch (e) {
                    this.$emit('result', false)
                    return false;
                }
            },
            setPBCInfo(pbc, Info){
                this.pbc = pbc
                this.openAPICard = Info
            },
            editOpenAPI(item){
                if(item) this.openAPICard = item

                this.editMode = true;
            },
            appendOpenAPI(){
                if(this.openAPICard.path && this.openAPICard.name){
                    this.lists.push(this.openAPICard);
                    let lists = this.lists.filter(x=> !x.basic)
                    localStorage.setItem('openAPILists', JSON.stringify(lists));
                    this.cancelOpenAPI()
                } else {
                    alert("Please enter the path and name as required.")
                }
            },
            removeOpenAPI(item, idx){
                if (idx > -1) this.lists.splice(idx, 1)
                let lists = this.lists.filter(x=> !x.basic)
                localStorage.setItem('openAPILists', JSON.stringify(lists));
            },
            cancelOpenAPI(){
                this.openAPICard = {
                    description: "",
                    imageUrl: "",
                    name: "",
                    rating: 5,
                    path: ""
                }
                this.editMode = false;
            },
            async convert(path, pbc, info){
                const openAPIClass = new OpenAPIToPBC();
                let resultObj = await openAPIClass.call(path);

                if(resultObj.isModel) {
                    return this.generatePBCByModel(resultObj, pbc, info);
                } else {
                    return this.generatePBCByOpenAPI(resultObj, pbc, info);
                }
            },
            setElementName(element){
                if(element && element.name){
                    element.namePascalCase = changeCase.pascalCase(element.name)
                    element.nameCamelCase = changeCase.camelCase(element.name)
                    element.namePlural = pluralize(element.nameCamelCase);
                }
            },
            generatePBCByModel(convertValue, pbcElement, info){
                var me = this
                console.log(convertValue, pbcElement);

                pbcElement.name = convertValue.info.projectName ? convertValue.info.projectName : pbcElement.name;
                pbcElement.description = ''
                pbcElement.modelValue.modelPath = info.path;
                pbcElement.modelValue.scm = convertValue.info.scm

                 // common
                 convertValue.aggregates.forEach(function(element){
                    element.visibility = 'private'
                    me.setElementName(element)

                    pbcElement.aggregates.push(element);
                });

                // left sides
                convertValue.views.forEach(function(element){
                    element.visibility = 'private'
                    me.setElementName(element)

                    if(element.aggregate && element.aggregate.id){
                        element.aggregate = convertValue.aggregates.find(aggregate => aggregate.id == element.aggregate.id);
                    }
                    if(element.boundedContext && element.boundedContext.id){
                        element.boundedContext = convertValue.boundedContextes.find(boundedContext => boundedContext.id == element.boundedContext.id);
                    }

                    pbcElement.views.push(element);
                });
                convertValue.commands.forEach(function(element){
                    element.visibility = 'private'
                    me.setElementName(element)

                    if(element.aggregate && element.aggregate.id){
                        element.aggregate = convertValue.aggregates.find(aggregate => aggregate.id == element.aggregate.id);
                    }
                    if(element.boundedContext && element.boundedContext.id){
                        element.boundedContext = convertValue.boundedContextes.find(boundedContext => boundedContext.id == element.boundedContext.id);
                    }

                    pbcElement.commands.push(element);
                });

                // right sides
                convertValue.events.forEach(function(element){
                    element.visibility = 'private'
                    me.setElementName(element)

                    if(element.aggregate && element.aggregate.id){
                        element.aggregate = convertValue.aggregates.find(aggregate => aggregate.id == element.aggregate.id);
                    }
                    if(element.boundedContext && element.boundedContext.id){
                        element.boundedContext = convertValue.boundedContextes.find(boundedContext => boundedContext.id == element.boundedContext.id);
                    }

                    pbcElement.events.push(element);
                });

                convertValue.relations.forEach(function(element){
                    element.visibility = 'private'
                    pbcElement.relations.push(element);
                });

                return pbcElement;
            },
            generatePBCByOpenAPI(convertValue, pbcElement, openAPIObj){
                var me = this
                const readComponent = me.getComponentByName('view-definition');
                const commandComponent = me.getComponentByName('command-definition');
                const eventComponent = me.getComponentByName('domain-event-definition');
                // const aggregateComponent = me.getComponentByName('aggregate-definition');

                if(!pbcElement){
                    const pbcComponent = me.getComponentByName('packaged-business-capabilities');
                    pbcElement = pbcComponent.computed.createNew(null, me.canvas.uuid(), 500, 500, 500, 500);
                }

                // set info
                pbcElement.name = convertValue.info.title ? convertValue.info.title : pbcElement.name;
                pbcElement.description = convertValue.info.description ? convertValue.info.description : pbcElement.name;
                pbcElement.modelValue.openAPI = openAPIObj.path;

                // Agg
                // Object.keys(openAPIObj.schemas).forEach(function (name) {
                //     let element = aggregateComponent.computed.createNew(null, me.canvas.uuid(), 100, 100, 100, 100);
                //
                //     element.visibility = 'private'
                //     element.name = name
                //     element.aggregateRoot.fieldDescriptors = me.convertAttrByProperties(obj.schemas[name]);
                //
                //     pbcElement.aggregates.push(element);
                // })

                convertValue.read.forEach(function(obj){
                    let element = readComponent.computed.createNew(null, me.canvas.uuid() ,100, 100, 100, 100);

                    element.visibility = 'private'
                    element.name = obj.summary ? obj.summary : obj.description; // temp code get 'obj.description'

                    element.dataProjection = 'query-for-aggregate'
                    element.queryParameters = me.convertAttrByParameters(obj.parameters);
                    element.queryOption.apiPath = obj._path
                    element.queryOption.useDefaultUri = false
                    if(obj.responses){
                        element.aggregate = me.convertAggregateByResponses(obj.responses, convertValue.schemas, pbcElement.aggregates)
                    }

                    pbcElement.views.push(element);
                });

                convertValue.command.forEach(function(obj){
                    let element = commandComponent.computed.createNew(null, me.canvas.uuid(), 100, 100, 100, 100);

                    element.visibility = 'private'
                    element.name = obj.summary ? obj.summary : obj.description; // temp code get 'obj.description'

                    if(obj.requestBody){
                        element.isRestRepository = false
                        element.controllerInfo.apiPath = obj._path
                        element.controllerInfo.method = obj._method.toUpperCase()
                        if( obj.requestBody.content['application/json'] ){
                            element.fieldDescriptors = me.convertAttrByProperties(obj.requestBody.content['application/json'].schema);
                        } else if(obj.requestBody.content['multipart/form-data'] ){
                            element.fieldDescriptors =  me.convertAttrByProperties(obj.requestBody.content['multipart/form-data'].schema)
                        }
                    } else {
                        element.isRestRepository = true
                        element.restRepositoryInfo.method = obj._method.toUpperCase()
                    }
                    if(obj.responses){
                        element.aggregate = me.convertAggregateByResponses(obj.responses, convertValue.schemas, pbcElement.aggregates)
                    }

                    pbcElement.commands.push(element);
                });

                convertValue.events.forEach(function(obj){
                    let element = eventComponent.computed.createNew(null, me.canvas.uuid(), 100, 100, 100, 100);
                
                    element.visibility = 'private'
                    element.name = obj.summary ? obj.summary : obj.description; // temp code get 'obj.description'
                
                    pbcElement.events.push(element);
                });


                return pbcElement;
            },
            convertPBC(convertValue, pbcElement, openAPIObj){
                var me = this
                const readComponent = me.getComponentByName('view-definition');
                const commandComponent = me.getComponentByName('command-definition');
                const eventComponent = me.getComponentByName('domain-event-definition');
                // const aggregateComponent = me.getComponentByName('aggregate-definition');

                if(!pbcElement){
                    const pbcComponent = me.getComponentByName('packaged-business-capabilities');
                    pbcElement = pbcComponent.computed.createNew(null, me.canvas.uuid(), 500, 500, 500, 500);
                }

                // set info
                pbcElement.name = convertValue.info.title ? convertValue.info.title : pbcElement.name;
                pbcElement.description = convertValue.info.description ? convertValue.info.description : pbcElement.name;
                pbcElement.modelValue.openAPI = openAPIObj.path;

                // Agg
                // Object.keys(openAPIObj.schemas).forEach(function (name) {
                //     let element = aggregateComponent.computed.createNew(null, me.canvas.uuid(), 100, 100, 100, 100);
                //
                //     element.visibility = 'private'
                //     element.name = name
                //     element.aggregateRoot.fieldDescriptors = me.convertAttrByProperties(obj.schemas[name]);
                //
                //     pbcElement.aggregates.push(element);
                // })

                convertValue.read.forEach(function(obj){
                    let element = readComponent.computed.createNew(null, me.canvas.uuid() ,100, 100, 100, 100);

                    element.visibility = 'private'
                    element.name = obj.summary ? obj.summary : obj.description; // temp code get 'obj.description'

                    element.dataProjection = 'query-for-aggregate'
                    element.queryParameters = me.convertAttrByParameters(obj.parameters);
                    element.queryOption.apiPath = obj._path
                    element.queryOption.useDefaultUri = false
                    if(obj.responses){
                        element.aggregate = me.convertAggregateByResponses(obj.responses, convertValue.schemas, pbcElement.aggregates)
                    }

                    pbcElement.views.push(element);
                });

                convertValue.command.forEach(function(obj){
                    let element = commandComponent.computed.createNew(null, me.canvas.uuid(), 100, 100, 100, 100);

                    element.visibility = 'private'
                    element.name = obj.summary ? obj.summary : obj.description; // temp code get 'obj.description'

                    if(obj.requestBody){
                        element.isRestRepository = false
                        element.controllerInfo.apiPath = obj._path
                        element.controllerInfo.method = obj._method.toUpperCase()
                        if( obj.requestBody.content['application/json'] ){
                            element.fieldDescriptors = me.convertAttrByProperties(obj.requestBody.content['application/json'].schema);
                        } else if(obj.requestBody.content['multipart/form-data'] ){
                            element.fieldDescriptors =  me.convertAttrByProperties(obj.requestBody.content['multipart/form-data'].schema)
                        }
                    } else {
                        element.isRestRepository = true
                        element.restRepositoryInfo.method = obj._method.toUpperCase()
                    }
                    if(obj.responses){
                        element.aggregate = me.convertAggregateByResponses(obj.responses, convertValue.schemas, pbcElement.aggregates)
                    }

                    pbcElement.commands.push(element);
                });

                // convertValue.event.forEach(function(obj){
                //     let element = eventComponent.computed.createNew(null, me.canvas.uuid(), 100, 100, 100, 100);
                
                //     element.visibility = 'private'
                //     element.name = obj.summary ? obj.summary : obj.description; // temp code get 'obj.description'
                
                //     pbcElement.events.push(element);
                // });


                return pbcElement;
            },
            convertAggregateByResponses(responses, schemas, aggregates){
                /*
                * return aggregate and append aggregate Element in PBC.
                * */
                var me = this
                try {
                    let element = {}
                    const aggregateComponent = me.getComponentByName('aggregate-definition');
                    let code  = Object.keys(responses).find(x=> x.startsWith('20')); // 2xx코드

                    if( code && responses[code].content && responses[code].content['application/json'] && responses[code].content['application/json'].schema) {
                        let schemaName = ''

                        if(responses[code].content['application/json'].schema.$ref ) {
                            schemaName = responses[code].content['application/json'].schema.$ref.split('/').pop()

                        } else if(responses[code].content['application/json'].schema.type == 'array'){
                            schemaName = responses[code].content['application/json'].schema.items.$ref.split('/').pop()
                        } else if(responses[code].content['application/json'].schema) {
                            schemaName = Object.keys(responses[code].content['application/json'].schema)[0]
                        }

                        if(aggregates.find(aggregate =>aggregate.name == schemaName)){
                            element = aggregates.find(aggregate =>aggregate.name == schemaName)
                        } else {
                            element = aggregateComponent.computed.createNew(null, me.canvas.uuid(), 100, 100, 100, 100);
                            element.visibility = 'private'
                            element.name = schemaName
                            element.aggregateRoot.fieldDescriptors = me.convertAttrByProperties(schemas[schemaName]);
                            aggregates.push(element);
                        }
                    }
                    return element;
                } catch (e) {
                    console.log(`Error]Convert AggregateByResponses`, e)
                    return {};
                }
            },
            convertAttrByParameters(parameters){
                try {
                    if(!parameters) return [];
                    let attr = [];

                    parameters.forEach(function (parameter) {
                        let  obj = {
                            className: 'Object', // default type: Object.
                            name: parameter.name,
                            nameCamelCase: changeCase.camelCase(parameter.name),
                            namePascalCase: changeCase.pascalCase(parameter.name),
                            _type:"org.uengine.model.FieldDescriptor"
                        }

                        if(parameter.schema && parameter.schema.type) {
                            obj.className = changeCase.pascalCase(parameter.schema.type)
                        }

                        if( parameter.required ){
                            obj.isKey = true;
                        }
                        attr.push(obj);
                    })

                    return attr;
                } catch (e) {
                    console.log(`Error]Convert AttrByParameters:`, e)
                    return [];
                }
            },
            convertAttrByProperties(propertyObj){
                try{
                    if(!propertyObj) return [];
                    let attr = [];
                    let properties = propertyObj.properties

                    Object.keys(properties).forEach(function(name){
                        let obj = {
                            className: 'Object',
                            name: name,
                            nameCamelCase: changeCase.camelCase(name),
                            namePascalCase: changeCase.pascalCase(name),
                            _type:"org.uengine.model.FieldDescriptor"
                        }

                        if( properties[name] && properties[name].type ) {
                            obj.className = changeCase.pascalCase(properties[name].type)
                        }

                        attr.push(obj)
                    });

                    return attr;
                } catch (e) {
                    console.log(`Error]Convert AttrByProperties:`, e)
                    return []
                }
            },
            recursiveProperties(properties, schemas){
                var me = this
                try{
                    if(!properties) return [];
                    let attr = [];

                    Object.keys(properties).forEach(function(name){
                        if(properties[name].$ref){
                            let propertiesBySchema = properties[name].$ref.split('/').pop()
                            return me.recursiveProperties(schemas[propertiesBySchema].properties, schemas)
                        } else {
                            let obj = {
                                className: changeCase.pascalCase(properties[name].type),
                                name: name,
                                nameCamelCase: changeCase.camelCase(name),
                                namePascalCase: changeCase.pascalCase(name),
                                _type:"org.uengine.model.FieldDescriptor"
                            }
                            attr.push(obj)
                        }
                    });
                    return attr;
                } catch (e) {
                    console.log(`Error]Recursive Properties: `, e)
                    return [];
                }
            },
            getComponentByName: function (name) {
                var componentByName;
                $.each(window.Vue._components, function (i, component) {
                    if (component.name == name) {
                        componentByName = component;
                    }
                });
                return componentByName;
            },
        }

    }
</script>


<style scoped lang="scss" rel="stylesheet/scss">

</style>
