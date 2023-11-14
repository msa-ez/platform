const streamhandler = require('../streamhandler/producer')
class AbstractEvent{
    constructor(){
        let date = new Date;
        this.eventType = this.constructor.name;
        this.timeStamp = date;
    }
    ToJson(){
        return JSON.stringify(this);
    }
    async Publish(){
        var msg = this.ToJson();
        await streamhandler.producer.send({
            topic: 'mall',
            messages: [
              {value: msg}
            ],
        })
    }
}

module.exports = AbstractEvent;