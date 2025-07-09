const JsonAIGenerator = require("./JsonAIGenerator");

class RequirementsMappingGenerator extends JsonAIGenerator {
    constructor(client) {
        super(client);
        this.model = "gpt-4o";
        this.temperature = 0.5;
        this.generatorName = 'RequirementsMappingGenerator';
    }

    createPrompt() {
        return `
Analyze this requirements chunk and determine if it contains any content relevant to the following Bounded Context.
Return empty array if no relevant content is found.

Current Bounded Context:
Name: ${this.client.input['boundedContext'].name}
Alias: ${this.client.input['boundedContext'].alias}
implementationStrategy: ${this.client.input['boundedContext'].implementationStrategy}
importance: ${this.client.input['boundedContext'].importance}
Aggregates: ${JSON.stringify(this.client.input['boundedContext'].aggregates)}
Events: ${JSON.stringify(this.client.input['boundedContext'].events)}

Requirements or Analysis Result(Actors and Events) or DDL Chunk:
${this.parseRequirements(this.client.input['requirementChunk'])}

${this.frontEndMappingPrompt()}

Important Instructions:
1. Consider the following aspects when determining relevance:
   - Direct references to the Bounded Context's name, alias, or aggregates
   - Business processes or workflows that this Bounded Context is responsible for
   - Data structures or entities that align with the Bounded Context's aggregates
   - Events that are published or consumed by this Bounded Context
   - User stories that describe functionality within this Bounded Context's domain
   - Even if a DDL table name does not directly match the Bounded Context, if its field names (such as order_id, product_id, etc.) are clearly related to the Bounded Context's aggregates, entities, or events, consider it relevant.

2. Include content if it:
   - Directly mentions or relates to the Bounded Context's core responsibilities
   - Describes processes or data that this Bounded Context manages
   - Contains events that this Bounded Context handles
   - Includes user stories that fall within this Bounded Context's domain
   - References entities or concepts that are part of this Bounded Context's aggregates

3. When in doubt:
   - Consider the Bounded Context's implementation strategy and importance
   - Look for indirect relationships through the aggregates and events
   - Include content if it's part of the same business domain
   - Err on the side of inclusion if the relationship is plausible

Format your response as:
{
    "relevantRequirements": 
    [
        {
            "type": "userStory || DDL || Event",
            "text": "exact text from the chunk that is definitely related to this BC" // If an object comes, write it as a string
        }
    ]
    // or just "relevantRequirements": [] if nothing is relevant
}

When no relevant content:
{
    "relevantRequirements": []
}
`;
    }

    parseRequirements(requirementChunk){
        if(typeof requirementChunk === 'object'){
            return JSON.stringify(requirementChunk);
        }else{
            return requirementChunk;
        }
    }

    frontEndMappingPrompt(){
        if(this.client.input['boundedContext'].name === 'frontend'){
            return `
            SPECIAL INSTRUCTIONS FOR FRONTEND BOUNDED CONTEXT:
            
            For frontend bounded context, ONLY map requirements that are related to:
            
            1. **UI Screens and Pages:**
               - 화면 이름, 페이지 이름 (예: 홈 화면, 음식점 목록 화면, 장바구니 화면)
               - 화면 구성 요소 (예: 메뉴 카테고리, 검색 기능, 정렬 기능)
               - 화면 레이아웃 및 디자인 요소
            
            2. **User Interface Elements:**
               - 버튼, 폼, 입력 필드, 드롭다운, 체크박스 등 UI 컴포넌트
               - 네비게이션 메뉴, 탭, 모달, 팝업 등 인터페이스 요소
               - 이미지, 아이콘, 로고 등 시각적 요소
            
            3. **User Interaction Flows:**
               - 화면 간 이동 흐름 (예: 로그인 → 홈 → 카테고리 선택 → 음식점 목록)
               - 사용자 액션 (클릭, 스크롤, 드래그, 입력 등)
               - 사용자 경험(UX) 관련 내용
            
            4. **Display and Presentation:**
               - 데이터 표시 방식 (목록, 그리드, 카드 등)
               - 정보 표시 (이름, 가격, 평점, 이미지 등)
               - 반응형 디자인, 모바일/데스크톱 대응
            
            DO NOT map:
            - Events (이벤트는 제외)
            - Business logic or backend processes
            - Data processing or calculations
            - API calls or data fetching logic
            - Database operations
            
            Focus ONLY on what users see and interact with on the screen.
            `
        }else{
            return '';
        }
    }

    createModel(text) {
        if(text.startsWith('```json')){
            text = text.slice(7);
        }
        if(text.endsWith('```')){
            text = text.slice(0, -3);
        }

        const model = super.createModel(text);

        if(model && model.relevantRequirements){
            return {
                boundedContext: this.client.input['boundedContext'].name,
                requirements: model.relevantRequirements.length > 0 ? model.relevantRequirements : []
            };
        }else{
            return {
                boundedContext: this.client.input['boundedContext'].name,
                requirements: []
            };
        }
    }
}

module.exports = RequirementsMappingGenerator;