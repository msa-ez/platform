forEach: BoundedContext
fileName: TestMain.java
path: {{name}}/src/test/java/{{options.package}}/main
---
package {{options.package}}.main;

import io.cucumber.junit.Cucumber;
import io.cucumber.junit.CucumberOptions;
import org.junit.runner.RunWith;

@RunWith(Cucumber.class)
@CucumberOptions(plugin={"pretty","html:target/cucumber"},
                features = "src/test/resources/features",
                extraGlue="{{options.package}}/common")
public class TestMain {
    
}
