<template>
    <div>
        <v-card v-if="activeTab !== null" class="ma-4 pa-4" outlined>
            <v-textarea v-model="localFeedback" label="Feedback" rows="3"></v-textarea>
            <v-row class="pa-0 ma-0">
                <v-spacer></v-spacer>
                <v-btn 
                    :disabled="isGenerateButtonDisabled || !localFeedback" 
                    class="auto-modeling-btn" 
                    @click="handleFeedback"
                >
                    {{ getBoundedContextDisplayName(draftOptions[activeTab]) }} 
                    {{ $t('ModelDraftDialogForDistribution.reGenerate') }} 
                </v-btn>
            </v-row>
        </v-card>

        <v-row class="ma-0 pa-4">
            <v-btn 
                @click="$emit('generateFromDraft')" 
                :disabled="isGenerateButtonDisabled"
                block 
                color="primary" 
            >
                {{ $t('ModelDraftDialogForDistribution.createEventStormingModelCanvas') }}
            </v-btn>
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