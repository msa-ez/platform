forEach: Aggregate
fileName: {{namePascalCase}}HateoasProcessor.java
path: {{boundedContext.name}}/{{{options.packagePath}}}/infra
---
package {{options.package}}.infra;
import {{options.package}}.domain.*;

import org.springframework.hateoas.Link;
import org.springframework.hateoas.server.RepresentationModelProcessor;
import org.springframework.stereotype.Component;
import org.springframework.hateoas.EntityModel;

@Component
public class {{namePascalCase}}HateoasProcessor implements RepresentationModelProcessor<EntityModel<{{namePascalCase}}>>  {

    @Override
    public EntityModel<{{namePascalCase}}> process(EntityModel<{{namePascalCase}}> model) {
        {{#commands}}
        {{^isRestRepository}}
        model.add(Link.of(model.getRequiredLink("self").getHref() + "/{{controllerInfo.apiPath}}").withRel("{{controllerInfo.apiPath}}"));
        {{/isRestRepository}}
        {{/commands}}
        
        return model;
    }
    
}

