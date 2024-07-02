<template>
    <ContextMappingModelCanvas :key="componentKey" :render-count="componentKey" @forceUpdateKey="forceRerender()"/>
</template>

<script>
    import ContextMappingModelCanvas from './ContextMappingModelCanvas.vue'

    export default {
        name: 'context-mapping-model',
        components: {
            ContextMappingModelCanvas
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
