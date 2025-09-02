const DataValidationUtil = require("../DataValidationUtil");
const RefsTraceUtil = require("./RefsTraceUtil");

class TraceMarkdownUtil {
    static getDescriptionWithMappingIndex(boundedContext, relations, explanations, events) {
        if(!this.__isValidBoundedContext(boundedContext)) throw new Error('Invalid boundedContext');
        if(!this.__isValidRelations(relations)) throw new Error('Invalid relations');
        if(!this.__isValidExplanations(explanations)) throw new Error('Invalid explanations');
        if(!this.__isValidEvents(events)) throw new Error('Invalid events');

        let currentLine = 1;
        const markdownLines = [];
        const traceMap = {};
    
        const addLines = (content, refs = null, isDirectMatching = false) => {
            const lines = String(content).split('\n');
            
            // isDirectMatching이 true이고 refs가 있는 경우, 라인별 refs를 계산
            if (isDirectMatching && refs && refs.length > 0) {
                // 첫 번째 ref 범위에서 시작 라인 번호를 추출
                const firstRef = refs[0];
                if (Array.isArray(firstRef) && firstRef.length >= 2) {
                    const [startLine, startCol] = firstRef[0];
                    const [endLine, endCol] = firstRef[1];
                    
                    for (let i = 0; i < lines.length; i++) {
                        const line = lines[i];
                        markdownLines.push(line);
                        
                        if (line.trim()) {
                            // 현재 라인에 해당하는 원본 라인 번호 계산
                            const originalLineNumber = startLine + i;
                            
                            // 원본 범위를 벗어나지 않도록 확인
                            if (originalLineNumber <= endLine) {
                                // 각 라인의 시작(1)부터 해당 라인 끝까지의 refs 생성
                                const lineEndCol = line.length > 0 ? line.length : 1;
                                const lineRefs = [[[originalLineNumber, 1], [originalLineNumber, lineEndCol]]];
                                
                                traceMap[currentLine] = {
                                    refs: lineRefs,
                                    isDirectMatching: true
                                };
                            }
                        }
                        currentLine++;
                    }
                } else {
                    // refs 구조가 예상과 다른 경우 기존 로직 사용
                    for (const line of lines) {
                        markdownLines.push(line);
                        if (refs && line.trim()) {
                            traceMap[currentLine] = {
                                refs,
                                isDirectMatching
                            };
                        }
                        currentLine++;
                    }
                }
            } else {
                // 기존 로직 (isDirectMatching이 false이거나 refs가 없는 경우)
                for (const line of lines) {
                    markdownLines.push(line);
                    if (refs && line.trim()) {
                        traceMap[currentLine] = {
                            refs,
                            isDirectMatching
                        };
                    }
                    currentLine++;
                }
            }
        };
    
        addLines(`# Bounded Context Overview: ${boundedContext.name} (${boundedContext.alias})`);
        addLines('');
    
        if (boundedContext.role && boundedContext.roleRefs) {
            addLines(`## Role`);
            addLines(boundedContext.role, boundedContext.roleRefs, false);
            addLines('');
        }
    
        if (boundedContext.events && boundedContext.events.length > 0) {
            addLines(`## Key Events`);

            for (const eventName of boundedContext.events) {
                const matchedEvent = events.find(event => event.name === eventName);
                if(!matchedEvent || !matchedEvent.refs) continue;

                addLines(`- ${eventName}`, matchedEvent.refs, false);
            }
            
            addLines('');
        }
    
        if (boundedContext.requirements && boundedContext.requirements.length > 0) {
            const uniqueRequirements = [...new Map(boundedContext.requirements.map(item => [item.text, item])).values()];
    
            const requirementsByType = uniqueRequirements.reduce((acc, req) => {
                if (!acc[req.type]) {
                    acc[req.type] = [];
                }
                acc[req.type].push(req);
                return acc;
            }, {});
    
            if (Object.keys(requirementsByType).length > 0) {
                addLines(`# Requirements`);
                addLines('');
    
                for (const type in requirementsByType) {
                    addLines(`## ${type}`);
                    addLines('');
                    
                    for (const req of requirementsByType[type]) {
                        if(!req.refs) continue;

                        let textContent = req.text;
                        if (type.toLowerCase() === 'ddl') {
                            addLines('```sql');
                            addLines(textContent, req.refs, true);
                            addLines('```');
                            continue;
                        } else if (type.toLowerCase() === 'event') {
                            try {
                                const parsedEvent = JSON.parse(textContent);
                                const eventWithoutRefs = RefsTraceUtil.removeRefsAttributes(parsedEvent);
                                const formattedJson = JSON.stringify(eventWithoutRefs, null, 2);
                                
                                addLines('```json');
                                addLines(formattedJson, req.refs, false);
                                addLines('```');
                            } catch (e) {
                                addLines(textContent, req.refs, false);
                            }
                        } else {
                            addLines(textContent, req.refs, true);
                        }
                        addLines('');
                    }
                }
            }
        }
    
        const relatedRelations = relations.filter(rel =>
            (rel.upStream && rel.upStream.name === boundedContext.name) ||
            (rel.downStream && rel.downStream.name === boundedContext.name)
        );
        if (relatedRelations.length > 0) {
            addLines(`## Context Relations`);
            addLines('');

            relatedRelations.forEach(rel => {
                if(!rel.refs) return;

                const isUpstream = rel.upStream.name === boundedContext.name;
                const targetContext = isUpstream ? rel.downStream : rel.upStream;
                const direction = isUpstream ? "sends to" : "receives from";

                addLines(`### ${rel.name}`);
                addLines(`- **Type**: ${rel.type}`, rel.refs, false);
                addLines(`- **Direction**: ${direction} ${targetContext.alias} (${targetContext.name})`, rel.refs, false);

                const explanation = explanations.find(exp =>
                    (exp.sourceContext === boundedContext.alias && exp.targetContext === targetContext.alias) ||
                    (exp.targetContext === boundedContext.alias && exp.sourceContext === targetContext.alias)
                );
                if (!explanation || !explanation.refs) {
                    addLines('');
                    return;
                }

                addLines(`- **Reason**: ${explanation.reason}`, explanation.refs, false);
                addLines(`- **Interaction Pattern**: ${explanation.interactionPattern}`, explanation.refs, false);
                addLines('');
            });
        }
    
        const finalMarkdown = markdownLines.join('\n').trim();
        return { markdown: finalMarkdown, traceMap };
    }
    static __isValidBoundedContext(boundedContext) {
        const schema = {
            type: 'object',
            properties: {
                name: { type: 'string', required: true, minLength: 1 },
                alias: { type: 'string', required: true, minLength: 1 },
                role: { type: 'string', required: false },
                events: { 
                    type: 'array', 
                    required: false,
                    items: { type: 'string' }
                },
                requirements: {
                    type: 'array',
                    required: false,
                    items: {
                        type: 'object',
                        properties: {
                            text: { type: 'string', required: true },
                            type: { type: 'string', required: true }
                        }
                    }
                }
            }
        };

        return DataValidationUtil.isValidData(boundedContext, schema, 'boundedContext');
    }
    static __isValidRelations(relations) {
        // relations는 null, undefined 또는 빈 배열일 수 있음
        if (relations === null || relations === undefined) {
            return true;
        }

        const schema = {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    name: { type: 'string', required: true },
                    type: { type: 'string', required: true },
                    upStream: {
                        type: 'object',
                        required: true,
                        properties: {
                            name: { type: 'string', required: true }
                        }
                    },
                    downStream: {
                        type: 'object',
                        required: true,
                        properties: {
                            name: { type: 'string', required: true }
                        }
                    }
                }
            }
        };

        return DataValidationUtil.isValidData(relations, schema, 'relations');
    }
    static __isValidExplanations(explanations) {
        // explanations는 null, undefined 또는 빈 배열일 수 있음
        if (explanations === null || explanations === undefined) {
            return true;
        }

        const schema = {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    sourceContext: { type: 'string', required: true },
                    targetContext: { type: 'string', required: true },
                    reason: { type: 'string', required: true },
                    interactionPattern: { type: 'string', required: true }
                }
            }
        };

        return DataValidationUtil.isValidData(explanations, schema, 'explanations');
    }
    static __isValidEvents(events) {
        // events는 null, undefined 또는 빈 배열일 수 있음
        if (events === null || events === undefined) {
            return true;
        }

        const schema = {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    name: { type: 'string', required: true }
                }
            }
        };

        return DataValidationUtil.isValidData(events, schema, 'events');
    }
}

module.exports = TraceMarkdownUtil;
