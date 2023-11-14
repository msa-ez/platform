forEach: Command
representativeFor: Command
fileName: {{namePascalCase}}Command.java
path: {{boundedContext.name}}/{{{options.packagePath}}}/domain
except: {{#except fieldDescriptors}}{{/except}}
---
package {{options.package}}.domain;

import javax.persistence.*;
import java.util.List;
import java.util.Date;
import lombok.Data;

@Data
public class {{namePascalCase}}Command {

{{#fieldDescriptors}}
    {{#isKey}}
        @Id
        //@GeneratedValue(strategy=GenerationType.AUTO)
    {{/isKey}}
        private {{className}} {{nameCamelCase}};
{{/fieldDescriptors}}


}

<function>
window.$HandleBars.registerHelper('except', function (fieldDescriptors) {
    return (fieldDescriptors && fieldDescriptors.length == 0);
});
</function>
