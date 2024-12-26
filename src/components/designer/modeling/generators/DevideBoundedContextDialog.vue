<template>
    <v-card :key="Object.keys(resultDevideBoundedContext).length">
        <v-card-title>
            {{ $t('DevideBoundedContextDialog.boundedContextDivisionResult') }}
            <v-btn v-if="!isGenerating" text color="primary" @click="reGenerate()">{{ $t('DevideBoundedContextDialog.reGenerate') }}</v-btn>
            <v-btn v-if="isGenerating" text color="primary" @click="stop()">{{ $t('DevideBoundedContextDialog.stop') }}</v-btn>
            <v-btn :style="{'margin-left': 'auto'}" icon @click="closeDialog()">
                <v-icon>mdi-close</v-icon>
            </v-btn>
        </v-card-title>
        <v-card-subtitle>
            <div class="d-flex align-center">
                <div v-if="isGenerating">
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
            <v-card-title>{{ $t('DevideBoundedContextDialog.aspectsOfBoundedContexts') }}</v-card-title>
            <v-tabs v-model="activeTab">
                <v-tab v-for="(model, devisionAspect) in resultDevideBoundedContext" :key="devisionAspect"
                    style="text-transform: none;"
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
                <v-tab-item v-for="(model, devisionAspect) in resultDevideBoundedContext" :key="devisionAspect">
                    <div 
                        class="mermaid-container"
                        :class="{ 'selected': selectedAspect === devisionAspect }"
                        @click="selectAspect(devisionAspect)"
                    >
                        <vue-mermaid
                            v-if="mermaidNodes[devisionAspect]"
                            :id="`mermaid-${devisionAspect}`"
                            :key="devisionAspect"
                            :nodes="mermaidNodes[devisionAspect]"
                            type="graph TD"
                            @nodeClick="editNode"
                            :config="config"
                        ></vue-mermaid>
                    </div>
                    <v-card class="mt-4 pa-4" outlined>
                        <v-card-title class="text-subtitle-1">{{ $t('DevideBoundedContextDialog.analysis') }}</v-card-title>
                        <v-card-text>{{ resultDevideBoundedContext[devisionAspect].thoughts }}</v-card-text>
                        <v-textarea v-model="feedback" :label="$t('DevideBoundedContextDialog.feedback')" rows="3"></v-textarea>
                    </v-card>
                </v-tab-item>
            </v-tabs-items>

            <v-row class="ma-0 pa-0" align="center">
                <v-spacer></v-spacer>
                <v-btn @click="createModel()"
                    :disabled="selectedAspect === null"
                    class="auto-modeling-btn" 
                    color="primary"
                    :style="{'margin-top': '15px'}"
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
                feedback: ''
            }
        },
        mounted() {
        },
        watch: {
            resultDevideBoundedContext: {
                handler(newVal, oldVal) {
                    // 새로운 aspect가 추가될 때마다 해당 aspect의 노드 생성
                    Object.keys(newVal).forEach(aspect => {
                        if (newVal[aspect] && !this.mermaidNodes[aspect]) {
                            this.$set(this.mermaidNodes, aspect, this.generateNodes(newVal[aspect]));
                        }
                    });

                    if(Object.keys(newVal).length == 5){
                        this.isGenerating = false;
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
                        text: bc.name,
                        editable: true
                    });
                });
                
                // 관계 생성
                relations.forEach((rel) => {
                    const sourceIndex = aspectData.findIndex(bc => bc.name === rel.upStream);
                    const targetIndex = aspectData.findIndex(bc => bc.name === rel.downStream);
                    
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
                this.$emit("stop");
            },
            reGenerate(){
                this.isGenerating = true;
                this.$emit("reGenerate");
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
.mermaid-container {
    padding: 16px;
    border: 2px solid transparent;
    border-radius: 8px;
    transition: all 0.3s ease;
    cursor: pointer;
    margin-top: 15px;
    text-align: center;
}

.mermaid-container:hover {
    background-color: rgba(0, 0, 0, 0.03);
}

.mermaid-container.selected {
    border-color: var(--v-primary-base);
    background-color: rgba(var(--v-primary-base), 0.05);
}
</style>