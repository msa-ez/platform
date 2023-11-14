forEach: Event
representativeFor: Event
fileName: {{namePascalCase}}.java
path: {{boundedContext.name}}/{{{options.packagePath}}}/domain
---
package {{options.package}}.domain;

import {{options.package}}.domain.*;
import {{options.package}}.infra.AbstractEvent;
import java.util.Date;

public class {{namePascalCase}} extends AbstractEvent {

    {{#fieldDescriptors}}
    private {{className}} {{nameCamelCase}};
    {{/fieldDescriptors}}

    public {{namePascalCase}}(){
        super();
    }

    {{#fieldDescriptors}}
    public {{className}} get{{namePascalCase}}() {
        return {{nameCamelCase}};
    }

    public void set{{namePascalCase}}({{className}} {{nameCamelCase}}) {
        this.{{nameCamelCase}} = {{nameCamelCase}};
    }
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