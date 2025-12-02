const { EventStormingCanvasTraceUtil, RefsTraceUtil } = require("../../utils");
const changeCase = require('change-case');

class TraceInfoViewerUtil {
    static getOriginalRefsForProperty(component, propertyValue, elementId) {
        if(!component || !propertyValue || !propertyValue.traceName || !elementId) return null;
        if (!this.isTraceInfoViewerUsable(component)) {
            return null;
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
            if(!aggregate || !aggregate.traceName || !aggregate.boundedContext || !aggregate.boundedContext.id) {
                return null;
            }

            aggregateTraceName = aggregate.traceName;
            boundedContextTraceName = EventStormingCanvasTraceUtil.getBoundedContextTraceNameById(
                aggregate.boundedContext.id, component
            );
        }
        if (!aggregateTraceName || !boundedContextTraceName) {
            return null;
        }

        
        const traceInfo = EventStormingCanvasTraceUtil.getTraceInfo(component);
        if (this._isValidPropertyTraceInfo(traceInfo, boundedContextTraceName)) {
            // TYPE 1: 추적성 정보에 참조 정보가 이미 존재함(프로젝트에서 필수 생성 속성으로 생성됨)
            let refsToUse = this._getRefsInPreviewAttributes(traceInfo, propertyTraceName, aggregateTraceName, boundedContextTraceName);
            if(refsToUse) {
                return refsToUse;
            }

            // TYPE 2: 추적성 정보에 참조 정보가 없으며, 인덱스 맵핑 정보가 존재함(프로젝트를 기반으로 생성되었으나, 필수 생성 속성은 아님)
            if(propertyValue.refs) {
                const bcTraceMap = traceInfo.traceMaps[boundedContextTraceName];
                refsToUse = RefsTraceUtil.convertToOriginalRefsUsingTraceMap(propertyValue.refs, bcTraceMap);
                if(refsToUse) {
                    return refsToUse;
                }
            }
        }

        // TYPE 3: 추적성 정보에 참조 정보가 없으며, 인덱스 맵핑 정보도 없음(A2A를 기반으로 생성되었거나 예외적인 상황)
        if(propertyValue.refs) {
            return propertyValue.refs;
        }

        // TYPE 4: 추적성 정보에 참조 정보가 없으며, 인덱스 맵핑 정보도 없으며, IdValueObject refs 정보가 존재함(프로젝트를 기반으로 생성되었으나, ClassID를 위해서 자동으로 생성된 속성)
        const idValueObjectRefs = TraceInfoViewerUtil.getIdValueObjectRefsByElementId(
            component, propertyValue, elementId
        );
        if(idValueObjectRefs) {
            return idValueObjectRefs;
        }

        return null;
    }

    static getOriginalRefsForEnumItem(component, enumValue, item) {
        if(!component || !enumValue || !enumValue.id || !item) return null;
        if (!this.isTraceInfoViewerUsable(component)) {
            return null;
        }

        const boundedContextTraceName = EventStormingCanvasTraceUtil.getBoundedContextTraceNameByEntityId(
            enumValue.id, component
        );
        if (!boundedContextTraceName) {
            return null;
        }

        const traceInfo = EventStormingCanvasTraceUtil.getTraceInfo(component);
        if (!traceInfo) {
            return null;
        }


        // TYPE 1: 추적성 정보에 Enum Item 참조 정보가 이미 존재함(프로젝트 초안을 기반으로 생성됨)
        if (item.refs && traceInfo.traceMaps && traceInfo.traceMaps[boundedContextTraceName]) {
            return RefsTraceUtil.convertToOriginalRefsUsingTraceMap(item.refs, traceInfo.traceMaps[boundedContextTraceName]);
        }

        // TYPE 2: 추적성 정보에 Enum 참조 정보가 없으며, 인덱스 맵핑 정보도 없음(A2A를 기반으로 생성)
        if(item.refs) {
            return item.refs;
        }

        return null;
    }

    static isTraceInfoViewerUsable(component) {
        const canvas = EventStormingCanvasTraceUtil.getParentEventStormingCanvas(component)
        if(!canvas || !canvas.traceInfoViewerDto || !canvas.traceInfoViewerDto.isUsable) return false
        return true
    }

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

    static _isValidPropertyTraceInfo(traceInfo, boundedContextName) {
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
