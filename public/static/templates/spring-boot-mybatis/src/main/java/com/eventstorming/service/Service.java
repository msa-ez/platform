forEach: Aggregate
fileName: {{namePascalCase}}Service.java
path: {{boundedContext.name}}/{{{options.packagePath}}}/service
---

package {{options.package}}.service;

import java.util.List;
import {{options.package}}.dto.entity.{{namePascalCase}};

public interface {{namePascalCase}}Service{
    public List<{{namePascalCase}}> getList();

    public void save({{namePascalCase}} {{nameCamelCase}});

    public {{namePascalCase}} getById(Long id);

    public void delete(Long id);

    public void update({{namePascalCase}} {{nameCamelCase}});
}