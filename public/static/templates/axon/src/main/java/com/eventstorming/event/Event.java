forEach: Event
fileName: {{namePascalCase}}Event.java
path: {{boundedContext.name}}/{{{options.packagePath}}}/event
---
package {{options.package}}.event;

import lombok.Data;
import lombok.ToString;

{{#checkDateType fieldDescriptors}} {{/checkDateType}}
{{#checkBigDecimal fieldDescriptors}} {{/checkBigDecimal}}

//<<< DDD / Domain Event

@Data
@ToString
public class {{namePascalCase}}Event {

    {{#fieldDescriptors}}
    private {{className}} {{nameCamelCase}};
    {{/fieldDescriptors}}

}
//>>> DDD / Domain Event

<function>
window.$HandleBars.registerHelper('checkDateType', function (fieldDescriptors) {

        for(var i = 0; i < fieldDescriptors.length; i ++ ){
        if(fieldDescriptors[i] && fieldDescriptors[i].className == 'Date'){
        return "import java.util.Date; \n"
        }
        }
        });
</function>
