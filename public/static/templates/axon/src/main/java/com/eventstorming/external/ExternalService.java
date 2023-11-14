forEach: RelationCommandInfo
fileName: {{commandValue.aggregate.namePascalCase}}Service.java
path: {{boundedContext.name}}/{{{options.packagePath}}}/external
---

package {{options.package}}.external;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

{{#checkDateType commandValue.aggregate.aggregateRoot.fieldDescriptors}} {{/checkDateType}}
{{#checkBigDecimal commandValue.aggregate.aggregateRoot.fieldDescriptors}} {{/checkBigDecimal}}

@FeignClient(name="{{commandValue.boundedContext.name}}", url="http://{{commandValue.boundedContext.name}}:8080")
public interface {{commandValue.aggregate.namePascalCase}}Service {

    @RequestMapping(method= RequestMethod.{{commandValue.restRepositoryInfo.method}}, path="/{{commandValue.aggregate.namePlural}}")
    public void {{commandValue.nameCamelCase}}(@RequestBody {{commandValue.aggregate.namePascalCase}} {{commandValue.aggregate.nameCamelCase}});

}