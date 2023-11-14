path: {{name}}/{{{options.packagePath}}}/policy
---
package {{options.package}}.policy;

import org.axonframework.config.ProcessingGroup;
import org.axonframework.eventhandling.EventHandler;
import org.axonframework.queryhandling.QueryHandler;
import org.axonframework.eventhandling.DisallowReplay;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.axonframework.commandhandling.gateway.CommandGateway;

import {{options.package}}.command.*;
import {{options.package}}.event.*;
import {{options.package}}.aggregate.*;

//<<< Clean Arch / Inbound Adaptor
//<<< EDA / Event Handler

@Service
@ProcessingGroup("{{nameCamelCase}}")
public class PolicyHandler{

    @Autowired
    CommandGateway commandGateway;

    {{#policies}}
        {{#relationEventInfo}}
    @EventHandler
    //@DisallowReplay
    public void whenever{{eventValue.namePascalCase}}_{{../namePascalCase}}({{eventValue.namePascalCase}}Event {{eventValue.nameCamelCase}}){
        System.out.println({{eventValue.nameCamelCase}}.toString());

        {{../namePascalCase}}Command command = new {{../namePascalCase}}Command();
        commandGateway.send(command);
    }
        {{/relationEventInfo}}
    {{/policies}}

}
//>>> EDA / Event Handler
//>>> Clean Arch / Inbound Adaptor
