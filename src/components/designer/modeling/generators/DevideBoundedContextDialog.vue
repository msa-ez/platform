<template>
    <v-card :key="`bounded-context-${messageId}`" style="max-height: 2000px; overflow-y: auto;">
        <v-card-title>
            {{ $t('DevideBoundedContextDialog.boundedContextDivisionResult') }}
            <!-- <v-btn v-if="isGeneratingBoundedContext" text color="primary" @click="stop()">Stop</v-btn> -->
            <!-- <v-btn :style="{'margin-left': 'auto'}" icon @click="closeDialog()">
                <v-icon>mdi-close</v-icon>
            </v-btn> -->
        </v-card-title>
        <v-card-subtitle>
            <div class="d-flex align-center">
                <div v-if="Object.keys(resultDevideBoundedContext).length > 0">
                    <p>{{ Object.keys(resultDevideBoundedContext)[0] }}</p>
                </div>
                <div v-if="isGeneratingBoundedContext">
                    <p class="mb-0">{{ $t('DevideBoundedContextDialog.lodingMessage') }}</p>
                </div>
                <div v-if="isStartMapping">
                    <p class="mb-0">{{ currentProcessingBoundedContext }} - {{ $t('DevideBoundedContextDialog.mappingMessage') }} ({{ processingRate }}%)</p>
                </div>
                <v-progress-circular
                    v-if="isGeneratingBoundedContext || isStartMapping"
                    color="primary"
                    indeterminate
                    size="24"
                    class="ml-2"
                ></v-progress-circular>
            </div>
        </v-card-subtitle>

        <v-card-text v-if="Object.keys(resultDevideBoundedContext).length > 0">
            <div style="text-align: center;">
                <vue-mermaid
                    :id="`mermaid-${messageId}-${renderKey}`"
                    :key="`mermaid-${messageId}-${renderKey}`"
                    :nodes="mermaidNodes"
                    type="graph TD"
                    @nodeClick="editNode"
                    :config="config"
                ></vue-mermaid>
            </div>
            
            <div>
                <v-card-title class="text-subtitle-1 pa-0 pb-4">{{ $t('DevideBoundedContextDialog.reasonOfSeparation') }}</v-card-title>
                <v-card-text class="pa-0 pb-4" align="left">{{ resultDevideBoundedContext[selectedAspect].thoughts }}</v-card-text>

                <v-card-title v-if="summarizedResult.length > 0" class="pa-0 pb-0 text-subtitle-1">{{ $t('DevideBoundedContextDialog.summarizedResult') }}</v-card-title>
                <v-card-text v-if="summarizedResult.length > 0" class="pa-0 pb-4" align="left">{{ summarizedResult }}</v-card-text>

                <v-card-title class="pa-0 pb-0 text-subtitle-1">{{ $t('DevideBoundedContextDialog.descriptionOfEachBoundedContext') }}</v-card-title>
                <v-card-text class="pa-0 pb-4" align="left">* {{ $t('DevideBoundedContextDialog.descriptionOfEditBoundedContext') }}</v-card-text>
                <v-card class="pa-0 ma-0 mt-4" outlined>
                    <v-data-table
                        :items="getGroupedBoundedContextRequirements()"
                        :headers="boundedContextHeaders"
                        :hide-default-footer="true"
                        :items-per-page="-1"
                        show-expand
                        :expand-icon="expandIcon"
                        :single-expand="false"
                        item-key="name"
                        :key="tableRenderKey"
                    >
                        <template v-slot:item.actions="{ item }">
                            <v-icon 
                                small 
                                color="error"
                                @click="deleteBoundedContext(item)"
                            >
                                mdi-delete
                            </v-icon>
                        </template>

                        <template v-slot:item.name="{ item }">
                            <v-edit-dialog
                                :return-value.sync="item.name"
                                @save="saveItemEdit(item, 'name')"
                                @open="initializeEditFields(item)"
                                @cancel="cancelEdit(item)"
                                large
                                persistent
                            >
                                <template v-slot:input>
                                    <v-text-field
                                        v-model="editedFields.name"
                                        :label="$t('DevideBoundedContextDialog.edit.boundedContextName')"
                                        :rules="[v => !!v || $t('validation.required')]"
                                        single-line
                                        class="mb-2"
                                    ></v-text-field>
                                    <v-text-field
                                        v-model="editedFields.alias"
                                        :label="$t('DevideBoundedContextDialog.edit.boundedContextAlias')"
                                        :rules="[v => !!v || $t('validation.required')]"
                                        single-line
                                    ></v-text-field>
                                </template>
                                <span>{{ item.name }}</span>
                            </v-edit-dialog>
                        </template>

                        <template v-slot:item.importance="{ item }">
                            <v-edit-dialog
                                :return-value.sync="item.importance"
                                @save="saveItemEdit(item, 'importance')"
                                @open="initializeEditFields(item)"
                                @cancel="cancelEdit(item)"
                                large
                                persistent
                            >
                                <template v-slot:input>
                                    <v-select
                                        v-model="editedFields.importance"
                                        :items="importances"
                                        :label="$t('DevideBoundedContextDialog.edit.importance')"
                                        single-line
                                    ></v-select>
                                </template>
                                <span>{{ item.importance }}</span>
                            </v-edit-dialog>
                        </template>

                        <template v-slot:item.implementationStrategy="{ item }">
                            <v-edit-dialog
                                :return-value.sync="item.implementationStrategy"
                                @save="saveItemEdit(item, 'implementationStrategy')"
                                @open="initializeEditFields(item)"
                                @cancel="cancelEdit(item)"
                                large
                                persistent
                            >
                                <template v-slot:input>
                                    <v-select
                                        v-model="editedFields.implementationStrategy"
                                        :items="implementationStrategies"
                                        :label="$t('DevideBoundedContextDialog.edit.implementationStrategy')"
                                        single-line
                                    ></v-select>
                                </template>
                                <span>{{ item.implementationStrategy }}</span>
                            </v-edit-dialog>
                        </template>

                        <template v-slot:expanded-item="{ headers, item }">
                            <td class="pl-0" :colspan="headers.length">
                                <v-simple-table dense class="requirement-subtable">
                                    <tbody>
                                        <tr v-for="req in item.requirements" :key="req.type">
                                            <td class="requirement-type" width="100">{{ req.type }}</td>
                                            <td class="requirement-text">{{ req.text }}</td>
                                        </tr>
                                    </tbody>
                                </v-simple-table>
                            </td>
                        </template>
                    </v-data-table>
                </v-card>
                <v-card class="pa-0 ma-0 mt-4" outlined>
                    <v-card-title class="text-subtitle-1 pa-4">{{ $t('DevideBoundedContextDialog.relations') }}</v-card-title>
                    <v-data-table 
                        :items="resultDevideBoundedContext[selectedAspect].explanations" 
                        :headers="explanationsHeaders" 
                        :hide-default-footer="true"
                    ></v-data-table>
                </v-card>
            </div>

            <v-card class="mt-4 pa-4" outlined>
                <v-textarea :disabled="isGeneratingBoundedContext" v-model="feedback" label="Feedback" rows="3"></v-textarea>
                <v-row class="pa-0 ma-0">
                    <v-spacer></v-spacer>
                    <v-btn :disabled="feedback === '' || isGeneratingBoundedContext || isStartMapping" class="auto-modeling-btn" @click="reGenerateWithFeedback()">
                        {{ $t('DevideBoundedContextDialog.reGenerate') }} 
                    </v-btn>
                </v-row>
            </v-card>
            <v-row class="pa-0 ma-0 pt-4">
                <v-spacer></v-spacer>
                <!-- <v-btn @click="reGenerate()"
                    :disabled="isGeneratingBoundedContext || isStartMapping"
                >
                    <v-icon class="auto-modeling-btn-icon">mdi-refresh</v-icon>{{ $t('DevideBoundedContextDialog.reGenerate') }}
                </v-btn> -->
                <v-btn 
                    :disabled="isGeneratingBoundedContext || isStartMapping" 
                    class="auto-modeling-btn" 
                    color="primary" 
                    @click="createModel()"
                >
                    {{ $t('DevideBoundedContextDialog.createAggregateDraft') }}
                </v-btn>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script>
    import VueMermaid from '@/components/VueMermaid.vue';

    export default {
        name: 'devide-bounded-context-dialog',
        props: {
            resultDevideBoundedContext: {
                type: Object,
                default: () => ({}),
                required: false
            },
            isStartMapping: {
                type: Boolean,
                default: () => false,
                required: false
            },
            isGeneratingBoundedContext: {
                type: Boolean,
                default: () => false,
                required: false
            },
            processingRate: {
                type: Number,
                default: () => 0,
                required: false
            },
            currentProcessingBoundedContext: {
                type: String,
                default: () => "",
                required: false
            },
            selectedAspect: {
                type: String,
                default: () => "",
                required: false
            },
            summarizedResult: {
                type: String,
                default: () => "",
                required: false
            },
            messageId: {
                type: String,
                default: () => "",
                required: false
            }
        },
        components: {
            VueMermaid
        },
        data() {
            return {
                activeTab: null,
                mermaidNodes: {},
                config: {
                    theme: 'default',
                    startOnLoad: true,
                    securityLevel: 'loose',
                    flowChart:{
                        useMaxWidth: false,
                    }
                },
                selectedResultDevideBoundedContext: {},
                feedback: '',
                expandIcon: 'mdi-chevron-down',
                boundedContextHeaders: [
                    { text: this.$t('DevideBoundedContextDialog.boundedContextName'), value: 'name' },
                    { text: this.$t('DevideBoundedContextDialog.importance'), value: 'importance' },
                    { text: this.$t('DevideBoundedContextDialog.implementationStrategy'), value: 'implementationStrategy' },
                    { text: '', value: 'data-table-expand' },
                    { text: '', value: 'actions' },
                ],
                requirementHeaders: [
                    { text: this.$t('DevideBoundedContextDialog.boundedContextName'), value: 'name' },
                    { text: this.$t('DevideBoundedContextDialog.requirements'), value: 'requirements' }
                ],
                explanationsHeaders: [
                    { text: this.$t('DevideBoundedContextDialog.sourceContext'), value: 'sourceContext' },
                    { text: this.$t('DevideBoundedContextDialog.targetContext'), value: 'targetContext' },
                    { text: this.$t('DevideBoundedContextDialog.relationType'), value: 'relationType' },
                    { text: this.$t('DevideBoundedContextDialog.reason'), value: 'reason' },
                    { text: this.$t('DevideBoundedContextDialog.interactionPattern'), value: 'interactionPattern' }
                ],
                renderKey: 0,
                tableRenderKey: 0,

                editedFields: {
                    name: '',
                    alias: '',
                    importance: '',
                    implementationStrategy: ''
                },
                currentEditItem: null,

                importances: [
                    { text: 'Core Domain', value: 'Core Domain' },
                    { text: 'Supporting Domain', value: 'Supporting Domain' },
                    { text: 'Generic Domain', value: 'Generic Domain' }
                ],
                implementationStrategies: [
                    { text: 'Event Sourcing', value: 'Event Sourcing' },
                    { text: 'Rich Domain Model', value: 'Rich Domain Model' },
                    { text: 'Transaction Script', value: 'Transaction Script' },
                    { text: 'Active Record', value: 'Active Record' }
                ]
            }
        },
        mounted() {
        },
        watch: {
            resultDevideBoundedContext: {
                handler(newVal) {
                    if(this.isStartMapping) return;

                    let key = Object.keys(newVal)[0];
                    
                    const boundedContexts = newVal[key].boundedContexts || [];
                    const relations = newVal[key].relations || [];
                    if (boundedContexts && relations) {
                        this.mermaidNodes = this.generateNodes({ boundedContexts, relations });
                        this.renderKey++;
                        this.tableRenderKey++;
                    }
                },
                deep: true
            }
        },
        methods: {
            generateNodes(result) {
                const nodes = [];
                const boundedContexts = result.boundedContexts || [];
                const relations = result.relations || [];
                
                // 노드 생성
                boundedContexts.forEach((bc, index) => {
                    nodes.push({
                        id: `BC${index}`,
                        text: bc.alias,
                        editable: true,
                        edgeType: 'stadium'
                    });
                });
                
                // 관계 생성
                relations.forEach((rel) => {
                    const sourceIndex = boundedContexts.findIndex(bc => bc.name === rel.upStream.name);
                    const targetIndex = boundedContexts.findIndex(bc => bc.name === rel.downStream.name);
                    
                    if (sourceIndex !== -1 && targetIndex !== -1) {
                        // 기존 노드에 next 속성 추가
                        const sourceNode = nodes.find(node => node.id === `BC${sourceIndex}`);
                        if (sourceNode) {
                            sourceNode.next = sourceNode.next || [];
                            sourceNode.next.push(`BC${targetIndex}`);
                            sourceNode.link = sourceNode.link || [];
                            sourceNode.link.push(`-->|"${rel.type}"|`);
                        }
                    }
                });
                
                return nodes;
            },

            editNode(node) {
                console.log("node clicked: ", node);
            },

            createModel(){
                this.$emit("createModel", this.resultDevideBoundedContext[Object.keys(this.resultDevideBoundedContext)[0]]);
            },

            closeDialog(){
                this.$emit("closeDialog");
            },

            stop(){
                this.mermaidNodes = {};
                this.renderKey++;
                this.$emit("stop");
            },

            reGenerate(){
                this.feedback = '';
                this.mermaidNodes = {};
                this.renderKey++;
                this.$emit("reGenerate");
            },

            reGenerateWithFeedback(){
                this.renderKey++;
                this.$emit("reGenerateWithFeedback", this.feedback, this.messageId);
                this.feedback = '';
            },

            getGroupedBoundedContextRequirements() {
                let key = Object.keys(this.resultDevideBoundedContext)[0];

                if (!this.resultDevideBoundedContext[key] || !this.resultDevideBoundedContext[key].boundedContexts) return [];
    
                return this.resultDevideBoundedContext[key].boundedContexts.map(bc => ({
                    name: bc.alias,
                    originalName: bc.name,
                    importance: bc.importance || '',
                    implementationStrategy: bc.implementationStrategy || '',
                    requirements: bc.requirements ? bc.requirements.map(req => ({
                        type: req.type || '',
                        text: req.text || req
                    })) : [],
                }));
            },

            getBoundedContextRequirements() {
                let key = Object.keys(this.resultDevideBoundedContext)[0];

                if (!this.resultDevideBoundedContext[key] || !this.resultDevideBoundedContext[key].boundedContexts) return [];
    
                return this.resultDevideBoundedContext[key].boundedContexts.flatMap(bc => {
                    if (!bc.requirements) return [];
                    
                    return bc.requirements.map(req => ({
                        name: bc.alias,
                        requirements: req.text || req
                    }));
                });
            },

            saveItemEdit(item, field) {
                let key = Object.keys(this.resultDevideBoundedContext)[0];

                const boundedContextIndex = this.resultDevideBoundedContext[key].boundedContexts
                    .findIndex(bc => bc.alias === item.originalName || bc.alias === item.name);
                
                if (boundedContextIndex > -1) {
                    const boundedContext = this.resultDevideBoundedContext[key].boundedContexts[boundedContextIndex];
                    const oldName = boundedContext.name;
                    const oldAlias = boundedContext.alias;
                    
                    switch(field) {
                        case 'name':
                            if (!this.editedFields.name || !this.editedFields.alias) {
                                return;
                            }

                            this.resultDevideBoundedContext[key].relations = 
                                this.resultDevideBoundedContext[key].relations.map(relation => {
                                    if (relation.upStream.name === oldName || relation.upStream.alias === oldAlias) {
                                        relation.upStream.name = this.editedFields.name;
                                        relation.upStream.alias = this.editedFields.alias;
                                    }
                                    if (relation.downStream.name === oldName || relation.downStream.alias === oldAlias) {
                                        relation.downStream.name = this.editedFields.name;
                                        relation.downStream.alias = this.editedFields.alias;
                                    }
                                    return relation;
                                });

                            if (this.resultDevideBoundedContext[key].explanations) {
                                this.resultDevideBoundedContext[key].explanations = 
                                    this.resultDevideBoundedContext[key].explanations.map(explanation => {
                                        if (explanation.sourceContext === oldAlias) {
                                            explanation.sourceContext = this.editedFields.alias;
                                        }
                                        if (explanation.targetContext === oldAlias) {
                                            explanation.targetContext = this.editedFields.alias;
                                        }
                                        return explanation;
                                    });
                            }

                            boundedContext.name = this.editedFields.name;
                            boundedContext.alias = this.editedFields.alias;
                            break;

                        case 'importance':
                            boundedContext.importance = this.editedFields.importance;
                            break;

                        case 'implementationStrategy':
                            boundedContext.implementationStrategy = this.editedFields.implementationStrategy;
                            break;
                    }

                    // 여기를 수정: 전체 resultDevideBoundedContext[key]를 전달
                    this.mermaidNodes = this.generateNodes({
                        boundedContexts: this.resultDevideBoundedContext[key].boundedContexts,
                        relations: this.resultDevideBoundedContext[key].relations
                    });
                    this.renderKey++;
                    this.tableRenderKey++;
                }
            },

            validateAndSave(item) {
                if (!this.editedFields.name) {
                    return;
                }
                
                this.saveItemEdit(item, 'name');
                this.currentEditItem = null;
            },

            initializeEditFields(item) {
                let key = Object.keys(this.resultDevideBoundedContext)[0];

                const boundedContext = this.resultDevideBoundedContext[key].boundedContexts
                    .find(bc => bc.alias === item.name);
                
                this.editedFields = {
                    name: boundedContext.name || item.name,
                    alias: boundedContext.alias || item.name,
                    importance: item.importance,
                    implementationStrategy: item.implementationStrategy
                };
                this.currentEditItem = item;
            },

            cancelEdit(item) {
                let key = Object.keys(this.resultDevideBoundedContext)[0];

                const boundedContext = this.resultDevideBoundedContext[key].boundedContexts
                    .find(bc => bc.alias === item.name);
                    
                this.editedFields = {
                    name: boundedContext.name || item.name,
                    alias: boundedContext.alias || item.name,
                    importance: item.importance,
                    implementationStrategy: item.implementationStrategy
                };
                this.currentEditItem = null;
            },

            deleteBoundedContext(item) {
                if (confirm(this.$t(item.name+'를 삭제하시겠습니까?'))) {
                    const boundedContexts = this.resultDevideBoundedContext.boundedContexts;
                    const index = boundedContexts.findIndex(bc => bc.alias === item.name);
                    
                    if (index > -1) {
                        boundedContexts.splice(index, 1);
                        
                        this.resultDevideBoundedContext.relations = 
                            this.resultDevideBoundedContext.relations.filter(relation => 
                                relation.upStream.name !== item.name && 
                                relation.downStream.name !== item.name
                            );

                        if (this.resultDevideBoundedContext.explanations) {
                            this.resultDevideBoundedContext.explanations = 
                                this.resultDevideBoundedContext.explanations.filter(explanation => 
                                    explanation.sourceContext !== item.name && 
                                    explanation.targetContext !== item.name
                                );
                        }

                        this.mermaidNodes = this.generateNodes(this.resultDevideBoundedContext);
                        this.renderKey++;
                        this.tableRenderKey++;
                    }
                }
            },
        }
    }
</script>

<style scoped>
.v-tab-item {
    padding: 20px;
    display: flex;
    justify-content: center;
    flex-direction: column;
}
.requirement-subtable {
    background: transparent !important;
}
.requirement-text {
    white-space: normal;
}
</style>