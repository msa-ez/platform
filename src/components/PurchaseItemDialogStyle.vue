<template>
    <v-dialog
            v-model="info.show"
            width="600px"
            @click:outside="close()"
    >
        <v-card>
            <v-card-title>
                <span class="headline">{{submitText}}을(를) 위해 코인을 사용합니다.</span>
            </v-card-title>
            <v-card-text>
                <v-col>
                    <div>보유 코인 : {{loginUserInfo.savedCoin}}</div>
                    <div>사용 코인 : {{purchasePrice}}</div>

                </v-col>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                        color="green darken-1"
                        text
                        @click="submit()"
                >
                    {{submitText}}
                </v-btn>
                <v-btn
                        color="red darken-1"
                        text
                        @click="close()"
                >
                    Cancel
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script>
    import PurchaseItem from "./payment/PurchaseItem";

    export default {
        name: 'purchase-item-dialog-style',
        mixins: [PurchaseItem],
        props: {
            info: {
                default: function () {
                    return null
                },
                type: Object
            },
        },
        computed: {
            submitText() {
                var me = this
                if (me.info.price <= me.loginUserInfo.savedCoin) {
                    if (me.info.itemId && me.info.itemId.includes('code')) {
                        return 'code View'
                    } else if (me.info.itemId && me.info.itemId.includes('archive')) {
                        return 'archive'
                    }
                } else {
                    return '코인 구매'
                }
                return null
            },
            purchasePrice() {
                if (this.info) {
                    return this.info.price
                }
                return 0
            },
        },
        methods: {
            async submit() {
                var me = this
                if (me.purchasePrice <= me.loginUserInfo.savedCoin) {
                    var convertEmail = me.loginUserInfo.userEmail.replace(/\./gi, '_')
                    var purchaseHistoryKey = await me.pushString(`db://enrolledUsers/${convertEmail}/purchaseHistory`)
                    var seller = null
                    var putObj = null

                    if (me.info) {
                        putObj = {
                            itemId: me.info.itemId,
                            className: me.info.className ? me.info.className : null,
                            labName: me.info.labName ? me.info.labName : null,
                            action: 'withdraw',
                            state: 'paid',
                            resourceId: me.info.resourceId,
                            price: me.purchasePrice,
                            userId: me.loginUserInfo.userEmail,
                            purchaseHistoryId: purchaseHistoryKey,
                            when:Date.now(),
                            expiredDate: me.getExpiredTimeStamp,
                            seller: seller,
                        }
                        // me.putString(`db://enrolledUsers/${convertEmail}/purchaseItems/${me.info.itemId}`, putObj)
                        if (me.info && me.info.itemId.includes('code')) {
                            me.$emit('submit', 'code', putObj)
                        } else if (me.info && me.info.itemId.includes('archive')) {
                            me.$emit('submit', 'archive', putObj)
                        }
                    }

                    me.close()
                } else {
                    me.close()
                    me.openPricing()
                }


            },
            close() {
                this.$emit('close')
            }
        }

    }
</script>