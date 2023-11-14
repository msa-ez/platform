forEach: RelationCommandInfo
fileName: {{commandValue.aggregate.namePascalCase}}ServiceImpl.java
path: {{boundedContext.name}}/{{{options.packagePath}}}/external
---
package {{options.package}}.external;

import org.springframework.stereotype.Service;

//<<< Resilency / Fallback
@Service
public class {{commandValue.aggregate.namePascalCase}}ServiceImpl implements {{commandValue.aggregate.namePascalCase}}Service {


    /**
     * Fallback
     */
    public {{commandValue.aggregate.namePascalCase}} get{{commandValue.aggregate.namePascalCase}}(Long id) {
        {{commandValue.aggregate.namePascalCase}} {{commandValue.aggregate.nameCamelCase}} = new {{commandValue.aggregate.namePascalCase}}();
        return {{commandValue.aggregate.nameCamelCase}};
    }
}
//>>> Resilency / Fallback

<function>

  window.$HandleBars.registerHelper('log', function (aggregate) {
//      console.log("template log:", aggregate)
    return aggregate;
  })

  window.$HandleBars.registerHelper('wrap', function (exp) {
    return '{'+exp+'}';
  })

</function>