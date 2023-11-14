<template>
    <bpmn-common-panel
            v-model="value"
            :image="image"
            :is-read-only="readOnly"
            :width-style="widthStyle"
            @close="closePanel"
    >
        <template slot="edit-property">
            <!-- v-if="value._type == 'org.uengine.kernel.bpmn.MessageStartEvent'" start -->
            <div v-if="value._type == 'org.uengine.kernel.bpmn.MessageStartEvent'">
                <v-text-field
                        v-model="value.servicePath"
                        label="Service Path"
                ></v-text-field>
                <v-text-field
                        v-model="value.correlationKey"
                        label="Correlation Key"
                ></v-text-field>
                <v-text-field
                        v-model="value.dataOutput.name"
                        label="Data for Output"
                ></v-text-field>
                <label>데이터 속성 별 매핑</label>
                <bpmn-parameter-contexts
                        :parameter-contexts="value.dataOutputMapping"
                        :definition="definition"
                        label-for-argument="속성"
                ></bpmn-parameter-contexts>
            </div>
            <!-- v-if="value._type == 'org.uengine.kernel.bpmn.MessageStartEvent'" end -->
            
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
        name: 'bpmn-start-event-panel',
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

