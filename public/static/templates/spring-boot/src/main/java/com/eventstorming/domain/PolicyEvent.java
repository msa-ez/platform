forEach: RelationEventInfo
fileName: {{eventValue.namePascalCase}}.java
path: {{boundedContext.name}}/{{{options.packagePath}}}/domain
priority: 2
---
package {{options.package}}.domain;

import {{options.package}}.domain.*;
import {{options.package}}.infra.AbstractEvent;
import lombok.*;
import java.util.*;
@Data
@ToString
public class {{eventValue.namePascalCase}} extends AbstractEvent {

{{#eventValue.fieldDescriptors}}
    private {{safeTypeOf className}} {{nameCamelCase}};
{{/eventValue.fieldDescriptors}}
}



<function>
    window.$HandleBars.registerHelper('safeTypeOf', function (className) {
        if(className.endsWith("String") || className.endsWith("Integer") || className.endsWith("Long") || className.endsWith("Double") || className.endsWith("Float")
            || className.endsWith("Boolean") || className.endsWith("Date")){
            return className;
        }else
            return "Object";
        // if(className.indexOf("List")==0){
        //     return "java.util.List<java.util.Map>";
        // } else{
        //     return "java.util.Map";
        // } 
        //else if (enum) return "String"
    })


</function>
