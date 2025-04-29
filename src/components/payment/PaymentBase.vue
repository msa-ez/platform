<template></template>

<script>
    import PaymentComposition from "./PaymentComposition";

    export default {
        name: 'PaymentBase',
        mixins: [PaymentComposition],
        methods: {
            async autoPay(obj, isPG) {
                var me = this
                var result = false
                try {
                    if (obj) {
                        result = await this.pay(obj, isPG)
                    }
                    me.$emit('result', result)
                    return result
                } catch (e) {
                    alert('autoPay:', e)
                    me.$emit('result', false)
                    return false
                }
            },
            async autoRefund(obj, isPG) {
                var me = this
                var result = false
                try {
                    if (obj) {
                        result = await this.refund(obj, isPG)
                    }
                    me.$emit('result', result)
                    return result
                } catch (e) {
                    alert('autoRefund:', e)
                    me.$emit('result', false)
                    return false
                }
            }

        }
    }
</script>
