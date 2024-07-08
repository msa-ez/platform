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
        this.transactions.forEach(transaction => {
            transaction.apply(modelValue, userInfo)
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
        this.queries.forEach(query => {
            query.apply(modelValue, userInfo)
        })
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
                case "new":
                    return `Create New ${query.args.boundedContextAlias} Bounded Context`;
            }
        }

        const aggregateQueryToString = (query) => {
            switch(query.action) {
                case "new":
                    return `Create New ${query.args.aggregateAlias} Aggregate`;
            }
        }

        const commandQueryToString = (query) => {
            switch(query.action) {
                case "new":
                    return `Create New ${query.args.commandAlias} Command`;
            }
        }

        const eventQueryToString = (query) => {
            switch(query.action) {
                case "new":
                    return `Create New ${query.args.eventAlias} Event`;
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
        }

        return {
            summary: summary,
            rawQuery: JSON.stringify(this.query, null, 2)
        }
    }

    apply(modelValue, userInfo) {
        const getUUID = () => {
            const s4 = () => {
                return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
            }
        
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4()
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
                case "new":
                    createNewBoundedContext(modelValue, userInfo, query);
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
                            entities: {}, 
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

                const getValidPosition = (modelValue, query, aggregateObject) => {
                    const getAllAggregatesInBoundedContext = (modelValue, boundedContextId) => {
                        return Object.values(modelValue.elements)
                            .filter(element => element && element._type === "org.uengine.modeling.model.Aggregate" && element.boundedContext.id === boundedContextId)
                    }
                    
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
                               + Math.round(aggregateObject.elementView.width/2) + 25, y: minY}
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


                const aggregateObject = getAggregateBase(
                    userInfo, query.args.aggregateName, query.args.aggregateAlias, 
                    query.ids.boundedContextId, 0, 0, query.ids.aggregateId
                )

                const VALID_POSITION = getValidPosition(modelValue, query, aggregateObject)
                aggregateObject.elementView.x = VALID_POSITION.x
                aggregateObject.elementView.y = VALID_POSITION.y

                aggregateObject.aggregateRoot.fieldDescriptors = getFileDescriptors(query.args.properties)
                modelValue.elements[aggregateObject.id] = aggregateObject
            }

            switch(query.action) {
                case "new":
                    createNewAggregate(modelValue, userInfo, query);
                    break;
            }
        }

        if(this.isApplied)
            return;
    
        switch(this.query.objectType) {
            case "BoundedContext":
                applyToBoundedContext(modelValue, userInfo, this.query);
                break
            case "Aggregate":
                applyToAggregate(modelValue, userInfo, this.query);
                break
        }

        this.isApplied = true;
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