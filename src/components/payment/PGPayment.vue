<template></template>

<script>
    import PaymentAbstract from "./PaymentAbstract";
    import PGPayment_ from "./PGPayment_";

    export default {
        name: 'pg-payment',
        mixins: [PaymentAbstract, PGPayment_],
    }
</script>