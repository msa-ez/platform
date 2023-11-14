forEach: View
representativeFor: View
fileName: {{namePascalCase}}.java
path: {{boundedContext.name}}/{{{options.packagePath}}}/domain
---
package {{options.package}}.domain;

import javax.persistence.*;
import java.util.List;
import java.util.Date;
import lombok.Data;
{{#checkBigDecimal fieldDescriptors}}{{/checkBigDecimal}}

//<<< EDA / CQRS
@Entity
@Table(name="{{namePascalCase}}_table")
@Data
public class {{namePascalCase}} {

{{#fieldDescriptors}}
    {{#isKey}}
        @Id
        //@GeneratedValue(strategy=GenerationType.AUTO)
    {{/isKey}}
        private {{className}} {{nameCamelCase}};
{{/fieldDescriptors}}


}

<function>
window.$HandleBars.registerHelper('checkBigDecimal', function (fieldDescriptors) {
    for(var i = 0; i < fieldDescriptors.length; i ++ ){
        if(fieldDescriptors[i] && fieldDescriptors[i].className.includes('BigDecimal')){
            return "import java.math.BigDecimal;";
        }
    }
});
</function>
//>>> EDA / CQRS