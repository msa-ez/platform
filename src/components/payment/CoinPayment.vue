<template></template>

<script>
    import CoinPayment_ from "./CoinPayment_";
    import PaymentAbstract from "./PaymentAbstract";

    export default {
        name: 'coin-payment',
        mixins: [PaymentAbstract, CoinPayment_],
    }
</script>

<style>
</style>