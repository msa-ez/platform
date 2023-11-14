path: {{name}}/{{{options.packagePath}}}/dto/event
---
package {{options.package}}.dto.event;

import {{options.package}}.config.kafka.KafkaConfiguration;
import {{options.package}}.{{namePascalCase}}Application;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessageHeaders;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.util.MimeTypeUtils;
import org.springframework.transaction.support.TransactionSynchronizationAdapter;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.kafka.support.SendResult;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.Message;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

public class AbstractEvent {

    String eventType;
    Long timestamp;

    public AbstractEvent(){
        this.setEventType(this.getClass().getSimpleName());
        // SimpleDateFormat defaultSimpleDateFormat = new SimpleDateFormat("YYYYMMddHHmmss");
        // this.timestamp = defaultSimpleDateFormat.format(new Date());
        this.timestamp = System.currentTimeMillis();
    }

    public String toJson(){
        ObjectMapper objectMapper = new ObjectMapper();
        String json = null;

        try {
            json = objectMapper.writeValueAsString(this);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("JSON format exception", e);
        }

        return json;
    }

    public void publish(Long key){

        KafkaConfiguration kafkaConfiguration = {{namePascalCase}}Application.applicationContext.getBean(KafkaConfiguration.class);
        Map<String, Object> headers = new HashMap<>();
        headers.put(KafkaHeaders.TOPIC, "{{options.package}}");
        headers.put(KafkaHeaders.MESSAGE_KEY, Long.toString(key));
        Message<?> message = MessageBuilder.createMessage(this, new MessageHeaders(headers));
        kafkaConfiguration.kafkaTemplate().send(message);


    }

    public void publish(Long key, Integer partition){

        KafkaConfiguration kafkaConfiguration = {{namePascalCase}}Application.applicationContext.getBean(KafkaConfiguration.class);
        Map<String, Object> headers = new HashMap<>();
        headers.put(KafkaHeaders.TOPIC, "{{options.package}}");
        headers.put(KafkaHeaders.MESSAGE_KEY, Long.toString(key));
        headers.put(KafkaHeaders.PARTITION_ID, partition);

        Message<?> message = MessageBuilder.createMessage(this, new MessageHeaders(headers));
        kafkaConfiguration.kafkaTemplate().send(message);

    }

    


    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public Long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Long timestamp) {
        this.timestamp = timestamp;
    }

    public boolean validate(){
        return getEventType().equals(getClass().getSimpleName());
    }
}