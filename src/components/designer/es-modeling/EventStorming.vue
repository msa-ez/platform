<template>
    <EventStormingModelCanvas :key="componentKey" :render-count="componentKey" @forceUpdateKey="forceRerender()"/>
</template>

<script>
    import EventStormingModelCanvas from "./EventStormingModelCanvas";

    export default {
        name: 'event-storming',
        components: {
            EventStormingModelCanvas
        },
        data() {
            return {
                componentKey: 0,
            }
        },
        computed: {},
        created: function () {
        },
        beforeDestroy() {
        },
        mounted: function () {
        },
        methods: {
            forceRerender() {
                var me = this
                me.componentKey += 1;
            },
        }
    }
</script>
