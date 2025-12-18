<template>
    <div>
        <v-card v-if="activeTab !== null && !isStandardTransformed && !isTransforming" class="ma-4 pa-4" outlined>
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
            <v-tooltip bottom :disabled="!isTransformButtonDisabled || hasStandardDocument">
                <template v-slot:activator="{ on, attrs }">
                    <span v-bind="attrs" v-on="on">
                        <v-btn 
                            v-if="!isStandardTransformed"
                            :disabled="isTransformButtonDisabled" 
                            class="auto-modeling-btn" 
                            @click="$emit('transformWithStandards', draftOptions[activeTab])"
                        >
                            {{ $t('ModelDraftDialogForDistribution.transformWithStandards') }}
                        </v-btn>
                    </span>
                </template>
                <span>
                    {{ $t('ModelDraftDialogForDistribution.uploadMetadataToUseFeature') }}
                </span>
            </v-tooltip>
            <v-btn 
                v-if="!isStandardTransformed"
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
import StorageBase from '../../../../../../../CommonStorageBase.vue';
import StorageBaseUtil from '../../../../../../../../utils/StorageBase';
import firebase from 'firebase';

export default {
    name: 'es-dialoger-footer',
    mixins: [StorageBase],
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
        },
        isTransforming: {
            type: Boolean,
            default: () => false,
            required: false
        },
        isStandardTransformed: {
            type: Boolean,
            default: () => false,
            required: false
        }
    },
    data() {
        return {
            localFeedback: this.feedback,
            hasStandardDocument: false
        }
    },
    async created() {
        await this.checkStandardDocument();
    },
    computed: {
        isTransformButtonDisabled() {
            return !this.isEditable || this.isTransforming || !this.hasStandardDocument;
        }
    },
    methods: {
        async checkStandardDocument() {
            try {
                const storage = StorageBaseUtil.getStorage('firebase');
                const userInfo = await storage.getCurrentUser();
                if (!userInfo || !userInfo.uid) {
                    this.hasStandardDocument = false;
                    return;
                }

                const userId = userInfo.uid;
                const files = await this.listStorageFiles(`standard-documents/${userId}/`);
                this.hasStandardDocument = files && files.length > 0;
            } catch (error) {
                console.error('Failed to check standard document:', error);
                this.hasStandardDocument = false;
            }
        },
        async listStorageFiles(path) {
            try {
                const storageRef = firebase.storage().ref(path);
                const result = await storageRef.listAll();
                return result.items.map(item => ({ name: item.name }));
            } catch (error) {
                console.error('Failed to list files:', error);
                return [];
            }
        },
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