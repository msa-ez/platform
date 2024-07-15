<template>
    <v-card flat>
        <div id="scroll_messageList"
            style="height: 100%; max-height: 75vh;
            overflow: auto; padding:10px;
            border-bottom: solid 2px rgba(0, 0, 0, 0.2);"
        >
            <!-- #region 상단 안내 문구 -->
            <v-alert
                dense
                color="blue"
                outlined
                type="info"
                style="text-align: left;"
            >
                {{ progressMessage }}
                <v-btn v-if="progressMessageOutput && progressMessageOutput.length > 0" icon x-small style="margin-bottom: 4px; color: #2196F3;" @click="queryDialogTitle='Generator Output'; queryDialogContent = progressMessageOutput; isQueryDialogOpen = true;">
                    <v-icon>mdi-magnify</v-icon>
                </v-btn>
            </v-alert>
            <!-- #endregion -->


            <!-- #region AI가 출력시킬 채팅 내용들 -->
            <v-col cols="12" class="pa-0">
                <div v-for="(reponseQuery, index) in responseQueries" :key="index">
                    <v-sheet class="grey lighten-3 pa-2"
                        style="display:inline-block;
                            width: 415px;
                            text-align: left; 
                            margin-bottom:10px;
                            border-radius: 6px;"
                    >
                        <div style="height: 25px; display: flex; justify-content: space-between; align-items: center;">
                            <div style="display: flex;">
                                <pre style="font-size: small; text-align: left; font-weight: bold;">#{{ reponseQuery.hash }}</pre>
                                <v-btn icon x-small style="margin-left: 1px;" @click="logDialogTitle='Debezium Log #'+reponseQuery.hash; logDialogContent = reponseQuery.rawTransaction; isLogDialogOpen = true;">
                                    <v-icon>mdi-text</v-icon>
                                </v-btn>
                            </div>
                        </div>

                        <div style="height: 15px;">
                            <pre style="font-size: small; text-align: left;">USECASE: {{ reponseQuery.usecase }}</pre>
                        </div>

                        <div style="height: 20px;">
                            <pre style="font-size: small; text-align: left;">ACTOR: {{ reponseQuery.actor }}</pre>
                        </div>

                        <div>
                            <div style="height: 18px;">
                                <pre style="font-size: small; text-align: left;">COMMANDS</pre>
                            </div>
                            <div style="display: flex;" v-for="(query, index) in reponseQuery.queries" :key="index">
                                <pre style="font-size: small; text-align: left; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; max-width: 380px;">- {{ query.summary }}</pre>        
                                <v-btn icon x-small style="margin-top: 2px;" @click="queryDialogTitle=query.summary + ' Command'; queryDialogContent = query.rawQuery; isQueryDialogOpen = true;">
                                    <v-icon>mdi-magnify</v-icon>
                                </v-btn>     
                            </div>
                        </div>
                    </v-sheet>
                </div>                         
            </v-col>
            <!-- #endregion -->
        </div>

        <!-- #region 이벤트 스토밍 생성을 위한 Debezium Log 입력 창 -->
        <v-text-field
            v-model="debeziumLogs"
            class="prompt_field generator-ui-text-field"
            solo
            autofocus
            append-icon="mdi-send"
            @click:append="generate()"
            @keypress.enter="generate()"
            :disabled="!isGenerationFinished"
        >
        </v-text-field>
        <!-- #endregion -->
        

        <!-- #region 로그 내용을 표시하기 위한 다이얼로그 -->
        <v-dialog v-model="isLogDialogOpen" max-width="1000" max-height="1000">
            <v-card>
                <v-card-item>
                    <v-card-title style="display: flex;">
                        {{ logDialogTitle }}
                        <v-btn icon small style="margin-top: 2px; margin-left: 2px;" @click="copyToClipboard(logDialogContent)">
                            <v-icon>mdi-content-copy</v-icon>
                        </v-btn>  
                    </v-card-title>
        
                    <v-btn icon style="position:absolute; right:5px; top:5px;" @click="isLogDialogOpen = false">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-item>

                <v-card-text>
                    <v-textarea rows="15" v-model="logDialogContent"></v-textarea>
                </v-card-text>
            </v-card>
        </v-dialog>
        <!-- #endregion -->
        <!-- #region 쿼리 내용을 표시하기 위한 다이얼로그 -->
        <v-dialog v-model="isQueryDialogOpen" max-width="1000" max-height="1000">
            <v-card>
                <v-card-item>
                    <v-card-title style="display: flex;">
                        {{ queryDialogTitle }}
                        <v-btn icon small style="margin-top: 2px; margin-left: 2px;" @click="copyToClipboard(queryDialogContent)">
                            <v-icon>mdi-content-copy</v-icon>
                        </v-btn>  
                    </v-card-title>
        
                    <v-btn icon style="position:absolute; right:5px; top:5px;" @click="isQueryDialogOpen = false">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-item>

                <v-card-text>
                    <v-textarea rows="15" v-model="queryDialogContent"></v-textarea>
                </v-card-text>
            </v-card>
        </v-dialog>
        <!-- #endregion -->

        <v-snackbar v-model="showSnackbar" :timeout="2000">
            클립보드에 복사되었습니다.
        </v-snackbar>
    </v-card>
</template>
  
<script>
import DebeziumLogsTabGenerator from "./DebeziumLogsTabGenerator.js"

export default {
    name: 'DebeziumLogsTab',
    props: {
        initValue: {
            type: Object,
            required: false
        }
    },
    data() {
        return {
            responseQueries: [],
            debeziumLogs: "",
            isGenerationFinished: true,
            debeziumLogsGenerator: null,

            isLogDialogOpen: false,
            logDialogTitle: "",
            logDialogContent: "",
            showSnackbar: false,

            isQueryDialogOpen: false,
            queryDialogTitle: "",
            queryDialogContent: "",

            isShowUndoDialog: false,
            debeziumTransactionManager: null,

            progressMessage: "Please input Debezium Logs to generate event storming commands",
            progressMessageOutput: "",

            messageObj: {
                modificationMessage: ""
            },
            debeziumLogsToPrcess: []
        }
    },
    created() {
        this.debeziumTransactionManager = this.initValue.manager
        this.responseQueries = this.debeziumTransactionManager.toStringObject()
    },
    methods: {
        getGenerater(client) {
            if(this.debeziumLogsGenerator === null) {
                this.debeziumLogsGenerator = new DebeziumLogsTabGenerator(client, this.messageObj)
            }
            return this.debeziumLogsGenerator
        },

        generate() {
            const getValidDebeziumLogsToProcess = (logs) => {
                const getDebeziumLogStrings = (logs) => {
                    return logs.match(/\{"schema":\{.*?"name":".*?\.Envelope".*?\},"payload":\{.*?\}\}/g)
                }

                let debeziumLogStrings = getDebeziumLogStrings(logs)
                if(debeziumLogStrings.length === 0) {
                    throw new Error("No valid Debezium Logs found")
                }

                return debeziumLogStrings
            }

            try {
                this.debeziumLogsToPrcess = getValidDebeziumLogsToProcess(this.debeziumLogs)
                this.messageObj.modificationMessage = this.debeziumLogsToPrcess.shift()

                this.isGenerationFinished = false
                this.$emit("generate")
            }
            catch(e) {
                console.error(e)
                alert(e.message)
            }
        },

        onModelCreated(model) {
            switch(model.modelMode) {
                case "generateCommands":
                    this.progressMessageOutput = model.modelRawValue
                    this.progressMessage = `명령어 생성중... (남은 트렉젝션 수: ${this.debeziumLogsToPrcess.length}, 생성된 문자 수: ${this.progressMessageOutput.length})`
                    break

                case "summaryPreprocessModelValue":
                    this.progressMessageOutput = model.modelRawValue
                    this.progressMessage = `이벤트 스토밍 정보 요약중... (남은 트렉젝션 수: ${this.debeziumLogsToPrcess.length}, 생성된 문자 수: ${this.progressMessageOutput.length})`
                    break
            }
        },
        
        onGenerationFinished(model) {
            this.progressMessage = "대기중..."

            switch(model.modelMode) {
                case "generateCommands":
                    this.isGenerationFinished = true
                    this.debeziumLogs = ""
                    this.responseQueries = this.debeziumTransactionManager.toStringObject()

                    if(this.debeziumLogsToPrcess.length > 0) {
                        this.messageObj.modificationMessage = this.debeziumLogsToPrcess.shift()
                        this.isGenerationFinished = false
                        this.$emit("generate")
                    }
                    break

                case "summaryPreprocessModelValue":
                    this.$emit("generate")
                    break
            }
        },

        copyToClipboard(textToCopy) {
            navigator.clipboard.writeText(textToCopy).then(() => {
                this.showSnackbar = true;
            }).catch(err => {
                console.error('클립보드 복사 실패:', err);
            });
        }
    }
}
</script>