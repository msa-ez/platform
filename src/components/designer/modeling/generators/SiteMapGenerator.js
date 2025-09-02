const JsonAIGenerator = require("./JsonAIGenerator");

class SiteMapGenerator extends JsonAIGenerator {
    constructor(client) {
        super(client, {}, "thinkingModel");
        this.generatorName = 'SiteMapGenerator';
    }

    createPrompt() {
        return `You are an expert DDD architect and UX designer. Generate a comprehensive site map JSON structure.

        REQUIREMENTS:
        ${this.client.input.requirements}

        EXISTING DATA:
        Navigation: ${JSON.stringify(this.client.input.existingNavigation || [])}
        Bounded Contexts: ${JSON.stringify(this.client.input.existingBoundedContexts || [])}
        Bounded Contexts List: ${JSON.stringify(this.client.input.resultDevideBoundedContext)}

        TASK:
        1. Create hierarchical navigation reflecting DDD bounded contexts
        2. Map each navigation item to exact bounded context names from the list
        3. Extract UI requirements from REQUIREMENTS text (or use empty string "")
        4. Preserve existing navigation items, only enrich or add missing children
        5. Limit main navigation to 5-7 items for optimal UX

        OUTPUT FORMAT (JSON only):
        {
          "siteMap": {
            "title": "Application Title",
            "description": "Application purpose",
            "boundedContexts": [
              {
                "id": "context-id",
                "title": "Exact bounded context name from list",
                "description": "Context responsibility"
              }
            ],
            "navigation": [
              {
                "id": "nav-id",
                "title": "Navigation Title",
                "description": "Item description",
                "boundedContext": "Exact bounded context name",
                "uiRequirements": "Exact text from REQUIREMENTS or \"\"",
                "children": []
              }
            ]
          }
        }

        CRITICAL RULES:
        - Use exact bounded context names from provided list
        - uiRequirements: copy exact text from REQUIREMENTS or use ""
        - Don't duplicate existing navigation items
        - Return ONLY JSON, no explanations`;
    }

    createModel(text) {
        try {
            let model = super.createModel(text);
            
            if(model && model.siteMap){
                // AI 응답을 사이트맵 구조로 변환
                const siteMapData = this.convertToSiteMapStructure(model);
                
                return siteMapData;
            }
        } catch(e) {
            console.log(e);
            return {
                siteMap: {
                    title: "Website Title",
                    description: "Brief description of the website",
                    boundedContexts: [],
                    navigation: []
                }
            };
        }
    }

    convertToSiteMapStructure(aiResponse) {
        try {
            // AI 응답에서 siteMap 데이터 추출
            const siteMap = aiResponse.siteMap || aiResponse;
            
            // 루트 노드 생성
            const rootNode = {
                id: this.generateNodeId(),
                title: siteMap.title || "새로운 웹사이트",
                description: siteMap.description || "웹사이트 설명",
                type: "root",
                boundedContexts: siteMap.boundedContexts || [],
                children: []
            };

            // Navigation을 트리 구조로 변환
            if (siteMap.navigation && Array.isArray(siteMap.navigation)) {
                rootNode.children = siteMap.navigation.map(item => 
                    this.convertNavigationItem(item)
                );
            }

            return {
                siteMap: {
                    title: rootNode.title,
                    description: rootNode.description,
                    boundedContexts: siteMap.boundedContexts || [],
                    navigation: siteMap.navigation || []
                },
                treeData: [rootNode] // SiteMapViewer에서 사용할 트리 구조
            };

        } catch (error) {
            console.error("사이트맵 변환 중 오류:", error);
            return {
                siteMap: {
                    title: "변환 오류",
                    description: "AI 응답을 사이트맵으로 변환하는 중 오류가 발생했습니다.",
                    boundedContexts: [],
                    navigation: []
                },
                treeData: [{
                    id: this.generateNodeId(),
                    title: "변환 오류",
                    description: "AI 응답을 사이트맵으로 변환하는 중 오류가 발생했습니다.",
                    type: "root",
                    boundedContexts: [],
                    children: []
                }]
            };
        }
    }

    convertNavigationItem(item) {
        const node = {
            id: item.id || this.generateNodeId(),
            title: item.title || "새 페이지",
            description: item.description || "",
            type: "navigation",
            boundedContext: item.boundedContext || "",
            uiRequirements: item.uiRequirements || "",
            children: []
        };

        // 하위 항목이 있으면 재귀적으로 변환
        if (item.children && Array.isArray(item.children)) {
            node.children = item.children.map(child => 
                this.convertNavigationItem(child)
            );
        }

        return node;
    }

    convertToExportFormat(children) {
        return children.map(child => ({
            id: child.id,
            title: child.title,
            description: child.description,
            boundedContext: child.boundedContext,
            uiRequirements: child.uiRequirements,
            children: child.children ? this.convertToExportFormat(child.children) : []
        }));
    }

    generateNodeId() {
        return `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}

module.exports = SiteMapGenerator; 
