<template>
    <div>
        <v-card v-if="activeTab !== null && !isStandardTransformed && !isTransforming" class="ma-4 pa-4" outlined>
            <v-textarea v-model="localFeedback" label="Feedback" :placeholder="$t('ModelDraftDialogForDistribution.feedbackPlaceholder')" rows="3"></v-textarea>
            <v-row class="pa-0 ma-0">
                <v-spacer></v-spacer>
                <v-btn
                    :disabled="isGenerationInProgress || !isEditable || (!localFeedback && !currentBCHasEmptyOptions)"
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
            <v-tooltip bottom :disabled="!isTransformButtonDisabled || hasStandardDocument || isTransforming">
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
                :disabled="isGenerationInProgress || !isEditable"
                class="auto-modeling-btn"
                @click="$emit('retry')"
            >
                <v-icon class="auto-modeling-btn-icon">mdi-refresh</v-icon>
                {{ $t('ESDialoger.tryAgain') }}
            </v-btn>
            <v-tooltip bottom :disabled="!isGenerateButtonDisabled || isGenerationInProgress">
                <template v-slot:activator="{ on, attrs }">
                    <span v-bind="attrs" v-on="on">
                        <v-btn
                            :disabled="isGenerateButtonDisabled || !isEditable"
                            class="auto-modeling-btn"
                            color="primary"
                            @click="$emit('generateFromDraft')"
                        >
                            {{ $t('ModelDraftDialogForDistribution.createEventStormingModelCanvas') }}
                            <v-icon class="auto-modeling-btn-icon">mdi-arrow-right</v-icon>
                        </v-btn>
                    </span>
                </template>
                <span>일부 BC 의 초안이 비어있어 진행할 수 없습니다. 해당 BC 를 재생성하거나 전체를 다시 시도해주세요.</span>
            </v-tooltip>
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
        // "생성이 진행 중" 인 상태 — feedback/retry 가 막혀야 하는 유일한 케이스.
        // (참고: 어느 한 BC 가 빈 options 로 끝나는 silent failure 의 경우엔
        //  isGenerateButtonDisabled 는 true 지만 isGenerationInProgress 는 false.)
        isGenerationInProgress: {
            type: Boolean,
            default: () => false,
            required: false
        },
        // 활성 탭의 BC 가 옵션 0 개로 끝났는지. true 면 feedback 텍스트 없이도 재생성 허용.
        currentBCHasEmptyOptions: {
            type: Boolean,
            default: () => false,
            required: false
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
                // AceBase 환경 확인
                const isAceBaseMode = this.$isElectron || window.MODE == 'onprem' || window.MODE == "bpm";
                
                let userId = null;
                if (isAceBaseMode) {
                    // AceBase 환경: localStorage에서 user_id 가져오기
                    userId = this.userInfo && this.userInfo.uid 
                        ? this.userInfo.uid 
                        : localStorage.getItem('uid');
                } else {
                    // Firebase 환경: Firebase Storage에서 가져오기
                    const storage = StorageBaseUtil.getStorage('firebase');
                    const userInfo = await storage.getCurrentUser();
                    if (!userInfo || !userInfo.uid) {
                        this.hasStandardDocument = false;
                        return;
                    }
                    userId = userInfo.uid;
                }

                if (!userId) {
                    this.hasStandardDocument = false;
                    return;
                }

                // AceBase 로컬 환경: 백엔드 API에서 파일 목록 조회
                if (isAceBaseMode) {
                    try {
                        const backendUrl = window.BACKEND_URL || process.env.VUE_APP_BACKEND_URL || 'http://localhost:2025';
                        const response = await this.$http.get(`${backendUrl}/api/standard-documents/list`, {
                            params: { userId: userId }
                        });
                        
                        if (response.data && response.data.files && response.data.files.length > 0) {
                            this.hasStandardDocument = true;
                        } else {
                            this.hasStandardDocument = false;
                        }
                    } catch (error) {
                        console.error('Failed to load documents from backend:', error);
                        this.hasStandardDocument = false;
                    }
                    return;
                }

                // Firebase 환경: Firebase Storage에서 파일 목록 조회
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