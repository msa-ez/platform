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
        let objectAliaToUUID = {}

        this.transactions.forEach(transaction => {
            const transactionCallbacks = transaction.apply(modelValue, userInfo, objectAliaToUUID)
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

    apply(modelValue, userInfo, objectAliaToUUID) {
        const fixTransactionQueryErrors = (modelValue, usecases, queries) => {
            const addBoundedContextQueryIfNotExist = (modelValue, usecases, queries) => {
                const createNewBoundedContextQuery = (usecaseId, queryId, boundedContextId, boundedContextName) => {
                    return new DebeziumTransactionQuery({
                        "fromUsecaseId": usecaseId,
                        "queryId": queryId,
                        
                        "objectType": "BoundedContext",
                        "action": "update",
                        "ids": {
                            "boundedContextId": boundedContextId
                        },
                        "args": {
                            "boundedContextName": boundedContextName
                        }
                    })
                }

                const aggregateQueries = queries.filter(query => query.query.objectType === "Aggregate")
                if(aggregateQueries.length === 0) return

                aggregateQueries.forEach(aggregateQuery => {
                    const boundedContextId = aggregateQuery.query.ids.boundedContextId
                    if(modelValue.elements[boundedContextId]) return

                    const boundedContextQuery = queries.filter(query => query.query.objectType === "BoundedContext" && query.query.ids.boundedContextId === boundedContextId)
                    if(boundedContextQuery.length > 0) return

                    const queryId = `query-${boundedContextId}`
                    usecases.relatedBoundedContextQueryIds.push(queryId)
                    queries.unshift(createNewBoundedContextQuery(usecases.id, queryId, boundedContextId, usecases.displayName.split(" ").pop() + "Service"))
                })
            }

            addBoundedContextQueryIfNotExist(modelValue, usecases, queries)
        }

        let callbacks = {
            afterAllObjectAppliedCallBacks: [],
            afterAllRelationAppliedCallBacks: []
        }

        fixTransactionQueryErrors(modelValue, this.usecase, this.queries)
        this.queries.forEach(query => {
            const queryCallbacks = query.apply(modelValue, userInfo, objectAliaToUUID)
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
    constructor(query, isApplied, objectAlias, lastOp) {
        this.query = query ? query : {};
        this.isApplied = isApplied ? isApplied : false;
        this.objectAlias = objectAlias ? objectAlias : null;
        this.lastOp = lastOp ? lastOp : null;
    }

    toStringObject() {
        const boundContextQueryToString = (query) => {
            switch(this.lastOp) {
                case "create":
                    return `Create New ${this.objectAlias ? this.objectAlias : query.ids.boundedContextId} Bounded Context`;
                case "update":
                    return `Update ${this.objectAlias ? this.objectAlias : query.ids.boundedContextId} Bounded Context`;
                case "delete":
                    return `Delete ${this.objectAlias ? this.objectAlias : query.ids.boundedContextId} Bounded Context`;
            }
        }

        const aggregateQueryToString = (query) => {
            switch(this.lastOp) {
                case "create":
                    return `Create New ${this.objectAlias ? this.objectAlias : query.ids.aggregateId} Aggregate`;
                case "update":
                    return `Update ${this.objectAlias ? this.objectAlias : query.ids.aggregateId} Aggregate`;
                case "delete":
                    return `Delete ${this.objectAlias ? this.objectAlias : query.ids.aggregateId} Aggregate ${(query.args && query.args.properties) ? "Property" : ""}`;
            }
        }

        const commandQueryToString = (query) => {
            switch(this.lastOp) {
                case "create":
                    return `Create New ${this.objectAlias ? this.objectAlias : query.ids.commandId} Command`;
                case "update":
                    return `Update ${this.objectAlias ? this.objectAlias : query.ids.commandId} Command`;
                case "delete":
                    return `Delete ${this.objectAlias ? this.objectAlias : query.ids.commandId} Command`;
            }
        }

        const eventQueryToString = (query) => {
            switch(this.lastOp) {
                case "create":
                    return `Create New ${this.objectAlias ? this.objectAlias : query.ids.eventId} Event`;
                case "update":
                    return `Update ${this.objectAlias ? this.objectAlias : query.ids.eventId} Event`;
                case "delete":
                    return `Delete ${this.objectAlias ? this.objectAlias : query.ids.eventId} Event`;
            }
        }

        const enumerationQueryToString = (query) => {
            switch(this.lastOp) {
                case "create":
                    return `Create New ${this.objectAlias ? this.objectAlias : query.ids.enumerationId} Enumeration in ${query.ids.aggregateId} Aggregate`;
                case "update":
                    return `Update ${this.objectAlias ? this.objectAlias : query.ids.enumerationId} Enumeration in ${query.ids.aggregateId} Aggregate`;
                case "delete":
                    return `Delete ${this.objectAlias ? this.objectAlias : query.ids.enumerationId} Enumeration in ${query.ids.aggregateId} Aggregate`;
            }
        }

        const valueObjectQueryToString = (query) => {
            switch(this.lastOp) {
                case "create":
                    return `Create New ${this.objectAlias ? this.objectAlias : query.ids.valueObjectId} Value Object in ${query.ids.aggregateId} Aggregate`;
                case "update":
                    return `Update ${this.objectAlias ? this.objectAlias : query.ids.valueObjectId} Value Object in ${query.ids.aggregateId} Aggregate`;
                case "delete":
                    return `Delete ${this.objectAlias ? this.objectAlias : query.ids.valueObjectId} Value Object in ${query.ids.aggregateId} Aggregate`;
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

    apply(modelValue, userInfo, objectAliaToUUID) {
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

        const getUUIDFromAlias = (modelValue, objectAliaToUUID, targetObject, targetProperty) => {        
            if(modelValue.elements[targetObject[targetProperty]]) return

            if(!objectAliaToUUID[targetObject[targetProperty]])
                objectAliaToUUID[targetObject[targetProperty]] = getUUID()
            targetObject[targetProperty] = objectAliaToUUID[targetObject[targetProperty]]
        }


        const clearRelatedPolicies = (modelValue, objectId, fromType="event") => {
            if(fromType === "event") {

                for(const toPolicyRelation of Object.values(modelValue.relations)) {
                    if(toPolicyRelation && toPolicyRelation._type === "org.uengine.modeling.model.Relation" &&
                        toPolicyRelation.from === objectId && toPolicyRelation.targetElement._type === "org.uengine.modeling.model.Policy") {
                        
                        for(const toCommandRelation of Object.values(modelValue.relations)) {
                            if(toCommandRelation && toCommandRelation._type === "org.uengine.modeling.model.Relation" &&
                                toCommandRelation.from === toPolicyRelation.to && toCommandRelation.targetElement._type === "org.uengine.modeling.model.Command") {
                                delete modelValue.relations[toCommandRelation.id]
                            }
                        }
                        
                        delete modelValue.relations[toPolicyRelation.id]
                        delete modelValue.elements[toPolicyRelation.to]
                    }
                }

            }
            else if(fromType === "command") {

                for(const toCommandRelation of Object.values(modelValue.relations)) {
                    if(toCommandRelation && toCommandRelation._type === "org.uengine.modeling.model.Relation" &&
                        toCommandRelation.to === objectId && toCommandRelation.sourceElement._type === "org.uengine.modeling.model.Policy") {
                        
                        for(const toPolicyRelation of Object.values(modelValue.relations)) {
                            if(toPolicyRelation && toPolicyRelation._type === "org.uengine.modeling.model.Relation" &&
                                toPolicyRelation.to === toCommandRelation.from && toPolicyRelation.sourceElement._type === "org.uengine.modeling.model.Event") {
                                delete modelValue.relations[toPolicyRelation.id]
                            }
                        }

                        delete modelValue.relations[toCommandRelation.id]
                        delete modelValue.elements[toCommandRelation.from]
                    }
                }

            }
        }

        const deleteEvent = (modelValue, query) => {
            const deleteCommandToEventRelations = (modelValue, eventId) => {
                for(const toEventRelation of Object.values(modelValue.relations)) {
                    if(toEventRelation && toEventRelation._type === "org.uengine.modeling.model.Relation" && 
                    toEventRelation.to === eventId && toEventRelation.sourceElement._type === "org.uengine.modeling.model.Command") {
                        delete modelValue.relations[toEventRelation.id]
                    }
                }
            }

            clearRelatedPolicies(modelValue, query.ids.eventId)
            deleteCommandToEventRelations(modelValue, query.ids.eventId)
            delete modelValue.elements[query.ids.eventId]
        }

        const getRelatedActor = (modelValue, commandId) => {
            const commandObject = modelValue.elements[commandId]
            if(!commandObject) return

            for(const actorObject of Object.values(modelValue.elements)) {
                if(actorObject && actorObject.boundedContext &&
                   actorObject.boundedContext.id === commandObject.boundedContext.id &&
                   actorObject._type === "org.uengine.modeling.model.Actor" &&
                   (commandObject.elementView.x - 200 <= actorObject.elementView.x && actorObject.elementView.x <= commandObject.elementView.x) &&
                   (commandObject.elementView.y - Math.round(commandObject.elementView.width/2) <= actorObject.elementView.y && actorObject.elementView.y <= commandObject.elementView.y + Math.round(commandObject.elementView.width/2))
                   ) {
                    return actorObject
                }
            }
        }

        const deleteActor = (modelValue, commandId) => {
            const relatedActor = getRelatedActor(modelValue, commandId)
            if(!relatedActor) return
            delete modelValue.elements[relatedActor.id]
        }

        const deleteCommand = (modelValue, query) => {
            const deleteCommandToEventRelation = (modelValue, commandId) => {
                for(const toEventRelation of Object.values(modelValue.relations)) {
                    if(toEventRelation && toEventRelation._type === "org.uengine.modeling.model.Relation" && 
                    toEventRelation.from === commandId && toEventRelation.targetElement._type === "org.uengine.modeling.model.Event") {
                        delete modelValue.relations[toEventRelation.id]
                    }
                }  
            }

            deleteCommandToEventRelation(modelValue, query.ids.commandId)
            clearRelatedPolicies(modelValue, query.ids.commandId, "command")
            deleteActor(modelValue, query.ids.commandId)
            delete modelValue.elements[query.ids.commandId]
        }

        const getAggregateRootObject = (aggregateObject) => {
            if(!aggregateObject.aggregateRoot || !aggregateObject.aggregateRoot.entities || !aggregateObject.aggregateRoot.entities.elements) return null
            return Object.values(aggregateObject.aggregateRoot.entities.elements).find(entity => entity.isAggregateRoot)
        }

        const deleteAggregateOrProperty = (modelValue, query) => {
            const deleteAggregateProperty = (modelValue, query) => {
                const aggregateObject = modelValue.elements[query.ids.aggregateId]
                const aggregateRoot = getAggregateRootObject(aggregateObject)
                const propertyNameToFilter = query.args.properties.map(property => property.name)
    
                aggregateObject.aggregateRoot.fieldDescriptors = aggregateObject.aggregateRoot.fieldDescriptors.filter(fd => !propertyNameToFilter.includes(fd.name))
                if(aggregateRoot) aggregateRoot.fieldDescriptors = aggregateRoot.fieldDescriptors.filter(fd => !propertyNameToFilter.includes(fd.name))
            
                for(const element of Object.values(modelValue.elements)) {
                    if(element && element.aggregate && element.aggregate.id === aggregateObject.id) {
                        if(element._type === "org.uengine.modeling.model.Command" || 
                            element._type === "org.uengine.modeling.model.Event") {
                            element.fieldDescriptors = element.fieldDescriptors.filter(fd => !propertyNameToFilter.includes(fd.name))
                        }
                    }
                }
            }

            const deleteAggregate = (modelValue, query) => {
                for(const element of Object.values(modelValue.elements)) {
                    if(element && element.aggregate && element.aggregate.id === query.ids.aggregateId) {
                        if(element._type === "org.uengine.modeling.model.Event") {
                            deleteEvent(modelValue, {ids:{eventId:element.id}})
                        }
                        else if(element._type === "org.uengine.modeling.model.Command") {
                            deleteCommand(modelValue, {ids:{commandId:element.id}})
                        }
                    }
                }

                delete modelValue.elements[query.ids.aggregateId]
            }

            if(query.args && query.args.properties) deleteAggregateProperty(modelValue, query)
            else deleteAggregate(modelValue, query)
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

        const applyToBoundedContext = (modelValue, userInfo, objectAliaToUUID, query) => {
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
                    const getMaxXBoundedContextInMaxYRange = (boundedContexts) => {
                        const maxY = Math.max(...boundedContexts.map(bc => bc.elementView.y))
                        const maxYBoundedContext = boundedContexts.filter(bc => bc.elementView.y === maxY)[0]
    
                        let boundContextsInMaxYRange = []
                        for(let boundedContext of boundedContexts) {
                            if(boundedContext.elementView.y >= maxYBoundedContext.elementView.y - maxYBoundedContext.elementView.height/2 &&
                               boundedContext.elementView.y <= maxYBoundedContext.elementView.y + maxYBoundedContext.elementView.height/2)
                                boundContextsInMaxYRange.push(boundedContext)
                        }

                        let maxXPos = Math.max(...boundContextsInMaxYRange.map(bc => bc.elementView.x))
                        return boundContextsInMaxYRange.filter(bc => bc.elementView.x === maxXPos)[0]
                    }

                    const BOUNDED_CONTEXT_MAX_X_LIMIT = 1750
                    const boundedContexts = getAllBoundedContexts(modelValue)
                    if(boundedContexts.length <= 0) return {x: 450, y: 450}

                    const maxXBoundedContextInMaxYRange = getMaxXBoundedContextInMaxYRange(boundedContexts)
                    const xPosInMaxYRange = maxXBoundedContextInMaxYRange.elementView.x + maxXBoundedContextInMaxYRange.elementView.width/2 + 
                                            boundedContextObject.elementView.width/2 + 25
                    
                    if(xPosInMaxYRange <= BOUNDED_CONTEXT_MAX_X_LIMIT)
                        return {x: xPosInMaxYRange, y: maxXBoundedContextInMaxYRange.elementView.y}
                    else
                        return {x: 450, y: maxXBoundedContextInMaxYRange.elementView.y + maxXBoundedContextInMaxYRange.elementView.height/2 + boundedContextObject.elementView.height/2 + 25}
                }

                
                let boundedContextObject = getBoundedContextBase(
                    userInfo, query.args.boundedContextName, "", 
                    getValidPortNumber(modelValue), 0, 0, query.ids.boundedContextId
                )

                const VALID_POSITION = getValidPosition(modelValue, boundedContextObject)
                boundedContextObject.elementView.x = VALID_POSITION.x
                boundedContextObject.elementView.y = VALID_POSITION.y

                modelValue.elements[boundedContextObject.id] = boundedContextObject     
            }

            const updateBoundedContext = (modelValue, query) => {
                const boundedContextObject = modelValue.elements[query.ids.boundedContextId]
                if(query.args.boundedContextName) boundedContextObject.name = query.args.boundedContextName
            }

            const deleteBoundedContext = (modelValue, query) => {
                for(const element of Object.values(modelValue.elements)) {
                    if(element && element.boundedContext && element.boundedContext.id === query.ids.boundedContextId) {
                        deleteAggregateOrProperty(modelValue, {ids:{aggregateId:element.id}})
                    }
                }

                delete modelValue.elements[query.ids.boundedContextId]
            }

            const initObjectAlias = (modelValue, query) => {
                if(modelValue.elements[query.ids.boundedContextId])
                    this.objectAlias = modelValue.elements[query.ids.boundedContextId].name
                else
                    callbacks.afterAllObjectAppliedCallBacks.push(() => {
                        this.objectAlias = modelValue.elements[query.ids.boundedContextId] ? modelValue.elements[query.ids.boundedContextId].name : null
                    })
            }

            const convertAliasToUUID = (modelValue, objectAliaToUUID, query) => {
                getUUIDFromAlias(modelValue, objectAliaToUUID, query.ids, "boundedContextId")
            }

            initObjectAlias(modelValue, query)
            convertAliasToUUID(modelValue, objectAliaToUUID, query)
            switch(query.action) {
                case "update":
                    if(modelValue.elements[query.ids.boundedContextId]) {
                        updateBoundedContext(modelValue, query)
                        this.lastOp = "update"
                    }
                    else {
                        createNewBoundedContext(modelValue, userInfo, query)
                        this.lastOp = "create"
                    }
                    break;
                
                case "delete":
                    deleteBoundedContext(modelValue, query)
                    this.lastOp = "delete"
                    break;
            }
        }

        const applyToAggregate = (modelValue, userInfo, objectAliaToUUID, query) => {
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

                const makePrimaryKeyPropertyIfNotExists = (properties) => {
                    if(properties.find(property => property.isKey)) return properties
                    return [{name: "id", type: "Long", isKey: true}].concat(properties)
                }

                const getFileDescriptors = (queryProperties) => {
                    return queryProperties.map((property) => {
                        return {
                            "className": property.type ? property.type : "String",
                            "isCopy": false,
                            "isKey": property.isKey ? true : false,
                            "name": property.name,
                            "nameCamelCase": changeCase.camelCase(property.name),
                            "namePascalCase": changeCase.pascalCase(property.name),
                            "displayName": "",
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
                            "className": property.type ? property.type : "String",
                            "isCopy": false,
                            "isKey": property.isKey ? true : false,
                            "name": property.name,
                            "displayName": "",
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
                    userInfo, query.args.aggregateName, "", 
                    query.ids.boundedContextId, 0, 0, query.ids.aggregateId
                )

                const VALID_POSITION = getValidPosition(modelValue, query, aggregateObject)
                aggregateObject.elementView.x = VALID_POSITION.x
                aggregateObject.elementView.y = VALID_POSITION.y

                query.args.properties = makePrimaryKeyPropertyIfNotExists(query.args.properties)
                aggregateObject.aggregateRoot.fieldDescriptors = getFileDescriptors(query.args.properties)
                relocateUIPositions(modelValue, query, aggregateObject)
                modelValue.elements[aggregateObject.id] = aggregateObject


                const rootAggregateObject = getRootAggregateBase(query.args.aggregateName, aggregateObject.id,
                    getFileDescriptorsForRootAggegate(query.args.properties)
                )
                aggregateObject.aggregateRoot.entities.elements[rootAggregateObject.id] = rootAggregateObject
            }

            const updateAggregate = (modelValue, query) => {
                const updateName = (aggregateObject, aggregateRoot, name) => {
                    aggregateObject.name = name
                    aggregateObject.displayName = ""
                    aggregateObject.nameCamelCase = changeCase.camelCase(name)
                    aggregateObject.namePascalCase = changeCase.pascalCase(name)

                    if(aggregateRoot) {
                        aggregateRoot.name = name
                        aggregateRoot.nameCamelCase = changeCase.camelCase(name)
                        aggregateRoot.namePascalCase = changeCase.pascalCase(name)
                        aggregateRoot.namePlural = name + "s"
                    }
                }

                const updateProperties = (modelValue, aggregateObject, aggregateRoot, properties) => {
                    const updateFieldDescriptors = (fieldDescriptors, property, isAggregateRoot=false) => {
                        const fieldDescriptor = fieldDescriptors.find(fd => fd.name === property.name)
                        if(fieldDescriptor) {
                            if(property.type) fieldDescriptor.className = property.type
                            if(property.isKey) fieldDescriptor.isKey = property.isKey
                        } else {
                            if(isAggregateRoot) {
                                fieldDescriptors.push({
                                    "className": property.type ? property.type : "String",
                                    "isCopy": false,
                                    "isKey": property.isKey ? true : false,
                                    "name": property.name,
                                    "nameCamelCase": changeCase.camelCase(property.name),
                                    "namePascalCase": changeCase.pascalCase(property.name),
                                    "displayName": "",
                                    "_type": "org.uengine.model.FieldDescriptor",
                                    "inputUI": null,
                                    "options": null
                                })
                            }
                            else {
                                fieldDescriptors.push({
                                    "className": property.type ? property.type : "String",
                                    "isCopy": false,
                                    "isKey": property.isKey ? true : false,
                                    "name": property.name,
                                    "nameCamelCase": changeCase.camelCase(property.name),
                                    "namePascalCase": changeCase.pascalCase(property.name),
                                    "displayName": "",
                                    "_type": "org.uengine.model.FieldDescriptor"
                                })
                            }
                        }
                    }

                    for(const property of properties) {
                        updateFieldDescriptors(aggregateObject.aggregateRoot.fieldDescriptors, property)
                        if(aggregateRoot) updateFieldDescriptors(aggregateRoot.fieldDescriptors, property, true)

                        for(const element of Object.values(modelValue.elements)) {
                            if(element && element.aggregate && element.aggregate.id === aggregateObject.id) {
                                if(element._type === "org.uengine.modeling.model.Command" || 
                                   element._type === "org.uengine.modeling.model.Event") {
                                    updateFieldDescriptors(element.fieldDescriptors, property)
                                }
                            }
                        }
                    }
                }

                const aggregateObject = modelValue.elements[query.ids.aggregateId]
                const aggregateRoot = getAggregateRootObject(aggregateObject)
                if(query.args.aggregateName) updateName(aggregateObject, aggregateRoot, query.args.aggregateName)
                if(query.args.properties) updateProperties(modelValue, aggregateObject, aggregateRoot, query.args.properties)
            }

            const initObjectAlias = (modelValue, query) => {
                if(modelValue.elements[query.ids.aggregateId])
                    this.objectAlias = modelValue.elements[query.ids.aggregateId].name
                else
                    callbacks.afterAllObjectAppliedCallBacks.push(() => {
                        this.objectAlias = modelValue.elements[query.ids.aggregateId] ? modelValue.elements[query.ids.aggregateId].name : null
                    })
            }

            const convertAliasToUUID = (modelValue, objectAliaToUUID, query) => {
                getUUIDFromAlias(modelValue, objectAliaToUUID, query.ids, "boundedContextId")
                getUUIDFromAlias(modelValue, objectAliaToUUID, query.ids, "aggregateId")
            }

            initObjectAlias(modelValue, query)
            convertAliasToUUID(modelValue, objectAliaToUUID, query)
            switch(query.action) {
                case "update":
                    if(modelValue.elements[query.ids.aggregateId]) {
                        updateAggregate(modelValue, query)
                        this.lastOp = "update"
                    }
                    else {
                        createNewAggregate(modelValue, userInfo, query)
                        this.lastOp = "create"
                    }
                    break;
                
                case "delete":
                    deleteAggregateOrProperty(modelValue, query)
                    this.lastOp = "delete"
                    break;
            }
        }

        const applyToEvent = (modelValue, userInfo, objectAliaToUUID, query) => {
            const createNewPolicy = (modelValue, userInfo, eventObject, commandId, updateReason) => {
                const getPolicyBase = (userInfo, name, displayName, boundedContextId, updateReason, x, y, elementUUID) => {
                    const elementUUIDtoUse = elementUUID ? elementUUID : getUUID()
                    return {
                        id: elementUUIDtoUse,
                        author: userInfo.uid,
                        boundedContext: {
                            id: boundedContextId
                        },
                        description: updateReason ? updateReason : null,
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
                    commandObject.boundedContext.id, updateReason, 0, 0
                )

                modelValue.elements[policyObject.id] = policyObject

                makeEventToPolicyRelation(modelValue, eventObject, policyObject)
                makePolicyToCommandRelation(modelValue, policyObject, commandObject)

                const VALID_POSITION = getValidPosition(modelValue, commandObject.aggregate.id, policyObject)
                policyObject.elementView.x = VALID_POSITION.x
                policyObject.elementView.y = VALID_POSITION.y
            }

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
                            "isKey": property.isKey ? true : false,
                            "name": property.name,
                            "nameCamelCase": property.nameCamelCase,
                            "namePascalCase": property.namePascalCase,
                            "displayName": property.displayName,
                            "_type": "org.uengine.model.FieldDescriptor"
                        }
                    })
                }

                const eventObject = getEventBase(
                    userInfo, query.args.eventName, "", 
                    query.ids.boundedContextId, query.ids.aggregateId, 0, 0, query.ids.eventId
                )

                const VALID_POSITION = getValidPosition(modelValue, query, eventObject)
                eventObject.elementView.x = VALID_POSITION.x
                eventObject.elementView.y = VALID_POSITION.y

                eventObject.fieldDescriptors = getFileDescriptors(modelValue, query)
                modelValue.elements[eventObject.id] = eventObject

                if(query.args.outputCommandIds) {
                    callbacks.afterAllObjectAppliedCallBacks.push((modelValue) => {
                        query.args.outputCommandIds.forEach(outputCommandId => {
                            createNewPolicy(modelValue, userInfo, eventObject, outputCommandId.commandId, outputCommandId.reason)
                        })
                    })
                }
            }

            const updateEvent = (modelValue, userInfo, query) => {
                const updateName = (eventObject, name) => {
                    eventObject.name = name
                    eventObject.displayName = ""
                    eventObject.nameCamelCase = changeCase.camelCase(name)
                    eventObject.namePascalCase = changeCase.pascalCase(name)
                }

                const updatePolicy = (modelValue, userInfo, eventObject, outputCommandIds) => {
                    clearRelatedPolicies(modelValue, eventObject.id)
                    outputCommandIds.forEach(outputCommandId => {
                        createNewPolicy(modelValue, userInfo, eventObject, outputCommandId.commandId, outputCommandId.reason)
                    })
                }

                const eventObject = modelValue.elements[query.ids.eventId]
                if(query.args.eventName) updateName(eventObject, query.args.eventName)
                if(query.args.outputCommandIds) updatePolicy(modelValue, userInfo, eventObject, query.args.outputCommandIds)
            }

            const initObjectAlias = (modelValue, query) => {
                if(modelValue.elements[query.ids.eventId])
                    this.objectAlias = modelValue.elements[query.ids.eventId].name
                else
                    callbacks.afterAllObjectAppliedCallBacks.push(() => {
                        this.objectAlias = modelValue.elements[query.ids.eventId] ? modelValue.elements[query.ids.eventId].name : null
                    })
            }

            const convertAliasToUUID = (modelValue, objectAliaToUUID, query) => {
                getUUIDFromAlias(modelValue, objectAliaToUUID, query.ids, "boundedContextId")
                getUUIDFromAlias(modelValue, objectAliaToUUID, query.ids, "aggregateId")
                getUUIDFromAlias(modelValue, objectAliaToUUID, query.ids, "eventId")

                if(query.args && query.args.outputCommandIds) {
                    query.args.outputCommandIds = query.args.outputCommandIds.map(outputCommandId => {
                        const commandId = outputCommandId.commandId
                        if(modelValue.elements[commandId]) return {
                            commandId: commandId,
                            relatedAttribute: outputCommandId.relatedAttribute,
                            reason: outputCommandId.reason
                        }

                        if(!objectAliaToUUID[commandId])
                            objectAliaToUUID[commandId] = getUUID()
                        return {
                            commandId: objectAliaToUUID[commandId],
                            relatedAttribute: outputCommandId.relatedAttribute,
                            reason: outputCommandId.reason
                        }
                    })
                }
            }

            initObjectAlias(modelValue, query)
            convertAliasToUUID(modelValue, objectAliaToUUID, query)
            switch(query.action) {
                case "update":
                    if(modelValue.elements[query.ids.eventId]) {
                        updateEvent(modelValue, userInfo, query)
                        this.lastOp = "update"
                    }
                    else {
                        createNewEvent(modelValue, userInfo, query)
                        this.lastOp = "create"
                    }
                    break;
                
                case "delete":
                    deleteEvent(modelValue, query)
                    this.lastOp = "delete"
                    break;
            }
        }

        const applyToCommand = (modelValue, userInfo, objectAliaToUUID, query) => {
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
                            "isKey": property.isKey ? true : false,
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
                    userInfo, query.args.commandName, "", 
                    query.args.api_verb, [], query.ids.boundedContextId,
                    query.ids.aggregateId, 0, 0, query.ids.commandId
                )
                
                if(query.args.outputEventIds) {
                    callbacks.afterAllObjectAppliedCallBacks.push((modelValue) => {
                        commandObject.outputEvents = getOutputEventNames(modelValue, query.args.outputEventIds)
                    })
                } else
                    commandObject.outputEvents = []

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

            const updateCommand = (modelValue, query) => {
                const updateName = (commandObject, name) => {
                    commandObject.name = name
                    commandObject.displayName = ""
                    commandObject.nameCamelCase = changeCase.camelCase(name)
                    commandObject.namePascalCase = changeCase.pascalCase(name)
                }

                const updateOutputEventIds = (commandObject, outputEventIds) => {
                    for(const toEventRelation of Object.values(modelValue.relations)) {
                        if(toEventRelation && toEventRelation._type === "org.uengine.modeling.model.Relation" &&
                           toEventRelation.from === commandObject.id && toEventRelation.targetElement._type === "org.uengine.modeling.model.Event") {
                           delete modelValue.relations[toEventRelation.id]
                        }
                    }

                    outputEventIds.forEach(eventId => {
                        const eventObject = modelValue.elements[eventId]
                        const commandEventRelation = makeEventStormingRelationObjectBase(commandObject, eventObject)
                        modelValue.relations[commandEventRelation.id] = commandEventRelation
                    })
                }

                const commandObject = modelValue.elements[query.ids.commandId]
                if(query.args.commandName) updateName(commandObject, query.args.commandName)
                if(query.args.api_verb) {
                    commandObject.controllerInfo.method = query.args.api_verb
                    commandObject.isRestRepository = (query.args.api_verb == 'PUT' ? false : true)
                }
                if(query.args.actor) {
                    const relatedActor = getRelatedActor(modelValue, commandObject.id)
                    if(relatedActor) relatedActor.name = query.args.actor
                }
                if(query.args.outputEventIds) updateOutputEventIds(commandObject, query.args.outputEventIds)
            }

            const initObjectAlias = (modelValue, query) => {
                if(modelValue.elements[query.ids.commandId])
                    this.objectAlias = modelValue.elements[query.ids.commandId].name
                else
                    callbacks.afterAllObjectAppliedCallBacks.push(() => {
                        this.objectAlias = modelValue.elements[query.ids.commandId] ? modelValue.elements[query.ids.commandId].name : null
                    })
            }

            const convertAliasToUUID = (modelValue, objectAliaToUUID, query) => {
                getUUIDFromAlias(modelValue, objectAliaToUUID, query.ids, "boundedContextId")
                getUUIDFromAlias(modelValue, objectAliaToUUID, query.ids, "aggregateId")
                getUUIDFromAlias(modelValue, objectAliaToUUID, query.ids, "commandId")

                if(query.args && query.args.outputEventIds) {
                    query.args.outputEventIds = query.args.outputEventIds.map(eventId => {
                        if(modelValue.elements[eventId]) return eventId

                        if(!objectAliaToUUID[eventId])
                            objectAliaToUUID[eventId] = getUUID()
                        return objectAliaToUUID[eventId]
                    })
                }
            }

            initObjectAlias(modelValue, query)
            convertAliasToUUID(modelValue, objectAliaToUUID, query)
            switch(query.action) {
                case "update":
                    if(modelValue.elements[query.ids.commandId]) {
                        updateCommand(modelValue, query)
                        this.lastOp = "update"
                    }
                    else {
                        createNewCommand(modelValue, userInfo, query)
                        this.lastOp = "create"
                    }
                    break;
                
                case "delete":
                    deleteCommand(modelValue, query)
                    this.lastOp = "delete"
                    break;
            }
        }


        const getEntitiesForAggregate = (modelValue, aggregateId) => {
            const entities = modelValue.elements[aggregateId].aggregateRoot.entities
            if(!entities.elements) entities.elements = {}
            if(!entities.relations) entities.relations = {}
            return entities
        }

        const deleteElementPropertyRelatedToAggregate = (modelValue, aggregateObject, targetObject) => {
            for(const element of Object.values(modelValue.elements)) {
                if(element && element.aggregate && element.aggregate.id === aggregateObject.id) {
                    if(element._type === "org.uengine.modeling.model.Command" || 
                        element._type === "org.uengine.modeling.model.Event") {
                        element.fieldDescriptors = element.fieldDescriptors.filter(property => property.className !== targetObject.name)
                    }
                }
            }
        }

        const deleteElementInAggegatePerfectly = (aggregateRootObject, targetObject) => {
            const deleteRelatedPropertiesInAggregate = (aggregateRootObject, targetObject) => {
                aggregateRootObject.fieldDescriptors = aggregateRootObject.fieldDescriptors.filter(property => property.className !== targetObject.name)
            
                const aggregateRootEntity = Object.values(aggregateRootObject.entities.elements).find(entity => entity.isAggregateRoot)
                if(!aggregateRootEntity) return
                aggregateRootEntity.fieldDescriptors = aggregateRootEntity.fieldDescriptors.filter(property => property.className !== targetObject.name)
            }
    
            const deleteRelationsInAggregate = (aggregateRootObject, targetObject) => {
                const targetEntites = aggregateRootObject.entities
                if(targetEntites.relations) {
                    for(let relation of Object.values(targetEntites.relations)) {
                        if(relation && relation.sourceElement && relation.targetElement) {
                            if(relation.sourceElement.id === targetObject.id || relation.targetElement.id === targetObject.id) {
                                delete targetEntites.relations[relation.id]
                            }
                        }
                    }
                }
            }
    
            const deleteElementInAggregate = (aggregateRootObject, targetObject) => {
                if(aggregateRootObject.entities && aggregateRootObject.entities.elements) {
                    delete aggregateRootObject.entities.elements[targetObject.id]
                }
            }

            deleteRelatedPropertiesInAggregate(aggregateRootObject, targetObject)
            deleteRelationsInAggregate(aggregateRootObject, targetObject)
            deleteElementInAggregate(aggregateRootObject, targetObject)
        }

        const applyToEnumeration = (modelValue, objectAliaToUUID, query) => {
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
                        0, 0,
                        query.ids.enumerationId
                    )
    
                    const VALID_POSITION = getValidPosition(modelValue, query)
                    enumObject.elementView.x = VALID_POSITION.x
                    enumObject.elementView.y = VALID_POSITION.y

                    let entities = getEntitiesForAggregate(modelValue, query.ids.aggregateId)
                    entities.elements[enumObject.id] = enumObject
                })
            }

            const updateEnumeration = (modelValue, enumerationObject, query) => {
                const updateName = (modelValue, enumerationObject, name) => {
                    const prevName = enumerationObject.name
                    enumerationObject.name = name
                    enumerationObject.nameCamelCase = changeCase.camelCase(name)
                    enumerationObject.namePascalCase = changeCase.pascalCase(name)


                    const aggregateObject = modelValue.elements[query.ids.aggregateId]
                    const aggregateRootObject = aggregateObject.aggregateRoot
                    if(!aggregateObject || !aggregateRootObject) return

                    const matchedProperty = aggregateRootObject.fieldDescriptors.find(property => property.className === prevName)
                    if(matchedProperty) matchedProperty.className = name

                    if(aggregateRootObject.entities && aggregateRootObject.entities.elements) {
                        const aggregateRootEntity = Object.values(aggregateRootObject.entities.elements).find(entity => entity.isAggregateRoot)
                        if(aggregateRootEntity) {
                            const matchedProperty = aggregateRootEntity.fieldDescriptors.find(property => property.className === prevName)
                            if(matchedProperty) matchedProperty.className = name
                        }
                    }

                    for(const element of Object.values(modelValue.elements)) {
                        if(element && element.aggregate && element.aggregate.id === aggregateObject.id) {
                            if(element._type === "org.uengine.modeling.model.Command" || 
                                element._type === "org.uengine.modeling.model.Event") {
                                const matchedProperty = element.fieldDescriptors.find(property => property.className === prevName)
                                if(matchedProperty) matchedProperty.className = name
                            }
                        }
                    }
                }

                const updateProperties = (enumerationObject, properties) => {
                    enumerationObject.items = [...enumerationObject.items, ...properties.map(property => {return {"value": property.name}})]
                }

                if(query.args.enumerationName) updateName(modelValue, enumerationObject, query.args.enumerationName)
                if(query.args.properties) updateProperties(enumerationObject, query.args.properties)
            }

            const deleteEnumeration = (modelValue, query) => {
                const aggregateObject = modelValue.elements[query.ids.aggregateId]
                const aggregateRootObject = aggregateObject.aggregateRoot
                if(!aggregateObject || !aggregateRootObject || !aggregateRootObject.entities || !aggregateRootObject.entities.elements) return
                
                const enumerationObject = aggregateRootObject.entities.elements[query.ids.enumerationId]
                if(!enumerationObject) return

                if(query.args && query.args.properties) {
                    const propertyNameToFilter = query.args.properties.map(property => property.name)
                    enumerationObject.items = enumerationObject.items.filter(item => !propertyNameToFilter.includes(item.value))
                }
                else {
                    deleteElementInAggegatePerfectly(aggregateRootObject, enumerationObject)
                    deleteElementPropertyRelatedToAggregate(modelValue, aggregateObject, enumerationObject)
                }
            }

            const initObjectAlias = (modelValue, query) => {
                if(modelValue.elements[query.ids.aggregateId] &&
                    modelValue.elements[query.ids.aggregateId].aggregateRoot &&
                    modelValue.elements[query.ids.aggregateId].aggregateRoot.entities &&
                    modelValue.elements[query.ids.aggregateId].aggregateRoot.entities.elements &&
                    modelValue.elements[query.ids.aggregateId].aggregateRoot.entities.elements[query.ids.enumerationId]
                 ) {

                    this.objectAlias = modelValue.elements[query.ids.aggregateId].aggregateRoot.entities.elements[query.ids.enumerationId].name
                } else
                    callbacks.afterAllObjectAppliedCallBacks.push(() => {
                        if(modelValue.elements[query.ids.aggregateId] &&
                            modelValue.elements[query.ids.aggregateId].aggregateRoot &&
                            modelValue.elements[query.ids.aggregateId].aggregateRoot.entities &&
                            modelValue.elements[query.ids.aggregateId].aggregateRoot.entities.elements &&
                            modelValue.elements[query.ids.aggregateId].aggregateRoot.entities.elements[query.ids.enumerationId]
                         )
                            this.objectAlias = modelValue.elements[query.ids.aggregateId].aggregateRoot.entities.elements[query.ids.enumerationId].name
                    })
            }

            const convertAliasToUUID = (modelValue, objectAliaToUUID, query) => {
                getUUIDFromAlias(modelValue, objectAliaToUUID, query.ids, "boundedContextId")
                getUUIDFromAlias(modelValue, objectAliaToUUID, query.ids, "aggregateId")
            }

            initObjectAlias(modelValue, query)
            convertAliasToUUID(modelValue, objectAliaToUUID, query)
            switch(query.action) {
                case "update":
                    const aggregateObject = modelValue.elements[query.ids.aggregateId]
                    const aggregateRootObject = aggregateObject.aggregateRoot
                    if(!aggregateObject || !aggregateRootObject || !aggregateRootObject.entities || !aggregateRootObject.entities.elements) return
                    const enumerationObject = aggregateRootObject.entities.elements[query.ids.enumerationId]

                    if(enumerationObject) {
                        updateEnumeration(modelValue, enumerationObject, query)
                        this.lastOp = "update"
                    }
                    else {
                        getUUIDFromAlias(modelValue, objectAliaToUUID, query.ids, "enumerationId")
                        createEnumeration(query)
                        this.lastOp = "create"
                    }
                    break

                case "delete":
                    deleteEnumeration(modelValue, query)
                    this.lastOp = "delete"
                    break
            }
        }

        const applyToValueObject = (modelValue, objectAliaToUUID, query) => {
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
                    return queryProperties.filter(property => !property.isForeignProperty).map((property) => {
                        return {
                            "className": property.type ? property.type : "String",
                            "isKey": property.isKey ? true : false,
                            "label": "- " + property.name + ": " + (property.type ? property.type : "String"),
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
                        0, 0, query.ids.valueObjectId
                    )
    
                    const VALID_POSITION = getValidPosition(modelValue, query)
                    valueObject.elementView.x = VALID_POSITION.x
                    valueObject.elementView.y = VALID_POSITION.y

                    let entities = getEntitiesForAggregate(modelValue, query.ids.aggregateId)
                    entities.elements[valueObject.id] = valueObject
                })
            }

            const updateValueObject = (modelValue, valueObject, query) => {
                const updateName = (modelValue, valueObjectName, name) => {
                    const prevName = valueObjectName.name
                    valueObjectName.name = name
                    valueObjectName.nameCamelCase = changeCase.camelCase(name)
                    valueObjectName.namePascalCase = changeCase.pascalCase(name)


                    const aggregateObject = modelValue.elements[query.ids.aggregateId]
                    const aggregateRootObject = aggregateObject.aggregateRoot
                    if(!aggregateObject || !aggregateRootObject) return

                    const matchedProperty = aggregateRootObject.fieldDescriptors.find(property => property.className === prevName)
                    if(matchedProperty) matchedProperty.className = name

                    if(aggregateRootObject.entities && aggregateRootObject.entities.elements) {
                        const aggregateRootEntity = Object.values(aggregateRootObject.entities.elements).find(entity => entity.isAggregateRoot)
                        if(aggregateRootEntity) {
                            const matchedProperty = aggregateRootEntity.fieldDescriptors.find(property => property.className === prevName)
                            if(matchedProperty) matchedProperty.className = name
                        }
                    }

                    for(const element of Object.values(modelValue.elements)) {
                        if(element && element.aggregate && element.aggregate.id === aggregateObject.id) {
                            if(element._type === "org.uengine.modeling.model.Command" || 
                                element._type === "org.uengine.modeling.model.Event") {
                                const matchedProperty = element.fieldDescriptors.find(property => property.className === prevName)
                                if(matchedProperty) matchedProperty.className = name
                            }
                        }
                    }
                }

                const updateProperties = (valueObject, properties) => {
                    for(const property of properties) {
                        const fieldDescriptor = valueObject.fieldDescriptors.find(fd => fd.name === property.name)
                        if(fieldDescriptor) {
                            if(property.type) {
                                fieldDescriptor.className = property.type
                                fieldDescriptor.label = "- " + property.name + ": " + property.type
                            }
                            if(property.isKey) fieldDescriptor.isKey = property.isKey
                            if(property.isForeignProperty) {
                                valueObject.fieldDescriptors = valueObject.fieldDescriptors.filter(fd => fd.name !== fieldDescriptor.name)
                            }
                        } else {
                            valueObject.fieldDescriptors.push({
                                "className": property.type ? property.type : "String",
                                "isKey": property.isKey ? true : false,
                                "label": "- " + property.name + ": " + (property.type ? property.type : "String"),
                                "name": property.name,
                                "nameCamelCase": changeCase.pascalCase(property.name),
                                "namePascalCase": changeCase.camelCase(property.name),
                                "_type": "org.uengine.model.FieldDescriptor"
                            })
                        }
                    }
                }

                if(query.args.valueObjectName) updateName(modelValue, valueObject, query.args.valueObjectName)
                if(query.args.properties) updateProperties(valueObject, query.args.properties)
            }

            const deleteValueObject = (modelValue, query) => {
                const aggregateObject = modelValue.elements[query.ids.aggregateId]
                const aggregateRootObject = aggregateObject.aggregateRoot
                if(!aggregateObject || !aggregateRootObject || !aggregateRootObject.entities || !aggregateRootObject.entities.elements) return
                
                const valueObject = aggregateRootObject.entities.elements[query.ids.valueObjectId]
                if(!valueObject) return

                if(query.args && query.args.properties) {
                    const propertyNameToFilter = query.args.properties.map(property => property.name)
                    valueObject.fieldDescriptors = valueObject.fieldDescriptors.filter(fd => !propertyNameToFilter.includes(fd.name))
                } else {
                    deleteElementInAggegatePerfectly(aggregateRootObject, valueObject)
                    deleteElementPropertyRelatedToAggregate(modelValue, aggregateObject, valueObject)
                }
            }

            const initObjectAlias = (modelValue, query) => {
                if(modelValue.elements[query.ids.aggregateId] &&
                    modelValue.elements[query.ids.aggregateId].aggregateRoot &&
                    modelValue.elements[query.ids.aggregateId].aggregateRoot.entities &&
                    modelValue.elements[query.ids.aggregateId].aggregateRoot.entities.elements &&
                    modelValue.elements[query.ids.aggregateId].aggregateRoot.entities.elements[query.ids.valueObjectId]
                 ) {
                    this.objectAlias = modelValue.elements[query.ids.aggregateId].aggregateRoot.entities.elements[query.ids.valueObjectId].name
                } else
                    callbacks.afterAllObjectAppliedCallBacks.push(() => {
                        if(modelValue.elements[query.ids.aggregateId] &&
                            modelValue.elements[query.ids.aggregateId].aggregateRoot &&
                            modelValue.elements[query.ids.aggregateId].aggregateRoot.entities &&
                            modelValue.elements[query.ids.aggregateId].aggregateRoot.entities.elements &&
                            modelValue.elements[query.ids.aggregateId].aggregateRoot.entities.elements[query.ids.valueObjectId]
                         )
                         this.objectAlias = modelValue.elements[query.ids.aggregateId].aggregateRoot.entities.elements[query.ids.valueObjectId].name
                    })
            }

            const convertAliasToUUID = (modelValue, objectAliaToUUID, query) => {
                getUUIDFromAlias(modelValue, objectAliaToUUID, query.ids, "boundedContextId")
                getUUIDFromAlias(modelValue, objectAliaToUUID, query.ids, "aggregateId")
            }

            initObjectAlias(modelValue, query)
            convertAliasToUUID(modelValue, objectAliaToUUID, query)
            switch(query.action) {
                case "update":
                    const aggregateObject = modelValue.elements[query.ids.aggregateId]
                    const aggregateRootObject = aggregateObject.aggregateRoot
                    if(!aggregateObject || !aggregateRootObject || !aggregateRootObject.entities || !aggregateRootObject.entities.elements) return       
                    const valueObject = aggregateRootObject.entities.elements[query.ids.valueObjectId]

                    if(valueObject) {
                        updateValueObject(modelValue, valueObject, query)
                        this.lastOp = "update"
                    }
                    else {
                        getUUIDFromAlias(modelValue, objectAliaToUUID, query.ids, "valueObjectId")
                        createValueObject(query)
                        this.lastOp = "create"
                    }
                    break;
                
                case "delete":
                    deleteValueObject(modelValue, query)
                    this.lastOp = "delete"
                    break;
            }
        }


        if(this.isApplied)
            return callbacks

        switch(this.query.objectType) {
            case "BoundedContext":
                applyToBoundedContext(modelValue, userInfo, objectAliaToUUID, this.query);
                break
            case "Aggregate":
                applyToAggregate(modelValue, userInfo, objectAliaToUUID, this.query);
                break
            case "Event":
                applyToEvent(modelValue, userInfo, objectAliaToUUID, this.query);
                break
            case "Command":
                applyToCommand(modelValue, userInfo, objectAliaToUUID, this.query);
                break
            case "Enumeration":
                applyToEnumeration(modelValue, objectAliaToUUID, this.query);
                break
            case "ValueObject":
                applyToValueObject(modelValue, objectAliaToUUID, this.query);
                break
        }

        this.isApplied = true;
        return callbacks
    }

    toSaveObject() {
        return {
            query: this.query,
            isApplied: this.isApplied,
            objectAlias: this.objectAlias,
            lastOp: this.lastOp
        }
    }

    static fromSaveObject(saveObject) {
        let transactionQuery = new DebeziumTransactionQuery() 
        transactionQuery.query = saveObject.query;
        transactionQuery.isApplied = saveObject.isApplied;
        transactionQuery.objectAlias = saveObject.objectAlias;
        transactionQuery.lastOp = saveObject.lastOp;
        return transactionQuery;
    }
}

export default DebeziumTransactionManager;