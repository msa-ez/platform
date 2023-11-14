forEach: RelationCommandInfo
fileName: {{commandValue.aggregate.namePascalCase}}.java
path: {{boundedContext.name}}/{{{options.packagePath}}}/external
---
package {{options.package}}.external;

{{#checkDateType commandValue.aggregate.aggregateRoot.fieldDescriptors}} {{/checkDateType}}
{{#checkBigDecimal commandValue.aggregate.aggregateRoot.fieldDescriptors}} {{/checkBigDecimal}}
{{#commandValue.aggregate}}

import lombok.Data;
import lombok.ToString;

@ToString
@Data
public class {{namePascalCase}} {

    {{#aggregateRoot.fieldDescriptors}}
    private {{className}} {{nameCamelCase}};
    {{/aggregateRoot.fieldDescriptors}}

}
{{/commandValue.aggregate}}


<function>
window.$HandleBars.registerHelper('checkDateType', function (fieldDescriptors) {

        for(var i = 0; i < fieldDescriptors.length; i ++ ){
        if(fieldDescriptors[i] && fieldDescriptors[i].className == 'Date'){
        return "import java.util.Date; \n"
        }
        }
        });
</function>