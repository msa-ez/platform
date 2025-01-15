<template>
    <v-card
        v-model="show"
        persistent
    >
        <v-card>
            <v-card-title class="headline">
                생성 옵션
            </v-card-title>
            
            <v-card-text>
                <v-container>
                    <v-row>
                        <v-col cols="12">
                            <div class="d-flex align-center">
                                <span class="mr-4">Number of Bounded Contexts</span>
                                <span class="font-weight-bold">{{ localOptions.numberOfBCs }}</span>
                            </div>
                            <v-slider
                                v-model="localOptions.numberOfBCs"
                                :min="1"
                                :max="50"
                                :tick-labels="tickLabels"
                                :tick-size="4"
                                ticks="always"
                                tick-label
                                class="mt-4"
                            ></v-slider>
                        </v-col>
                        
                        <v-col cols="12">
                            <v-select
                                v-model="localOptions.selectedAspects"
                                :items="availableAspects"
                                label="Select Aspects"
                                item-value="value"
                                multiple
                            ></v-select>
                        </v-col>

                        <v-col cols="12">
                            <v-textarea
                                v-model="localOptions.additionalOptions"
                                label="Additional requirements"
                                rows="3"
                                outlined
                            ></v-textarea>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>
            
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    color="primary"
                    @click="onConfirm"
                    :disabled="!isValid"
                >
                    Generate
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-card>
</template>

<script>
export default {
    name: 'bc-generation-options-dialog',
    
    props: {
    },

    data() {
        return {
            localOptions: {
                numberOfBCs: 3,
                selectedAspects: [],
                additionalOptions: ''
            },
            availableAspects: [
                this.$t('DevideBoundedContextDialog.domainAspect'),
                this.$t('DevideBoundedContextDialog.organizationalAspect'),
                this.$t('DevideBoundedContextDialog.personaAspect'),
                this.$t('DevideBoundedContextDialog.transactionPerformanceAspect'),
                this.$t('DevideBoundedContextDialog.infrastructureAspect')
            ]
        }
    },

    computed: {
        isValid() {
            return this.localOptions.numberOfBCs > 0 && 
                   this.localOptions.selectedAspects.length > 0;
        }
    },

    watch: {
        show(newVal) {
            if (newVal) {
                // Dialog가 열릴 때 기본값으로 모든 aspect 선택
                this.localOptions.selectedAspects = [...this.availableAspects];
            }
        }
    },

    methods: {
        onConfirm() {
            this.$emit('setGenerateOption', { ...this.localOptions });
        }
    }
}
</script>