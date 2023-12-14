<template>
    <div>
        <v-card flat style="height: 90vh; z-index:2;">
            <v-icon small @click="closeGitActionDialog()"
                style="font-size: 18px; position: absolute; right: 5px; top: 5px; z-index: 1;">mdi-close</v-icon>
            <div style="display: flex; max-height: 100%;">
                <div style="width: 400px; height: 88vh; background-color: #1e1e1e;">
                    <v-card-title style="margin-top: -10px; margin-bottom: -15px; color: white;">
                        <v-progress-circular
                            v-if="startGitAction"
                            indeterminate
                            :size="20"
                            color="primary"
                            style="margin-right: 10px; margin-left: -5px;"
                        ></v-progress-circular>
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
                                            <v-list-item-title style="color: white">{{test.solutionType}}</v-list-item-title>
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
                                </v-list-group>
                            </v-list-group>
                        </v-list>
                    </div>
                </div>
                <v-divider vertical />
                <v-card-text style="max-height: 100%; overflow-y: scroll;" id="si_gpt">
                    <canvas v-if="initConfettiCnt < 3" ref="canvas" style="position: absolute; z-index: 99;"></canvas>
                    <div v-for="(result, resIdx) in siTestResults" :key="resIdx" style="margin: 10px 150px;">
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
                                <b style="margin-left: 9px;" :key="dialogRenderKey">{{ result.solution }} <span>{{ systemMsg }}</span></b>
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
                                        <div v-if="lastSolutionIdx && lastSolutionIdx == resIdx + '_' + changesIdx" :key="codeViewerRenderKey">
                                            <code-viewer
                                                class="gs-git-action-code-viewer"
                                                v-model="changes.originFile"
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
                            <v-expansion-panels style="margin-left: 40px; width: 92.9%;">
                                <v-expansion-panel>
                                    <v-expansion-panel-header style="color: white; display: table-row; background-color: #343541;">
                                        <div v-for="(err, idx) in result.errorLog" :key="idx" style="display: table-row; font-weight: 400; font-size: .875rem; margin-bottom: 5px;">
                                            [ERROR] {{ err.fileName }}: {{ err.errorDetails }}[{{ err.lineNumber }}]
                                        </div>
                                    </v-expansion-panel-header>
                                    <v-expansion-panel-content>
                                        <v-textarea
                                            filled
                                            auto-grow
                                            readonly
                                            v-model="result.fullErrorLog"
                                            style="font-size: small; margin-top: 10px;"
                                        ></v-textarea>
                                        <!-- {{ result.fullErrorLog }} -->
                                    </v-expansion-panel-content>
                                </v-expansion-panel>
                            </v-expansion-panels>
                        </div>

                        <!-- <v-divider></v-divider> -->
                    </div>
                    <div v-if="!allTestSucceeded" style="margin-left: 150px">
                        <div style="float: right;">
                            <div v-if="!startGitAction" style="margin-bottom: 20px;">
                                <v-btn @click="regenerate()" 
                                    style="margin-right: 10px;">
                                    Think again
                                </v-btn>
                                <v-btn @click="commitToGit()" 
                                    style="margin-right: 10px;" color="primary">
                                    Go ahead
                                </v-btn>
                            </div>
                            <div v-else>
                                <v-row style="margin-right: 20px; margin-top: 10px;">
                                    <v-switch
                                        style="margin-right: 10px; margin-top: 1px;"
                                        v-model="isAutoMode"
                                        :label="'Auto mode'"
                                    ></v-switch>
                                    <v-btn :disabled="!isSolutionCreating" @click="stop()" style="margin-right: 10px; position: relative; float: right;">
                                        Stop generating
                                    </v-btn>
                                </v-row>
                            </div>
                        </div>
                        <v-row v-if="startGitAction" style="margin-top: 10px;">
                            <v-avatar
                                size="35"
                                rounded
                            >
                                <img
                                    src="https://github.com/msa-ez/platform/assets/65217813/3d305118-565b-4ce7-a8b6-e6ca5d6eef49"
                                    alt="MSAEZ"
                                >
                            </v-avatar>
                            <div style="margin-left: 5px;">
                                <b v-if="isFirstCommit">
                                    Generating the business logic to pass the test ... 
                                </b>
                                <b v-else-if="isSolutionCreating">
                                    Generating a code fix for the file in error ...
                                </b>
                                <b v-else>
                                    Code push and test in progress ... 
                                </b>
                                <v-tooltip v-if="!isFirstCommit" bottom>
                                    <template v-slot:activator="{ on }">
                                        <v-btn
                                            :disabled="!gitActionPath"
                                            v-on="on"
                                            @click="jumpToActions()" 
                                            style="margin-left: -3px;" 
                                            icon
                                        >
                                            <v-icon style="font-size: 22px;">mdi-open-in-new</v-icon>
                                        </v-btn>
                                    </template>
                                    <span>Show github actions</span>
                                </v-tooltip>
                            </div>
                        </v-row>
                    </div>
                    <div v-else>
                        <v-card>
                            <v-card-text>
                                <div style="font-weight: bolder; font-size: .875rem;">
                                    <v-icon color="green" style="margin-right: 10px;">mdi-checkbox-marked-circle-outline</v-icon>Test succeeded !
                                </div>
                            </v-card-text>
                        </v-card>
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
                gitActionPath: null,
                dialogRenderKey: 0,
                lastIndex: 0,
                codeViewerRenderKey: 0,
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

                codeList: null,
                summarizedCodeList: {},
                copySelectedCodeList: null,
                updateList: [],
                siTestResults: [],

                fullErrorLog: null,
                savedGeneratedErrorDetails: null,
                generatedErrorDetails: null,

                generator: null,
                model: 'gpt-4',

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
                this.testFile.subPath = this.testFile.fullPath.replace(this.testFile.name, '')
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
                me.gitActionPath = path
            })
            me.$EventBus.$on('getActionLogs', function (log) {
                if(log === "All tests succeeded"){
                    me.startGitAction = false
                    me.isSolutionCreating = false
                    me.allTestSucceeded = true
                    me.gitActionSnackBar.timeout = 5000
                    me.gitActionSnackBar.Text = "All tests succeeded"
                    me.gitActionSnackBar.Color = "success"
                    me.gitActionSnackBar.icon="check_circle"
                    me.gitActionSnackBar.title="Success"
                    me.gitActionSnackBar.show = true
                    this.initConfetti();
                    this.render();
                } else {
                    if(!me.fullErrorLog){
                        // if(log.length > 55000){
                        //     me.fullErrorLog = log.slice(0, 55000)
                        // } else {
                            me.fullErrorLog = log
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

                if (this.confetti.length <= 10 && this.initConfettiCnt < 3) this.initConfetti();

                window.requestAnimationFrame(this.render);
            },

            jumpToActions(){
                if(this.gitActionPath) window.open(this.gitActionPath, "_blank")
            },
            stop(){
                this.startGitAction = false
            },
            editCode(obj){
                var me = this
                if(me.copySelectedCodeList[obj.name]){
                    me.copySelectedCodeList[obj.name] = obj.code
                }
                me.updateList.forEach(function (solution){
                    solution.codeChanges.forEach(function (changes){
                        if(changes.fileName == obj.name){
                            changes.modifiedFileCode = obj.code
                        }
                    })
                })
            },
            async summaryCodeList(){
                var me = this
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
                
                console.log(results);
                if(results){
                    results.similarItems.forEach(function (item){
                        me.summarizedCodeList[item.metadata.category] = me.codeList[item.metadata.category]
                    })
                } 
                me.summarizedCodeList[me.testFile.name] = me.codeList[me.testFile.name]
                Object.keys(me.codeList).some(function (key){
                    if(!me.summarizedCodeList[key]){
                        if(JSON.stringify(me.summarizedCodeList).length < 21000){
                            me.summarizedCodeList[key] = me.codeList[key]
                        } else {
                            return true;
                        }
                    }
                })
            },
            async generate(){
                var me = this
                me.model = 'gpt-4'
                me.startGitAction = true
                me.generator = new SIGenerator(this);
                await me.summaryCodeList()
                me.generator.generate();
            },
            regenerate(){
                if(this.updateList){
                    for(var i = 0; i < this.updateList.length; i++){
                        this.siTestResults.pop()
                    }
                    this.lastIndex = this.siTestResults.lastIndex
                    this.resultLength = this.siTestResults.length
                }
                if(this.savedGeneratedErrorDetails){
                    this.generatedErrorDetails = this.savedGeneratedErrorDetails
                }
                this.generate()
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
                me.selectedIdx = null
                me.gitActionPath = null
                me.startGitAction = true
                me.isFirstCommit = false
                me.siTestResults[me.lastIndex].userMessage = "Go ahead"
                me.scrollToBottom();
                me.codeList = JSON.parse(JSON.stringify(me.copySelectedCodeList))
                me.$emit("startCommitWithSigpt", me.updateList)
            },
            setDialog(model, option){
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
                        me.updateList = model
                        me.updateList.forEach((solution, solutionIdx) => {
                            me.siTestResults[me.resultLength + solutionIdx] = solution
                            if(solution && solution.codeChanges){
                                solution.codeChanges.forEach(function (changes, changesIdx){
                                    changes.originFile = JSON.parse(JSON.stringify(dumyFile))
                                    changes.originFile[0].code = me.codeList[changes.fileName]
                                    changes.modifiedFile = JSON.parse(JSON.stringify(dumyFile))
                                    changes.modifiedFile[0].code = changes.modifiedFileCode
                                    changes.modifiedFile[0].name = changes.fileName
                                    changes.expansionValue = 0
                                    if(changes && changes.fileName){
                                        me.copySelectedCodeList[changes.fileName] = changes.modifiedFileCode
                                    }
                                })
                                me.siTestResults[me.resultLength + solutionIdx] = solution
                                // me.onSelected(me.resultLength + solutionIdx, changesIdx)
                            }
                        });

                        if(!me.lastSolutionIdx 
                        || me.solutionNumber < me.updateList.lastIndex 
                        || (me.updateList[me.solutionNumber] && me.updateList[me.solutionNumber].codeChanges && me.codeChangeNumber < me.updateList[me.solutionNumber].codeChanges.lastIndex))
                        {
                            if(me.solutionNumber < me.updateList.lastIndex){
                                me.codeChangeNumber = 0
                                me.solutionNumber = me.updateList.lastIndex
                            } else {
                                if(me.updateList[me.solutionNumber] && me.updateList[me.solutionNumber].codeChanges){
                                    me.codeChangeNumber = me.updateList[me.solutionNumber].codeChanges.lastIndex
                                }
                            }
                            me.lastSolutionIdx = me.resultLength + me.solutionNumber + '_' + me.codeChangeNumber 
                            me.codeViewerRenderKey++;
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
                            me.fullErrorLog = null
                            me.generate()
                        } else {    
                            me.lastSolutionIdx = null
                            me.codeChangeNumber = 0                
                            me.solutionNumber = 0                
                            me.lastIndex = me.siTestResults.lastIndex
                            me.resultLength = me.siTestResults.length
                            me.generatedErrorDetails = null
                            me.codeViewerRenderKey++;
                            if(me.isAutoMode){
                                me.commitToGit()
                            }
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
</style>