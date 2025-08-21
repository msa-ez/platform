<template>
    <div>
        <v-card v-if="activeTab !== null" class="ma-4 pa-4" outlined>
            <v-textarea v-model="localFeedback" label="Feedback" :placeholder="$t('ModelDraftDialogForDistribution.feedbackPlaceholder')" rows="3"></v-textarea>
            <v-row class="pa-0 ma-0">
                <v-spacer></v-spacer>
                <v-btn 
                    :disabled="isGenerateButtonDisabled || !localFeedback || !isEditable" 
                    class="auto-modeling-btn" 
                    @click="handleFeedback"
                >
                    {{ getBoundedContextDisplayName(draftOptions[activeTab]) }} 
                    {{ $t('ModelDraftDialogForDistribution.reGenerate') }} 
                </v-btn>
            </v-row>
        </v-card>

        <v-row class="ma-0 pa-4">
            <v-spacer></v-spacer>
            <v-btn 
                :disabled="isGenerateButtonDisabled || !isEditable" 
                class="auto-modeling-btn" 
                @click="$emit('retry')"
            >
                <v-icon class="auto-modeling-btn-icon">mdi-refresh</v-icon>
                {{ $t('ESDialoger.tryAgain') }}
            </v-btn>
            <v-btn 
                :disabled="isGenerateButtonDisabled || !isEditable" 
                class="auto-modeling-btn" 
                color="primary" 
                @click="$emit('generateFromDraft')"
            >
                {{ $t('ModelDraftDialogForDistribution.createEventStormingModelCanvas') }}
                <v-icon class="auto-modeling-btn-icon">mdi-arrow-right</v-icon>
            </v-btn>
        </v-row>
    </div>
</template>

<script>
export default {
    name: 'es-dialoger-footer',
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
        isEditable: {
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