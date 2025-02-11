
const changeCase = require('change-case');
const pluralize = require('pluralize');
const isAttached = require('../../../utils/isAttached')

class CodeGeneratorCore {

    constructor(options){
        if(!options) options={}
        
        this.projectName = options.projectName;
        this.gitURLforModel = options.gitURLforModel;
        this.defaultTemplate = options.defaultTemplate
        this.canvas = options.canvas

    }

    convertModelForCodeGen(flatModel, options) {
        var me = this
        let projectName = options && options.projectName ? options.projectName : me.projectName
        let filteredProjectName = me.filterProjectName(projectName)

        var rootModel = {
            _type: "org.uengine.modeling.model.Model",
            boundedContexts: [],
            projectName: filteredProjectName,
            URL: window.location.hash,
            gitURL: me.gitURLforModel,
            actors: [],
            toppings: [],
        }

        var modelForElements = {
            BoundedContext: [],
            AggregateRoot: [],
            Aggregate: [],
            Entity: [],
            ValueObject: [],
            Enumeration: [],
            Exception: [],
            ModelElements: [],
            Policy: [],
            Event: [],
            Command: [],
            View: [],
            Relation: [],
            RelationEventInfo: [],
            RelationCommandInfo: [],
            RelationViewInfo: [],
            ViewEventInfo: [],
            RelationExampleEventInfo: [],
            Rules: [],
            Actor: [],
            UI: [],
            //OutgoingCommandInfo: [],//TODO :   must be removed
        };

        // setting modelElements
        var modelElements = {
            aggregates: [],
            boundedContextes: []
        }
        var selectedTemplate = []
        let elementByIds = {};
        let relatedElementByIds = {};

        let elementValues = Object.values(JSON.parse(JSON.stringify(flatModel.elements)));
        let relationValues = Object.values(JSON.parse(JSON.stringify(flatModel.relations)));
        if(me.canvas) elementValues = me.canvas.overrideElements(elementValues);

        elementValues.forEach(function (item) {
            if(!me.canvas.validateElementFormat(item)) return;
            if (item) {
                // 이름 없는 객체는 생성 안함
                if (!item.name || item.name.length === 0) return;

                elementByIds[item.elementView.id] = item;

                if (item.name) {
                    me.convertNameForElement(item);
                }
                if (item.fieldDescriptors) {
                    item.fieldDescriptors.forEach(function (val) {
                        me.convertNameForElement(val);
                    })
                }
                if (item._type == 'org.uengine.modeling.model.BoundedContext') {
                    if (item.preferredPlatform) {
                        if(!item.preferredPlatform.includes("template-")){
                            item.preferredPlatform = "template-" + item.preferredPlatform
                        }
                        selectedTemplate.push(item.preferredPlatform)
                    } else {
                        item.preferredPlatform = me.defaultTemplate
                    }
                    modelForElements.BoundedContext.push(item)
                } else if (item._type == 'org.uengine.modeling.model.Aggregate') {
                    modelForElements.Aggregate.push(item)
                    modelForElements.AggregateRoot.push(item.aggregateRoot);
                } else if (item._type == 'org.uengine.modeling.model.Event') {
                    modelForElements.Event.push(item)
                } else if (item._type == 'org.uengine.modeling.model.Policy') {
                    modelForElements.Policy.push(item)
                    item.relationEventInfo = null;
                } else if (item._type == 'org.uengine.modeling.model.Command') {
                    modelForElements.Command.push(item)
                } else if (item._type == 'org.uengine.modeling.model.Actor') {
                    modelForElements.Actor.push(item)
                } else if (item._type == 'org.uengine.modeling.model.View') {
                    modelForElements.View.push(item)
                } else if (item._type == 'org.uengine.modeling.model.UI') {
                    modelForElements.UI.push(item)
                }
            }
        });

        // load boundedContexts
        var boundedContextByIds = {};
        modelForElements.BoundedContext.forEach(bc => {

            Object.values(elementValues).forEach((element, index) => {
                if(!me.canvas.validateElementFormat(element)) return;
                if (element) {
                    if( element._type.endsWith("BoundedContext") ) return;

                    // let attachedBcId = element.boundedContext ? (element.boundedContext.elementView ? element.boundedContext.elementView.id : element.boundedContext.id):null
                    // if( element.mirrorElement && (attachedBcId && attachedBcId == bc.elementView.id) ){
                    //     element.preferredPlatform = bc.preferredPlatform && bc.preferredPlatform.includes("http") ? bc.preferredPlatform : me.defaultTemplate
                    // } else if ( (attachedBcId && attachedBcId == bc.elementView.id) && isAttached(bc, element) ){
                    //     element.boundedContext = bc;
                    //     element.preferredPlatform = bc.preferredPlatform && bc.preferredPlatform.includes("http") ? bc.preferredPlatform : me.defaultTemplate
                    // }

                    let getBcId = element.boundedContext ? element.boundedContext.id :null
                    if (getBcId && element.mirrorElement && attachedBcId === bc.elementView.id) {
                        element.preferredPlatform = bc.preferredPlatform && bc.preferredPlatform.includes("http") ? bc.preferredPlatform : me.defaultTemplate
                    } else if (isAttached(bc, element) && !element.isPBCModel) {
                        element.boundedContext = bc;
                        element.preferredPlatform = bc.preferredPlatform && bc.preferredPlatform.includes("http") ? bc.preferredPlatform : me.defaultTemplate
                    }
                }
            })

            boundedContextByIds[bc.elementView.id] = bc
            rootModel.boundedContexts.push(bc)
        });

        var aggregateByIds = {};
        modelForElements.Aggregate.forEach(item => {

            aggregateByIds[item.elementView.id] = item

            if (!item.mirrorElement && item.boundedContext.aggregates && item.boundedContext.aggregates.length > 0){
                let idx = item.boundedContext.aggregates.findIndex(obj => obj.id == item.elementView.id)
                if( idx > -1 ){
                    item.boundedContext.aggregates[idx] = item
                }
            }

            if (item.aggregateRoot && item.aggregateRoot.entities && item.aggregateRoot.entities.elements) {
                var entities = Object.values(item.aggregateRoot.entities.elements)
                entities.forEach(entity => {
                    if (entity) {
                        if (entity._type != 'ClassGroup') {
                            entity.preferredPlatform = item.preferredPlatform
                            entity.boundedContext = item.boundedContext
                            entity.outgoingClassRefs = []
                            entity.incomingClassRefs = []

                            if(Object.values(item.aggregateRoot.entities.relations).length > 0) {
                                Object.values(item.aggregateRoot.entities.relations).forEach(function(rel) {
                                    if(rel) {
                                        if(rel.sourceElement && rel.sourceElement.elementView.id == entity.id) {
                                            var relValue = {
                                                'relationId': rel.relationView.id,
                                                'value': rel.targetElement,
                                                'relationType': rel.relationType ? rel.relationType.split(".").pop() : null
                                            }
                                            entity.outgoingClassRefs.push(relValue)
                                        }
                                        if(rel.targetElement && rel.targetElement.elementView.id == entity.id) {
                                            var relValue = {
                                                'relationId': rel.relationView.id,
                                                'value': rel.sourceElement,
                                                'relationType': rel.relationType
                                            }
                                            entity.incomingClassRefs.push(relValue)
                                        }
                                    }
                                })
                            }

                            if (entity._type.includes('vo.')) {
                                var res = false
                                modelForElements.ValueObject.forEach(function (el) {
                                    if (el.name == entity.name && el.boundedContext && entity.boundedContext && el.boundedContext.name == entity.boundedContext.name) {
                                        res = true
                                    }
                                })
                                if (!res) {
                                    modelForElements.ValueObject.push(entity)
                                }
                            } else if (entity._type.includes('enum')) {
                                var res = false
                                modelForElements.Enumeration.forEach(function (el) {
                                    if (el.name == entity.name && el.boundedContext.name == entity.boundedContext.name) {
                                        res = true
                                    }
                                })
                                if (!res) {
                                    modelForElements.Enumeration.push(entity)
                                }
                            } else if (entity._type.includes('Exception')) {
                                var res = false
                                modelForElements.Exception.forEach(function (el) {
                                    if (el.name == entity.name && el.boundedContext.name == entity.boundedContext.name) {
                                        res = true
                                    }
                                })
                                if (!res) {
                                    modelForElements.Exception.push(entity)
                                }
                            } else {
                                var res = entity.isAggregateRoot ? entity.isAggregateRoot : false
                                modelForElements.Entity.forEach(function (el) {
                                    if (el.name == entity.name && el.boundedContext.name == entity.boundedContext.name) {
                                        res = true
                                    }
                                })
                                if (!res) {
                                    modelForElements.Entity.push(entity)
                                }
                            }
                        }
                    }
                })

                if(item.aggregateRoot.entities.relations){
                    item.aggregateRoot.entities.relations = Object.values(item.aggregateRoot.entities.relations)
                }else{
                    item.aggregateRoot.entities.relations = {}
                }
                // console.log(modelForElements)
            }
        })
        //////// event.aggregate 가 값참조로 되어있는 관계로 본래 aggregate 에서 연결하는 코드 작성 //////
        var eventByIds = {};

        var attach = item => {

            /* connect aggregate*/
            if( !item.mirrorElement ){
                modelForElements.Aggregate.forEach(aggregateElement => {
                    if (aggregateElement) {
                        if (isAttached(aggregateElement, item) && !aggregateElement.mirrorElement) {
                            item.aggregate = aggregateElement
                        }
                    }
                })
            }

            // if (item.boundedContext && item.boundedContext.id && !item.mirrorElement) {
            //     item.boundedContext = boundedContextByIds[item.boundedContext.id]
            // }
            eventByIds[item.elementView.id] = item
        };
        modelForElements.Event.forEach(attach)

        var policyByIds = {};
        modelForElements.Policy.forEach(item => {

            modelForElements.Aggregate.forEach(aggregateElement => {
                if (aggregateElement) {
                    if ( isAttached(aggregateElement, item) && !aggregateElement.mirrorElement) {
                        if (!item.aggregateList) item.aggregateList = []
                        item.aggregateList.push(aggregateElement)
                    }
                }
            });

            if (item.boundedContext && item.boundedContext.policies) item.boundedContext.policies.push(item)

            policyByIds[item.elementView.id] = item
        })

        var commandByIds = {};
        modelForElements.Command.forEach(item => {
            /* connect aggregate*/
            if( !item.mirrorElement ){
                modelForElements.Aggregate.forEach(aggregateElement => {
                    if (aggregateElement) {
                        
                        // console.log(item.name, isAttached(aggregateElement, item))
                        if ( isAttached(aggregateElement, item) && !aggregateElement.mirrorElement) {
                            
                            item.aggregate = aggregateElement
                        }
                    }
                });
            }

            commandByIds[item.elementView.id] = item
        })

        var actorByIds = {};
        modelForElements.Actor.forEach(item => {
            /* connect command*/
            modelForElements.Command.forEach(commandElement => {
                if (commandElement) {
                    if (isAttached(commandElement, item) && !commandElement.mirrorElement) {
                        commandElement.actorName = item.name
                    }
                }
            });

            actorByIds[item.elementView.id] = item
        })

        modelForElements.Aggregate.forEach(item => {
            if (item.aggregateRules && !item.mirrorElement) {
                for (var i = 0; i < item.aggregateRules.length; i++) {
                    var rule = {}

                    if (!item.aggregateRules[i].givenValue || !item.aggregateRules[i].whenValue || !item.aggregateRules[i].thenValue)
                        continue;

                    if (item.aggregateRules[i].givenValue.elementView._type == "org.uengine.modeling.model.Event") {
                        rule.givenValue = eventByIds[item.aggregateRules[i].givenValue.elementView.id];
                        rule.whenValue = policyByIds[item.aggregateRules[i].whenValue.elementView.id];
                    }
                    rule.ruleName = item.aggregateRules[i].ruleName.replace(/(\s*)/g, "")
                    // rule.thenValue = eventByIds[item.aggregateRules[i].thenValue.elementView.id];
                    rule.thenValue = item.aggregateRules[i].thenValue
                    // rule.aggregate = eventByIds[item.aggregateRules[i].thenValue.elementView.id].aggregate;
                    rule.aggregate = item.aggregateRules[i].thenValue[0].aggregate;
                    // rule.boundedContext = eventByIds[item.aggregateRules[i].thenValue.elementView.id].boundedContext;
                    // rule.preferredPlatform = eventByIds[item.aggregateRules[i].thenValue.elementView.id].boundedContext.preferredPlatform;
                    rule.boundedContext = item.aggregateRules[i].thenValue[0].boundedContext;
                    rule.preferredPlatform = item.aggregateRules[i].thenValue[0].boundedContext.preferredPlatform;
                    rule.attributes = item.aggregateRules[i].attributes
                    modelForElements.Rules.push(rule);
                }
            }
        });

        // re-link events to it's parent aggregates
        modelForElements.Event.forEach(item => {
            if (item.aggregate && (item.aggregate.elementView || item.aggregate.id)) {
                var aggregate = aggregateByIds[item.aggregate.elementView ? item.aggregate.elementView.id : item.aggregate.id] // 이 부분은 item.aggregate 로 바뀌어야 함
                if (aggregate) {
                    if (!aggregate.events) aggregate.events = [];
                    aggregate.events.push(item);
                }
            }
        });

        // 객체참조구조가 완전히 이상함.. 이게 뭡니까 대체????
        modelForElements.Command.forEach(item => {
            if (item.aggregate && (item.aggregate.elementView || item.aggregate.id)) {
                var aggregate = aggregateByIds[item.aggregate.elementView ? item.aggregate.elementView.id : item.aggregate.id] // 이 부분은 item.aggregate 로 바뀌어야 함
                if (aggregate) {
                    if (!aggregate.commands) aggregate.commands = [];
                    aggregate.commands.push(item);
                }
            }
        });

        modelForElements.Actor.forEach(item => {
            if (item.aggregate && (item.aggregate.elementView || item.aggregate.id)) {
                var aggregate = aggregateByIds[item.aggregate.elementView ? item.aggregate.elementView.id : item.aggregate.id] // 이 부분은 item.aggregate 로 바뀌어야 함
                // var aggregate = aggregateByIds[item.aggregate.elementView.id]

                if (aggregate) {
                    if (!aggregate.actors) aggregate.actors = [];
                    aggregate.actors.push(item);
                }
            }
        });

        rootModel.actors.push(modelForElements.Actor)

        //빈 값 전처리후에 진행.
        modelForElements.View.forEach(function (item, viewIndex) {
            item.createRules.forEach(function (createRule, createIndex) {
                if (createRule.when == null ? true : (Object.keys(createRule.when).length == 0 ? true : false)) {
                    createRule.when = null
                } else {
                    createRule.fieldMapping.forEach(function (item, fieldMappingIndex) {

                        if (!item.operator) {
                            item.operator = '='
                        }
                        if (item.eventField == null ? true : (Object.keys(item.eventField).length == 0 ? true : false)
                        || item.viewField == null ? true : (Object.keys(item.viewField).length == 0 ? true : false)) {
                            item.eventField = null
                            item.viewField = null
                        }

                    })
                }
            })

            item.updateRules.forEach(function (updateRule, updateIndex) {
                if (updateRule.when == null ? true : (Object.keys(updateRule.when).length == 0 ? true : false)) {
                    updateRule.when = null
                } else {
                    updateRule.fieldMapping.forEach(function (item, fieldMappingIndex) {
                        if (!item.operator) {
                            item.operator = '='
                        }

                        if (item.eventField == null ? true : (Object.keys(item.eventField).length == 0 ? true : false)
                        || item.viewField == null ? true : (Object.keys(item.viewField).length == 0 ? true : false)) {
                            item.eventField = null
                            item.viewField = null
                        }
                    })
                    updateRule.where.forEach(function (item, whereIndex) {
                        if (item.eventField == null ? true : (Object.keys(item.eventField).length == 0 ? true : false)
                        || item.viewField == null ? true : (Object.keys(item.viewField).length == 0 ? true : false)) {
                            item.eventField = null
                            item.viewField = null
                        }
                    })
                }
            })

            item.deleteRules.forEach(function (deleteRule, deleteIndex) {
                if (deleteRule.when == null ? true : (Object.keys(deleteRule.when).length == 0 ? true : false)) {
                    deleteRule.when = null
                } else {
                    deleteRule.where.forEach(function (item, whereIndex) {
                        if (item.eventField == null ? true : (Object.keys(item.eventField).length == 0 ? true : false)
                        || item.viewField == null ? true : (Object.keys(item.viewField).length == 0 ? true : false)) {
                            item.eventField = null
                            item.viewField = null
                        }
                    })
                }
            })
        })


        var viewByIds = {};
        modelForElements.View.forEach(function (item, viewIndex) {
            if (item.dataProjection == 'cqrs') {
                if (item.createRules) {
                    for (var i = 0; i < item.createRules.length; i++) {
                        if (item.createRules[i].fieldMapping) {
                            for (var j = 0; j < item.createRules[i].fieldMapping.length; j++) {
                                if (!item.createRules[i].fieldMapping[j].eventField || !item.createRules[i].fieldMapping[j].viewField)
                                    continue
                                me.setNames(item.createRules[i].fieldMapping[j].eventField)
                                me.setNames(item.createRules[i].fieldMapping[j].viewField)
                            }
                        }
                    }
                }
                if (item.deleteRules) {
                    for (var i = 0; i < item.deleteRules.length; i++) {
                        if (item.deleteRules[i].fieldMapping) {
                            for (var j = 0; j < item.deleteRules[i].fieldMapping.length; j++) {
                                if (!item.deleteRules[i].fieldMapping[j].eventField || !item.deleteRules[i].fieldMapping[j].viewField)
                                    continue
                                me.setNames(item.deleteRules[i].fieldMapping[j].eventField)
                                me.setNames(item.deleteRules[i].fieldMapping[j].viewField)
                            }
                        }
                    }
                }
                if (item.updateRules) {
                    //FOCUS: indexed for loop 은 사용금지
                    for (var i = 0; i < item.updateRules.length; i++) {
                        if (item.updateRules[i].where){
                            item.updateRules[i].where.forEach(where => {
                                me.setNames(where.eventField);
                            })

                        }

                        if (item.updateRules[i].fieldMapping) {
                            for (var j = 0; j < item.updateRules[i].fieldMapping.length; j++) {
                                if (!item.updateRules[i].fieldMapping[j].eventField || !item.updateRules[i].fieldMapping[j].viewField)
                                    continue
                                me.setNames(item.updateRules[i].fieldMapping[j].eventField);
                                me.setNames(item.updateRules[i].fieldMapping[j].viewField);
                            }
                        }
                    }
                }
            }

            if (modelForElements.Aggregate.length > 0) {
                modelForElements.Aggregate.forEach(aggregateElement => {
                    if (aggregateElement) {
                        if (isAttached(aggregateElement, item) && !aggregateElement.mirrorElement) {
                            item.aggregate = aggregateElement
                        }
                    }
                })
            }

            if (item.createRules) {
                item.createRules.forEach(function (createRule, createIndex) {
                    if (!createRule.when) {
                        modelForElements.View[viewIndex].createRules.splice(createIndex, 1)
                    } else {
                        if (eventByIds[createRule.when.elementView.id]) {
                            createRule.when = _.cloneDeep(eventByIds[createRule.when.elementView.id])
                            createRule.when.preferredPlatform = item.preferredPlatform
                            createRule.when.boundedContext = item.boundedContext

                            createRule.fieldMapping.forEach(function (item, fieldMappingIndex) {
                                if (!item.eventField || !item.viewField) {
                                    createRule.fieldMapping.splice(fieldMappingIndex, 1)
                                }
                            })

                            createRule._index = createIndex + 1

                            if (modelForElements.ViewEventInfo.indexOf(createRule.when) == -1) {
                                modelForElements.ViewEventInfo.push(createRule.when)
                            }
                        }

                    }
                })
            }

            if (item.updateRules) {
                item.updateRules.forEach(function (updateRule, updateIndex) {
                    if (!updateRule.when) {
                        modelForElements.View[viewIndex].updateRules.splice(updateIndex, 1)
                    } else {
                        if (eventByIds[updateRule.when.elementView.id]) {
                            updateRule.when = _.cloneDeep(eventByIds[updateRule.when.elementView.id])
                            updateRule.when.preferredPlatform = item.preferredPlatform
                            updateRule.when.boundedContext = item.boundedContext

                            updateRule.fieldMapping.forEach(function (item, fieldMappingIndex) {
                                if (!item.eventField || !item.viewField) {
                                    updateRule.fieldMapping.splice(fieldMappingIndex, 1)
                                }
                            })

                            updateRule.where.forEach(function (item, whereIndex) {
                                if (!item.eventField || !item.viewField) {
                                    updateRule.where.splice(whereIndex, 1)
                                }
                            })

                            updateRule._index = updateIndex + 1

                            if (modelForElements.ViewEventInfo.indexOf(updateRule.when) == -1) {
                                modelForElements.ViewEventInfo.push(updateRule.when)
                            }
                        }

                    }
                })
            }


            if (item.deleteRules) {
                item.deleteRules.forEach(function (deleteRule, deleteIndex) {
                    // createRule.when = _.cloneDeep(eventByIds[createRule.when.elementView.id])
                    // createRule.when.boundedContext = item.boundedContext
                    if (!deleteRule.when) {
                        modelForElements.View[viewIndex].deleteRules.splice(deleteIndex, 1)
                    } else {

                        if (eventByIds[deleteRule.when.elementView.id]) {
                            deleteRule.when = _.cloneDeep(eventByIds[deleteRule.when.elementView.id])
                            deleteRule.when.preferredPlatform = item.preferredPlatform
                            deleteRule.when.boundedContext = item.boundedContext

                            deleteRule.where.forEach(function (item, whereIndex) {
                                if (!item.eventField || !item.viewField) {
                                    deleteRule.where.splice(whereIndex, 1)
                                }
                            })

                            deleteRule._index = deleteIndex + 1

                            if (modelForElements.ViewEventInfo.indexOf(deleteRule.when) == -1) {
                                modelForElements.ViewEventInfo.push(deleteRule.when)
                            }
                        }

                    }
                })
            }

            viewByIds[item.elementView.id] = item
            if (item.boundedContext && item.boundedContext.viewes) {  //TODO: deprecate typo viewes
                item.boundedContext.viewes.push(item)
            }
            if (item.boundedContext) {
                if(!item.boundedContext.views)
                    item.boundedContext.views = [];

                item.boundedContext.views.push(item)

                if(!item.boundedContext.readModels)
                    item.boundedContext.readModels = [];

                item.boundedContext.readModels.push(item)

            }
        })

        relationValues.forEach(item => {
            if(!me.canvas.validateRelationFormat(item)) return;
            if (item != null) {
                if (item._type == 'org.uengine.modeling.model.Line') {
                    return
                }

                var sourceElement = elementByIds[item.sourceElement.id ? item.sourceElement.id : item.sourceElement.elementView.id];
                var targetElement = elementByIds[item.targetElement.id ? item.targetElement.id : item.targetElement.elementView.id];

                // element in PBC
                if(!sourceElement && item.sourceElement.pbcId) sourceElement = item.sourceElement
                if(!targetElement && item.targetElement.pbcId) targetElement = item.targetElement
                
                if(sourceElement && targetElement){
                    var boundedContext = sourceElement.boundedContext && sourceElement.boundedContext.id ? elementByIds[sourceElement.boundedContext.id] : sourceElement.boundedContext
                    var targetBoundedContext = targetElement.boundedContext && targetElement.boundedContext.id ? elementByIds[targetElement.boundedContext.id] : targetElement.boundedContext

                    // outgoing preferredPlatform
                    let relationObj = {
                        value: item,
                        source: sourceElement,
                        target: targetElement,
                        boundedContext: boundedContext,
                        targetBoundedContext: targetBoundedContext,
                        preferredPlatform: boundedContext ? boundedContext.preferredPlatform : null
                    }
                    modelForElements.Relation.push(relationObj);

                    if( boundedContext
                        && targetBoundedContext
                        && (boundedContext.preferredPlatform != targetBoundedContext.preferredPlatform) ){
                        relationObj.preferredPlatform = targetBoundedContext.preferredPlatform
                        modelForElements.Relation.push(relationObj);
                    }
                }



                if (item.sourceElement._type == "org.uengine.modeling.model.Event" &&
                    item.targetElement._type == "org.uengine.modeling.model.Policy") {
                    // var eventId = item.sourceElement.elementView.id
                    // var policyId = item.targetElement.elementView.id
                    let srcElement = eventByIds[item.sourceElement.id ? item.sourceElement.id : item.sourceElement.elementView.id];
                    let tarElement = policyByIds[item.targetElement.id ? item.targetElement.id : item.targetElement.elementView.id];
    
                    // element in PBC
                    if(!srcElement && item.sourceElement.pbcId) srcElement = item.sourceElement
                    if(!tarElement && item.targetElement.pbcId) tarElement = item.targetElement

                    if (srcElement && tarElement) {
                        if (!tarElement.relationEventInfo) tarElement.relationEventInfo = [];
                        if (!srcElement.outgoingPolicyRefs) srcElement.outgoingPolicyRefs = [];
                        if (!tarElement.incomingEventRefs) tarElement.incomingEventRefs = [];
                        
                        srcElement.outgoingPolicyRefs.push({
                            name: item && item.name ? item.name : '',
                            value: tarElement
                        });

                        tarElement.incomingEventRefs.push({
                            name: item && item.name ? item.name : '',
                            value: srcElement
                        });

                        tarElement.relationEventInfo.push(relationEventInfo);

                        let relationEventInfo = {
                            eventValue: srcElement,
                            relationId: item.relationView.id,
                            boundedContext: tarElement.boundedContext,
                            elementView: {
                                id: srcElement.id
                            }
                        }

                        // add preferredPlatform
                        let getPreferredPlatform = relationEventInfo.boundedContext ? relationEventInfo.boundedContext.preferredPlatform : tarElement.preferredPlatform
                        relationEventInfo.preferredPlatform = getPreferredPlatform

                        modelForElements.RelationEventInfo.push(relationEventInfo);
                    }
                } else if (item.sourceElement._type == "org.uengine.modeling.model.Policy" &&
                    item.targetElement._type == "org.uengine.modeling.model.Event") {
                    // var policyId = item.sourceElement.elementView.id
                    // var eventId = item.targetElement.elementView.id
                    let srcElement = policyByIds[item.sourceElement.id ? item.sourceElement.id : item.sourceElement.elementView.id];
                    let tarElement = eventByIds[item.targetElement.id ? item.targetElement.id : item.targetElement.elementView.id];
    
                    // element in PBC
                    if(!srcElement && item.sourceElement.pbcId) srcElement = item.sourceElement
                    if(!tarElement && item.targetElement.pbcId) tarElement = item.targetElement

                    if (srcElement && tarElement) {
                        if (!srcElement.relationExampleEventInfo) srcElement.relationExampleEventInfo = [];
                        if (!srcElement.outgoingEventRefs) srcElement.outgoingEventRefs = [];
                        if (!tarElement.incomingPolicyRefs) tarElement.incomingPolicyRefs = [];
                        
                        srcElement.outgoingEventRefs.push({
                            name: item && item.name ? item.name : '',
                            value: tarElement
                        });

                        tarElement.incomingPolicyRefs.push({
                            name: item && item.name ? item.name : '',
                            value: srcElement
                        });
                        // end of refs Setting
                        let relationExampleEventInfo = {
                            eventValue: tarElement,
                            relationId: item.relationView.id,
                            boundedContext: srcElement.boundedContext,
                        }
                        srcElement.relationExampleEventInfo.push(relationExampleEventInfo);

                        modelForElements.RelationExampleEventInfo.push(relationExampleEventInfo);
                    }
                } else if (item.sourceElement._type == "org.uengine.modeling.model.Command" &&
                    item.targetElement._type == "org.uengine.modeling.model.Event") {
                    // var commandId = item.sourceElement.elementView.id
                    // var eventId = item.targetElement.elementView.id
                    let srcElement = commandByIds[item.sourceElement.id ? item.sourceElement.id : item.sourceElement.elementView.id];
                    let tarElement = eventByIds[item.targetElement.id ? item.targetElement.id : item.targetElement.elementView.id];
    
                    // element in PBC
                    if(!srcElement && item.sourceElement.pbcId) srcElement = item.sourceElement
                    if(!tarElement && item.targetElement.pbcId) tarElement = item.targetElement

                    if (srcElement && tarElement) {
                        let triggerByCommand = {
                            eventValue: tarElement,
                            relationsId: item.relationView.id,
                            boundedContext: srcElement.boundedContext,

                            elementView: {
                                id: tarElement.id
                            }
                        }

                        if(!srcElement.triggerByCommand) srcElement.triggerByCommand = []
                        if(!tarElement.incomingCommandRefs) tarElement.incomingCommandRefs = [];
                        if(tarElement.triggerShouldExist) {
                            if (!tarElement.triggerShouldExist && srcElement.isRestRepository) {
                                tarElement.triggerShouldExist = true;
                            }
                        } else {
                            if (srcElement.isRestRepository) {
                                tarElement.triggerShouldExist = true;
                            } else {
                                tarElement.triggerShouldExist = false;
                            }
                        }

                        srcElement.triggerByCommand.push(triggerByCommand);
                        tarElement.incomingCommandRefs.push( {
                            name: item && item.name ? item.name : '',
                            value: srcElement
                        });
                    }
                } else if (item.sourceElement._type == "org.uengine.modeling.model.Event" &&
                    item.targetElement._type == "org.uengine.modeling.model.Command") {
                    let srcElement = eventByIds[item.sourceElement.id ? item.sourceElement.id : item.sourceElement.elementView.id];
                    let tarElement = commandByIds[item.targetElement.id ? item.targetElement.id : item.targetElement.elementView.id];
    
                    // element in PBC
                    if(!srcElement && item.sourceElement.pbcId) srcElement = item.sourceElement
                    if(!tarElement && item.targetElement.pbcId) tarElement = item.targetElement

                    if ( srcElement && tarElement ) {
                        if (!srcElement.outgoingCommandRefs) srcElement.outgoingCommandRefs = [];

                        let relationCommandInfo = {
                            commandValue: tarElement,
                            relationId: item.relationView.id,
                            boundedContext: srcElement.boundedContext,
                            elementView: {
                                id: tarElement.id
                            }
                        }

                        let getPreferredPlatform = relationCommandInfo.boundedContext ? relationCommandInfo.boundedContext.preferredPlatform : srcElement.preferredPlatform
                        relationCommandInfo.preferredPlatform = getPreferredPlatform

                        srcElement.relationCommandInfo = relationCommandInfo
                        srcElement.outgoingCommandRefs.push({
                            name: item && item.name ? item.name : '',
                            value: tarElement
                        });

                        modelForElements.RelationCommandInfo.push(relationCommandInfo);
                    }
                } else if (item.sourceElement._type == "org.uengine.modeling.model.Command" &&
                    item.targetElement._type == "org.uengine.modeling.model.View") {
                    let srcElement = commandByIds[item.sourceElement.id ? item.sourceElement.id : item.sourceElement.elementView.id];
                    let tarElement = viewByIds[item.targetElement.id ? item.targetElement.id : item.targetElement.elementView.id];
    
                    // element in PBC
                    if(!srcElement && item.sourceElement.pbcId) srcElement = item.sourceElement
                    if(!tarElement && item.targetElement.pbcId) tarElement = item.targetElement
    
                    if (srcElement && tarElement) {
                        let relationCommandInfo = {
                            commandValue: srcElement,
                            relationId: item.relationView.id,
                            boundedContext: srcElement.boundedContext,
                            elementView: {
                                id: srcElement.id
                            },
                            targetAggregate: me.viewToAggregate(tarElement),
                            targetBoundedContext: tarElement.boundedContext,
                            getMethod: true
                        }

                        srcElement.boundedContext.circuitBreaker = item.circuitBreaker;
                        srcElement.boundedContext.fallback = item.fallback;
                        srcElement.relationCommandInfo = relationCommandInfo;

                        // add preferredPlatform
                        let getPreferredPlatform = relationCommandInfo.boundedContext ? relationCommandInfo.boundedContext.preferredPlatform : tarElement.preferredPlatform
                        relationCommandInfo.preferredPlatform = getPreferredPlatform

                        modelForElements.RelationCommandInfo.push(relationCommandInfo);
                    }
                } else if (item.sourceElement._type == "org.uengine.modeling.model.Command" &&
                    item.targetElement._type == "org.uengine.modeling.model.Aggregate") {
                    let srcElement = commandByIds[item.sourceElement.id ? item.sourceElement.id : item.sourceElement.elementView.id];
                    let tarElement = aggregateByIds[item.targetElement.id ? item.targetElement.id : item.targetElement.elementView.id];
    
                    // element in PBC
                    if(!srcElement && item.sourceElement.pbcId) srcElement = item.sourceElement
                    if(!tarElement && item.targetElement.pbcId) tarElement = item.targetElement

                    if (srcElement && aggregateByIds[aggId]) {
                        let relationCommandInfo = {
                            commandValue: srcElement,
                            relationId: item.relationView.id,
                            boundedContext: srcElement.boundedContext,
                            elementView: {
                                id: srcElement.id
                            },
                            targetAggregate: tarElement,
                            targetBoundedContext: tarElement.boundedContext,
                            method: "GET"
                        }
                        srcElement.relationCommandInfo = relationCommandInfo;
                        srcElement.boundedContext.circuitBreaker = item.circuitBreaker;  //dirty
                        srcElement.boundedContext.fallback = item.fallback;  //dirty

                        // add preferredPlatform
                        let getPreferredPlatform = relationCommandInfo.boundedContext ? relationCommandInfo.boundedContext.preferredPlatform : tarElement.preferredPlatform
                        relationCommandInfo.preferredPlatform = getPreferredPlatform

                        modelForElements.RelationCommandInfo.push(relationCommandInfo);
                    }
                } else if (item.sourceElement._type == "org.uengine.modeling.model.Policy" &&
                    item.targetElement._type == "org.uengine.modeling.model.Aggregate") {
                    let srcElement = policyByIds[item.sourceElement.id ? item.sourceElement.id : item.sourceElement.elementView.id];
                    let tarElement = aggregateByIds[item.targetElement.id ? item.targetElement.id : item.targetElement.elementView.id];
    
                    // element in PBC
                    if(!srcElement && item.sourceElement.pbcId) srcElement = item.sourceElement
                    if(!tarElement && item.targetElement.pbcId) tarElement = item.targetElement

                    if (srcElement && tarElement) {
                        if (!srcElement.relationAggregateInfo) srcElement.relationAggregateInfo = [];
                        if (!srcElement.outgoingAggregateRefs) srcElement.outgoingAggregateRefs = [];

                        let relationCommandInfo = {
                            commandValue: srcElement,   //////
                            relationId: item.relationView.id,
                            boundedContext: srcElement.boundedContext,
                            elementView: {
                                id: tarElement.id
                            }
                        }

                        srcElement.boundedContext.circuitBreaker = item.circuitBreaker;
                        srcElement.boundedContext.fallback = item.fallback;
                        relationCommandInfo.targetBoundedContext = tarElement.boundedContext;
                        relationCommandInfo.targetAggregate = tarElement

                        // add preferredPlatform
                        let getPreferredPlatform = relationCommandInfo.boundedContext ? relationCommandInfo.boundedContext.preferredPlatform : tarElement.preferredPlatform
                        relationCommandInfo.preferredPlatform = getPreferredPlatform
                     
                        srcElement.relationAggregateInfo.push({
                            aggregateValue: tarElement,
                            relationId: item.relationView.id,
                            boundedContext: tarElement.boundedContext,
                            elementView: {
                                id: tarElement.id
                            }
                        });
                       
                        srcElement.outgoingAggregateRefs.push({
                            name: item && item.name ? item.name : '',
                            value: tarElement
                        });

                        modelForElements.RelationCommandInfo.push(relationCommandInfo);
                    }
                } else if (item.sourceElement._type == "org.uengine.modeling.model.Policy" &&
                    item.targetElement._type == "org.uengine.modeling.model.View") {
                    let srcElement = policyByIds[item.sourceElement.id ? item.sourceElement.id : item.sourceElement.elementView.id];
                    let tarElement = viewByIds[item.targetElement.id ? item.targetElement.id : item.targetElement.elementView.id];
    
                    // element in PBC
                    if(!srcElement && item.sourceElement.pbcId) srcElement = item.sourceElement
                    if(!tarElement && item.targetElement.pbcId) tarElement = item.targetElement


                    if (srcElement && tarElement) {
                        if (!srcElement.relationAggregateInfo) srcElement.relationAggregateInfo = [];
                        if (!srcElement.outgoingViewRefs) srcElement.outgoingViewRefs = [];

                        let parseView = me.viewToAggregate(tarElement)
                        let relationCommandInfo = {
                            commandValue: parseView,
                            relationId: item.relationView.id,
                            boundedContext: srcElement.boundedContext,
                            elementView: {
                                id: parseView.id
                            }
                        }

                        // add preferredPlatform
                        let getPreferredPlatform = relationCommandInfo.boundedContext ? relationCommandInfo.boundedContext.preferredPlatform : tarElement.preferredPlatform
                        relationCommandInfo.preferredPlatform = getPreferredPlatform
                      
                        srcElement.relationAggregateInfo.push({
                            aggregateValue: parseView,
                            relationId: item.relationView.id,
                            boundedContext: parseView.boundedContext,
                            elementView: {
                                id: tarElement.id
                            }
                        });
                      
                        srcElement.outgoingViewRefs.push({
                            name: item && item.name ? item.name : '',
                            value: tarElement
                        });
                      
                        modelForElements.RelationCommandInfo.push(relationCommandInfo);
                    }
                } else if (item.sourceElement._type == "org.uengine.modeling.model.Policy" &&
                    item.targetElement._type == "org.uengine.modeling.model.Command") {
                    let srcElement = policyByIds[item.sourceElement.id ? item.sourceElement.id : item.sourceElement.elementView.id];
                    let tarElement = commandByIds[item.targetElement.id ? item.targetElement.id : item.targetElement.elementView.id];
    
                    // element in PBC
                    if(!srcElement && item.sourceElement.pbcId) srcElement = item.sourceElement
                    if(!tarElement && item.targetElement.pbcId) tarElement = item.targetElement


                    if (srcElement && tarElement) {
                        if (!srcElement.outgoingCommandInfo) srcElement.outgoingCommandInfo = [];
                        if (!srcElement.outgoingCommandRefs) srcElement.outgoingCommandRefs = [];

                        srcElement.outgoingCommandRefs.push({
                            name: item && item.name ? item.name : '',
                            value: tarElement
                        });

                        let outgoingCommandInfo = {
                            commandValue: tarElement,
                            relationId: item.relationView.id,
                            boundedContext: srcElement.boundedContext,
                            elementView: {
                                id: srcElement.id
                            }
                        }

                        // add preferredPlatform
                        let getPreferredPlatform = outgoingCommandInfo.boundedContext ? outgoingCommandInfo.boundedContext.preferredPlatform : tarElement.preferredPlatform
                        outgoingCommandInfo.preferredPlatform = getPreferredPlatform

                        srcElement.outgoingCommandInfo.push(outgoingCommandInfo);
                        //modelForElements.OutgoingCommandInfo.push(outgoingCommandInfo);
                    }
                }
            }
        });

        if (Object.values(eventByIds).length > 0) {
            Object.values(eventByIds).forEach(function (item, idx) {
                if (item.triggerShouldExist != undefined || item.tirggerShouldExist != null) {
                    if (!item.triggerShouldExist) {
                        item.trigger = ''
                    }
                }
            })
        }

        modelForElements.Command.forEach(item => {
            if (item.triggerByCommand) {
                for (var i = 0; i < item.triggerByCommand.length; i++) {
                    var tbc = item.triggerByCommand[i]
                    tbc.relationCommandInfo = eventByIds[tbc.eventValue.elementView.id].relationCommandInfo
                }
            }
        })


        modelForElements.Aggregate.forEach(item => {
            if (modelForElements.Policy.length > 0) {
                modelForElements.Policy.forEach(policy => {
                    if (policy) {
                        if (isAttached(policy, item)) {
                            if (!item.policyList)
                                item.policyList = []
                            item.policyList.push(policyByIds[policy.id])
                        }
                    }
                })
            }
        })

        modelForElements.RelationCommandInfo.forEach(item => {
            if (item.boundedContext && Object.keys(item.boundedContext).length != 0) {
                var boundedContext =  item.boundedContext ? boundedContextByIds[item.boundedContext.id] : null

                if (!boundedContext.relationCommandInfo) {
                    boundedContext.relationCommandInfo = []
                }
                if( boundedContextByIds[boundedContext.id] ){
                    boundedContextByIds[boundedContext.id].relationCommandInfo.push(item);
                }
            }
        })

        // setting modelElements
        if (modelForElements.Aggregate) {
            modelForElements.Aggregate.forEach(function (agg) {
                modelElements.aggregates.push(agg)
            })
        }
        if (modelForElements.BoundedContext) {
            modelForElements.BoundedContext.forEach(function (bc) {
                modelElements.boundedContextes.push(bc)
            })
        }

        modelForElements.ModelElements = modelElements
        selectedTemplate = [...new Set(selectedTemplate)];
        // modelForElements = Object.assign(modelForElements)
        //
        // Object.freeze(modelForElements);


///////////////// interconnect with incoming and outgoing elements with their relations ////////////
        modelForElements.Relation.forEach(relation => {

            if(!relation.source.outgoingRelations)
                relation.source.outgoingRelations = [];

            //if relation is not already in the list
            if(relation.source.outgoingRelations.filter(item => item.value.relationView.id == relation.value.relationView.id).length == 0)
                relation.source.outgoingRelations.push(relation);

            if(!relation.target.incomingRelations)
                relation.target.incomingRelations = [];

            if(relation.target.incomingRelations.filter(item => item.value.relationView.id == relation.value.relationView.id).length==0)
                relation.target.incomingRelations.push(relation);



           //////// type name setting ///////////////////////
            relation.source.type = relation.source._type.split('.').pop();
            if(relation.source.type=="View")
                relation.source.type = "ReadModel";


            relation.target.type = relation.target._type.split('.').pop();
            if(relation.target.type=="View")
                relation.target.type = "ReadModel";

        });



////////////// interconnect with attached elements ///////
        Object.values(modelForElements).forEach(elementBag => {

            if(elementBag.forEach)
            elementBag.forEach(element => {

                Object.values(modelForElements).forEach(checkingElementBag => {
                    if(checkingElementBag.forEach) //TODO what is ModelElement? and why is abnormally an Object rather than Array like others
                    checkingElementBag.forEach(checkingElement => {

                        if(isAttached(element, checkingElement)){
                            if(!element.attached)
                                element.attached = []

                            element.attached.push(checkingElement)
                        }
                    })

                })
            })

        });



        modelForElements.Command.forEach(command => {
            command.isExtendedVerb = !command.isRestRepository;
        });

        return {
            rootModel: rootModel,
            modelForElements: modelForElements,
            preferredPlatforms: selectedTemplate
        }
    }

    afterProcessing(rootModel, modelForElements, platforms){
        try{
            var preferredPlatforms = platforms.preferredPlatforms
            var basePlatforms = platforms.basePlatform
            var rootPath = platforms.rootPath
            var pbcId = platforms.pbcId
            rootModel.boundedContexts.forEach(function (bound, idx) {
                // 8080 gateway 8081 frontend
                bound.portGenerated = (bound.portNumForCodeGen) ? bound.portNumForCodeGen : (8082 + idx)
                // if(rootModel.boundedContexts[idx].preferredPlatform.includes("http")){
                //     me.value.elements[rootModel.boundedContexts[idx].elementView.id].preferredPlatform = rootModel.boundedContexts[idx].preferredPlatform
                // }

                if (rootModel.boundedContexts[idx].aggregates.length >= 1) {
                    rootModel.boundedContexts[idx].aggregates.forEach(function (agg, aggIdx) {
                        if (!agg) return;

                        var lifeCycles = [
                            {trigger: 'PostPersist', annotation: '@PostPersist', events: [], commands: []},
                            {trigger: 'PostUpdate', annotation: '@PostUpdate', events: [], commands: []},
                            {trigger: 'PostRemove', annotation: '@PostRemove', events: [], commands: []},
                            {trigger: 'PrePersist', annotation: '@PrePersist', events: [], commands: []},
                            {trigger: 'PreUpdate', annotation: '@PreUpdate', events: [], commands: []},
                            {trigger: 'PreRemove', annotation: '@PreRemove', events: [], commands: []},
                        ]
                        // fieldDescriptors 전처리
                        agg.aggregateRoot.fieldDescriptors.forEach(function (fd, index) {
                            fd.name = fd.name
                            fd.nameCamelCase = _.camelCase(fd.name)
                            fd.namePascalCase = fd.nameCamelCase.substring(0, 1).toUpperCase() + fd.nameCamelCase.substring(1);
                            if (fd.isKey || index == 0) {
                                agg.aggregateRoot.keyFieldDescriptor = fd;
                                agg.keyFieldDescriptor = fd;
                            }
                        })

                        if (agg.commands)
                            agg.commands.forEach(function (co) {
                                lifeCycles.some(function (lifeCycle) {
                                    if (!co.trigger || co.trigger == undefined) {
                                        if (co.restRepositoryInfo.method == "POST") {
                                            co.trigger = "@PrePersist"
                                        } else if (co.restRepositoryInfo.method == "DELETE") {
                                            co.trigger = "@PreRemove"
                                        } else if (co.restRepositoryInfo.method == "PATCH") {
                                            co.trigger = "@PreUpdate"
                                        }
                                    }
                                    if (lifeCycle.annotation == co.trigger) {
                                        lifeCycle.commands.push(co)
                                        return;
                                    }
                                })

                                if (co.controllerInfo.apiPath != '') {
                                    // co.controllerInfo.apiPath =co.controllerInfo.apiPath.replace('/',`//`)
                                }

                            })

                        if (agg.events)
                            agg.events.forEach(function (ev) {
                                ev.fieldDescriptors.forEach(function (fd) {
                                    fd.name = fd.name
                                    fd.nameCamelCase = _.camelCase(fd.name)
                                    fd.namePascalCase = fd.nameCamelCase.substring(0, 1).toUpperCase() + fd.nameCamelCase.substring(1);
                                    if (fd.isKey)
                                        ev.keyFieldDescriptor = fd;
                                })
                                lifeCycles.some(function (lifeCycle) {
                                    if (lifeCycle.annotation == ev.trigger) {
                                        lifeCycle.events.push(ev)
                                        return;
                                    }
                                })
                            })

                        lifeCycles.forEach(function (lifeCycleNull, idx) {
                            if (lifeCycleNull.events.length == 0 && lifeCycleNull.commands.length == 0) {
                                lifeCycles[idx] = null;
                            }
                        })

                        lifeCycles = lifeCycles.filter(n => n);

                        if (lifeCycles.length > 0) {
                            rootModel.boundedContexts[idx].aggregates[aggIdx].lifeCycles = lifeCycles;
                        }
                    })
                }

                if (rootModel.boundedContexts[idx].policies && rootModel.boundedContexts[idx].policies.length >= 1) {
                    rootModel.boundedContexts[idx].policies.forEach(function (po) {
                    })
                }

                if (rootModel.boundedContexts[idx].views && rootModel.boundedContexts[idx].views.length >= 1) {
                    rootModel.boundedContexts[idx].views.forEach(function (vi) {

                        vi.fieldDescriptors.forEach(function (fd) {
                            fd.name = fd.name
                            fd.nameCamelCase = _.camelCase(fd.name)
                            fd.namePascalCase = fd.nameCamelCase.substring(0, 1).toUpperCase() + fd.nameCamelCase.substring(1);
                            if (fd.isKey)
                                vi.keyFieldDescriptor = fd;
                        })

                    })
                }
            })
        }catch (e) {
            console.log(`ERROR] Generate Data Pre processing :: ${e}`)
        }
    }

    filterProjectName(projectName){
        if(projectName){
            var filteredName =  JSON.parse(JSON.stringify(projectName));
            var pattern1 = /[\{\}\[\]\/?.,;:|\)*~`!^+<>@\#$%&\\\=\-\(\'\"]/gi; //특수문자 제거
            var pattern2 = /[0-9ㄱ-ㅎ|ㅏ-ㅣ|가-힣~!@#$%^&*()_+|-|<>?:{}]/gi; // 한글 제거
            if (pattern1.test(filteredName)) {
                filteredName = filteredName.replace(pattern1, '');
            }
            if (pattern2.test(filteredName)) {
                filteredName = filteredName.replace(pattern2, '');
            }
            filteredName = filteredName.toLowerCase();

            return filteredName == '' ? 'untitled' : filteredName;
        }
        return 'untitled';
    }

    convertNameForElement(item){
        if( item.name ){
            item.namePascalCase = changeCase.pascalCase(item.name)
            item.nameCamelCase = changeCase.camelCase(item.name)
            item.namePlural = pluralize(item.nameCamelCase);
        }
    }

    setNames(value){
        if(value && value.name){
            value.namePascalCase = changeCase.pascalCase(value.name)
            value.nameCamelCase = changeCase.camelCase(value.name)
        }
    }

    viewToAggregate(view) {
        var tmp = view.fieldDescriptors;

        view.elementView._type == "org.uengine.modeling.model.Aggregate";
        view["aggregateRoot"] = {
            _type: "org.uengine.modeling.model.AggregateRoot",
            fieldDescriptors: tmp
        }
        return view
    }


}

module.exports = CodeGeneratorCore;