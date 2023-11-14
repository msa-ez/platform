representativeFor: Policy
path: {{name}}/{{{options.packagePath}}}/infra
mergeType: template
---
package {{options.package}}.infra;

import javax.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Service;

import io.eventuate.tram.events.subscriber.DomainEventDispatcher;
import io.eventuate.tram.events.subscriber.DomainEventDispatcherFactory;
import io.eventuate.tram.events.subscriber.DomainEventEnvelope;
import io.eventuate.tram.events.subscriber.DomainEventHandlersBuilder;

import {{options.package}}.domain.*;


@Service
@Transactional
@Configuration
public class PolicyHandler{


    {{#contexts}}
        {{#eventDispatchers}}

    @Bean
    public DomainEventDispatcher {{aggregate.nameCamelCase}}EventDispatcher(DomainEventDispatcherFactory domainEventDispatcherFactory) {
      return domainEventDispatcherFactory.make("{{aggregate.namePascalCase}}Events", DomainEventHandlersBuilder
      .forAggregateType("{{../../options.package}}.domain.{{aggregate.namePascalCase}}")
      {{#eventAndPolicy}}
      .onEvent({{event.namePascalCase}}.class, PolicyHandler::whenever{{event.namePascalCase}}_{{policy.namePascalCase}})
      {{/eventAndPolicy}}
      .build());
    }

        {{/eventDispatchers}}
    {{/contexts}}


    {{#aggregates}}
    @Autowired {{namePascalCase}}Repository {{nameCamelCase}}Repository;
    {{/aggregates}}
    
    {{#policies}}
    {{#relationAggregateInfo}}
    @Autowired
    {{../../options.package}}.external.{{aggregateValue.namePascalCase}}Service {{aggregateValue.nameCamelCase}}Service;

    {{/relationAggregateInfo}}



    {{#relationEventInfo}}
    public static void whenever{{eventValue.namePascalCase}}_{{../namePascalCase}}(DomainEventEnvelope<{{eventValue.namePascalCase}}> {{eventValue.nameCamelCase}}Envelope){

        {{eventValue.namePascalCase}} event = {{eventValue.nameCamelCase}}Envelope.getEvent();
        System.out.println("\n\n##### listener {{../namePascalCase}} : " + event + "\n\n");

        {{#../relationAggregateInfo}}
        // REST Request Sample
        
        // {{aggregateValue.nameCamelCase}}Service.get{{aggregateValue.namePascalCase}}(/** mapping value needed */);

        {{/../relationAggregateInfo}}

        {{#todo ../description}}{{/todo}}

        // Sample Logic //
        {{#../aggregateList}}
        {{namePascalCase}}.{{../../nameCamelCase}}(event);
        
        {{/../aggregateList}}

        

    }
    {{/relationEventInfo}}

    {{/policies}}
}



<function>

var eventDispatchers = {};
this.policies.forEach(policy => {

    var event = policy.relationEventInfo[0].eventValue;
    var aggregate = event.aggregate;  // TODO
    var eventDispatcher = eventDispatchers[aggregate.name];

    if(!eventDispatcher){
        eventDispatcher = {
            aggregate: aggregate,
            eventAndPolicy: []
        };

        eventDispatchers[aggregate.name] = eventDispatcher;
    }

    eventDispatcher.eventAndPolicy.push({event: event, policy: policy});
});

if(eventDispatchers)
    this.contexts["eventDispatchers"] = Object.values(eventDispatchers);


window.$HandleBars.registerHelper('todo', function (description) {

    if(description){
        description = description.replaceAll('\n','\n\t\t// ')
        return description = '// Comments // \n\t\t//' + description;
    }
     return null;
});

window.$HandleBars.registerHelper('log', function (msg) {

    console.log("log for template", msg);
     return null;
});

</function>