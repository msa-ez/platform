forEach: RelationCommandInfo
fileName: {{commandValue.aggregate.namePascalCase}}Service.java
path: {{boundedContext.name}}/{{{options.packagePath}}}/external
---
package {{options.package}}.external;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import java.util.Date;

{{#if boundedContext.fallback}}
@FeignClient(name="{{commandValue.boundedContext.name}}", url="http://{{commandValue.boundedContext.name}}:8080", fallback={{commandValue.aggregate.namePascalCase}}ServiceImpl.class)
{{else}}
@FeignClient(name="{{commandValue.boundedContext.name}}", url="http://{{commandValue.boundedContext.name}}:8080")
{{/if}}
public interface {{commandValue.aggregate.namePascalCase}}Service {
{{#if commandValue.restRepositoryInfo.getMethod}}
    @RequestMapping(method= RequestMethod.GET, path="/{{commandValue.aggregate.namePlural}}/{{wrap commandValue.aggregate.keyFieldDescriptor.name}}")
    public {{commandValue.aggregate.namePascalCase}} get{{commandValue.aggregate.namePascalCase}}(@PathVariable("{{commandValue.aggregate.keyFieldDescriptor.name}}") {{commandValue.aggregate.keyFieldDescriptor.className}} {{commandValue.aggregate.keyFieldDescriptor.name}});
{{else if commandValue.restRepositoryInfo.method}}
    @RequestMapping(method= RequestMethod.{{commandValue.restRepositoryInfo.method}}, path="/{{commandValue.aggregate.namePlural}}")
    public void {{commandValue.nameCamelCase}}(@RequestBody {{commandValue.aggregate.namePascalCase}} {{commandValue.aggregate.nameCamelCase}});
{{else}}
    @RequestMapping(method= RequestMethod.GET, path="/{{commandValue.aggregate.namePlural}}/{{wrap commandValue.aggregate.keyFieldDescriptor.name}}")
    public {{commandValue.aggregate.namePascalCase}} get{{commandValue.aggregate.namePascalCase}}(@PathVariable("{{commandValue.aggregate.keyFieldDescriptor.name}}") {{commandValue.aggregate.keyFieldDescriptor.className}} {{commandValue.aggregate.keyFieldDescriptor.name}});
{{/if}}

}


<function>

  window.$HandleBars.registerHelper('log', function (aggregate) {
      console.log("template log:", aggregate)
    return aggregate;
  })

  window.$HandleBars.registerHelper('wrap', function (exp) {
    return '{'+exp+'}';
  })

</function>