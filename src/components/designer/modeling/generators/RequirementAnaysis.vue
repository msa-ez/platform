<template>
    <div class="requirement-analysis">
        <template v-if="isGenerating">
            <div class="generating-state">
                <v-progress-circular
                    indeterminate
                    color="primary"
                    size="24"
                    class="mr-2"
                ></v-progress-circular>
                <span>요구사항 검증 중...</span>
            </div>
        </template>
        <template v-else>
            <!-- 분석 결과가 있는 경우 -->
            <div v-if="analysisResult && analysisResult.type === 'ANALYSIS_RESULT'" class="process-flow-diagram">
                <div style="text-align: center;">
                    <vue-mermaid
                        :id="`process-diagram-${uniqueId}-${renderKey}`"
                        :key="`process-diagram-${uniqueId}-${renderKey}`"
                        :nodes="mermaidNodes"
                        type="graph TD"
                        :config="config"
                    ></vue-mermaid>
                </div>
            </div>

            <!-- 가이드가 필요한 경우 -->
            <div v-else-if="analysisResult && analysisResult.type === 'ENHANCEMENT_GUIDE'" class="enhancement-guide">
                <div class="guide-title">요구사항 개선 가이드</div>
                
                <div class="missing-elements">
                    <h3>누락된 요소</h3>
                    <ul v-if="analysisResult.content.missingElements">
                        <li v-for="(items, category) in analysisResult.content.missingElements" :key="category">
                            <strong>{{ category }}:</strong>
                            <ul>
                                <li v-for="item in items" :key="item">{{ item }}</li>
                            </ul>
                        </li>
                    </ul>
                </div>

                <div class="recommendations">
                    <h3>개선 권장사항</h3>
                    <ul v-if="analysisResult.content.recommendations.immediate">
                        <li v-for="item in analysisResult.content.recommendations.immediate" :key="item">
                            {{ item }}
                        </li>
                    </ul>
                </div>

                <div class="questions">
                    <h3>검토해야 할 질문들</h3>
                    <ul v-if="analysisResult.content.recommendations.questions">
                        <li v-for="question in analysisResult.content.recommendations.questions" :key="question">
                            {{ question }}
                        </li>
                    </ul>
                </div>
            </div>
        </template>
    </div>
</template>

<script>
import VueMermaid from '@/components/VueMermaid.vue';

export default {
    name: 'RequirementAnaysis',
    components: {
        VueMermaid
    },
    props: {
        analysisResult: {
            type: Object,
            required: true,
            default: () => ({
            type: '',
            content: { processes: [] }
        })
        },
        isGenerating: {
            type: Boolean,
            required: false
        }
    },
    data() {
        return {
            uniqueId: this.generateUniqueId(),
            renderKey: 0,
            mermaidNodes: [],
            config: {
                theme: 'default',
                startOnLoad: false,
                securityLevel: 'loose',
                flowchart: {
                    htmlLabels: true,
                    curve: 'basis',
                    rankSpacing: 100,
                    nodeSpacing: 100,
                    padding: 15
                }
            }
        }
    },
    watch: {
        analysisResult: {
            handler() {
                this.updateNodes();
            },
            deep: true
        }
    },
    methods: {
        generateUniqueId() {
            return 'diagram-' + Math.random().toString(36).substr(2, 9);
        },

        findMatchingProcess(nextProcessName, processes) {
            return processes.find(p => {
                const targetNameLower = nextProcessName.toLowerCase();
                const processNameLower = p.name.toLowerCase();
                return processNameLower === targetNameLower || 
                    processNameLower.includes(targetNameLower) || 
                    targetNameLower.includes(processNameLower);
            });
        },

        updateNodes() {
            if (!this.analysisResult || !this.analysisResult.content || !this.analysisResult.content.processes) {
                this.mermaidNodes = [];  // 빈 배열 반환
                return;
            }

            const processes = this.analysisResult.content.processes;
            const nodes = [];

            // 1. 메인 프로세스 노드들 생성
            processes.forEach((process, index) => {
                nodes.push({
                    id: `P${index}`,
                    text: process.name,
                    group: process.department,
                    next: [],
                    link: [],
                    style: 'fill:white,stroke:#333,stroke-width:2px'
                });
            });

            // 2. 프로세스 간 연결 관계 처리
            processes.forEach((process, index) => {
                if (process.nextProcesses && process.nextProcesses.length) {
                    process.nextProcesses.forEach(nextProcess => {
                        const matchingProcess = this.findMatchingProcess(nextProcess, processes);
                        const inputs = process.inputs && process.inputs.length ? process.inputs[0] : '';
                        const outputs = process.outputs && process.outputs.length ? process.outputs[0] : '';
                        const currentNode = nodes.find(n => n.id === `P${index}`);
                        
                        if (matchingProcess) {
                            // 매칭되는 메인 프로세스가 있는 경우
                            const targetIndex = processes.indexOf(matchingProcess);
                            currentNode.next.push(`P${targetIndex}`);
                            currentNode.link.push(`-->|"Input: ${inputs} / Output: ${outputs}"|`);
                        } else {
                            // 매칭되는 메인 프로세스가 없는 경우에만 작은 노드 생성
                            const safeId = nextProcess.replace(/[^가-힣a-zA-Z0-9]/g, '');
                            nodes.push({
                                id: safeId,
                                text: nextProcess,
                                style: 'fill:lightgray,stroke:#333'
                            });
                            currentNode.next.push(safeId);
                            currentNode.link.push(`-->|"Input: ${inputs} / Output: ${outputs}"|`);
                        }
                    });
                }
            });

            // 3. 부서별 그룹핑 정보 추가
            const departments = [...new Set(processes.map(p => p.department))];
            nodes.subgraphs = departments.map(dept => ({
                title: dept,
                nodes: nodes.filter(n => n.group === dept).map(n => n.id)
            }));

            this.mermaidNodes = nodes;
            this.renderKey++;
        }
    }
}
</script>

<style>
.requirement-analysis {
    padding: 20px;
}

.process-flow-diagram {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.enhancement-guide {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 20px;
}

.guide-title {
    color: #2c3e50;
    font-size: 1.2em;
    margin-bottom: 20px;
}

h3 {
    color: #2c3e50;
    margin: 20px 0 10px;
    font-size: 1.1em;
}

.missing-elements, .recommendations, .questions {
    margin-bottom: 20px;
}
</style>