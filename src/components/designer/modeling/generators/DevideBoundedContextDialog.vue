<template>
    <v-card :key="`bounded-context-${messageId}`" style="max-height: 2000px; overflow-y: auto;">
        <v-card-title>
            {{ $t('DevideBoundedContextDialog.boundedContextDivisionResult') }}
            <!-- <v-btn v-if="isGenerating" text color="primary" @click="stop()">Stop</v-btn> -->
            <!-- <v-btn :style="{'margin-left': 'auto'}" icon @click="closeDialog()">
                <v-icon>mdi-close</v-icon>
            </v-btn> -->
        </v-card-title>
        <v-card-subtitle>
            <div class="d-flex align-center">
                <div v-if="isGenerating && Object.keys(resultDevideBoundedContext).length < devisionAspect.length">
                    <p class="mb-0">{{ $t('DevideBoundedContextDialog.lodingMessage') }} ({{ Math.round(Object.keys(resultDevideBoundedContext).length / devisionAspect.length * 100) }}%)</p>
                </div>
                <div v-if="isStartMapping">
                    <p class="mb-0">{{ currentProcessingBoundedContext }} - {{ $t('DevideBoundedContextDialog.mappingMessage') }} ({{ processingRate }}%)</p>
                </div>
                <v-progress-circular
                    v-if="isGenerating || isStartMapping"
                    color="primary"
                    indeterminate
                    size="24"
                    class="ml-2"
                ></v-progress-circular>
            </div>
        </v-card-subtitle>

        <v-card-text v-if="Object.keys(resultDevideBoundedContext).length > 0">
            <v-tabs v-model="activeTab">
                <v-tab 
                    v-for="(model, devisionAspect) in resultDevideBoundedContext" 
                    :key="devisionAspect"
                    :disabled="(isGeneratingAspect && selectedAspect !== devisionAspect) || isStartMapping"
                >
                    {{ devisionAspect }} {{ $t('DevideBoundedContextDialog.aspect') }}
                </v-tab>
            </v-tabs>

            <v-tabs-items v-model="activeTab">
                <v-tab-item 
                    v-for="(model, devisionAspect) in resultDevideBoundedContext" 
                    :key="devisionAspect"
                >
                    <div
                        :class="{ 'selected': selectedAspect === devisionAspect }"
                        @click="selectAspect(devisionAspect)"
                    >
                        <div style="text-align: center;">
                            <vue-mermaid
                                v-if="mermaidNodes[devisionAspect]"
                                :id="`mermaid-${messageId}-${devisionAspect}-${getRenderKey(devisionAspect)}`"
                                :key="`mermaid-${messageId}-${devisionAspect}-${getRenderKey(devisionAspect)}`"
                                :nodes="mermaidNodes[devisionAspect]"
                                type="graph TD"
                                @nodeClick="editNode"
                                :config="config"
                            ></vue-mermaid>
                        </div>
                        
                        <!-- <v-card-title class="text-h6">{{ devisionAspect }} {{ $t('DevideBoundedContextDialog.analysis') }}</v-card-title> -->
                        <div>
                            <v-card-title class="text-subtitle-1 pa-0 pb-4">{{ $t('DevideBoundedContextDialog.reasonOfSeparation') }}</v-card-title>
                            <v-card-text class="pa-0 pb-4" align="left">{{ resultDevideBoundedContext[devisionAspect].thoughts }}</v-card-text>

                            <v-card-title v-if="summarizedResult.length > 0" class="pa-0 pb-0 text-subtitle-1">{{ $t('DevideBoundedContextDialog.summarizedResult') }}</v-card-title>
                            <v-card-text v-if="summarizedResult.length > 0" class="pa-0 pb-4" align="left">{{ summarizedResult }}</v-card-text>

                            <v-card-title class="pa-0 pb-0 text-subtitle-1">{{ $t('DevideBoundedContextDialog.descriptionOfEachBoundedContext') }}</v-card-title>
                            <v-card-text class="pa-0 pb-4" align="left">* {{ $t('DevideBoundedContextDialog.descriptionOfEditBoundedContext') }}</v-card-text>
                            <v-card class="pa-0 ma-0 mt-4" outlined>
                                <v-data-table
                                    :items="getGroupedBoundedContextRequirements(resultDevideBoundedContext[devisionAspect])"
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
                                    :items="resultDevideBoundedContext[devisionAspect].explanations" 
                                    :headers="explanationsHeaders" 
                                    :hide-default-footer="true"
                                ></v-data-table>
                            </v-card>
                        </div>
                    </div>
                </v-tab-item>
            </v-tabs-items>

            <v-card class="mt-4 pa-4" outlined>
                <v-textarea :disabled="isGenerating" v-model="feedback" label="Feedback" rows="3"></v-textarea>
                <v-row class="pa-0 ma-0">
                    <v-spacer></v-spacer>
                    <v-btn :disabled="feedback === '' || isGenerating || isStartMapping" class="auto-modeling-btn" @click="reGenerateAspect(selectedAspect)">
                        {{ selectedAspect }} {{ $t('DevideBoundedContextDialog.aspect') }} {{ $t('DevideBoundedContextDialog.reGenerate') }} 
                    </v-btn>
                </v-row>
            </v-card>
            <v-row class="pa-0 ma-0 pt-4">
                <v-spacer></v-spacer>
                <v-btn @click="reGenerate()"
                    :disabled="isGenerating || isStartMapping"
                >
                    <v-icon class="auto-modeling-btn-icon">mdi-refresh</v-icon>{{ $t('DevideBoundedContextDialog.reGenerate') }}
                </v-btn>
                <v-btn 
                    :disabled="selectedAspect === null || isGenerating || isStartMapping" 
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
            devisionAspect: {
                type: Array,
                default: () => [],
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
                selectedAspect: null,
                selectedResultDevideBoundedContext: {},
                isGenerating: true,
                isGeneratingAspect: false,
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
                aspectRenderKey: {},
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
                handler(newVal, oldVal) {
                    if(this.isStartMapping){
                        return;
                    }

                    // 새로운 aspect가 추가될 때마다 해당 aspect의 노드 생성
                    Object.keys(newVal).forEach(aspect => {
                        if (newVal[aspect] && (this.mermaidNodes[aspect] == null || this.mermaidNodes[aspect].length == 0)) {
                            this.$set(this.mermaidNodes, aspect, this.generateNodes(newVal[aspect]));
                            this.incrementRenderKey(aspect);
                        }
                    });

                    if(Object.keys(newVal).length == this.devisionAspect.length){
                        this.isGenerating = false;
                        if(Object.keys(newVal[this.selectedAspect]).length == 0){
                            this.isGenerating = true;
                        }else if (Object.keys(newVal[this.selectedAspect]).length > 0) {
                            // 선택된 aspect의 노드만 업데이트
                            const updatedNodes = this.generateNodes(newVal[this.selectedAspect]);
                            if (JSON.stringify(this.mermaidNodes[this.selectedAspect]) !== JSON.stringify(updatedNodes)) {
                                this.$set(this.mermaidNodes, this.selectedAspect, updatedNodes);
                                this.incrementRenderKey(this.selectedAspect);
                            }
                            this.isGeneratingAspect = false;
                        }
                    }else if(Object.keys(newVal).length > 0 && Object.keys(newVal).length < this.devisionAspect.length){
                        this.isGenerating = true;
                    }
                },
                deep: true
            },
            activeTab: {
                handler(newVal) {
                    if (newVal !== null) {
                        const aspect = Object.keys(this.resultDevideBoundedContext)[newVal];
                        this.selectAspect(aspect);

                        let isEmptyRequirements = true;
                        this.resultDevideBoundedContext[aspect].boundedContexts.forEach(bc => {
                            if(bc.requirements.length > 0){
                                isEmptyRequirements = false;
                            }
                        });

                        // 아직 원문 매핑이 안된 경우 원문 매핑 진행
                        if(isEmptyRequirements && Object.keys(this.resultDevideBoundedContext).length == this.devisionAspect.length){
                            // this.$emit("mappingRequirements", aspect);
                        }
                    }
                }
            }
        },
        methods: {
            generateNodes(aspect) {
                const nodes = [];
                const aspectData = aspect.boundedContexts;
                const relations = aspect.relations;
                
                // 노드 생성
                aspectData.forEach((bc, index) => {
                    nodes.push({
                        id: `BC${index}`,
                        text: bc.alias,
                        editable: true,
                        edgeType: 'stadium'
                    });
                });
                
                // 관계 생성
                relations.forEach((rel) => {
                    const sourceIndex = aspectData.findIndex(bc => bc.name === rel.upStream.name);
                    const targetIndex = aspectData.findIndex(bc => bc.name === rel.downStream.name);
                    
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

            generateAllNodes(data) {
                const aspects = [
                    'Domain',
                    'Organizational',
                    'Persona',
                    'Transaction/Performance',
                    'Infrastructure'
                ];
                
                const allNodes = {};
                
                aspects.forEach(aspectName => {
                    if (data[aspectName]) {
                        allNodes[aspectName] = this.generateNodes(data[aspectName]);
                    }
                });
                
                return allNodes;
            },

            editNode(node) {
                console.log("node clicked: ", node);
            },

            createModel(){
                this.$emit("createModel", this.selectedResultDevideBoundedContext);
            },

            selectAspect(aspect) {
                this.selectedAspect = aspect;
                this.selectedResultDevideBoundedContext = this.resultDevideBoundedContext[aspect];
            },

            closeDialog(){
                this.$emit("closeDialog");
            },

            stop(){
                this.isGenerating = false;
                this.mermaidNodes = {};
                this.incrementRenderKey('all');
                this.$emit("stop");
            },

            reGenerate(){
                this.isGenerating = true;
                this.feedback = '';
                this.mermaidNodes = {};
                this.incrementRenderKey('all');
                this.$emit("reGenerate");
            },

            reGenerateAspect(aspect){
                this.isGenerating = true;
                this.isGeneratingAspect = true;
                // this.mermaidNodes[aspect] = [];
                this.incrementRenderKey(aspect);
                this.$emit("reGenerateAspect", aspect, this.feedback, this.messageId);
                this.feedback = '';
            },

            getGroupedBoundedContextRequirements(aspectData) {
                if (!aspectData || !aspectData.boundedContexts) return [];
                return aspectData.boundedContexts.map(bc => ({
                    name: bc.alias,
                    originalName: bc.alias,
                    importance: bc.importance,
                    implementationStrategy: bc.implementationStrategy,
                    requirements: bc.requirements.map(req => ({
                        type: req.type || '',
                        text: req.text || ''
                    }))
                }));
            },

            getBoundedContextRequirements(aspectData) {
                if (!aspectData || !aspectData.boundedContexts) return [];
                return aspectData.boundedContexts.flatMap(bc => {
                    const rows = [];
                    bc.requirements.forEach(req => {
                        rows.push({
                            name: bc.alias,
                            requirements: req.text
                        });
                    });
                    return rows;
                });
            },

            getRenderKey(aspect) {
                return this.aspectRenderKey[aspect] || 0;
            },

            incrementRenderKey(aspect) {
                const aspects = [
                    'Domain',
                    'Organizational',
                    'Persona',
                    'Transaction/Performance',
                    'Infrastructure'
                ];

                if(aspect == 'all'){
                    aspects.forEach(aspect => {
                        this.$set(this.aspectRenderKey, aspect, (this.aspectRenderKey[aspect] || 0) + 1);
                    });
                }else{
                    this.$set(this.aspectRenderKey, aspect, (this.aspectRenderKey[aspect] || 0) + 1);
                }
            },

            saveItemEdit(item, field) {
                const boundedContextIndex = this.resultDevideBoundedContext[this.selectedAspect].boundedContexts
                    .findIndex(bc => bc.alias === item.originalName || bc.alias === item.name);
                
                if (boundedContextIndex > -1) {
                    const boundedContext = this.resultDevideBoundedContext[this.selectedAspect].boundedContexts[boundedContextIndex];
                    const oldName = boundedContext.name;
                    const oldAlias = boundedContext.alias;
                    
                    switch(field) {
                        case 'name':
                            if (!this.editedFields.name || !this.editedFields.alias) {
                                return;
                            }

                            // First update all references in relations
                            this.resultDevideBoundedContext[this.selectedAspect].relations = 
                                this.resultDevideBoundedContext[this.selectedAspect].relations.map(relation => {
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

                            // Update explanations if they exist
                            if (this.resultDevideBoundedContext[this.selectedAspect].explanations) {
                                this.resultDevideBoundedContext[this.selectedAspect].explanations = 
                                    this.resultDevideBoundedContext[this.selectedAspect].explanations.map(explanation => {
                                        if (explanation.sourceContext === oldAlias) {
                                            explanation.sourceContext = this.editedFields.alias;
                                        }
                                        if (explanation.targetContext === oldAlias) {
                                            explanation.targetContext = this.editedFields.alias;
                                        }
                                        return explanation;
                                    });
                            }

                            // Then update the bounded context
                            boundedContext.name = this.editedFields.name;
                            boundedContext.alias = this.editedFields.alias;
                            break;

                        // ... rest of the cases ...
                    }

                    // Finally regenerate mermaid diagram
                    this.$set(this.mermaidNodes, this.selectedAspect, 
                        this.generateNodes(this.resultDevideBoundedContext[this.selectedAspect]));
                    this.incrementRenderKey(this.selectedAspect);
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
                const boundedContext = this.resultDevideBoundedContext[this.selectedAspect].boundedContexts
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
                const boundedContext = this.resultDevideBoundedContext[this.selectedAspect].boundedContexts
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
                    // Find and remove the bounded context
                    const boundedContexts = this.resultDevideBoundedContext[this.selectedAspect].boundedContexts;
                    const index = boundedContexts.findIndex(bc => bc.alias === item.name);
                    
                    if (index > -1) {
                        // Remove the bounded context
                        boundedContexts.splice(index, 1);
                        
                        // Remove any relations that involve this bounded context
                        this.resultDevideBoundedContext[this.selectedAspect].relations = 
                            this.resultDevideBoundedContext[this.selectedAspect].relations.filter(relation => 
                                relation.upStream.name !== item.name && 
                                relation.downStream.name !== item.name
                            );

                        // Update explanations if they exist
                        if (this.resultDevideBoundedContext[this.selectedAspect].explanations) {
                            this.resultDevideBoundedContext[this.selectedAspect].explanations = 
                                this.resultDevideBoundedContext[this.selectedAspect].explanations.filter(explanation => 
                                    explanation.sourceContext !== item.name && 
                                    explanation.targetContext !== item.name
                                );
                        }

                        // Regenerate mermaid diagram
                        this.$set(this.mermaidNodes, this.selectedAspect, 
                            this.generateNodes(this.resultDevideBoundedContext[this.selectedAspect]));
                        this.incrementRenderKey(this.selectedAspect);
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