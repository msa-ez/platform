<template>
    <div>
        <RefundItemTemplate
                :title="title"
                :itemAmount="paidAmount"
                :issuedDate="getIssuedDate"
                :expiredDate="getExpiredDate"
                :thumbnailText="thumbnailText"
                :thumbnailImg="thumbnailImg"
                :userEmail="getUserEmail"
                :resourceType="resourceType"
                :paymentType="paymentType"
                :refunding="refunding"
                :refundReasons="refundReasons"
                @close="closeDialog"
                @submit="submit"
        >
        </RefundItemTemplate>
    </div>
</template>

<script>
    import PaymentBase from "./PaymentBase";
    import RefundItemTemplate from "./RefundItemTemplate";

    export default {
        name: 'refund-item',
        props: {
            refundInfo: {
                type: Object,
                default: function () {
                    return null;
                }
            },
        },
        mixins: [PaymentBase],
        components: {
            RefundItemTemplate
        },
        data() {
            return {
                refunding: false,
                refundReasons: {
                    reasonId: 0,
                    refundText: '',
                    reasons: [
                        {id: 0, reason: '착오 구매'},
                        {id: 1, reason: '중복 구매'},
                        {id: 2, reason: '원하지 않는 구매'},
                        {id: 3, reason: '기타'},
                        {id: 4, reason: '직접 입력'},
                    ]
                },
            }
        },
        async created() {
            if (!this.isLogin)
                await this.loginUser()
        },
        computed: {
            title() {
                if (this.refundInfo) {
                    if (this.refundInfo.resourceType == 'ide') {
                        return `${this.refundInfo.amount}분 IDE 구매`
                    } else if (this.refundInfo.resourceType == 'class') {
                        return `클래스: ${this.refundInfo.className} 구매 `
                    } else if (this.refundInfo.resourceType == 'lab') {
                        return `랩: ${this.refundInfo.labName} 구매 `
                    }
                    return '아이템 이름'
                }
                return null
            },
            paymentType() {
                if (this.refundInfo)
                    return this.refundInfo.paymentType
                return null
            },
            resourceType() {
                if (this.refundInfo)
                    return this.refundInfo.resourceType
                return null
            },
            thumbnailImg() {
                return null
            },
            thumbnailText() {
                return null
            },
            paidAmount() {
                if (this.refundInfo)
                    return this.refundInfo.paidAmount
                return 0
            },
            amount() {
                if (this.refundInfo)
                    return this.refundInfo.amount
                return null
            },
            getIssuedDate() {
                if (this.refundInfo)
                    return this.refundInfo.issuedDate
                return Date.now()
            },
            getExpiredDate() {
                if (this.refundInfo)
                    return this.refundInfo.expiredDate
                return Date.now()
            },
            getUserEmail() {
                if (this.refundInfo)
                    return this.refundInfo.userId
                return null
            },

        },
        methods: {
            async submit(isPG) {
                var me = this

                try {
                    if (me.isLogin) {
                        var result = false
                        me.refunding = true
                        var reasons = ''
                        if (me.refundReasons.reasonId == 4) {
                            reasons = me.refundReasons.refundText
                        } else {
                            reasons = me.refundReasons.reasons[me.refundReasons.reasonId].reason
                        }
                        me.refundInfo.refundedReason = reasons
                        result = await me.autoRefund(me.refundInfo, isPG)
                        me.refunding = result
                        me.$emit('result', result)
                    } else {
                        me.$EventBus.$emit('showLoginDialog')
                    }
                } catch (e) {
                    alert(e)
                } finally {
                    me.closeDialog()
                }
            },
            closeDialog() {
                this.$emit('close')
            },
        }
    }
</script>

<style>
    .price-card {
        border-style: solid;
        border-width: thin;
    }


    .price-card:hover {
        background-color: aliceblue;
    }

    .coin-text {
        margin: 10px 0 0 15px;
        font-weight: 900;
        font-size: 18px;
    }

    .swing {
        animation: swing ease-in-out 1s infinite alternate;
        transform-origin: bottom -5px;
        float: left;
        box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.5);
    }

    .swing img {
        border: 100px solid #f8f8f8;
        display: block;
    }


    @keyframes swing {
        0% {
            transform: rotate(3deg);
        }
        100% {
            transform: rotate(-3deg);
        }
    }
</style>
