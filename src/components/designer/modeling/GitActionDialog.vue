<template>
    <div>
        <v-card flat style="height: 90vh; z-index:2;">
            <v-icon small @click="closeGitActionDialog()"
                style="font-size: 18px; position: absolute; right: 5px; top: 5px; z-index: 1;">mdi-close</v-icon>
            <div style="display: flex; max-height: 100%;">
                <div style="width: 400px; height: 88vh; overflow-y: scroll;">
                    <v-card-title style="margin-top: -10px; margin-bottom: -15px;">
                        Git Action Test Result
                    </v-card-title>

                    <div style="height: 330px;" :key="dialogRenderKey">
                        <v-list
                            nav 
                            dense
                            style="width:105%; min-width: 390px; margin:-5px -30px 0px -10px;"
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
                                            <!-- <Icon
                                                icon="mdi:file-document-minus-outline" width="20" height="20"
                                                style="color: red; position: relative; left: -30px; top: 20px;"
                                            /> -->
                                            <v-col style="margin-left:-15px; margin-right: 25px;">
                                                <v-list-item-subtitle
                                                        style="font-size: x-small;">
                                                    {{ testFile.subPath }}
                                                </v-list-item-subtitle>
                                                <v-list-item-title>
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
                                            <v-list-item-title>{{test.solutionType}}</v-list-item-title>
                                        </v-list-item-content>
                                    </template>
                                    <v-list-item dense v-for="(code, codeIdx) in test.codeChanges" :key="codeIdx" :style="`${testIdx}_${codeIdx}` == selectedIdx ? 'background-color: aliceblue;':''">
                                        <div style="cursor: pointer; margin-top: -10px;"
                                            @click="onSelected(testIdx, codeIdx)"
                                        >
                                            <v-row>
                                                <Icon
                                                    icon="mdi:file-document-alert-outline" width="20" height="20"
                                                    style="color: red; position: relative; left: -30px; top: 20px;"
                                                />
                                                <v-col style="margin-left:-35px; margin-right: 25px;">
                                                    <v-list-item-title style="margin-top:10px; margin-left:10px;">
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
                <v-card-text style="max-height: 100%; overflow-y: scroll;">
                    <div v-for="(result, resIdx) in siTestResults" :key="resIdx">
                        <div v-if="result.solution">
                            <!-- <v-card-title>Reason for modifying the code: </v-card-title> -->
                            <v-card-text>
                                <b>Solution: {{ result.solution }}</b>
                            </v-card-text>
                        </div>
                        <div v-for="(changes, changesIdx) in result.codeChanges" :key="changesIdx">
                            <v-expansion-panels v-model="changes.expansionValue">
                                <v-expansion-panel>
                                    <v-expansion-panel-header :id="resIdx + '_' + changesIdx">
                                        <div :key="dialogRenderKey">
                                            <b>{{ changes.fileName }}</b>
                                        </div>
                                    </v-expansion-panel-header>
                                    <v-expansion-panel-content>
                                        <code-viewer
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

                        <div v-if="result.errorLog" style="margin-top: 10px; margin-bottom: 10px;">
                            <div style="font-weight: bolder; font-size: .875rem;">
                                The following error occurred during testing
                            </div>
                            <v-expansion-panels>
                                <v-expansion-panel>
                                    <v-expansion-panel-header style="color: red; display: table-row; background-color: #fee2e3;">
                                        <div v-for="(err, idx) in result.errorLog" :key="idx" style="display: table-row; font-weight: bolder; font-size: .875rem; margin-bottom: 5px;">
                                            [ERROR] {{ err.fileName }}: {{ err.errorDetails }}
                                        </div>
                                    </v-expansion-panel-header>
                                    <v-expansion-panel-content>
                                        {{ result.fullErrorLog }}
                                    </v-expansion-panel-content>
                                </v-expansion-panel>
                            </v-expansion-panels>
                        </div>

                        <v-divider></v-divider>
                    </div>
                    <div v-if="!allTestSucceeded" style="float: right; margin-top: 10px;">
                        <div v-if="!startGitAction">
                            <v-btn @click="regenerate()" 
                                style="margin-right: 10px;">
                                Regenerate
                            </v-btn>
                            <v-btn @click="commitToGit()" 
                                style="margin-right: 10px;" color="primary">
                                Push
                            </v-btn>
                        </div>
                        <div v-else>
                            <div style="margin-bottom: 5px;">
                                <b v-if="isFirstCommit">
                                    Generating the business logic to pass the test ... 
                                </b>
                                <b v-else-if="isSolutionCreating">
                                    Generating a code fix for the file in error ...
                                </b>
                                <b v-else>
                                    Mvn testing is in progress ... 
                                </b>
                                <v-tooltip v-if="!isFirstCommit" bottom>
                                    <template v-slot:activator="{ on }">
                                        <v-btn
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
                            <v-btn :loading="!isSolutionCreating" :disabled="!isSolutionCreating" @click="stop()" style="margin-right: 10px; position: relative; float: right;">
                                <v-icon style="margin-right: 10px;">mdi-spin mdi-loading</v-icon>
                                Stop generating
                            </v-btn>
                        </div>
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
                dialogRenderKey: 0,
                lastIndex: 0,
                selectedIdx: null,
                resultLength: 0,
                isFirstCommit: true,
                startGitAction: true,
                allTestSucceeded: false,
                isSolutionCreating: false,

                codeList: null,
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
            me.copySelectedCodeList = JSON.parse(JSON.stringify(me.selectedCodeList))
            me.generate();

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
                } else {
                    me.fullErrorLog = log
                    me.model = null
                    me.generator = new ErrorLogGenerator(me);
                    me.generator.generate();
                }
            })
        },
        methods: {
            jumpToActions(){
                this.$emit("jumpToActions")
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
            generate(){
                var me = this
                me.model = 'gpt-4'
                me.startGitAction = true
                me.generator = new SIGenerator(this);
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
            commitToGit(){
                var me = this
                me.startGitAction = true
                me.isFirstCommit = false
                me.codeList = JSON.parse(JSON.stringify(me.copySelectedCodeList))
                me.$emit("startCommitWithSigpt", me.updateList)
            },
            setDialog(model, option){
                try {
                    var me = this
                    if(me.fullErrorLog){
                        me.siTestResults[me.lastIndex].errorLog = model
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
                            if(solution && solution.codeChanges){
                                solution.codeChanges.forEach(function (changes){
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
                                // me.onSelected(me.lastIndex + 1, 0)
                            }
                        });
                    }
                    
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
                                            errDetail = `An error called ${error.errorDetails} occurred in the ${codeSplit[error.lineNumber - 1]} part of the code content of the ${fileName} file.`
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
                            me.lastIndex = me.siTestResults.lastIndex
                            me.resultLength = me.siTestResults.length
                            me.generatedErrorDetails = null
                        }
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
                this.$emit("closeGitActionDialog")
            }
        }
    }
</script>
<style>
</style>