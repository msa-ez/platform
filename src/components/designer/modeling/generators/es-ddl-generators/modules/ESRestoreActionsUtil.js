const VODefinitions = require("../../VODefinitions")

class ESRestoreActionsUtil {
    static restoreActions(actions, esValue, options=null) {
        const isValidParams = () => {
            if(!actions || !esValue) throw new Error('actions and esValue are required');

            if (!Array.isArray(actions)) throw new Error('actions must be an array');
            if (actions.length === 0) return false
            if (!actions.every(action => action && typeof action === 'object')) 
                throw new Error('all items in actions must be objects');

            if (typeof esValue !== 'object') throw new Error('esValue must be null or an object');
            if (typeof options !== 'object') throw new Error('options must be an object');

            return true
        }
        if(!isValidParams()) return;

        console.log("[*] 복구전 actions", JSON.parse(JSON.stringify(actions, null, 2)))

        ESRestoreActionsUtil._restoreDefaultPropertyType(actions)
        ESRestoreActionsUtil._restoreObjectTypeProperty(actions)
        ESRestoreActionsUtil._restoreTypeProperty(actions, esValue)
        ESRestoreActionsUtil._addDefaultValueObjectIfNotExists(actions, esValue)
        ESRestoreActionsUtil._changeInvalidMethodInExtendVerbURI(actions)

        if(options.isStrictRestoreUsed) {
            ESRestoreActionsUtil._removeDuplicateAggregateInnerCreateActions(actions, esValue)
            ESRestoreActionsUtil._removeAggregateNameProperty(actions, esValue)
            ESRestoreActionsUtil._removeAggregateNameCreateAction(actions, esValue)
            ESRestoreActionsUtil._addAggregateInnerEntityIfAlreadyExists(actions, esValue)
            ESRestoreActionsUtil._addPropertyToAggregateRootIfNotExists(actions)
            ESRestoreActionsUtil._removeUselessValueObject(actions)
        }

        console.log("[*] 복구후 actions", JSON.parse(JSON.stringify(actions, null, 2)))
    }


    static _restoreDefaultPropertyType(actions) {
        for(let action of actions) {
            if(!action.args || !action.args.properties) continue;
            
            for(let property of action.args.properties) {
                if(!property.type) {
                    property.type = "String";
                }
            }
        }
    }

    static _restoreTypeProperty(actions, esValue) {
        for(let action of actions)
            if(!action.type) {
                if(!esValue || !esValue.elements)
                    action.type = "create" 
                else {
                    let idToSearch = null
                    
                    switch(action.objectType) {
                        case "BoundedContext": idToSearch = action.ids.boundedContextId; break
                        case "Aggregate": idToSearch = action.ids.aggregateId; break
                        case "ValueObject": idToSearch = action.ids.valueObjectId; break
                        case "Enumeration": idToSearch = action.ids.enumerationId; break
                        case "Event": idToSearch = action.ids.eventId; break
                        case "Command": idToSearch = action.ids.commandId; break
                        case "GeneralClass": idToSearch = action.ids.generalClassId; break
                        case "ReadModel": idToSearch = action.ids.readModelId; break
                    }

                    if(!idToSearch) action.type = "create"
                    else if(esValue.elements[idToSearch]) action.type = "update"
                    else action.type = "create"
                }
            }
    }

    static _restoreObjectTypeProperty(actions) {
        for(let action of actions) {
            // 외부적으로 Entity, GeneralClass를 혼동해서 사용하기 때문에, 필요한 경우 복구
            if(action.objectType === "Entity") {
                action.objectType = "GeneralClass"
                action.args.generalClassName = action.args.entityName
                action.args.generalClassAlias = action.args.entityAlias
            }
        }
    }

    static _addDefaultValueObjectIfNotExists(actions, esValue) {
        const VALID_OBJECT_TYPES = ['Aggregate', 'ValueObject', 'GeneralClass']

        let voActionsToAdd = []
        for (const action of actions) {
            if (!VALID_OBJECT_TYPES.includes(action.objectType)) continue
    

            const existingVOTypes = new Set()
            
            actions.concat(voActionsToAdd).forEach(existingAction => {
                if (existingAction.objectType === 'ValueObject' && 
                    existingAction.type === 'create' &&
                    existingAction.ids.aggregateId === action.ids.aggregateId &&
                    existingAction.args.valueObjectName) {
                    existingVOTypes.add(existingAction.args.valueObjectName)
                }
            })
            
            if (esValue && esValue.elements && action.ids.aggregateId) {
                const aggregateObject = esValue.elements[action.ids.aggregateId]
                if (aggregateObject && aggregateObject.aggregateRoot && 
                    aggregateObject.aggregateRoot.entities && 
                    aggregateObject.aggregateRoot.entities.elements) {
                    
                    Object.values(aggregateObject.aggregateRoot.entities.elements)
                        .forEach(element => {
                            if (element && element.name) {
                                existingVOTypes.add(element.name)
                            }
                        })
                }
            }
    

            const requiredVOTypes = new Set()
    
            if (action.args && action.args.properties) {
                action.args.properties.forEach(prop => {
                    if(!prop.type) return;

                    const pureType = ESRestoreActionsUtil.__getPureType(prop.type);
                    if (pureType && Object.keys(VODefinitions).includes(pureType) && 
                        !existingVOTypes.has(pureType)) {
                        requiredVOTypes.add(pureType)
                    }
                })
            }
    

            requiredVOTypes.forEach(voType => {
                const voAction = {
                    objectType: "ValueObject",
                    type: "create",
                    ids: {
                        boundedContextId: action.ids.boundedContextId,
                        aggregateId: action.ids.aggregateId,
                        valueObjectId: `vo-${voType.toLowerCase()}`
                    },
                    args: {
                        valueObjectName: voType,
                        valueObjectAlias: "",
                        properties: VODefinitions[voType].map((p) => ({
                            name: p.name,
                            type: p.className,
                            isKey: p.isKey
                        }))
                    }
                }
                voActionsToAdd.push(voAction)
                existingVOTypes.add(voType)
            })
        }

        actions.push(...voActionsToAdd)
    }

    static _changeInvalidMethodInExtendVerbURI(actions) {
        for(let action of actions) {
            if(action.objectType === "Command" && 
              !action.args.isRestRepository &&
               action.args.api_verb === "PATCH") {
                action.args.api_verb = "PUT"
            }
        }
    }


    static _removeDuplicateAggregateInnerCreateActions(actions, esValue) {
        if (!actions || !esValue || !esValue.elements) return;


        const aggregateElementNames = new Map();

        actions.forEach(action => {
            if (action.ids.aggregateId && !aggregateElementNames.has(action.ids.aggregateId)) {
                const names = new Set();
                const aggregateObject = esValue.elements[action.ids.aggregateId];
                
                if (aggregateObject && aggregateObject.aggregateRoot && aggregateObject.aggregateRoot.entities && aggregateObject.aggregateRoot.entities.elements) {
                    Object.values(aggregateObject.aggregateRoot.entities.elements)
                        .forEach(element => {
                            if (element && element.name) {
                                names.add(element.name.toLowerCase());
                            }
                        });
                }
                
                aggregateElementNames.set(action.ids.aggregateId, names);
            }
        });


        const getNameFromAction = (action) => {
            switch(action.objectType) {
                case 'ValueObject': return action.args.valueObjectName;
                case 'Enumeration': return action.args.enumerationName;
                case 'GeneralClass': return action.args.generalClassName;
                default: return null;
            }
        };

        const usedNames = new Map();

        const filteredActions = actions.filter(action => {
            if (action.type !== 'create') return true;
            if (!["ValueObject", "Enumeration", "GeneralClass"].includes(action.objectType)) return true;
            
            const name = getNameFromAction(action);
            if (!name) return true;

            const aggregateId = action.ids.aggregateId;
            if (!aggregateId) return true;

            if (!usedNames.has(aggregateId)) {
                usedNames.set(aggregateId, new Set());
            }
            const usedNamesInAggregate = usedNames.get(aggregateId);
            const existingNamesInAggregate = aggregateElementNames.get(aggregateId);

            if ((existingNamesInAggregate && existingNamesInAggregate.has(name.toLowerCase())) || usedNamesInAggregate.has(name.toLowerCase())) {
                return false;
            }

            usedNamesInAggregate.add(name.toLowerCase());
            return true;
        });

        actions.length = 0;
        actions.push(...filteredActions);
    }

    static _removeAggregateNameProperty(actions, esValue) {
        const aggregateNames = new Set();
        Object.values(esValue.elements).forEach(element => {
            if (element && element._type === "org.uengine.modeling.model.Aggregate") {
                aggregateNames.add(element.name);
            }
        })

        actions.forEach(action => {
            if (action.args && action.args.properties) {
                action.args.properties = action.args.properties.filter(property => {
                    const isNotAggregateType = !property.type || !aggregateNames.has(property.type);
                    
                    let isAggregateIdProperty = false
                    // 클래스 ID인 경우에는 반드시 Aggregate 이름 + Id를 가지기 때문에 이 부분을 예외로 처리함
                    if(!(action.args.valueObjectName && action.args.valueObjectName.toLowerCase().endsWith("id"))) {
                        isAggregateIdProperty = Array.from(aggregateNames).some(aggName => 
                            (property.name.toLowerCase() === (aggName.toLowerCase() + "id")) && 
                            ESRestoreActionsUtil.__isDefaultJavaType(property.type)
                        );
                    }
    
                    return isNotAggregateType && !isAggregateIdProperty;
                });
            }
        })
    }

    static _removeAggregateNameCreateAction(actions, esValue) {
        const aggregateNames = new Set();
        Object.values(esValue.elements).forEach(element => {
            if (element && element._type === "org.uengine.modeling.model.Aggregate") {
                aggregateNames.add(element.name);
            }
        });


        const filteredActions = actions.filter(action => {
            if (action.type !== 'create') return true;
            if (!["ValueObject", "GeneralClass"].includes(action.objectType)) return true;

            const name = action.objectType === "ValueObject" 
                ? action.args.valueObjectName 
                : action.args.generalClassName;

            return !aggregateNames.has(name);
        });


        actions.length = 0;
        actions.push(...filteredActions);
    }

    static _addAggregateInnerEntityIfAlreadyExists(actions, esValue) {
        const actionsToAdd = [];
        const VALID_OBJECT_TYPES = ['Aggregate', 'ValueObject', 'GeneralClass'];

        for (const action of actions) {
            if (!VALID_OBJECT_TYPES.includes(action.objectType) || action.type !== 'create') continue;
            
            const newActions = this._createNewActionsForMissingTypes(action, actions, esValue);
            actionsToAdd.push(...newActions);
        }

        if(actionsToAdd.length <= 0) return;
       
        
        const uniqueActions = this._filterAndAddUniqueActions(actions, actionsToAdd);
        actions.push(...uniqueActions);
    }

    static _createNewActionsForMissingTypes(action, actions, esValue) {
        const newActions = [];
        const properties = action.args.properties || [];
        const propertiesToRemove = [];

        for (let i = 0; i < properties.length; i++) {
            const property = properties[i];
            if (!property.type) continue;

            const pureType = this.__getPureType(property.type);
            if(this.__isDefaultJavaType(pureType)) continue;
            if (this._isTypeExistsInActionsOrAggregate(pureType, action, actions, esValue)) continue;

            const found = this._findTypeInAggregates(
                esValue,
                pureType, 
                property.referenceClass ? property.referenceClass : null
            );

            if (found) {
                const newAction = this._createActionFromFoundType(found, action);
                newActions.push(newAction);
            } else {
                propertiesToRemove.push(i);
            }
        }

        for (let i = propertiesToRemove.length - 1; i >= 0; i--) {
            properties.splice(propertiesToRemove[i], 1);
        }

        return newActions;
    }

    static _isTypeExistsInActionsOrAggregate(pureType, action, actions, esValue) {
        const typeExistsInActions = actions.some(a => 
            (a.type === 'create' && 
             a.ids.aggregateId === action.ids.aggregateId && 
             (a.args.valueObjectName === pureType || 
              a.args.generalClassName === pureType || 
              a.args.enumerationName === pureType))
        );

        if (typeExistsInActions) return true;

        const targetAggregateId = action.ids.aggregateId;
        if(targetAggregateId) {
            const targetAggregate = esValue.elements[targetAggregateId];
            if(targetAggregate && targetAggregate.aggregateRoot && 
               targetAggregate.aggregateRoot.entities && 
               targetAggregate.aggregateRoot.entities.elements) {
                const found = Object.values(targetAggregate.aggregateRoot.entities.elements)
                    .find(element => element && element.name === pureType);
                if(found) return true;
            }
        }

        return false;
    }

    static _findTypeInAggregates(esValue, typeName, referenceAggregateId = null) {
        if (referenceAggregateId && esValue && esValue.elements && esValue.elements[referenceAggregateId]) {
            const aggregate = esValue.elements[referenceAggregateId];
            if (aggregate.aggregateRoot && aggregate.aggregateRoot.entities && aggregate.aggregateRoot.entities.elements) {
                const found = Object.values(aggregate.aggregateRoot.entities.elements).find(
                    element => element && element.name === typeName
                );
                if (found) return { element: found, aggregateId: referenceAggregateId };
            }
        }

        for (const [elementId, element] of Object.entries(esValue.elements)) {
            if (element._type === "org.uengine.modeling.model.Aggregate" &&
                element.aggregateRoot && 
                element.aggregateRoot.entities && 
                element.aggregateRoot.entities.elements) {
                
                const found = Object.values(element.aggregateRoot.entities.elements).find(
                    entity => entity && entity.name === typeName
                );
                if (found) return { element: found, aggregateId: elementId };
            }
        }
        return null;
    }

    static _createActionFromFoundType(found, originalAction) {
        const newAction = {
            ids: {
                boundedContextId: originalAction.ids.boundedContextId,
                aggregateId: originalAction.ids.aggregateId,
            },
            args: {
                properties: []
            }
        };

        if(found.element.fieldDescriptors)
            newAction.args.properties = found.element.fieldDescriptors.map(fd => ({
                name: fd.name,
                type: fd.className,
                isKey: fd.isKey ? fd.isKey : false
            }));

        if (found.element._type === "org.uengine.uml.model.vo.Class") {
            newAction.objectType = "ValueObject";
            newAction.ids.valueObjectId = `vo-${found.element.name.toLowerCase()}`;
            newAction.args.valueObjectName = found.element.name;
            newAction.args.valueObjectAlias = found.element.displayName || "";
        } else if (found.element._type === "org.uengine.uml.model.Class") {
            newAction.objectType = "GeneralClass";
            newAction.ids.generalClassId = `gc-${found.element.name.toLowerCase()}`;
            newAction.args.generalClassName = found.element.name;
            newAction.args.generalClassAlias = found.element.displayName || "";
        } else if (found.element._type === "org.uengine.uml.model.enum") {
            newAction.objectType = "Enumeration";
            newAction.ids.enumerationId = `enum-${found.element.name.toLowerCase()}`;
            newAction.args.enumerationName = found.element.name;
            newAction.args.enumerationAlias = found.element.displayName || "";
            newAction.args.properties = found.element.items.map(item => ({
                name: item.value
            }));
        }

        newAction.type = "create";
        return newAction;
    }

    static _filterAndAddUniqueActions(existingActions, newActions) {
        const getActionKey = (action) => {
            const getName = (action) => {
                switch(action.objectType) {
                    case 'ValueObject': return action.args.valueObjectName;
                    case 'GeneralClass': return action.args.generalClassName;
                    case 'Enumeration': return action.args.enumerationName;
                    default: return null;
                }
            };
            return `${action.objectType}|${action.ids.aggregateId}|${getName(action)}`;
        };

        const existingActionKeys = new Map();
        existingActions.forEach(action => {
            const key = getActionKey(action);
            if (key) existingActionKeys.set(key, true);
        });

        return newActions.filter(action => {
            const key = getActionKey(action);
            if (key && !existingActionKeys.has(key)) {
                existingActionKeys.set(key, true);
                return true;
            }
            return false;
        });
    }

    static _addPropertyToAggregateRootIfNotExists(actions) {
        const innerActions = actions.filter(action => 
            ["GeneralClass", "ValueObject", "Enumeration"].includes(action.objectType) &&
            action.type === "create"
        );
    
        if (innerActions.length === 0) return;
    

        const aggregateMap = new Map();
        actions.forEach(action => {
            if (action.objectType === "Aggregate") {
                aggregateMap.set(action.ids.aggregateId, action);
            }
        });
    

        const usedTypesByAggregate = new Map();
        actions.forEach(action => {
            if (action.args && action.args.properties && action.ids.aggregateId) {
                if (!usedTypesByAggregate.has(action.ids.aggregateId)) {
                    usedTypesByAggregate.set(action.ids.aggregateId, new Set());
                }
                const usedTypes = usedTypesByAggregate.get(action.ids.aggregateId);
                
                action.args.properties.forEach(prop => {
                    if (prop.type) {
                        const pureType = this.__getPureType(prop.type);
                        usedTypes.add(pureType);
                    }
                });
            }
        });
    

        innerActions.forEach(action => {
            const aggregateAction = aggregateMap.get(action.ids.aggregateId);
            if (!aggregateAction) return;
    
            let elementName;
            switch(action.objectType) {
                case "GeneralClass": elementName = action.args.generalClassName; break;
                case "ValueObject": elementName = action.args.valueObjectName; break;
                case "Enumeration": elementName = action.args.enumerationName; break;
            }
    
            if (!elementName) return;


            const usedTypesInAggregate = usedTypesByAggregate.get(action.ids.aggregateId) || new Set();
            if (usedTypesInAggregate.has(elementName)) return;
    
            if (!aggregateAction.args.properties) {
                aggregateAction.args.properties = [];
            }
    
            const newProperty = {
                name: this.__generatePropertyName(elementName),
                type: elementName
            };
    
            if (!aggregateAction.args.properties.some(p => p.name === newProperty.name)) {
                aggregateAction.args.properties.push(newProperty);
            }
        });
    }

    static _removeUselessValueObject(actions) {
        const typeAliasMap = new Map();
        actions.forEach(action => {
            if (["Enumeration", "ValueObject", "Entity"].includes(action.objectType)) {
                const name = action.args[`${action.objectType.toLowerCase()}Name`];
                const alias = action.args[`${action.objectType.toLowerCase()}Alias`];
                if (name && alias) {
                    typeAliasMap.set(name, alias);
                }
            }
        });


        const voToRemove = new Map();
        const voActions = actions.filter(action => 
            action.objectType === "ValueObject" && 
            action.args.properties &&
            action.args.properties.length === 1 &&
            !action.args.valueObjectName.toLowerCase().endsWith("id") // 클래스 Id인 경우를 예외 처리
        );

        voActions.forEach(action => {
            const voName = action.args.valueObjectName;
            const property = action.args.properties[0];
            voToRemove.set(voName, {
                type: property.type,
                alias: action.args.valueObjectAlias
            });
        });


        actions.forEach(action => {
            if (action.args && action.args.properties) {
                action.args.properties.forEach(prop => {
                    if (!prop.type) return;

                    const pureType = ESRestoreActionsUtil.__getPureType(prop.type);
                    if (voToRemove.has(pureType)) {
                        const voInfo = voToRemove.get(pureType);
                        const newPureType = ESRestoreActionsUtil.__getPureType(voInfo.type);

                        prop.type = prop.type.replace(pureType, voInfo.type);
                        if (!ESRestoreActionsUtil.__isDefaultJavaType(newPureType) && typeAliasMap.has(newPureType)) {
                            prop.displayName = typeAliasMap.get(newPureType);
                        }
                    }
                });
            }
        });


        const filteredActions = actions.filter(action => 
            !(action.objectType === "ValueObject" && 
            voToRemove.has(action.args.valueObjectName))
        );

        actions.length = 0;
        actions.push(...filteredActions);
    }


    // 사용하는 클래스 타입을 명확하게 추출하기 위해 사용
    static __getPureType(type) {
        const match = type.match(/<(.+)>/)
        const typeFromMatch = match ? match[1] : type
        return typeFromMatch.replace("[]", "")
    }

    static __isDefaultJavaType(type) {
        return ["String", "Integer", "Long", "Double", "Float", "Boolean", "Date", "LocalDate", "LocalDateTime", "LocalTime", "Timestamp", "BigDecimal", "BigInteger", "Byte", "Short", "Character", "Enum", "Object"].includes(type);
    }

    static __generatePropertyName(elementName) {
        return elementName.charAt(0).toLowerCase() + elementName.slice(1);
    }
}

module.exports = ESRestoreActionsUtil