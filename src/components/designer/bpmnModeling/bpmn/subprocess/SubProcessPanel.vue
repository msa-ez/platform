<template>
    <bpmn-common-panel
            v-model="value"
            :image="image"
            :is-read-only="isReadOnly"
            :width-style="widthStyle"
            @close="closePanel"
    >
        <template slot="edit-property">
            <div>
                <label>Array Variable for multiplicity</label>
                <bpmn-variable-selector 
                        v-model="value" 
                        :definition="canvas.value"
                ></bpmn-variable-selector>
            </div>
            <div>
                <label>Variable Mappings</label>
                <bpmn-parameter-contexts
                        v-model="value"
                        :parameterContexts="value.variableBindings"
                        :forSubProcess="true"
                ></bpmn-parameter-contexts>
            </div>
        </template>
    </bpmn-common-panel>
</template>

<script>
    import BpmnPropertyPanel from '../BpmnPropertyPanel'

    export default {
        mixins: [BpmnPropertyPanel],
        name: 'bpmn-subprocess-panel',
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

