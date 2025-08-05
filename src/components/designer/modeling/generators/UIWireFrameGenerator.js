const JsonAIGenerator = require("./JsonAIGenerator");

class UIWireFrameGenerator extends JsonAIGenerator {
    constructor(client) {
        super(client, {}, "thinkingModel");
        this.generatorName = 'UIWireFrameGenerator';
    }

    createPrompt() {
        return `You are a UI/UX designer and frontend developer specializing in creating wireframes for web applications. Your task is to analyze Command metadata from an Event Storming model and generate a comprehensive UI wireframe specification.

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

## Command Metadata Structure
The Command object contains the following key information:
- name: Command name (e.g., "CreateOrder", "UpdateUserProfile")
- description: Command description
- fieldDescriptors: Array of field objects with name, type, and other properties
- controllerInfo: API endpoint information (apiPath, method)
- restRepositoryInfo: REST repository configuration
- trigger: Lifecycle trigger (e.g., "@PrePersist", "@PostPersist")
- visibility: Access modifier ("public", "private", etc.)
- aggregate: Associated aggregate information
- boundedContext: Associated bounded context

## Wireframe Generation Requirements

Based on the Command metadata, generate a wireframe specification that includes:

1. **Form Layout**: Create input forms for all fieldDescriptors
2. **Validation Rules**: Based on field types and business logic
3. **API Integration**: REST endpoint integration based on controllerInfo
4. **User Flow**: Complete user journey from form submission to response
5. **Error Handling**: Error states and validation feedback
6. **Success States**: Confirmation screens and success messages
7. **Responsive Design**: Mobile and desktop considerations

## Output Format
Generate a JSON object with the following structure:

{
  "wireframe": {
    "title": "Command name with proper formatting",
    "description": "Brief description of the UI purpose",
    "screens": [
      {
        "id": "unique-screen-id",
        "name": "Screen name",
        "type": "form|confirmation|error|loading",
        "layout": "single-column|two-column|modal|fullscreen",
        "components": [
          {
            "type": "input|button|text|image|container",
            "id": "component-id",
            "label": "Component label",
            "placeholder": "Placeholder text",
            "validation": {
              "required": true|false,
              "type": "text|email|number|date|select",
              "pattern": "regex-pattern",
              "minLength": 0,
              "maxLength": 100,
              "errorMessage": "Validation error message"
            },
            "styling": {
              "width": "100%|50%|auto",
              "height": "auto|fixed-height",
              "margin": "spacing-values",
              "padding": "spacing-values",
              "backgroundColor": "color-value",
              "borderColor": "color-value",
              "borderRadius": "border-radius-value"
            },
            "position": {
              "x": 0,
              "y": 0,
              "zIndex": 1
            }
          }
        ],
        "actions": [
          {
            "trigger": "button-click|form-submit|page-load",
            "action": "submit|validate|navigate|show-error",
            "target": "next-screen|api-endpoint|error-screen",
            "apiCall": {
              "method": "GET|POST|PUT|DELETE",
              "endpoint": "/api/endpoint",
              "headers": {},
              "body": "request-body-structure"
            }
          }
        ],
        "navigation": {
          "previous": "screen-id",
          "next": "screen-id",
          "cancel": "screen-id"
        }
      }
    ],
    "apiIntegration": {
      "baseUrl": "API base URL",
      "endpoints": [
        {
          "name": "endpoint-name",
          "method": "HTTP-method",
          "path": "/api/path",
          "headers": {},
          "requestBody": {},
          "responseFormat": {}
        }
      ]
    },
    "validation": {
      "clientSide": [
        {
          "field": "field-name",
          "rules": [
            {
              "type": "required|email|minLength|maxLength|pattern",
              "value": "validation-value",
              "message": "Error message"
            }
          ]
        }
      ],
      "serverSide": [
        {
          "field": "field-name",
          "rules": [
            {
              "type": "business-rule|database-constraint",
              "message": "Server-side error message"
            }
          ]
        }
      ]
    },
    "responsiveBreakpoints": {
      "mobile": "max-width: 768px",
      "tablet": "min-width: 769px and max-width: 1024px",
      "desktop": "min-width: 1025px"
    },
    "accessibility": {
      "ariaLabels": {},
      "keyboardNavigation": true,
      "screenReaderSupport": true
    }
  }
}

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

Generate a wireframe specification that transforms the Command metadata into a user-friendly, accessible, and functional web interface.`;
    }

    createModel(text) {
        try {
            let model = super.createModel(text);

            if(model) {
                // Convert wireframe model to HTML string for v-runtime-template
                if (model.wireframe) {
                    model = this.convertWireframeToHtml(model.wireframe);
                }
                return model;
            }else{
                // console.error("Wireframe Generation :", text.length);
            }
        } catch(e) {
            console.error("Wireframe Generator Error:", e);
            return null;
        }
    }

    convertWireframeToHtml(wireframe) {
        if (!wireframe || !wireframe.screens) {
            return '<div>No wireframe data available</div>';
        }

        let html = '<div class="wireframe-preview">';
        
        wireframe.screens.forEach((screen, index) => {
            html += `<div class="screen" style="margin-bottom: 20px; padding: 16px; border: 1px solid #ddd; border-radius: 8px; background: white;">`;
            html += `<h3 style="margin: 0 0 16px 0; color: #333;">${screen.name}</h3>`;
            
            if (screen.components) {
                screen.components.forEach(component => {
                    html += this.renderComponent(component);
                });
            }
            
            html += '</div>';
        });
        
        html += '</div>';
        return html;
    }

    renderComponent(component) {
        let html = '';
        const style = component.styling || {};
        const validation = component.validation || {};
        
        const styleStr = Object.entries(style)
            .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
            .join('; ');
        
        switch (component.type) {
            case 'input':
                html += `<div style="margin-bottom: 12px;">`;
                html += `<label style="display: block; margin-bottom: 4px; font-weight: 500;">${component.label || ''}</label>`;
                html += `<input type="${validation.type || 'text'}" `;
                html += `placeholder="${component.placeholder || ''}" `;
                html += `style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; ${styleStr}" `;
                if (validation.required) {
                    html += `required `;
                }
                html += `/>`;
                html += `</div>`;
                break;
                
            case 'button':
                html += `<button style="padding: 8px 16px; background: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer; ${styleStr}">`;
                html += `${component.label || 'Button'}`;
                html += `</button>`;
                break;
                
            case 'text':
                html += `<div style="margin-bottom: 8px; ${styleStr}">`;
                html += `${component.label || ''}`;
                html += `</div>`;
                break;
                
            case 'container':
                html += `<div style="padding: 12px; border: 1px solid #e0e0e0; border-radius: 4px; margin-bottom: 12px; ${styleStr}">`;
                if (component.label) {
                    html += `<div style="font-weight: 500; margin-bottom: 8px;">${component.label}</div>`;
                }
                html += `</div>`;
                break;
                
            default:
                html += `<div style="margin-bottom: 8px; ${styleStr}">`;
                html += `${component.label || 'Component'}`;
                html += `</div>`;
        }
        
        return html;
    }

    
}

module.exports = UIWireFrameGenerator; 
