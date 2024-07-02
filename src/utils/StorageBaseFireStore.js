const StorageBase = require("./StorageBase");
const firebase = require('firebase')
require('firebase/auth')

class StorageBaseFireStore extends StorageBase {

    // GET
    async getString(path){
        try {
            let result = await this._get(path);
            
            if(!result) return null;
            if(result.Error) return snapshot;
            if(result.exists()){
                let value = result.data();
                if(typeof value == 'object') return JSON.stringify(value);
                return value;
            }
            return null;
        } catch(e){
            console.log(`FireStore] GET STRING: ${e}`);
            return {Error: e}
        }
    }
    async getObject(path){
        try {
            let result = await this._get(path);
            
            if(!result) return null;
            if(result.Error) return result;
            if(result.exists()){
                let value = result.data();
                if(typeof value == 'string') return JSON.parse(value);
                return value;
            }
            return null;
        } catch(e){
            console.log(`FireStore] GET OBJECT: ${e}`);
            return {Error: e}
        }
    }

    // SET
    async setString(path, value, options){
        try {
            // only object. not 
            if( typeof value == 'string') {
                // A field value is required.
                return {Error: 'Field values ​​are essentially required according to the Firestore schema structure.'};
            }

            let result = await this._set(path, value);
            
            if(!result) return false;
            if(result.Error) return result;

            return true;
        } catch(e) {
            console.log(`FireStore] SET STRING: ${e}`);
            return {Error: e}
        }
    }
    async setObject(path, value, options){
        try {
            if( typeof value == 'string') value = JSON.parse(value);

            let result = await this._set(path, value);
            
            if(!result) return false;
            if(result.Error) return result;

            return true;
        } catch(e) {
            console.log(`FireStore] SET OBJECT: ${e}`);
            return {Error : e};
        }
    }

     // PUT
    async putString(path, value, options){
        try {
            let result = null;
            let snapshot = await this._get(path);
            if (snapshot.exists) {
                result = await this._put(path, value);
            } else {
                result = await this._set(path, value);
            }
        
            if(!result) return false;
            if(result.Error) return result;

            return true;
        } catch(e) {
            console.log(`FireStore] PUT STRING: ${e}`);
            return {Error: e}
        }
    }
    async putObject(path, value, options){
        try {
            let result = null;
            if( typeof value == 'string') value = JSON.parse(value);

            let snapshot = await this._get(path);
            if (snapshot.exists) {
                result = await this._put(path, value);
            } else {
                result = await this._set(path, value);
            }
            
            if(!result) return false;
            if(result.Error) return result;

            return true;
        } catch(e) {
            console.log(`FireStore] PUT OBJECT: ${e}`);
            return {Error : e};
        }
    }

    // PUSH
    async pushString(path, value, options){
        try {
            if( typeof value == 'object') value = JSON.stringify(value);
            let result = await this._push(path, value);

            if(!result) return null;
            if(result.Error) return result;


            return result.id
        } catch(e) {
            console.log(`FireStore] PUSH STRING: ${e}`);
            return {Error: e}
        }
    }
    async pushObject(path, value, options){
        try {
            if( typeof value == 'string') value = JSON.parse(value);
            let result = await this._push(path, value);

            if(!result) return null;
            if(result.Error) return result;

            return result.id
        } catch(e) {
            console.log(`FireStore] PUSH OBJECT: ${e}`);
            return {Error: e}
        }
    }

    // DELETE
    async delete(path){
        try {
            let callback = await this._delete(path);

            if(!callback) return false;
            if(callback.Error) return callback;

            return true;
        } catch(e) {
            console.log(`FireStore] DELETE: ${e}`);
            return {Error : e};
        }
    }

    async list(path, options){
        try {
            if(!options) options = {}
            let result = await this._list(path, options);
            if(!result) return null;
            if(result.Error) return result;
            if(options.snapshot) return result;
            
            return result.docs.map((doc) => ({
                key: doc.id,
                value: doc.data(),
              }));
        } catch(e) {
            return {Error : e};
        }
    }

    //////////////////////////////////////////////////////////////////////////////////////
    async _currentUser(){
        return await firebase.auth().currentUser
    }
    
    async _get(path) {
        try {
            return await firebase.firestore().doc(path).get()
        } catch (e) {
            return {Error: e}
        }
    }
 
    async _set(path, value) {
        try{
            return await firebase.firestore().doc(path).set(value)
        }catch(error){
            return {Error: error}
        }
    }

    async _put(path, value) {
        try{
            return await firebase.firestore().doc(path).update(value)
        }catch(error){
            return {Error: error}
        }
    }

    async _push(path, value) {
        try {
            return await firebase.firestore().collection(path).add(value)    
        } catch(e) {
            return {Error: e}
        }
    }

    async _delete(path) {
        try{
            return await firebase.firestore().doc(path).delete()
        }catch(e){
            return {Error: e}
        }
    }

    async _list(path, metadata){
        
        /* metadata: { 
                sort: "desc", // default "asc"
                orderBy: 'when',
                size: 10,
                startAt: orderBy key contains values
                endAt: orderBy key contains values
                startAfter:  orderBy key then value
                endBefore: orderBy key then value
                snapshot: true // return snapshot
            }
        */
        try {
            let refs = firebase.firestore().collection(path)

            // Setting Sort
            if(metadata.orderBy) {
                // Default Sort: 'asc'
                let sort = metadata.sort && metadata.sort == 'desc' ? 'desc' : 'asc' 
                refs = refs.orderBy(metadata.orderBy, sort)
            }

            // Setting Size
            if(metadata.size) refs = refs.limit(metadata.size)
            
            // Setting Range      
            // more than && less than
            if (metadata.startAt && !metadata.endAt && !metadata.endBefore) {
                refs = refs.startAt(metadata.startAt)
            } else if (metadata.startAt && metadata.endAt) {
                if(metadata.startAt == metadata.endAt) {
                    refs = refs.where(metadata.orderBy, '==', metadata.startAt)
                } else {
                    refs = refs.where(metadata.orderBy, '>=', metadata.startAt).where(metadata.orderBy, '<=', metadata.endAt)
                }
            } else if (metadata.endAt && !metadata.startAt && !metadata.startAfter) {
                refs = refs.endAt(metadata.endAt)
            } else if (metadata.startAfter && !metadata.endBefore && !metadata.endAt) {
                refs = refs.startAfter(metadata.startAfter)
            } else if (metadata.startAfter && metadata.endBefore) {
                if(metadata.startAfter == metadata.endBefore) {
                    refs = refs.where(metadata.orderBy, '==', metadata.startAfter)
                } else {
                    refs = refs.where(metadata.orderBy, '>', metadata.startAfter).where(metadata.orderBy, '<', metadata.endBefore)
                }
            } else if (metadata.endBefore && !metadata.startAfter && !metadata.startAt) {
                refs = refs.endBefore(metadata.endBefore)
            } else if (metadata.startAt && metadata.endBefore && !metadata.endAt) {
                refs = refs.where(metadata.orderBy, '>=', metadata.startAt).where(metadata.orderBy, '<', metadata.endBefore)
            } else if (metadata.startAfter && metadata.endAt && !metadata.startAt) {
                refs = refs.where(metadata.orderBy, '>', metadata.startAfter).where(metadata.orderBy, '<', metadata.endAt)
            } 

            return await refs.get()
        } catch (e) {
            return {Error: e}
        }
     
    }
}

module.exports = StorageBaseFireStore;