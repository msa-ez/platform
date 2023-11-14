forEach: ViewEventInfo
representativeFor: View
fileName: {{namePascalCase}}.java
path: {{boundedContext.name}}/{{{options.packagePath}}}/domain
---
package {{options.package}}.domain;

import {{options.package}}.infra.AbstractEvent;
import lombok.Data;
import java.util.*;

@Data
public class {{namePascalCase}} extends AbstractEvent {

    {{#fieldDescriptors}}
    private {{{className}}} {{name}};
    {{/fieldDescriptors}}
}

<function>
window.$HandleBars.registerHelper('checkDateType', function (fieldDescriptors) {
for(var i = 0; i < fieldDescriptors.length; i ++ ){
    if(fieldDescriptors[i] && fieldDescriptors[i].className == 'Date'){
        return "import java.util.Date; \n"
        }
    }
});
</function>