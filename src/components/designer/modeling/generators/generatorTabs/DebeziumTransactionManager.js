import crypto from 'crypto';
import changeCase from 'change-case';

class DebeziumTransactionManager {
    constructor() {
        this.transactions = []
    }

    addNewTransaction(rawTransaction, transaction, usecases, queries) {
        this.transactions.push(new DebeziumTransaction(rawTransaction, transaction, usecases, queries))
    }

    addNewTransactionFromModelValue(modelValue) {
        modelValue.transactions.forEach((transaction, index) => {
            this.addNewTransaction(modelValue.debeziumLogStrings[index], transaction, modelValue.usecases, modelValue.queries)
        })
    }

    toStringObject() {
        return this.transactions.map(transaction => transaction.toStringObject())
    }

    apply(modelValue, userInfo) {
        let callbacks = {
            afterAllObjectAppliedCallBacks: [],
            afterAllRelationAppliedCallBacks: []
        }

        this.transactions.forEach(transaction => {
            const transactionCallbacks = transaction.apply(modelValue, userInfo)
            callbacks.afterAllObjectAppliedCallBacks = callbacks.afterAllObjectAppliedCallBacks.concat(transactionCallbacks.afterAllObjectAppliedCallBacks)
            callbacks.afterAllRelationAppliedCallBacks = callbacks.afterAllRelationAppliedCallBacks.concat(transactionCallbacks.afterAllRelationAppliedCallBacks)
        })

        callbacks.afterAllObjectAppliedCallBacks.forEach(callback => {
            callback(modelValue, userInfo)
        })

        callbacks.afterAllRelationAppliedCallBacks.forEach(callback => {
            callback(modelValue, userInfo)
        })
    }

    toSaveObject() {
        return this.transactions.map(transaction => transaction.toSaveObject())
    }

    static fromSaveObject(saveObject) {
        const transactionManager = new DebeziumTransactionManager();
        transactionManager.transactions = saveObject.map(transaction => DebeziumTransaction.fromSaveObject(transaction));
        return transactionManager;
    }
}

class DebeziumTransaction {
    constructor(rawTransaction, transaction, usecases, queries) {
        const getReleatedUsecase = (transaction, usecases) => {
            return usecases.filter(usecase => usecase.relatedTransactionId === transaction.id)[0];
        }

        const getRelatedQueries = (usecase, queries) => {
            const getAllTypeQueryIds = (usecase) => {
                let queryIds = [];
                queryIds = queryIds.concat(usecase.relatedBoundedContextQueryIds);
                queryIds = queryIds.concat(usecase.relatedAggregateQueryIds);
                queryIds = queryIds.concat(usecase.relatedEnumerationQueryIds);
                queryIds = queryIds.concat(usecase.relatedValueObjectQueryIds);
                queryIds = queryIds.concat(usecase.relatedCommandQueryIds);
                queryIds = queryIds.concat(usecase.relatedEventQueryIds);
                queryIds = queryIds.concat(usecase.relatedPolicyQueryIds);
                return queryIds;
            }

            const allTypeQueryIds = getAllTypeQueryIds(usecase)
            return queries.filter(query => allTypeQueryIds.includes(query.queryId));
        }

        const getHashFromString = (string, substringLength = 16) => {
            const hash = crypto.createHash('sha256');
            hash.update(string);
            return hash.digest('hex').substring(0, substringLength);
        }

        this.hash = rawTransaction ? getHashFromString(rawTransaction) : "";
        this.rawTransaction = rawTransaction ? rawTransaction : ""
        this.transaction = transaction ? transaction : {}
        this.usecase = usecases ? getReleatedUsecase(transaction, usecases) : {}
        this.queries = queries ? getRelatedQueries(this.usecase, queries)
            .map(query => new DebeziumTransactionQuery(query)) : []
    }

    toStringObject() {
        return {
            hash: this.hash,
            rawTransaction: this.rawTransaction,
            usecase: this.usecase.displayName,
            actor: this.usecase.actor,
            queries: this.queries.map(query => query.toStringObject())
        }
    }

    apply(modelValue, userInfo) {
        let callbacks = {
            afterAllObjectAppliedCallBacks: [],
            afterAllRelationAppliedCallBacks: []
        }

        this.queries.forEach(query => {
            const queryCallbacks = query.apply(modelValue, userInfo)
            callbacks.afterAllObjectAppliedCallBacks = callbacks.afterAllObjectAppliedCallBacks.concat(queryCallbacks.afterAllObjectAppliedCallBacks)
            callbacks.afterAllRelationAppliedCallBacks = callbacks.afterAllRelationAppliedCallBacks.concat(queryCallbacks.afterAllRelationAppliedCallBacks)
        })

        return callbacks
    }

    toSaveObject() {
        return {
            hash: this.hash,
            rawTransaction: this.rawTransaction,
            transaction: this.transaction,
            usecase: this.usecase,
            queries: this.queries.map(query => query.toSaveObject())
        }
    }

    static fromSaveObject(saveObject) {
        const transaction = new DebeziumTransaction();
        transaction.hash = saveObject.hash;
        transaction.rawTransaction = saveObject.rawTransaction;
        transaction.transaction = saveObject.transaction;
        transaction.usecase = saveObject.usecase;
        transaction.queries = saveObject.queries.map(query => DebeziumTransactionQuery.fromSaveObject(query));
        return transaction;
    }
}

class DebeziumTransactionQuery {
    constructor(query, isApplied) {
        this.query = query ? query : {};
        this.isApplied = isApplied ? isApplied : false;
    }

    toStringObject() {
        const boundContextQueryToString = (query) => {
            switch(query.action) {
                case "update":
                    return `Update ${query.args.boundedContextAlias} Bounded Context`;
                case "delete":
                    return `[Not implemented] Delete ${query.args.boundedContextAlias} Bounded Context`;
            }
        }

        const aggregateQueryToString = (query) => {
            switch(query.action) {
                case "update":
                    return `Update ${query.args.aggregateAlias} Aggregate`;
                case "delete":
                    return `[Not implemented] Delete ${query.args.aggregateAlias} Aggregate`;
            }
        }

        const commandQueryToString = (query) => {
            switch(query.action) {
                case "update":
                    return `Update ${query.args.commandAlias} Command`;
                case "delete":
                    return `[Not implemented] Delete ${query.args.commandAlias} Command`;
            }
        }

        const eventQueryToString = (query) => {
            switch(query.action) {
                case "update":
                    return `Update ${query.args.eventAlias} Event`;
                case "delete":
                    return `[Not implemented] Delete ${query.args.eventAlias} Event`;
            }
        }

        const enumerationQueryToString = (query) => {
            switch(query.action) {
                case "update":
                    return `Update ${query.args.enumerationName} Enumeration in ${query.ids.aggregateId} Aggregate`;
                case "delete":
                    return `[Not implemented] Delete ${query.args.enumerationName} Enumeration in ${query.ids.aggregateId} Aggregate`;
            }
        }

        const valueObjectQueryToString = (query) => {
            switch(query.action) {
                case "update":
                    return `Update ${query.args.valueObjectName} Value Object in ${query.ids.aggregateId} Aggregate`;
                case "delete":
                    return `[Not implemented] Delete ${query.args.valueObjectName} Value Object in ${query.ids.aggregateId} Aggregate`;
            }
        }

        let summary = "";
        switch(this.query.objectType) {
            case "BoundedContext":
                summary = boundContextQueryToString(this.query);
                break;
            case "Aggregate":
                summary = aggregateQueryToString(this.query);
                break;
            case "Command":
                summary = commandQueryToString(this.query);
                break;
            case "Event":
                summary = eventQueryToString(this.query);
                break;
            case "Enumeration":
                summary = enumerationQueryToString(this.query);
                break;
            case "ValueObject":
                summary = valueObjectQueryToString(this.query);
                break;
        }

        return {
            summary: summary,
            rawQuery: JSON.stringify(this.query, null, 2)
        }
    }

    apply(modelValue, userInfo) {
        let callbacks = {
            afterAllObjectAppliedCallBacks: [],
            afterAllRelationAppliedCallBacks: []
        }

        const getUUID = () => {
            const s4 = () => {
                return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
            }
        
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4()
        }


        const makeEventStormingRelationObjectBase = (fromObject, toObject) => {
            const elementUUIDtoUse = getUUID()
            const FROM_OBJECT_ID = fromObject.id ? fromObject.id : fromObject.elementView.id
            const TO_OBJECT_ID = toObject.id ? toObject.id : toObject.elementView.id
            return {
                "_type": "org.uengine.modeling.model.Relation",
                "name": "",
                "id": elementUUIDtoUse,
                "sourceElement": fromObject,
                "targetElement": toObject,
                "from": FROM_OBJECT_ID,
                "to": TO_OBJECT_ID,
                "relationView": {
                    "id": elementUUIDtoUse,
                    "style": `{"arrow-start":"none","arrow-end":"none"}`,
                    "from": FROM_OBJECT_ID,
                    "to": TO_OBJECT_ID,
                    "needReconnect": true,
                    "value": "[]"
                },
                "hexagonalView": {
                    "_type": "org.uengine.modeling.model.RelationHexagonal",
                    "from": FROM_OBJECT_ID,
                    "id": elementUUIDtoUse,
                    "needReconnect": true,
                    "style": `{"arrow-start":"none","arrow-end":"none"}`,
                    "to": TO_OBJECT_ID,
                    "value": null
                },
                "sourceMultiplicity": "1",
                "targetMultiplicity": "1",
            }
        }

        const applyToBoundedContext = (modelValue, userInfo, query) => {
            const createNewBoundedContext = (modelValue, userInfo, query) => {
                const getBoundedContextBase = (userInfo, name, displayName, portNumber, x, y, elementUUID) => {
                    const elementUUIDtoUse = elementUUID ? elementUUID : getUUID();
                    return {
                        _type: "org.uengine.modeling.model.BoundedContext",
                        aggregates: [],
                        author: userInfo.uid,
                        description: null,
                        id: elementUUIDtoUse,
                        elementView: {
                            _type: "org.uengine.modeling.model.BoundedContext",
                            height: 590,
                            id: elementUUIDtoUse,
                            style: "{}",
                            width: 560,
                            x: x, 
                            y: y,
                        }, 
                        gitURL: null,
                        hexagonalView: {
                            _type: "org.uengine.modeling.model.BoundedContextHexagonal",
                            height: 350,
                            id: elementUUIDtoUse,
                            style: "{}",
                            width: 350,
                            x: 235,
                            y: 365
                        },
                        members: [],
                        name: name,
                        displayName: displayName,
                        oldName: "",
                        policies: [],
                        portGenerated: portNumber,
                        preferredPlatform: "template-spring-boot",
                        preferredPlatformConf: {},
                        rotateStatus: false,
                        tempId: "",
                        templatePerElements: {},
                        views: []
                    }
                }

                const getAllBoundedContexts = (modelValue) => {
                    return Object.values(modelValue.elements).filter(element => element && element._type === "org.uengine.modeling.model.BoundedContext")
                }

                const getValidPortNumber = (modelValue) => {
                    const boundedContexts = getAllBoundedContexts(modelValue)
                    const maxPortNumber = Math.max(...boundedContexts.map(bc => bc.portGenerated ? bc.portGenerated : 8080-1))
                    return maxPortNumber + 1
                }

                const getValidPosition = (modelValue, boundedContextObject) => {
                    const boundedContexts = getAllBoundedContexts(modelValue)
                    if(boundedContexts.length <= 0) return {x: 450, y: 450}

                    const maxX = Math.max(...boundedContexts.map(bc => bc.elementView.x))
                    const minY = Math.min(...boundedContexts.map(bc => bc.elementView.y))

                    const maxXBoundedContext = boundedContexts.filter(bc => bc.elementView.x === maxX)[0]
                    return {x: maxX + Math.round(maxXBoundedContext.elementView.width/2) 
                               + Math.round(boundedContextObject.elementView.width/2) + 25, y: minY}
                }

                
                let boundedContextObject = getBoundedContextBase(
                    userInfo, query.args.boundedContextName, query.args.boundedContextAlias, 
                    getValidPortNumber(modelValue), 0, 0, query.ids.boundedContextId
                )

                const VALID_POSITION = getValidPosition(modelValue, boundedContextObject)
                boundedContextObject.elementView.x = VALID_POSITION.x
                boundedContextObject.elementView.y = VALID_POSITION.y

                modelValue.elements[boundedContextObject.id] = boundedContextObject
            }

            switch(query.action) {
                case "update":
                    if(!modelValue.elements[query.ids.boundedContextId]) createNewBoundedContext(modelValue, userInfo, query);
                    break;
            }
        }

        const applyToAggregate = (modelValue, userInfo, query) => {
            const createNewAggregate = (modelValue, userInfo, query) => {
                const getAggregateBase = (userInfo, name, displayName, boundedContextId, x, y, elementUUID) => {
                    const elementUUIDtoUse = elementUUID ? elementUUID : getUUID();
                    return {
                        aggregateRoot: {
                            _type: 'org.uengine.modeling.model.AggregateRoot', 
                            fieldDescriptors: [],
                            entities: {
                                elements: {},
                                relations: {}
                            }, 
                            operations: [],
                        },
                        author: userInfo.uid,
                        boundedContext: {
                            name: boundedContextId,
                            id: boundedContextId
                        },
                        commands: [],
                        description: null,
                        id: elementUUIDtoUse, 
                        elementView: {
                            _type: 'org.uengine.modeling.model.Aggregate', 
                            id: elementUUIDtoUse, 
                            x: x, 
                            y: y,
                            width: 130,
                            height: 400,
                            _type: "org.uengine.modeling.model.Aggregate"
                        },
                        events: [],
                        hexagonalView: {
                            _type: 'org.uengine.modeling.model.AggregateHexagonal', 
                            id: elementUUIDtoUse, 
                            x: 0, 
                            y: 0, 
                            subWidth: 0,
                            width: 0,
                            x: 0,
                            y: 0,
                            _type: "org.uengine.modeling.model.AggregateHexagonal"
                        },
                        name: name,
                        displayName: displayName,
                        nameCamelCase: changeCase.camelCase(name),
                        namePascalCase: changeCase.pascalCase(name),
                        namePlural: "",
                        rotateStatus: false,
                        selected: false,
                        _type: "org.uengine.modeling.model.Aggregate"
                    }
                }

                const getAllAggregatesInBoundedContext = (modelValue, boundedContextId) => {
                    return Object.values(modelValue.elements)
                        .filter(element => element && element._type === "org.uengine.modeling.model.Aggregate" && element.boundedContext.id === boundedContextId)
                }

                const getValidPosition = (modelValue, query, aggregateObject) => {  
                    const aggregates = getAllAggregatesInBoundedContext(modelValue, query.ids.boundedContextId)
                    if(aggregates.length <= 0) {
                        const currentBoundedContext = modelValue.elements[query.ids.boundedContextId]
                        return {x: currentBoundedContext.elementView.x, y: currentBoundedContext.elementView.y}
                    }
                    else {
                        const maxX = Math.max(...aggregates.map(agg => agg.elementView.x))
                        const minY = Math.min(...aggregates.map(agg => agg.elementView.y))

                        const maxXAggregate = aggregates.filter(agg => agg.elementView.x === maxX)[0]
                        return {x: maxX + Math.round(maxXAggregate.elementView.width/2) 
                               + Math.round(aggregateObject.elementView.width/2) + 300, y: minY}
                    }
                }

                const getFileDescriptors = (queryProperties) => {
                    return queryProperties.map((property) => {
                        return {
                            "className": property.type,
                            "isCopy": false,
                            "isKey": property.isKey,
                            "name": property.name,
                            "nameCamelCase": changeCase.camelCase(property.name),
                            "namePascalCase": changeCase.pascalCase(property.name),
                            "displayName": property.displayName,
                            "_type": "org.uengine.model.FieldDescriptor"
                        }
                    })
                }

                const getRootAggregateBase = (name, aggregateId, fieldDescriptors, elementUUID) => {
                    const elementUUIDtoUse = elementUUID ? elementUUID : getUUID()

                    return {
                        "_type": "org.uengine.uml.model.Class",
                        "id": elementUUIDtoUse,
                        "name": name,
                        "namePascalCase": changeCase.pascalCase(name),
                        "nameCamelCase": changeCase.camelCase(name),
                        "namePlural": name+ "s",
                        "fieldDescriptors": fieldDescriptors,
                        "operations": [],
                        "elementView": {
                            "_type": "org.uengine.uml.model.Class",
                            "id": elementUUIDtoUse,
                            "x": 350,
                            "y": 200,
                            "width": 200,
                            "height": 100,
                            "style": "{}",
                            "titleH": 50,
                            "subEdgeH": 120,
                            "fieldH": 90,
                            "methodH": 30
                        },
                        "selected": false,
                        "relations": [],
                        "parentOperations": [],
                        "relationType": null,
                        "isVO": false,
                        "isAbstract": false,
                        "isInterface": false,
                        "isAggregateRoot": true,
                        "parentId": aggregateId
                    }
                }

                const getFileDescriptorsForRootAggegate = (queryProperties) => {
                    return queryProperties.map((property) => {
                        return {
                            "className": property.type,
                            "isCopy": false,
                            "isKey": property.isKey,
                            "name": property.name,
                            "displayName": property.displayName,
                            "nameCamelCase": changeCase.camelCase(property.name),
                            "namePascalCase": changeCase.pascalCase(property.name),
                            "_type": "org.uengine.model.FieldDescriptor",
                            "inputUI": null,
                            "options": null
                        }
                    })
                }

                const relocateUIPositions = (modelValue, query, aggregateObject) => {
                    const getTargetBoundedContextIds = (modelValue, currentBoundedContext) => {
                        let targetBoundedContextIds = []
                        for(const element of Object.values(modelValue.elements)) {
                            if(element && element._type === "org.uengine.modeling.model.BoundedContext" && element.id !== currentBoundedContext.id)
                            {
                                if((currentBoundedContext.elementView.x < element.elementView.x) && 
                                   (currentBoundedContext.elementView.y + currentBoundedContext.elementView.height/2 > element.elementView.y) &&
                                   (currentBoundedContext.elementView.y - currentBoundedContext.elementView.height/2 < element.elementView.y))
                                   targetBoundedContextIds.push(element.id)
                            }
                        }
                        return targetBoundedContextIds
                    }

                    const getElementIdsInBoundedContext = (modelValue, boundedContextId) => {
                        return Object.values(modelValue.elements)
                            .filter(element => element && element.boundedContext && element.boundedContext.id === boundedContextId)
                            .map(element => element.id)
                    }

                    const aggregates = getAllAggregatesInBoundedContext(modelValue, query.ids.boundedContextId)
                    if(aggregates.length <= 0) return

                    const currentBoundedContext = modelValue.elements[query.ids.boundedContextId]
                    for(const boundedContextId of getTargetBoundedContextIds(modelValue, currentBoundedContext)) {
                        const boundedContext = modelValue.elements[boundedContextId]
                        boundedContext.elementView.x = boundedContext.elementView.x + 400
                        modelValue.elements[boundedContextId] = {...boundedContext}

                        for(const elementId of getElementIdsInBoundedContext(modelValue, boundedContextId)) {
                            const element = modelValue.elements[elementId]
                            element.elementView.x = element.elementView.x + 400
                            modelValue.elements[elementId] = {...element}
                        }
                    }

                    currentBoundedContext.elementView.x = currentBoundedContext.elementView.x + 200
                    currentBoundedContext.elementView.width = currentBoundedContext.elementView.width + 400
                    currentBoundedContext.aggregates = [...currentBoundedContext.aggregates, {"id": aggregateObject.id}]
                    modelValue.elements[query.ids.boundedContextId] = {...currentBoundedContext}
                }

                let aggregateObject = getAggregateBase(
                    userInfo, query.args.aggregateName, query.args.aggregateAlias, 
                    query.ids.boundedContextId, 0, 0, query.ids.aggregateId
                )

                const VALID_POSITION = getValidPosition(modelValue, query, aggregateObject)
                aggregateObject.elementView.x = VALID_POSITION.x
                aggregateObject.elementView.y = VALID_POSITION.y

                aggregateObject.aggregateRoot.fieldDescriptors = getFileDescriptors(query.args.properties)
                relocateUIPositions(modelValue, query, aggregateObject)
                modelValue.elements[aggregateObject.id] = aggregateObject


                const rootAggregateObject = getRootAggregateBase(query.args.aggregateName, aggregateObject.id,
                    getFileDescriptorsForRootAggegate(query.args.properties)
                )
                aggregateObject.aggregateRoot.entities.elements[rootAggregateObject.id] = rootAggregateObject
            }

            switch(query.action) {
                case "update":
                    if(!modelValue.elements[query.ids.aggregateId]) createNewAggregate(modelValue, userInfo, query);
                    break;
            }
        }

        const applyToEvent = (modelValue, userInfo, query) => {
            const createNewEvent = (modelValue, userInfo, query) => {
                const getEventBase = (userInfo, name, displayName, boundedContextId, aggregateId, x, y, elementUUID) => {
                    const elementUUIDtoUse = elementUUID ? elementUUID : getUUID()
                    return {
                        alertURL: "/static/image/symbol/alert-icon.png",
                        author: userInfo.uid,
                        checkAlert: true,
                        description: null,
                        id: elementUUIDtoUse,
                        elementView: {
                            angle: 0,
                            height: 115,
                            id: elementUUIDtoUse,
                            style: "{}",
                            width: 100,
                            x: x, 
                            y: y, 
                            _type: "org.uengine.modeling.model.Event"
                        },
                        fieldDescriptors: [],
                        hexagonalView: {
                            height: 0,
                            id: elementUUIDtoUse,
                            style: "{}",
                            width: 0,
                            x: 0,
                            y: 0,
                            _type: "org.uengine.modeling.model.EventHexagonal"
                        },
                        name: name,
                        displayName: displayName,
                        nameCamelCase: changeCase.camelCase(name),
                        namePascalCase: changeCase.pascalCase(name),
                        namePlural: "",
                        relationCommandInfo: [],
                        relationPolicyInfo: [],
                        rotateStatus: false,
                        selected: false,
                        trigger: "@PostPersist",
                        _type: "org.uengine.modeling.model.Event",
                        aggregate: {
                            id: aggregateId,
                        },
                        boundedContext: {
                            id: boundedContextId
                        }
                    }
                }

                const getValidPosition = (modelValue, query, eventObject) => {
                    const getAllEventsInAggregate = (modelValue, aggregateId) => {
                        return Object.values(modelValue.elements)
                            .filter(element => element && element._type === "org.uengine.modeling.model.Event" && element.aggregate.id === aggregateId)
                    }
                    
                    const events = getAllEventsInAggregate(modelValue, query.ids.aggregateId)
                    if(events.length <= 0) {
                        const currentAggregate = modelValue.elements[query.ids.aggregateId]
                        return {
                            x: currentAggregate.elementView.x + Math.round(currentAggregate.elementView.width/2) + 29,
                            y: currentAggregate.elementView.y - Math.round(currentAggregate.elementView.height/2)
                        }
                    }
                    else {
                        const maxX = Math.max(...events.map(event => event.elementView.x))
                        const maxY = Math.max(...events.map(event => event.elementView.y))

                        const maxYEvent = events.filter(event => event.elementView.y === maxY)[0]
                        return {
                            x: maxX,
                            y: maxY + Math.round(maxYEvent.elementView.height/2) + Math.round(eventObject.elementView.height/2) + 14
                        }
                    }
                }

                const getFileDescriptors = (modelValue, query) => {
                    return modelValue.elements[query.ids.aggregateId].aggregateRoot.fieldDescriptors.map((property) => {
                        return {
                            "className": property.className,
                            "isCopy": false,
                            "isKey": property.isKey,
                            "name": property.name,
                            "nameCamelCase": property.nameCamelCase,
                            "namePascalCase": property.namePascalCase,
                            "displayName": property.displayName,
                            "_type": "org.uengine.model.FieldDescriptor"
                        }
                    })
                }

                const createNewPolicy = (modelValue, userInfo, eventObject, commandId) => {
                    const getPolicyBase = (userInfo, name, displayName, boundedContextId, x, y, elementUUID) => {
                        const elementUUIDtoUse = elementUUID ? elementUUID : getUUID()
                        return {
                            id: elementUUIDtoUse,
                            author: userInfo.uid,
                            boundedContext: {
                                id: boundedContextId
                            },
                            description: null,
                            elementView: {
                                height: 115,
                                width: 100,
                                x: x,
                                y: y,
                                id: elementUUIDtoUse,
                                style: "{}",
                                _type: "org.uengine.modeling.model.Policy"
                            },
                            fieldDescriptors: [],
                            hexagonalView: {
                                height: 20,
                                id: elementUUIDtoUse,
                                style: "{}",
                                subWidth: 100,
                                width: 20,
                                _type: "org.uengine.modeling.model.PolicyHexagonal"
                            },
                            isSaga: false,
                            name: name,
                            displayName: displayName,
                            nameCamelCase: changeCase.camelCase(name),
                            namePascalCase: changeCase.pascalCase(name),
                            namePlural: "",
                            oldName: "",
                            rotateStatus: false,
                            _type: "org.uengine.modeling.model.Policy"
                        } 
                    }
    
                    const getValidPosition = (modelValue, aggregateId, policyObject) => {
                        const getRelatedCommands = (modelValue, policyObject) => {
                            let relatedCommands = []
                            for(const relation of Object.values(modelValue.relations)) {
                                if(relation && relation._type === "org.uengine.modeling.model.Relation" && 
                                  (relation.sourceElement.id === policyObject.id || relation.sourceElement.id === policyObject.elementView.id) && 
                                  (relation.targetElement._type === "org.uengine.modeling.model.Command")) {
                                    relatedCommands.push(modelValue.elements[relation.targetElement.id])
                                }
                            }
                            return relatedCommands
                        }
    
                        const relatedCommands = getRelatedCommands(modelValue, policyObject)
                        if(relatedCommands.length <= 0) {
                            const currentAggregate = modelValue.elements[aggregateId]
                            return {
                                x: currentAggregate.elementView.x - Math.round(currentAggregate.elementView.width/2) - 148,
                                y: currentAggregate.elementView.y - Math.round(currentAggregate.elementView.height/2)
                            }
                        }
                        else {
                            const minX = Math.min(...relatedCommands.map(command => command.elementView.x))
                            const maxY = Math.max(...relatedCommands.map(command => command.elementView.y))
    
                            const maxYCommand = relatedCommands.filter(command => command.elementView.y === maxY)[0]
                            return {
                                x: minX - Math.round(policyObject.elementView.width/2) - Math.round(maxYCommand.elementView.width/2) - 19,
                                y: maxY
                            }
                        }
                    }
    
                    const makeEventToPolicyRelation = (modelValue, eventObject, policyObject) => {
                        const eventPolicyRelation = makeEventStormingRelationObjectBase(
                            modelValue.elements[eventObject.id], modelValue.elements[policyObject.id])
                        modelValue.relations[eventPolicyRelation.id] = eventPolicyRelation
                    }

                    const makePolicyToCommandRelation = (modelValue, policyObject, commandObject) => {
                        const policyCommandRelation = makeEventStormingRelationObjectBase(
                            modelValue.elements[policyObject.id], modelValue.elements[commandObject.id])
                        modelValue.relations[policyCommandRelation.id] = policyCommandRelation
                    }
    
                    const commandObject = modelValue.elements[commandId]
                    if(!commandObject || !eventObject) return
                    if(commandObject.aggregate.id === eventObject.aggregate.id) return

                    const policyObject = getPolicyBase(
                        userInfo, commandObject.name + " Policy", commandObject.name + " Policy", 
                        commandObject.boundedContext.id, 0, 0
                    )
    
                    callbacks.afterAllRelationAppliedCallBacks.push((modelValue) => {
                        const VALID_POSITION = getValidPosition(modelValue, commandObject.aggregate.id, policyObject)
                        policyObject.elementView.x = VALID_POSITION.x
                        policyObject.elementView.y = VALID_POSITION.y
                    })
    
                    modelValue.elements[policyObject.id] = policyObject

                    makeEventToPolicyRelation(modelValue, eventObject, policyObject)
                    makePolicyToCommandRelation(modelValue, policyObject, commandObject)
                }

                const eventObject = getEventBase(
                    userInfo, query.args.eventName, query.args.eventAlias, 
                    query.ids.boundedContextId, query.ids.aggregateId, 0, 0, query.ids.eventId
                )

                const VALID_POSITION = getValidPosition(modelValue, query, eventObject)
                eventObject.elementView.x = VALID_POSITION.x
                eventObject.elementView.y = VALID_POSITION.y

                eventObject.fieldDescriptors = getFileDescriptors(modelValue, query)
                modelValue.elements[eventObject.id] = eventObject

                callbacks.afterAllObjectAppliedCallBacks.push((modelValue) => {
                    query.args.outputCommandIds.forEach(commandId => {
                        createNewPolicy(modelValue, userInfo, eventObject, commandId)
                    })
                })
            }

            switch(query.action) {
                case "update":
                    if(!modelValue.elements[query.ids.eventId]) createNewEvent(modelValue, userInfo, query);
                    break;
            }
        }

        const applyToCommand = (modelValue, userInfo, query) => {
            const createNewCommand = (modelValue, userInfo, query) => {
                const getCommandBase = (userInfo, name, displayName, api_verb, outputEvents, boundedContextId, aggregateId, x, y, elementUUID) => {
                    const elementUUIDtoUse = elementUUID ? elementUUID : getUUID()
                    return {
                        _type: "org.uengine.modeling.model.Command",
                        outputEvents: outputEvents,
                        aggregate: {
                            id: aggregateId
                        },
                        author: userInfo.uid,
                        boundedContext: {
                            id: boundedContextId,
                        },
                        controllerInfo: {
                            method: api_verb
                        },
                        fieldDescriptors: [],
                        description: null,
                        id: elementUUIDtoUse,
                        elementView: {
                            _type: "org.uengine.modeling.model.Command",
                            height: 115,
                            id: elementUUIDtoUse,
                            style: "{}",
                            width: 100,
                            x: x, 
                            y: y,
                            "z-index": 999
                        },
                        hexagonalView: {
                            _type: "org.uengine.modeling.model.CommandHexagonal",
                            height: 0,
                            id: elementUUIDtoUse,
                            style: "{}",
                            width: 0,
                            x: 0,
                            y: 0
                        },
                        isRestRepository: (api_verb == 'PUT' ? false : true),
                        name: name,
                        displayName: displayName,
                        nameCamelCase: changeCase.camelCase(name),
                        namePascalCase: changeCase.pascalCase(name),
                        namePlural: "",
                        relationCommandInfo: [],
                        relationEventInfo: [],
                        restRepositoryInfo: {
                            method: api_verb ? api_verb : 'POST'
                        },
                        rotateStatus: false,
                        selected: false,
                        trigger: "@PrePersist",
                    }
                }

                const getOutputEventNames = (modelValue, outputEventIds) => {
                    return outputEventIds.map(eventId => {
                        return modelValue.elements[eventId].name
                    })
                }

                const getValidPosition = (modelValue, query, commandObject) => {
                    const getAllCommandsInAggregate = (modelValue, aggregateId) => {
                        return Object.values(modelValue.elements)
                            .filter(element => element && element._type === "org.uengine.modeling.model.Command" && element.aggregate.id === aggregateId)
                    }

                    const commands = getAllCommandsInAggregate(modelValue, query.ids.aggregateId)
                    if(commands.length <= 0) {
                        const currentAggregate = modelValue.elements[query.ids.aggregateId]
                        return {
                            x: currentAggregate.elementView.x - Math.round(currentAggregate.elementView.width/2) - 29,
                            y: currentAggregate.elementView.y - Math.round(currentAggregate.elementView.height/2)
                        }
                    }
                    else {
                        const minX = Math.min(...commands.map(command => command.elementView.x))
                        const maxY = Math.max(...commands.map(command => command.elementView.y))

                        const maxYCommand = commands.filter(command => command.elementView.y === maxY)[0]
                        return {
                            x: minX,
                            y: maxY + Math.round(maxYCommand.elementView.height/2) + Math.round(commandObject.elementView.height/2) + 14
                        }
                    }
                }

                const getFileDescriptors = (modelValue, query) => {
                    return modelValue.elements[query.ids.aggregateId].aggregateRoot.fieldDescriptors.map((property) => {
                        return {
                            "className": property.className,
                            "isCopy": false,
                            "isKey": property.isKey,
                            "name": property.name,
                            "nameCamelCase": property.nameCamelCase,
                            "namePascalCase": property.namePascalCase,
                            "displayName": property.displayName,
                            "_type": "org.uengine.model.FieldDescriptor"
                        }
                    })
                }

                const makeCommandToEventRelation = (commandObject, query) => {
                    callbacks.afterAllObjectAppliedCallBacks.push((modelValue) => {
                        query.args.outputEventIds.forEach(eventId => {
                            const eventObject = modelValue.elements[eventId]
                            const commandEventRelation = makeEventStormingRelationObjectBase(commandObject, eventObject)
                            modelValue.relations[commandEventRelation.id] = commandEventRelation
                        })
                    })
                }

                const makeActorToCommand = (modelValue, query, commandObject, userInfo) => {
                    const getActorBase = (userInfo, actorName, boundedContextId, x, y, elementUUID) => {
                        const elementUUIDtoUse = elementUUID ? elementUUID : getUUID()
                        return {
                            _type:"org.uengine.modeling.model.Actor",
                            author: userInfo.uid,
                            boundedContext: {
                                id: boundedContextId
                            },
                            description: null,
                            id: elementUUIDtoUse,
                            elementView: {
                                _type: "org.uengine.modeling.model.Actor",
                                height: 100,
                                id: elementUUIDtoUse,
                                style: "{}",
                                width: 100,
                                x: x,
                                y: y
                            },
                            innerAggregate: {
                                command: [],
                                event: [],
                                external: [],
                                policy: [],
                                view: [],
                            },
                            name: actorName,
                            oldName: "",
                            rotateStatus: false
                        }
                    }

                    const getValidPosition = (commandObject, actorObject) => {
                        return {
                            x: commandObject.elementView.x - Math.round(commandObject.elementView.width/2) - Math.round(actorObject.elementView.width/2) + 19,
                            y: commandObject.elementView.y
                        }
                    }

                    const getRelatedPolicies = (modelValue, commandObject) => {
                        return Object.values(modelValue.relations).filter(relation => {
                            return relation && relation.targetElement.id === commandObject.id && 
                                relation.sourceElement._type === "org.uengine.modeling.model.Policy"
                        })
                    }

                    if(getRelatedPolicies(modelValue, commandObject).length > 0) return
                    if(!(query.args.actor)) return
                    
                    const actorBase = getActorBase(userInfo, query.args.actor, query.ids.boundedContextId, 0, 0)
                    const VALID_POSITION = getValidPosition(commandObject, actorBase)
                    actorBase.elementView.x = VALID_POSITION.x
                    actorBase.elementView.y = VALID_POSITION.y

                    modelValue.elements[actorBase.id] = actorBase
                }

                const commandObject = getCommandBase(
                    userInfo, query.args.commandName, query.args.commandAlias, 
                    query.args.api_verb, [], query.ids.boundedContextId,
                    query.ids.aggregateId, 0, 0, query.ids.commandId
                )
                callbacks.afterAllObjectAppliedCallBacks.push((modelValue) => {
                    commandObject.outputEvents = getOutputEventNames(modelValue, query.args.outputEventIds)
                })
                makeCommandToEventRelation(commandObject, query)

                const VALID_POSITION = getValidPosition(modelValue, query, commandObject)
                commandObject.elementView.x = VALID_POSITION.x
                commandObject.elementView.y = VALID_POSITION.y
                callbacks.afterAllRelationAppliedCallBacks.push((modelValue) => {
                    makeActorToCommand(modelValue, query, commandObject, userInfo)
                })

                commandObject.fieldDescriptors = getFileDescriptors(modelValue, query)
                modelValue.elements[commandObject.id] = commandObject
            }

            switch(query.action) {
                case "update":
                    if(!modelValue.elements[query.ids.commandId]) createNewCommand(modelValue, userInfo, query);
                    break;
            }
        }


        const makeUMLRelationObjectBase = (fromObject, toObject) => {
            const elementUUIDtoUse = getUUID()
            const FROM_OBJECT_ID = fromObject.id ? fromObject.id : fromObject.elementView.id
            const TO_OBJECT_ID = toObject.id ? toObject.id : toObject.elementView.id

            return {
                "name": "",
                "id": elementUUIDtoUse,
                "_type": "org.uengine.uml.model.Relation",
                "sourceElement": fromObject,
                "targetElement": toObject,
                "from": FROM_OBJECT_ID,
                "to": TO_OBJECT_ID,
                "selected": false,
                "relationView": {
                    "id": elementUUIDtoUse,
                    "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                    "from": FROM_OBJECT_ID,
                    "to": TO_OBJECT_ID,
                    "needReconnect": true
                },
                "sourceMultiplicity": "1",
                "targetMultiplicity": "1",
                "relationType": "Association",
                "fromLabel": "",
                "toLabel": ""
            }
        }

        const getEntitiesForAggregate = (modelValue, aggregateId) => {
            const entities = modelValue.elements[aggregateId].aggregateRoot.entities
            if(!entities.elements) entities.elements = {}
            if(!entities.relations) entities.relations = {}
            return entities
        }

        const getRootAggregate = (aggregate) => {
            for(const element of Object.values(aggregate.aggregateRoot.entities.elements)) {
                if(element && element._type === "org.uengine.uml.model.Class" && element.isAggregateRoot)
                    return element
            }
        }

        const applyToEnumeration = (modelValue, userInfo, query) => {
            const createEnumeration = (query) => {
                const getEnumerationBase = (name, items, x, y, elementUUID) => {
                    const elementUUIDtoUse = elementUUID ? elementUUID : getUUID()
                    return {
                        "_type": "org.uengine.uml.model.enum",
                        "id": elementUUIDtoUse,
                        "name": name,
                        "nameCamelCase": changeCase.camelCase(name),
                        "namePascalCase": changeCase.pascalCase(name),
                        "elementView": {
                            "_type": "org.uengine.uml.model.enum",
                            "id": elementUUIDtoUse,
                            "x": x,
                            "y": y,
                            "width": 200,
                            "height": 100,
                            "style": "{}",
                            "titleH": 50,
                            "subEdgeH": 50
                        },
                        "selected": false,
                        "items": items,
                        "useKeyValue": false,
                        "relations": []
                    }
                }
    
                const getValidPosition = (modelValue, query) => {
                    const getRelatedEnumerations = (modelValue, query) => {
                        let relatedEnums = []
                        for(const element of Object.values(getEntitiesForAggregate(modelValue, query.ids.aggregateId).elements)) {
                            if(element && element._type === "org.uengine.uml.model.enum")
                                relatedEnums.push(element)
                        }
                        return relatedEnums
                    }

                    const relatedEnums = getRelatedEnumerations(modelValue, query)
                    return {x: 350 + (relatedEnums.length * 250), y: 400}
                }
    
                callbacks.afterAllObjectAppliedCallBacks.push((modelValue) => {
                    const enumObject = getEnumerationBase(
                        query.args.enumerationName, 
                        query.args.properties.map(property => {return {"value": property.name}}),
                        0, 0
                    )
    
                    const VALID_POSITION = getValidPosition(modelValue, query)
                    enumObject.elementView.x = VALID_POSITION.x
                    enumObject.elementView.y = VALID_POSITION.y

                    let entities = getEntitiesForAggregate(modelValue, query.ids.aggregateId)
                    entities.elements[enumObject.id] = enumObject

                    const RELATION_OBJECT = makeUMLRelationObjectBase(getRootAggregate(modelValue.elements[query.ids.aggregateId]), entities.elements[enumObject.id]) 
                    entities.relations[RELATION_OBJECT.id] = RELATION_OBJECT
                })
            }

            switch(query.action) {
                case "update":
                    if(!modelValue.elements[query.ids.enumerationId]) createEnumeration(query);
                    break;
            }
        }

        const applyToValueObject = (modelValue, userInfo, query) => {
            const createValueObject = (query) => {
                const getValueObjectBase = (name, fieldDescriptors, x, y, elementUUID) => {
                    const elementUUIDtoUse = elementUUID ? elementUUID : getUUID()
                    return {
                        "_type": "org.uengine.uml.model.vo.Class",
                        "id": elementUUIDtoUse,
                        "name": name,
                        "namePascalCase": changeCase.pascalCase(name),
                        "nameCamelCase": changeCase.camelCase(name),
                        "fieldDescriptors": fieldDescriptors,
                        "operations": [],
                        "elementView": {
                            "_type": "org.uengine.uml.model.vo.address.Class",
                            "id": elementUUIDtoUse,
                            "x": x,
                            "y": y,
                            "width": 200,
                            "height": 100,
                            "style": "{}",
                            "titleH": 50,
                            "subEdgeH": 170,
                            "fieldH": 150,
                            "methodH": 30
                        },
                        "selected": false,
                        "parentOperations": [],
                        "relationType": null,
                        "isVO": true,
                        "relations": [],
                        "groupElement": null,
                        "isAggregateRoot": false,
                        "namePlural": name+ "s",
                        "isAbstract": false,
                        "isInterface": false
                    }
                }
    
                const getFileDescriptors = (queryProperties) => {
                    return queryProperties.map((property) => {
                        return {
                            "className": property.type,
                            "isKey": property.isKey,
                            "label": "- " + property.name + ": " + property.type,
                            "name": property.name,
                            "nameCamelCase": changeCase.pascalCase(property.name),
                            "namePascalCase": changeCase.camelCase(property.name),
                            "_type": "org.uengine.model.FieldDescriptor"
                        }
                    })
                }

                const getValidPosition = (modelValue, query) => {
                    const getRelatedValueObjects = (modelValue, query) => {
                        let relatedEnums = []
                        for(const element of Object.values(getEntitiesForAggregate(modelValue, query.ids.aggregateId).elements)) {
                            if(element && element._type === "org.uengine.uml.model.vo.Class")
                                relatedEnums.push(element)
                        }
                        return relatedEnums
                    }

                    const relatedValueObjects = getRelatedValueObjects(modelValue, query)
                    return {x: 350 + (relatedValueObjects.length * 250), y: 600}
                }

                callbacks.afterAllObjectAppliedCallBacks.push((modelValue) => {
                    const valueObject = getValueObjectBase(
                        query.args.valueObjectName, 
                        getFileDescriptors(query.args.properties),
                        0, 0
                    )
    
                    const VALID_POSITION = getValidPosition(modelValue, query)
                    valueObject.elementView.x = VALID_POSITION.x
                    valueObject.elementView.y = VALID_POSITION.y

                    let entities = getEntitiesForAggregate(modelValue, query.ids.aggregateId)
                    entities.elements[valueObject.id] = valueObject

                    const RELATION_OBJECT = makeUMLRelationObjectBase(entities.elements[valueObject.id], getRootAggregate(modelValue.elements[query.ids.aggregateId]))
                    entities.relations[RELATION_OBJECT.id] = RELATION_OBJECT
                })
            }

            switch(query.action) {
                case "update":
                    if(!modelValue.elements[query.ids.valueObjectId]) createValueObject(query);
                    break;
            }
        }


        if(this.isApplied)
            return callbacks

        switch(this.query.objectType) {
            case "BoundedContext":
                applyToBoundedContext(modelValue, userInfo, this.query);
                break
            case "Aggregate":
                applyToAggregate(modelValue, userInfo, this.query);
                break
            case "Event":
                applyToEvent(modelValue, userInfo, this.query);
                break
            case "Command":
                applyToCommand(modelValue, userInfo, this.query);
                break
            case "Enumeration":
                applyToEnumeration(modelValue, userInfo, this.query);
                break
            case "ValueObject":
                applyToValueObject(modelValue, userInfo, this.query);
                break
        }

        this.isApplied = true;
        return callbacks
    }

    toSaveObject() {
        return {
            query: this.query,
            isApplied: this.isApplied
        }
    }

    static fromSaveObject(saveObject) {
        let transactionQuery = new DebeziumTransactionQuery() 
        transactionQuery.query = saveObject.query;
        transactionQuery.isApplied = saveObject.isApplied;
        return transactionQuery;
    }
}

export default DebeziumTransactionManager;