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
                
                <v-menu offset-y>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn
                            text
                            v-bind="attrs"
                            v-on="on"
                            :loading="isExporting"
                            :disabled="isExporting"
                            class="mx-1"
                        >
                            <v-icon left>mdi-download</v-icon>
                            SAVE
                            <v-icon right>mdi-chevron-down</v-icon>
                        </v-btn>
                    </template>
                    <v-list>
                        <v-list-item @click="exportToPDF">
                            <v-list-item-icon>
                                <v-icon>mdi-file-pdf-box</v-icon>
                            </v-list-item-icon>
                            <v-list-item-title>Export as PDF</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="exportToWord">
                            <v-list-item-icon>
                                <v-icon>mdi-file-word-box</v-icon>
                            </v-list-item-icon>
                            <v-list-item-title>Export as Word</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="exportToPPT">
                            <v-list-item-icon>
                                <v-icon>mdi-file-powerpoint-box</v-icon>
                            </v-list-item-icon>
                            <v-list-item-title>Export as PowerPoint</v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>
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
import { jsPDF } from 'jspdf'
import * as htmlToImage from 'html-to-image'
import StorageBase from "../../CommonStorageBase";
import { DataBasedWordExporter } from './utils/DataBasedWordExporter';
import { DataBasedPPTExporter } from './utils/DataBasedPPTExporter';


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
            if(!this.projectInfo['eventStormingModelIds']) return;

            var option = {
                sort: "desc",
                orderBy: null,
                size: 1,
                startAt: null,
                endAt: null,
            }

            for (const modelId of this.projectInfo['eventStormingModelIds']) {
                if(modelId){
                    const [snapshots, information] = await Promise.all([
                        this.list(`db://definitions/${modelId}/snapshotLists`, option),
                        this.list(`db://definitions/${modelId}/information`)
                    ]);

                    const modelData = {};
                    
                    if(snapshots && snapshots.length > 0){
                        modelData.models = JSON.parse(snapshots[0].snapshot);
                    }
                    
                    if(information){
                        modelData.information = information;
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

        async exportToPDF() {
            if (this.isExporting) return;
            this.isExporting = true;
            try {
                const pdfItems = document.querySelectorAll('.pdf-content-item');
                const pdfPromises = Array.from(pdfItems).map(async (container, index) => {
                    // 이미지가 완전히 로드될 때까지 대기
                    const images = container.getElementsByTagName('img');
                    const svgs = container.getElementsByTagName('svg');
                    const loadPromises = [
                        ...Array.from(images).map(img => new Promise(resolve => {
                            if (img.complete) resolve();
                            else {
                                img.onload = resolve;
                                img.onerror = resolve;
                            }
                        })),
                        ...Array.from(svgs).map(svg => new Promise(resolve => setTimeout(resolve, 100)))
                    ];
                    await Promise.all(loadPromises);

                    // 캡처
                    let dataUrl = null;
                    let retryCount = 0;
                    const maxRetries = 5;
                    while (!dataUrl && retryCount < maxRetries) {
                        try {
                            dataUrl = await htmlToImage.toPng(container, {
                                skipFonts: true,
                                cacheBust: true,
                                pixelRatio: 2,
                                backgroundColor: '#ffffff',
                                width: container.offsetWidth,
                                height: container.offsetHeight,
                                style: {
                                    transform: 'scale(1)',
                                    transformOrigin: 'top left',
                                    width: `${container.offsetWidth}px`,
                                    height: `${container.offsetHeight}px`
                                },
                                filter: node => {
                                    if (!node || !node.tagName) return true;
                                    const hasNoClass = node.classList && (
                                        node.classList.contains('no-print') || 
                                        node.classList.contains('v-btn')
                                    );
                                    return !['BUTTON', 'SCRIPT', 'STYLE'].includes(node.tagName) && !hasNoClass;
                                }
                            });
                        } catch (err) {
                            retryCount++;
                            await new Promise(resolve => setTimeout(resolve, 500));
                        }
                    }
                    if (!dataUrl) throw new Error(`Failed to capture item ${index}`);
                    return {
                        dataUrl,
                        height: container.offsetHeight,
                        width: container.offsetWidth,
                        index
                    };
                });
                const results = await Promise.all(pdfPromises);
                const successfulCaptures = results.filter(r => r.dataUrl);
                if (successfulCaptures.length === 0) throw new Error('No content could be captured successfully');

                const pdf = new jsPDF({
                    orientation: 'p',
                    unit: 'mm',
                    format: 'a4',
                    compress: true,
                    putOnlyUsedFonts: true
                });
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const margin = 10;
                const imgWidth = pdfWidth - (margin * 2);

                successfulCaptures.forEach((img, index) => {
                    if (index > 0) pdf.addPage();
                    let imgHeight = (img.height * imgWidth) / img.width;
                    // 한 페이지를 넘으면 압축
                    const pageHeight = pdfHeight - (margin * 2);
                    if (imgHeight > pageHeight) {
                        imgHeight = pageHeight;
                    }
                    pdf.addImage(
                        img.dataUrl,
                        'PNG',
                        margin,
                        margin,
                        imgWidth,
                        imgHeight
                    );
                });

                const timestamp = new Date().toISOString().split('T')[0];
                const filename = `${this.projectInfo.projectName? this.projectInfo.projectName:'untitled'}-${timestamp}.pdf`;
                pdf.save(filename);
                
                this.showSnackbar('PDF가 성공적으로 생성되었습니다.', 'success');
            } catch (error) {
                this.showSnackbar("PDF 생성 실패: " + (error.message || 'Unknown error'), 'error');
            } finally {
                this.isExporting = false;
                this.exportStatus = '문서 생성 중...';
            }
        },

        async exportToWord() {
            if (this.isExporting) return;
            this.isExporting = true;
            this.exportStatus = 'Word 문서 생성 중...';
            
            try {
                // 모든 요소가 렌더링될 때까지 대기
                await this.$nextTick();
                await new Promise(resolve => setTimeout(resolve, 1000));
                
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
        },

        async exportToPPT() {
            if (this.isExporting) return;
            this.isExporting = true;
            this.exportStatus = 'PowerPoint 문서 생성 중...';
            
            try {
                // 모든 요소가 렌더링될 때까지 대기
                await this.$nextTick();
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // 데이터 기반 변환 방식 사용
                const container = this.$refs.documentTemplate.$el;
                const selectedSections = this.$refs.documentTemplate.selectedSections;
                const exporter = new DataBasedPPTExporter(
                    this.projectInfo,
                    this.draft,
                    this.eventStormingModels,
                    selectedSections,
                    container // HTML 컨테이너 전달 (이미지 캡쳐용)
                );
                
                const blob = await exporter.exportToPPT();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                
                const timestamp = new Date().toISOString().split('T')[0];
                link.download = `${this.projectInfo.projectName || 'untitled'}-${timestamp}.pptx`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                
                this.showSnackbar('PowerPoint 문서가 성공적으로 생성되었습니다.', 'success');
            } catch (error) {
                console.error('PPT export error:', error);
                this.showSnackbar("PowerPoint 생성 실패: " + (error.message || 'Unknown error'), 'error');
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