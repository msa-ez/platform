<template></template>

<script>
    import PaymentAbstract from "./PaymentAbstract";
    import CoinPayment_ from "./CoinPayment_";
    import PGPayment_ from "./PGPayment_";

    export default {
        name: "payment-composition",
        mixins: [PaymentAbstract],
        data() {
            return {
                pgPay: null,
                coinPay: null,
            }
        },
        created() {
            var me = this
            var coinClazz = Vue.extend(CoinPayment_);
            var pgClazz = Vue.extend(PGPayment_);

            me.coinPay = new coinClazz();
            me.pgPay = new pgClazz();
        },
        methods: {
            async _pay(obj, pg) {
                var server = this.getPayMethod(pg);
                return await server._pay(obj);
            },
            async _refund(obj, pg) {
                var server = this.getPayMethod(pg);
                return await server._refund(obj);
            },
            getPayMethod(pg) {
                if (pg) {
                    return this.pgPay
                }
                return this.coinPay
            },

        }
    };
</script>
