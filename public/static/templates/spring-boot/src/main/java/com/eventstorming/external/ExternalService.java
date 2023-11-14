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


//<<< Resilency / Circuit Breaker
{{#if boundedContext.fallback}}
//<<< Resilency / Fallback
@FeignClient(name = "{{commandValue.boundedContext.name}}", url = "{{apiVariable commandValue.boundedContext.name}}", fallback = {{commandValue.aggregate.namePascalCase}}ServiceImpl.class)
//>>> Resilency / Fallback
{{else}}
@FeignClient(name = "{{commandValue.boundedContext.name}}", url = "{{apiVariable commandValue.boundedContext.name}}")
{{/if}}
public interface {{commandValue.aggregate.namePascalCase}}Service {
{{#if commandValue.restRepositoryInfo.getMethod}}
    @RequestMapping(method= RequestMethod.GET, path="/{{commandValue.aggregate.namePlural}}/{{wrap commandValue.aggregate.keyFieldDescriptor.name}}")
    public {{commandValue.aggregate.namePascalCase}} get{{commandValue.aggregate.namePascalCase}}(@PathVariable("{{commandValue.aggregate.keyFieldDescriptor.name}}") {{commandValue.aggregate.keyFieldDescriptor.className}} {{commandValue.aggregate.keyFieldDescriptor.name}});
{{else if commandValue.restRepositoryInfo.method}}
    {{#commandValue.isRestRepository}}
    @RequestMapping(method= RequestMethod.{{commandValue.restRepositoryInfo.method}}, path="/{{commandValue.aggregate.namePlural}}")
    public void {{commandValue.nameCamelCase}}(@RequestBody {{commandValue.aggregate.namePascalCase}} {{commandValue.aggregate.nameCamelCase}});
    {{/commandValue.isRestRepository}}
    {{^commandValue.isRestRepository}}
    @RequestMapping(method= RequestMethod.{{commandValue.controllerInfo.method}}, path="/{{#setPath commandValue}}{{/setPath}}")
    public void {{commandValue.nameCamelCase}}(@PathVariable("id") {{commandValue.aggregate.keyFieldDescriptor.className}} {{commandValue.aggregate.keyFieldDescriptor.name}}{{#if (hasFields commandValue.fieldDescriptors)}}, @RequestBody {{commandValue.namePascalCase}}Command {{commandValue.nameCamelCase}}Command {{/if}});
    {{/commandValue.isRestRepository}}
{{else}}
    @RequestMapping(method= RequestMethod.GET, path="/{{commandValue.aggregate.namePlural}}/{{wrap commandValue.aggregate.keyFieldDescriptor.name}}")
    public {{commandValue.aggregate.namePascalCase}} get{{commandValue.aggregate.namePascalCase}}(@PathVariable("{{commandValue.aggregate.keyFieldDescriptor.name}}") {{commandValue.aggregate.keyFieldDescriptor.className}} {{commandValue.aggregate.keyFieldDescriptor.name}});
{{/if}}
}
//>>> Resilency / Circuit Breaker

<function>

  window.$HandleBars.registerHelper('setPath', function (command) {
      if(command && command.controllerInfo && command.controllerInfo.apiPath){
          return command.aggregate.namePlural + '/{id}/' + command.controllerInfo.apiPath;
      }
          return command.aggregate.namePlural + '/{id}';

  })
  
  window.$HandleBars.registerHelper('hasFields', function (fieldDescriptors) {
    if(fieldDescriptors.length > 0) {
      return true;
    } else {
      return false;
    }
  });

  window.$HandleBars.registerHelper('log', function (aggregate) {
//      console.log("template log:", aggregate)
    return aggregate;
  })

  window.$HandleBars.registerHelper('wrap', function (exp) {
    return '{'+exp+'}';
  })

  window.$HandleBars.registerHelper('apiVariable', function (bc) {
    return '${api.url.'+bc+'}';
  })

</function>