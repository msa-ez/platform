<template>
    <v-dialog
        v-model="dialog"
        fullscreen
        persistent
        hide-overlay
        transition="dialog-bottom-transition"
    >
        <v-card class="d-flex flex-column" style="height: 100vh;">
            <!-- 고정된 toolbar -->
            <v-toolbar 
                dark 
                color="primary"
                fixed
                class="flex-grow-0"
            >
                <v-btn icon @click="close">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
                <v-toolbar-title>Document Preview</v-toolbar-title>
                <v-spacer></v-spacer>
                
                <!-- 산출물은 Word 만 지원 (PDF/PPT 제거) -->
                <v-btn
                    text
                    :loading="isExporting"
                    :disabled="isExporting"
                    class="mx-1"
                    @click="exportToWord"
                >
                    <v-icon left>mdi-file-word-box</v-icon>
                    Export as Word
                </v-btn>
            </v-toolbar>

            <!-- 스크롤 가능한 컨텐츠 영역 -->
            <v-container 
                class="document-preview-container flex-grow-1"
                style="margin-top: 64px; overflow-y: auto;"
            >
                <DocumentTemplate 
                    ref="documentTemplate"
                    :project-info="projectInfo"
                    :cached-models="cachedModels"
                    :event-storming-models="eventStormingModels"
                    :draft="draft"
                />
            </v-container>

            <!-- 로딩 오버레이 -->
            <v-overlay :value="isExporting" class="loading-overlay">
                <v-card class="loading-card" flat>
                    <v-progress-circular
                        indeterminate
                        size="64"
                        color="primary"
                        class="mb-3"
                    ></v-progress-circular>
                    <div class="text-h6 white--text">{{ exportStatus }}</div>
                </v-card>
            </v-overlay>
        </v-card>

        <!-- 결과 스낵바 -->
        <v-snackbar
            v-model="snackbar.show"
            :color="snackbar.color"
            :timeout="snackbar.timeout"
        >
            {{ snackbar.text }}
            <template v-slot:action="{ attrs }">
                <v-btn
                    text
                    v-bind="attrs"
                    @click="snackbar.show = false"
                >
                    닫기
                </v-btn>
            </template>
        </v-snackbar>
    </v-dialog>
</template>

<script>
import DocumentTemplate from './DocumentTemplate.vue'
import StorageBase from "../../CommonStorageBase";
import { DataBasedWordExporter } from './utils/DataBasedWordExporter';
import { normalizeDefinitionInformation } from './utils/resolveEventStormingModelTitle';


export default {
    name: 'DocumentPreviewDialog',
    components: {
        DocumentTemplate
    },
    mixins: [StorageBase],
    props: {
        projectInfo: {
            type: Object,
            required: true
        },
        cachedModels: {
            type: Object,
            required: true
        },
        userInfo: {
            type: Object,
            required: true
        },
        draft: {
            type: Array,
            required: true
        }
    },
    data() {
        return {
            dialog: false,
            isExporting: false,
            exportStatus: '문서 생성 중...',
            snackbar: {
                show: false,
                text: '',
                color: 'success',
                timeout: 3000
            },
            eventStormingModels: {}
        }
    },
    mounted(){
        // Remove model loading from mounted
    },
    methods: {
        async getEventStormingModel(){
            // 로드 대상은 '선택된' ES (eventStormingModelIds) 여야 한다.
            // 주의: 이전에 reactive 목적으로 modelList(전체)를 쓰게 바꿨다가, 모델을 골라도
            // 프로젝트의 모든 ES 를 로드해 매트릭스가 N 개 모델을 합쳐 보여주는(BC/Aggregate 가
            // 모델 수만큼 중복) 회귀가 발생했음. → 선택된 ID 우선, 없을 때만 modelList fallback.
            const selected = this.projectInfo['eventStormingModelIds'];
            const modelIds = (Array.isArray(selected) && selected.length)
                ? selected
                : ((this.projectInfo.eventStorming && this.projectInfo.eventStorming.modelList) || []);
            if(!modelIds || !modelIds.length) return;

            var option = {
                sort: "desc",
                orderBy: null,
                size: 1,
                startAt: null,
                endAt: null,
            }

            for (const modelId of modelIds) {
                if(modelId){
                    const [snapshots, information] = await Promise.all([
                        this.list(`db://definitions/${modelId}/snapshotLists`, option),
                        this.list(`db://definitions/${modelId}/information`)
                    ]);

                    const modelData = {};
                    
                    if(snapshots && snapshots.length > 0){
                        modelData.models = JSON.parse(snapshots[0].snapshot);
                    }
                    
                    if (information) {
                        modelData.information = normalizeDefinitionInformation(information) || information;
                    }

                    this.$set(this.eventStormingModels, modelId, modelData);
                }
            }
        },

        async show() {
            // Reset states before showing
            this.eventStormingModels = {};
            this.isExporting = false;
            this.snackbar.show = false;
            
            // Load model information first
            if(this.userInfo && this.userInfo.providerUid){
                await this.getEventStormingModel();
            }
            
            // Show dialog after loading is complete
            this.dialog = true;
        },

        async close() {
            if (this.isExporting) return;
            
            // Reset all component states
            this.dialog = false;
            this.isExporting = false;
            this.snackbar.show = false;
            this.eventStormingModels = {};
            
            // Emit close event to parent
            this.$emit('close');
            
            // Wait for the dialog to close
            await this.$nextTick();
        },

        showSnackbar(text, color = 'success') {
            this.snackbar = {
                show: true,
                text,
                color,
                timeout: 3000
            }
        },

        waitForImageElement(img, timeoutMs = 8000) {
            return new Promise(resolve => {
                if (!img) return resolve();
                if (img.complete && img.naturalWidth > 0) return resolve();

                let resolved = false;
                const done = () => {
                    if (resolved) return;
                    resolved = true;
                    img.removeEventListener('load', onLoadOrError);
                    img.removeEventListener('error', onLoadOrError);
                    clearTimeout(timer);
                    resolve();
                };
                const onLoadOrError = () => done();

                const timer = setTimeout(done, timeoutMs);
                img.addEventListener('load', onLoadOrError, { once: true });
                img.addEventListener('error', onLoadOrError, { once: true });
            });
        },

        async waitForPreviewReady(timeoutMs = 12000) {
            await this.$nextTick();
            const container = this.$refs.documentTemplate && this.$refs.documentTemplate.$el;
            if (!container) return;

            const start = Date.now();
            while (Date.now() - start < timeoutMs) {
                const images = Array.from(container.querySelectorAll('img'));
                await Promise.all(images.map(img => this.waitForImageElement(img, 1500)));

                const hasUnreadyImage = images.some(img => !img.complete || img.naturalWidth === 0);
                const mermaidSvgs = Array.from(container.querySelectorAll('.mermaid svg, .mermaid-container svg'));
                const matrixElement = container.querySelector('.matrix-container');
                const mermaidReady = mermaidSvgs.every(svg => svg.getBoundingClientRect().width > 0 && svg.getBoundingClientRect().height > 0);
                const matrixReady = !matrixElement || matrixElement.getBoundingClientRect().width > 0;

                if (!hasUnreadyImage && mermaidReady && matrixReady) {
                    return;
                }

                await new Promise(resolve => setTimeout(resolve, 250));
            }
        },

        async exportToWord() {
            if (this.isExporting) return;
            this.isExporting = true;
            this.exportStatus = 'Word 문서 생성 중...';
            
            try {
                await this.waitForPreviewReady();
                
                // 데이터 기반 변환 방식 사용
                const container = this.$refs.documentTemplate.$el;
                const selectedSections = this.$refs.documentTemplate.selectedSections;
                const exporter = new DataBasedWordExporter(
                    this.projectInfo,
                    this.draft,
                    this.eventStormingModels,
                    selectedSections,
                    container // HTML 컨테이너 전달 (이미지 캡쳐용)
                );
                
                const blob = await exporter.exportToWord();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                
                const timestamp = new Date().toISOString().split('T')[0];
                link.download = `${this.projectInfo.projectName || 'untitled'}-${timestamp}.docx`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                
                this.showSnackbar('Word 문서가 성공적으로 생성되었습니다.', 'success');
            } catch (error) {
                console.error('Word export error:', error);
                this.showSnackbar("Word 생성 실패: " + (error.message || 'Unknown error'), 'error');
            } finally {
                this.isExporting = false;
                this.exportStatus = '문서 생성 중...';
            }
        }
    }
}
</script>

<style scoped>
.document-preview-container {
    background: #f5f5f5;
    padding: 20px;
    min-height: calc(100vh - 64px); /* toolbar 높이만큼 빼줌 */
    max-width: 1200px;
    margin: 0 auto;
}

.v-dialog {
    overflow-y: hidden;
}

.loading-overlay {
    z-index: 9999;
}

.loading-card {
    background: transparent !important;
    box-shadow: none !important;
    text-align: center;
}

/* toolbar 고정을 위한 스타일 */
.v-toolbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
}
</style>