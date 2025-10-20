const StorageBase = require('../../../../../components/CommonStorageBase.vue').default;

class FirebaseUtil {
    static async getCurrentUserJWT() {
        const storage = new Vue(StorageBase);
        return await storage.getFirebaseIdToken();
    }
}

module.exports = FirebaseUtil;