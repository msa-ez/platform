/**
 * RecursiveCommandReadModelExtractorLangGraph
 * 
 * LangGraph 백엔드를 사용하는 Command/ReadModel Extractor
 * 긴 요구사항도 백엔드에서 처리하므로 단일 요청으로 처리
 */
const CommandReadModelLangGraphProxy = require('./proxies/CommandReadModelLangGraphProxy');

class RecursiveCommandReadModelExtractorLangGraph {
    constructor(client) {
        this.client = client;
        this.generatorName = 'RecursiveCommandReadModelExtractorLangGraph';
        this.proxy = null;
    }

    /**
     * 재귀적으로 Command/ReadModel 추출
     * 백엔드에서 자동으로 청크 처리를 하므로 단일 호출로 처리
     * 
     * @param {string} requirementsText - 요구사항 텍스트
     * @param {Array} boundedContexts - Bounded Contexts 배열
     * @returns {Promise<Object>} 추출된 데이터
     */
    async extractRecursively(requirementsText, boundedContexts) {
        if (!requirementsText || requirementsText.trim().length === 0) {
            throw new Error('요구사항 텍스트가 비어있습니다.');
        }
        
        return new Promise((resolve, reject) => {
            let isResolved = false;
            
            this.proxy = new CommandReadModelLangGraphProxy({
                onUpdate: (result) => {
                    // 진행률 업데이트
                    const siteMapViewerMessage = this.client.messages.find(msg => msg.type === 'siteMapViewer');
                    if (siteMapViewerMessage) {
                        this.client.updateMessageState(siteMapViewerMessage.uniqueId, {
                            processingRate: result.progress || 0,
                            currentProcessingStep: 'extractingCommandsAndReadModels'
                        });
                    }
                },
                
                onComplete: (result) => {
                    if (isResolved) return;
                    isResolved = true;
                    
                    resolve({
                        extractedData: result.extractedData
                    });
                },
                
                onError: (error) => {
                    if (isResolved) return;
                    isResolved = true;
                    
                    reject(new Error(error.error || 'Extraction failed'));
                }
            });
            
            // Proxy를 통해 백엔드 호출
            this.proxy.extract(requirementsText, boundedContexts).catch(err => {
                if (!isResolved) {
                    isResolved = true;
                    reject(err);
                }
            });
        });
    }

    /**
     * 정리 (프록시 정리 등)
     */
    destroy() {
        if (this.proxy) {
            this.proxy.destroy();
            this.proxy = null;
        }
    }
}

module.exports = RecursiveCommandReadModelExtractorLangGraph;

