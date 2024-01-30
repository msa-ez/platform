// Strategy pattern.
// Factory Pattern.
// const StorageBaseCloudStorage = require('./StorageBaseCloudStorage');

class StorageBase {
    
    static getStorage(type){
        // Factory Pattern.
        const StorageBaseCloudStorage = require('./StorageBaseCloudStorage');
        const StorageBaseFireStore = require('./StorageBaseFireStore');
        const StorageBaseFireBase = require('./StorageBaseFireBase');
        
        if(type == 'storage'){
            return new StorageBaseCloudStorage();
        } else if(type == 'firestore'){
            return new StorageBaseFireStore();
        } 
        return new StorageBaseFireBase();
    }
   
    // GetCurrentUser
    async getCurrentUser(){
        try {
            let currentUserInfo = await this._currentUser();
            if(!currentUserInfo) return null;

            let providerId =  currentUserInfo.providerData[0].providerId // github.com , google.com
            let uid = currentUserInfo.uid
            let name = currentUserInfo.providerData[0].displayName
            let email = currentUserInfo.providerData[0].email
            let profile = currentUserInfo.photoURL

            let authorized = email && email.includes('@uengine.org') ? 'admin' : 'student'
            let company = localStorage.getItem('loginType') == 'dpg' ? 'DPG' : null  
            name = name ? name : email
            company = 'DPG'

            return {
                uid: uid,
                name: name,
                email: email,
                profile: profile,
                company: company,
                authorized: authorized,
                enrolledUserEmail: email.replace(/\./gi, '_')
            }
        } catch(e) {
            console.log(`GET CurrentUser: ${e}`);
            return {Error: e}
        }
    }
    getString(path) {
        throw new Error('getString() must be implement')
    }
    getObject(path) {
        throw new Error('getObject() must be implement')
    }
    putString(path, value, options) {
        throw new Error('putString() must be implement')
    }
    putObject(path, value, options) {
        throw new Error('putObject() must be implement')
    }
    pushString(path, value, options) {
        throw new Error('pushString() must be implement')
    }
    pushObject(path, value, options) {
        throw new Error('pushObject() must be implement')
    }
    delete(path) {
        throw new Error('delete() must be implement')
    }

}

module.exports = StorageBase;