<template>
    <v-card flat>
        <div style="padding-top:10px; padding-left:10px; padding-right:10px;">
            <!-- #region 상단 안내 문구 -->
            <v-alert
                dense
                color="blue"
                outlined
                type="info"
                style="text-align: left;"
            >
                {{ progressMessage }}
                <v-btn v-if="progressMessageOutput && progressMessageOutput.length > 0" icon x-small style="color: #2196F3;" @click="queryDialogTitle='Generator Output'; queryDialogContent = progressMessageOutput; isQueryDialogOpen = true;">
                    <v-icon>mdi-magnify</v-icon>
                </v-btn>
            </v-alert>
            <!-- #endregion -->
        </div>
        
        <div id="scroll_messageList"
            style="height: 100%; max-height: 60vh;
            overflow: auto; padding-left:10px; padding-right:10px; padding-bottom:10px;
            border-bottom: solid 2px rgba(0, 0, 0, 0.2);"
        >
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

                        <div v-if="!reponseQuery.errorMessage || reponseQuery.errorMessage.length === 0">
                            <div style="height: 18px;">
                                <pre style="font-size: small; text-align: left;">EVENT STORMING UPDATES</pre>
                            </div>
                            <div style="display: flex;" v-for="(query, index) in reponseQuery.queries" :key="index">
                                <pre style="font-size: small; text-align: left; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; max-width: 380px;">- {{ query.summary }}</pre>        
                                <v-btn icon x-small style="margin-top: 2px;" @click="queryDialogTitle='Event Storming Update: ' + query.summary; queryDialogContent = query.rawQuery; isQueryDialogOpen = true;">
                                    <v-icon>mdi-magnify</v-icon>
                                </v-btn>     
                            </div>
                        </div>
                        <div v-else>
                            <pre style="font-size: small; text-align: left;">AI 생성 결과를 처리하는 도중에 에러가 발생했습니다.</pre>
                            <pre style="font-size: small; text-align: left;">다시 시도해 주시길 바랍니다.</pre>
                            <pre style="font-size: small; text-align: left;">* 에러 메세지</pre>
                            <pre style="font-size: small; text-align: left; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; max-width: 380px;">{{ reponseQuery.errorMessage }}</pre>
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
import DebeziumTransactionManager from "./DebeziumTransactionManager.js"

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

            progressMessage: "Please input Debezium Logs to generate event storming updates",
            progressMessageOutput: "",

            messageObj: {
                modificationMessage: "",
                gwtRequestValue: {
                    givenObjects: null,
                    whenObjects: null,
                    thenObjects: null
                }
            },
            debeziumLogsToPrcess: [],
            gwtRequestValues: [],
            retryNum: 3
        }
    },
    created() {
        if(this.initValue.modelValue && this.initValue.modelValue.debeziumChatSaveObject) {
            this.initValue.manager = DebeziumTransactionManager.fromSaveObject(this.initValue.modelValue.debeziumChatSaveObject)
        }

        this.debeziumTransactionManager = this.initValue.manager
        this.responseQueries = this.debeziumTransactionManager.toStringObject()
    },
    methods: {
        getGenerater(client) {
            if(this.debeziumLogsGenerator === null) {
                this.debeziumLogsGenerator = new DebeziumLogsTabGenerator(client, this.messageObj, (errorObj) => {
                    alert(errorObj.message)
                    this.isGenerationFinished = true
                    this.progressMessage = "대기중..."
                })
            }
            return this.debeziumLogsGenerator
        },

        generate() {
            const getValidDebeziumLogsToProcess = (logs) => {
                const getDebeziumLogStrings = (logs) => {
                    return logs.match(/\{"schema":\{.*?"name":".*?\.Envelope".*?\},"payload":\{.*?\}\}/g)
                }

                let debeziumLogStrings = getDebeziumLogStrings(logs)
                if(!debeziumLogStrings || debeziumLogStrings.length === 0) {
                    throw new Error("입력된 Debezium 로그 데이터가 존재하지 않거나, 올바르지 않은 형식입니다. 입력된 Debezium 로그 데이터를 확인해주세요.")
                }

                return debeziumLogStrings
            }
                
            try {
                this.debeziumLogsToPrcess = getValidDebeziumLogsToProcess(this.debeziumLogs)
                this.messageObj.modificationMessage = this.debeziumLogsToPrcess.shift()

                this.isGenerationFinished = false
                if(this.debeziumLogsGenerator) this.debeziumLogsGenerator.modelMode = "generateGodTableDistributeGuidesPreStep"
                this.retryNum = 3
                this.$emit("generate")
            }
            catch(e) {
                console.error(e)
                alert(e.message)
            }
        },

        onModelCreated(model) {
            let transectionInfo = `(남은 트랜잭션 수: ${this.debeziumLogsToPrcess.length}, 생성된 문자 수: ${this.progressMessageOutput.length})`
            this.progressMessageOutput = model.modelRawValue

            switch(model.modelMode) {
                case "summaryPreprocessModelValue":
                    this.progressMessage = `이벤트 스토밍 정보 요약 중...  ${transectionInfo}`
                    break
                
                case "generateGodTableDistributeGuidesPreStep":
                    this.progressMessage = `God 테이블 분해에 대한 액션 생성 가이드 생성 중(STEP 1)...  ${transectionInfo}`
                    break

                case "generateGodTableDistributeGuides":
                    this.progressMessage = `God 테이블 분해에 대한 액션 생성 가이드 생성 중(STEP 2)...  ${transectionInfo}`
                    break

                case "generateEventCommandRelationGuides":
                    this.progressMessage = `이벤트/커맨드/관계에 대한 액션 생성 가이드 생성 중...  ${transectionInfo}`
                    break

                case "generateCommands":
                    this.progressMessage = `액션 생성 중...  ${transectionInfo}`
                    break
                
                case "generateGWT":
                    this.progressMessage = `생성된 커맨드에 대한 GWT 생성 중...  (남은 트랜잭션 수: ${this.debeziumLogsToPrcess.length}, 생성된 문자 수: ${this.progressMessageOutput.length}, 남은 GWT 요청 수: ${this.gwtRequestValues.length})`
                    break
            }
        },
        
        onGenerationFinished(model) {
            const getGWTRequestValues = (modelValue, queries) => {
                const getCommandObjects = (modelValue, queries) => {
                    const commandObjects = []
                    queries.forEach((query) => {
                        if(query && query.objectType === "Command" && query.action === "update" &&
                            query.ids.commandId && modelValue.elements[query.ids.commandId]
                        ) {
                            commandObjects.push(modelValue.elements[query.ids.commandId])
                        }
                    })
                    return commandObjects
                }

                const getGWTFromCommandObjects = (modelValue, commandObject) => {
                    const getAggregateObject = (modelValue, commandObject) => {
                        if(commandObject.aggregate === null || commandObject.aggregate.id === null) return null
                        return modelValue.elements[commandObject.aggregate.id]
                    }

                    const getEventObjects = (modelValue, commandObject) => {
                        const getCommandToEventRelations = (modelValue, commandObject) => {
                            return Object.values(modelValue.relations).filter((relation) => 
                                relation &&
                                relation._type === "org.uengine.modeling.model.Relation" &&
                                relation.from === commandObject.id && 
                                relation.targetElement._type === "org.uengine.modeling.model.Event"
                            )
                        }

                        const commandToEventRelations = getCommandToEventRelations(modelValue, commandObject)
                        if(commandToEventRelations.length === 0) return null

                        return commandToEventRelations.map((commandToEventRelation) => {
                            if(commandToEventRelation.to === null) return null
                            return modelValue.elements[commandToEventRelation.to]
                        }).filter((eventObject) => eventObject !== null)
                    }

                    const aggregateObject = getAggregateObject(modelValue, commandObject)
                    if(aggregateObject === null) return null

                    const eventObjects = getEventObjects(modelValue, commandObject)
                    if(eventObjects === null) return null

                    return {
                        givenObjects: [aggregateObject],
                        whenObjects: [commandObject],
                        thenObjects: eventObjects
                    }
                }

                const commandObjects = getCommandObjects(modelValue, queries)
                if(commandObjects.length === 0) return []

                let gwtRequestValues = []
                for(let commandObject of commandObjects) {
                    const gwtRequestValue = getGWTFromCommandObjects(modelValue, commandObject)
                    if(gwtRequestValue !== null) gwtRequestValues.push(gwtRequestValue)
                }
                return gwtRequestValues
            }

            const processGWTorNextDebeziumLog = (gwtRequestValue) => {
                const requestGWTRequestValue = (gwtRequestValue) => {
                    this.messageObj.gwtRequestValue = gwtRequestValue
                    this.debeziumLogsGenerator.modelMode = "generateGWT"
                    this.$emit("generate")
                    this.progressMessage = `생성된 커맨드에 대한 GWT 생성을 요청 중... (남은 트랜잭션 수: ${this.debeziumLogsToPrcess.length}, 남은 GWT 요청 수: ${this.gwtRequestValues.length})`
                }

                const processDebeziumLogsToPrcess = () => {
                    this.debeziumLogsGenerator.modelMode = "generateGodTableDistributeGuidesPreStep"
                    if(this.debeziumLogsToPrcess.length > 0) {
                        this.messageObj.modificationMessage = this.debeziumLogsToPrcess.shift()
                        this.isGenerationFinished = false
                        this.retryNum = 3
                        this.$emit("generate")
                        this.progressMessage = `God 테이블 분해에 대한 액션 생성 가이드 생성을 요청 중... (남은 트랜잭션 수: ${this.debeziumLogsToPrcess.length})`
                    } else {
                        this.isGenerationFinished = true
                        this.debeziumLogs = ""
                        this.progressMessage = "대기중..."
                    }
                }

                if(this.gwtRequestValues.length > 0)
                    requestGWTRequestValue(gwtRequestValue.shift())
                else
                    processDebeziumLogsToPrcess()
            }
            
            const processError = (model) => {
                if(this.retryNum > 0) {
                    if(model.isJsonParseError) {
                        this.progressMessage = `AI 출력 결과의 JSON 형태가 올바르지 않습니다. 재시도 중...`
                    }
                    else {
                        this.retryNum -= 1
                        this.progressMessage = `AI 출력 결과가 논리적으로 올바르지 않습니다. 재시도 중...(재시도 남은 횟수: ${this.retryNum})`
                    }
                    this.$emit("generate")
                } else {
                    if(model.errorMessage) alert("죄송합니다. 에러가 발생했습니다. 다시 시도해주세요.: " + model.errorMessage)
                    this.isGenerationFinished = true
                    this.progressMessage = "대기중..."
                }
            }

            if(model.errorMessage || model.isApplyError) {
                processError(model)
                return
            }

            switch(model.modelMode) {
                case "summaryPreprocessModelValue":
                    this.$emit("generate")
                    this.progressMessage = `God 테이블 분해에 대한 액션 생성 가이드 생성을 요청 중(STEP 1)... (남은 트랜잭션 수: ${this.debeziumLogsToPrcess.length})`
                    break
                
                case "generateGodTableDistributeGuidesPreStep":
                    this.$emit("generate")
                    this.progressMessage = `God 테이블 분해에 대한 액션 생성 가이드 생성을 요청 중(STEP 2)... (남은 트랜잭션 수: ${this.debeziumLogsToPrcess.length})`
                    break

                case "generateGodTableDistributeGuides":
                    this.$emit("generate")
                    this.progressMessage = `이벤트/커맨드/관계에 대한 액션 생성 가이드 생성을 요청 중... (남은 트랜잭션 수: ${this.debeziumLogsToPrcess.length})`
                    break
                
                case "generateEventCommandRelationGuides":
                    this.$emit("generate")
                    this.progressMessage = `액션 생성 가이드를 토대로 액션 생성을 요청 중... (남은 트랜잭션 수: ${this.debeziumLogsToPrcess.length})`
                    break

                case "generateCommands":
                    this.responseQueries = this.debeziumTransactionManager.toStringObject()
                    this.gwtRequestValues = getGWTRequestValues(this.debeziumLogsGenerator.client.modelValue, model.modelValue.queries)
                    processGWTorNextDebeziumLog(this.gwtRequestValues)
                    break
                
                case "generateGWT":
                    processGWTorNextDebeziumLog(this.gwtRequestValues)
                    break
                
                case "mockModelValue":
                    this.responseQueries = this.debeziumTransactionManager.toStringObject()
                    this.isGenerationFinished = true
                    this.debeziumLogs = ""
                    this.progressMessage = "대기중..."
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