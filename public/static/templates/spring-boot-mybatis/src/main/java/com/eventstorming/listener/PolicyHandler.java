path: {{name}}/{{{options.packagePath}}}/listener
---
package {{options.package}}.listener;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.json.simple.parser.JSONParser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.listener.AcknowledgingMessageListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.kafka.annotation.KafkaHandler;
{{#aggregates}}
import {{options.package}}.service.{{namePascalCase}}Service;
{{/aggregates}}

{{#policies}}
{{#relationEventInfo}}
import {{options.package}}.dto.event.{{eventValue.namePascalCase}};
{{/relationEventInfo}}
{{/policies}}

@Service
@KafkaListener(topics = "{{options.package}}", groupId = "{{nameCamelCase}}", containerFactory = "kafkaListenerContainerFactory",contentTypeConverter="smartMessageConverter")
public class PolicyHandler {
    private static final Logger LOGGER = LoggerFactory.getLogger(PolicyHandler.class);

    {{#aggregates}}
    @Autowired {{namePascalCase}}Service {{nameCamelCase}}Service;
    {{/aggregates}}

    {{#policies}}
        {{#relationEventInfo}}
    @KafkaHandler
    public void whenever{{eventValue.namePascalCase}}_{{../namePascalCase}}(@Payload {{eventValue.namePascalCase}} {{eventValue.nameCamelCase}}, Acknowledgment acknowledgment,
                                            @Nullable @Header(KafkaHeaders.RECEIVED_PARTITION_ID) Integer partition,
                                            @Nullable @Header(KafkaHeaders.RECEIVED_MESSAGE_KEY) String messageKey){

        
            
        {{#../relationAggregateInfo}}
        // REST Request Sample
        // {{../../../options.package}}.external.{{aggregateValue.namePascalCase}} {{aggregateValue.nameCamelCase}} =
        //    {{../../boundedContext.namePascalCase}}Application.applicationContext.getBean({{../../../options.package}}.external.{{aggregateValue.namePascalCase}}Service.class)
        //    .get{{aggregateValue.namePascalCase}}(/** mapping value needed */);

        {{/../relationAggregateInfo}}


        // Sample Logic //
        {{#../../aggregates}}
        // {{namePascalCase}} {{nameCamelCase}} = new {{namePascalCase}}();
        // {{nameCamelCase}}Service.save({{nameCamelCase}});
        {{/../../aggregates}}
        
        acknowledgment.acknowledge();
        

    }
        {{/relationEventInfo}}
    {{/policies}}

    @KafkaHandler(isDefault = true)
    public void listenDefault(Object object, Acknowledgment acknowledgment) {
        System.out.println("[Info] Unhandled Event from Kafka broker: " + object.toString());
        acknowledgment.acknowledge();
    }

    


}