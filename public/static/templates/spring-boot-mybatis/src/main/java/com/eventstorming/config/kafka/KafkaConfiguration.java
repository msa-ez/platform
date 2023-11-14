path: {{name}}/{{{options.packagePath}}}/config/kafka
---
package {{options.package}}.config.kafka;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;
import org.springframework.kafka.listener.ContainerProperties;
import org.springframework.kafka.listener.ErrorHandler;
import org.springframework.kafka.listener.MessageListenerContainer;

import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.TopicPartition;

import java.util.List;

@EnableKafka
@Configuration
public class KafkaConfiguration {
    @Value("${spring.kafka.bootstrap.servers}")
    private String bootstrapServers;

    @Value("${spring.kafka.consumer.properties.auto-offset-reset}")
    private String offsetResetMode;
    

    @Bean
    public ConcurrentKafkaListenerContainerFactory<Object, Object> kafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<Object, Object> factory = new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory());
        
        factory.getContainerProperties().setAckMode(ContainerProperties.AckMode.MANUAL);
        factory.setErrorHandler(new ErrorHandler() {
            @Override
            public void handle(Exception e, ConsumerRecord<?, ?> consumerRecord ) {
            }
            @Override
            public void handle(Exception e, List<ConsumerRecord<?, ?>> records, Consumer<?, ?> consumer, MessageListenerContainer container) {
                String s = e.getMessage().split("Error deserializing key/value for partition ")[1].split(". If needed, please seek past the record to continue consumption.")[0];
                String topics = s.split("-")[0];
                int offset = Integer.valueOf(s.split("offset ")[1]);
                int partition = Integer.valueOf(s.split("-")[1].split(" at")[0]);
                System.out.println("[Warn] Unhandled Object from Kafka broker Offset at "+offset);
                TopicPartition topicPartition = new TopicPartition(topics, partition);
                consumer.seek(topicPartition, offset + 1);
                consumer.commitAsync();
            }
            @Override
            public boolean isAckAfterHandle() {
                return true;
            }
        });
        
        factory.setConcurrency(3);
        
        factory.getContainerProperties().setPollTimeout(5000);
        

        return factory;
    }

    @Bean
    public ProducerFactory<Object, Object> producerFactory() {
        return new DefaultKafkaProducerFactory(KafkaProperties.getProducerProperties(bootstrapServers));
    }

    @Bean
    public KafkaTemplate<Object, Object> kafkaTemplate(){
        return new KafkaTemplate<Object, Object>(producerFactory());
    }

    public ConsumerFactory<Object, Object> consumerFactory() {
        return new DefaultKafkaConsumerFactory(KafkaProperties.getConsumerProperties(bootstrapServers));
    }

    
}
