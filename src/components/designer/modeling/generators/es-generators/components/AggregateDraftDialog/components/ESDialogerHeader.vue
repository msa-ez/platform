<template>
    <v-card-title class="d-flex justify-space-between align-center" :style="{ color: isStandardTransformed ? '#2E7D32' : '#000000' }">
        <span>{{ isStandardTransformed ? $t('ModelDraftDialogForDistribution.standardTransformedAggregateDraft') : $t('ModelDraftDialogForDistribution.reconstructionAggregateDraft') }}</span>
    </v-card-title>
</template>

<script>
export default {
    name: 'es-dialoger-header',
    props: {
        boundedContextVersion: {
            type: Number,
            required: true
        },
        isStandardTransformed: {
            type: Boolean,
            required: true
        }
    }
}
</script>