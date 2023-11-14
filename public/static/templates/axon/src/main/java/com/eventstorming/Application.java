path: {{name}}/{{{options.packagePath}}}
fileName: {{namePascalCase}}Application.java
---
package {{options.package}};

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;
//import org.springframework.cloud.openfeign.EnableFeignClients;


@SpringBootApplication
//@EnableFeignClients
public class {{namePascalCase}}Application {
    protected static ApplicationContext applicationContext;
    public static void main(String[] args) {
        applicationContext = SpringApplication.run({{namePascalCase}}Application.class, args);
    }
}
