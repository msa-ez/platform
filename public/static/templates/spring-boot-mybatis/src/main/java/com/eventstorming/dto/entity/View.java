forEach: View
fileName: {{namePascalCase}}.java
path: {{boundedContext.name}}/{{{options.packagePath}}}/dto/entity
---
package {{options.package}}.dto.entity;

import java.util.Date;
import lombok.Data;

@Data
public class {{namePascalCase}}{
    {{#fieldDescriptors}}
        private {{className}} {{nameCamelCase}};
    {{/fieldDescriptors}}

}