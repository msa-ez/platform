const StorageBase = require("./StorageBase");
const SECOND = 1000;
const MINUT = 60 * SECOND;
const HOUR = 60 * MINUT;
const DAY = 24 * HOUR;
const MONTH = 30.5 * DAY;
const YEAR = 365 * DAY;

class Usage {
  constructor(options) {
    if (!options) options = {};
    // this.reference = options.storage ? options.storage : 'storage'
    // this.storage = new storageBase(this.reference);
    this.storage = StorageBase.getStorage('firestore')
    this.db = StorageBase.getStorage('firebase')
    
    // ITEM
    this.serviceType = options.serviceType;
    this.metadata = options.metadata;
    this.usageDetail = options.usageDetail;

    this.issuedTimeStamp = options.issuedTimeStamp ? options.issuedTimeStamp : null
    this.expiredTimeStamp = options.expiredTimeStamp ? options.expiredTimeStamp : null 
  }

  async use() {
    var me = this;
    try{
        let userInfo = await this.storage.getCurrentUser();
        if(!me.serviceType) return false;
        if(!userInfo || !userInfo.email) {
            alert("There is no login information. Please log in again.");
            return false;
        }

        // Already Usage(ONCE) 
        if(await me.check()) return true;
        
        let result = await this.storage.pushObject(`/usages/queue/${this.convertTimestampToYearMonth()}`, {
            usageDetail: me.usageDetail ? JSON.stringify(me.usageDetail) : null,
            serviceType: me.serviceType,
            issuedTimeStamp: me.issuedTimeStamp,
            expiredTimeStamp: me.expiredTimeStamp,
            userUid: userInfo.uid,
            userName: userInfo.name,
            userEmail: userInfo.email,
            userRegion: userInfo.region,
            tenant: userInfo.tenant,
            metadata: me.metadata ? me.metadata : null
        })
        if(!result) return false;
        if(result.Error) {
          alert(result.Error);
          return false;
        }
        return true;
    } catch(e) {
        alert("An error occurred while using the function. Please try again or contact the administrator (help@uengine.org).");
        return false;
    }
  }

  async check(){
    var me = this
    try{

      let userInfo = await this.storage.getCurrentUser();
      if(!me.serviceType) return false;
      if(!userInfo || !userInfo.email) {
          alert("There is no login information. Please log in again.");
          return false;
      }

      // Already Usage(ONCE) 
      let snapshot = await this.db.getObject(`/enrolledUsers/${userInfo.enrolledUserEmail}/purchaseItemSnapshots/${me.serviceType}`);
      if(snapshot) return true;

      return false
    } catch(e) {
        alert("An error occurred while using the function. Please try again or contact the administrator (help@uengine.org).");
        return false;
    }
  }

  convertTimestampToYearMonth(timestamp){
    if(!timestamp) timestamp = Date.now()
    const date = new Date(timestamp);

    const year = date.getFullYear();
    const month = date.getMonth() + 1; 
    const day = date.getDate();

    // 날짜를 문자열로 변환 (YYYYMM 형식)
    return `${year}${month.toString().padStart(2, '0')}`;
  }
    
}

module.exports = Usage;
