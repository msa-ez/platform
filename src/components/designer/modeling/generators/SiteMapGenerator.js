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
        
        REFERENCE TRACKING RULES:
        For each UI component (page children), you MUST specify which Commands and ReadModels it references:
        - referencedCommands: Array of EXACT command names from the provided data
        - referencedReadModels: Array of EXACT read model names from the provided data
        - Pages (parent containers) typically don't reference commands/readmodels directly - only their child components do
        - Each child component can reference multiple commands/readmodels if it supports multiple operations
        - You MUST be specific and accurate in referencing the actual Command/ReadModel names from the provided data
        - Empty arrays [] are ONLY acceptable if the component truly doesn't interact with any commands/readmodels
        
        MANDATORY EXAMPLES:
        - "로그인 폼" component → referencedCommands: ["LoginUser"], referencedReadModels: []
        - "회원가입 폼" component → referencedCommands: ["RegisterUser"], referencedReadModels: []
        - "메인 네비게이션 바" component → referencedCommands: ["LoginUser", "RegisterUser"], referencedReadModels: ["UserProfile"]
        - "검색 입력 폼" component → referencedCommands: [], referencedReadModels: ["EntitySearchView"] (UI 지원 데이터)
        - "검색 결과" component → referencedCommands: [], referencedReadModels: ["EntitySearch", "EntityAvailability"]
        - "등록/생성 폼" component → referencedCommands: ["CreateEntity"], referencedReadModels: ["EntityFormView"]
        - "결제 폼" component → referencedCommands: [], referencedReadModels: ["PaymentFormView"]
        - "목록 화면" component → referencedCommands: [], referencedReadModels: ["EntityHistory"]
        - "상세 정보 화면" component → referencedCommands: ["UpdateEntity", "DeleteEntity"], referencedReadModels: ["EntityDetail"]
        - "문의 등록 폼" component → referencedCommands: ["CreateInquiry"], referencedReadModels: ["InquiryFormView"]
        - "내 문의 내역" component → referencedCommands: [], referencedReadModels: ["InquiryListUser"]
        - "관리 화면" component → referencedCommands: ["CreateEntity", "UpdateEntity", "DeleteEntity", "SyncEntity"], referencedReadModels: ["EntityListAdmin"]
        - "모니터링 화면" component → referencedCommands: ["DetectCondition"], referencedReadModels: ["EntityListAdmin"]
        - "문의 관리" component → referencedCommands: ["AnswerInquiry", "UpdateInquiryStatus"], referencedReadModels: ["InquiryListAdmin"]
        - "프로필 정보" component → referencedCommands: [], referencedReadModels: ["UserProfile"]
        - "상세 정보 모달" component → referencedCommands: [], referencedReadModels: ["EntityDetail", "EntityStatus"]
        
        REFERENCE RULES:
        - 입력 폼 컴포넌트: 해당하는 Command + UI 지원 ReadModel 참조 (예: 등록 폼 → CreateEntity + EntityFormView)
        - 결과 표시 컴포넌트: 데이터 조회 ReadModel 참조 (예: 검색 결과 → EntitySearch, EntityAvailability)
        - 관리 기능 컴포넌트: CRUD Command들 + 관리자용 ReadModel 참조 (예: 관리 화면 → CreateEntity + EntityListAdmin)
        - 정보 표시 컴포넌트: 단일 조회 ReadModel 참조 (예: 프로필 → UserProfile)
        - 검색/필터 컴포넌트: UI 지원 ReadModel 참조 (예: 검색 폼 → EntitySearchView)
        - 통계/모니터링 컴포넌트: 통계 ReadModel 참조 (예: 현황 화면 → EntityListAdmin, ConditionAlert)
        - 상세 정보 컴포넌트: 상세 ReadModel + 상태 ReadModel 참조 (예: 상세 모달 → EntityDetail + EntityStatus)
        - 정적 콘텐츠: 헤더, 푸터, 약관 등은 참조 없음
        - 외부 시스템 연동: UI 지원 ReadModel만 참조 (예: 결제 폼 → PaymentFormView)

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
                    "description": "사이트 주요 메뉴 및 로그인/회원가입 진입",
                    "referencedCommands": ["LoginCommand", "SignupCommand"],
                    "referencedReadModels": ["UserProfileReadModel"]
                  },
                  {
                    "id": "header-id",
                    "title": "헤더 섹션",
                    "url": "",
                    "description": "메인 비주얼 및 서비스 소개",
                    "referencedCommands": [],
                    "referencedReadModels": ["ServiceInfoReadModel"]
                  },
                  {
                    "id": "search-form-id",
                    "title": "검색 폼",
                    "url": "",
                    "description": "날짜 위치 인원 등 객실 검색 입력",
                    "referencedCommands": ["SearchCommand"],
                    "referencedReadModels": []
                  },
                  {
                    "id": "search-results-id",
                    "title": "검색 결과",
                    "url": "",
                    "description": "검색된 객실 목록 표시",
                    "referencedCommands": ["BookCommand", "ViewDetailsCommand"],
                    "referencedReadModels": ["SearchResultReadModel", "FilterOptionReadModel"]
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
            referencedCommands: page.referencedCommands || [],
            referencedReadModels: page.referencedReadModels || [],
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
            referencedCommands: child.referencedCommands || [],
            referencedReadModels: child.referencedReadModels || [],
            children: child.children ? this.convertToExportFormat(child.children) : []
        }));
    }

    generateNodeId() {
        return `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }


}

module.exports = SiteMapGenerator; 
