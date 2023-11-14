<template>
    <div>
        <purchase-item-template
                :title="'IDE 사용시간 구매'"
                :itemAmount="timeToAmount"
                :itemPeriod="0"
                :userInfo="userInfo"
                :resourceType="getItemResourceType"
                :paying="paying"
                @close="closeDialog()"
                @submit="submit"
        >
            <div style="margin-top: 15px;">
                <v-autocomplete
                        v-model="ideAmount"
                        :items="ideAmountList"
                        item-text="text"
                        item-value="amount"
                        label="IDE 구매시간 "
                        outlined
                        dense
                ></v-autocomplete>
            </div>
        </purchase-item-template>
    </div>
</template>

<script>
    import PaymentBase from "./PaymentBase";
    import GetCoin from "./GetCoin";
    import PurchaseItemTemplate from "./PurchaseItemTemplate";

    export default {
        name: 'payment-tool-time',
        props: {},
        mixins: [PaymentBase],
        components: {
            GetCoin,
            'purchase-item-template' : PurchaseItemTemplate
        },
        data: () => ({
            ideAmount: 60,
            ideAmountList: [
                {text: '1 시간', amount: 60},
                {text: '2 시간', amount: 120},
                {text: '3 시간', amount: 180},
                {text: '4 시간', amount: 240},
                {text: '5 시간', amount: 300}
            ],
            idePrice: 1000,
            paying: false

        }),
        async created() {
            if (!this.isLogin)
                await this.loginUser()
            this.idePrice = await this.getString(`db://pricing/ide`) // 1000
        },
        mounted() {
            var me = this
            me.$EventBus.$on('autoToolPay', function () {
                me.submit(false)
            })
        },
        watch: {},
        computed: {
            timeToAmount() {
                return (this.ideAmount / 60) * Number(this.idePrice / 100)
            },
        },
        methods: {
            async submit(isPG) {
                var me = this
                var result = false
                if (me.isLogin) {
                    me.paying = true
                    var obj = {
                        title: `IDE ${me.ideAmount / 60}시간 구매`,
                        itemId: 'buy_ide',
                        resourceType: 'ide',
                        amount: me.ideAmount,
                        relatedTo: me.userInfo.uid
                    }
                    result = await me.autoPay(obj, isPG)
                    me.paying = result
                    me.$emit('result', result)
                } else {
                    me.$EventBus.$emit('showLoginDialog')
                }
                me.closeDialog()
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
