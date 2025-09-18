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
        Bounded Contexts List: ${JSON.stringify(this.client.input.resultDevideBoundedContext.filter(bc => bc.name !== 'ui'))}

        TASK:
        Generate a hierarchical site map based on requirements and bounded contexts.
        Each navigation item should represent a SINGLE UI function (view or command).
        Group related functions under logical parent categories.

        STRUCTURE OPTIONS:
        - Single Service: One website with multiple navigation categories
        - Multi-Service: Multiple independent websites (e.g., customer app, admin panel, delivery app)

        OUTPUT FORMAT:
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
                "title": "Category Title (e.g., 'User Management' or 'Order Management')",
                "description": "Category description",
                "boundedContext": "Exact bounded context name",
                "functionType": "",
                "uiRequirements": "",
                "children": [
                  {
                    "id": "child-nav-id",
                    "title": "Single Function Title (e.g., 'User List View' or 'Create User Command')",
                    "name": "PascalCaseName",
                    "description": "Specific function description",
                    "boundedContext": "Exact bounded context name",
                    "functionType": "view" or "command",
                    "uiRequirements": "Specific UI requirements for this single function",
                    "children": []
                  }
                ]
              }
            ]
          }
        }

        RULES:
        - Use exact bounded context names from provided list
        - functionType: "" for groups, "view"/"command" for functions
        - Each function must be atomic (single responsibility)
        - Group functions by user role or business domain
        - Create meaningful parent-child relationships, not flat structure
        - Don't duplicate existing navigation items
        - Break complex pages into individual functional units
        - Return ONLY JSON, no explanations`;
    }

    createModel(text) {
        try {
            let model = super.createModel(text);
            
            if(model && model.siteMap){
                const returnObj = { 
                    siteMap: this.convertToSiteMapStructure(model),
                    currentGeneratedLength: JSON.stringify(model).length
                };
                
                return returnObj;
            }
        } catch(e) {
            console.log(e);
            return {
                siteMap: {
                    title: "Website Title",
                    description: "Brief description of the website",
                    boundedContexts: [],
                    navigation: []
                },
                currentGeneratedLength: 0
            };
        }
    }

    convertToSiteMapStructure(aiResponse) {
        try {
            // AI 응답에서 siteMap 데이터 추출
            const siteMap = aiResponse.siteMap || aiResponse;
            
            // 여러 루트 노드 지원
            const rootNodes = [];
            
            if (siteMap.navigation && Array.isArray(siteMap.navigation)) {
                siteMap.navigation.forEach(item => {
                    const rootNode = {
                        id: this.generateNodeId(),
                        title: item.title || "New Website",
                        description: item.description || "Website description",
                        type: "root",
                        boundedContexts: siteMap.boundedContexts || [],
                        children: item.children ? item.children.map(child => 
                            this.convertNavigationItem(child)
                        ) : []
                    };
                    rootNodes.push(rootNode);
                });
            } else {
                const rootNode = {
                    id: this.generateNodeId(),
                    title: siteMap.title || "New Website",
                    description: siteMap.description || "Website description",
                    type: "root",
                    boundedContexts: siteMap.boundedContexts || [],
                    children: []
                };
                rootNodes.push(rootNode);
            }

            return {
                siteMap: {
                    title: siteMap.title || "New Website",
                    description: siteMap.description || "Website description",
                    boundedContexts: siteMap.boundedContexts || [],
                    navigation: siteMap.navigation || []
                },
                treeData: rootNodes // SiteMapViewer에서 사용할 트리 구조 (다중 루트 지원)
            };

        } catch (error) {
            console.error("Error converting site map:", error);
            return {
                siteMap: {
                    title: "Conversion Error",
                    description: "Error converting AI response to site map",
                    boundedContexts: [],
                    navigation: []
                },
                treeData: [{
                    id: this.generateNodeId(),
                    title: "Conversion Error",
                    description: "Error converting AI response to site map",
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
            title: item.title || "New Page",
            name: item.name || "NewPage",
            description: item.description || "",
            type: "navigation",
            boundedContext: item.boundedContext || "",
            functionType: item.functionType || "", // 빈 문자열이면 카테고리 노드, "view"/"command"면 실제 기능
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
            name: child.name,
            description: child.description,
            boundedContext: child.boundedContext,
            functionType: child.functionType,
            uiRequirements: child.uiRequirements,
            children: child.children ? this.convertToExportFormat(child.children) : []
        }));
    }

    generateNodeId() {
        return `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    _uiBoundedContextPrompt() {
        if(this.client.input.resultDevideBoundedContext.some(bc => bc.name === 'ui')){
            return `
            **SPECIAL HANDLING FOR "ui" BOUNDED CONTEXT**
            - If "ui" exists in bounded contexts list, treat it as the common UI/UX layer
            - Analyze REQUIREMENTS text to identify individual UI functions (views/commands)
            - Create hierarchical navigation with parent categories grouping related UI functions
            - Map these individual functions to the "ui" bounded context
            - Each item should represent ONE specific function (e.g., "Login View", "Logout Command")
            - Group UI functions by user role or business domain (e.g., "Customer View", "Admin View")
            - Focus on individual UI components rather than complex pages with multiple features
            - Break down complex UI requirements into atomic functional units
            - Create meaningful parent-child relationships for better navigation structure
            `;
        }
        return "";
    }
}

module.exports = SiteMapGenerator; 
