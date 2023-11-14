forEach: RelationCommandInfo
fileName: {{commandValue.namePascalCase}}Command.java
path: {{boundedContext.name}}/{{{options.packagePath}}}/external
except: {{#except commandValue}}{{/except}}
---
package {{options.package}}.external;

import javax.persistence.*;
import java.util.List;
import java.util.Date;
import lombok.Data;

@Data
public class {{commandValue.namePascalCase}}Command {

{{#commandValue.fieldDescriptors}}
    {{#isKey}}
    @Id
    {{/isKey}}
    private {{{className}}} {{nameCamelCase}};
{{/commandValue.fieldDescriptors}}
}

<function>
window.$HandleBars.registerHelper('except', function (command) {
    if(command._type.endsWith('Command')) {
        return (command.fieldDescriptors && command.fieldDescriptors.length == 0);
    }
    return true;
});
</function>
