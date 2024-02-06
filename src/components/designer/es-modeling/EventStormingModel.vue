<template>
    <EventStormingModelCanvas :key="componentKey" :render-count="componentKey" @forceUpdateKey="forceRerender()"/>
</template>

<script>
    import EventStormingModelCanvas from "./EventStormingModelCanvas";

    export default {
        name: 'event-storming-model',
        components: {
            EventStormingModelCanvas
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
