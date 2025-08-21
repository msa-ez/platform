<template>
    <CustomerJourneyMapCanvas :key="componentKey" :render-count="componentKey" @forceUpdateKey="forceRerender()"/>
</template>

<script>
    import CustomerJourneyMapCanvas from './CustomerJourneyMapCanvas.vue'

    export default {
        name: 'customer-journey-map',
        components: {
            CustomerJourneyMapCanvas
        },
        data() {
            return {
                componentKey: 0,
            }
        },
        methods: {
            forceRerender() {
                this.componentKey += 1;
            },
        }
    }
</script>
