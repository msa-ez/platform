<template xmlns:v-on="http://www.w3.org/1999/xhtml">
    <BpmnModelCanvas :key="componentKey" :render-count="componentKey" @forceUpdateKey="forceRerender()"/>
</template>

<script>
    import BpmnModelCanvas from "./BpmnModelCanvas.vue";

    export default {
        name: 'bpmn-model',
        components: {
            BpmnModelCanvas
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


