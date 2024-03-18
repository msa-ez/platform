<template>
    <bpmn-common-panel
            v-model="value"
            :image="image"
            :is-read-only="isReadOnly"
            :width-style="widthStyle"
            @close="closePanel"
    >
        <template slot="edit-property">
            <!-- v-if="value._type == 'org.uengine.kernel.bpmn.MessageIntermediateCatchEvent'" start -->
            <div v-if ="value._type == 'org.uengine.kernel.bpmn.MessageIntermediateCatchEvent'">
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
                <label>Data Mapping</label>
                <bpmn-parameter-contexts
                        :parameter-contexts="value.dataOutputMapping"
                        :definition="definition"
                ></bpmn-parameter-contexts>
            </div>
            <!-- v-if="value._type == 'org.uengine.kernel.bpmn.MessageIntermediateCatchEvent'" end -->

            <!-- v-if="value._type == 'org.uengine.kernel.bpmn.ConditionalCatchEvent'" start -->
            <div v-if="value._type == 'org.uengine.kernel.bpmn.ConditionalCatchEvent'">
                <label>Condition</label>
                <v-checkbox 
                        v-model="complexCondition"
                        label="Complex Rule"
                ></v-checkbox>
                <div v-if="complexCondition">
                    <org-uengine-kernel-Or 
                            v-model="value.condition" 
                            :definition="definition"
                    ></org-uengine-kernel-Or>
                </div>
                <org-uengine-kernel-Evaluate 
                        v-else 
                        v-model="value.condition" 
                        :definition="definition"
                ></org-uengine-kernel-Evaluate>
                <v-text-field
                        v-model="value.pollingIntervalInSecond"
                        label="Polling Interval (in seconds)"
                        type="number"
                ></v-text-field>
            </div>
            <!-- v-if="value._type == 'org.uengine.kernel.bpmn.ConditionalCatchEvent'" end -->

            <!-- v-if="value._type == 'org.uengine.kernel.bpmn.MessageIntermediateThrowEvent'" start -->
            <div v-if="value._type == 'org.uengine.kernel.bpmn.MessageIntermediateThrowEvent'">
                <v-text-field
                        v-model="value.role.name"
                        label="Target Service Pool"
                        readonly
                ></v-text-field>
                <v-text-field
                        v-model="value.uriTemplate"
                        label="호출 URI 패턴"
                ></v-text-field>
                <v-checkbox
                        v-if="value.uriTemplate && value.uriTemplate.indexOf('https://') == 0"
                        v-model="value.noValidationForSSL"
                        label="Don't validate the certificate"
                ></v-checkbox>
                <v-select
                        v-if="links"
                        :items="links"
                        item-text="key"
                        item-value="href"
                        @change="giveJSONHint"
                        label="호출 서비스 선택"
                ></v-select>
                <v-select
                        v-model="value.method"
                        :items="methodList"
                        label="호출 메서드"
                ></v-select>
                <div v-if="'GET,DELETE'.indexOf(value.method) == -1">
                    <label>Input</label>
                    <v-switch
                            v-model="value.useJSONTemplate"
                            label="Use JSON Template"
                    ></v-switch>
                    <v-textarea
                            v-if="useJSONTemplate"
                            v-model="value.uriTemplate"
                            label="입력 데이터 (JSON template)"
                    ></v-textarea>
                    <bpmn-variable-selector 
                            v-else
                            v-model="inputVariable" 
                            :definition="canvas.value"
                            style="width: 100%; height: 80px;" 
                    ></bpmn-variable-selector>
                </div>
                <label>Headers</label>
                <div v-for="(header, index) in value.headers" :key="index">
                    <v-text-field
                            v-model="value.headers[index].name"
                            label="Name"
                    ></v-text-field>
                    <v-text-field
                            v-model="value.headers[index].value"
                            label="Value"
                    ></v-text-field>
                    <v-btn @click="deleteHeader(index)">delete</v-btn>
                </div>
                <br />
                <v-btn @click="addHeader" 
                        color="primary" 
                        class="my-5"
                >Add header</v-btn>
                <br />
                <label>Output</label>
                <bpmn-parameter-contexts
                        :parameter-contexts="value.outputMapping"
                        :definition="definition"
                ></bpmn-parameter-contexts>
                <v-checkbox
                        v-model.number="value.skipIfNotFound"
                        label="리소스 없을 경우 (404) 오류 처리 하지 않음"
                ></v-checkbox>
                <v-checkbox
                        v-model.number="value.queuingEnabled"
                        label="Queuing Enabled"
                ></v-checkbox>
            </div>
            <!-- v-if="value._type == 'org.uengine.kernel.bpmn.MessageIntermediateThrowEvent'" end -->

            <!-- v-if="value._type == 'org.uengine.kernel.bpmn.TimerIntermediateEvent'" start -->
            <div v-if ="value._type == 'org.uengine.kernel.bpmn.TimerIntermediateEvent'">
                <v-select 
                        v-model="value.scheduleType"
                        :items="scheduleTypeList"
                        item-text="text"
                        item-value="value"
                        item-disabled="disabled"
                ></v-select>
                <v-text-field
                        v-if="value.scheduleType == 'cron'"
                        v-model="value.expression"
                        label="Quartz Cron Expression"
                >
                    <a href="http://www.cronmaker.com/" target="_blank">Cron Maker</a>
                </v-text-field>
                <v-text-field
                        v-if="value.scheduleType == 'sec'"
                        v-model="value.expression"
                        label="Interval in Second"
                        type="number"
                ></v-text-field>
            </div>
            <!-- v-if="value._type == 'org.uengine.kernel.bpmn.TimerIntermediateEvent'" end -->

            <v-text-field
                    v-if="value._type != 'org.uengine.kernel.bpmn.CatchingErrorEvent' && 
                        value._type != 'org.uengine.kernel.bpmn.ConditionalCatchEvent'"
                    v-model="value.retryDelay"
                    label="retryDelay"
                    type="number"
            ></v-text-field>
            <v-text-field
                    v-if="value._type == 'org.uengine.kernel.bpmn.CatchingErrorEvent' ||
                        value._type == 'org.uengine.kernel.bpmn.TimerIntermediateEvent'"
                    v-model="value.attachedToRef"
                    label="부착 액티비티 ID"
            ></v-text-field>
            <v-text-field
                    v-if="value._type == 'org.uengine.kernel.bpmn.EscalationIntermediateCatchEvent' || 
                        value._type == 'org.uengine.kernel.bpmn.SignalIntermediateCatchEvent'"
                    v-model="value.attachedToRef"
                    label="Attach Activity ID"
            ></v-text-field>
        </template>
    </bpmn-common-panel>
</template>

<script>
    import BpmnPropertyPanel from '../../BpmnPropertyPanel'

    export default {
        mixins: [BpmnPropertyPanel],
        name: 'bpmn-intermediate-event-panel',
        props: {
            isComplexCondition: Boolean,
            linkList: Array,
            // useJSONTemplate,
        },
        data() {
            return {
                complexCondition: this.isComplexCondition,  // org.uengine.kernel.bpmn.ConditionalCatchEvent
                links: this.linkList,    // org.uengine.kernel.bpmn.MessageIntermediateThrowEvent
                methodList: [ 'GET', 'POST', 'DELETE', 'PUT', 'PATCH' ],    // org.uengine.kernel.bpmn.MessageIntermediateThrowEvent
                scheduleTypeList: [
                    { text: 'Cron Expression', value: 'cron' },
                    { text: 'Interval in second', value: 'sec' },
                    { text: 'Available in Enterprise Edition', value: '', disabled: true },
                    { text: 'Interval in minute', value: 'min' },
                    { text: 'Interval in hour', value: 'how' },
                    { text: 'Interval in mili-second', value: 'milisec' },
                ],
            }
        },
        created: function () {
        },
        mounted: function () {
            // console.log(this.definition)
        },
        computed: {},
        watch: {},
        methods: {
            // org.uengine.kernel.bpmn.MessageIntermediateThrowEvent
            giveJSONHint() {
                this.$emit('giveJSONHint');
            },
            deleteHeader(idx) {
                this.$emit('deleteHeader', idx);
            },
            addHeader() {
                this.$emit('addHeader');
            },
        }
    }
</script>


<style lang="scss" rel="stylesheet/scss">

</style>

