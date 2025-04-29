<template>
    <v-card-title class="d-flex justify-space-between align-center">
        <span>{{ $t('ModelDraftDialogForDistribution.reconstructionAggregateDraft') }}</span>
        <div class="d-flex align-center">
            <v-btn @click="$emit('retry')" :disabled="isGenerateButtonDisabled" text icon class="pa-0 mr-2">
                <v-icon>mdi-refresh</v-icon>
            </v-btn>
            <v-btn @click="$emit('close')" text icon class="pa-0">
                <v-icon>mdi-close</v-icon>
            </v-btn>
        </div>
    </v-card-title>
</template>

<script>
export default {
    name: 'event-storming-header',
    props: {
        isGenerateButtonDisabled: {
            type: Boolean,
            required: true
        }
    }
}
</script>