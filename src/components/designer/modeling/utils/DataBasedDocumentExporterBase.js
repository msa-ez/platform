/**
 * DataBasedDocumentExporterBase - 데이터 기반 문서 변환기 베이스 클래스
 * 공통 데이터 추출 및 이미지 캡쳐 로직 제공
 */

import * as htmlToImage from 'html-to-image';

export class DataBasedDocumentExporterBase {
    constructor(projectInfo, draft, eventStormingModels, selectedSections, container = null) {
        this.projectInfo = projectInfo;
        this.draft = draft;
        this.eventStormingModels = eventStormingModels;
        this.selectedSections = selectedSections;
        this.container = container; // HTML 컨테이너 (이미지 캡쳐용)
        this.sectionNumbers = this.calculateSectionNumbers();
        this.imageCache = {}; // 캡쳐된 이미지 캐시
    }

    /**
     * 섹션 번호 계산
     */
    calculateSectionNumbers() {
        const numbers = {};
        let currentNumber = 1;

        if (this.selectedSections.userScenario) {
            numbers.userScenario = currentNumber++;
        }
        if (this.selectedSections.valueStream) {
            numbers.valueStream = currentNumber++;
        }
        if (this.selectedSections.boundedContext) {
            numbers.boundedContext = currentNumber++;
        }
        if (this.selectedSections.aggregateDesign) {
            numbers.aggregateDesign = currentNumber++;
        }
        if (this.selectedSections.eventStorming) {
            numbers.eventStorming = currentNumber++;
        }
        if (this.selectedSections.apiSpecification) {
            numbers.apiSpecification = currentNumber++;
        }
        if (this.selectedSections.aggregateDetail) {
            numbers.aggregateDetail = currentNumber++;
        }

        return numbers;
    }

    /**
     * 밸류 스트림 경로 추출
     */
    extractValueStreamPaths(events) {
        const eventMap = Object.fromEntries(events.map(ev => [ev.name, ev]));
        const startEvents = events.filter(event => event.level === 1);
        const paths = [];
        
        function traverse(event, path, visited) {
            if (visited.has(event.name)) return;
            const newPath = [...path, event];
            visited.add(event.name);
            
            if (!event.nextEvents || event.nextEvents.length === 0) {
                paths.push(newPath);
                return;
            }
            
            event.nextEvents.forEach(nextName => {
                const nextEvent = eventMap[nextName];
                if (nextEvent) traverse(nextEvent, newPath, new Set(visited));
            });
        }
        
        startEvents.forEach(startEvent => {
            traverse(startEvent, [], new Set());
        });
        
        return paths;
    }

    /**
     * 바운디드 컨텍스트 결과 추출
     */
    extractBoundedContextResult() {
        if (!this.draft) return null;
        const bcResult = this.draft.find(msg => msg.type === 'boundedContextResult');
        if (!bcResult) return null;
        return bcResult.result[bcResult.selectedAspect];
    }

    /**
     * 생성 옵션 추출
     */
    extractGenerationOption() {
        if (!this.draft) return null;
        const option = this.draft.find(msg => msg.type === 'bcGenerationOption');
        return option ? option.generateOption : null;
    }

    /**
     * 애그리거트 초안 추출
     */
    extractAggregateDrafts() {
        if (!this.draft) return [];
        const aggregateDraftMessages = this.draft.filter(msg => msg.type === 'aggregateDraftDialogDto');
        if (aggregateDraftMessages.length === 0) return [];

        const drafts = [];
        const aggregateDrafts = aggregateDraftMessages[0].selectedOptionItem;
        
        for (const [key, value] of Object.entries(aggregateDrafts)) {
            if (key === 'type') continue;
            
            let option = aggregateDraftMessages[0].draftOptions.find(option => option.boundedContext === key);
            if (value && value.boundedContext) {
                drafts.push({
                    boundedContextAlias: value.boundedContext.alias || key,
                    options: [
                        {
                            structure: value.structure,
                            pros: value.pros,
                            cons: value.cons,
                            analysisResult: option ? option.analysisResult : null
                        }
                    ]
                });
            }
        }

        return drafts;
    }

    /**
     * 이벤트 스토밍 모델 추출
     */
    extractEventStormingModels() {
        if (!this.eventStormingModels) return [];
        
        const modelArray = Array.isArray(this.eventStormingModels) 
            ? this.eventStormingModels 
            : Object.values(this.eventStormingModels);

        return modelArray.map(model => {
            if (!model || !model.information || !model.models) return null;

            const elements = Array.isArray(model.models.elements) 
                ? model.models.elements 
                : Object.values(model.models.elements || {});

            const boundedContexts = elements
                .filter(element => element && element._type.includes('BoundedContext'))
                .map(bc => {
                    return {
                        id: bc.id,
                        name: bc.name,
                        aggregate: elements.filter(
                            element => element && element._type.includes('Aggregate') && element.boundedContext.id === bc.id
                        ),
                        command: elements.filter(
                            element => element && element._type.includes('Command') && element.boundedContext.id === bc.id
                        ),
                        event: elements.filter(
                            element => element && element._type.includes('Event') && element.boundedContext.id === bc.id
                        ),
                        policy: elements.filter(
                            element => element && element._type.includes('Policy') && element.boundedContext.id === bc.id
                        ),
                        readModel: elements.filter(
                            element => element && element._type.includes('View') && element.boundedContext.id === bc.id
                        )
                    };
                });

            return {
                modelName: model.information.projectName,
                BoundedContexts: boundedContexts
            };
        }).filter(Boolean);
    }

    /**
     * 커맨드 추출 (API 명세용)
     */
    extractCommands() {
        const models = this.extractEventStormingModels();
        const commands = [];
        
        models.forEach(model => {
            model.BoundedContexts.forEach(bc => {
                if (bc.command && bc.command.length > 0) {
                    bc.command.forEach(cmd => {
                        commands.push({
                            ...cmd,
                            boundedContext: bc
                        });
                    });
                }
            });
        });
        
        return commands;
    }

    /**
     * Data URL을 Blob으로 변환
     */
    async dataUrlToBlob(dataUrl) {
        const response = await fetch(dataUrl);
        return await response.blob();
    }

    /**
     * Blob을 ArrayBuffer로 변환
     */
    async blobToArrayBuffer(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsArrayBuffer(blob);
        });
    }

    /**
     * Mermaid 이미지 캡쳐 (vue-mermaid)
     */
    async captureMermaidImage(componentName) {
        if (!this.container) return null;
        
        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            
            let mermaidElements = this.container.querySelectorAll(componentName);
            let svg = null;
            
            for (const mermaidEl of mermaidElements) {
                const foundSvg = mermaidEl.querySelector('svg');
                if (foundSvg && foundSvg.outerHTML) {
                    svg = foundSvg;
                    break;
                }
            }
            
            if (!svg) {
                const svgs = this.container.querySelectorAll('svg');
                for (const s of svgs) {
                    if (s.closest(componentName) || s.closest('.mermaid-container')) {
                        svg = s;
                        break;
                    }
                }
            }
            
            if (svg && svg.outerHTML) {
                // CSS 에러 무시를 위한 전역 에러 핸들러 설정 (임시)
                const originalWarn = console.warn;
                console.warn = function(...args) {
                    const message = args.join(' ');
                    // CSS 관련 에러는 무시
                    if (message.includes('Error inlining remote css') ||
                        message.includes('Error loading remote stylesheet') ||
                        message.includes('Error while reading CSS rules') ||
                        message.includes('Failed to read the \'cssRules\'') ||
                        message.includes('Failed to execute \'insertRule\'')) {
                        return;
                    }
                    originalWarn.apply(console, args);
                };
                
                try {
                    const imageData = await htmlToImage.toPng(svg, {
                        backgroundColor: '#ffffff',
                        pixelRatio: 2,
                        quality: 1.0,
                        useCORS: false,
                        allowTaint: false,
                        cacheBust: true,
                        skipFonts: true, // 폰트 임베딩 건너뛰기 (CSS 에러 방지)
                        filter: (node) => {
                            if (node.tagName === 'SCRIPT' || node.tagName === 'LINK') {
                                return false;
                            }
                            return true;
                        }
                    }).catch(async (err) => {
                        // CSS 에러가 아닌 경우에만 경고
                        if (!err.message || (!err.message.includes('cssRules') && !err.message.includes('CSSStyleSheet'))) {
                            console.warn('First capture attempt failed, retrying:', err);
                        }
                        const parent = svg.parentElement;
                        if (parent) {
                            return await htmlToImage.toPng(parent, {
                                backgroundColor: '#ffffff',
                                pixelRatio: 1.5,
                                quality: 0.9,
                                skipFonts: true
                            });
                        }
                        throw err;
                    });
                    
                    const imageBlob = await this.dataUrlToBlob(imageData);
                    return await this.blobToArrayBuffer(imageBlob);
                } finally {
                    // 원래 console.warn 복원
                    console.warn = originalWarn;
                }
            }
        } catch (error) {
            console.warn('Failed to capture Mermaid image:', error);
        }
        
        return null;
    }

    /**
     * BoundedContextMatrix 이미지 캡쳐
     */
    async captureBoundedContextMatrixImage() {
        if (!this.container) return null;
        
        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Word와 동일하게 .matrix-container 선택자 사용
            let matrixElement = this.container.querySelector('.matrix-container');
            if (!matrixElement) {
                matrixElement = this.container.querySelector('bounded-context-matrix, .bounded-context-matrix');
            }
            if (!matrixElement) return null;
            
            // CSS 에러 무시를 위한 전역 에러 핸들러 설정 (임시)
            const originalWarn = console.warn;
            console.warn = function(...args) {
                const message = args.join(' ');
                // CSS 관련 에러는 무시
                if (message.includes('Error inlining remote css') ||
                    message.includes('Error loading remote stylesheet') ||
                    message.includes('Error while reading CSS rules') ||
                    message.includes('Failed to read the \'cssRules\'') ||
                    message.includes('Failed to execute \'insertRule\'')) {
                    return;
                }
                originalWarn.apply(console, args);
            };
            
            try {
                const imageData = await htmlToImage.toPng(matrixElement, {
                    backgroundColor: '#ffffff',
                    pixelRatio: 2,
                    quality: 1.0,
                    useCORS: false,
                    allowTaint: false,
                    cacheBust: true,
                    skipFonts: true, // 폰트 임베딩 건너뛰기 (CSS 에러 방지)
                    filter: (node) => {
                        if (node.tagName === 'SCRIPT' || node.tagName === 'LINK') {
                            return false;
                        }
                        return true;
                    }
                });
                
                const imageBlob = await this.dataUrlToBlob(imageData);
                return await this.blobToArrayBuffer(imageBlob);
            } finally {
                // 원래 console.warn 복원
                console.warn = originalWarn;
            }
        } catch (error) {
            console.warn('Failed to capture BoundedContextMatrix image:', error);
        }
        
        return null;
    }

    /**
     * Aggregate Mermaid 이미지 캡쳐 (vue-mermaid-string)
     */
    async captureAggregateMermaidImage(draft) {
        if (!this.container) return null;
        
        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            
            let mermaidElements = this.container.querySelectorAll('vue-mermaid-string');
            let svg = null;
            
            for (const mermaidEl of mermaidElements) {
                const foundSvg = mermaidEl.querySelector('svg');
                if (foundSvg && foundSvg.outerHTML) {
                    svg = foundSvg;
                    break;
                }
            }
            
            if (!svg) {
                const svgs = this.container.querySelectorAll('svg');
                for (const s of svgs) {
                    if (s.closest('vue-mermaid-string') || s.closest('.mermaid-container')) {
                        svg = s;
                        break;
                    }
                }
            }
            
            if (svg && svg.outerHTML) {
                // CSS 에러 무시를 위한 전역 에러 핸들러 설정 (임시)
                const originalWarn = console.warn;
                console.warn = function(...args) {
                    const message = args.join(' ');
                    // CSS 관련 에러는 무시
                    if (message.includes('Error inlining remote css') ||
                        message.includes('Error loading remote stylesheet') ||
                        message.includes('Error while reading CSS rules') ||
                        message.includes('Failed to read the \'cssRules\'') ||
                        message.includes('Failed to execute \'insertRule\'')) {
                        return;
                    }
                    originalWarn.apply(console, args);
                };
                
                try {
                    const imageData = await htmlToImage.toPng(svg, {
                        backgroundColor: '#ffffff',
                        pixelRatio: 2,
                        quality: 1.0,
                        useCORS: false,
                        allowTaint: false,
                        cacheBust: true,
                        skipFonts: true, // 폰트 임베딩 건너뛰기 (CSS 에러 방지)
                        filter: (node) => {
                            if (node.tagName === 'SCRIPT' || node.tagName === 'LINK') {
                                return false;
                            }
                            return true;
                        }
                    }).catch(async (err) => {
                        // CSS 에러가 아닌 경우에만 경고
                        if (!err.message || (!err.message.includes('cssRules') && !err.message.includes('CSSStyleSheet'))) {
                            console.warn('First capture attempt failed, retrying:', err);
                        }
                        const parent = svg.parentElement;
                        if (parent) {
                            return await htmlToImage.toPng(parent, {
                                backgroundColor: '#ffffff',
                                pixelRatio: 1.5,
                                quality: 0.9,
                                skipFonts: true
                            });
                        }
                        throw err;
                    });
                    
                    const imageBlob = await this.dataUrlToBlob(imageData);
                    return await this.blobToArrayBuffer(imageBlob);
                } finally {
                    // 원래 console.warn 복원
                    console.warn = originalWarn;
                }
            }
        } catch (error) {
            // CSS 에러가 아닌 경우에만 경고
            if (!error.message || (!error.message.includes('cssRules') && !error.message.includes('CSSStyleSheet'))) {
                console.warn('Failed to capture Aggregate Mermaid image:', error);
            }
        }
        
        return null;
    }
}

