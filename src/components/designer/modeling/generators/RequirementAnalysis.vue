<template>
    <div class="pa-4">
        <template v-if="isAnalizing">
            <div class="generating-state">
                <v-progress-circular
                    indeterminate
                    color="primary"
                    size="24"
                    class="mr-2"
                ></v-progress-circular>
                <span v-if="processingRate==0 || processingRate==100">{{ $t('RequirementAnalysis.validateRequirements') }}</span>
                <span v-else>{{ $t('RequirementAnalysis.validateRequirements') }} ({{ processingRate }}%)</span>
            </div>
        </template>
        <template>
            <!--분석 결과가 있는 경우-->
            <div v-if="analysisResult && analysisResult.type === 'ANALYSIS_RESULT'" class="event-storming-wrapper">
                <div>
                    <h2 class="event-storming-title pb-2">
                        <v-row class="ma-0 pa-0">
                            <v-icon left>mdi-check-circle</v-icon>
                            <div>{{ $t('RequirementAnalysis.requirementAnalysisResult') }}</div>
                        </v-row>
                    </h2>
                    <div class="pb-2">
                        <div v-if="isAnalizing" class="event-storming-subtitle">{{ $t('RequirementAnalysis.processAndEventFlowExtraction') }}</div>
                        <div v-else class="event-storming-subtitle">{{ $t('RequirementAnalysis.processAndEventFlowExtracted') }}</div>
                    </div>
                </div>

                <div class="event-storming-canvas">
                    <event-storming-model-canvas
                        v-model="analysisResult.content"
                        :projectName="analysisResult.projectName"
                        :labs-id="null"
                        :is-original-model="false"
                    />
                </div>

                <div class="event-storming-footer">
                    <v-btn 
                        :disabled="isAnalizing || isGeneratingBoundedContext || isStartMapping || isSummarizeStarted"
                        @click="showBCGenerationOption()" 
                        class="auto-modeling-btn" 
                        color="primary"
                    >
                        {{ $t('RequirementAnalysis.createBoundedContext') }}
                    </v-btn>
                </div>
            </div>

            <!-- 가이드가 필요한 경우 -->
            <div v-else-if="analysisResult && analysisResult.type === 'ENHANCEMENT_GUIDE'" class="enhancement-guide">
                <v-alert
                    type="warning"
                    prominent
                    border="left"
                    colored-border
                    class="guide-header"
                >
                    {{ $t('RequirementAnalysis.requirementImprovementNeeded') }}
                </v-alert>

                <div class="quality-criteria-section">
                    <template v-for="(items, criterion) in analysisResult.content.missingElements">
                        <div v-if="items.length" :key="criterion" class="criterion-card">
                            <div class="criterion-header">
                                <v-icon color="error" class="mr-2">mdi-alert-circle</v-icon>
                                {{ getCriterionTitle(criterion) }}
                            </div>
                            <ul class="criterion-items">
                                <li v-for="item in items" :key="item">{{ item }}</li>
                            </ul>
                        </div>
                    </template>
                </div>

                <div class="recommendations-section mt-4">
                    <v-card outlined>
                        <v-card-title class="recommendations-title">
                            <v-icon color="primary" class="mr-2">mdi-lightbulb</v-icon>
                            {{ $t('RequirementAnalysis.improvementRecommendations') }}
                        </v-card-title>
                        <v-card-text>
                            <div v-if="analysisResult.content.recommendations.immediate">
                                <h4 class="mb-2">{{ $t('RequirementAnalysis.immediateImprovements') }}</h4>
                                <ul>
                                    <li v-for="item in analysisResult.content.recommendations.immediate" 
                                        :key="item" 
                                        class="mb-2">
                                        {{ item }}
                                    </li>
                                </ul>
                            </div>

                            <div v-if="analysisResult.content.recommendations.questions" class="mt-4">
                                <h4 class="mb-2">{{ $t('RequirementAnalysis.reviewRequiredItems')}}</h4>
                                <v-chip-group column>
                                    <v-chip v-for="question in analysisResult.content.recommendations.questions"
                                        :key="question"
                                        outlined
                                        class="ma-1">
                                        <v-icon left small>mdi-help-circle</v-icon>
                                        {{ question }}
                                    </v-chip>
                                </v-chip-group>
                            </div>
                        </v-card-text>
                    </v-card>
                </div>

                <div v-if="analysisResult.content.impactAreas" class="impact-areas-section mt-4">
                    <v-card outlined>
                        <v-card-title class="impact-title">
                            <v-icon color="info" class="mr-2">mdi-target</v-icon>
                            {{ $t('RequirementAnalysis.impactAreas') }}
                        </v-card-title>
                        <v-card-text>
                            <v-chip-group>
                                <v-chip v-for="area in analysisResult.content.impactAreas"
                                    :key="area"
                                    color="info"
                                    text-color="white"
                                    small>
                                    {{ area }}
                                </v-chip>
                            </v-chip-group>
                        </v-card-text>
                    </v-card>
                </div>
            </div>
        </template>
    </div>
</template>

<script>
import VueMermaid from '@/components/VueMermaid.vue';
const EventStormingModelCanvas = () => import('@/components/designer/es-modeling/EventStormingModelCanvas.vue');

export default {
    name: 'RequirementAnalysis',
    components: {
        VueMermaid,
        EventStormingModelCanvas
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
        isAnalizing: {
            type: Boolean,
            required: false
        },
        isGeneratingBoundedContext: {
            type: Boolean,
            required: false
        },
        isStartMapping: {
            type: Boolean,
            required: false
        },
        isSummarizeStarted: {
            type: Boolean,
            required: false
        },
        processingRate: {
            type: Number,
            required: false,
            default: 0
        }
    },
    data() {
        return {
        }
    },
    methods: {
        showBCGenerationOption() {
            this.$emit('showBCGenerationOption');
        },
        getCriterionTitle(criterion) {
            const titles = {
                clarity: '명확성',
                completeness: '완전성',
                consistency: '일관성',
                verifiability: '검증 가능성',
                modifiability: '수정 용이성',
                traceability: '추적 가능성'
            };
            return titles[criterion] || criterion;
        }
    }
}
</script>

<style>

.enhancement-guide {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 20px;
}

.guide-header {
    margin-bottom: 24px;
}

.criterion-card {
    background: white;
    border-radius: 4px;
    padding: 16px;
    margin-bottom: 16px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.criterion-header {
    font-size: 16px;
    font-weight: 500;
    color: #333;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
}

.criterion-items {
    padding-left: 20px;
    margin: 8px 0;
}

.criterion-items li {
    margin-bottom: 8px;
    color: #666;
}

.recommendations-title, .impact-title {
    background-color: #f5f5f5;
    padding: 12px 16px;
}

.recommendations-section, .impact-areas-section {
    margin-top: 24px;
}

.quality-criteria-section {
    margin-bottom: 24px;
}

.event-storming-wrapper {
    width: 100%;
    height: 100vh;
    max-height: 900px;
    position: relative;
    display: flex;
    flex-direction: column;
}

.event-storming-title {
    font-size: 1.5rem;
    color: #333;
}

.event-storming-subtitle {
    color: #666;
    font-size: 1rem;
}

.event-storming-canvas {
    flex: 1;
    position: relative;
    min-height: 0;
    border: 1px solid #eee;
    border-radius: 4px;
    background: white;
    margin: 10px 0;
}

.event-storming-footer {
    padding-top: 20px;
    display: flex;
    justify-content: flex-end;
}

.auto-modeling-btn {
    min-width: 150px;
}
</style>