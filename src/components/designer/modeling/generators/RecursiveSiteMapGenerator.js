const SiteMapGenerator = require('./SiteMapGenerator');
const TextChunker = require('./TextChunker');

class RecursiveSiteMapGenerator extends SiteMapGenerator {
    constructor(client) {
        super(client);
        this.textChunker = new TextChunker({
            chunkSize: 25000,
            spareSize: 2000
        });

        this.currentChunks = [];
        this.currentChunkIndex = 0;
        this.resolveCurrentProcess = null;

        this.accumulated = {
            title: '',
            description: '',
            boundedContextsMap: new Map(),
            rootChildren: []
        };
    }

    async generateRecursively(requirementsText) {
        // 요구사항 유효성 검사
        if (!requirementsText || typeof requirementsText !== 'string') {
            console.warn('RecursiveSiteMapGenerator: Invalid or empty requirements text');
            return this.createEmptyResult();
        }

        const trimmedText = requirementsText.trim();
        if (trimmedText.length === 0) {
            console.warn('RecursiveSiteMapGenerator: Empty requirements text after trimming');
            return this.createEmptyResult();
        }

        // 전체 컨텍스트 크기 계산하여 청크 크기 동적 조정
        const totalContextSize = this.calculateTotalContextSize(trimmedText);
        const maxChunkSize = 25000;
        const adjustedChunkSize = Math.max(15000, maxChunkSize - totalContextSize);
        
        console.log(`RecursiveSiteMapGenerator - Total context size: ${totalContextSize}, Adjusted chunk size: ${adjustedChunkSize}`);
        
        // 청크 크기를 동적으로 조정
        this.textChunker.chunkSize = adjustedChunkSize;
        
        // 청크 생성 및 유효성 검사
        const rawChunks = this.textChunker.splitIntoChunks(trimmedText);
        this.currentChunks = this.validateAndEnrichChunks(rawChunks);
        
        // 유효한 청크가 없으면 빈 결과 반환
        if (this.currentChunks.length === 0) {
            console.warn('RecursiveSiteMapGenerator: No valid chunks found');
            return this.createEmptyResult();
        }

        this.currentChunkIndex = 0;
        this.accumulated = {
            title: '',
            description: '',
            boundedContextsMap: new Map(),
            rootChildren: []
        };

        return new Promise(resolve => {
            this.resolveCurrentProcess = resolve;
            this.processNextChunk();
        });
    }

    createEmptyResult() {
        return {
            siteMap: {
                title: '새로운 웹사이트',
                description: '웹사이트 설명',
                boundedContexts: [],
                navigation: []
            },
            treeData: [{
                id: this.generateNodeId(),
                title: '새로운 웹사이트',
                description: '웹사이트 설명',
                type: 'root',
                boundedContexts: [],
                children: []
            }]
        };
    }

    validateAndEnrichChunks(rawChunks) {
        return rawChunks
            .map((chunk, index) => ({
                content: chunk.trim(),
                chunkIndex: index,
                isValid: this.validateChunkContent(chunk),
                sourceInfo: {
                    startPosition: 0,
                    endPosition: chunk.length,
                    originalLength: chunk.length
                }
            }))
            .filter(chunk => chunk.isValid);
    }

    validateChunkContent(content) {
        if (!content || typeof content !== 'string') {
            return false;
        }

        const trimmed = content.trim();
        if (trimmed.length === 0) {
            return false;
        }

        // 최소 의미있는 문장 길이 체크 (최소 20자)
        if (trimmed.length < 20) {
            console.warn(`RecursiveSiteMapGenerator: Chunk too short (${trimmed.length} chars): "${trimmed}"`);
            return false;
        }

        // 의미있는 단어가 있는지 체크 (최소 3개 단어)
        const words = trimmed.split(/\s+/).filter(word => word.length > 0);
        if (words.length < 3) {
            console.warn(`RecursiveSiteMapGenerator: Chunk has insufficient words (${words.length}): "${trimmed}"`);
            return false;
        }

        return true;
    }

    calculateTotalContextSize(requirementsText) {
        try {
            let totalSize = 0;
            
            // 1. 프롬프트 템플릿 크기 (대략 8000자 추정)
            totalSize += 8000;
            
            // 2. Command/ReadModel 데이터 크기
            if (this.client.input && this.client.input.commandReadModelData) {
                const commandReadModelJson = JSON.stringify(this.client.input.commandReadModelData);
                totalSize += commandReadModelJson.length;
            }
            
            // 3. Bounded Contexts 데이터 크기
            if (this.client.input && this.client.input.resultDevideBoundedContext) {
                const bcJson = JSON.stringify(this.client.input.resultDevideBoundedContext);
                totalSize += bcJson.length;
            }
            
            // 4. 기존 Navigation 데이터 크기 (처음에는 0, 재귀 과정에서 증가)
            if (this.accumulated && this.accumulated.rootChildren) {
                const navJson = JSON.stringify(this.accumulated.rootChildren);
                totalSize += navJson.length;
            }
            
            // 5. 기존 Bounded Contexts 데이터 크기
            if (this.accumulated && this.accumulated.boundedContextsMap) {
                const bcArray = Array.from(this.accumulated.boundedContextsMap.values());
                const bcJson = JSON.stringify(bcArray);
                totalSize += bcJson.length;
            }
            
            // 6. 안전 마진 (10%)
            totalSize = Math.round(totalSize * 1.1);
            
            return totalSize;
            
        } catch (e) {
            console.warn('Failed to calculate total context size:', e);
            return 10000; // 기본값으로 10KB 추정
        }
    }


    splitTextIntoSmallerChunks(text, maxChunkSize) {
        const chunks = [];
        let currentIndex = 0;
        
        while (currentIndex < text.length) {
            let endIndex = currentIndex + maxChunkSize;
            
            // 문장 경계에서 자르기 시도
            if (endIndex < text.length) {
                // 마지막 문장 부호나 줄바꿈을 찾아서 자르기
                const lastSentenceEnd = text.lastIndexOf('.', endIndex);
                const lastNewline = text.lastIndexOf('\n', endIndex);
                const lastBreak = Math.max(lastSentenceEnd, lastNewline);
                
                if (lastBreak > currentIndex + maxChunkSize * 0.7) { // 최소 70%는 유지
                    endIndex = lastBreak + 1;
                }
            }
            
            chunks.push(text.substring(currentIndex, endIndex));
            currentIndex = endIndex;
        }
        
        return chunks;
    }

    updateProgress() {
        if (this.client && this.client.updateMessageState) {
            const progress = Math.round((this.currentChunkIndex / this.currentChunks.length) * 100);
            const siteMapViewerMessage = this.client.messages.find(msg => msg.type === 'siteMapViewer');
            const messageId = siteMapViewerMessage ? siteMapViewerMessage.uniqueId : null;
            
            if (messageId) {
                this.client.updateMessageState(messageId, {
                    processingRate: progress,
                    currentChunk: this.currentChunkIndex + 1,
                    totalChunks: this.currentChunks.length,
                    currentProcessingStep: 'generatingSiteMap'
                });
            }
        }
    }

    processNextChunk() {
        if (this.currentChunkIndex < this.currentChunks.length) {
            const currentChunk = this.currentChunks[this.currentChunkIndex];
            
            // 청크 유효성 검사
            if (!currentChunk || !currentChunk.isValid) {
                console.warn(`RecursiveSiteMapGenerator: Skipping invalid chunk ${this.currentChunkIndex}:`, currentChunk);
                this.currentChunkIndex++;
                setTimeout(() => this.processNextChunk(), 100);
                return;
            }
            
            // 진행 상태 업데이트
            this.updateProgress();
            
            // 유지해야 하는 입력은 그대로 두고, requirements만 청크로 교체
            const originalInput = this.client.input || {};
            this.client.input = {
                ...originalInput,
                requirements: currentChunk.content,
                existingNavigation: this.accumulated.rootChildren,
                existingBoundedContexts: Array.from(this.accumulated.boundedContextsMap.values()),
                // Command/ReadModel 데이터 유지 (이미 추출된 데이터)
                commandReadModelData: originalInput.commandReadModelData,
                // 청크 정보 추가
                currentChunkInfo: {
                    chunkIndex: currentChunk.chunkIndex,
                    sourceInfo: currentChunk.sourceInfo
                }
            };
            this.generate();
        } else {
            // 모든 청크 처리 완료 → 최종 결과 구성
            const rootNode = {
                id: this.generateNodeId(),
                title: this.accumulated.title || '새로운 웹사이트',
                description: this.accumulated.description || '웹사이트 설명',
                type: 'root',
                boundedContexts: Array.from(this.accumulated.boundedContextsMap.values()),
                children: this.accumulated.rootChildren
            };

            const result = {
                siteMap: {
                    title: rootNode.title,
                    description: rootNode.description,
                    boundedContexts: rootNode.boundedContexts,
                    navigation: this.convertToExportFormat(rootNode.children)
                },
                treeData: [rootNode]
            };

            if (this.resolveCurrentProcess) {
                this.resolveCurrentProcess(result);
            }
        }
    }

    getSiteMapRoot(siteMapTree) {
        return siteMapTree && Array.isArray(siteMapTree) && siteMapTree.length > 0 ? siteMapTree[0] : null;
    }

    handleGenerationFinished(model) {
        try {
            if (model && model.treeData && model.treeData.length > 0) {
                const root = this.getSiteMapRoot(model.treeData);
                if (!root) return this.accumulated;
                
                // title/description은 최초 한 번만 채움
                if (!this.accumulated.title) this.accumulated.title = root.title || '';
                if (!this.accumulated.description) this.accumulated.description = root.description || '';

                // BC 병합 (title 기준, title 없으면 id 기준)
                // Bounded Context는 출처 정보가 필요 없음 (Command/ReadModel에 이미 있음)
                const bcs = (model.siteMap && model.siteMap.boundedContexts) || [];
                bcs.forEach(bc => {
                    const key = bc.title || bc.id || JSON.stringify(bc);
                    if (!this.accumulated.boundedContextsMap.has(key)) {
                        this.accumulated.boundedContextsMap.set(key, bc);
                    }
                });

                // navigation 병합 (출처 정보 제외)
                // 사이트맵 노드는 Command/ReadModel을 reference로 연결하므로
                // 출처 추적은 Command/ReadModel의 sourceInfo를 통해 가능
                const children = Array.isArray(root.children) ? root.children : [];
                this.mergeChildren(this.accumulated.rootChildren, children);
            }

            // 다음 청크로
            this.currentChunkIndex++;
            setTimeout(() => this.processNextChunk(), 0);
        } catch (e) {
            console.error('Error handling generation finished:', e);
            // 실패 시에도 다음 청크로 진행
            this.currentChunkIndex++;
            setTimeout(() => this.processNextChunk(), 0);
        }
    }

    mergeChildren(targetChildren, newChildren) {
        for (const child of newChildren) {
            const key = this.nodeKey(child);
            const existing = targetChildren.find(n => this.nodeKey(n) === key);
            if (existing) {
                // 병합: 설명/요구사항 보강, 하위 병합
                if (!existing.description && child.description) existing.description = child.description;
                if (!existing.uiRequirements && child.uiRequirements) existing.uiRequirements = child.uiRequirements;
                
                // Reference 정보 병합 (단일 reference만 유지)
                if (child.reference && !existing.reference) {
                    existing.reference = child.reference;
                }
                
                if (Array.isArray(child.children) && child.children.length > 0) {
                    if (!Array.isArray(existing.children)) existing.children = [];
                    this.mergeChildren(existing.children, child.children);
                }
            } else {
                // 새 노드 추가 (깊은 복사)
                targetChildren.push(JSON.parse(JSON.stringify(child)));
            }
        }
    }

    nodeKey(node) {
        return `${node.boundedContext || ''}::${node.title || ''}`;
    }
}

module.exports = RecursiveSiteMapGenerator;


