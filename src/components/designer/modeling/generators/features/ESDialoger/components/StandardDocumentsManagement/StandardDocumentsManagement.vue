<template>
    <div style="overflow-y: hidden;">
        <v-card class="standard-documents-card">
            <v-card-title class="headline d-flex align-center">
                <v-icon class="mr-2">mdi-file-document-multiple</v-icon>
                <div>{{ $t('standardDocuments.title') || '메타데이터 관리' }}</div>
                <v-spacer></v-spacer>
                <v-btn icon @click="$emit('onClose')">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-card-title>
            
            <v-card-text>
                <v-alert
                    type="info"
                    dense
                    outlined
                    text
                    class="mb-4"
                >
                    {{ $t('standardDocuments.hint') || '메타데이터를 업로드하세요.' }}
                </v-alert>

                <!-- 파일 업로드 -->
                <div class="mb-4">
                    <v-file-input
                        v-model="selectedFile"
                        :label="$t('standardDocuments.selectFile') || '메타데이터 선택'"
                        accept=".xlsx,.xls,.pptx,.ppt"
                        show-size
                        outlined
                        dense
                        prepend-icon="mdi-file-document"
                        @change="handleFileSelection"
                    ></v-file-input>
                    
                    <v-btn
                        color="primary"
                        :disabled="!selectedFile || uploading"
                        :loading="uploading"
                        @click="uploadDocument"
                        class="mt-2"
                    >
                        <v-icon left>mdi-upload</v-icon>
                        {{ $t('standardDocuments.upload') || '업로드' }}
                    </v-btn>
                </div>

                <!-- 업로드된 문서 -->
                <div v-if="currentDocument" class="mt-4">
                    <h4 class="mb-2">{{ $t('standardDocuments.uploadedFile') || '업로드된 메타데이터' }}</h4>
                    <v-list dense>
                        <v-list-item class="px-0">
                            <v-list-item-icon>
                                <v-icon>{{ getFileIcon(currentDocument.name) }}</v-icon>
                            </v-list-item-icon>
                            <v-list-item-content>
                                <v-list-item-title>{{ currentDocument.name }}</v-list-item-title>
                                <v-list-item-subtitle v-if="currentDocument.size">
                                    {{ formatFileSize(currentDocument.size) }} • {{ formatDate(currentDocument.uploadedAt) }}
                                </v-list-item-subtitle>
                            </v-list-item-content>
                            <v-list-item-action>
                                <v-btn
                                    icon
                                    small
                                    @click="deleteDocument"
                                    :loading="deleting"
                                >
                                    <v-icon color="error">mdi-delete</v-icon>
                                </v-btn>
                            </v-list-item-action>
                        </v-list-item>
                    </v-list>
                </div>

                <div v-else class="text-center pa-5 grey lighten-4 rounded">
                    <v-icon color="grey lighten-1" x-large>mdi-file-document-outline</v-icon>
                    <p class="mt-3 grey--text text--darken-1">{{ $t('standardDocuments.noFile') || '업로드된 메타데이터가 없습니다.' }}</p>
                </div>
            </v-card-text>
            
            <v-row class="ma-0 pt-0 pl-4 pr-4 pb-4">
                <v-spacer></v-spacer>
                <v-btn @click="$emit('onClose')"
                    class="auto-modeling-btn"
                    color="primary"
                >
                    {{ $t('standardDocuments.close') || '닫기' }}
                </v-btn>
            </v-row>

            <v-snackbar
                v-model="snackbar.show"
                :color="snackbar.color"
                :timeout="1500"
                class="custom-snackbar"
            >
                {{ snackbar.text }}
                <template v-slot:action="{ attrs }">
                    <v-btn @click="snackbar.show = false"
                        text
                        v-bind="attrs"
                    >
                        {{ $t('standardDocuments.close') || '닫기' }}
                    </v-btn>
                </template>
            </v-snackbar>
        </v-card>
    </div>
</template>
  
<script>
import StorageBase from '../../../../../../../CommonStorageBase.vue';
import StorageBaseUtil from '../../../../../../../../utils/StorageBase';
import firebase from 'firebase';

export default {
    name: "standard-documents-management",
    mixins: [StorageBase],
    data() {
        return {
            selectedFile: null,
            currentDocument: null,
            uploading: false,
            deleting: false,
            snackbar: {
                show: false,
                text: '',
                color: 'info'
            }
        }
    },
    async created() {
        await this.loadDocument();
    },
    methods: {
        async loadDocument() {
            try {
                const storage = StorageBaseUtil.getStorage('firebase');
                const userInfo = await storage.getCurrentUser();
                if (!userInfo || !userInfo.uid) {
                    console.warn('User not logged in');
                    return;
                }

                const userId = userInfo.uid;

                // Firebase Storage에서 파일 목록 조회
                const files = await this.listStorageFiles(`standard-documents/${userId}/`);

                if (files && files.length > 0) {
                    // 첫 번째 파일 정보 가져오기
                    const file = files[0];
                    const metadata = await this.getFileMetadata(`standard-documents/${userId}/${file.name}`);
                    
                    // 원본 파일명을 메타데이터에서 가져오기
                    const originalFileName = (metadata.customMetadata && metadata.customMetadata.originalFileName) || file.name;
                    
                    this.currentDocument = {
                        name: originalFileName,
                        size: metadata.size || 0,
                        uploadedAt: metadata.timeCreated || new Date().toISOString(),
                        path: `standard-documents/${userId}/${file.name}`
                    };
                }
            } catch (error) {
                console.error('Failed to load document:', error);
            }
        },

        handleFileSelection(file) {
            this.selectedFile = file;
        },

        async uploadDocument() {
            if (!this.selectedFile) {
                return;
            }

            const storage = StorageBaseUtil.getStorage('firebase');
            const userInfo = await storage.getCurrentUser();
            if (!userInfo || !userInfo.uid) {
                this.snackbar = {
                    show: true,
                    text: '로그인이 필요합니다.',
                    color: 'error'
                };
                return;
            }

            // 기존 파일이 있는지 확인
            const hasExistingFile = this.currentDocument !== null;
            if (hasExistingFile) {
                const replaceConfirmText = this.$t('standardDocuments.replaceConfirm', { name: this.currentDocument.name }) || 
                    `기존 메타데이터 "${this.currentDocument.name}"가 대체됩니다. 계속하시겠습니까?`;
                const confirmed = confirm(replaceConfirmText);
                if (!confirmed) {
                    return;
                }
            }

            this.uploading = true;
            
            try {
                const userId = userInfo.uid;
                const fileExt = this.selectedFile.name.split('.').pop().toLowerCase();
                const fileName = `standard-document.${fileExt}`;
                const storagePath = `standard-documents/${userId}/${fileName}`;

                // Firebase Storage에 파일 업로드
                const contentType = this.getContentType(fileExt);
                
                // Firebase Storage에 직접 업로드 (File 객체 직접 사용)
                const storageRef = firebase.storage().ref(storagePath);
                
                const uploadTask = storageRef.put(this.selectedFile, {
                    contentType: contentType,
                    customMetadata: {
                        uploadedBy: userId,
                        uploadedAt: new Date().toISOString(),
                        originalFileName: this.selectedFile.name
                    }
                });

                // 업로드 진행률 추적
                uploadTask.on('state_changed',
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        console.log('Upload progress:', progress + '%');
                    },
                    (error) => {
                        console.error('Upload error:', error);
                        this.snackbar = {
                            show: true,
                            text: this.$t('standardDocuments.uploadError') || '메타데이터 업로드에 실패했습니다.',
                            color: 'error'
                        };
                        this.uploading = false;
                    },
                    async () => {
                        // 업로드 완료
                        const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
                        const metadata = await uploadTask.snapshot.ref.getMetadata();
                        
                        // 원본 파일명을 메타데이터에서 가져오기
                        const originalFileName = (metadata.customMetadata && metadata.customMetadata.originalFileName) || fileName;
                        
                        this.currentDocument = {
                            name: originalFileName,
                            size: metadata.size || this.selectedFile.size,
                            uploadedAt: metadata.timeCreated || new Date().toISOString(),
                            path: storagePath,
                            downloadURL: downloadURL
                        };
                        
                        this.selectedFile = null;
                        
                        this.snackbar = {
                            show: true,
                            text: hasExistingFile 
                                ? (this.$t('standardDocuments.replaceSuccess') || '메타데이터가 대체되었습니다.')
                                : (this.$t('standardDocuments.uploadSuccess') || '메타데이터가 업로드되었습니다.'),
                            color: 'success'
                        };

                        this.uploading = false;

                        // 백엔드에 인덱싱 요청 (선택사항)
                        // await this.$http.post('/api/standard-documents/index', { userId, filePath: storagePath });
                    }
                );
                
            } catch (error) {
                console.error('Failed to upload document:', error);
                this.snackbar = {
                    show: true,
                    text: this.$t('standardDocuments.uploadError') || '메타데이터 업로드에 실패했습니다.',
                    color: 'error'
                };
                this.uploading = false;
            }
        },

        async deleteDocument() {
            if (!this.currentDocument) {
                return;
            }

            const deleteConfirmText = this.$t('standardDocuments.deleteConfirm', { name: this.currentDocument.name }) || 
                `"${this.currentDocument.name}" 파일을 삭제하시겠습니까?`;
            if (!confirm(deleteConfirmText)) {
                return;
            }

            this.deleting = true;
            
            try {
                const storageRef = firebase.storage().ref(this.currentDocument.path);
                await storageRef.delete();
                
                this.currentDocument = null;
                
                this.snackbar = {
                    show: true,
                    text: this.$t('standardDocuments.deleteSuccess') || '메타데이터가 삭제되었습니다.',
                    color: 'success'
                };
            } catch (error) {
                console.error('Failed to delete document:', error);
                this.snackbar = {
                    show: true,
                    text: this.$t('standardDocuments.deleteError') || '메타데이터 삭제에 실패했습니다.',
                    color: 'error'
                };
            } finally {
                this.deleting = false;
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

        async getFileMetadata(path) {
            try {
                const storageRef = firebase.storage().ref(path);
                return await storageRef.getMetadata();
            } catch (error) {
                console.error('Failed to get file metadata:', error);
                return {};
            }
        },

        getContentType(ext) {
            const contentTypes = {
                'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'xls': 'application/vnd.ms-excel',
                'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'ppt': 'application/vnd.ms-powerpoint'
            };
            return contentTypes[ext] || 'application/octet-stream';
        },

        getFileIcon(fileName) {
            const ext = fileName.split('.').pop().toLowerCase();
            if (['xlsx', 'xls'].includes(ext)) {
                return 'mdi-file-excel';
            } else if (['pptx', 'ppt'].includes(ext)) {
                return 'mdi-file-powerpoint';
            }
            return 'mdi-file-document';
        },

        formatFileSize(bytes) {
            if (!bytes) return '';
            if (bytes < 1024) return bytes + ' B';
            if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
            return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
        },

        formatDate(dateString) {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toLocaleDateString('ko-KR') + ' ' + date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
        }
    }
}
</script>

<style scoped>
.standard-documents-card {
    max-width: 800px;
    margin: 0 auto;
}

.custom-snackbar >>> .v-snack__wrapper {
    min-height: unset !important;
    padding: 4px 8px !important;
}

.custom-snackbar >>> .v-snack__content {
    padding: 0 !important;
}
</style>

<style>
/* 파일 입력 필드 커서 스타일 - scoped 제외 */
.standard-documents-card .v-file-input {
    cursor: pointer;
}

.standard-documents-card .v-file-input .v-input__control {
    cursor: pointer;
}

.standard-documents-card .v-file-input .v-input__slot {
    cursor: pointer;
}

.standard-documents-card .v-file-input input {
    cursor: pointer;
}
</style>

