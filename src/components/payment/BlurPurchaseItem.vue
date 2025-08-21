<template>
    <v-dialog
            v-model="blurDialog"
            style="z-index: 999"
            persistent
            width="400"
    >
        <template v-slot:activator="{ on, attrs }">
            <!-- free or paid-->
            <div v-if="isPaid" v-on="attrs" style="height: 100%;">
                <slot></slot>
            </div>

            <!-- not paid-->
            <div v-else v-on="attrs" @click="openBlurDialog(true)">
                <v-progress-linear
                        v-if="checking || paying"
                        indeterminate
                        color="green"
                ></v-progress-linear>

                <div class="text-blur" :style="blurStyleByOpenRange">
                    <v-row dense justify="end" style="position: absolute; top: 5px;right: 5px; z-index: 999;">
                        <v-icon small color="white">fas fa-lock</v-icon>
                    </v-row>
                    <slot></slot>
                </div>
            </div>

        </template>

        <div>
            <purchase-item-template
                    :title="getItemTitle"
                    :itemAmount="getItemAmount"
                    :itemPeriod="getItemPeriod"
                    :userInfo="userInfo"
                    :resourceType="getItemResourceType"
                    :item-class-name="getClassName"
                    :item-lab-name="getLabName"
                    :paying="paying"
                    @close="closeBlurDialog()"
                    @submit="submit"
            ></purchase-item-template>
        </div>

    </v-dialog>
</template>

<script>
    import purchaseItem from "../payment/PurchaseItem";
    import PurchaseItemTemplate from "./PurchaseItemTemplate";

    export default {
        name: 'blur-purchase-item',
        mixins: [purchaseItem],
        components: {
            'purchase-item-template' : PurchaseItemTemplate
        },
        props: {
            itemPeriod: {
                type: Number,
                default: function () {
                    return 90
                }
            },
            itemRelatedTo: {
                type: String,
                default: function () {
                    return null
                }
            },
            itemOpenRange: {
                type: Number,
                default: function () {
                    return 30;
                }
            },
            openDelayTimer: {
                type: Number,
                default: function () {
                    return -1;
                }
            },
            thumbnailImg: {
                type: String,
                default: function () {
                    return null;
                }
            },
            thumbnailText: {
                type: String,
                default: function () {
                    return null
                }
            },
            showLoginDialog:{
                type: Boolean,
                default: function () {
                    return true
                }
            }

        },
        data() {
            return {
                blurDialog: false,
                paying: false,
                checking: false,
                subscription: null,
            }
        },
        watch: {},
        computed: {
            getItemTitle() {
                if (this.getItemResourceType == 'class') {
                    return `강의: ${this.getClassName}`
                } else if (this.getItemResourceType == 'lab') {
                    return `랩: ${this.getLabName}`
                } else if (this.getItemResourceType == 'downloadCode') {
                    return '소스코드 다운'
                } else if(this.getItemResourceType){
                   return `부가자료`
                }
                return null
            },
            blurStyleByOpenRange() {
                var me = this
                if (me.getItemOpenRange == 100) {
                    return null
                }
                return {
                    // 'filter': 'blur(3px)',
                    'height': '100%',
                    '-webkit-mask-image': `linear-gradient(to top,hsla(360,100%,100%,0.0)${100 - me.getItemOpenRange}% , hsla(120,100%,100%,1.0))`,
                }
            },
            getItemOpenRange() {
                return this.itemOpenRange
            },
            getItemPeriod() {
                if (this.itemPeriod > 90) {
                    return 90
                }
                return this.itemPeriod
            },
            getItemRelatedTo() {
                if (this.itemRelatedTo) {
                    return this.itemRelatedTo
                }
                return null
            },
            getNowTimeStamp() {
                return Date.now()
            },
            getExpiredTimeStamp() {
                return this.getNowTimeStamp + (this.getItemPeriod * 24 * 60 * 60 * 1000)
            },
            getThumbnailImg() {
                var me = this
                if (me.thumbnailImg) {
                    if (me.thumbnailImg.includes('//youtu.be')) {
                        var getKey = me.thumbnailImg.split('/')[me.thumbnailImg.split('/').length - 1]
                        return `${me.getProtocol()}//img.youtube.com/vi/${getKey}/hqdefault.jpg`
                    } else {
                        return me.thumbnailImg
                    }
                } else {
                    return null
                }
            },
            getThumbnailText() {
                return this.thumbnailText
            },
            getOpenDelayTimer() {
                var me = this
                // -1 = 클릭
                // 0 = 즉시
                // 0 > 밀리세컨 후
                if (typeof me.openDelayTimer == 'string') me.openDelayTimer = Number(me.openDelayTimer)
                var timer = me.openDelayTimer
                return timer
            },

        },
        async created() {
            this.checking = true
            var callback = await this.paidBlurPurchaseItem()
            if (!callback)
                this.watchBlurPurchaseItem()
        },
        methods: {
            async watchBlurPurchaseItem() {
                var me = this
                var getFindId = me.getItemId

                if (!me.isLogin)
                    await me.setUserInfo()


                if (me.getItemAmount) {
                    if (me.isLogin && me.userInfo.email) {
                        var convertEmail = me.userInfo.email.replace(/\./gi, '_')
                        var clazzPathId = null
                        var labPathId = null

                        if (me.getItemResourceType == 'lab' || me.getItemResourceType == 'class') {
                            var courseId = me.getItemId.split('@')[0] ? me.getItemId.split('@')[0] : null
                            var classId = me.getItemId.split('@')[2] ? me.getItemId.split('@')[2] : null
                            var labId = me.getItemId.split('@')[3] ? me.getItemId.split('@')[3] : null

                            clazzPathId = `${courseId}@${classId}`
                            if (labId) {
                                labPathId = `${courseId}@${classId}@${labId}`
                            }
                        }

                        me.watch(`db://enrolledUsers/${convertEmail}/purchaseItemSnapshots/subscription`, function (callback) {
                                if (callback) {
                                    var checkExpired = callback.expiredDate

                                    if ((checkExpired || checkExpired >= 0) && me.getNowTimeStamp < checkExpired) {
                                        me.subscription = callback
                                        me.$emit('subscription', callback)

                                        if (me.getItemResourceType == 'lab') {
                                            if (me.subscription.labs && me.subscription.labs[labPathId]) {
                                                me.paid = true
                                                me.checking = false
                                                me.$emit('paid', true)
                                                return true
                                            } else {
                                                me.paid = false
                                                me.$emit('paid', false)
                                                return false
                                            }
                                        }

                                    } else {
                                        me.subscription = null
                                        me.paid = false
                                        me.checking = false
                                        me.$emit('paid', false)
                                        me.$emit('subscription', null)
                                        return false

                                    }
                                }
                            }
                        )

                        if (me.getItemResourceType == 'class' || me.getItemResourceType == 'lab') {
                            // "test-class-06@running@test-class-06-copy@test2"

                            //class watch
                            me.watch(`db://enrolledUsers/${convertEmail}/purchaseItemSnapshots/${clazzPathId}`, async function (callback) {
                                if (callback) {
                                    var checkExpired = callback.expiredDate

                                    if (checkExpired || checkExpired >= 0) {
                                        if (typeof checkExpired == 'string') checkExpired = Number(checkExpired)
                                        if (checkExpired == 0 || me.getNowTimeStamp < checkExpired) {
                                            me.paid = true
                                            me.checking = false
                                            me.$emit('paid', true)
                                            return true
                                        }
                                    }
                                }
                                var checkSubscription = await me.getString(`db://enrolledUsers/${convertEmail}/purchaseItemSnapshots/subscription/labs/${labPathId}`)
                                if (me.subscription && checkSubscription) {
                                    me.paid = true
                                    me.checking = false
                                    me.$emit('paid', true)
                                    return true
                                } else {
                                    me.paid = false
                                    me.checking = false
                                    me.$emit('paid', false)
                                    return false
                                }
                            })


                            if (labPathId) {
                                //lab watch
                                me.watch(`db://enrolledUsers/${convertEmail}/purchaseItemSnapshots/${labPathId}`, async function (callback) {
                                    if (callback) {
                                        var checkExpired = callback.expiredDate

                                        if (checkExpired || checkExpired >= 0) {
                                            if (typeof checkExpired == 'string') checkExpired = Number(checkExpired)
                                            if (checkExpired == 0 || me.getNowTimeStamp < checkExpired) {
                                                me.paid = true
                                                me.checking = false
                                                me.$emit('paid', true)
                                                return true
                                            }
                                        }
                                    }

                                    var checkSubscription = await me.getString(`db://enrolledUsers/${convertEmail}/purchaseItemSnapshots/subscription/labs/${labPathId}`)
                                    if (me.subscription && checkSubscription) {
                                        me.paid = true
                                        me.checking = false
                                        me.$emit('paid', true)
                                        return true
                                    } else {
                                        me.paid = false
                                        me.checking = false
                                        me.$emit('paid', false)
                                        return false
                                    }

                                })
                            }

                        } else {
                            me.watch(`db://enrolledUsers/${convertEmail}/purchaseItemSnapshots/${getFindId}`, function (callback) {
                                if (callback) {
                                    var checkExpired = callback.expiredDate

                                    if (checkExpired || checkExpired >= 0) {
                                        if (typeof checkExpired == 'string') checkExpired = Number(checkExpired)
                                        if (checkExpired == 0 || me.getNowTimeStamp < checkExpired) {
                                            me.paid = true
                                            me.checking = false
                                            me.$emit('paid', true)
                                            return true
                                        } else {
                                            me.paid = false
                                            me.checking = false
                                            me.$emit('paid', false)
                                            return false
                                        }
                                    }
                                } else {
                                    me.paid = false
                                    me.checking = false
                                    me.$emit('paid', false)
                                    return false
                                }

                            })
                        }

                    }
                }
            },
            async paidBlurPurchaseItem() {
                var me = this
                var getFindId = me.getItemId

                if (!me.isLogin)
                    await me.setUserInfo()

                // isEnterpriseClass
                // if (me.isEnterpriseClass) {
                //     me.paid = true
                //     me.checking = false
                //     me.$emit('paid', true)
                //     return true
                // }

                // isForeign
                if (me.isForeign) {
                    me.paid = true
                    me.checking = false
                    me.$emit('paid', true)
                    return true
                }


                if (me.getItemAmount) {
                    if (me.isLogin && me.userInfo.email) {
                        var convertEmail = me.userInfo.email.replace(/\./gi, '_')


                        if (me.getItemResourceType == 'class' || me.getItemResourceType == 'lab') {
                            // "test-class-06@running@test-class-06-copy@test2"
                            var courseId = me.getItemId.split('@')[0] ? me.getItemId.split('@')[0] : null
                            var classId = me.getItemId.split('@')[2] ? me.getItemId.split('@')[2] : null
                            var labId = me.getItemId.split('@')[3] ? me.getItemId.split('@')[3] : null
                            var findPath = `${courseId}@${classId}`

                            var checkClassPaid = await me.getObject(`db://enrolledUsers/${convertEmail}/purchaseItemSnapshots/${findPath}`)

                            if (checkClassPaid) {
                                var checkExpired = checkClassPaid.expiredDate ? checkClassPaid.expiredDate : 0
                                if (checkExpired || checkExpired >= 0) {
                                    if (typeof checkExpired == 'string') checkExpired = Number(checkExpired)
                                    if (checkExpired == 0 || me.getNowTimeStamp < checkExpired) {
                                        me.paid = true
                                        me.checking = false
                                        me.$emit('paid', true)
                                        return true;
                                    }
                                }
                            }

                            if (labId) {
                                //lab watch
                                findPath = `${courseId}@${classId}@${labId}`
                                var checkLabPaid = await me.getObject(`db://enrolledUsers/${convertEmail}/purchaseItemSnapshots/${findPath}`)
                                if (checkLabPaid) {
                                    var checkExpired = checkLabPaid.expiredDate ? checkLabPaid.expiredDate : 0
                                    if (checkExpired || checkExpired >= 0) {
                                        if (typeof checkExpired == 'string') checkExpired = Number(checkExpired)
                                        if (checkExpired == 0 || me.getNowTimeStamp < checkExpired) {
                                            me.paid = true
                                            me.checking = false
                                            me.$emit('paid', true)
                                            return true;
                                        }
                                    }
                                }
                            }

                        } else {
                            // Other
                            var checkPaidForItem = await me.getObject(`db://enrolledUsers/${convertEmail}/purchaseItemSnapshots/${getFindId}`)
                            if (checkPaidForItem) {
                                var checkExpired = checkPaidForItem.expiredDate ? checkPaidForItem.expiredDate : 0
                                if (checkExpired || checkExpired >= 0) {
                                    if (typeof checkExpired == 'string') checkExpired = Number(checkExpired)
                                    if (checkExpired == 0 || me.getNowTimeStamp < checkExpired) {
                                        me.paid = true
                                        me.checking = false
                                        me.$emit('paid', true)
                                        return true;
                                    }
                                }
                            }
                        }

                    } else {
                        me.paid = false
                        me.checking = false
                        me.$emit('paid', false)
                        if(me.showLoginDialog){
                            me.$EventBus.$emit('showLoginDialog')
                        }
                        return false
                    }
                } else {
                    //free
                    me.paid = true
                    me.checking = false
                    me.$emit('paid', true)
                    return true
                }

                me.paid = false
                me.checking = false
                me.$emit('paid', false)
                return false
            },
            async paidSubscription() {
                var me = this
                if (this.getItemResourceType == 'lab') {
                    if (me.subscription.availableLabs > 0) {
                        var paymentObj = {
                            itemId: me.getItemId,
                            action: 'withdraw',
                            amount: me.getItemAmount,
                            paymentType: 'subscription',
                            resourceType: me.getItemResourceType, // ide, class, lab, archive, pg
                            relatedTo: me.getItemRelatedTo,
                            className: me.getClassName,
                            labName: me.getLabName,
                            issuedDate: Date.now(),
                            expiredDate: me.subscription.expiredDate,
                            userEmail: me.userInfo.email
                        }
                        await me.pushObject(`db://payments/`, paymentObj)

                    } else {
                        if (me.blurDialog) me.blurDialog = false
                        me.blurDialog = true
                    }
                } else if (this.getItemResourceType == 'downloadCode') {
                    alert('코드  차감')

                }
            },
            async openBlurDialog(click) {
                var me = this

                var doit = function () {
                    if (me.userInfo.email) {
                        if (me.blurDialog) me.blurDialog = false
                        me.blurDialog = true
                    }
                }

                if (me.isLogin) {
                    if (me.paying) {
                        //duplicate buy 방지
                        alert('잠시만 기다려주세요...')
                    } else {
                        if (!me.isPaid) {
                            if (me.subscription) {
                                me.paying = true
                                me.paidSubscription()
                            } else {
                                if (click) {
                                    doit()
                                } else if (!click && me.getOpenDelayTimer >= 0) {
                                    doit()
                                }
                            }

                        }

                    }

                } else {
                    me.$EventBus.$emit('showLoginDialog')
                }
            },
            closeBlurDialog() {
                if (this.blurDialog)
                    this.blurDialog = false
            },
            submit(isPG) {
                this.paying = true
                this.payPurchaseItem(isPG)
            },
            async payPurchaseItem(isPG) {
                var me = this
                var result = false
                try {
                    if (me.isLogin) {
                        var setItemTitle = me.getItemTitle
                        var setItemId = me.getItemId
                        var setResourceType = me.getItemResourceType
                        var setAmount = me.getItemAmount
                        var setWhen = me.getNowTimeStamp
                        var setRelatedTo = me.getItemRelatedTo
                        var setClassName = me.getClassName
                        var setLabName = me.getLabName
                        var setExpiredDate = me.getExpiredTimeStamp
                        var setSeller = null

                        var postObj = {
                            title: setItemTitle,
                            action: 'withdraw',
                            itemId: setItemId,
                            resourceType: setResourceType,
                            amount: setAmount,
                            relatedTo: setRelatedTo,
                            className: setClassName,
                            labName: setLabName,
                            issuedDate: setWhen,
                            expiredDate: setExpiredDate,
                        }
                        result = await me.autoPay(postObj, isPG)
                        me.paying = result
                    } else {
                        if(me.showLoginDialog){
                            me.$EventBus.$emit('showLoginDialog')
                        }
                    }
                } catch (e) {
                    alert('Error-Payment: ' + e)
                } finally {
                    me.closeBlurDialog()
                }

            },

        },
    }
</script>

<style>

    .main-title {
        font-size: 25px;
        font-weight: 900;
    }

    .sub-title {
        font-size: 18px;
    }

    .content-title {
        font-size: 17px;
        font-weight: 600;
    }

    .content-sub-title {
        font-size: 16px;
    }

    .content-text {
        font-size: 14px;
    }

    .content-text-bold {
        font-size: 18px;
        font-weight: bold;
    }


</style>