forEach: Aggregate
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

import {{options.package}}.service.{{namePascalCase}}Service;
import {{options.package}}.dto.entity.{{namePascalCase}};

@RestController
@RequestMapping(value="/{{namePlural}}")
public class {{namePascalCase}}Controller{

    @Autowired
    {{namePascalCase}}Service {{nameCamelCase}}Service;

    {{#commands}}
        {{#isRestRepository}}
        {{/isRestRepository}}

        {{^isRestRepository}}
@RequestMapping(value = "/{{controllerInfo.apiPath}}",
        method = RequestMethod.{{controllerInfo.method}},
        produces = "application/json;charset=UTF-8")

public void {{nameCamelCase}}(HttpServletRequest request, HttpServletResponse response)
        throws Exception {
        System.out.println("##### /{{aggregate.nameCamelCase}}/{{nameCamelCase}}  called #####");
        }
        {{/isRestRepository}}
        {{/commands}}

    @RequestMapping(value="", method=RequestMethod.GET)
    public ResponseEntity<?> getList() {
        HashMap<String, Object> result = new HashMap<>();

        result.put("data", {{nameCamelCase}}Service.getList());

        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @RequestMapping(value="/{id}", method=RequestMethod.GET)
    public {{namePascalCase}} getById(@PathVariable(value="id") Long id){
        {{namePascalCase}} {{nameCamelCase}} = {{nameCamelCase}}Service.getById(id);

        return {{nameCamelCase}};
    }

    @RequestMapping(value="", method=RequestMethod.POST)
    public {{namePascalCase}} post(@RequestBody {{namePascalCase}} {{nameCamelCase}}){
        {{nameCamelCase}}Service.save({{nameCamelCase}});
        
        return {{nameCamelCase}};
    }

    @RequestMapping(value="/{id}", method=RequestMethod.PUT)
    public void put(@PathVariable(value="id") Long id, @RequestBody {{namePascalCase}} {{nameCamelCase}}){
        {{nameCamelCase}}.setId(id);
        {{nameCamelCase}}Service.update({{nameCamelCase}});
    }

    @RequestMapping(value="/{id}", method=RequestMethod.DELETE)
    public ResponseEntity<?> deletebyId(@PathVariable(value="id") Long id){
        {{nameCamelCase}}Service.delete(id);

        return new ResponseEntity<>(HttpStatus.OK);
    }
}