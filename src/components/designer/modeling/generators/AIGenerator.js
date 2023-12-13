const StorageBase = require('../../../CommonStorageBase.vue').default;

class AIGenerator {
    constructor(client, options){
        this.client = client;
        this.finish_reason = null;
        this.modelJson = null;
        this.savedModel = null;
        this.stopSignaled = false;
        this.gptResponseId = null;
        this.openaiToken = null
        this.model = this.client && this.client.model ? this.client.model:"gpt-3.5-turbo-16k"
        this.responseLimit = this.model == 'gpt-4' ? 5:15

        if(options){
            this.preferredLanguage = options.preferredLanguage;
            this.previousMessages = options.previousMessages;
            this.prompt = options.prompt;
            this.model = options.model || this.model;
        } 

        if(!this.previousMessages)
            this.previousMessages = [];

        
        if(!this.preferredLanguage){
            this.preferredLanguage="English"
        }
    }
    
    setPreferredLanguage(){
        if(window && window.countryCode == 'ko'){
            return "Korean"
        }else{
            return "English"
        }
    }

    createPrompt(){
        return this.prompt ? this.prompt : "say hello in Korean.";
    }

    stop(){
        this.stopSignaled = true;
    }

    getToken() {
        var me = this
        return new Promise(async function (resolve, reject) {
            if (me.client) {
                const storage = new Vue(StorageBase)
                await storage.getString(`db://tokens/openai`)
                .then((token) => {
                    resolve(atob(token))
                })
                .catch(e => {
                    reject(e)
                })
            }
        })
    }

    async generate(){
        this.state = 'running'
        let me = this;
        me.openaiToken = await me.getToken();
        let responseCnt = 0;
        
        me.gptResponseId = null;
        const url = "https://api.openai.com/v1/chat/completions";
        const xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Authorization", "Bearer " + me.openaiToken);

        xhr.onprogress = function(event) {
            var currentResId
            if(me.stopSignaled){
                xhr.abort();
                me.stopSignaled = false;
                me.state = 'stopped'
            }
        // console.log("Received " + event.loaded + " bytes of data.");
        // console.log("Data: " + xhr.responseText);
            const newUpdates = xhr.responseText
            .replace("data: [DONE]", "")
            .trim()
            .split('data: ')
            .filter(Boolean)

            const newUpdatesParsed = newUpdates.map((update) => {
                const parsed = JSON.parse(update);

                if(parsed.error){
                    if(me.client.onError){
                        me.client.onError(parsed.error);
                    }
                    throw new Error(parsed.error.message)
                }

                currentResId = parsed.id
                if(!me.gptResponseId){
                    me.gptResponseId = parsed.id
                } 
                if(parsed.choices[0].finish_reason == 'length'){
                    me.finish_reason = 'length'
                }
                return parsed.choices[0].delta.content || '';
            });

            const newUpdatesJoined = newUpdatesParsed.join('')
            if(newUpdatesJoined.includes(": null")){
                newUpdatesJoined.replaceAll(": null", ": 'null'")
            }
            me.modelJson = newUpdatesJoined

            if(me.client.onReceived){
                if(me.gptResponseId == currentResId){
                    me.client.onReceived(me.modelJson);
                }
            }

            if(me.client.onModelCreated){
                if(responseCnt > me.responseLimit){
                    let createdModel = me.createModel(me.modelJson)
                    if(createdModel){
                        me.savedModel = createdModel
                        me.client.onModelCreated(createdModel);
                        responseCnt = 0;
                    } else {
                        me.stop();
                        if(me.client.onGenerationFinished) me.client.onGenerationFinished(me.savedModel)
                    }
                } else {
                    responseCnt++;
                }
            }


        };

        xhr.onloadend = function() {
            console.log("End to Success - onloadend", xhr);
            if(me.client){
                if(me.finish_reason == 'length'){
                    console.log('max_token issue')
                    alert('max_token issue')
                } 
                // else {

                    me.state = 'end';
                    let model = null;
                    if(me.client.onModelCreated){
                        model = me.createModel(me.modelJson)
                        me.client.onModelCreated(model);
                    } 
                    // else {
                    if(me.client.onGenerationFinished)
                        me.client.onGenerationFinished(model)
                    // }
                    // if (xhr.status === 0){
                        //     me.client.onGenerationFinished()
                        // } else {
                    // }
                // }
            }
        };
        
        let messages
        messages = this.createMessages();

        
        const data = JSON.stringify({
            model: this.model,
            messages: messages,
            temperature: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
            stream: true,
        });

        xhr.send(data);

    }

    createMessages(){
        var me = this 
        var content
        me.previousMessages = []
        this.preferredLanguage = me.setPreferredLanguage();
        this.originalLanguage = this.preferredLanguage.toLowerCase();
        if(this.client.generatorName == 'ESGenerator' || this.client.generatorName == 'EventOnlyESGenerator'){
            content = me.createPrompt() + "\n please generate in English"
        } else {
            content = me.createPrompt() + (me.preferredLanguage ? "\n please generate in " + me.preferredLanguage : '')
        }
        if(me.client.openAiMessageList){
            me.client.openAiMessageList.push({
                role: 'user',
                content: content
            })
            me.previousMessages = me.client.openAiMessageList;
        } else {
            me.previousMessages.push({
                role: 'user',
                content: content
            })
        }
        // console.log(me.previousMessages)
        
        return me.previousMessages;
    }

    createModel(text){
        return text;
    }


}


module.exports = AIGenerator;