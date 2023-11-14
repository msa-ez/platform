forEach: BoundedContext
fileName: CucumberSpingConfiguration.java
path: {{name}}/src/test/java/{{options.package}}/common
---
package {{options.package}}.common;


import {{options.package}}.{{namePascalCase}}Application;
import io.cucumber.spring.CucumberContextConfiguration;
import org.springframework.boot.test.context.SpringBootTest;

@CucumberContextConfiguration
@SpringBootTest(classes = { {{namePascalCase}}Application.class })
public class CucumberSpingConfiguration {
    
}
