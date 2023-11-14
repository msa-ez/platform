forEach: View
fileName: {{namePascalCase}}ServiceImpl.java
path: {{boundedContext.name}}/{{{options.packagePath}}}/service/impl
---
package {{options.package}}.service.impl;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import {{options.package}}.dto.entity.{{namePascalCase}};
import {{options.package}}.mapper.{{namePascalCase}}Mapper;

@Service
public class {{namePascalCase}}ServiceImpl implements {{namePascalCase}}Service{
    @Autowired
    {{namePascalCase}}Mapper {{nameCamelCase}}Mapper;
    
    @Override
    public List<{{namePascalCase}}> getList(){
        List<{{namePascalCase}}> {{nameCamelCase}}List = {{nameCamelCase}}Mapper.findList();

        return {{nameCamelCase}}List;
    }

    @Override
    public {{namePascalCase}} getById(Long id){
        {{namePascalCase}} {{nameCamelCase}} = {{nameCamelCase}}Mapper.findOneById(id);

        return {{nameCamelCase}};
    }
}

