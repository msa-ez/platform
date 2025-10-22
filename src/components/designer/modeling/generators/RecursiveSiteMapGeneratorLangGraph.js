/**
 * RecursiveSiteMapGeneratorLangGraph
 * 
 * LangGraph 백엔드를 사용하는 SiteMap Generator
 * 긴 요구사항도 백엔드에서 처리하므로 단일 요청으로 처리
 */
const SiteMapLangGraphProxy = require('./proxies/SiteMapLangGraphProxy');

class RecursiveSiteMapGeneratorLangGraph {
    constructor(client) {
        this.client = client;
        this.generatorName = 'RecursiveSiteMapGeneratorLangGraph';
        this.proxy = null;
    }

    /**
     * 재귀적으로 SiteMap 생성
     * 백엔드에서 자동으로 청크 처리를 하므로 단일 호출로 처리
     * 
     * @param {string} requirementsText - 요구사항 텍스트
     * @param {Array} boundedContexts - Bounded Contexts 배열
     * @param {Object} commandReadModelData - Command/ReadModel 데이터
     * @param {Array} existingNavigation - 기존 Navigation 데이터 (선택)
     * @returns {Promise<Object>} 생성된 SiteMap
     */
    async generateRecursively(requirementsText, boundedContexts, commandReadModelData, existingNavigation = []) {
        if (!requirementsText || requirementsText.trim().length === 0) {
            return this._createEmptyResult();
        }
        
        return new Promise((resolve, reject) => {
            let isResolved = false;
            
            this.proxy = new SiteMapLangGraphProxy({
                onUpdate: (result) => {
                    // 진행률 업데이트
                    const siteMapViewerMessage = this.client.messages.find(msg => msg.type === 'siteMapViewer');
                    if (siteMapViewerMessage) {
                        this.client.updateMessageState(siteMapViewerMessage.uniqueId, {
                            processingRate: result.progress || 0,
                            currentProcessingStep: 'generatingSiteMap'
                        });
                    }
                },
                
                onComplete: (result) => {
                    if (isResolved) return;
                    isResolved = true;
                    
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
            this.proxy.generate(requirementsText, boundedContexts, commandReadModelData, existingNavigation).catch(err => {
                if (!isResolved) {
                    isResolved = true;
                    reject(err);
                }
            });
        });
    }

    /**
     * 빈 결과 생성
     */
    _createEmptyResult() {
        return {
            siteMap: {
                title: '새로운 웹사이트',
                description: '웹사이트 설명',
                pages: []
            },
            treeData: [{
                id: this._generateNodeId(),
                title: '새로운 웹사이트',
                description: '웹사이트 설명',
                type: 'root',
                children: []
            }]
        };
    }

    /**
     * 노드 ID 생성
     */
    _generateNodeId() {
        return `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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

module.exports = RecursiveSiteMapGeneratorLangGraph;
