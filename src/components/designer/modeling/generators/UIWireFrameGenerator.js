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
        
        return `You are a UI/UX designer and frontend developer specializing in creating wireframes for web applications. Your task is to analyze Command metadata from an Event Storming model and generate a comprehensive UI wireframe in HTML format.

Command Information:
- name: ${this.client.input.uiDefinition.name}
- displayName: ${this.client.input.uiDefinition.displayName}
- description: ${this.client.input.uiDefinition.description}
- fieldDescriptors: ${JSON.stringify(this.client.input.uiDefinition.fieldDescriptors)}
- controllerInfo: ${JSON.stringify(this.client.input.uiDefinition.controllerInfo)}
- restRepositoryInfo: ${JSON.stringify(this.client.input.uiDefinition.restRepositoryInfo)}
- trigger: ${this.client.input.uiDefinition.trigger}

Additional Requirements:
${this.client.input.additionalRequirements}

## Wireframe Generation Strategy

**COMPLETE FREEDOM FOR AI**: You have complete creative freedom to generate any type of UI

**If Additional Requirements are specified:**
- Create EXACTLY what the user requests (custom forms, wizards, dashboards, etc.)
- Be creative and innovative with the design
- Use any layout, styling, or component structure you want
- Focus on fulfilling the user's specific requirements
- If user wants to change the entire structure, do it completely
- If user wants specific components, prioritize those over defaults

**If NO Additional Requirements (default case only):**
- Use the basic structure below as a starting point
- Create a standard form-based interface with the 4 required screens

## HTML Generation Guidelines

**When Additional Requirements exist:**
- Ignore the default structure completely
- Create whatever UI the user requested
- Be as creative and innovative as possible
- Use modern design patterns and layouts
- If user specifies "dashboard", "wizard", "card layout", etc., implement exactly that
- If user wants specific UI patterns, follow them precisely

**When NO Additional Requirements (default only):**
- Use fieldDescriptors for dynamic field generation
- Keep it simple and functional
- Follow the exact 4-screen structure below

## Output Format
**Generate complete HTML wireframe directly (NOT JSON)**

**Requirements:**
- Output complete, functional HTML with inline CSS
- Include all necessary styling and layout
- Make it responsive and accessible
- Use fieldDescriptors for dynamic data generation
- Include JavaScript for screen transitions if needed

${!hasAdditionalRequirements ? `
**Default Structure (ONLY when no additional requirements):**

**Required Screens (MUST include all 4):**
1. **Main Form Screen**: Input form with all fieldDescriptors
2. **Loading Screen**: While processing the command
3. **Success Screen**: Confirmation of successful execution
4. **Error Screen**: Error handling and validation feedback

**Important Guidelines:**
- Generate complete HTML with inline CSS
- Make it responsive and accessible
- Use fieldDescriptors to dynamically generate form fields
- Include JavaScript for screen transitions and form handling
- Follow modern design patterns
- Include proper form validation and user feedback
` : `
**IMPORTANT: You have complete creative freedom!**
- Create exactly what the user requested in Additional Requirements
- Ignore any default structure completely
- Be innovative and creative
- Use modern design patterns
- If user wants specific UI patterns (dashboard, wizard, cards, etc.), implement them exactly
- If user wants specific layouts or components, prioritize those
`}

**Important Notes:**
- Generate complete HTML, not JSON
- If user has specific requirements, prioritize those completely
- If no requirements, use the default structure above with ALL 4 screens
- Include proper CSS styling inline
- Include JavaScript for interactivity if needed

## Design Principles
1. **User-Centric**: Focus on user experience and ease of use
2. **Consistency**: Maintain consistent design patterns
3. **Accessibility**: Ensure WCAG compliance
4. **Performance**: Optimize for fast loading and response
5. **Security**: Implement proper validation and sanitization
6. **Scalability**: Design for future enhancements

## Technical Considerations
- Use modern CSS Grid and Flexbox for layouts
- Implement progressive enhancement
- Consider mobile-first responsive design
- Include proper error handling and user feedback
- Ensure form accessibility with proper labels and ARIA attributes
- Implement proper loading states and transitions
- Use fieldDescriptors to dynamically generate form fields

Generate a complete HTML wireframe that transforms the Command metadata into a user-friendly, accessible, and functional web interface.`;
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
        
        return `You are a UI/UX designer and frontend developer specializing in creating wireframes for View/Query interfaces. Your task is to analyze View metadata and generate a comprehensive UI wireframe in HTML format.

View Information:
- name: ${uiDefinition.name}
- displayName: ${uiDefinition.displayName}
- description: ${uiDefinition.description}
- dataProjection: ${uiDefinition.dataProjection}
- fieldDescriptors: ${JSON.stringify(uiDefinition.fieldDescriptors)}
- queryParameters: ${JSON.stringify(uiDefinition.queryParameters)}
- queryOption: ${JSON.stringify(uiDefinition.queryOption)}
- controllerInfo: ${JSON.stringify(uiDefinition.controllerInfo)}
${!isCQRS ? `- aggregate: ${JSON.stringify(this.client.input.attachedAggregate.aggregateRoot.fieldDescriptors)}` : ''}
${eventMappingInfo}

Additional Requirements:
${this.client.input.additionalRequirements}

## Wireframe Generation Strategy

**COMPLETE FREEDOM FOR AI**: You have complete creative freedom to generate any type of UI

**If Additional Requirements are specified:**
- Create EXACTLY what the user requests (charts, dashboards, cards, grids, etc.)
- Be creative and innovative with the design
- Use any layout, styling, or component structure you want
- Focus on fulfilling the user's specific requirements
- If user wants to change the entire structure, do it completely
- If user wants specific components, prioritize those over defaults

**If NO Additional Requirements (default case only):**
- Use the basic structure below as a starting point
- **Regular View**: Search form + Results table (MUST include both)
- **CQRS View**: Query button + Results table (MUST include both)

## HTML Generation Guidelines

**When Additional Requirements exist:**
- Ignore the default structure completely
- Create whatever UI the user requested
- Be as creative and innovative as possible
- Use modern design patterns and layouts
- If user specifies "dashboard", "charts", "card layout", etc., implement exactly that
- If user wants specific UI patterns, follow them precisely

**When NO Additional Requirements (default only):**
- **Regular View**: Use queryParameters for search form, aggregate fields for results table
- **CQRS View**: Use CQRS fields (from create events) for results table
- Keep it simple and functional
- Follow the exact structure below for each type

## Output Format
**Generate complete HTML wireframe directly (NOT JSON)**

**Requirements:**
- Output complete, functional HTML with inline CSS
- Include all necessary styling and layout
- Make it responsive and accessible
- **Regular View**: Use queryParameters for search fields, aggregate fields for table columns
- **CQRS View**: Use CQRS fields (from create events) for table columns
- Include JavaScript for interactivity if needed

${!hasAdditionalRequirements ? `
**Default Structure (ONLY when no additional requirements):**

**For Regular View (MUST include both sections):**
- Search Form: Use queryParameters to dynamically generate search fields
- Results Table: Use aggregate fields to dynamically generate table columns
- Include proper styling and JavaScript for search functionality

**For CQRS View (MUST include both sections):**
- Query Button: Single query button for data retrieval
- Results Table: Use CQRS fields (from create events) to dynamically generate table columns
- Include proper styling and JavaScript for query functionality

**Important Guidelines:**
- Generate complete HTML with inline CSS
- Make it responsive and accessible
- Use the field information provided above to create dynamic content
- Include JavaScript for basic interactivity
- Follow modern design patterns
` : `
**IMPORTANT: You have complete creative freedom!**
- Create exactly what the user requested in Additional Requirements
- Ignore any default structure completely
- Be innovative and creative
- Use modern design patterns
- If user wants specific UI patterns (dashboard, charts, cards, etc.), implement them exactly
- If user wants specific layouts or components, prioritize those
`}

**Important Notes:**
- Generate complete HTML, not JSON
- If user has specific requirements, prioritize those completely
- If no requirements, use the default structure above with ALL required sections
- Include proper CSS styling inline
- Include JavaScript for interactivity if needed
- **Regular View**: Use queryParameters for search form, aggregate fields for results table
- **CQRS View**: Use CQRS fields (from create events) for results table

## Design Principles
1. **User-Centric**: Focus on user experience and ease of use
2. **Consistency**: Maintain consistent design patterns
3. **Accessibility**: Ensure WCAG compliance
4. **Performance**: Optimize for fast loading and response
5. **Security**: Implement proper validation and sanitization
6. **Scalability**: Design for future enhancements

## Technical Considerations
- Use modern CSS Grid and Flexbox for layouts
- Implement progressive enhancement
- Consider mobile-first responsive design
- Include proper error handling and user feedback
- Ensure form accessibility with proper labels and ARIA attributes
- Implement proper loading states and transitions
- **Regular View**: Use queryParameters to dynamically generate search fields, aggregate fields to generate table columns
- **CQRS View**: Use CQRS fields (from create events) to generate table columns
- **IMPORTANT**: Ensure tables are properly scrollable when content overflows
- **Table Layout Guidelines**:
  - Use \`overflow-x: auto\` for horizontal scrolling on wide tables
  - Use \`overflow-y: auto\` for vertical scrolling on long tables
  - Set proper \`min-width\` on table cells to prevent content squashing
  - Use \`table-layout: fixed\` for better performance on large tables
  - Ensure parent containers have proper dimensions and overflow handling
${isCQRS ? `
- Use real-time data visualization libraries
- Implement WebSocket connections for live updates
- Include data export functionality
- Consider dashboard customization options` : `
- Implement efficient search algorithms
- Include advanced filtering options
- Add pagination for large datasets
- Consider search result caching`}

Generate a complete HTML wireframe that transforms the View metadata into a user-friendly, accessible, and functional web interface.`;
    }

    createModel(text) {
        try {
            // AI가 생성한 텍스트가 HTML인지 확인
            if (text && text.trim().startsWith('<')) {
                // HTML 유효성 검사 (기본적인 검사)
                if (text.includes('<html') || text.includes('<div') || text.includes('<form') || text.includes('<table')) {
                    return text; // 유효한 HTML 반환
                } else {
                    console.warn("AI generated HTML-like content but missing expected elements");
                    return this.createFallbackHTML();
                }
            } else {
                // AI가 HTML을 생성하지 않은 경우
                console.warn("AI did not generate HTML, returning fallback HTML");
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
        const uiDefinition = this.client.input.uiDefinition;
        const fields = uiDefinition.fieldDescriptors || [];
        
        let formFields = '';
        if (fields.length > 0) {
            fields.forEach(field => {
                const fieldType = this.getFieldInputType(field);
                formFields += `
                    <div style="margin-bottom: 16px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #333;">
                            ${field.displayName || field.name}
                            ${field.isKey ? ' <span style="color: #ff0000;">*</span>' : ''}
                        </label>
                        <input type="${fieldType}" 
                               id="${field.name}"
                               name="${field.name}"
                               placeholder="${field.displayName || field.name}"
                               ${field.isKey ? 'required' : ''}
                               style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px;">
                    </div>
                `;
            });
        } else {
            formFields = `
                <div style="margin-bottom: 16px; text-align: center; color: #666;">
                    <p>No fields defined for this command</p>
                </div>
            `;
        }

        return `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); padding: 24px;">
                    <h2 style="margin: 0 0 24px 0; color: #333; text-align: center;">
                        ${uiDefinition.displayName || uiDefinition.name}
                    </h2>
                    <p style="margin: 0 0 24px 0; color: #666; text-align: center;">
                        ${uiDefinition.description || 'Command form'}
                    </p>
                    
                    <form id="command-form" style="margin-bottom: 24px;">
                        ${formFields}
                        
                        <div style="display: flex; gap: 12px; justify-content: center;">
                            <button type="submit" style="
                                background: #1976d2; 
                                color: white; 
                                border: none; 
                                padding: 12px 24px; 
                                border-radius: 6px; 
                                font-size: 16px; 
                                cursor: pointer;
                                font-weight: 500;
                            ">Submit</button>
                            <button type="button" style="
                                background: #f5f5f5; 
                                color: #333; 
                                border: 1px solid #ddd; 
                                padding: 12px 24px; 
                                border-radius: 6px; 
                                font-size: 16px; 
                                cursor: pointer;
                            ">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
            
            <script>
            // Basic form handling
            document.getElementById('command-form').addEventListener('submit', function(e) {
                e.preventDefault();
                alert('Form submitted! This is a fallback UI - AI generation is recommended for full functionality.');
            });
            </script>
        `;
    }

    createViewFallbackHTML() {
        const uiDefinition = this.client.input.uiDefinition;
        const isCQRS = uiDefinition.dataProjection === "cqrs";
        
        // Regular View일 때 aggregate의 field 정보 추출
        let aggregateFields = [];
        if (!isCQRS && this.client.input.attachedAggregate && this.client.input.attachedAggregate.aggregateRoot && this.client.input.attachedAggregate.aggregateRoot.fieldDescriptors) {
            aggregateFields = this.client.input.attachedAggregate.aggregateRoot.fieldDescriptors.map(field => ({
                name: field.name,
                displayName: field.displayName || field.name,
                type: field.className || 'String'
            }));
        }
        
        // CQRS일 때 create 매핑된 필드 추출
        let cqrsFields = [];
        if (isCQRS && uiDefinition.fieldDescriptors) {
            // CQRS일 때는 fieldDescriptors 사용
            cqrsFields = uiDefinition.fieldDescriptors.map(field => ({
                name: field.name,
                displayName: field.displayName || field.name,
                type: field.className || 'String'
            }));
        }
        
        // 테이블 헤더와 샘플 데이터 생성
        let tableHeaders = '';
        let tableRows = '';
        
        if (isCQRS) {
            // CQRS: create 매핑된 필드 사용
            if (cqrsFields.length > 0) {
                cqrsFields.forEach(field => {
                    tableHeaders += `<th style="padding: 12px; border: 1px solid #ddd; background: #f5f5f5; font-weight: 600; min-width: 120px; white-space: nowrap;">${field.displayName || field.name}</th>`;
                    tableRows += `<td style="padding: 12px; border: 1px solid #ddd; min-width: 120px; white-space: nowrap;">Sample ${field.displayName || field.name}</td>`;
                });
            } else {
                tableHeaders = '<th style="padding: 12px; border: 1px solid #ddd; background: #f5f5f5; font-weight: 600; min-width: 120px;">No CQRS fields defined</th>';
                tableRows = '<td style="padding: 12px; border: 1px solid #ddd; min-width: 120px;">No data available</td>';
            }
        } else {
            // Regular View: aggregate의 field 사용
            if (aggregateFields.length > 0) {
                aggregateFields.forEach(field => {
                    tableHeaders += `<th style="padding: 12px; border: 1px solid #ddd; background: #f5f5f5; font-weight: 600; min-width: 120px; white-space: nowrap;">${field.displayName || field.name}</th>`;
                    tableRows += `<td style="padding: 12px; border: 1px solid #ddd; min-width: 120px; white-space: nowrap;">Sample ${field.displayName || field.name}</td>`;
                });
            } else {
                tableHeaders = '<th style="padding: 12px; border: 1px solid #ddd; background: #f5f5f5; font-weight: 600; min-width: 120px;">No aggregate fields defined</th>';
                tableRows = '<td style="padding: 12px; border: 1px solid #ddd; min-width: 120px;">No data available</td>';
            }
        }

        if (isCQRS) {
            return `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; max-width: 1200px; margin: 0 auto;">
                    <h2 style="text-align: center; color: #333; margin-bottom: 30px;">
                        ${uiDefinition.displayName || uiDefinition.name} - CQRS View
                    </h2>
                    
                    <div style="text-align: center; margin-bottom: 30px;">
                        <button id="query-btn" style="
                            padding: 15px 30px; 
                            background: #1976d2; 
                            color: white; 
                            border: none; 
                            border-radius: 8px; 
                            font-size: 16px; 
                            cursor: pointer;
                            font-weight: 500;
                        ">조회</button>
                    </div>
                    
                    <div style="background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden;">
                        <div style="overflow-x: auto; overflow-y: auto; max-height: 400px;">
                            <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd; min-width: 600px;">
                                <thead><tr>${tableHeaders}</tr></thead>
                                <tbody><tr>${tableRows}</tr></tbody>
                            </table>
                        </div>
                    </div>
                    
                    <p style="text-align: center; color: #666; margin-top: 20px; font-size: 14px;">
                        This is a fallback UI - AI generation is recommended for full functionality.
                        <br>Using CQRS fields from create events: ${cqrsFields.length} fields mapped.
                    </p>
                </div>
                
                <script>
                document.getElementById('query-btn').addEventListener('click', function() {
                    alert('Query button clicked! This is a fallback UI - AI generation is recommended for full functionality.');
                });
                </script>
            `;
        } else {
            // Regular View: queryParameters로 검색창, aggregate의 field로 결과 테이블
            const searchFields = uiDefinition.queryParameters || [];
            let searchForm = '';
            
            if (searchFields.length > 0) {
                searchFields.forEach(param => {
                    searchForm += `
                        <div style="margin-bottom: 16px;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #333;">
                                ${param.displayName || param.name}
                            </label>
                            <input type="text" 
                                   id="search-${param.name}"
                                   name="${param.name}"
                                   placeholder="${param.displayName || param.name}"
                                   style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px;">
                        </div>
                    `;
                });
            } else {
                searchForm = '<p style="color: #666; text-align: center;">No search parameters defined</p>';
            }
            
            return `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; max-width: 1200px; margin: 0 auto;">
                    <h2 style="text-align: center; color: #333; margin-bottom: 30px;">
                        Search ${uiDefinition.displayName || uiDefinition.name}
                    </h2>
                    
                    <div style="background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 20px; margin-bottom: 30px;">
                        <form id="search-form">
                            ${searchForm}
                            <button type="submit" style="
                                width: 100%; 
                                padding: 12px; 
                                background: #1976d2; 
                                color: white; 
                                border: none; 
                                border-radius: 6px; 
                                font-size: 14px; 
                                cursor: pointer;
                                margin-top: 16px;
                            ">Search</button>
                        </form>
                    </div>
                    
                    <div style="background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden;">
                        <div style="overflow-x: auto; overflow-y: auto; max-height: 400px;">
                            <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd; min-width: 600px;">
                                <thead><tr>${tableHeaders}</tr></thead>
                                <tbody><tr>${tableRows}</tr></tbody>
                            </table>
                        </div>
                    </div>
                    
                    <p style="text-align: center; color: #666; margin-top: 20px; font-size: 14px;">
                        This is a fallback UI - AI generation is recommended for full functionality.
                        <br>Using queryParameters for search: ${searchFields.length} fields, aggregate fields for results: ${aggregateFields.length} fields.
                    </p>
                </div>
                
                <script>
                document.getElementById('search-form').addEventListener('submit', function(e) {
                    e.preventDefault();
                    alert('Search submitted! This is a fallback UI - AI generation is recommended for full functionality.');
                });
                </script>
            `;
        }
    }

    getFieldInputType(field) {
        if (!field.type) return 'text';
        
        const type = field.type.toLowerCase();
        if (type.includes('date')) return 'date';
        if (type.includes('time')) return 'time';
        if (type.includes('email')) return 'email';
        if (type.includes('number') || type.includes('int') || type.includes('long') || type.includes('double')) return 'number';
        if (type.includes('password')) return 'password';
        if (type.includes('url')) return 'url';
        
        return 'text';
    }

    // 기존 JSON 변환 메서드들은 더 이상 필요하지 않음
    // HTML이 직접 생성되므로 convertWireframeToHtml 메서드 제거
}

module.exports = UIWireFrameGenerator; 



