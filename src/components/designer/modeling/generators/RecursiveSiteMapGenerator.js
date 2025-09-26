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
        // 전체 컨텍스트 크기 계산하여 청크 크기 동적 조정
        const totalContextSize = this.calculateTotalContextSize(requirementsText);
        const maxChunkSize = 25000;
        const adjustedChunkSize = Math.max(15000, maxChunkSize - totalContextSize);
        
        console.log(`RecursiveSiteMapGenerator - Total context size: ${totalContextSize}, Adjusted chunk size: ${adjustedChunkSize}`);
        
        // 청크 크기를 동적으로 조정
        this.textChunker.chunkSize = adjustedChunkSize;
        
        this.currentChunks = this.textChunker.splitIntoChunks(requirementsText || '');
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

    calculateAccumulatedDataSize() {
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
            
            // 4. 누적된 Navigation 데이터 크기
            if (this.accumulated && this.accumulated.rootChildren) {
                const navJson = JSON.stringify(this.accumulated.rootChildren);
                totalSize += navJson.length;
            }
            
            // 5. 누적된 Bounded Contexts 데이터 크기
            if (this.accumulated && this.accumulated.boundedContextsMap) {
                const bcArray = Array.from(this.accumulated.boundedContextsMap.values());
                const bcJson = JSON.stringify(bcArray);
                totalSize += bcJson.length;
            }
            
            // 6. 안전 마진 (10%)
            totalSize = Math.round(totalSize * 1.1);
            
            return totalSize;
            
        } catch (e) {
            console.warn('Failed to calculate accumulated data size:', e);
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
            const chunkText = this.currentChunks[this.currentChunkIndex];
            
            // 진행 상태 업데이트
            this.updateProgress();
            
            // 재귀 과정에서 누적된 데이터 크기도 고려하여 청크 크기 재조정
            const accumulatedDataSize = this.calculateAccumulatedDataSize();
            const maxChunkSize = 25000;
            const adjustedChunkSize = Math.max(10000, maxChunkSize - accumulatedDataSize);
            
            // 청크 크기가 현재 청크보다 작으면 청크를 더 작게 나눔
            if (adjustedChunkSize < chunkText.length) {
                console.log(`RecursiveSiteMapGenerator - Chunk ${this.currentChunkIndex + 1}: Adjusting chunk size from ${chunkText.length} to ${adjustedChunkSize}`);
                // 현재 청크를 더 작게 나누기
                const subChunks = this.splitTextIntoSmallerChunks(chunkText, adjustedChunkSize);
                this.currentChunks.splice(this.currentChunkIndex, 1, ...subChunks);
            }
            
            // 유지해야 하는 입력은 그대로 두고, requirements만 청크로 교체
            const originalInput = this.client.input || {};
            this.client.input = {
                ...originalInput,
                requirements: chunkText,
                existingNavigation: this.accumulated.rootChildren,
                existingBoundedContexts: Array.from(this.accumulated.boundedContextsMap.values()),
                // Command/ReadModel 데이터 유지 (이미 추출된 데이터)
                commandReadModelData: originalInput.commandReadModelData
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
                const bcs = (model.siteMap && model.siteMap.boundedContexts) || [];
                bcs.forEach(bc => {
                    const key = bc.title || bc.id || JSON.stringify(bc);
                    if (!this.accumulated.boundedContextsMap.has(key)) {
                        this.accumulated.boundedContextsMap.set(key, bc);
                    }
                });

                // navigation 병합
                const children = Array.isArray(root.children) ? root.children : [];
                this.mergeChildren(this.accumulated.rootChildren, children);
            }

            // 다음 청크로
            this.currentChunkIndex++;
            setTimeout(() => this.processNextChunk(), 0);
        } catch (e) {
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


