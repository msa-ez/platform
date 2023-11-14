forEach: BoundedContext
fileName: KafkaProcessor.go
path: {{name}}/{{name}}
---
package {{name}}

import (
	"gopkg.in/confluentinc/confluent-kafka-go.v1/kafka"
	"fmt"
    "encoding/json"
    "{{name}}/config"
)

var producer *kafka.Producer
var consumer *kafka.Consumer
var topic string

func InitProducer(platform string){
	var err error
    var options = config.Reader(platform)
	producer, err = kafka.NewProducer(&kafka.ConfigMap{"bootstrap.servers": options["bootstrap_servers"]})
	if err != nil {
		panic(err)
	}
	topic = options["destination"]
}

func InitConsumer(platform string){
	var err error
    var options = config.Reader(platform)
	consumer, err = kafka.NewConsumer(&kafka.ConfigMap{
		"bootstrap.servers": options["bootstrap_servers"],
		"group.id":          options["group_id"],
		"broker.address.family": "v4",
		"session.timeout.ms":    6000,
		"auto.offset.reset": "earliest",
	})
	topic = options["destination"]

	if err != nil {
		panic(err)
	}
	defer consumer.Close()
	KafkaConsumer()
	
}

func KafkaProducer() (*kafka.Producer, string){
	
	return producer, topic
}

func KafkaConsumer(){
    
	
    consumer.SubscribeTopics([]string{topic}, nil)

	var dat map[string]interface{}
    for {
        msg, err := consumer.ReadMessage(-1)
        if err == nil {
			if err := json.Unmarshal(msg.Value, &dat); err != nil {
				panic(err)
			}
            {{#policies}}
				{{#relationEventInfo}}
			for _, header := range msg.Headers {
				if header.Key == "type" && string(header.Value) == "{{eventValue.namePascalCase}}" {
					whenever{{eventValue.namePascalCase}}_{{../namePascalCase}}(dat)
				}
			}
            //if dat["eventType"] == "{{eventValue.namePascalCase}}"{
            //    whenever{{eventValue.namePascalCase}}_{{../namePascalCase}}(dat)
            //}
				{{/relationEventInfo}}
            {{/policies}}
			{{#views}}
				{{#createRules}}
			for _, header := range msg.Headers {
				if header.Key == "type" && string(header.Value) == "{{when.namePascalCase}}" {
					when{{when.namePascalCase}}_then_{{operation}}_{{_index}}(dat)
				}
			}
			//if dat["eventType"] == "{{when.namePascalCase}}"{
			//	when{{when.namePascalCase}}_then_{{operation}}_{{_index}}(dat)
			//}
				{{/createRules}}
				{{#updateRules}}
			for _, header := range msg.Headers {
				if header.Key == "type" && string(header.Value) == "{{when.namePascalCase}}" {
					when{{when.namePascalCase}}_then_{{operation}}_{{_index}}(dat)
				}
			}
			//if dat["eventType"] == "{{when.namePascalCase}}"{
			//	when{{when.namePascalCase}}_then_{{operation}}_{{_index}}(dat)
			//}
				{{/updateRules}}

				{{#deleteRules}}
			for _, header := range msg.Headers {
				if header.Key == "type" && string(header.Value) == "{{when.namePascalCase}}" {
					when{{when.namePascalCase}}_then_{{operation}}_{{_index}}(dat)
				}
			}
			//if dat["eventType"] == "{{when.namePascalCase}}"{
			//	when{{when.namePascalCase}}_then_{{operation}}_{{_index}}(dat)
			//}
				{{/deleteRules}}
			{{/views}}
			
        } else {
            // The client will automatically try to recover from all errors.
            fmt.Printf("Consumer error: %v (%v)\n", err, msg)
        }
    }
}

func SendStreamMsg(message, eventType string) {
	producer, topic := KafkaProducer()
	eventHeaders := []kafka.Header{
		{"type", []byte(eventType)},
	}
	producer.Produce(&kafka.Message{
		TopicPartition: kafka.TopicPartition{Topic: &topic, Partition: kafka.PartitionAny},
		Value:          []byte(message),
		Headers:        eventHeaders,
	}, nil)
}