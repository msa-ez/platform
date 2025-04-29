<template>
    <v-dialog
            v-model="open"
            width="400"
            @click:outside="closeDialog()"
    >
        <div>
            <purchase-item-template
                    :main-title="getMainTitle"
                    :title="getTitle"
                    :itemSubTitle="getSubTitle"
                    :item-class-name="getClassName"
                    :item-lab-name="getLabName"
                    :itemAmount="getAmount"
                    :item-period="getPeriod"
                    :user-info="userInfo"
                    :thumbnailText="getThumbnailText"
                    :thumbnailImg="getThumbnailImg"
                    @submit="submit"
                    @close="closeDialog"
            ></purchase-item-template>
        </div>
    </v-dialog>
</template>

<script>
    import purchaseItem from "../payment/PurchaseItem";
    import PurchaseItemTemplate from "./PurchaseItemTemplate";

    export default {
        name: 'dialog-purchase-item',
        mixins: [purchaseItem],
        components: {
            'purchase-item-template' : PurchaseItemTemplate
        },
        props: {
            value: {
                type: Boolean,
                default: function () {
                    return false;
                }
            },
            purchaseItemInfo: {
                type: Object,
                default: function () {
                    return null;
                }
            },
        },
        created() {
        },
        computed: {
            open() {
                if (this.value == true)
                    this.paidDialogPurchaseItem()
                return this.value
            },
            getItemId() {
                if (this.purchaseItemInfo && this.purchaseItemInfo.itemId) {
                    return this.purchaseItemInfo.itemId
                }
                return null
            },
            getMainTitle() {
                if (this.purchaseItemInfo && this.purchaseItemInfo.mainTitle) {
                    return this.purchaseItemInfo.mainTitle
                }
                return null
            },
            getTitle() {
                if (this.purchaseItemInfo && this.purchaseItemInfo.title) {
                    return this.purchaseItemInfo.title
                }
                return null
            },
            getSubTitle() {
                if (this.purchaseItemInfo && this.purchaseItemInfo.subTitle) {
                    return this.purchaseItemInfo.subTitle
                }
                return null
            },
            getAmount() {
                if (this.purchaseItemInfo && this.purchaseItemInfo.amount) {
                    return this.purchaseItemInfo.amount
                }
                return null
            },
            getThumbnailText() {
                if (this.purchaseItemInfo && this.purchaseItemInfo.thumbnailText) {
                    return this.purchaseItemInfo.thumbnailText
                }
                return null
            },
            getThumbnailImg() {
                if (this.purchaseItemInfo && this.purchaseItemInfo.thumbnailImg) {
                    return this.purchaseItemInfo.thumbnailImg
                }
                return null
            },
            getPeriod() {
                if (this.purchaseItemInfo && this.purchaseItemInfo.period >= 0) {
                    return this.purchaseItemInfo.period
                }
                return 90
            },

        },
        methods: {
            submit(isPG) {
                this.payPurchaseItem(isPG)
            },
            closeDialog(result) {
                this.$emit('close', result)
            },
            async payPurchaseItem(isPG) {
                var me = this
                me.buying = true
                var result = await me.autoPay(me.purchaseItemInfo, isPG)
                me.$emit('result', result)
                me.closeDialog(result)
            },
            async paidDialogPurchaseItem() {
                var me = this
                var now = Date.now()
                console.log('isForeign::: ',me.isForeign)
                if (me.getAmount) {
                    if (me.isLogin && me.userInfo) {
                        var convertEmail = me.userInfo.email.replace(/\./gi, '_')

                        var checkClassPaid = await me.getObject(`db://enrolledUsers/${convertEmail}/purchaseItemSnapshots/${me.getItemId}`)
                        if (checkClassPaid) {
                            var checkExpired = checkClassPaid.expiredDate ? checkClassPaid.expiredDate : 0
                            if (checkExpired || checkExpired >= 0) {
                                if (typeof checkExpired == 'string') checkExpired = Number(checkExpired)
                                if (checkExpired == 0 || now < checkExpired) {
                                    me.$emit('result', true)
                                    me.closeDialog()
                                }
                            }
                        }
                    } else {
                        me.$EventBus.$emit('showLoginDialog')
                    }
                } else {
                    me.$emit('result', true)
                    me.closeDialog()
                }

            },


        },
    }
</script>