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

                    <div style="height: 330px;">
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
                                    :value="test.solution ? true:false"
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
                            <v-card-title>Reason for modifying the code: </v-card-title>
                            <v-card-text>
                                <b>{{ result.solution }}</b>
                            </v-card-text>
                        </div>
                        <div v-for="(changes, changesIdx) in result.codeChanges" :key="changesIdx">
                            <v-card-text :id="resIdx + '_' + changesIdx">
                                <b>{{ changes.fileName }}</b>
                            </v-card-text>
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
                        </div>

                        <div v-if="result.errorLog">
                            <v-card-title>Bulid error log: </v-card-title>
                            <v-card-text style="color: red; height: 85px; overflow-y: scroll; margin-top: -15px;">
                                <b>{{ result.errorLog }}</b>
                            </v-card-text>
                        </div>

                        <v-divider></v-divider>
                    </div>
                    <div style="bottom: 3%; position: absolute; margin-top: 1%; right: 15px;">
                        <v-btn v-if="!isFixErrorMode" :disabled="startGitAction" :loading="startGitAction" @click="regenerate()" 
                            style="margin-right: 10px;">
                            Regenerate
                        </v-btn>
                        <v-btn v-if="isFixErrorMode" :disabled="startGitAction" :loading="startGitAction" @click="generate()" 
                            style="margin-right: 10px;" color="primary">
                            Request fix error
                        </v-btn>
                        <v-btn v-else :disabled="startGitAction" :loading="startGitAction" @click="commitToGit()" 
                            style="margin-right: 10px;" color="primary">
                            Push
                        </v-btn>
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
            messageList: Array,
            testFile: Object,
        },
        data() {
            return {
                selectedIdx: null,
                generator: null,
                isFixErrorMode: false,
                updateList: [],
                siTestResults: [],
                startGitAction: true,
                savedOpenAiMessageList: null,
                openAiMessageList: null,
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
            this.openAiMessageList = JSON.parse(JSON.stringify(this.messageList))
        },
        beforeDestroy: function () {

        },
        mounted: function () { 
            var me = this
            me.generate();

            me.$EventBus.$on('getActionLogs', function (log) {
                console.log(log)
                if(log === "All tests succeeded"){
                    alert("All tests succeeded")
                } else {
                    me.isErrGenMode = true
                    me.savedOpenAiMessageList = JSON.parse(JSON.stringify(me.openAiMessageList))
                    me.openAiMessageList = null
                    me.generator = new ErrorLogGenerator(me);
                    me.generator.generate();
                }
            })
        },
        methods: {
            editCode(obj){
                var me = this
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
                me.startGitAction = true
                me.generator = new SIGenerator(this);
                me.generator.generate();
            },
            regenerate(){
                for(var i = 0; i < this.updateList.length; i++){
                    this.siTestResults.pop()
                }
                this.generate()
            },
            commitToGit(){
                var me = this
                me.startGitAction = true
                me.$emit("startCommitWithSigpt", me.updateList)
            },
            onModelCreated(model){
                // console.log(model)
                // gen 된 결과 화면에 업데이트 
            },
            onGenerationFinished(model){
                var me = this
                if(me.isErrGenMode){
                    me.siTestResults[me.siTestResults.lastIndex].errorLog = model
                    me.openAiMessageList = JSON.parse(JSON.stringify(me.savedOpenAiMessageList))
                    me.isFixErrorMode = true
                    me.isErrGenMode = false
                } else {                    
                    me.openAiMessageList.push({
                        role: "assistant",
                        content: model
                    })
                    
                    try {
                        var selectNewResult = false
                        console.log(JSON.parse(model))
                        me.updateList = JSON.parse(model)
                        let dumyFile = []
                        dumyFile.push(me.testFile)
                        
                        let parseModel = JSON.parse(model)
                        parseModel.forEach((solution) => {
                            solution.codeChanges.forEach(function (changes){
                                changes.originFile = JSON.parse(JSON.stringify(dumyFile))
                                changes.originFile[0].code = changes.fileCode
                                changes.modifiedFile = JSON.parse(JSON.stringify(dumyFile))
                                changes.modifiedFile[0].code = changes.modifiedFileCode
                                changes.modifiedFile[0].name = changes.fileName
                            })
                            me.siTestResults.push(solution)
                            if(!selectNewResult){
                                me.onSelected(solution, me.siTestResults.lastIndex, 0)
                                selectNewResult = true
                            }
                        });
        
                        me.isFixErrorMode = false

                    } catch(e) {
                        me.generate()
                        console.log(e)
                        me.gitActionSnackBar.show = true
                        me.gitActionSnackBar.timeout = 5000
                        me.gitActionSnackBar.Text = "오류 검증 및 파일 업데이트 도중 문제가 발생하였습니다."
                        me.gitActionSnackBar.Color = "error"
                        me.gitActionSnackBar.icon="error"
                        me.gitActionSnackBar.title="Error"
                        // me.startGitAction = false
                    }
                }
                me.startGitAction = false
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