forEach: ViewEventInfo
fileName: {{namePascalCase}}Event.java
path: {{boundedContext.name}}/{{{options.packagePath}}}/event
---
package {{options.package}}.event;

{{#checkDateType fieldDescriptors}} {{/checkDateType}}
{{#checkBigDecimal fieldDescriptors}} {{/checkBigDecimal}}

import lombok.Data;
import lombok.ToString;

@ToString
@Data
public class {{namePascalCase}}Event {

    {{#fieldDescriptors}}
    private {{className}} {{name}};
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