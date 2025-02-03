<template>
    <v-card
        @click="selectedCard(optionIndex, optionInfo, boundedContextInfo.boundedContext)"
        :class="isSelectedCard ? 'model-draft-dialog-selected-card': ''"
        :disabled="isDisabled"
    >
        <v-card-title class="d-flex justify-space-between align-center pa-4 option-title">
            <div class="d-flex align-center">
                <v-chip
                    color="primary"
                    small
                    class="mr-2"
                >
                    OPTION {{ optionIndex + 1 }}
                </v-chip>
                <v-chip
                    v-if="optionInfo.isAIRecommended"
                    color="info"
                    x-small
                    class="mr-2"
                >
                    <v-icon x-small left>mdi-robot</v-icon>
                    AI 추천
                </v-chip>
            </div>
            <v-chip
                v-if="isSelectedCard"
                color="success"
                x-small
                label
            >
                선택됨
            </v-chip>
        </v-card-title>
        
        <v-card-text class="pa-0">
            <div v-if="optionInfo.structure" class="mb-4">
                <v-row class="ma-0 pa-0">
                    <v-col v-for="(aggregate, index) in optionInfo.structure" :key="index"  
                        class="pa-2 ma-2 rounded-lg draft-aggregate-box d-inline-block"
                    >
                        <div class="d-flex flex-column mb-2">
                            <span style="margin-bottom:-5px;">&lt;&lt; Aggregate Root &gt;&gt;</span>
                            <strong>{{ (aggregate.aggregate && aggregate.aggregate.alias) ? aggregate.aggregate.alias : '' }}</strong>
                        </div>
                        <div>
                            <div v-if="aggregate.entities && aggregate.entities.length > 0" class="mb-2">
                                <span>&lt;&lt; Entities &gt;&gt;</span>
                                <div v-for="(entity, index) in aggregate.entities" :key="index"
                                    class="draft-aggregate-box-text"
                                >{{ (entity && entity.alias) ? entity.alias : '' }}</div>
                            </div>
                            <div v-if="aggregate.valueObjects && aggregate.valueObjects.length > 0">
                                <span>&lt;&lt; Value Objects &gt;&gt;</span> 
                                <div v-for="(valueObject, index) in aggregate.valueObjects" :key="index"
                                    class="draft-aggregate-box-text">
                                    {{ (valueObject && valueObject.alias) ? valueObject.alias : '' }}
                                    <v-chip
                                        v-if="valueObject.referencedAggregate"
                                        x-small
                                        class="ml-2"
                                        color="info"
                                        outlined
                                    >
                                        <v-icon x-small left>mdi-link-variant</v-icon>
                                        {{ valueObject.referencedAggregate.alias }}
                                    </v-chip>
                                </div>
                            </div>
                        </div>
                    </v-col>
                </v-row>
            </div>

            <div class="pl-4 pr-4 pb-4">
                <div v-if="optionInfo.pros && Object.keys(optionInfo.pros).length > 0">
                    <h4>{{ $t('ModelDraftDialogForDistribution.pros') }}</h4>
                    <v-simple-table dense class="analysis-table">
                        <tbody>
                            <tr v-for="(value, key) in optionInfo.pros" :key="`pros-${key}`">
                                <td class="analysis-key text-capitalize">{{ key }}</td>
                                <td class="analysis-value">{{ value }}</td>
                            </tr>
                        </tbody>
                    </v-simple-table>
                </div>

                <div v-if="optionInfo.cons && Object.keys(optionInfo.cons).length > 0">
                    <h4 class="mt-4">{{ $t('ModelDraftDialogForDistribution.cons') }}</h4>
                    <v-simple-table dense class="analysis-table">
                        <tbody>
                            <tr v-for="(value, key) in optionInfo.cons" :key="`cons-${key}`">
                                <td class="analysis-key text-capitalize">{{ key }}</td>
                                <td class="analysis-value">{{ value }}</td>
                            </tr>
                        </tbody>
                    </v-simple-table>
                </div>
            </div>
        </v-card-text>
    </v-card>
</template>

<script>
    export default {
        name: 'aggregate-draft-dialog',
        props: {
            boundedContextInfo: {
                type: Object,
                default: () => ({}),
                required: false
            },

            optionIndex: {
                type: Number,
                default: 0,
                required: false
            },

            optionInfo: {
                type: Object,
                default: () => ({}),
                required: false
            },

            isSelectedCard: {
                type: Boolean,
                default: false,
                required: false
            },

            isDisabled: {
                type: Boolean,
                default: false,
                required: false
            }
        },
        methods: {
            selectedCard(optionIndex, optionInfo, boundedContextName){
                this.$emit('onCardSelected', optionIndex, optionInfo, boundedContextName);
            }
        }
    }
</script>

<style scoped>
.analysis-table {
    background-color: transparent !important;
}
.analysis-table ::v-deep .v-data-table__wrapper {
    overflow-x: hidden;
}
.analysis-table ::v-deep table {
    width: 100%;
    border-spacing: 0;
}
.analysis-table ::v-deep tbody tr:hover {
    background-color: transparent !important;
}
.analysis-key {
    color: var(--v-primary-base);
    font-weight: 500;
    font-size: 0.9rem;
    width: 120px;
    vertical-align: top;
    padding: 4px 8px 4px 0 !important;
}
.analysis-value {
    font-size: 0.9rem;
    line-height: 1.4;
    padding: 4px 0 !important;
}
</style>