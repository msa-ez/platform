const JsonAIGenerator = require("./JsonAIGenerator");

class SiteMapGenerator extends JsonAIGenerator {
    constructor(client) {
        super(client, {}, "thinkingModel");
        this.generatorName = 'SiteMapGenerator';
    }

    createPrompt() {
        return `You are an expert DDD architect and UX designer specializing in food delivery applications.

        TASK: Generate a comprehensive site map JSON structure based on the user's domain analysis and user stories.

        REQUIREMENTS:
        ${this.client.input.requirements}

        BOUNDED CONTEXTS LIST:
        ${JSON.stringify(this.client.input.resultDevideBoundedContext)}

        INSTRUCTIONS:
        1. Analyze the provided domain context and bounded contexts list
        2. Create a hierarchical structure that reflects the DDD bounded contexts from the list
        3. Each navigation item should specify which bounded context it belongs to (using the exact names from the bounded contexts list)
        4. Include command APIs and query screens based on the user stories in the domain context
        5. Consider the user journey flow from the requirements
        6. For uiRequirements: extract the exact text from REQUIREMENTS that describes UI/layout requirements for each navigation item. If no specific UI requirements exist, it should be an empty string "".

        OUTPUT FORMAT:
        Return a JSON object with the following structure:
        {
          "siteMap": {
            "title": "Application Title based on domain context",
            "description": "Description based on the application purpose",
            "boundedContexts": [
              {
                "id": "bounded-context-id",
                "title": "Extract as is Bounded Context Name from the provided list",
                "description": "Description of this bounded context's responsibility"
              }
            ],
            "navigation": [
              {
                "id": "navigation-item-id",
                "title": "Navigation Item Title",
                "description": "Description of this navigation item",
                "boundedContext": "Exact as is bounded context title from the site map bounded contexts list",
                "uiRequirements": "Exact text from REQUIREMENTS describing UI/layout, or empty string if none",
                "children": [
                  {
                    "id": "sub-item-id",
                    "title": "Sub-item Title",
                    "description": "Sub-item description",
                    "boundedContext": "Bounded context name",
                    "uiRequirements": "Exact text from REQUIREMENTS or empty string"
                  }
                ]
              }
            ]
          }
        }

        GUIDELINES:
        - Generate the title and description based on the actual domain context provided
        - Use the exact bounded context names from the provided bounded contexts list
        - Create navigation items that reflect the actual user stories and requirements
        - For uiRequirements: copy the exact text from REQUIREMENTS that describes UI/layout requirements. If no UI requirements are mentioned, use empty string "".
        - Ensure each navigation item specifies its boundedContext correctly
        - Structure the navigation logically based on user journey and business processes
        - Consider mobile-first design principles
        - Include essential pages and features mentioned in the requirements
        - Limit main navigation to 5-7 items for optimal UX
        - Group related content logically within appropriate bounded contexts

        IMPORTANT: 
        - Return ONLY the JSON object, no additional text or explanations
        - Base all content on the provided domain context and bounded contexts list
        - Do not use generic examples, use the actual requirements provided
        - uiRequirements must contain exact text from REQUIREMENTS or be empty string ""`;
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
