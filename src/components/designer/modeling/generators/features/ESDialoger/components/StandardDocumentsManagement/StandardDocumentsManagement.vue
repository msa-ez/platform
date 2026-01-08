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
                        v-model="selectedFiles"
                        :label="$t('standardDocuments.selectFile') || '메타데이터 선택'"
                        accept=".xlsx,.xls,.pptx,.ppt"
                        show-size
                        outlined
                        dense
                        prepend-icon="mdi-file-document"
                        multiple
                        @change="handleFileSelection"
                    ></v-file-input>
                    
                    <v-btn
                        color="primary"
                        :disabled="!selectedFiles || selectedFiles.length === 0 || uploading"
                        :loading="uploading"
                        @click="uploadDocument"
                        class="mt-2"
                    >
                        <v-icon left>mdi-upload</v-icon>
                        {{ $t('standardDocuments.upload') || '업로드' }}
                    </v-btn>
                </div>

                <!-- 업로드된 문서 -->
                <div v-if="uploadedDocuments && uploadedDocuments.length > 0" class="mt-4">
                    <h4 class="mb-2">{{ $t('standardDocuments.uploadedFile') || '업로드된 메타데이터' }}</h4>
                    <v-list dense>
                        <v-list-item 
                            v-for="(doc, index) in uploadedDocuments" 
                            :key="index"
                            class="px-0"
                        >
                            <v-list-item-icon>
                                <v-icon>{{ getFileIcon(doc.name) }}</v-icon>
                            </v-list-item-icon>
                            <v-list-item-content>
                                <v-list-item-title>{{ doc.name }}</v-list-item-title>
                                <v-list-item-subtitle v-if="doc.size">
                                    {{ formatFileSize(doc.size) }} • {{ formatDate(doc.uploadedAt) }}
                                </v-list-item-subtitle>
                            </v-list-item-content>
                            <v-list-item-action>
                                <v-btn
                                    icon
                                    small
                                    @click="deleteDocument(doc)"
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
    props: {
        userInfo: {
            type: Object,
            default: () => ({})
        }
    },
    data() {
        return {
            selectedFiles: [],
            uploadedDocuments: [],
            uploading: false,
            deleting: false,
            snackbar: {
                show: false,
                text: '',
                color: 'info'
            },
            isAceBaseMode: false  // AceBase 로컬 환경 여부
        }
    },
    async created() {
        // AceBase 환경 감지
        this.isAceBaseMode = this.$isElectron || window.MODE == 'onprem' || window.MODE == "bpm";
        await this.loadDocument();
    },
    async mounted() {
        // 다이얼로그가 다시 열릴 때마다 목록 새로고침 (컴포넌트 재사용 시)
        await this.loadDocument();
    },
    methods: {
        async loadDocument() {
            try {
                // AceBase 환경: props의 userInfo 또는 localStorage에서 user_id 가져오기
                let userId = null;
                if (this.isAceBaseMode) {
                    userId = (this.userInfo && this.userInfo.uid) 
                        ? this.userInfo.uid 
                        : localStorage.getItem('uid');
                } else {
                    // Firebase 환경: Firebase Storage에서 가져오기
                    const storage = StorageBaseUtil.getStorage('firebase');
                    const userInfo = await storage.getCurrentUser();
                    if (!userInfo || !userInfo.uid) {
                        console.warn('User not logged in');
                        return;
                    }
                    userId = userInfo.uid;
                }
                
                if (!userId) {
                    console.warn('User not logged in');
                    return;
                }

                // AceBase 로컬 환경: 백엔드 API에서 파일 목록 조회
                if (this.isAceBaseMode) {
                    try {
                        const backendUrl = process.env.VUE_APP_BACKEND_URL || 'http://localhost:2024';
                        const response = await this.$http.get(`${backendUrl}/api/standard-documents/list`, {
                            params: { userId: userId }
                        });
                        
                        // 응답 데이터 처리: files가 배열인 경우에만 처리
                        if (response.data && Array.isArray(response.data.files)) {
                            this.uploadedDocuments = response.data.files.map(file => ({
                                name: file.name || 'Unknown',
                                size: file.size || 0,
                                uploadedAt: file.uploadedAt || new Date().toISOString(),
                                path: file.path || ''
                            }));
                        } else {
                            // files가 없거나 배열이 아닌 경우 빈 배열로 초기화
                            this.uploadedDocuments = [];
                        }
                    } catch (error) {
                        console.error('Failed to load documents from backend:', error);
                        // 에러 발생 시에도 빈 배열로 초기화하여 이전 목록이 남지 않도록 함
                        this.uploadedDocuments = [];
                    }
                    return;
                }

                // Firebase 환경: Firebase Storage에서 파일 목록 조회
                const files = await this.listStorageFiles(`standard-documents/${userId}/`);

                if (files && files.length > 0) {
                    this.uploadedDocuments = [];
                    for (const file of files) {
                        const metadata = await this.getFileMetadata(`standard-documents/${userId}/${file.name}`);
                        const originalFileName = (metadata.customMetadata && metadata.customMetadata.originalFileName) || file.name;
                        
                        this.uploadedDocuments.push({
                            name: originalFileName,
                            size: metadata.size || 0,
                            uploadedAt: metadata.timeCreated || new Date().toISOString(),
                            path: `standard-documents/${userId}/${file.name}`
                        });
                    }
                }
            } catch (error) {
                console.error('Failed to load document:', error);
            }
        },

        handleFileSelection(files) {
            this.selectedFiles = files;
        },

        async uploadDocument() {
            if (!this.selectedFiles || this.selectedFiles.length === 0) {
                return;
            }

            // AceBase 환경: props의 userInfo 또는 localStorage에서 user_id 가져오기
            let userId = null;
            if (this.isAceBaseMode) {
                userId = (this.userInfo && this.userInfo.uid) 
                    ? this.userInfo.uid 
                    : localStorage.getItem('uid');
            } else {
                // Firebase 환경: Firebase Storage에서 가져오기
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
                userId = userInfo.uid;
            }
            
            if (!userId) {
                this.snackbar = {
                    show: true,
                    text: '로그인이 필요합니다.',
                    color: 'error'
                };
                return;
            }

            this.uploading = true;
            
            try {

                // AceBase 로컬 환경: 백엔드 API로 업로드
                if (this.isAceBaseMode) {
                    const backendUrl = process.env.VUE_APP_BACKEND_URL || 'http://localhost:2024';
                    const formData = new FormData();
                    
                    // 여러 파일 추가
                    for (const file of this.selectedFiles) {
                        formData.append('files', file);
                    }
                    formData.append('userId', userId);
                    
                    const response = await this.$http.post(`${backendUrl}/api/standard-documents/upload`, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    });
                    
                    if (response.data.success) {
                        this.snackbar = {
                            show: true,
                            text: response.data.message || '메타데이터가 업로드되었습니다.',
                            color: 'success'
                        };
                        
                        // 파일 목록 새로고침
                        await this.loadDocument();
                        this.selectedFiles = [];
                    } else {
                        this.snackbar = {
                            show: true,
                            text: response.data.error || '메타데이터 업로드에 실패했습니다.',
                            color: 'error'
                        };
                    }
                    
                    this.uploading = false;
                    return;
                }

                // Firebase 환경: Firebase Storage에 업로드
                const filesToUpload = [...this.selectedFiles];
                let successCount = 0;
                
                for (const file of filesToUpload) {
                    try {
                        const fileExt = file.name.split('.').pop().toLowerCase();
                        const fileName = `standard-document-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
                        const storagePath = `standard-documents/${userId}/${fileName}`;
                        const contentType = this.getContentType(fileExt);
                        
                        const storageRef = firebase.storage().ref(storagePath);
                        
                        await new Promise((resolve, reject) => {
                            const uploadTask = storageRef.put(file, {
                                contentType: contentType,
                                customMetadata: {
                                    uploadedBy: userId,
                                    uploadedAt: new Date().toISOString(),
                                    originalFileName: file.name
                                }
                            });
                            
                            uploadTask.on('state_changed',
                                (snapshot) => {
                                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                                    console.log(`Upload progress for ${file.name}: ${progress}%`);
                                },
                                (error) => {
                                    console.error(`Upload error for ${file.name}:`, error);
                                    reject(error);
                                },
                                async () => {
                                    const metadata = await uploadTask.snapshot.ref.getMetadata();
                                    const originalFileName = (metadata.customMetadata && metadata.customMetadata.originalFileName) || fileName;
                                    
                                    this.uploadedDocuments.push({
                                        name: originalFileName,
                                        size: metadata.size || file.size,
                                        uploadedAt: metadata.timeCreated || new Date().toISOString(),
                                        path: storagePath
                                    });
                                    
                                    successCount++;
                                    resolve();
                                }
                            );
                        });
                    } catch (error) {
                        console.error(`Failed to upload ${file.name}:`, error);
                    }
                }
                
                this.selectedFiles = [];
                
                this.snackbar = {
                    show: true,
                    text: `${successCount}개 파일이 업로드되었습니다.`,
                    color: 'success'
                };
                
            } catch (error) {
                console.error('Failed to upload document:', error);
                this.snackbar = {
                    show: true,
                    text: this.$t('standardDocuments.uploadError') || '메타데이터 업로드에 실패했습니다.',
                    color: 'error'
                };
            } finally {
                this.uploading = false;
            }
        },

        async deleteDocument(doc) {
            if (!doc) {
                return;
            }

            const deleteConfirmText = this.$t('standardDocuments.deleteConfirm', { name: doc.name }) || 
                `"${doc.name}" 파일을 삭제하시겠습니까?`;
            if (!confirm(deleteConfirmText)) {
                return;
            }

            this.deleting = true;
            
            try {
                // AceBase 환경: props의 userInfo 또는 localStorage에서 user_id 가져오기
                let userId = null;
                if (this.isAceBaseMode) {
                    userId = (this.userInfo && this.userInfo.uid) 
                        ? this.userInfo.uid 
                        : localStorage.getItem('uid');
                } else {
                    // Firebase 환경: Firebase Storage에서 가져오기
                    const storage = StorageBaseUtil.getStorage('firebase');
                    const userInfo = await storage.getCurrentUser();
                    if (!userInfo || !userInfo.uid) {
                        this.snackbar = {
                            show: true,
                            text: '로그인이 필요합니다.',
                            color: 'error'
                        };
                        this.deleting = false;
                        return;
                    }
                    userId = userInfo.uid;
                }
                
                if (!userId) {
                    this.snackbar = {
                        show: true,
                        text: '로그인이 필요합니다.',
                        color: 'error'
                    };
                    this.deleting = false;
                    return;
                }

                // AceBase 로컬 환경: 백엔드 API로 삭제
                if (this.isAceBaseMode) {
                    const backendUrl = process.env.VUE_APP_BACKEND_URL || 'http://localhost:2024';
                    const response = await this.$http.delete(`${backendUrl}/api/standard-documents/delete`, {
                        params: {
                            userId: userId,
                            filename: doc.name
                        }
                    });
                    
                    if (response.data.success) {
                        // 파일 목록에서 제거
                        this.uploadedDocuments = this.uploadedDocuments.filter(d => d.name !== doc.name);
                        
                        this.snackbar = {
                            show: true,
                            text: response.data.message || '메타데이터가 삭제되었습니다.',
                            color: 'success'
                        };
                    } else {
                        this.snackbar = {
                            show: true,
                            text: response.data.error || '메타데이터 삭제에 실패했습니다.',
                            color: 'error'
                        };
                    }
                    this.deleting = false;
                    return;
                }

                // Firebase 환경: Firebase Storage에서 삭제
                const storageRef = firebase.storage().ref(doc.path);
                await storageRef.delete();
                
                // 파일 목록에서 제거
                this.uploadedDocuments = this.uploadedDocuments.filter(d => d.name !== doc.name);
                
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

