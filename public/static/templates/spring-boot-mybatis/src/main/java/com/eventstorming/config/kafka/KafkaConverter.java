path: {{name}}/{{{options.packagePath}}}/config/kafka
---

package {{options.package}}.config.kafka;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skmove.muv.evrental.dto.event.AbstractEvent;
import org.apache.kafka.common.header.Headers;
import org.apache.kafka.common.header.internals.RecordHeaders;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.support.DefaultKafkaHeaderMapper;
import org.springframework.kafka.support.KafkaHeaderMapper;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageHeaders;
import org.springframework.messaging.converter.SmartMessageConverter;

{{#aggregates}}            
{{#events}}
import {{../../options.package}}.dto.event.{{namePascalCase}};
{{/events}}
{{/aggregates}}

@Configuration
public class KafkaConverter {

    @Autowired
    ObjectMapper objectMapper;

    @Bean
    public SmartMessageConverter smartMessageConverter() {
        return new SmartMessageConverter() {
            KafkaHeaderMapper headerMapper = new DefaultKafkaHeaderMapper();

            @Override
            public Object fromMessage(Message<?> message, Class<?> targetClass) {
                return fromMessage(message, targetClass, null);
            }

            @Override
            public Message<?> toMessage(Object payload, MessageHeaders headers) {
                return null;
            }

            @Override
            public Object fromMessage(Message<?> message, Class<?> targetClass, Object conversionHint) {
                MessageHeaders headers = message.getHeaders();
                Object payload = convertPayload(message.getPayload());
                Headers recordHeaders = new RecordHeaders();
                if (this.headerMapper != null) {
                    this.headerMapper.fromHeaders(headers, recordHeaders);
                }
                return payload;
            }

            @Override
            public Message<?> toMessage(Object payload, MessageHeaders headers, Object conversionHint) {
                return null;
            }
        };
    }

    public Object convertPayload(Object payload) {
        try {
            if (!(payload instanceof String)) {
                return payload;
            }
            AbstractEvent abstractEvent = objectMapper.readValue((String) payload, AbstractEvent.class);
            {{#aggregates}}
            
            {{#events}}
            {{#if @first}}
            if (abstractEvent.getEventType().equals("{{namePascalCase}}")) {
                {{namePascalCase}} {{nameCamelCase}} = objectMapper.readValue((String) payload, {{namePascalCase}}.class);
                return {{nameCamelCase}};
            }
            {{else}}
            else if (abstractEvent.getEventType().equals("{{namePascalCase}}")) {
                {{namePascalCase}} {{nameCamelCase}} = objectMapper.readValue((String) payload, {{namePascalCase}}.class);
                return {{nameCamelCase}};
            }
            {{/if}}
            {{/events}}
            
            {{/aggregates}}

        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
        return null;
    }
}