forEach: View
fileName: {{namePascalCase}}Service.java
path: {{boundedContext.name}}/{{{options.packagePath}}}/service
---

package {{options.package}}.service;

import java.util.List;
import {{options.package}}.dto.entity.{{namePascalCase}};

public interface {{namePascalCase}}Service{
    public List<{{namePascalCase}}> getList();

    public {{namePascalCase}} getById(Long id);

}