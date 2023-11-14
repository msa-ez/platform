forEach: BoundedContext
fileName: consumer.js
path: {{name}}/streamhandler
---
const policyhandler = require('../PolicyHandler');
const configreader = require('../config/config_reader');
{{#policies}}
{{#relationEventInfo}}
const {{eventValue.namePascalCase}} = require('../event/{{eventValue.namePascalCase}}');
{{/relationEventInfo}}
{{/policies}}
const objectmapping = require('../util/util')
const kafkaprocessor = require('../kafka');

var config = configreader.reader();

const consumer = kafkaprocessor.kafka.consumer({ groupId: config['group_id'] });

(async ()=>{
    await consumer.subscribe({ topic: config['destination'], fromBeginning: true });
    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            var msg = JSON.parse(message.value.toString())
            {{#policies}}
            if(msg.eventType == {{#relationEventInfo}}'{{eventValue.namePascalCase}}'{{/relationEventInfo}}){
                {{#relationEventInfo}}
                var {{eventValue.nameCamelCase}} = new {{eventValue.namePascalCase}}();
                var event = objectmapping(msg, {{eventValue.nameCamelCase}});
                policyhandler.whenever{{eventValue.namePascalCase}}_{{../namePascalCase}}(event);
                {{/relationEventInfo}}
            }
            {{/policies}}
        },
      })

})();

exports.consumer = consumer;