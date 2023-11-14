forEach: ViewEventInfo
fileName: {{namePascalCase}}.java
path: {{boundedContext.name}}/{{{options.packagePath}}}/dto/event
---
package {{options.package}}.dto.event;

import java.util.Date;
import lombok.Data;

@JsonIgnoreProperties(ignoreUnknown = true)
@Data
public class {{namePascalCase}} extends AbstractEvent {

    {{#fieldDescriptors}}
    private {{className}} {{name}};
    {{/fieldDescriptors}}

    {{#fieldDescriptors}}
    public {{className}} get{{namePascalCase}}() {
        return {{name}};
    }

    public void set{{namePascalCase}}({{className}} {{name}}) {
        this.{{name}} = {{name}};
    }
    {{/fieldDescriptors}}
}