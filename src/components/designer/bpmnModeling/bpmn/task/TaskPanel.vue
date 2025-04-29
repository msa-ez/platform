<template>
        <bpmn-common-panel
                v-model="value"
                :image="image"
                :is-read-only="isReadOnly"
                :width-style="widthStyle"
                @close="closePanel"
        >
            <template slot="edit-property">
                <!-- v-if="value._type == 'org.uengine.kernel.bpmn.CallActivity'" start -->
                <div v-if="value._type == 'org.uengine.kernel.bpmn.CallActivity'">
                    <v-autocomplete
                            v-model="value.definitionId"
                            :items="recommendedDefinitionList"
                            :filter="fetchDefinitionList"
                            label="연결 프로세스 정의"
                    ></v-autocomplete>
    
                    <div v-if="value.definitionId">
                        <label>연결 변수 매핑</label>
                        <bpmn-parameter-contexts
                                :parameter-contexts="value.variableBindings"
                                :value="definition"
                                :callee-definition-id="value.definitionId"
                                :for-sub-process="true"
                                :for-call-activity="true"
                        ></bpmn-parameter-contexts>
    
                        <label>연결 역할 매핑</label>
                        <bpmn-role-parameter-contexts
                                :parameter-contexts="value.roleBindings"
                                :callee-definition-id="value.definitionId"
                                :definition="definition">
                        </bpmn-role-parameter-contexts>
                    </div>
                </div>
                <!-- v-if="value._type == 'org.uengine.kernel.bpmn.CallActivity'" end -->
    
                <!-- v-if="value._type == 'org.uengine.kernel.ScriptActivity'" start -->
                <div v-if="value._type == 'org.uengine.kernel.ScriptActivity'">
                    <v-select
                            v-model="value.language"
                            :items="langList"
                            item-value="langList.index"
                            label="실행 언어"
                    ></v-select>
                    <v-textarea
                            v-model="value.script"
                            label="스크립트"
                            dense
                    ></v-textarea>
                    <v-textarea
                            v-model="value.out.name"
                            label="실행 결과 변수 매핑"
                            dense
                    ></v-textarea>
                </div>
                <!-- v-if="value._type == 'org.uengine.kernel.ScriptActivity'" end -->
    
                <!-- v-if="value._type == 'org.uengine.kernel.bpmn.SendTask'" start -->
                <div v-if="value._type == 'org.uengine.kernel.bpmn.SendTask'">
                    <v-text-field
                            v-model="value.inputPayloadTemplate"
                            label="입력 데이터 (JSON/XML)"
                    ></v-text-field>
                    <v-text-field
                            v-model="value.dataInput.name"
                            label="결과 입력 변수"
                    ></v-text-field>
                </div>
                <!-- v-if="value._type == 'org.uengine.kernel.bpmn.SendTask'" end -->
    
                <!-- v-if="value._type == 'org.uengine.kernel.HumanActivity'" start -->
                <div v-if="value._type == 'org.uengine.kernel.HumanActivity'">
                    <v-text-field
                            v-model="value.role.name"
                            label="역할" readonly
                    ></v-text-field>
                    <label>파라미터</label>
                    <bpmn-parameter-contexts
                        :parameter-contexts="value.parameters"
                        :value="value"
                        :multi="true"
                    ></bpmn-parameter-contexts>
                </div>
                <!-- v-if="value._type == 'org.uengine.kernel.HumanActivity'" end -->
    
                <!-- v-if="value._type == 'org.uengine.kernel.bpmn.ServiceTask'" start -->
                <div v-if="value._type == 'org.uengine.kernel.bpmn.ServiceTask'">
                    <v-text-field
                            v-model="value.role.name"
                            label="역할 (추후 레인에서 자동설정)" readonly
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
                            v-model="value.uriTemplate"
                            :items="links"
                            item-text="link.link"
                            item-value="link.href"
                            @change="giveJSONHint"
                            label="호출 서비스 선택"
                    ></v-select>
                    <v-select
                            v-model="value.method"
                            :items="methodList"
                            label="호출 메서드"
                    ></v-select>
                    <v-textarea
                            v-if="'GET,DELETE'.indexOf(value.method) == -1"
                            v-model="value.inputPayloadTemplate"
                            label="입력 데이터 (JSON template)"
                            dense
                    ></v-textarea>
                    <label>결과 데이터 매핑</label>
                    <bpmn-parameter-contexts
                            :parameter-contexts="value.outputMapping"
                            :value="definition"
                    ></bpmn-parameter-contexts>
                    <v-checkbox
                            v-model="value.skipIfNotFound"
                            label="리소스 없을 경우 (404) 오류 처리 하지 않음"
                    ></v-checkbox>
                </div>
                <!-- v-if="value._type == 'org.uengine.kernel.bpmn.ServiceTask'" end -->
    
                <!-- v-if="value._type == 'org.uengine.kernel.bpmn.ReceiveTask'" start -->
                <div v-if="value._type == 'org.uengine.kernel.bpmn.ReceiveTask'">
                    <v-text-field
                            v-model="value.role.name"
                            label="역할 (추후 레인에서 자동설정)" readonly
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
                            v-model="value.uriTemplate"
                            :items="links"
                            item-text="link.link"
                            item-value="link.href"
                            @change="giveJSONHint"
                            label="호출 서비스 선택"
                    ></v-select>
                    <v-select
                            v-model="value.method"
                            :items="methodList"
                            label="호출 메서드"
                    ></v-select>
                    <v-textarea
                            v-if="'GET,DELETE'.indexOf(value.method) == -1"
                            v-model="value.inputPayloadTemplate"
                            label="입력 데이터 (JSON template)"
                            dense
                    ></v-textarea>
                    <label>결과 데이터 매핑</label>
                    <bpmn-parameter-contexts
                            :parameter-contexts="value.outputMapping"
                            :value="definition"
                    ></bpmn-parameter-contexts>
                    <v-checkbox
                            v-model="value.skipIfNotFound"
                            label="리소스 없을 경우 (404) 오류 처리 하지 않음"
                    ></v-checkbox>
                </div>
                <!-- v-if="value._type == 'org.uengine.kernel.bpmn.ReceiveTask'" end -->
    
                <v-text-field
                        v-if="value._type != 'org.uengine.kernel.ScriptActivity'"
                        v-model="value.retryDelay"
                        label="retryDelay"
                        type="number"
                ></v-text-field>
            </template>
        </bpmn-common-panel>
    </template>
    
    <script>
        import BpmnPropertyPanel from '../BpmnPropertyPanel'
    
        export default {
            mixins: [BpmnPropertyPanel],
            name: 'bpmn-task-panel',
            props: {
                linkList: Array,
            },
            data() {
                return {
                    langList: [ 'Javascript', 'Java' ],
                    links: this.linkList,
                    methodList: [ 'GET', 'POST', 'DELETE', 'PUT', 'PATCH' ],
                }
            },
            created: function () {
                    console.log(this.value)
            },
            mounted: function () {
            },
            computed: {},
            watch: {
                value(newVal, oldVal) {
                    if(newVal == null) {
                        console.log(newVal)
                    }
                }
            },
            methods: {
                fetchDefinitionList() {
                    this.$emit('fetchDefinitionList');
                },
                giveJSONHint() {
                    this.$emit('giveJSONHint');
                }
            }
        }
    </script>
    
    
    <style lang="scss" rel="stylesheet/scss">
    
    </style>
    
    