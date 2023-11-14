<template xmlns:v-on="http://www.w3.org/1999/xhtml">

    <event-storming-canvas
            :elementTypes="elementTypes"
            elementListBeanPath="classDefinitions"
            relationListBeanPath="relations"
            relationVueComponentName="class-relation"
            ref="designer"
            style="height: 100%; width: 100%"
    >
    </event-storming-canvas>

</template>

<script>

    export default {
        name: 'event-designer',
        components: {
        },
        props: {
            editModelingDesigner: {
                type: Boolean,
                default: function () {
                    return true;
                },
            },

        },
        data() {
            return {
                elementTypes: [
                    {
                        'icon': 'bpmn-icon-start-event-none',//'OG.shape.essencia.Alpha',
                        'component': 'domain-event-definition',
                        'label': 'Event',
                        'width': '100',
                        'height': '100',
                        'src': `${window.location.protocol + "//" + window.location.host}/static/image/event/event.png`
                    },
                    {
                        'icon': 'bpmn-icon-start-event-none',//'OG.shape.essencia.Alpha',
                        'component': 'command-definition',
                        'label': 'Command',
                        'width': '100',
                        'height': '100',
                        'src': `${window.location.protocol + "//" + window.location.host}/static/image/event/command.png`
                    },
                    {
                        'icon': 'bpmn-icon-start-event-none',//'OG.shape.essencia.Alpha',
                        'component': 'policy-definition',
                        'label': 'Policy',
                        'width': '100',
                        'height': '100',
                        'src': `${window.location.protocol + "//" + window.location.host}/static/image/event/policy.png`
                    },
                    {
                        'icon': 'bpmn-icon-start-event-none',//'OG.shape.essencia.Alpha',
                        'component': 'aggregate-definition',
                        'label': 'Aggregate',
                        'width': '100',
                        'height': '100',
                        'src': `${window.location.protocol + "//" + window.location.host}/static/image/event/aggregate.png`
                    },
                    {
                        'icon': 'bpmn-icon-start-event-none',//'OG.shape.essencia.Alpha',
                        'component': 'external-definition',
                        'label': 'External',
                        'width': '100',
                        'height': '100',
                        'src': `${window.location.protocol + "//" + window.location.host}/static/image/event/external.png`

                    },
                    {
                        'icon': 'bpmn-icon-start-event-none',//'OG.shape.essencia.Alpha',
                        'component': 'view-definition',
                        'label': 'View',
                        'width': '100',
                        'height': '100',
                        'src': `${window.location.protocol + "//" + window.location.host}/static/image/event/view.png`

                    },
                    {
                        'icon': 'bpmn-icon-start-event-none',//'OG.shape.essencia.Alpha',
                        'component': 'bounded-context-definition',
                        'label': 'Bounded Context',
                        'width': '100',
                        'height': '100',
                        'src': `${window.location.protocol + "//" + window.location.host}/static/image/event/bounded2.png`

                    },
                    {
                        'icon': 'bpmn-icon-start-actor-none',//'OG.shape.essencia.Alpha',
                        'component': 'actor-definition',
                        'label': 'Actor',
                        'width': '100',
                        'height': '100',
                        'src': `${window.location.protocol + "//" + window.location.host}/static/image/event/actor.png`
                    },
                ],
            }
        },

        created: function () { },
        computed: { },
        mounted: function () { },
        watch: { },
        methods: { }
    }
</script>


