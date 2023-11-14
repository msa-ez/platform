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
{{#checkBigDecimal fieldDescriptors}}{{/checkBigDecimal}}

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

window.$HandleBars.registerHelper('checkBigDecimal', function (fieldDescriptors) {
    for(var i = 0; i < fieldDescriptors.length; i ++ ){
        if(fieldDescriptors[i] && fieldDescriptors[i].className.includes('BigDecimal')){
            return "import java.math.BigDecimal;";
        }
    }
});
</function>
