<template>
    <KubernetesModelCanvas :key="componentKey" :render-count="componentKey" @forceUpdateKey="forceRerender()"/>
</template>

<script>
    import KubernetesModelCanvas from './KubernetesModelCanvas.vue'

    export default {
        name: 'kubernetes-model',
        components: {
            KubernetesModelCanvas
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
