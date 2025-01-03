<template>
    <v-card :key="Object.keys(resultDevideBoundedContext).length">
        <v-card-title>
            {{ $t('DevideBoundedContextDialog.boundedContextDivisionResult') }}
            <!-- <v-btn v-if="isGenerating" text color="primary" @click="stop()">Stop</v-btn> -->
            <!-- <v-btn :style="{'margin-left': 'auto'}" icon @click="closeDialog()">
                <v-icon>mdi-close</v-icon>
            </v-btn> -->
        </v-card-title>
        <v-card-subtitle>
            <div class="d-flex align-center">
                <div v-if="isGenerating && Object.keys(resultDevideBoundedContext).length < 5">
                    <p class="mb-0">{{ $t('DevideBoundedContextDialog.lodingMessage') }} ({{ Object.keys(resultDevideBoundedContext).length / 5 * 100 }}%)</p>
                </div>
                <v-progress-circular
                    v-if="isGenerating"
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
                    :disabled="isGeneratingAspect && selectedAspect !== devisionAspect"
                >
                    {{ devisionAspect }} {{ $t('DevideBoundedContextDialog.aspect') }}
                    <v-icon v-if="selectedAspect === devisionAspect" 
                        color="primary" 
                        small 
                        class="ml-2">
                        mdi-check
                    </v-icon>
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
                                :id="`mermaid-${devisionAspect}-${getRenderKey(devisionAspect)}`"
                                :key="`mermaid-${devisionAspect}-${getRenderKey(devisionAspect)}`"
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

                            <v-card-title class="pa-0 pb-0 text-subtitle-1">{{ $t('DevideBoundedContextDialog.descriptionOfEachBoundedContext') }}</v-card-title>
                            <v-card class="pa-0 ma-0 mt-4" outlined>
                                <v-data-table
                                    :items="getGroupedBoundedContextRequirements(resultDevideBoundedContext[devisionAspect])"
                                    :headers="boundedContextHeaders"
                                    :hide-default-footer="true"
                                    show-expand
                                    :expand-icon="expandIcon"
                                    :single-expand="false"
                                    item-key="name"
                                >
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
                    <v-btn :disabled="feedback === '' || isGenerating" class="auto-modeling-btn" @click="reGenerateAspect(selectedAspect)">
                        {{ selectedAspect }} {{ $t('DevideBoundedContextDialog.aspect') }} {{ $t('DevideBoundedContextDialog.reGenerate') }} 
                    </v-btn>
                </v-row>
            </v-card>
            <v-row class="pa-0 ma-0 pt-4">
                <v-spacer></v-spacer>
                <v-btn @click="reGenerate()"
                    :disabled="isGenerating"
                >
                    <v-icon class="auto-modeling-btn-icon">mdi-refresh</v-icon>{{ $t('DevideBoundedContextDialog.reGenerate') }}
                </v-btn>
                <v-btn 
                    :disabled="selectedAspect === null || isGenerating" 
                    class="auto-modeling-btn" 
                    color="primary" 
                    @click="createModel()"
                >
                    {{ $t('DevideBoundedContextDialog.createModel') }}
                    <v-icon class="auto-modeling-btn-icon">mdi-arrow-right</v-icon>
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
                    { text: '', value: 'data-table-expand' }
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
                aspectRenderKey: {}
            }
        },
        mounted() {
        },
        watch: {
            resultDevideBoundedContext: {
                handler(newVal, oldVal) {
                    // 새로운 aspect가 추가될 때마다 해당 aspect의 노드 생성
                    Object.keys(newVal).forEach(aspect => {
                        if (newVal[aspect] && (this.mermaidNodes[aspect] == null || this.mermaidNodes[aspect].length == 0)) {
                            this.$set(this.mermaidNodes, aspect, this.generateNodes(newVal[aspect]));
                            this.incrementRenderKey(aspect);
                        }
                    });

                    if(Object.keys(newVal).length == 5){
                        this.isGenerating = false;
                        if(this.selectedAspect && Object.keys(newVal[this.selectedAspect]).length == 0){
                            this.isGenerating = true;
                        }else if (this.selectedAspect) {
                            // 선택된 aspect의 노드만 업데이트
                            const updatedNodes = this.generateNodes(newVal[this.selectedAspect]);
                            if (JSON.stringify(this.mermaidNodes[this.selectedAspect]) !== JSON.stringify(updatedNodes)) {
                                this.$set(this.mermaidNodes, this.selectedAspect, updatedNodes);
                                this.incrementRenderKey(this.selectedAspect);
                            }
                            this.isGeneratingAspect = false;
                        }
                    }else if(Object.keys(newVal).length > 0 && Object.keys(newVal).length < 5){
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
                this.mermaidNodes[aspect] = [];
                this.incrementRenderKey(aspect);
                this.$emit("reGenerateAspect", aspect, this.feedback);
            },
            getGroupedBoundedContextRequirements(aspectData) {
                if (!aspectData || !aspectData.boundedContexts) return [];
            
                return aspectData.boundedContexts.map(bc => ({
                    name: bc.alias,
                    requirements: bc.requirements.map(req => ({
                        type: req.type,
                        text: req.text
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
            }
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