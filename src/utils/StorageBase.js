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
        let region = "KR" // default: KR

        try{
            const ipResponse = await fetch('https://ipinfo.io/json');
            const ipInfo = await ipResponse.json();
            region = ipInfo.country
        } catch(e) {
            let userRegion = (navigator.languages && navigator.languages.length > 0) ? navigator.languages[0] : navigator.language;
            region = userRegion.includes('-') ? userRegion.split('-')[1] : userRegion
        }

        try {
            let currentUserInfo = await this._currentUser();
            if(!currentUserInfo) return null;
            
            const uid        = currentUserInfo.uid //db uid.
            const providerId = currentUserInfo.providerData[0].providerId // github.com , google.com
            const providerUid = currentUserInfo.providerData[0].uid // provider uid.
            const email      = currentUserInfo.providerData[0].email // xxx@xxx.xx
            const name       = currentUserInfo.providerData[0].displayName // hongil
            const profile    = currentUserInfo.photoURL // https://ddd.png
            const authorized = email && email.includes('@uengine.org') ? 'admin' : 'student'
            const tenant     = localStorage.getItem('loginType') == 'dpg' ? 'DPG' : null  
            
            return {
                uid: uid,
                providerUid: providerUid,
                name: name ? name : email,
                email: email,
                profile: profile,
                region: region,
                tenant: tenant,
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