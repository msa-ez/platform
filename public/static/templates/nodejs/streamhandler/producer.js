const kafkaprocessor = require('../kafka');
const producer = kafkaprocessor.kafka.producer();

(async () => {
    try {
        await producer.connect();
        console.log('Kafka Connection has been established successfully.');
    } catch (error) {
    console.error('Unable to connect to the Kafka channel:', error);
    }
})();
    
exports.producer = producer;