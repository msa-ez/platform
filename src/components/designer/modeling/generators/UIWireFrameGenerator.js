const JsonAIGenerator = require("./JsonAIGenerator");

class UIWireFrameGenerator extends JsonAIGenerator {
    constructor(client) {
        super(client, {}, "thinkingModel");
        this.generatorName = 'UIWireFrameGenerator';
    }

    createPrompt() {
        const uiDefinition = this.client.input.uiDefinition;
        const type = uiDefinition._type || '';
        
        if(type.includes("Command")){
          return this.createCommandPrompt();
        }else if(type.includes("View")){
          return this.createViewPrompt();
        }
    }

    createCommandPrompt() {
        const hasAdditionalRequirements = this.client.input.additionalRequirements && this.client.input.additionalRequirements.trim() !== '';
        
        return `You are a UI/UX designer creating HTML wireframes for Command interfaces.

**IMPORTANT: Wireframe Purpose**
- This is a **PREVIEW COMPONENT**, not a complete webpage
- It will be **embedded inside a container** for preview purposes
- It should **fit within its container**, not take over the entire screen
- Think of it as a **UI component** that shows the design, not a standalone page

## Command Information
- Name: ${this.client.input.uiDefinition.name}
- Display: ${this.client.input.uiDefinition.displayName}
- Description: ${this.client.input.uiDefinition.description}
- Fields: ${this.client.input.uiDefinition.fieldDescriptors ? this.client.input.uiDefinition.fieldDescriptors.map(f => `${f.name} (${f.type || 'text'})`).join(', ') : 'No fields defined'}
- API: ${this.client.input.uiDefinition.controllerInfo ? `${this.client.input.uiDefinition.controllerInfo.method || 'N/A'} ${this.client.input.uiDefinition.controllerInfo.apiPath || 'N/A'}` : 'No API info'}

## Additional Requirements
${this.client.input.additionalRequirements || 'None specified'}

## Basic Structure (Default)
**Command Default**: Simple form with all fields
- Form: Input form with all fields listed above
- No additional screens by default

## How to Handle Requirements

**If NO Additional Requirements:**
- Use the basic structure above
- Follow default style guidelines below

**If Additional Requirements exist:**
1. **Simple Changes** (colors, fonts, minor styles):
   - Keep basic structure
   - Apply only the requested changes
   
2. **Component Changes** (add screens, buttons, fields):
   - Keep basic structure
   - Add requested components
   
3. **Structural Changes** (dashboard, charts, different layout):
   - Ignore basic structure completely
   - Create new structure as requested

**CRITICAL: Multiple Requirements Handling**
- **When multiple requirements exist, process ALL of them together**
- **Example**: "카드로 + 성공/실패 화면 추가" = Structural + Component changes
- **Do NOT ignore any part of the requirements**
- **Combine different types of changes as needed**

**Examples:**
- "성공/실패 화면도 추가로 만들어줘" → Component Changes (add screens)
- "카드 레이아웃으로 + 추가 화면" → Structural + Component Changes
- "버튼은 빨간색으로 + 추가 기능" → Simple + Component Changes

## Default Style Guidelines
- Buttons: Primary #007bff, Secondary #6c757d
- Forms: 16px margins, 4px border-radius
- Colors: Success #28a745, Error #dc3545
- Layout: Center-aligned, max-width 600px

## Output Format
**MUST output HTML only - NEVER JSON**

**If you must output JSON format, use this structure:**
{
  "html": "<div>your HTML wireframe here</div>"
}

**Required:**
- Start with < (HTML tag) OR use the JSON format above
- Include complete HTML structure
- Include inline CSS styling
- Include JavaScript for screen transitions
- Include sample data to demonstrate functionality

**IMPORTANT: Wireframe Requirements**
- **DO NOT use <html>, <head>, <body> tags**
- **Start with <div> or other container elements**
- **DO NOT use height: 100vh or width: 100vw**
- **Create a component that fits within a container, not a full page**
- **Use relative sizing (%, auto) instead of viewport units**

Generate the HTML wireframe now.`;
    }

    createViewPrompt() {
        const uiDefinition = this.client.input.uiDefinition;
        const isCQRS = uiDefinition.dataProjection === "cqrs";
        const hasAdditionalRequirements = this.client.input.additionalRequirements && this.client.input.additionalRequirements.trim() !== '';
        
        // Regular View일 때 aggregate의 field 정보 추출
        let aggregateFields = [];
        if (!isCQRS && this.client.input.attachedAggregate && this.client.input.attachedAggregate.aggregateRoot && this.client.input.attachedAggregate.aggregateRoot.fieldDescriptors) {
            aggregateFields = this.client.input.attachedAggregate.aggregateRoot.fieldDescriptors.map(field => ({
                name: field.name,
                displayName: field.displayName || field.name,
                type: field.className || 'String'
            }));
        }
        
        // CQRS 이벤트 매핑 정보 추출
        let eventMappingInfo = "";
        let cqrsFields = [];
        
        if (isCQRS && uiDefinition.createRules && uiDefinition.updateRules) {
            // CQRS일 때는 fieldDescriptors 사용
            cqrsFields = uiDefinition.fieldDescriptors ? uiDefinition.fieldDescriptors.map(field => ({
                name: field.name,
                displayName: field.displayName || field.name,
                type: field.className || 'String'
            })) : [];
            
            eventMappingInfo = `
## CQRS Event Mapping Information:
**Create Events:**
${uiDefinition.createRules.map(rule => {
  const eventName = rule.when && rule.when.name ? rule.when.name : 'Unknown Event';
  const fieldCount = rule.fieldMapping && rule.fieldMapping.length ? rule.fieldMapping.length : 0;
  return `- ${eventName}: ${fieldCount} fields mapped`;
}).join('\n')}

**Update Events:**
${uiDefinition.updateRules.map(rule => {
  const eventName = rule.when && rule.when.name ? rule.when.name : 'Unknown Event';
  const fieldCount = rule.fieldMapping && rule.fieldMapping.length ? rule.fieldMapping.length : 0;
  return `- ${eventName}: ${fieldCount} fields mapped`;
}).join('\n')}

**Event Flow:**
${uiDefinition.createRules.map(rule => {
  const eventName = rule.when && rule.when.name ? rule.when.name : 'Unknown Event';
  return `1. ${eventName} → Creates new record`;
}).join('\n')}
${uiDefinition.updateRules.map(rule => {
  const eventName = rule.when && rule.when.name ? rule.when.name : 'Unknown Event';
  return `2. ${eventName} → Updates existing record`;
}).join('\n')}

**CQRS Fields for Results Table (from fieldDescriptors):**
${cqrsFields.map(field => `- ${field.name}: ${field.displayName} (${field.type})`).join('\n')}
`;
        } else if (!isCQRS) {
            // Regular View일 때 aggregate field 정보 추가
            eventMappingInfo = `
## Regular View Information:
**Aggregate Fields for Results Table:**
${aggregateFields.length > 0 ? 
  aggregateFields.map(field => `- ${field.name}: ${field.displayName} (${field.type})`).join('\n') :
  'No aggregate fields defined'
}

**Query Parameters for Search Form:**
${uiDefinition.queryParameters && uiDefinition.queryParameters.length > 0 ? 
  uiDefinition.queryParameters.map(param => `- ${param.name}: ${param.displayName || param.name}`).join('\n') :
  'No query parameters defined'
}
`;
        }
        
        return `You are a UI/UX designer creating HTML wireframes for View/Query interfaces.

**IMPORTANT: Wireframe Purpose**
- This is a **PREVIEW COMPONENT**, not a complete webpage
- It will be **embedded inside a container** for preview purposes
- It should **fit within its container**, not take over the entire screen
- Think of it as a **UI component** that shows the design, not a standalone page

## View Information
- Name: ${uiDefinition.name}
- Display: ${uiDefinition.displayName}
- Description: ${uiDefinition.description}
- Type: ${isCQRS ? 'CQRS View' : 'Regular View'}
- Fields: ${uiDefinition.fieldDescriptors ? uiDefinition.fieldDescriptors.map(f => `${f.name} (${f.className || 'text'})`).join(', ') : 'No fields defined'}
- Query Parameters: ${uiDefinition.queryParameters ? uiDefinition.queryParameters.map(p => `${p.name} (${p.type || 'text'})`).join(', ') : 'No query parameters'}
- API: ${uiDefinition.controllerInfo ? `${uiDefinition.controllerInfo.method || 'N/A'} ${uiDefinition.controllerInfo.apiPath || 'N/A'}` : 'No API info'}

${eventMappingInfo}

## Additional Requirements
${this.client.input.additionalRequirements || 'None specified'}

## Basic Structure (Default)
**Regular View**: Search form + Results table
**CQRS View**: Query button + Results table

## How to Handle Requirements

**If NO Additional Requirements:**
- Use the basic structure above
- Follow default style guidelines below

**If Additional Requirements exist:**
1. **Simple Changes** (colors, fonts, minor styles):
   - Keep basic structure
   - Apply only the requested changes
   
2. **Component Changes** (add fields, filters, pagination):
   - Keep basic structure
   - Add requested components
   
3. **Structural Changes** (cards, charts, dashboard):
   - Ignore basic structure completely
   - Create new structure as requested

**CRITICAL: Multiple Requirements Handling**
- **When multiple requirements exist, process ALL of them together**
- **Example**: "카드로 + 필터 추가" = Structural + Component changes
- **Do NOT ignore any part of the requirements**
- **Combine different types of changes as needed**

**Examples:**
- "조회결과는 카드로" → Structural Changes (table to cards)
- "카드로 + 검색 필드 추가" → Structural + Component Changes
- "테이블 색상 변경 + 정렬 기능" → Simple + Component Changes

## Default Style Guidelines
- Buttons: Primary #007bff, Secondary #6c757d
- Tables: #ffffff background, #dee2e6 borders
- Forms: 8px padding, 4px border-radius
- Layout: Responsive, consistent spacing

## Output Format
**MUST output HTML only - NEVER JSON**

**If you must output JSON format, use this structure:**
{
  "html": "<div>your HTML wireframe here</div>"
}

**Required:**
- Start with < (HTML tag) OR use the JSON format above
- Include complete HTML structure
- Include inline CSS styling
- Include JavaScript for interactivity
- Include sample data to demonstrate functionality

**IMPORTANT: Wireframe Requirements**
- **DO NOT use <html>, <head>, <body> tags**
- **Start with <div> or other container elements**
- **DO NOT use height: 100vh or width: 100vw**
- **Create a component that fits within a container, not a full page**
- **Use relative sizing (%, auto) instead of viewport units**

Generate the HTML wireframe now.`;
    }

    createModel(text) {
        try {
            let model = super.createModel(text);
            let html = model.html;

            // AI가 생성한 텍스트가 HTML인지 확인
            if (html && html.trim().startsWith('<')) {
                // HTML 유효성 검사 (기본적인 검사)
                if (html.includes('<html') || html.includes('<div') || html.includes('<form') || html.includes('<table')) {
                    return html; // 유효한 HTML 반환
                } else {
                    console.warn("AI generated HTML-like content but missing expected elements");
                    return this.createFallbackHTML();
                }
            } else if (html && (html.trim().startsWith('{') || html.trim().startsWith('['))) {
                // AI가 JSON을 생성한 경우 - html 필드 확인
                try {
                    const jsonData = JSON.parse(html);
                    if (jsonData.html && typeof jsonData.html === 'string') {
                        // html 필드가 있고 유효한 HTML인 경우
                        if (jsonData.html.trim().startsWith('<')) {
                            console.log("AI generated JSON with valid HTML field, extracting HTML");
                            return jsonData.html;
                        } else {
                            console.warn("AI generated JSON with html field but content is not HTML");
                            return this.createFallbackHTML();
                        }
                    } else {
                        // html 필드가 없는 경우
                        console.error("AI generated JSON without html field - this will cause fallback UI");
                        console.error("Generated content:", html.substring(0, 200) + "...");
                        return this.createFallbackHTML();
                    }
                } catch (parseError) {
                    // JSON 파싱 실패
                    console.error("AI generated invalid JSON - this will cause fallback UI");
                    console.error("Generated content:", html.substring(0, 200) + "...");
                    return this.createFallbackHTML();
                }
            } else {
                // AI가 HTML을 생성하지 않은 경우
                console.warn("AI did not generate HTML, returning fallback HTML");
                console.warn("Generated content:", html ? html.substring(0, 200) + "..." : "No content");
                return this.createFallbackHTML();
            }
        } catch(e) {
            console.error("Wireframe Generator Error:", e);
            return this.createFallbackHTML();
        }
    }

    createFallbackHTML() {
        const uiDefinition = this.client.input.uiDefinition;
        const type = uiDefinition._type || '';
        
        if(type.includes("Command")){
            return this.createCommandFallbackHTML();
        }else if(type.includes("View")){
            return this.createViewFallbackHTML();
        } else {
            // 알 수 없는 타입인 경우
            return `
                <div style="padding: 20px; text-align: center; color: #ff0000; font-family: Arial, sans-serif;">
                    <h3>⚠️ Generation Error</h3>
                    <p>Failed to generate wireframe for unknown type: ${type}</p>
                    <p>Please try again or contact support.</p>
                </div>
            `;
        }
    }

    createCommandFallbackHTML() {
        return `
            <div style="padding: 20px; text-align: center; color: #666; font-family: Arial, sans-serif;">
                <h3>⚠️ Command Form Generation Failed</h3>
                <p>AI generation failed. This is a basic fallback.</p>
                <p>Please try again or check your requirements.</p>
            </div>
        `;
    }

    createViewFallbackHTML() {
        const uiDefinition = this.client.input.uiDefinition;
        const isCQRS = uiDefinition.dataProjection === "cqrs";
        
        return `
            <div style="padding: 20px; text-align: center; color: #666; font-family: Arial, sans-serif;">
                <h3>⚠️ ${isCQRS ? 'CQRS View' : 'Regular View'} Generation Failed</h3>
                <p>AI generation failed. This is a basic fallback.</p>
                <p>Please try again or check your requirements.</p>
            </div>
        `;
    }
}

module.exports = UIWireFrameGenerator;