forEach: Event
representativeFor: Event
fileName: {{namePascalCase}}.java
path: {{boundedContext.name}}/{{{options.packagePath}}}/domain
priority: 1
---
package {{options.package}}.domain;

import {{options.package}}.domain.*;
import {{options.package}}.infra.AbstractEvent;
import java.util.*;
import lombok.*;
{{#checkBigDecimal fieldDescriptors}}{{/checkBigDecimal}}

//<<< DDD / Domain Event
@Data
@ToString
public class {{namePascalCase}} extends AbstractEvent {

    {{#fieldDescriptors}}
    private {{{className}}} {{nameCamelCase}};
    {{/fieldDescriptors}}

    {{#validate aggregate}}
    public {{namePascalCase}}({{aggregate.namePascalCase}} aggregate){
        super(aggregate);
    }
    {{/validate}}
    public {{namePascalCase}}(){
        super();
    }
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

window.$HandleBars.registerHelper('checkBigDecimal', function (fieldDescriptors) {
    for(var i = 0; i < fieldDescriptors.length; i ++ ){
        if(fieldDescriptors[i] && fieldDescriptors[i].className.includes('BigDecimal')){
            return "import java.math.BigDecimal;";
        }
    }
});

window.$HandleBars.registerHelper('validate', function (aggregate, options) {
    var keys = Object.keys(aggregate)
    if(keys.length > 1) {
        return options.fn(this);
    }
    return options.inverse(this);


});


</function>