<template>
    <div>
        <v-card v-if="activeTab !== null && !isStandardTransformed && !isTransforming" class="ma-4 pa-4" outlined>
            <v-textarea v-model="localFeedback" label="Feedback" rows="3"></v-textarea>
            <v-row class="pa-0 ma-0">
                <v-spacer></v-spacer>
                <v-btn
                    :disabled="isGenerationInProgress || (!localFeedback && !currentBCHasEmptyOptions)"
                    class="auto-modeling-btn"
                    @click="handleFeedback"
                >
                    {{ getBoundedContextDisplayName(draftOptions[activeTab]) }}
                    {{ $t('ModelDraftDialogForDistribution.reGenerate') }}
                </v-btn>
            </v-row>
        </v-card>

        <v-row class="ma-0 pa-4">
            <v-tooltip bottom :disabled="!isGenerateButtonDisabled || isGenerationInProgress">
                <template v-slot:activator="{ on, attrs }">
                    <div v-bind="attrs" v-on="on" style="width:100%;">
                        <v-btn
                            @click="$emit('generateFromDraft')"
                            :disabled="isGenerateButtonDisabled"
                            block
                            color="primary"
                        >
                            {{ $t('ModelDraftDialogForDistribution.createEventStormingModelCanvas') }}
                        </v-btn>
                    </div>
                </template>
                <span>일부 BC 의 초안이 비어있어 진행할 수 없습니다. 해당 BC 를 재생성하거나 전체를 다시 시도해주세요.</span>
            </v-tooltip>
        </v-row>
    </div>
</template>

<script>
export default {
    name: 'event-storming-footer',
    props: {
        isGenerateButtonDisabled: {
            type: Boolean,
            required: true
        },
        draftOptions: {
            type: Array,
            required: true
        },
        activeTab: {
            type: Number,
            required: false
        },
        feedback: {
            type: String,
            required: true
        },
        isStandardTransformed: {
            type: Boolean,
            default: () => false,
            required: false
        },
        isTransforming: {
            type: Boolean,
            default: () => false,
            required: false
        },
        // "생성이 진행 중" — feedback 만 막아야 하는 케이스
        isGenerationInProgress: {
            type: Boolean,
            default: () => false,
            required: false
        },
        // 활성 BC 가 옵션 0 개로 끝난 silent failure 상태
        currentBCHasEmptyOptions: {
            type: Boolean,
            default: () => false,
            required: false
        }
    },
    data() {
        return {
            localFeedback: this.feedback
        }
    },
    methods: {
        handleFeedback() {
            this.$emit('feedbackFromDraft', 
                this.draftOptions[this.activeTab], 
                this.localFeedback,
                this.draftOptions
            )
        },
        getBoundedContextDisplayName(boundedContextInfo) {
            return (boundedContextInfo.boundedContextAlias) 
                ? boundedContextInfo.boundedContextAlias 
                : (boundedContextInfo.boundedContext.charAt(0).toUpperCase() + boundedContextInfo.boundedContext.slice(1))
        }
    },
    watch: {
        feedback(newVal) {
            this.localFeedback = newVal
        }
    }
}
</script>