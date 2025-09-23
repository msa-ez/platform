const JsonAIGenerator = require("./JsonAIGenerator");

class SiteMapGenerator extends JsonAIGenerator {
    constructor(client) {
        super(client, {}, "thinkingModel");
        this.generatorName = 'SiteMapGenerator';
    }

    createPrompt() {
        return `You are an expert UX designer and web architect. Generate a comprehensive website sitemap JSON structure based on user requirements.

        REQUIREMENTS:
        ${this.client.input.requirements}

        EXISTING DATA:
        Navigation: ${JSON.stringify(this.client.input.existingNavigation || [])}
        Bounded Contexts: ${JSON.stringify(this.client.input.existingBoundedContexts || [])}
        Bounded Contexts List: ${JSON.stringify(this.client.input.resultDevideBoundedContext.filter(bc => bc.name !== 'ui'))}

        TASK:
        Generate a user-friendly website sitemap that represents actual web pages and sections.
        Focus on user experience and logical page organization, not technical implementation.
        Create a hierarchical structure that makes sense to end users.

        STRUCTURE GUIDELINES:
        - Home page as the root with main navigation sections as children
        - Main sections (e.g., Rooms, Amenities, Contact Us) as direct children of Home
        - Each main section contains page components/sections (e.g., Navbar, Header, Content sections)
        - Page components are organized vertically under each main section
        - Clear 3-level hierarchy: Home → Main Pages → Page Components
        - Focus on actual website structure with Home as entry point
        - Group page components under their parent page for better organization
        - Each page should have its own component structure (Navbar, Header, Content, Footer, etc.)

        OUTPUT FORMAT:
        {
          "siteMap": {
            "title": "Website Title",
            "description": "Website purpose and description",
            "pages": [
              {
                "id": "page-id",
                "title": "Page Title",
                "url": "/page-url",
                "description": "Page description",
                "children": [
                  {
                    "id": "navbar-id",
                    "title": "네비게이션 바",
                    "url": "",
                    "description": "사이트 주요 메뉴 및 로그인/회원가입 진입"
                  },
                  {
                    "id": "header-id",
                    "title": "헤더 섹션",
                    "url": "",
                    "description": "메인 비주얼 및 서비스 소개"
                  },
                  {
                    "id": "content-id",
                    "title": "검색 바",
                    "url": "",
                    "description": "날짜 위치 인원 등 객실 검색 입력"
                  }
                ]
              }
            ]
          }
        }

        RULES:
        - Create pages that users would actually visit
        - Use clear, user-friendly page titles
        - Include logical URL structure
        - Group related pages under main sections
        - Consider user journey and navigation flow
        - Include essential pages (Home, About, Contact, etc.)
        - Add business-specific pages based on requirements
        - Keep hierarchy simple and intuitive
        - For each main page, include its components (Navbar, Header, Content sections, etc.)
        - Group page components under their parent page
        - Each page should have a clear component structure
        - Page components don't need URLs (leave empty)
        - Focus on component titles and descriptions
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
            
            // 홈페이지를 루트로 하는 단일 트리 구조
            const homePage = {
                id: this.generateNodeId(),
                title: siteMap.title || "Home",
                url: "", // 루트 노드는 URL 없음
                description: siteMap.description || "Website homepage",
                children: []
            };

            // 페이지들을 홈페이지의 자식으로 변환
            if (siteMap.pages && Array.isArray(siteMap.pages)) {
                homePage.children = siteMap.pages.map(page => 
                    this.convertPageItem(page)
                );
            }

            return {
                siteMap: {
                    title: siteMap.title || "Website",
                    description: siteMap.description || "Website description",
                    pages: siteMap.pages || []
                },
                treeData: [homePage] // SiteMapViewer에서 사용할 트리 구조
            };

        } catch (error) {
            console.error("Error converting site map:", error);
            const defaultHomePage = {
                id: this.generateNodeId(),
                title: "Home",
                url: "", // 루트 노드는 URL 없음
                description: "Website homepage",
                children: []
            };
            
            return {
                siteMap: {
                    title: "Website",
                    description: "Website description",
                    pages: []
                },
                treeData: [defaultHomePage]
            };
        }
    }

    convertPageItem(page) {
        const node = {
            id: page.id || this.generateNodeId(),
            title: page.title || "New Page",
            url: page.url || "/" + (page.title || "new-page").toLowerCase().replace(/\s+/g, '-'),
            description: page.description || "",
            children: []
        };

        // 하위 페이지가 있으면 재귀적으로 변환
        if (page.children && Array.isArray(page.children)) {
            node.children = page.children.map(child => 
                this.convertPageItem(child)
            );
        }

        return node;
    }

    convertToExportFormat(children) {
        return children.map(child => ({
            id: child.id,
            title: child.title,
            url: child.url,
            description: child.description,
            children: child.children ? this.convertToExportFormat(child.children) : []
        }));
    }

    generateNodeId() {
        return `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }


}

module.exports = SiteMapGenerator; 
