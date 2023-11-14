path: /src/main/java/com/example/template
---
package {{options.package}};
{{#if (isSelectedSecurity selectedSecurity)}}

import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.security.reactive.ReactiveUserDetailsServiceAutoConfiguration;

@SpringBootApplication(exclude = ReactiveUserDetailsServiceAutoConfiguration.class)
public class Application {

    public static ApplicationContext applicationContext;
    public static void main(String[] args) {
        applicationContext = SpringApplication.run(Application.class, args);
    }


}
{{else}}
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;

@SpringBootApplication
public class Application {

    public static ApplicationContext applicationContext;
    public static void main(String[] args) {
        applicationContext = SpringApplication.run(Application.class, args);
    }


}
{{/if}}


<function>
	window.$HandleBars.registerHelper('isSelectedSecurity', function (selectedSecurity) {
		try{
			if(!selectedSecurity)
				return false;

			if(selectedSecurity == 'isKeycloakSecurity'){
				return true;
			}

			return;
		} catch(e){
		console.log(e)
		}
  	});
</function>