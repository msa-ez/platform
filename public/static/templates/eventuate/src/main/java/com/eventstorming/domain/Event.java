forEach: Event
representativeFor: Event
fileName: {{namePascalCase}}.java
path: {{boundedContext.name}}/{{{options.packagePath}}}/domain
priority: 1
---
package {{options.package}}.domain;

import {{options.package}}.domain.*;
import java.util.*;
import lombok.*;
import io.eventuate.tram.events.common.DomainEvent;
import org.springframework.beans.BeanUtils;


@Data
@ToString
public class {{namePascalCase}} implements DomainEvent {

    {{#fieldDescriptors}}
    private {{{className}}} {{nameCamelCase}};
    {{/fieldDescriptors}}

    {{#validate aggregate}}
    public {{namePascalCase}}({{aggregate.namePascalCase}} aggregate){
        BeanUtils.copyProperties(aggregate, this);
    }
    {{/validate}}
    public {{namePascalCase}}(){
        super();
    }
}

<function>
window.$HandleBars.registerHelper('checkDateType', function (fieldDescriptors) {

    for(var i = 0; i < fieldDescriptors.length; i ++ ){
        if(fieldDescriptors[i] && fieldDescriptors[i].className == 'Date'){
            return "import java.util.Date; \n"
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