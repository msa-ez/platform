forEach: View
fileName: {{namePascalCase}}Controller.java
path: {{boundedContext.name}}/{{{options.packagePath}}}/controller
---

package {{options.package}}.controller;

import java.util.HashMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import {{options.package}}.dto.{{namePascalCase}};
import {{options.package}}.service.{{namePascalCase}}Service;

@RestController
@RequestMapping(value="/{{namePlural}}")
public class {{namePascalCase}}Controller{

    @Autowired
    {{namePascalCase}}Service {{nameCamelCase}}Service;

    @RequestMapping(value="", method=RequestMethod.GET)
    public ResponseEntity<?> getList(){
        HashMap<String, Object> result = new HashMap<>();

        result.put("data", {{nameCamelCase}}Service.getList());

        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @RequestMapping(value="/{id}", method=RequestMethod.GET)
    public {{namePascalCase}} getById(@PathVariable(value="id") Long id){
        {{namePascalCase}} {{nameCamelCase}} = {{nameCamelCase}}Service.getById(id);

        return {{nameCamelCase}};
    }

    
}