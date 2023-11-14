forEach: View
fileName: {{namePascalCase}}Repository.java
path: {{boundedContext.name}}/{{{options.packagePath}}}/infra
---
package {{options.package}}.infra;

import {{options.package}}.domain.*;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface {{namePascalCase}}Repository extends CrudRepository<{{namePascalCase}}, Long> {

{{#updateRules}}
    {{#where}}
    {{^viewField.isKey}}
    List<{{../../namePascalCase}}> findBy{{viewField.namePascalCase}}({{viewField.className}} {{viewField.nameCamelCase}});
    {{/viewField.isKey}}
    {{/where}}
{{/updateRules}}

{{#deleteRules}}
    {{#where}}
    {{^viewField.isKey}}
        void deleteBy{{viewField.namePascalCase}}({{viewField.className}} {{viewField.nameCamelCase}});
    {{/viewField.isKey}}
    {{/where}}
{{/deleteRules}}
}