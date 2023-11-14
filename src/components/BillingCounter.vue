<template>
    <div v-if="usedTime" :style="getTimeStyle">
        <v-menu
                v-model="autoPayMenu"
                close-on-content-click
                :open-on-hover="!isEnterpriseBillingCounter"
                :nudge-width="150"
                offset-y
        >
            <template v-slot:activator="{ on, attrs }">
                <v-row style="margin: auto;">
                    <div v-bind="attrs" v-on="on">
                        {{usedTime}}
                    </div>
                </v-row>
            </template>

            <v-card>
                <v-list>
                    <v-list-item>
                        <div> Remain: {{toolTime ? toolTime.toFixed(2): ''}}</div>
                        <v-btn v-if="showAutoPay && isAvailablePaid && !isEnterpriseBillingCounter"
                               color="primary"
                               style="margin-left: 70px;"
                               @click="autoPayToolTime()"
                        >코인 사용</v-btn>
                    </v-list-item>
                </v-list>
            </v-card>
        </v-menu>
    </div>
</template>

<script>
    // import LabBase from "./labs/LabBase";
    import PaymentBase from "./payment/PaymentBase";
    import LabBase from "./labs/LabStorageBase";

    export default {
        name: "BillingCounter",
        props: {
            labInfo: Object,
            classInfo: Object,
            hashName: String,
            projectName: String,
            propsUserInfo: Object
        },
        mixins: [LabBase, PaymentBase],
        data() {
            return {
                getStartBillingTime: null,
                counter: null,
                interval: null,
                counterInterval: null,
                subscription: null,
                isUsedSubscription: false,
                isInitSubscription: false,
                autoPayMenu: false,
                toolTime: 0,
                idePrice: 1000,
                isEnterpriseBillingCounter : false,
            }
        },
        computed: {
            getTimeStyle() {
                if (this.labInfo) {
                    return 'position: absolute; top:0; margin-top: -10px; right: 5px; color: white;'
                }
                return 'position: absolute; top:0; right: 5px; color: white;'

            },
            usedTime() {
                if (this.getStartBillingTime && !this.isForeign) {
                    // var period = this.counter - this.getStartBillingTime
                    // var usedSecond = period / 1000

                    if(this.isInitSubscription){

                        if(!this.propsUserInfo || this.propsUserInfo.savedToolTime == 0){
                            if (this.subscription) {
                                if (this.subscription.ideTime == 0) {
                                    this.$emit('terminate', true)
                                }
                            } else {
                                this.$emit('terminate', true)
                            }
                        }

                    }


                    // if (this.userInfo.savedToolTime == 0) {
                    //     if (this.subscription) {
                    //         if (this.subscription.ideTime == 0) {
                    //             this.$emit('terminate', true)
                    //         }
                    //     } else {
                    //         this.$emit('terminate', true)
                    //     }
                    // }
                    // var getRemain = this.userInfo.savedToolTime
                    var getRemain = this.propsUserInfo ? this.propsUserInfo.savedToolTime : 0
                    if (this.isUsedSubscription && this.subscription && this.subscription.ideTime != 0) {
                        getRemain = getRemain + this.subscription.ideTime
                    }

                    this.toolTime = getRemain

                    if (getRemain < 1) {
                        return `remain: ${(getRemain).toFixed(2)} (min)`
                        // return `remain: ${(getRemain).toFixed(2)}ㅤelapsed: ${(usedSecond / 60).toFixed(2)} (min)`
                    }
                    return `remain: ${(getRemain).toFixed(0)} (min)`
                    // return `remain: ${(getRemain).toFixed(0)}ㅤelapsed: ${(usedSecond / 60).toFixed(0)} (min)`
                }
                return null
            },
            isAvailablePaid(){
                if(this.propsUserInfo && this.propsUserInfo.savedCoin >= 0 ){
                    if( (this.idePrice / 100) < this.propsUserInfo.savedCoin){
                        return true
                    }
                }
                return false
            },
            showAutoPay() {
                if(this.toolTime < 5){
                    return true
                }
                return false
            },
        },
        watch:{
            "isInitSubscription":function (newVal) {
                if(newVal) {
                    console.log('초기 세팅 완료')
                    this.billing()
                }else{
                    console.log('가져오는중 ..........')
                }
            },
            "showAutoPay":function (newVal,oldVal) {
              var me = this
              if(newVal){
                  if(me.isAvailablePaid){
                       me.autoPayMenu = true
                  }
              }
            },
        },
       async created() {
            // subscription
            var me = this
            this.idePrice = await this.getString(`db://pricing/ide`) // 1000

            me.watch(`db://enrolledUsers/${me.myId.replace(/\./gi, "_")}/purchaseItemSnapshots/subscription`, function (callback) {

                if (callback) {
                    var checkExpired = callback.expiredDate
                    var getIdeTime = callback.ideTime
                    if (typeof checkExpired == 'string') checkExpired = Number(checkExpired)
                    if (typeof getIdeTime == 'string') getIdeTime = Number(getIdeTime)


                    if(getIdeTime > 0){
                        // 사용 0
                        me.subscription = callback
                        me.isUsedSubscription = true
                    }else if(me.subscription.type != 'free_credit' && checkExpired < Date.now() ){
                        // free x, Expired o
                        me.subscription = callback
                        me.isUsedSubscription = true
                    }else{
                        me.subscription = null
                        me.isUsedSubscription = false
                    }

                    // var checkExpired = callback.expiredDate
                    // if (typeof checkExpired == 'string') checkExpired = Number(checkExpired)
                    // if (checkExpired == 0 || Date.now() < checkExpired) {
                    //     me.subscription = callback
                    //     me.isUsedSubscription = true
                    // } else {
                    //     me.subscription = null
                    //     me.isUsedSubscription = false
                    // }
                } else {
                    me.subscription = null
                    me.isUsedSubscription = false
                }

                me.isInitSubscription = true

            })
        },
        methods: {
            async billing(){

                var me = this
                var now = Date.now()
                var path = null


                if (me.labInfo) {
                    // Lab 일 경우
                    if (me.classInfo.connectionKey && !me.classInfo.reuse) {
                        me.isEnterpriseBillingCounter =  true
                        console.log('interval 기업 ', JSON.parse(JSON.stringify(me.interval)))
                        // 기업강의
                        path = `db://inUsePods/${me.hashName}`
                        me.pushString(path, now)

                        me.interval = setInterval(function () {
                            me.setString(path, me.counter)
                        }, 5000)
                    } else {

                        // me.subscription = await me.getObject(`db://enrolledUsers/${me.myId.replace(/\./gi, "_")}/purchaseItemSnapshots/subscription`)
                        if (me.subscription) {
                            /*
                                free 0 만료 0 사용0 - true
                                free x 만료 0 사용0 - true
                                free 0 만료 x 사용0 - true
                                free x 만료 x 사용0 - true

                                free x 만료 0 사용x - true

                                free 0 만료 0 사용x - false
                                free 0 만료 x 사용x - false
                                free x 만료 x 사용x - false
                            */
                            var checkExpired = me.subscription.expiredDate
                            var getIdeTime = me.subscription.ideTime
                            if (typeof checkExpired == 'string') checkExpired = Number(checkExpired)
                            if (typeof getIdeTime == 'string') getIdeTime = Number(getIdeTime)


                            if(getIdeTime > 0){
                                // 사용 0
                                me.isUsedSubscription = true
                            }else if(me.subscription.type != 'free_credit' && checkExpired < Date.now() ){
                                // free x, Expired o
                                me.isUsedSubscription = true
                            }else{
                                me.isUsedSubscription = false
                            }


                        } else {
                            // 기존 회원. 초기 발급
                            me.isUsedSubscription = true
                        }

                        console.log('interval 노기업  ', JSON.parse(JSON.stringify(me.interval)))
                        path = `db://enrolledUsers/${me.myId.replace(/\./gi, "_")}/usage/${me.courseId}@${me.classId}`
                        var itemId = `${me.courseId}@${me.classId}`
                        var getPaymentType = 'ide'

                        if (me.isUsedSubscription) {
                            getPaymentType = 'subscription'
                        }

                        me.putObject(path, {
                            itemId: itemId,
                            // resourceType: 'ide', // ide-4m2c ,'ide-8m4c', 'ide-16m8c'
                            paymentType: getPaymentType,
                            endBillingTime: now,
                            startBillingTime: now,
                            action: 'withdraw',
                            issuedDate: now,
                            hashName: me.hashName,
                            className: me.classInfo.className ? me.classInfo.className : null,
                            labName: me.labInfo.labName ? me.labInfo.labName : null,
                        })
                        // 문제 없음
                        me.interval = setInterval(function () {
                            getPaymentType = 'ide'
                            if (me.isUsedSubscription) {
                                getPaymentType = 'subscription'
                            }
                            me.setString(`${path}/paymentType`, getPaymentType)
                            me.setString(`${path}/endBillingTime`, me.counter)
                            console.log('mounted interval', me.interval)
                        }, 5000)


                    }
                } else if (me.hashName) {
                    // EventStorming IDE 일 경우.

                    // me.subscription = await me.getObject(`db://enrolledUsers/${me.myId.replace(/\./gi, "_")}/purchaseItemSnapshots/subscription`)
                    if (me.subscription) {

                        /*
                           free 0 만료 0 사용0 - true
                           free x 만료 0 사용0 - true
                           free 0 만료 x 사용0 - true
                           free x 만료 x 사용0 - true

                           free x 만료 0 사용x - true

                           free 0 만료 0 사용x - false
                           free 0 만료 x 사용x - false
                           free x 만료 x 사용x - false
                       */

                        var checkExpired = me.subscription.expiredDate
                        var getIdeTime = me.subscription.ideTime
                        if (typeof checkExpired == 'string') checkExpired = Number(checkExpired)
                        if (typeof getIdeTime == 'string') getIdeTime = Number(getIdeTime)


                        if(getIdeTime > 0){
                            // 사용 0
                            me.isUsedSubscription = true
                        }else if(me.subscription.type != 'free_credit' && checkExpired < Date.now() ){
                            // free x, Expired o
                            me.isUsedSubscription = true
                        }else{
                            me.isUsedSubscription = false
                        }

                    } else {
                        // 기존 회원. 초기 발급
                        me.isUsedSubscription = true
                    }

                    path = `db://enrolledUsers/${me.myId.replace(/\./gi, "_")}/usage/${me.hashName}`
                    var itemId = me.hashName
                    var getPaymentType = 'ide'
                    var param = window.location.href.split('?')[1]
                    if (param) {
                        var keyValue = param.split('&')[1]
                        if (keyValue) {
                            itemId = keyValue.split('=')[1]
                        }
                    }

                    if (me.isUsedSubscription) {
                        getPaymentType = 'subscription'
                    }

                    me.putObject(path, {
                        itemId: itemId,
                        // resourceType: 'ide', // ide-4m2c ,'ide-8m4c', 'ide-16m8c'
                        paymentType: getPaymentType,
                        endBillingTime: now,
                        startBillingTime: now,
                        issuedDate: now,
                        action: 'withdraw',
                        hashName: me.hashName
                    })

                    // 문제 없음
                    me.interval = setInterval(function () {
                        getPaymentType = 'ide'
                        if (me.isUsedSubscription) {
                            getPaymentType = 'subscription'
                        }
                        me.setString(`${path}/paymentType`, getPaymentType)
                        if(!me.isForeign){
                            me.setString(`${path}/endBillingTime`, me.counter)
                        }
                    }, 5000)
                }

                if (path) {
                    //카운트
                    var purchaseId = null
                    me.counterInterval = setInterval(async function () {
                        if (!purchaseId) {
                            var getItem = await me.getString(path)
                            purchaseId = getItem.historyId
                            me.getStartBillingTime = await me.getString(`db://enrolledUsers/${me.myId.replace(/\./gi, "_")}/purchaseItemHistory/${purchaseId}/startBillingTime`)
                            if (!me.getStartBillingTime) {
                                me.getStartBillingTime = Date.now()
                            }
                        }
                        me.counter = Date.now()
                    }, 500)

                }

            },
            async autoPayToolTime(){
                var me = this
                if(me.propsUserInfo && me.propsUserInfo.uid && !me.isEnterpriseBillingCounter){
                    var obj = {
                        title: `IDE 2시간 구매`,
                        itemId: 'buy_ide',
                        resourceType: 'ide',
                        amount: 120,
                        relatedTo: me.propsUserInfo.uid
                    }
                    await me.autoPay(obj, false)
                }
            },
        },
        beforeDestroy() {
            var me = this
            console.log('beforeDestroy interval', me.interval)
            if (me.interval)
                clearInterval(me.interval)

            if (me.counterInterval)
                clearInterval(me.counterInterval)

        },
    }

</script>

<style scoped>

</style>