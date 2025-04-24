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
                <v-toolbar-title>PDF Preview</v-toolbar-title>
                <v-spacer></v-spacer>
                
                <v-btn
                    text
                    @click="exportToPDF"
                    :loading="isExporting"
                    :disabled="isExporting"
                    class="mx-1"
                >
                    <v-icon left>mdi-content-save</v-icon>
                    SAVE
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
                    <div class="text-h6 white--text">PDF 생성 중...</div>
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
        }
    },
    data() {
        return {
            dialog: false,
            isExporting: false,
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
        if(this.userInfo && this.userInfo.providerUid){
            this.getEventStormingModel()
        }
    },
    methods: {
        async getEventStormingModel(){
            var option = {
                        sort: "desc",
                        orderBy: null,
                        size: 1,
                        startAt: null,
                        endAt: null,
                    }

            this.projectInfo['eventStormingModelIds'].forEach(async (modelId) => {
                var snapshots = await this.list(`db://definitions/${this.userInfo.providerUid}_es_${modelId}/snapshotLists`, option)
                this.eventStormingModels[modelId] = JSON.parse(snapshots[0].snapshot)
            })
        },

        show() {
            this.dialog = true;
            this.isExporting = false;
            this.snackbar.show = false;
        },

        async close() {
            if (this.isExporting) return;
            this.dialog = false;
            await this.$nextTick();
            this.isExporting = false;
            this.snackbar.show = false;
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
                console.log('Total PDF items:', pdfItems.length);
                
                const pdfPromises = Array.from(pdfItems).map(async (container, index) => {
                    try {
                        console.log(`Processing item ${index}...`);
                        console.log(`Container ${index} dimensions:`, {
                            width: container.offsetWidth,
                            height: container.offsetHeight,
                            content: container.innerHTML.substring(0, 100) + '...'
                        });

                        const originalDisplay = container.style.display;
                        const originalVisibility = container.style.visibility;
                        container.style.display = 'block';
                        container.style.visibility = 'visible';
                        
                        const images = container.getElementsByTagName('img');
                        const svgs = container.getElementsByTagName('svg');
                        
                        const loadPromises = [
                            ...Array.from(images).map(img => 
                                new Promise(resolve => {
                                    if (img.complete) resolve();
                                    else {
                                        img.onload = resolve;
                                        img.onerror = resolve;
                                    }
                                })
                            ),
                            ...Array.from(svgs).map(svg => 
                                new Promise(resolve => setTimeout(resolve, 100))
                            )
                        ];

                        await Promise.all(loadPromises);

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
                                        
                                        // classList 존재 여부 확인
                                        const hasNoClass = node.classList && (
                                            node.classList.contains('no-print') || 
                                            node.classList.contains('v-btn')
                                        );
                                        
                                        return !['BUTTON', 'SCRIPT', 'STYLE'].includes(node.tagName) && !hasNoClass;
                                    }
                                });
                            } catch (err) {
                                console.warn(`Capture attempt ${retryCount + 1} for item ${index} failed:`, err);
                                retryCount++;
                                await new Promise(resolve => setTimeout(resolve, 500));
                            }
                        }

                        container.style.display = originalDisplay;
                        container.style.visibility = originalVisibility;

                        if (!dataUrl) {
                            throw new Error(`Failed to capture item ${index} after ${maxRetries} attempts`);
                        }

                        return {
                            dataUrl,
                            height: container.offsetHeight,
                            width: container.offsetWidth,
                            index
                        };
                    } catch (error) {
                        console.error(`Error processing item ${index}:`, error);
                        return {
                            dataUrl: null,
                            height: 0,
                            width: 0,
                            index,
                            error: true
                        };
                    }
                });

                const results = await Promise.all(pdfPromises);
                const failedItems = results.filter(r => r.error);
                if (failedItems.length > 0) {
                    console.warn('Failed to capture items:', failedItems.map(f => f.index));
                }

                const successfulCaptures = results.filter(r => !r.error);
                if (successfulCaptures.length === 0) {
                    throw new Error('No content could be captured successfully');
                }

                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const margin = 10;
                const imgWidth = pdfWidth - (margin * 2);

                successfulCaptures.forEach((img, index) => {
                    if (index > 0) pdf.addPage();
                    
                    const imgHeight = (img.height * imgWidth) / img.width;
                    
                    pdf.addImage(
                        img.dataUrl,
                        'PNG',
                        margin,
                        margin,
                        imgWidth,
                        imgHeight,
                        `page_${index}`,
                        'NONE'
                    );
                });

                const timestamp = new Date().toISOString().split('T')[0];
                const filename = `event-storming-${this.projectId || timestamp}.pdf`;
                pdf.save(filename);

            } catch (error) {
                console.error('PDF generation failed:', error);
                this.snackbar = {
                    show: true,
                    text: "PDF generation failed: " + (error.message || 'Unknown error'),
                    color: "error",
                    timeout: 3000
                };
            } finally {
                const pdfItems = document.querySelectorAll('.pdf-content-item');
                pdfItems.forEach(container => {
                    const images = container.getElementsByTagName('img');
                    Array.from(images).forEach(img => {
                        img.style.opacity = '';
                    });
                });
                this.isExporting = false;
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