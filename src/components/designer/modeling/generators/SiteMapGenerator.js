const JsonAIGenerator = require("./JsonAIGenerator");

class SiteMapGenerator extends JsonAIGenerator {
    constructor(client) {
        super(client, {}, "thinkingModel");
        this.generatorName = 'SiteMapGenerator';
    }

    createPrompt() {
        const hasExistingNavigation = this.client.input.existingNavigation && 
                                      this.client.input.existingNavigation.length > 0;
        
        let existingDataPrompt = '';
        if (hasExistingNavigation) {
            const existingTitles = this.extractExistingTitles(this.client.input.existingNavigation);
            existingDataPrompt = `
ALREADY GENERATED PAGES (DO NOT DUPLICATE):
${existingTitles.join(', ')}

IMPORTANT: 
- Only generate NEW pages and components from the current requirements chunk
- Do not regenerate pages that are already in the list above
- If a requirement relates to an existing page, skip it
- Focus only on extracting NEW content from the current chunk
`;
        }

        return `You are an expert UX designer and web architect. Generate a comprehensive website sitemap JSON structure based on user requirements.

        REQUIREMENTS:
        ${this.client.input.requirements}

        ${existingDataPrompt}

        BOUNDED CONTEXTS:
        Bounded Contexts List: ${JSON.stringify(this.client.input.resultDevideBoundedContext.filter(bc => bc.name !== 'ui'))}
        Command/ReadModel Data: ${JSON.stringify(this.client.input.commandReadModelData || {})}

        TASK:
        Generate a user-friendly website sitemap that represents actual web pages and sections.
        Focus on user experience and logical page organization, not technical implementation.
        Create a hierarchical structure that makes sense to end users.
        
        COMMAND/READMODEL INTEGRATION:
        CRITICAL: You MUST use the provided Command/ReadModel data to create accurate UI components with proper references.
        
        COMMAND/READMODEL TYPES:
        
        Command Types (Business Logic):
        - Creation Commands: Create[Entity], Register[Entity], Add[Entity]
        - Update Commands: Update[Entity], Modify[Entity], Change[Entity]
        - Deletion Commands: Delete[Entity], Remove[Entity], Cancel[Entity]
        - Process Commands: Process[Action], Confirm[Entity], Validate[Entity]
        - Integration Commands: Sync[Entity], Notify[Entity], Detect[Condition]
        
        ReadModel Types (Query Operations):
        - Entity Queries: [Entity]Detail, [Entity]Profile, [Entity]Info
        - List Queries: [Entity]List, [Entity]History, [Entity]Search
        - Admin Queries: [Entity]ListAdmin, [Entity]Statistics, [Entity]Report
        - UI Support: [Entity]FormView, [Entity]SearchView, [Entity]Options
        - Status Queries: [Entity]Status, [Entity]Availability, [Entity]Alert
        
        REFERENCE RULES:
        - Each component must reference exactly ONE Command or ReadModel from the provided data
        - Use the actual Command/ReadModel names from the Command/ReadModel Data section
        - Exclude pure UI components (Header, Footer, Navbar) - focus on business logic components only

        STRUCTURE GUIDELINES:
        - Home page as the root with main navigation sections as children
        - Main sections (e.g., Rooms, Amenities, Contact Us) as direct children of Home
        - Each main section contains business logic components only
        - Page components are organized vertically under each main section
        - Clear 3-level hierarchy: Home → Main Pages → Business Components
        - Focus on actual website structure with Home as entry point
        - Group business logic components under their parent page for better organization
        - Each component should have only ONE reference (single Command or ReadModel)
        - Exclude pure UI components (Header, Footer, Navbar) - focus on business logic components only
        - Create separate components for different business operations (e.g., separate login form and register form)

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
                    "id": "component-id",
                    "title": "Component Title",
                    "url": "",
                    "description": "Component description",
                    "reference": "CommandOrReadModelName"
                  }
                ]
              }
            ]
          }
        }

        RULES:
        - Create logical page structure based on requirements
        - Each component must reference exactly ONE Command or ReadModel
        - Exclude pure UI components (Header, Footer, Navbar)
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
            reference: page.reference || null,
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
            reference: child.reference || null,
            children: child.children ? this.convertToExportFormat(child.children) : []
        }));
    }

    generateNodeId() {
        return `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    extractExistingTitles(navigation) {
        const titles = [];
        const extractRecursive = (nodes) => {
            for (const node of nodes) {
                if (node.title) {
                    titles.push(node.title);
                }
                if (node.children && Array.isArray(node.children)) {
                    extractRecursive(node.children);
                }
            }
        };
        extractRecursive(navigation);
        return titles;
    }

}

module.exports = SiteMapGenerator; 
