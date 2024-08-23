<template>
    <div>
        <v-card flat style="height: 90vh; z-index:2; overflow: hidden;">
            <v-icon small @click="closeGitActionDialog()"
                style="font-size: 18px; position: absolute; right: 5px; top: 5px; z-index: 1;">mdi-close</v-icon>
            <div style="display: flex; max-height: 100%;">
                <div style="width: 400px; height: 88vh; background-color: #1e1e1e;">
                    <v-card-title style="margin-top: -10px; margin-bottom: -15px; color: white;">
                        Auto Implementation
                    </v-card-title>

                    <div style="height: 86vh; overflow-y: scroll;" :key="dialogRenderKey">
                        <v-list
                            nav 
                            dense
                            style="width:105%; min-width: 390px; margin:-5px -30px 0px -10px; background-color: #1e1e1e;"
                        >
                            <v-list-group
                                :value="true"
                                style="margin-left: -15px;"
                                no-action
                                sub-group
                            >
                                <template v-slot:activator>
                                    <div style="cursor: pointer;">
                                        <v-row>
                                            <v-col style="margin-left:-15px; margin-right: 25px;">
                                                <v-list-item-subtitle
                                                        style="font-size: x-small; color: lightgray;">
                                                    {{ testFile.subPath }}
                                                </v-list-item-subtitle>
                                                <v-list-item-title style="color: white">
                                                    {{ testFile.name }} 
                                                </v-list-item-title>
                                            </v-col>
                                        </v-row>
                                    </div>
                                </template>
                                <v-list-group
                                    v-for="(test, testIdx) in siTestResults" :key="testIdx"
                                    :value="test && test.solution ? true:false"
                                    style="margin-left: 15px;"
                                    no-action
                                    sub-group
                                >
                                    <template v-slot:activator>
                                        <v-list-item-content style="margin-left: -10px;">
                                            <v-list-item-title style="color: white">
                                                {{test.solutionType}}
                                                <v-progress-circular
                                                    v-if="isSolutionCreating && siTestResults.lastIndex == testIdx"
                                                    indeterminate
                                                    :size="15"
                                                    color="primary"
                                                    style="margin-left: 5px;"
                                                ></v-progress-circular>
                                            </v-list-item-title>
                                        </v-list-item-content>
                                    </template>
                                    <v-list-item dense v-for="(code, codeIdx) in test.codeChanges" :key="codeIdx" :style="`${testIdx}_${codeIdx}` == selectedIdx ? 'background-color: #000000;':''">
                                        <div style="cursor: pointer; margin-top: -10px;"
                                            @click="onSelected(testIdx, codeIdx)"
                                        >
                                            <v-row>
                                                <Icon
                                                    icon="mdi:file-document-alert-outline" width="20" height="20"
                                                    style="color: white; position: relative; left: -30px; top: 20px;"
                                                />
                                                <v-col style="margin-left:-35px; margin-right: 25px;">
                                                    <v-list-item-title style="margin-top:10px; margin-left:10px; color: white">
                                                        {{ code.fileName }} 
                                                    </v-list-item-title>
                                                </v-col>
                                            </v-row>
                                        </div>
                                    </v-list-item>
                                    <div class="rollBack" v-if="test.sha">
                                        <div class="line"></div>
                                        <v-tooltip bottom>
                                            <template v-slot:activator="{ on }">
                                                <v-chip v-on="on" style="margin-left: -25px;" small v-if="test.sha" @click="rollBack(test.sha, testIdx)">
                                                    <v-icon small>mdi-undo-variant</v-icon>
                                                </v-chip>
                                            </template>
                                            <span>Roll back and start over from here</span>
                                        </v-tooltip>
                                        <div class="line"></div>
                                    </div>
                                </v-list-group>
                            </v-list-group>
                        </v-list>
                    </div>
                </div>
                <v-divider vertical />
                <v-card-text style="max-height: 100%; overflow-y: scroll;" id="si_gpt">
                    <canvas v-if="initConfettiCnt < 2" ref="canvas" style="position: absolute;"></canvas>
                    <div style="margin-left: 150px;">
                        <div style="font-weight: bolder; font-size: .875rem; margin-top: 30px; margin-bottom: 25px;">
                            <v-avatar 
                                size="35"
                                rounded
                                style="margin-right: 5px;"
                            >
                                <img
                                    src="https://github.com/msa-ez/platform/assets/65217813/3d305118-565b-4ce7-a8b6-e6ca5d6eef49"
                                    alt="MSAEZ"
                                >
                            </v-avatar>
                            Generating the business logic to pass the test ... 
                            <v-progress-circular
                                v-if="siTestResults.length == 0"
                                indeterminate
                                :size="15"
                                color="primary"
                                style="margin-left: 3px;"
                            ></v-progress-circular>
                        </div>
                    </div>
                    <div v-for="(result, resIdx) in siTestResults" :key="resIdx" style="margin: 10px 150px; z-index: 9;">
                        <div v-if="result.solution">
                            <!-- <v-card-title>Reason for modifying the code: </v-card-title> -->
                            <v-card-text style="margin-left: -15px;">
                                <v-avatar
                                    size="35"
                                    rounded
                                >
                                    <img
                                        src="https://github.com/msa-ez/platform/assets/65217813/3d305118-565b-4ce7-a8b6-e6ca5d6eef49"
                                        alt="MSAEZ"
                                    >
                                </v-avatar>
                                <b style="margin-left: 9px;" :key="dialogRenderKey">{{ result.solution }} <span v-if="result.codeChanges">{{ systemMsg }}</span></b>
                            </v-card-text>
                        </div>
                        <div v-for="(changes, changesIdx) in result.codeChanges" :key="changesIdx" style="margin-left: 40px; margin-right: 40px; margin-bottom: 12px;">
                            <v-expansion-panels v-model="changes.expansionValue">
                                <v-expansion-panel>
                                    <v-expansion-panel-header :id="resIdx + '_' + changesIdx" style="background-color: #343541; color: white;">
                                        <div :key="dialogRenderKey">
                                            <b>{{ changes.fileName }}</b>
                                        </div>
                                    </v-expansion-panel-header>
                                    <v-expansion-panel-content style="background-color: #1e1e1e;">
                                        <div v-if="lastSolutionIdx && lastSolutionIdx == resIdx + '_' + changesIdx">
                                            <code-viewer
                                                class="gs-git-action-code-viewer"
                                                v-model="changes.modifiedFile"
                                                :editMode="true"
                                                :readOnly="false"
                                                :isGitActionDialog="true"
                                                style="padding: 0 !important;"
                                            ></code-viewer>
                                        </div>
                                        <code-viewer
                                            v-else
                                            class="gs-git-action-code-viewer"
                                            :type="'diff'"
                                            :create-value="changes.originFile"
                                            v-model="changes.modifiedFile"
                                            :editMode="true"
                                            :readOnly="false"
                                            :isGitActionDialog="true"
                                            style="padding: 0 !important;"
                                            @editCodeForActionDialog="editCode"
                                        ></code-viewer>
                                    </v-expansion-panel-content>
                                </v-expansion-panel>
                            </v-expansion-panels>
                        </div>

                        <div v-if="result.userMessage">
                            <div style="font-weight: bolder; font-size: .875rem; margin-top: 30px; margin-bottom: 25px;">
                                <v-avatar 
                                    size="35"
                                    rounded
                                    style="margin-right: 5px;"
                                >
                                    <img
                                        :src="userImg"
                                        alt="User"
                                    >
                                </v-avatar>
                                {{ result.userMessage }}
                            </div>
                        </div>

                        <div style="margin-left: 12.5px;" v-if="result.compilerMessageIdx === 0 || result.compilerMessageIdx">
                            <v-row>
                                <div style="font-weight: bolder; font-size: .875rem; margin-top: 30px; margin-bottom: 25px;">
                                    <v-avatar 
                                        size="35"
                                        rounded
                                        style="margin-right: 5px;"
                                    >
                                        <img
                                            src="https://github.com/msa-ez/platform/assets/65217813/a33fc1b6-6fc3-422a-8ae6-75d0248855d5"
                                            alt="Compiler"
                                        >
                                    </v-avatar>
                                    Push code and testing in progress ... 
                                    <v-progress-circular
                                        v-if="startGitAction && !result.errorLog"
                                        indeterminate
                                        :size="15"
                                        color="primary"
                                        style="margin-left: 3px;"
                                    ></v-progress-circular>
                                </div>
                                <v-tooltip v-if="actionPathList[result.compilerMessageIdx]" bottom>
                                    <template v-slot:activator="{ on }">
                                        <v-btn
                                            v-on="on"
                                            @click="jumpToActions(result.compilerMessageIdx)" 
                                            style="margin-left: -3px; margin-top: 29px;"
                                            icon
                                        >
                                            <v-icon style="font-size: 22px;">mdi-open-in-new</v-icon>
                                        </v-btn>
                                    </template>
                                    <span>See detail</span>
                                </v-tooltip>
                            </v-row>
                        </div>

                        <div v-if="result.errorLog" style="margin-top: 25px; margin-bottom: 10px;">
                            <div style="font-weight: bolder; font-size: .875rem;">
                                <v-avatar 
                                    size="35"
                                    rounded 
                                    style="margin-right: 5px;"
                                >
                                    <img
                                        src="https://github.com/msa-ez/platform/assets/65217813/a33fc1b6-6fc3-422a-8ae6-75d0248855d5"
                                        alt="Compiler"
                                    >
                                </v-avatar>
                                The following error occurred during testing
                            </div>
                            <v-expansion-panels style="margin-left: 40px; width: 92.9%; margin-top: 10px;">
                                <v-expansion-panel>
                                    <v-expansion-panel-header style="color: white; background-color: #343541;">
                                        <v-row no-gutters>
                                            <v-col cols="10" v-for="(err, idx) in result.errorLog" :key="idx" style="font-weight: 400; font-size: .875rem; margin-bottom: 5px;">
                                                [ERROR] {{ err.fileName }}: {{ err.errorDetails }}<span v-if="err.lineNumber">[{{ err.lineNumber }}]</span>
                                            </v-col>
                                        </v-row>
                                    </v-expansion-panel-header>
                                    <v-expansion-panel-content>
                                        <v-textarea
                                            filled
                                            auto-grow
                                            readonly
                                            v-model="result.fullErrorLog"
                                            style="font-size: small; margin-top: 10px;"
                                        ></v-textarea>
                                    </v-expansion-panel-content>
                                </v-expansion-panel>
                            </v-expansion-panels>
                        </div>

                        <div v-if="result.systemMessage">
                            <div style="font-weight: bolder; font-size: .875rem; margin-top: 30px; margin-bottom: 25px;">
                                <v-avatar 
                                    size="35"
                                    rounded
                                    style="margin-right: 5px;"
                                >
                                    <img
                                        src="https://github.com/msa-ez/platform/assets/65217813/3d305118-565b-4ce7-a8b6-e6ca5d6eef49"
                                        alt="MSAEZ"
                                    >
                                </v-avatar>
                                Generating a code fix for the file in error ...
                                <v-progress-circular
                                    v-if="!result.stopLoading"
                                    indeterminate
                                    :size="15"
                                    color="primary"
                                    style="margin-left: 3px;"
                                ></v-progress-circular>
                            </div>
                        </div>

                        <!-- <v-divider></v-divider> -->
                    </div>
                    <div v-if="!allTestSucceeded" style="margin-left: 161px; z-index: 99; margin-right: 202px; margin-top: 30px;">
                        <div v-if="!startGitAction">
                            <v-row>
                                <v-avatar 
                                    size="35"
                                    rounded
                                    style="margin-right: 6px; margin-top: 6px;"
                                >
                                    <img
                                        :src="userImg"
                                        alt="User"
                                    >
                                </v-avatar>
                                <v-text-field
                                    v-if="!isAutoMode"
                                    v-model="prompt"
                                    solo
                                    label="Enter your request"
                                    append-icon="mdi-send"
                                    @click:append="regenerate(prompt)"
                                    @keydown.enter="regenerate(prompt)"
                                    clearable
                                ></v-text-field>
                            </v-row>
                            <div style="float: right; margin-top: -10px; margin-right: -12px;">
                                <v-btn @click="regenerate()">
                                    Think again
                                </v-btn>
                                <v-btn @click="commitToGit()" 
                                    style="margin-left: 10px;"
                                    color="primary">
                                    Go ahead
                                </v-btn>
                            </div>
                        </div>
                        <div v-else style="position: absolute; bottom: 10px; right: 15px;">
                            <v-row>
                                <v-switch v-if="commitCnt < 15"
                                    style="margin-top: 1px;"
                                    v-model="isAutoMode"
                                    :label="'Auto mode'"
                                ></v-switch>
                                <v-btn :disabled="!isSolutionCreating" @click="stop()" style="margin-left: 10px; margin-right: 10px;">
                                    Stop generating
                                </v-btn>
                            </v-row>
                        </div>
                    </div>
                    <div v-else style="margin-left: 150px; margin-right: 150px; z-index: 9;">
                        <div style="margin-top: 25px; margin-bottom: 10px;">
                            <div style="font-weight: bolder; font-size: .875rem;">
                                <v-avatar 
                                    size="35"
                                    rounded 
                                    style="margin-right: 5px;"
                                >
                                    <img
                                        src="https://github.com/msa-ez/platform/assets/65217813/a33fc1b6-6fc3-422a-8ae6-75d0248855d5"
                                        alt="Compiler"
                                    >
                                </v-avatar>
                                All tests passed
                            </div>
                            <v-expansion-panels v-model="successLogPanel" style="margin-left: 40px; width: 92.9%; margin-top: 10px;">
                                <v-expansion-panel>
                                    <v-expansion-panel-header style="color: white; background-color: #343541;">
                                        <v-row>
                                            <div style="width: 55%; margin-top: 19px; font-weight: bolder; font-size: .875rem;">
                                                <v-icon color="green" style="margin-right: 10px; margin-left: 5px;">mdi-checkbox-marked-circle-outline</v-icon>Test success !
                                            </div>
                                            <div style="width: 43%;">
                                                <v-btn
                                                    style="text-align: center;
                                                    text-align: center;
                                                    height: 40px;
                                                    line-height: 40px;
                                                    margin:10px 0px 10px 0px;
                                                    width:40%;
                                                    margin-right: 10px;"
                                                    color="primary"
                                                    v-on="on" @click="openIDE('gitpod')"
                                                >Open Gitpod</v-btn>
                                                <v-btn
                                                    style="text-align: center;
                                                    text-align: center;
                                                    height: 40px;
                                                    line-height: 40px;
                                                    margin:10px 0px 10px 0px;
                                                    width:55%;"
                                                    color="primary"
                                                    v-on="on" @click="openIDE('codespace')"
                                                >Open Codespaces</v-btn>
                                            </div>
                                        </v-row>
                                    </v-expansion-panel-header>
                                    <v-expansion-panel-content style="height: 450px; overflow-y: scroll;">
                                        <v-textarea
                                            filled
                                            auto-grow
                                            readonly
                                            v-model="successLog"
                                            style="font-size: small; margin-top: 10px;"
                                        ></v-textarea>
                                    </v-expansion-panel-content>
                                </v-expansion-panel>
                            </v-expansion-panels>
                        </div>
                    </div>
                </v-card-text>
            </div>
            <v-snackbar
                    v-model="gitActionSnackBar.show"
                    :timeout="gitActionSnackBar.timeout"
                    auto-height
                    :color="gitActionSnackBar.Color"
                    multi-line
                    style="bottom:8%"
            >
                <v-layout align-center pr-4>
                    <v-icon v-if="gitActionSnackBar.icon" class="pr-3" dark large>{{ gitActionSnackBar.icon }}</v-icon>
                    <v-layout column>
                        <div v-if="gitActionSnackBar.title">
                            <strong>{{ gitActionSnackBar.title }}</strong>
                        </div>
                        <div>{{ gitActionSnackBar.Text }}</div>
                    </v-layout>
                </v-layout>
                <template v-slot:action="{ attrs }">
                    <v-btn
                            color="white"
                            text
                            small
                            v-bind="attrs"
                            @click="gitActionSnackBar.show = false"
                    >
                        Close
                    </v-btn>
                </template>
            </v-snackbar>
        </v-card>
    </div>
</template>

<script>
    import CodeViewer from "../CodeViewer";
    import SIGenerator from './generators/SIGenerator';
    import ErrorLogGenerator from './generators/ErrorLogGenerator';
    import { VectorStorage } from "vector-storage";

    export default {
        name: 'git-action-dialog',
        mixins:[],
        components: {
            CodeViewer,
        },
        props: {
            selectedCodeList: Object,
            testFile: Object,
        },
        data() {
            return {
                openAiMessageList: [],
                prompt: null,
                // isFirstGenerate: true,
                commitMsg: null,
                commitCnt: 0,
                actionPathList: [],
                initConfettiCnt: 0,
                canvas: null,
                ctx: null,
                confetti: [],
                confettiCount: 300,
                gravity: 0.5,
                terminalVelocity: 5,
                drag: 0.075,
                colors: [
                    { front: 'red', back: 'darkred' },
                    { front: 'green', back: 'darkgreen' },
                    { front: 'blue', back: 'darkblue' },
                    { front: 'yellow', back: 'darkyellow' },
                    { front: 'orange', back: 'darkorange' },
                    { front: 'pink', back: 'darkpink' },
                    { front: 'purple', back: 'darkpurple' },
                    { front: 'turquoise', back: 'darkturquoise' }
                ],

                userImg: null,
                systemMsg: null,
                dialogRenderKey: 0,
                lastIndex: 0,
                solutionCnt: 0,
                lastSolutionIdx: null,
                solutionNumber: 0,
                codeChangeNumber: 0,
                selectedIdx: null,
                resultLength: 0,
                isAutoMode: true,
                isFirstCommit: true,
                startGitAction: true,
                allTestSucceeded: false,
                isSolutionCreating: false,
                successLogPanel: null,

                codeList: null,
                summarizedCodeList: {},
                copySelectedCodeList: null,
                siTestResults: [],

                fullErrorLog: null,
                successLog: null,
                savedGeneratedErrorDetails: null,
                generatedErrorDetails: null,
                modifiedHistory: [],

                generator: null,
                model: 'gpt-4o',

                gitActionSnackBar: {
                    Text: '',
                    show: false,
                    Color: null,
                    icon: null,
                    title: null,
                    timeout: null,
                },
            }
        },
        watch: {
            
        },
        computed: {
            
        },
        created:function () {
            if(this.testFile){
                if(this.testFile.fullPath){
                    this.testFile.subPath = this.testFile.fullPath.replace(this.testFile.name, '')
                } else {
                    this.testFile.subPath = ''
                }
                // this.testFile.code = ''
            }
        },
        beforeDestroy: function () {

        },
        mounted: function () { 
            var me = this
            me.codeList = JSON.parse(JSON.stringify(me.selectedCodeList))
            Object.keys(me.codeList).forEach(function (key){
                if(key.includes("Test.java") && key != me.testFile.name){
                    delete me.codeList[key]
                }
            })
            me.copySelectedCodeList = JSON.parse(JSON.stringify(me.selectedCodeList))
            me.generate();

            me.$EventBus.$on('setActionId', function (path) {
                me.actionPathList.push(path)
            })
            me.$EventBus.$on('getCommitId', function (sha) {
                me.siTestResults[me.lastIndex].sha = sha
            })
            me.$EventBus.$on('rollBackCodeList', function (codeList) {
                me.copySelectedCodeList = codeList
            })
            me.$EventBus.$on('getActionLogs', function (logInfo) {
                if(logInfo.state === "success"){
                    me.startGitAction = false
                    me.isSolutionCreating = false
                    me.allTestSucceeded = true
                    me.gitActionSnackBar.timeout = 5000
                    me.gitActionSnackBar.Text = "All tests succeeded"
                    me.gitActionSnackBar.Color = "success"
                    me.gitActionSnackBar.icon="check_circle"
                    me.gitActionSnackBar.title="Success"
                    me.gitActionSnackBar.show = true
                    me.successLog = logInfo.log
                    me.successLogPanel = 0
                    me.initConfetti();
                    me.render();
                    me.scrollToBottom()
                } else {
                    if(!me.fullErrorLog){
                        // if(log.length > 55000){
                        //     me.fullErrorLog = log.slice(0, 55000)
                        // } else {
                            me.fullErrorLog = logInfo.log
                        // }
                        me.model = null
                        me.generator = new ErrorLogGenerator(me);
                        me.generator.generate();
                    }
                }
            })

            if (window.countryCode == 'ko') {
                me.systemMsg = '다음과 같이 코드를 수정해도 되겠습니까 ?'
            } else {
                me.systemMsg = 'Can I modify the code as follows ?'
            }
            if(localStorage.getItem("picture")){
                me.userImg = localStorage.getItem("picture")
            }

            const element = document.getElementById('si_gpt');
            element.addEventListener('scroll', function() {
                if(element.scrollTop + element.clientHeight >= element.scrollHeight){
                    me.selectedIdx = null
                } 
            });
        },
        methods: {
            async rollBack(sha, idx){
                var me = this
                me.$app.try({
                    context: me,
                    async action(me){
                        me.siTestResults.splice(idx + 1);
                        me.lastIndex = me.siTestResults.lastIndex
                        me.resultLength = me.siTestResults.length
                        
                        me.siTestResults[me.lastIndex].userMessage = null
                        me.siTestResults[me.lastIndex].errorLog = null
                        me.siTestResults[me.lastIndex].fullErrorLog = null
                        me.siTestResults[me.lastIndex].compilerMessageIdx = null
                        me.siTestResults[me.lastIndex].systemMessage = false 
                        me.siTestResults[me.lastIndex].stopLoading = false
        
                        me.commitMsg = me.siTestResults[me.lastIndex].solutionType + ': ' + me.siTestResults[me.lastIndex].solution
                        
                        me.$emit("rollBack", sha)
                    }
                })
            },
            openIDE(type) {
                this.$emit('openIDE', type)
            },
            randomRange(min, max) {
                return Math.random() * (max - min) + min;
            },
            initConfetti() {
                this.canvas = this.$refs.canvas;
                this.ctx = this.canvas.getContext('2d');

                for (let i = 0; i < this.confettiCount; i++) {
                    this.confetti.push({
                    color: this.colors[Math.floor(this.randomRange(0, this.colors.length))],
                    dimensions: { x: this.randomRange(10, 20), y: this.randomRange(10, 30) },
                    position: { x: this.randomRange(0, this.canvas.width), y: this.canvas.height - 1 },
                    rotation: this.randomRange(0, 2 * Math.PI),
                    scale: { x: 1, y: 1 },
                    velocity: { x: this.randomRange(-25, 25), y: this.randomRange(0, -50) }
                    });
                }
                this.initConfettiCnt++;
            },
            render() {
                this.canvas.width = 1390;
                this.canvas.height = 880;
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

                this.confetti.forEach((confetto, index) => {
                    let width = confetto.dimensions.x * confetto.scale.x;
                    let height = confetto.dimensions.y * confetto.scale.y;

                    this.ctx.translate(confetto.position.x, confetto.position.y);
                    this.ctx.rotate(confetto.rotation);

                    confetto.velocity.x -= confetto.velocity.x * this.drag;
                    confetto.velocity.y = Math.min(confetto.velocity.y + this.gravity, this.terminalVelocity);
                    confetto.velocity.x += Math.random() > 0.5 ? Math.random() : -Math.random();

                    confetto.position.x += confetto.velocity.x;
                    confetto.position.y += confetto.velocity.y;

                    if (confetto.position.y >= this.canvas.height) this.confetti.splice(index, 1);
                    if (confetto.position.x > this.canvas.width) confetto.position.x = 0;
                    if (confetto.position.x < 0) confetto.position.x = this.canvas.width;

                    confetto.scale.y = Math.cos(confetto.position.y * 0.1);
                    this.ctx.fillStyle = confetto.scale.y > 0 ? confetto.color.front : confetto.color.back;

                    this.ctx.fillRect(-width / 2, -height / 2, width, height);
                    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
                });

                if (this.confetti.length <= 10 && this.initConfettiCnt < 2) this.initConfetti();

                window.requestAnimationFrame(this.render);
            },

            jumpToActions(idx){
                window.open(this.actionPathList[idx], "_blank")
            },
            stop(){
                this.isAutoMode = false
                this.startGitAction = false
            },
            editCode(obj){
                var me = this
                if(me.copySelectedCodeList[obj.name]){
                    me.copySelectedCodeList[obj.name] = obj.code
                }
            },
            async summaryCodeList(){
                var me = this
                await me.$app.try({
                    context: me,
                    async action(me){

                        let query
                        let apiKey = await me.generator.getToken();
        
                        me.summarizedCodeList = {}
        
                        const vectorStore = new VectorStorage({ openAIApiKey: apiKey });
                        Object.keys(me.codeList).forEach(async function (key){
                            await vectorStore.addText(me.codeList[key], {
                                category: key,
                            });
                        })
                        if(me.generatedErrorDetails){
                            query = `Error list: ${JSON.stringify(me.generatedErrorDetails)}
        What files do I need to modify and what related files do I need to fix the errors in the error list?`
                        } else {
                            query = `To pass the test, you must implement domain logic in the ${me.testFile.name} file.`
                        }
        
                        const results = await vectorStore.similaritySearch({
                            query: query,
                            k: 10,
                        });
                        
                        if(results){
                            results.similarItems.forEach(function (item){
                                me.summarizedCodeList[item.metadata.category] = me.codeList[item.metadata.category]
                            })
                        } 
                        me.summarizedCodeList[me.testFile.name] = me.codeList[me.testFile.name]
                        Object.keys(me.codeList).some(function (key){
                            if(!me.summarizedCodeList[key]){
                                if(JSON.stringify(me.summarizedCodeList).length < 30000){
                                    me.summarizedCodeList[key] = me.codeList[key]
                                } else {
                                    return true;
                                }
                            }
                        })
                    }
                })
            },
            async generate(){
                var me = this
                me.commitMsg = null
                me.model = 'gpt-4o'
                me.startGitAction = true
                me.generator = new SIGenerator(this);
                if(!me.prompt){
                    await me.summaryCodeList()
                }

                if(me.siTestResults && me.siTestResults.length > 0){
                    for(var i = 0; i < me.siTestResults.length; i++){
                        let obj = {
                            solution:'',
                            error:[],
                            codeChanges:{
                                fileName: '',
                                changes: []
                            }
                        }
                        let result = me.siTestResults[i]

                        if(result.solution){
                            obj['solution'] = result.solution
                        }

                        if(result.errorLog && result.errorLog.length > 0){
                            for(var j = 0; j < result.errorLog.length; j++){
                                obj['error'].push(result.errorLog[j])
                            }
                        }

                        if(result.codeChanges && result.codeChanges.length > 0){
                            for(var j = 0; j < result.codeChanges.length; j++){
                                obj['codeChanges'].fileName = result.codeChanges[j].fileName
                                if(result.codeChanges[j].modifiedFile){
                                    obj['codeChanges'].changes.push(result.codeChanges[j].modifiedFile[0].code)
                                }
                            }
                        }
                        me.modifiedHistory.push(obj)
                    }
                }

                me.generator.generate();
            },
            regenerate(prompt){
                var me = this
                me.$app.try({
                    context: me,
                    async action(me){
                        if(prompt){
                            me.siTestResults[me.lastIndex].userMessage = prompt
                        } else {
                            if(me.solutionCnt){
                                for(var i = 0; i < me.solutionCnt; i++){
                                    me.siTestResults.pop()
                                }
                                me.lastIndex = me.siTestResults.lastIndex
                                me.resultLength = me.siTestResults.length
                            }
                            if(me.savedGeneratedErrorDetails){
                                me.generatedErrorDetails = me.savedGeneratedErrorDetails
                            }
                        }
                        me.generate()
                    }
                })
            },
            scrollToBottom() {
                const element = document.getElementById('si_gpt');
                if (element && (this.isAutoMode && !this.selectedIdx)) {
                    setTimeout(() => {
                        element.scrollTo({
                            top: element.scrollHeight,
                            behavior: 'smooth'
                        });
                    }, 500)
                }
            },
            commitToGit(){
                var me = this
                me.$app.try({
                    context: me,
                    async action(me){
                        me.prompt = null
                        me.openAiMessageList = []
                        me.selectedIdx = null
                        me.startGitAction = true
                        me.isFirstCommit = false
                        me.siTestResults[me.lastIndex].compilerMessageIdx = me.commitCnt;
                        me.commitCnt++;
                        if(!me.isAutoMode){
                            me.siTestResults[me.lastIndex].userMessage = "Go ahead"
                        }
                        me.scrollToBottom();
                        me.codeList = JSON.parse(JSON.stringify(me.copySelectedCodeList))
                        let commitData = {
                            codeList: me.codeList,
                            message: me.commitMsg
                        }
                        me.$emit("startCommitWithSigpt", commitData)
                        if(me.commitCnt >= 15){
                            me.isAutoMode = false
                        }
                    }
                })
            },
            setDialog(model, option){
                if(model){
                    try {
                        var me = this
                        if(me.fullErrorLog){
                            me.siTestResults[me.lastIndex].errorLog = [...new Set(model.map(JSON.stringify))].map(JSON.parse)
                            if(me.siTestResults[me.lastIndex].errorLog.length > 30){
                                me.generator.stop();
                            }
                        } else {  
                            if(!me.startGitAction){
                                me.generator.stop();
                            }  
                            if(!me.isSolutionCreating){
                                me.isSolutionCreating = true
                            }   
                            let dumyFile = []
                            dumyFile.push(me.testFile)
                            model.forEach((solution, solutionIdx) => {
                                if(!me.siTestResults[me.resultLength + solutionIdx]){
                                    me.siTestResults[me.resultLength + solutionIdx] = {}
                                }
                                    me.siTestResults[me.resultLength + solutionIdx].solution = solution.solution
                                    me.siTestResults[me.resultLength + solutionIdx].solutionType = solution.solutionType
                                    me.commitMsg = solution.solutionType + ': ' + solution.solution
                                if(solution && solution.codeChanges){
                                    solution.codeChanges.forEach(function (changes, changesIdx){
                                        if(changes){
                                            if(!me.siTestResults[me.lastIndex].stopLoading){
                                                me.siTestResults[me.lastIndex].stopLoading = true
                                            }
                                            if(!me.siTestResults[me.resultLength + solutionIdx].codeChanges){
                                                me.siTestResults[me.resultLength + solutionIdx].codeChanges = []
                                            }
                                            if(!me.siTestResults[me.resultLength + solutionIdx].codeChanges[changesIdx]){
                                                me.siTestResults[me.resultLength + solutionIdx].codeChanges[changesIdx] = {}
                                            }

                                            if(!me.siTestResults[me.resultLength + solutionIdx].codeChanges[changesIdx].originFile){
                                                me.siTestResults[me.resultLength + solutionIdx].codeChanges[changesIdx].originFile = JSON.parse(JSON.stringify(dumyFile))
                                                me.siTestResults[me.resultLength + solutionIdx].codeChanges[changesIdx].expansionValue = 0
                                            }
                                            
                                            if(changes.fileName){
                                                me.copySelectedCodeList[changes.fileName] = changes.modifiedFileCode
                                                me.siTestResults[me.resultLength + solutionIdx].codeChanges[changesIdx].fileName = changes.fileName
                                                me.siTestResults[me.resultLength + solutionIdx].codeChanges[changesIdx].originFile[0].code = me.codeList[changes.fileName]
                                                
                                                if(changes.modifiedFileCode){
                                                    let copyDumyFile = JSON.parse(JSON.stringify(dumyFile))
                                                    copyDumyFile[0].name = changes.fileName
                                                    copyDumyFile[0].code = changes.modifiedFileCode
                                                    me.siTestResults[me.resultLength + solutionIdx].codeChanges[changesIdx].modifiedFile = copyDumyFile
                                                }
                                            }

                                        }
                                    })
                                }
                            });
        
                            if(!me.lastSolutionIdx 
                            || me.solutionNumber < model.lastIndex 
                            || (model[me.solutionNumber] && model[me.solutionNumber].codeChanges && me.codeChangeNumber < model[me.solutionNumber].codeChanges.lastIndex))
                            {
                                if(me.solutionNumber < model.lastIndex){
                                    me.codeChangeNumber = 0
                                    me.solutionNumber = model.lastIndex
                                } else {
                                    if(model[me.solutionNumber] && model[me.solutionNumber].codeChanges){
                                        me.codeChangeNumber = model[me.solutionNumber].codeChanges.lastIndex
                                    }
                                }
                                me.lastSolutionIdx = me.resultLength + me.solutionNumber + '_' + me.codeChangeNumber 
                            }
                        }
                        me.scrollToBottom();
                        
                        if(option == 'onGenerationFinished'){
                            me.startGitAction = false
                            me.isSolutionCreating = false
                            if(me.fullErrorLog){
                                me.generatedErrorDetails = []
                                model.some(function (error){
                                    if(error.fileName && error.errorDetails){
                                        var errDetail = ''
                                        var fileName = error.fileName
                                        if(fileName.includes("/")){
                                            var fileNameSplit = fileName.split("/")
                                            fileName = fileNameSplit[fileNameSplit.lastIndex]
                                        }
                                        errDetail = `An error called ${error.errorDetails} occurred in file ${fileName}.`
                                        if(error.lineNumber && me.codeList[fileName]){
                                            var codeSplit = me.codeList[fileName].split('\n')
                                            if(codeSplit[error.lineNumber - 1] && codeSplit[error.lineNumber - 1] != ""){
                                                errDetail = `An error called "${error.errorDetails}" occurred in the ${codeSplit[error.lineNumber - 1]} part of the code content of the ${fileName} file.`
                                            } 
                                        } 
                                        me.generatedErrorDetails.push(errDetail)
                                    } else {
                                        me.generatedErrorDetails = model
                                        return true;
                                    }
                                })
                                me.savedGeneratedErrorDetails = me.generatedErrorDetails
                                me.siTestResults[me.lastIndex].fullErrorLog = me.fullErrorLog
                                me.siTestResults[me.lastIndex].systemMessage = true 
                                me.siTestResults[me.lastIndex].stopLoading = false
                                me.fullErrorLog = null
                                me.generate()
                            } else {    
                                me.lastSolutionIdx = null
                                me.codeChangeNumber = 0                
                                me.solutionNumber = 0                
                                me.lastIndex = me.siTestResults.lastIndex
                                me.resultLength = me.siTestResults.length
                                me.generatedErrorDetails = null
                                me.solutionCnt = model.length
                                // if(me.isFirstGenerate){
                                //     me.startGitAction = true
                                //     me.codeList = JSON.parse(JSON.stringify(me.copySelectedCodeList))
                                //     me.generate()
                                //     me.isFirstGenerate = false
                                // } else {
                                    if(me.isAutoMode){
                                        me.commitToGit()
                                    } else {
                                        me.prompt = null
                                        me.openAiMessageList.push({
                                            content: JSON.stringify(model),
                                            role: "assistant"
                                        })
                                    }
                                // }
                            }
                            me.scrollToBottom();
                        } else {
                            me.dialogRenderKey++;
                        } 
    
                    } catch(e) {
                        console.log(e)
                        me.gitActionSnackBar.timeout = 5000
                        me.gitActionSnackBar.Text = "오류 검증 및 파일 업데이트 도중 문제가 발생하였습니다. 잠시 후 다시 시도해주세요."
                        me.gitActionSnackBar.Color = "error"
                        me.gitActionSnackBar.icon="error"
                        me.gitActionSnackBar.title="Error"
                        me.gitActionSnackBar.show = true
                        me.startGitAction = false
                    }
                }
            },
            onModelCreated(model){
                this.setDialog(model, 'onModelCreated')
            },
            onGenerationFinished(model){
                this.setDialog(model, 'onGenerationFinished')
            },
            onSelected(solutionIdx, codeIdx){
                var me = this
                me.selectedIdx = solutionIdx + '_' + codeIdx;
                const element = document.getElementById(me.selectedIdx);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            },
            getComponent(componentName) {
                let component = null
                let parent = this.$parent
                while (parent && !component) {
                    if (parent.$options.name === componentName) {
                        component = parent
                    }
                    parent = parent.$parent
                }
                return component
            },
            closeGitActionDialog(){
                this.generator.stop();
                this.$emit("closeGitActionDialog")
            }
        }
    }
</script>
<style>
.line {
  flex-grow: 1;
  height: 0.1px;
  background-color: #e0e0e0;
}

.rollBack {
  display: flex;
  align-items: center;
}
</style>