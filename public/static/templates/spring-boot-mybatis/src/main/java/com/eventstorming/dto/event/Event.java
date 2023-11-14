forEach: Event
fileName: {{namePascalCase}}.java
path: {{boundedContext.name}}/{{{options.packagePath}}}/dto/event
---
package {{options.package}}.dto.event;

import java.util.Date;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@JsonIgnoreProperties(ignoreUnknown = true)
@Data
public class {{namePascalCase}} extends AbstractEvent {

    {{#fieldDescriptors}}
    private {{className}} {{nameCamelCase}};
    {{/fieldDescriptors}}

    public {{namePascalCase}}(){
        super();
    }
}