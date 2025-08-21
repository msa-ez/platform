<template>
    <BusinessModelCanvas :key="componentKey" :render-count="componentKey" @forceUpdateKey="forceRerender()"/>
</template>

<script>
    import BusinessModelCanvas from "./BusinessModelCanvas.vue";

    export default {
        name: 'business-model',
        components: {
            BusinessModelCanvas
        },
        data() {
            return {
                componentKey: 0,
            }
        },
        methods: {
            forceRerender() {
                var me = this
                me.componentKey += 1;
            },
        }
    }
</script>
