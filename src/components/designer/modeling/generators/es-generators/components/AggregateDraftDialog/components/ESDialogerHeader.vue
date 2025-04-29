<template>
    <v-card-title class="d-flex justify-space-between align-center">
        <span>{{ $t('ModelDraftDialogForDistribution.reconstructionAggregateDraft') }} - Version {{ boundedContextVersion }}</span>
    </v-card-title>
</template>

<script>
export default {
    name: 'es-dialoger-header',
    props: {
        boundedContextVersion: {
            type: Number,
            required: true
        }
    }
}
</script>