const JsonAIGenerator = require("./JsonAIGenerator");
const RequirementsClassifier = require("./RequirementsClassifier");

class UIWireFrameGenerator extends JsonAIGenerator {
    constructor(client) {
        super(client, {}, "thinkingModel");
        this.generatorName = 'UIWireFrameGenerator';
        this.requirementsClassifier = new RequirementsClassifier();
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
        const additionalRequirements = this.client.input.additionalRequirements || '';
        const classification = this.requirementsClassifier.classify(additionalRequirements);
        
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

## Requirements Analysis
${this.generateRequirementsSection(classification, additionalRequirements, 'Command')}

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
- **DO NOT use JavaScript for interactivity** - this is for static preview only
- Include sample data to demonstrate functionality
- **Show ALL possible states/screens statically** - no dynamic behavior needed

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
        const additionalRequirements = this.client.input.additionalRequirements || '';
        const classification = this.requirementsClassifier.classify(additionalRequirements);
        
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

## Requirements Analysis
${this.generateRequirementsSection(classification, additionalRequirements, 'View')}

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
- **DO NOT use JavaScript for interactivity** - this is for static preview only
- Include sample data to demonstrate functionality
- **Show ALL possible states/screens statically** - no dynamic behavior needed

**IMPORTANT: Wireframe Requirements**
- **DO NOT use <html>, <head>, <body> tags**
- **Start with <div> or other container elements**
- **DO NOT use height: 100vh or width: 100vw**
- **Create a component that fits within a container, not a full page**
- **Use relative sizing (%, auto) instead of viewport units**

Generate the HTML wireframe now.`;
    }

    /**
     * 분류된 요구사항에 따른 프롬프트 섹션 생성
     * @param {Object} classification - 분류 결과
     * @param {string} originalRequirements - 원본 요구사항
     * @param {string} uiType - UI 타입 (Command/View)
     * @returns {string} 생성된 프롬프트 섹션
     */
    generateRequirementsSection(classification, originalRequirements, uiType) {
        const { type, confidence, action, isComplex, allClassifications } = classification;
        
        if (type === 'none') {
            return `## Additional Requirements
None specified

## Basic Structure (Default)
**${uiType} Default**: ${uiType === 'Command' ? 'Simple form with all fields' : 'Search form + Results table'}

## Implementation Strategy
- Use the basic structure above
- Follow default style guidelines below`;
        }

        if (isComplex) {
            const actionTypes = allClassifications.map(c => c.type).join(', ');
            return `## Additional Requirements
${originalRequirements}

## Requirements Analysis
**Classification**: Complex requirements with multiple types (${actionTypes})
**Confidence**: ${(confidence * 100).toFixed(1)}%
**Strategy**: Ignore basic structure and create comprehensive solution

## Implementation Strategy
- **IGNORE** the basic structure completely
- Create a new structure that addresses ALL requirements
- Combine different types of changes as needed
- Ensure all requested features are implemented`;
        }

        const baseStructure = uiType === 'Command' 
            ? 'Simple form with all fields' 
            : 'Search form + Results table';

        let strategy = '';
        switch (action) {
            case 'applyStyle':
                strategy = `- **KEEP** the basic structure (${baseStructure})
- Apply only the requested style changes
- Maintain existing functionality`;
                break;
            case 'addComponent':
                strategy = `- **KEEP** the basic structure (${baseStructure})
- Add the requested components
- Maintain existing functionality`;
                break;
            case 'restructure':
                strategy = `- **IGNORE** the basic structure completely
- Create new structure as requested
- Implement all requested changes`;
                break;
            case 'addFunctionality':
                strategy = `- **KEEP** the basic structure (${baseStructure})
- Add the requested functional features
- Enhance existing functionality`;
                break;
            default:
                strategy = `- **KEEP** the basic structure (${baseStructure})
- Implement the requested changes
- Maintain existing functionality`;
        }

        // 데모 버튼이 필요한지 확인
        const needsDemoButtons = this.shouldAddDemoButtons(originalRequirements, type, action);
        
        let demoButtonInstructions = '';
        if (needsDemoButtons) {
            demoButtonInstructions = `

## IMPORTANT: Multiple Screens/Views
- If you create multiple screens/views (success, error, etc.), show ALL of them statically
- Display each screen in a separate section with clear labels
- NO JavaScript needed - this is for static preview only
- Example: "Success Screen:", "Error Screen:", "Form Screen:" etc.`;
        }

        return `## Additional Requirements
${originalRequirements}

## Requirements Analysis
**Classification**: ${type} (${action})
**Confidence**: ${(confidence * 100).toFixed(1)}%
**Strategy**: ${action === 'restructure' ? 'Structural change' : 'Enhancement'}

## Implementation Strategy
${strategy}${demoButtonInstructions}`;
    }

    /**
     * 데모 버튼이 필요한지 판단
     * @param {string} requirements - 요구사항
     * @param {string} type - 분류 타입
     * @param {string} action - 액션
     * @returns {boolean} 데모 버튼 필요 여부
     */
    shouldAddDemoButtons(requirements, type, action) {
        if (!requirements || requirements.trim() === '') {
            return false;
        }

        const normalizedRequirements = requirements.toLowerCase();
        
        // 성공/실패 화면 관련 키워드
        const screenKeywords = [
            '성공', 'success', '실패', 'fail', 'error', '화면', 'screen',
            '페이지', 'page', '뷰', 'view', '모달', 'modal', '팝업', 'popup'
        ];
        
        // 여러 화면을 요청하는 키워드
        const multipleScreenKeywords = [
            '추가', 'add', '만들어', 'create', '생성', 'generate'
        ];
        
        const hasScreenKeywords = screenKeywords.some(keyword => 
            normalizedRequirements.includes(keyword)
        );
        
        const hasMultipleScreenKeywords = multipleScreenKeywords.some(keyword => 
            normalizedRequirements.includes(keyword)
        );
        
        // 성공/실패 화면을 요청했거나, 여러 화면을 추가하라고 했을 때
        return hasScreenKeywords && hasMultipleScreenKeywords;
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