forEach: RelationEventInfo
fileName: {{eventValue.namePascalCase}}Event.java
path: {{boundedContext.name}}/{{{options.packagePath}}}/event
---

package {{options.package}}.event;
{{#checkDateType eventValue.fieldDescriptors}} {{/checkDateType}}
{{#checkBigDecimal eventValue.fieldDescriptors}} {{/checkBigDecimal}}

import lombok.Data;
import lombok.ToString;

@ToString
@Data
public class {{eventValue.namePascalCase}}Event{

{{#eventValue.fieldDescriptors}}
    private {{className}} {{name}};
{{/eventValue.fieldDescriptors}}

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