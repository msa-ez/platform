forEach: Aggregate
fileName: {{namePascalCase}}Command.java
path: {{boundedContext.name}}/{{{options.packagePath}}}/domain/usecase
---
package {{options.package}}.domain.usecase;

import {{options.package}}.{{namePascalCase}}Application;
import {{options.package}}.domain.*;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service 
public class {{namePascalCase}}Command{
    @Autowired
    {{namePascalCase}}Repository {{nameCamelCase}}Repository;

    {{#commands}}
    {{^isRestRepository}}
    public void {{nameCamelCase}}(){
        {{#triggerByCommand}}
        {{eventValue.namePascalCase}} {{eventValue.nameCamelCase}} = new {{eventValue.namePascalCase}}();
        /*
        Input Event Content
        */
        {{eventValue.nameCamelCase}}.publishAfterCommit();

        {{#relationCommandInfo}}
        {{#commandValue}}
        //Following code causes dependency to external APIs
        // it is NOT A GOOD PRACTICE. instead, Event-Policy mapping is recommended.

        {{../../../../options.package}}.external.{{aggregate.namePascalCase}} {{aggregate.nameCamelCase}} = new {{../../../../options.package}}.external.{{aggregate.namePascalCase}}();
        // mappings goes here
        {{../boundedContext.namePascalCase}}Application.applicationContext.getBean({{../../../../options.package}}.external.{{aggregate.namePascalCase}}Service.class)
            .{{nameCamelCase}}({{aggregate.nameCamelCase}});

        {{/commandValue}}
        {{/relationCommandInfo}}
        {{/triggerByCommand}}
    }
    {{/isRestRepository}}
    {{/commands}}
}