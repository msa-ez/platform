const StorageBase = require("./StorageBase");
const firebase = require('firebase')
require('firebase/auth')

// 전반적인 테스트 필요...
class StorageBaseFireBase extends StorageBase{

    // GET
    async getString(path){
        try {
            let snapshot = await this._get(path);

            if(!snapshot) return null;
            if(snapshot.Error) return snapshot;
            if(snapshot.exists()){
                let value = snapshot.val();
                if(typeof value == 'object') return JSON.stringify(value);
                return value;
            }
            return null;
        } catch(e){
            console.log(`GET STRING: ${e}`);
            return {Error: e}
        }
    }
    async getObject(path){
        try {
            let snapshot = await this._get(path);

            if(!snapshot) return null;
            if(snapshot.Error) return snapshot;
            if(snapshot.exists()){
                let value = snapshot.val();
                if(typeof value == 'string') return JSON.parse(value);
                return value;
            }
            return null;
        } catch(e){
            console.log(`GET OBJECT: ${e}`);
            return {Error: e}
        }
    }
    // PUT
    async putString(path, value, options){
        try {
            if( typeof value == 'object') value = JSON.stringify(value);

            let result = await this._put(path, value);

            if(!result) return false;
            if(result.Error) return result

            return true;
        } catch(e) {
            console.log(`PUT STRING: ${e}`);
            return {Error: e}
        }
    }
    async putObject(path, value, options){
        try {
            if( typeof value == 'string') value = JSON.parse(value);

            let result = await this._put(path, value);
            if(!result) return false;
            if(result.Error) return result

            return true;
        } catch(e) {
            console.log(`PUT OBJECT: ${e}`);
            return {Error: e}
        }
    }

    // PUSH
    async pushString(path, value, options){
        try {
            if( typeof value == 'object') value = JSON.stringify(value);
            let result = await this._push(path, value);
            if(!result) return null;

            return result.key
        } catch(e) {
            console.log(`PUSH STRING: ${e}`);
            return {Error: e}
        }
    }
    async pushObject(path, value, options){
        try {
            if( typeof value == 'string') value = JSON.parse(value);
            let result = await this._push(path, value);
            if(!result) return null;

            return result.key
        } catch(e) {
            console.log(`PUSH OBJECT: ${e}`);
            return {Error: e}
        }
    }

    // DELETE
    async delete(path){
        try {
            let result = await this._delete(path);

            if(!result) return false;
            if(result.Error) return result;

            return true;
        } catch(e) {
            console.log(`DELETE: ${e}`);
            return {Error: e}
        }
    }

    async list(path, options){
        try {
            if(!options) options = {}
            let result = await this._list(path, options);
            if(!result) return null;
            if(result.Error) return result;
            if(options.snapshot) return result;
            
            return result.map((doc) => ({
                    key: doc.key,
                    value: doc.val(),
                }));
        } catch(e) {
            return {Error : e};
        }
    }

    //////////////////////////////////////////////////////////////////////////////////////
    _currentUser(){
        return new Promise(function (resolve, reject) {
            firebase.auth().onAuthStateChanged((user) => {
                if (user) {
                    resolve(user);
                } else {
                    resolve(null);
                }
            });
        })
    }
    
    async _get(path) {
        try{
            return await firebase.database().ref(path).once('value')
        }catch(error){
            return {Error: error}
        }
    }
    
    async _put(path, value) {
        try{
            return await firebase.database().ref(path).update(value)
        }catch(error){
            return {Error: error}
        }
    }

    async _push(path, value) {
        try{
            return await firebase.database().ref(path).push(value)
        }catch(error){
            return {Error: error}
        }
    }


    async _delete(path) {
        try{
            return await firebase.database().ref(path).remove()
        }catch(error){
            return {Error: error}
        }
    }

    async _set(path, value) {
        try {
            return await firebase.database().ref(path).set(value)
        } catch(error) {
            return {Error: error}
        }
    }

    async _list(path, metadata) {
        var me = this
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
            let reference = await firebase.database().ref(path);

            if (metadata.orderBy) {
                reference = reference.orderByChild(metadata.orderBy)
            } else {
                reference = reference.orderByKey()
            }


            if (metadata.startAt && !metadata.endAt && !metadata.endBefore) {
                refs = refs.startAt(metadata.startAt)
            } else if (metadata.startAt && metadata.endAt) {
                if(metadata.startAt == metadata.endAt) {
                    refs = refs.equalTo(metadata.startAt)
                } else {
                    refs = refs.startAt(metadata.startAt).endAt(metadata.endAt)
                }
            } else if (metadata.endAt && !metadata.startAt && !metadata.startAfter) {
                refs = refs.endAt(metadata.endAt)
            } else if (metadata.startAfter && !metadata.endBefore && !metadata.endAt) {
                refs = refs.startAfter(metadata.startAfter)
            } else if (metadata.startAfter && metadata.endBefore) {
                if(metadata.startAfter == metadata.endBefore) {
                    refs = refs.equalTo(metadata.startAfter)
                } else {
                    refs = refs.startAfter(metadata.startAfter).endBefore(metadata.endBefore)
                }
            } else if (metadata.endBefore && !metadata.startAfter && !metadata.startAt) {
                refs = refs.endBefore(metadata.endBefore)
            } else if (metadata.startAt && metadata.endBefore && !metadata.endAt) {
                refs = refs.startAt(metadata.startAt).endBefore(metadata.endBefore)
            } else if (metadata.startAfter && metadata.endAt && !metadata.startAt) {
                refs = refs.startAfter(metadata.startAfter).endAt(metadata.endAt)
            } 

            if (metadata.size) {
                if (metadata.sort && metadata.sort.includes('desc')) {
                    reference = reference.limitToLast(metadata.size)
                } else {
                    reference = reference.limitToFirst(metadata.size)
                }
            }

            return await reference.once('value')
        } catch (error) {
            return {Error: error}
        }
    }

    _watch_off(path){
        return firebase.database().ref(path).off();
    }

    _watch(path, callback) {
        try {
            firebase.database().ref(path).on('value', function (snapshot) {
                if (snapshot && snapshot.exists()) {
                    callback(snapshot.val())
                }else{
                    callback(null)
                }
            },function (err) {
                callback({Error: err})
            });
        } catch (e) {
            console.log('Error] Firebase _watch: ', e)
            callback({Error: e})
        }

    }

    _watch_added(path, metadata, callback) {
        try {

            var me = this
            var reference = firebase.database().ref(path);

            if( metadata ){
                // SORT
                if (metadata.orderBy && metadata.orderBy.toLowerCase() != 'key') {
                    reference = reference.orderByChild(metadata.orderBy)
                } else {
                    reference = reference.orderByKey()
                }

                // RANGE
                if (me.isEqualTo(metadata.startAt, metadata.endAt)){
                    reference = reference.equalTo(metadata.startAt)
                } else if( metadata.startAt && !metadata.endAt ){
                    // Start ~
                    reference = reference.startAt(metadata.startAt)
                } else if( !metadata.startAt && metadata.endAt ){
                    // ~ END
                    reference = reference.endAt(metadata.endAt)
                } else if( metadata.startAt && metadata.endAt ){
                    // Start ~ END
                    reference = reference.startAt(metadata.startAt)
                    reference = reference.endAt(metadata.endAt)
                }
            }


            reference.on('child_added', function (snapshot) {
                if (snapshot && snapshot.exists()) {
                    var queue = snapshot.val()
                    if (typeof queue == 'boolean') {
                        var obj = {
                            key: queue.key,
                            value: queue
                        }
                        callback(obj)
                    } else if(typeof queue == 'string'){
                        var obj = {
                            key: snapshot.key,
                            value: queue
                        }
                        callback(obj)
                    } else {
                        queue.key = snapshot.key
                        callback(queue)
                    }
                } else {
                    callback(null)
                }
            },function (err) {
                callback({Error: err})
            });
        } catch (e) {
            console.log('Error] Firebase _watch_added: ', e)
            callback({Error: e})
        }
    }

    _watch_changed(path, callback) {
        firebase.database().ref(path).on('child_changed', (snapshot) => {
            if (snapshot.exists()) {
                callback(snapshot.val(), snapshot.key)
            }
        },function (err) {
            callback({Error: err})
        });
    }

    forwardChildren(snapshot) {
        var children = [];
        snapshot.forEach(function (child) {
            if(child.key != "count"){
                var val = child.val()
                val.key = child.key
                children.push(val);
            }
        });
        return children;
    }

    reversedChildren(snapshot) {
        var children = [];
        snapshot.forEach(function (child) {
            if(child.key != "count"){
                var val = child.val()
                val.key = child.key
                children.unshift(val);
            }
        });
        return children;
    }

    isEqualTo(a, b){
        try{
            if(a && b){
                return String(a).toLowerCase() == String(b).toLowerCase()
            }
            return false
        }catch (e) {
            return false
        }
    }
}

module.exports = StorageBaseFireBase;