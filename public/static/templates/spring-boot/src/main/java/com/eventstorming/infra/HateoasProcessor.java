forEach: Aggregate
fileName: {{namePascalCase}}HateoasProcessor.java
path: {{boundedContext.name}}/{{{options.packagePath}}}/infra
mergeType: template
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

        {{#if (checkGeneralization aggregateRoot.entities.relations nameCamelCase)}}
        model.add(Link.of("/" + model.getContent().getClass().getSimpleName()).withRel("type"));
        {{#each aggregateRoot.entities.relations}}
        {{#if (isGeneralization targetElement.namePascalCase ../namePascalCase relationType)}}
        {{#sourceElement.operations}}
        {{^isOverride}}
        if(model.getContent() instanceof {{../sourceElement.namePascalCase}}) {
            model.add(Link.of(model.getRequiredLink("self").getHref() + "/{{name}}").withRel("{{name}}"));
        }
        {{/isOverride}}
        {{/sourceElement.operations}}
        {{/if}}
        {{/each}}
        {{/if}}
        
        return model;
    }
    
}

<function>
    window.$HandleBars.registerHelper('isGeneralization', function (toName, name, type) {
        try {
            if(toName == null || name == null || type == null) {
                return false;
            } else {
                if(toName == name && type.includes("Generalization")) {
                    return true;
                } else {
                    return false;
                }
            }
        } catch(e) {
            console.log(e)
        }
    });

    window.$HandleBars.registerHelper('checkGeneralization', function (relations, name) {
        try {
            if (typeof relations == "undefined") {
                return 
            } else {
                for (var i = 0; i < relations.length; i ++ ) {
                    if (relations[i] != null) {
                        if (relations[i].targetElement != "undefined") {
                            if(relations[i].targetElement.name.toLowerCase() == name && relations[i].relationType.includes("Generalization")) {
                                return true;
                            }
                        }
                    }
                }
                return false;
            }
        } catch(e) {
            console.log(e)
        }
    });
</function>