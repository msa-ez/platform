<template>
    <bpmn-common-panel
            v-model="value"
            :image="image"
            :is-read-only="readOnly"
            :width-style="widthStyle"
            @close="closePanel"
    >
        <template slot="edit-property">
            <v-switch
                    v-if="value._type == 'org.uengine.kernel.bpmn.EndEvent'"
                    v-model="value.stopAllTokens"
                    label="Stops all running tokens"
            ></v-switch>
            
            <v-text-field
                    v-model="value.retryDelay"
                    label="retryDelay"
                    type="number"
            ></v-text-field>
        </template>
    </bpmn-common-panel>
</template>

<script>
    import BpmnPropertyPanel from '../../BpmnPropertyPanel'

    export default {
        mixins: [BpmnPropertyPanel],
        name: 'bpmn-end-event-panel',
        props: {
        },
        data() {
            return {
            }
        },
        created: function () {
        },
        mounted: function () {
        },
        computed: {},
        watch: {},
        methods: {}
    }
</script>


<style lang="scss" rel="stylesheet/scss">

</style>

