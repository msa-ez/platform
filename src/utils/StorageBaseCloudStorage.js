const StorageBase = require("./StorageBase");

const firebase = require('firebase')
require('firebase/auth')

class StorageBaseCloudStorage extends StorageBase {

    // GET
    async getString(path){
        try {
            if (path.startsWith('https://') || path.startsWith('gs://')) {
                return await me._fetch(path);
            }
            let result = await this._get(path);

            if(!result) return null;
            if(result.Error) return result;
            let value = await this._fetch(result)

            return (typeof value == 'object') ? JSON.stringify(value) : value
        } catch(e){
            console.log(`GET STRING: ${e}`);
            return {Error: e};
        }
    }
    async getObject(path){
        try {
            if (path.startsWith('https://') || path.startsWith('gs://')) {
                return await this._fetch(path);
            }
            let result = await this._get(path);

            if(!result) return null;
            if(result.Error) return result;
            let value = await this._fetch(result)

            return (typeof value == 'string') ? JSON.parse(value) : value
        } catch(e){
            console.log(`GET OBJECT: ${e}`);
            return {Error: e};
        }
    }

    // PUT
    async putString(path, value, options){
        try {
            if(typeof value == 'object') value = JSON.stringify(value);
        
            if(!options) options = {}
            if(!options.format) options.format = 'raw'
            if(!options.metadata) options.metadata = {contentType: 'text/plain'}
           
            let result = await this._put(path, value, options);
            if(!result) return false;
            if(result.Error) return result;

            return true;
        } catch(e) {
            console.log(`PUT STRING: ${e}`);
            return {Error: e};
        }
    }
    async putObject(path, value, options){
        try {
            if(typeof value == 'object') value = JSON.stringify(value);
        
            if(!options) options = {}
            if(!options.format) options.format = 'raw'
            if(!options.metadata) options.metadata = {contentType: 'text/plain'}
           
            let result = await this._put(path, value, options);
            if(!result) return false;
            if(result.Error) return result;

            return true;
        } catch(e) {
            console.log(`PUT OBJECT: ${e}`);
            return {Error: e};
        }
    }
    
    // PUSH
    async pushString(path, value, options){
        try {
            const uniqueKey = Date.now().toString() + Math.random().toString(36).substring(2);

            if(typeof value == 'object') value = JSON.stringify(value);
        
            if(!options) options = {}
            if(!options.format) options.format = 'raw'
            if(!options.metadata) options.metadata = {contentType: 'text/plain'}
           
            let result = await this._push(`${path}/${uniqueKey}`, value, options)
            if(!result) return null;
            if(result.Error) return result;
            
            return result.ref.location.path_.split('/').pop()
        } catch(e) {
            console.log(`PUSH STRING: ${e}`);
            return {Error: e};
        }
    }
    async pushObject(path, value, options){
        try {
            const uniqueKey = Date.now().toString() + Math.random().toString(36).substring(2);

            if(typeof value == 'object') value = JSON.stringify(value);

            if(!options) options = {}
            if(!options.format) options.format = 'raw'
            if(!options.metadata) options.metadata = {contentType: 'text/plain'}

            let result = await this._push(`${path}/${uniqueKey}`, value, options)
            if(!result) return null;
            if(result.Error) return result;

            return result.ref.location.path_.split('/').pop()
        } catch(e) {
            console.log(`PUSH OBJECT: ${e}`);
            return {Error: e};
        }
    }
  
    // DELETE
    //  ...

    //////////////////////////////////////////////////////////////////////////////////////
    async _currentUser(){
        return await firebase.auth().currentUser
    }

    async _get(path) {
        try{
            return await firebase.storage().ref(path).getDownloadURL()
        } catch(error) {
            return {Error: error}
        }
    }

    async _put(path, value, options) {
        try{
            return await firebase.storage().ref(path).putString(value, options.format, options.metadata)
        } catch(error) {
            return {Error: error}
        }
    }

    async _push(path, value, options) {
        try{
            return await firebase.storage().ref(path).putString(value, options.format, options.metadata)
        } catch(error) {
            return {Error: error}
        }
    }
    
    async _fetch(url){
        let response = await fetch(url)

        var contentType = response.headers.get('Content-Type');
        // Handle the response headers
        if (contentType.includes('application/json')) {
            // Handle JSON response
            return response.json()
        } else if (contentType.includes('text/plain')) {
            // Handle plain text response
            return response.text()
        } else if(contentType.includes('image/')) {
            return url
        } else if (contentType.includes('text/html') || contentType.includes('text/markdown') ) {
            return response.text()
        } else {
            // Handle other content types or throw an error
            return {Error: `Unsupported content type: ${contentType}`}
        }
    }
}

module.exports = StorageBaseCloudStorage;