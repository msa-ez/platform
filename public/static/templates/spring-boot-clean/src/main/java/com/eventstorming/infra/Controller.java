forEach: Aggregate
representativeFor: Command
fileName: {{namePascalCase}}Controller.java
path: {{boundedContext.name}}/{{{options.packagePath}}}/infra
---
package {{options.package}}.infra;
import {{options.package}}.domain.*;
import {{options.package}}.domain.usecase.*;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.transaction.Transactional;

 @RestController
 @RequestMapping(value="/{{namePlural}}")
 @Transactional
 public class {{ namePascalCase }}Controller {

        @Autowired
        {{namePascalCase}}Command {{nameCamelCase}}Command;
        {{#commands}}
        {{#isRestRepository}}
        {{/isRestRepository}}

        {{^isRestRepository}}

        {{#checkMethod controllerInfo.method}}
        @RequestMapping(value = "/{id}/{{controllerInfo.apiPath}}",
                method = RequestMethod.{{controllerInfo.method}},
                produces = "application/json;charset=UTF-8")
        public {{aggregate.namePascalCase}} {{nameCamelCase}}(@PathVariable(value = "id") Long id, HttpServletRequest request, HttpServletResponse response)
                throws Exception {
                        System.out.println("##### /{{aggregate.nameCamelCase}}/{{nameCamelCase}}  called #####");
                        Optional<{{aggregate.namePascalCase}}> optional{{aggregate.namePascalCase}} = {{aggregate.nameCamelCase}}Repository.findById(id);
                        
                        optional{{aggregate.namePascalCase}}.orElseThrow(()-> new Exception("No Entity Found"));
                        {{aggregate.namePascalCase}} {{aggregate.nameCamelCase}} = optional{{aggregate.namePascalCase}}.get();
                        {{aggregate.nameCamelCase}}Command.{{nameCamelCase}}();
                        

                        return {{aggregate.nameCamelCase}};
                        
                }
        {{/checkMethod}}

        {{^checkMethod controllerInfo.method}}
        @RequestMapping(value = "/{{controllerInfo.apiPath}}",
                method = RequestMethod.{{controllerInfo.method}},
                produces = "application/json;charset=UTF-8")
        public {{aggregate.namePascalCase}} {{nameCamelCase}}(HttpServletRequest request, HttpServletResponse response,@RequestBody {{aggregate.namePascalCase}} {{aggregate.nameCamelCase}})
                throws Exception {
                        System.out.println("##### /{{aggregate.nameCamelCase}}/{{nameCamelCase}}  called #####");
                        {{aggregate.nameCamelCase}}Command.{{nameCamelCase}}();
                        return {{aggregate.nameCamelCase}};
                }
        {{/checkMethod}}
        
        {{/isRestRepository}}
        {{/commands}}
 }

<function>
window.$HandleBars.registerHelper('methodConvert', function (method) {
        if(method.endsWith("PUT")){
                return "save";
        }
        else{
                return "delete";
        }
    });
window.$HandleBars.registerHelper('checkMethod', function (method, options) {
        if(method.endsWith("PUT") || method.endsWith("DELETE")){
                return options.fn(this);
        }
        else{
                return options.inverse(this);
        }
    });
window.$HandleBars.registerHelper('isPut', function (method, options) {
        if(method.endsWith("PUT")){
                return options.fn(this);
        }
        else{
                return options.inverse(this);
        }
    });

window.$HandleBars.registerHelper('isPOST', function (method, options) {
        if(method.endsWith("POST")){
                return options.fn(this);
        }
        else{
                return options.inverse(this);
        }
    });
    
window.$HandleBars.registerHelper('isDelete', function (method, options) {
        if(method.endsWith("DELETE")){
                return options.fn(this);
        }
        else{
                return options.inverse(this);
        }
    });
</function>