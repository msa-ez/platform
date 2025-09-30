const { EventStormingCanvasTraceUtil, RefsTraceUtil } = require("../../utils");
const changeCase = require('change-case');

class TraceInfoViewerUtil {

    /**
     * Aggregate를 위한 TraceInfoViewer 열기 (structureRefs 사용)
     */
    static openTraceInfoViewerForAggregate(component, aggregateValue) {
        if (!this.isTraceInfoViewerUsable(component)) {
            throw new Error('Can not use TraceInfoViewer. Component is not properly configured.');
        }
        if (!this._isValidAggregateTraceValue(aggregateValue)) {
            throw new Error('Invalid Aggregate value. traceName and boundedContext.id are required.');
        }
        
        const aggregateTraceName = aggregateValue.traceName;
        
        const boundedContextTraceName = EventStormingCanvasTraceUtil.getBoundedContextTraceNameById(
            aggregateValue.boundedContext.id, component
        );
        if (!boundedContextTraceName) {
            throw new Error('Can not find BoundedContext trace name. boundedContext.id is invalid.');
        }

        const traceInfo = EventStormingCanvasTraceUtil.getTraceInfo(component);
        if (!this._isValidAggregateTraceInfo(traceInfo, boundedContextTraceName, aggregateTraceName)) {
            throw new Error(`Invalid Aggregate trace info. Can not find trace info for ${boundedContextTraceName}.${aggregateTraceName}.`);
        }
        
        const aggregateRefs = traceInfo.structureRefs[boundedContextTraceName].aggregates[aggregateTraceName];
        
        return this.showTraceInfoViewer(component, aggregateRefs);
    }

    /**
     * 일반 Element를 위한 TraceInfoViewer 열기 (refs 속성을 가진 경우)
     */
    static openTraceInfoViewerForElement(component, elementValue) {
        if (!this.isTraceInfoViewerUsable(component)) {
            throw new Error('Can not use TraceInfoViewer. Component is not properly configured.');
        }
        if (!this._isValidElementTraceValue(elementValue)) {
            throw new Error('Invalid Element value. boundedContext.id and refs are required.');
        }

        const boundedContextTraceName = EventStormingCanvasTraceUtil.getBoundedContextTraceNameById(
            elementValue.boundedContext.id, component
        );
        if (!boundedContextTraceName) {
            throw new Error('Can not find BoundedContext name. boundedContext.id is invalid.');
        }

        const traceInfo = EventStormingCanvasTraceUtil.getTraceInfo(component);
        if (!this._isValidElementTraceInfo(traceInfo, boundedContextTraceName)) {
            throw new Error(`Invalid Element trace info. Can not find traceMaps for ${boundedContextTraceName}.`);
        }

        const bcTraceMap = traceInfo.traceMaps[boundedContextTraceName];
        const originalRefs = RefsTraceUtil.convertToOriginalRefsUsingTraceMap(elementValue.refs, bcTraceMap);
        
        return this.showTraceInfoViewer(component, originalRefs);
    }

    /**
     * UML Model Class를 위한 TraceInfoViewer 열기 (structureRefs 사용)
     */
    static openTraceInfoViewerForModelClass(component, modelClassValue) {
        if (!this.isTraceInfoViewerUsable(component)) {
            throw new Error('Can not use TraceInfoViewer. Component is not properly configured.');
        }
        if (!this._isValidModelClassTraceValue(modelClassValue)) {
            throw new Error('Invalid ModelClass value. id and traceName are required.');
        }
        
        const modelClassTraceName = modelClassValue.traceName;
        
        const boundedContextTraceName = EventStormingCanvasTraceUtil.getBoundedContextTraceNameByEntityId(
            modelClassValue.id, component
        );
        if (!boundedContextTraceName) {
            throw new Error('Can not find BoundedContext name. modelClass.id is invalid.');
        }

        const traceInfo = EventStormingCanvasTraceUtil.getTraceInfo(component);
        if (!this._isValidModelClassTraceInfo(traceInfo, boundedContextTraceName, modelClassTraceName)) {
            throw new Error(`Invalid ModelClass trace info. Can not find trace info for ${boundedContextTraceName}.${modelClassTraceName}.`);
        }
        
        const modelClassRefs = traceInfo.structureRefs[boundedContextTraceName].aggregates[modelClassTraceName];
        
        return this.showTraceInfoViewer(component, modelClassRefs);
    }

    /**
     * Entity를 위한 TraceInfoViewer 열기 (entityId로 boundedContext 찾기)
     */
    static openTraceInfoViewerForEntity(component, entityValue) {
        if (!this.isTraceInfoViewerUsable(component)) {
            throw new Error('Can not use TraceInfoViewer. Component is not properly configured.');
        }
        if (!this._isValidEntityTraceValue(entityValue)) {
            throw new Error('Invalid Entity value. id and refs are required.');
        }

        const boundedContextTraceName = EventStormingCanvasTraceUtil.getBoundedContextTraceNameByEntityId(
            entityValue.id, component
        );
        if (!boundedContextTraceName) {
            throw new Error('Can not find BoundedContext name. entity.id is invalid.');
        }

        const traceInfo = EventStormingCanvasTraceUtil.getTraceInfo(component);
        if (!this._isValidEntityTraceInfo(traceInfo, boundedContextTraceName)) {
            throw new Error(`Invalid Entity trace info. Can not find traceMaps for ${boundedContextTraceName}.`);
        }

        const bcTraceMap = traceInfo.traceMaps[boundedContextTraceName];
        const originalRefs = RefsTraceUtil.convertToOriginalRefsUsingTraceMap(entityValue.refs, bcTraceMap);
        
        return this.showTraceInfoViewer(component, originalRefs);
    }

    /**
     * Property를 위한 TraceInfoViewer 열기 (previewAttributes 우선, traceMaps 대체)
     */
    static openTraceInfoViewerForProperty(component, propertyValue, elementId) {
        if (!this.isTraceInfoViewerUsable(component)) {
            throw new Error('Can not use TraceInfoViewer. Component is not properly configured.');
        }
        if (!elementId) {
            throw new Error('elementId is required.');
        }
        if (!this._isValidPropertyTraceValue(propertyValue)) {
            throw new Error('Invalid Property value. refs and traceName are required.');
        }

        const propertyTraceName = propertyValue.traceName;
        
        let aggregateTraceName = null;
        let boundedContextTraceName = null
        aggregateTraceName = EventStormingCanvasTraceUtil.getTraceNameByElementId(elementId, component);
        if(aggregateTraceName) { // 애그리거트 외부 엔티티의 세부 속성인 경우
            boundedContextTraceName = EventStormingCanvasTraceUtil.getBoundedContextTraceNameByElementId(
                elementId, component
            );
        } else { // 애그리거트 내부 엔티티의 세부 속성인 경우
            const aggregate = this._getValidAggregateByAggregateEntityId(component, elementId)
            if(!aggregate) {
                throw new Error('Can not find valid Aggregate. elementId does not reference a valid aggregate entity.');
            }

            aggregateTraceName = aggregate.traceName;
            boundedContextTraceName = EventStormingCanvasTraceUtil.getBoundedContextTraceNameById(
                aggregate.boundedContext.id, component
            );
        }

        if (!propertyTraceName || !aggregateTraceName || !boundedContextTraceName) {
            throw new Error('Invalid Property trace info. propertyTraceName, aggregateTraceName, boundedContextTraceName are required.');
        }

        const traceInfo = EventStormingCanvasTraceUtil.getTraceInfo(component);
        if (!this._isValidPropertyTraceInfo(traceInfo, boundedContextTraceName)) {
            throw new Error(`Invalid Property trace info. Can not find traceMaps for ${boundedContextTraceName}.`);
        }

        // previewAttributes에서 먼저 찾기
        let refsToUse = this._getRefsInPreviewAttributes(traceInfo, propertyTraceName, aggregateTraceName, boundedContextTraceName);
        
        // 없으면 traceMaps 사용
        if (!refsToUse) {
            const bcTraceMap = traceInfo.traceMaps[boundedContextTraceName];
            refsToUse = RefsTraceUtil.convertToOriginalRefsUsingTraceMap(propertyValue.refs, bcTraceMap);
        }
        
        return this.showTraceInfoViewer(component, refsToUse);
    }

    /**
     * Enum을 위한 TraceInfoViewer 열기
     */
    static openTraceInfoViewerForEnum(component, enumValue) {
        if (!this.isTraceInfoViewerUsable(component)) {
            throw new Error('Can not use TraceInfoViewer. Component is not properly configured.');
        }
        if (!this._isValidEnumTraceValue(enumValue)) {
            throw new Error('Invalid Enum value. id and refs are required.');
        }

        const boundedContextTraceName = EventStormingCanvasTraceUtil.getBoundedContextTraceNameByEntityId(
            enumValue.id, component
        );
        if (!boundedContextTraceName) {
            throw new Error('Can not find BoundedContext name. enum.id is invalid.');
        }

        const traceInfo = EventStormingCanvasTraceUtil.getTraceInfo(component);
        if (!this._isValidEnumTraceInfo(traceInfo, boundedContextTraceName)) {
            throw new Error(`Invalid Enum trace info. Can not find traceMaps for ${boundedContextTraceName}.`);
        }

        if(this._isValidEnumTraceInfoStructureRefs(traceInfo, boundedContextTraceName, enumValue.traceName)) {
            const enumRefs = traceInfo.structureRefs[boundedContextTraceName].enumerations[enumValue.traceName];
            return this.showTraceInfoViewer(component, enumRefs);
        }

        const bcTraceMap = traceInfo.traceMaps[boundedContextTraceName];
        const originalRefs = RefsTraceUtil.convertToOriginalRefsUsingTraceMap(enumValue.refs, bcTraceMap);
        
        return this.showTraceInfoViewer(component, originalRefs);
    }

    /**
     * Enum Item을 위한 TraceInfoViewer 열기
     */
    static openTraceInfoViewerForEnumItem(component, enumValue, item) {
        if (!this.isTraceInfoViewerUsable(component)) {
            throw new Error('Can not use TraceInfoViewer. Component is not properly configured.');
        }
        if (!this._isValidEnumTraceValue(enumValue)) {
            throw new Error('Invalid Enum value. id and refs are required.');
        }
        if (!item.refs) {
            throw new Error('Invalid EnumItem value. item.refs is required.');
        }

        const boundedContextTraceName = EventStormingCanvasTraceUtil.getBoundedContextTraceNameByEntityId(
            enumValue.id, component
        );
        if (!boundedContextTraceName) {
            throw new Error('Can not find BoundedContext name. enum.id is invalid.');
        }

        const traceInfo = EventStormingCanvasTraceUtil.getTraceInfo(component);
        if (!this._isValidEnumTraceInfo(traceInfo, boundedContextTraceName)) {
            throw new Error(`Invalid Enum trace info. Can not find traceMaps for ${boundedContextTraceName}.`);
        }

        const bcTraceMap = traceInfo.traceMaps[boundedContextTraceName];
        const originalRefs = RefsTraceUtil.convertToOriginalRefsUsingTraceMap(item.refs, bcTraceMap);
        
        return this.showTraceInfoViewer(component, originalRefs);
    }


    /**
     * TraceInfoViewer 사용 가능 여부 확인
     */
    static isTraceInfoViewerUsable(component) {
        const canvas = EventStormingCanvasTraceUtil.getParentEventStormingCanvas(component)
        if(!canvas || !canvas.traceInfoViewerDto || !canvas.traceInfoViewerDto.isUsable) return false
        return true
    }

    /**
     * TraceInfoViewer에 refs를 표시하는 공통 로직
     */
    static showTraceInfoViewer(component, refs) {
        if (!refs) {
            throw new Error('Can not show refs. refs is required.');
        }

        const parentCanvas = EventStormingCanvasTraceUtil.getParentEventStormingCanvas(component);
        if (!parentCanvas) {
            throw new Error('Can not find parent EventStormingCanvas. Component is not properly configured.');
        }

        parentCanvas.traceInfoViewerDto.isShow = true;
        parentCanvas.traceInfoViewerDto.directRefInfos = {
            refs: refs
        };
        return true;
    }

    /**
     * Property의 IdValueObject refs 가져오기 (elementId 사용)
     */
    static getIdValueObjectRefsByElementId(component, propertyValue, elementId) {
        if (!propertyValue || !propertyValue.className || !elementId) return null;

        const aggregateRoot = this._getValidAggregateRootByElementId(component, elementId);
        if (!aggregateRoot) return null;

        return this._getIdValueObjectRefsFromTraceInfo(component, aggregateRoot, propertyValue.className.replace('Id', ''));
    }

    /**
     * Entity의 IdValueObject refs 가져오기 (canvas 사용)
     */
    static getIdValueObjectRefsByCanvas(component, entityValue, canvas) {
        const referenceClassName = this._getValidIdValueObjectReferenceClassName(entityValue);
        if (!referenceClassName) return null;

        const aggregateRoot = this._getValidAggregateRootByCanvas(canvas);
        if (!aggregateRoot) return null;

        return this._getIdValueObjectRefsFromTraceInfo(component, aggregateRoot, referenceClassName);
    }

    // === Private Helper Methods === //

    static _isValidAggregateTraceValue(aggregateValue) {
        return aggregateValue && aggregateValue.boundedContext && 
               aggregateValue.boundedContext.id && aggregateValue.traceName;
    }

    static _isValidAggregateTraceInfo(traceInfo, boundedContextTraceName, aggregateTraceName) {
        return traceInfo && traceInfo.structureRefs && 
               traceInfo.structureRefs[boundedContextTraceName] && 
               traceInfo.structureRefs[boundedContextTraceName].aggregates &&
               traceInfo.structureRefs[boundedContextTraceName].aggregates[aggregateTraceName] &&
               traceInfo.userInputs;
    }

    static _isValidElementTraceValue(elementValue) {
        return elementValue && elementValue.boundedContext && 
            elementValue.boundedContext.id && elementValue.refs;
    }

    static _isValidElementTraceInfo(traceInfo, boundedContextName) {
        return traceInfo && traceInfo.traceMaps && traceInfo.traceMaps[boundedContextName];
    }

    static _isValidModelClassTraceValue(modelClassValue) {
        return modelClassValue && modelClassValue.id && modelClassValue.traceName;
    }

    static _isValidModelClassTraceInfo(traceInfo, boundedContextName, modelClassTraceName) {
        return traceInfo && traceInfo.structureRefs && 
               traceInfo.structureRefs[boundedContextName] && 
               traceInfo.structureRefs[boundedContextName].aggregates &&
               traceInfo.structureRefs[boundedContextName].aggregates[modelClassTraceName] &&
               traceInfo.userInputs;
    }

    static _isValidEnumTraceInfoStructureRefs(traceInfo, boundedContextName, enumTraceName) {
        return traceInfo && traceInfo.structureRefs && 
               traceInfo.structureRefs[boundedContextName] && 
               traceInfo.structureRefs[boundedContextName].enumerations &&
               traceInfo.structureRefs[boundedContextName].enumerations[enumTraceName]
    }

    static _isValidEntityTraceValue(entityValue) {
        return entityValue && entityValue.id && entityValue.refs;
    }

    static _isValidEntityTraceInfo(traceInfo, boundedContextName) {
        return traceInfo && traceInfo.traceMaps && traceInfo.traceMaps[boundedContextName];
    }

    static _isValidPropertyTraceValue(propertyValue) {
        return propertyValue && propertyValue.refs && propertyValue.traceName;
    }

    static _isValidPropertyTraceInfo(traceInfo, boundedContextName) {
        return traceInfo && traceInfo.traceMaps && traceInfo.traceMaps[boundedContextName];
    }

    static _isValidEnumTraceValue(enumValue) {
        return enumValue && enumValue.id && enumValue.refs;
    }

    static _isValidEnumTraceInfo(traceInfo, boundedContextName) {
        return traceInfo && traceInfo.traceMaps && traceInfo.traceMaps[boundedContextName];
    }

    static _getRefsInPreviewAttributes(traceInfo, propertyName, aggregateName, boundedContextName) {
        if (!traceInfo.previewAttributes || !traceInfo.previewAttributes[boundedContextName] ||
           !traceInfo.previewAttributes[boundedContextName][aggregateName]
        ) return null;
    
        const fieldInfos = traceInfo.previewAttributes[boundedContextName][aggregateName];
        if (!fieldInfos || !Array.isArray(fieldInfos)) return null;

        for (const fieldInfo of fieldInfos) {
            if (!fieldInfo.fieldName || !fieldInfo.refs) continue;
            if (changeCase.camelCase(fieldInfo.fieldName) === changeCase.camelCase(propertyName)) {
                return fieldInfo.refs;
            }
        }

        return null;
    }

    static _getValidAggregateRootByElementId(component, elementId) {
        const aggregateRoot = EventStormingCanvasTraceUtil.getElementById(elementId, component);
        if (!this._isValidAggregateRoot(aggregateRoot)) return null;
        return aggregateRoot;
    }

    static _getValidAggregateRootByCanvas(canvas) {
        if (!canvas || !canvas.aggregateRootList || !canvas.aggregateRootList[0]) return null;
        
        const aggregateRoot = canvas.aggregateRootList[0];
        if (!this._isValidAggregateRoot(aggregateRoot)) return null;
        return aggregateRoot;
    }

    static _getIdValueObjectRefsFromTraceInfo(component, aggregateRoot, referenceClassName) {
        const aggregateRootTraceName = aggregateRoot.traceName;
        const boundedContextTraceName = EventStormingCanvasTraceUtil.getBoundedContextTraceNameById(
            aggregateRoot.boundedContext.id, component
        );
        if (!boundedContextTraceName) return null;
        
        const traceInfo = EventStormingCanvasTraceUtil.getTraceInfo(component);
        if (!this._isValidIdValueObjectTraceInfo(traceInfo, boundedContextTraceName, aggregateRootTraceName, referenceClassName)) return null;
        
        return traceInfo.idValueObjectRefs[boundedContextTraceName][aggregateRootTraceName][referenceClassName];
    }

    static _isValidAggregateRoot(aggregateRoot) {
        return aggregateRoot && aggregateRoot.traceName && 
               aggregateRoot.boundedContext && aggregateRoot.boundedContext.id;
    }

    static _isValidIdValueObjectTraceInfo(traceInfo, boundedContextName, aggregateRootTraceName, referenceClassName) {
        return traceInfo && traceInfo.idValueObjectRefs && 
               traceInfo.idValueObjectRefs[boundedContextName] &&
               traceInfo.idValueObjectRefs[boundedContextName][aggregateRootTraceName] &&
               traceInfo.idValueObjectRefs[boundedContextName][aggregateRootTraceName][referenceClassName];
    }

    static _getValidIdValueObjectReferenceClassName(entityValue) {
        if(entityValue.referenceClass) return entityValue.referenceClass;

        if(!entityValue || !entityValue.isVO || !entityValue.name || 
           !entityValue.fieldDescriptors || !entityValue.fieldDescriptors.length) return null;
        if(!entityValue.name.toLowerCase().endsWith('id')) return null;
        
        let referenceClassName = null;
        for(const fieldDescriptor of entityValue.fieldDescriptors) {
            if(fieldDescriptor.name && fieldDescriptor.name.toLowerCase().endsWith('id') && fieldDescriptor.referenceClass) {
                referenceClassName = fieldDescriptor.referenceClass;
                break;
            }
        }
        if(!referenceClassName) return null;

        return referenceClassName
    }

    static _getValidAggregateByAggregateEntityId(component, entityId) {
        const parentCanvas = EventStormingCanvasTraceUtil.getParentEventStormingCanvas(component);
        if(!parentCanvas || !parentCanvas.value || !parentCanvas.value.elements) return false;

        let validAggregate = null
        for(const element of Object.values(parentCanvas.value.elements)) {
            if(!element || !element._type || element._type !== "org.uengine.modeling.model.Aggregate" ||
               !element.aggregateRoot || !element.aggregateRoot.entities || !element.aggregateRoot.entities.elements
            ) continue;

            for(const entity of Object.values(element.aggregateRoot.entities.elements)) {
                if(entity && entity.id && entity.id === entityId) {
                    validAggregate = element;
                    break;
                }
            }
            if(validAggregate) break;
        }
        if(!validAggregate || !validAggregate.traceName || !validAggregate.boundedContext || !validAggregate.boundedContext.id) return null;

        return validAggregate;
    }
}

module.exports = TraceInfoViewerUtil;
