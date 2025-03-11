<template>
    <v-card class="fill-height d-flex flex-column">
        <v-card-title class="py-2">
            Mermaid 다이어그램
            <v-spacer></v-spacer>
            <v-btn
                small
                color="primary"
                class="mr-2"
                @click="renderDiagram"
                :disabled="!editableMermaidString"
                title="다이어그램 렌더링"
            >
                <v-icon left>mdi-refresh</v-icon>
                렌더링
            </v-btn>
            <v-btn
                small
                icon
                @click="copyToClipboard"
                :disabled="!editableMermaidString"
                title="복사하기"
            >
                <v-icon>mdi-content-copy</v-icon>
            </v-btn>
        </v-card-title>
        
        <v-divider></v-divider>
        
        <v-row no-gutters class="flex-grow-1">
            <!-- 코드 편집 영역 -->
            <v-col cols="12" md="5" class="code-panel">
                <v-card flat class="fill-height">
                    <v-card-subtitle class="py-1">Mermaid 코드 편집</v-card-subtitle>
                    <v-card-text class="code-container pa-2">
                        <v-textarea
                            v-model="editableMermaidString"
                            outlined
                            hide-details
                            class="mermaid-editor"
                            rows="10"
                            placeholder="여기에 Mermaid 코드를 입력하세요..."
                            auto-grow
                            spellcheck="false"
                        ></v-textarea>
                    </v-card-text>
                </v-card>
            </v-col>
            
            <v-divider vertical></v-divider>
            
            <!-- 다이어그램 표시 영역 -->
            <v-col cols="12" md="7" class="diagram-panel">
                <v-card flat class="fill-height">
                    <v-card-subtitle class="py-1">렌더링된 다이어그램</v-card-subtitle>
                    <v-card-text class="pa-2 diagram-container">
                        <vue-mermaid-string 
                            :key="mermaidString"
                            :value="mermaidString"
                            class="diagram"
                        />
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
        
        <v-snackbar
            v-model="showCopyNotification"
            :timeout="2000"
            bottom
            right
        >
            클립보드에 복사되었습니다!
        </v-snackbar>
    </v-card>
</template>

<script>
    import VueMermaidString from 'vue-mermaid-string'

    export default {
        name: 'vue-mermaid-string-test',
        components: {
            VueMermaidString
        },
        props: {
            initialMermaidString: {
                type: String,
                default: 'graph TD\nA-->B\nB-->C\nC-->D\nD-->A',
                required: false
            }
        },
        data() {
            return {
                mermaidString: '',
                editableMermaidString: '',
                showCopyNotification: false
            }
        },
        created() {
            // 초기 값 설정
            this.editableMermaidString = this.initialMermaidString;
            this.mermaidString = this.initialMermaidString;
        },
        methods: {
            renderDiagram() {
                this.mermaidString = this.editableMermaidString;
            },
            copyToClipboard() {
                if (!this.editableMermaidString) return;
                
                navigator.clipboard.writeText(this.editableMermaidString)
                    .then(() => {
                        this.showCopyNotification = true;
                    })
                    .catch(err => {
                        console.error('복사에 실패했습니다:', err);
                    });
            }
        }
    }
</script>

<style scoped>
.fill-height {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.code-panel, .diagram-panel {
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.code-container {
    background-color: #f5f5f5;
    border-radius: 4px;
    overflow: auto;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.mermaid-editor {
    height: 100%;
    font-family: monospace;
}

.diagram-container {
    overflow: auto;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.diagram {
    width: 100%;
    height: 100%;
}

@media (max-width: 960px) {
    .v-row {
        flex-direction: column;
    }
    
    .code-panel, .diagram-panel {
        height: 50%;
    }
}
</style>