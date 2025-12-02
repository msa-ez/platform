const CommandReadModelLangGraphProxy = require('./proxies/CommandReadModelLangGraphProxy');

/**
 * Command/ReadModel 추출 LangGraph Generator
 * 백엔드 LangGraph 워크플로우를 사용하여 Command와 ReadModel 추출
 */
class CommandReadModelExtractorLangGraph {
    constructor(client) {
        this.client = client;
        this.generatorName = 'CommandReadModelExtractorLangGraph';
        this.proxy = null;
    }

    /**
     * Command/ReadModel 추출 (단일 요청)
     */
    async extract(requirements, boundedContexts) {
        return new Promise((resolve, reject) => {
            let isResolved = false;
            
            this.proxy = new CommandReadModelLangGraphProxy({
                onUpdate: (result) => {
                    // 진행 중 업데이트는 무시 (필요시 구현)
                },
                
                onComplete: (result) => {
                    if (isResolved) return;
                    isResolved = true;
                    
                    resolve(result);
                },
                
                onError: (error) => {
                    if (isResolved) return;
                    isResolved = true;
                    
                    reject(new Error(error.error || 'Extraction failed'));
                }
            });
            
            // Proxy를 통해 백엔드 호출
            this.proxy.extract(requirements, boundedContexts).catch(err => {
                if (!isResolved) {
                    isResolved = true;
                    reject(err);
                }
            });
        });
    }

    /**
     * 재귀적 추출
     */
    async extractRecursively(requirements, boundedContexts) {
        // 백엔드에서 자동으로 청크 처리를 하므로 단일 호출로 처리
        return this.extract(requirements, boundedContexts);
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

module.exports = CommandReadModelExtractorLangGraph;

