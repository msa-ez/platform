<template>
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
</template>

<script>
export default {
    name: 'event-storming-footer',
    props: {
        isGenerateButtonDisabled: {
            type: Boolean,
            required: true
        }
    }
}
</script>