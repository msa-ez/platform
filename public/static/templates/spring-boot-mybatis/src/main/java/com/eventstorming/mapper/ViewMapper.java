forEach: View
fileName: {{namePascalCase}}Mapper.java
path: {{boundedContext.name}}/{{{options.packagePath}}}/mapper
---
package {{options.package}}.mapper;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import {{options.package}}.dto.entity.{{namePascalCase}};

@Mapper
public interface {{namePascalCase}}Mapper{
    public List<{{namePascalCase}}> findList();

    public {{namePascalCase}} findOneById(Long id);
} 