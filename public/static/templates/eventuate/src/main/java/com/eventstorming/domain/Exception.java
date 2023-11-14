forEach: Exception
fileName: {{namePascalCase}}.java
path: {{boundedContext.name}}/{{{options.packagePath}}}/domain
---
package {{options.package}}.domain;

import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.http.HttpStatus;


@ResponseStatus(code = HttpStatus.{{httpStatus}}, reason="{{message}}")
public class {{namePascalCase}} extends RuntimeException{

    public {{namePascalCase}}() {
        super("{{message}}");
        
    }
}