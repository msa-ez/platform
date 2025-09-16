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

    processNextChunk() {
        if (this.currentChunkIndex < this.currentChunks.length) {
            const chunkText = this.currentChunks[this.currentChunkIndex];
            // 유지해야 하는 입력은 그대로 두고, requirements만 청크로 교체
            const originalInput = this.client.input || {};
            this.client.input = {
                ...originalInput,
                requirements: chunkText,
                existingNavigation: this.accumulated.rootChildren,
                existingBoundedContexts: Array.from(this.accumulated.boundedContextsMap.values())
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


