<template>
    <StickyModelCanvas :key="componentKey" :render-count="componentKey" @forceUpdateKey="forceRerender()"/>
</template>

<script>
    import StickyModelCanvas from './StickyModelCanvas.vue'

    export default {
        name: 'sticky-model',
        components: {
            StickyModelCanvas
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
