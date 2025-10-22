const SiteMapLangGraphProxy = require('./proxies/SiteMapLangGraphProxy');

/**
 * SiteMap 생성 LangGraph Generator
 * 백엔드 LangGraph 워크플로우를 사용하여 SiteMap 생성
 */
class SiteMapGeneratorLangGraph {
    constructor(client) {
        this.client = client;
        this.generatorName = 'SiteMapGeneratorLangGraph';
        this.proxy = null;
    }

    /**
     * SiteMap 생성 (단일 요청)
     */
    async generate(requirements, boundedContexts, commandReadModelData, existingNavigation = []) {
        return new Promise((resolve, reject) => {
            let isResolved = false;
            
            this.proxy = new SiteMapLangGraphProxy({
                onUpdate: (result) => {
                    // 진행 중 업데이트는 무시 (필요시 구현)
                },
                
                onComplete: (result) => {
                    if (isResolved) return;
                    isResolved = true;
                    
                    // treeData 형식으로 변환
                    const siteMapData = result.siteMap || {};
                    const treeData = [{
                        id: this._generateNodeId(),
                        title: siteMapData.title || '새로운 웹사이트',
                        description: siteMapData.description || '웹사이트 설명',
                        type: 'root',
                        children: siteMapData.pages || []
                    }];
                    
                    const finalResult = {
                        siteMap: {
                            title: siteMapData.title || '새로운 웹사이트',
                            description: siteMapData.description || '웹사이트 설명',
                            pages: siteMapData.pages || [],
                            treeData: treeData
                        }
                    };
                    
                    resolve(finalResult);
                },
                
                onError: (error) => {
                    if (isResolved) return;
                    isResolved = true;
                    
                    reject(new Error(error.error || 'Generation failed'));
                }
            });
            
            // Proxy를 통해 백엔드 호출
            this.proxy.generate(requirements, boundedContexts, commandReadModelData, existingNavigation).catch(err => {
                if (!isResolved) {
                    isResolved = true;
                    reject(err);
                }
            });
        });
    }

    /**
     * 재귀적 생성
     */
    async generateRecursively(requirements, boundedContexts, commandReadModelData, existingNavigation = []) {
        // 백엔드에서 자동으로 청크 처리를 하므로 단일 호출로 처리
        return this.generate(requirements, boundedContexts, commandReadModelData, existingNavigation);
    }

    /**
     * 노드 ID 생성
     */
    _generateNodeId() {
        return `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 정리
     */
    destroy() {
        if (this.proxy) {
            this.proxy.destroy();
            this.proxy = null;
        }
    }
}

module.exports = SiteMapGeneratorLangGraph;

