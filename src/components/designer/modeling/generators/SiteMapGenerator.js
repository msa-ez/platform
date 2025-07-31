const JsonAIGenerator = require("./JsonAIGenerator");

class SiteMapGenerator extends JsonAIGenerator {
    constructor(client) {
        super(client, {}, "thinkingModel");
        this.generatorName = 'SiteMapGenerator';
    }

    createPrompt() {
        return `You are an expert UX/UI designer and information architect who creates comprehensive site maps for websites.

        TASK: Generate a detailed site map JSON structure for the main screen based on the user's requirements.

        requirements:
        ${this.client.input.frontendRequirements}

        INSTRUCTIONS:
        1. Analyze the user's requirements carefully to understand the website's purpose, target audience, and main features
        2. Create a hierarchical site map structure that represents the main navigation and content organization
        3. Consider user journey and information architecture best practices
        4. Include all major sections, subsections, and key pages that should be accessible from the main screen
        5. Structure the JSON to be easily parseable and suitable for visualization

        OUTPUT FORMAT:
        Return a JSON object with the following structure:
        {
          "siteMap": {
            "title": "Website Title",
            "description": "Brief description of the website",
            "mainNavigation": [
              {
                "id": "unique-id",
                "title": "Section Title",
                "url": "/section-url",
                "description": "Brief description of this section",
                "children": [
                  {
                    "id": "sub-section-id",
                    "title": "Sub-section Title", 
                    "url": "/section/sub-section",
                    "description": "Brief description",
                    "children": []
                  }
                ]
              }
            ],
            "secondaryNavigation": [
              {
                "id": "secondary-id",
                "title": "Secondary Section",
                "url": "/secondary-url",
                "description": "Description"
              }
            ],
            "footerLinks": [
              {
                "id": "footer-id",
                "title": "Footer Link",
                "url": "/footer-url"
              }
            ],
            "keyFeatures": [
              {
                "id": "feature-id",
                "title": "Feature Name",
                "description": "Feature description",
                "location": "Where this feature appears"
              }
            ]
          }
        }

        GUIDELINES:
        - Keep section titles clear and user-friendly
        - Use logical URL structures (e.g., /about, /products/category)
        - Include essential pages like Home, About, Contact, etc.
        - Consider mobile-first design principles
        - Ensure the structure supports good SEO practices
        - Include relevant features and functionality mentioned in requirements
        - Limit main navigation to 5-7 items for optimal UX
        - Group related content logically
        - Consider user goals and tasks when organizing content

        IMPORTANT: Return ONLY the JSON object, no additional text or explanations.`;
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
                    mainNavigation: [],
                    secondaryNavigation: [],
                    footerLinks: [],
                    keyFeatures: []
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
                children: []
            };

            // 메인 네비게이션을 하위 노드로 변환
            if (siteMap.mainNavigation && Array.isArray(siteMap.mainNavigation)) {
                rootNode.children = siteMap.mainNavigation.map(item => 
                    this.convertNavigationItem(item)
                );
            }

            // 보조 네비게이션도 추가 (선택적)
            if (siteMap.secondaryNavigation && Array.isArray(siteMap.secondaryNavigation)) {
                const secondaryNodes = siteMap.secondaryNavigation.map(item => 
                    this.convertNavigationItem(item, "secondary")
                );
                rootNode.children = [...rootNode.children, ...secondaryNodes];
            }

            // 푸터 링크도 추가 (선택적)
            if (siteMap.footerLinks && Array.isArray(siteMap.footerLinks)) {
                const footerNodes = siteMap.footerLinks.map(item => 
                    this.convertNavigationItem(item, "footer")
                );
                rootNode.children = [...rootNode.children, ...footerNodes];
            }

            return {
                siteMap: {
                    title: rootNode.title,
                    description: rootNode.description,
                    mainNavigation: this.convertToExportFormat(rootNode.children),
                    secondaryNavigation: siteMap.secondaryNavigation || [],
                    footerLinks: siteMap.footerLinks || [],
                    keyFeatures: siteMap.keyFeatures || []
                },
                treeData: [rootNode] // SiteMapViewer에서 사용할 트리 구조
            };

        } catch (error) {
            console.error("사이트맵 변환 중 오류:", error);
            return {
                siteMap: {
                    title: "변환 오류",
                    description: "AI 응답을 사이트맵으로 변환하는 중 오류가 발생했습니다.",
                    mainNavigation: [],
                    secondaryNavigation: [],
                    footerLinks: [],
                    keyFeatures: []
                },
                treeData: [{
                    id: this.generateNodeId(),
                    title: "변환 오류",
                    description: "AI 응답을 사이트맵으로 변환하는 중 오류가 발생했습니다.",
                    type: "root",
                    children: []
                }]
            };
        }
    }

    convertNavigationItem(item, type = "page") {
        const node = {
            id: item.id || this.generateNodeId(),
            title: item.title || "새 페이지",
            description: item.description || "",
            type: type,
            url: item.url || "",
            children: []
        };

        // 하위 항목이 있으면 재귀적으로 변환
        if (item.children && Array.isArray(item.children)) {
            node.children = item.children.map(child => 
                this.convertNavigationItem(child, "subpage")
            );
        }

        return node;
    }

    convertToExportFormat(children) {
        return children.map(child => ({
            id: child.id,
            title: child.title,
            description: child.description,
            url: child.url,
            children: child.children ? this.convertToExportFormat(child.children) : []
        }));
    }

    generateNodeId() {
        return `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}

module.exports = SiteMapGenerator; 
