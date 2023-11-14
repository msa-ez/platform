forEach: Aggregate
fileName: {{namePascalCase}}Policy.java
path: {{boundedContext.name}}/{{{options.packagePath}}}/domain/usecase
---
package {{options.package}}.domain.usecase;

import {{options.package}}.domain.*;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service 
public class {{namePascalCase}}Policy{
    @Autowired
    {{namePascalCase}}Repository {{nameCamelCase}}Repository;

{{#policyList}}
    {{#relationEventInfo}}
    public void {{../nameCamelCase}}({{eventValue.namePascalCase}} {{eventValue.nameCamelCase}}){

        {{../../namePascalCase}} {{../../nameCamelCase}} = new {{../../namePascalCase}}();
        /*
        LOGIC GOES HERE
        */
        // {{../../nameCamelCase}}Repository.save({{../../nameCamelCase}});

        {{#../relationExampleEventInfo}}
        // {{eventValue.namePascalCase}} {{eventValue.nameCamelCase}} = new {{eventValue.namePascalCase}}();
        /*
        Input Event Content
        */
        // {{eventValue.nameCamelCase}}.publishAfterCommit();

        {{/../relationExampleEventInfo}}

    }
    {{/relationEventInfo}}
{{/policyList}}
}