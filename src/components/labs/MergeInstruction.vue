<template>
    <div>
        <v-icon v-if="isOwner" :disabled="disableMergeIcon" @click="getInstructionDiffList()">mdi-source-merge</v-icon>
        <v-dialog v-model="openInstructionList" persistent width="1500" :key="keyforRerender">
            <v-card-title style="width: inherit; background-color: #0097e6; color: white;"><v-icon color="white">mdi-source-merge</v-icon>&nbsp;Merge Instruction</v-card-title>
                <div style="display: flex;">
                    <v-card style="width: auto;">
                        <v-list dense>
                            <v-subheader>Copied ClassList</v-subheader>
                            <v-list-item-group
                                color="primary"
                                v-model="selectListNumber"
                            >
                                <v-list-item
                                    v-for="(copyClassInfo, i) in copyClassList"
                                    @click="loadLabInstruction(copyClassInfo, i)"
                                    :key="i"
                                >
                                    <v-list-item-icon v-if="!copyClassInfo.userImage">
                                        <v-icon x-large id="test"
                                                style="width:42px;
                                            height:40px;
                                            margin:12px;
                                            margin-right:-20px;
                                            margin:0 auto;
                                            ">
                                            mdi-account-circle
                                        </v-icon>
                                    </v-list-item-icon>
                                    <v-list-item-avatar v-else>
                                        <v-avatar
                                                size="37"
                                                style="margin-right:3px;"
                                                id="test">
                                            <img
                                                    alt="Avatar"
                                                    :src="copyClassInfo.userImage">
                                        </v-avatar>
                                    </v-list-item-avatar>
                                <v-list-item-content>
                                    <v-list-item-title v-text="copyClassInfo.userName"></v-list-item-title>
                                    <v-list-item-title v-text="copyClassInfo.className"></v-list-item-title>
                                    <v-list-item-subtitle v-text="copyClassInfo.timeStamp"></v-list-item-subtitle>
                                </v-list-item-content>
                                </v-list-item>
                            </v-list-item-group>
                        </v-list>
                            
                    
                    </v-card>
                    
                    <v-card style="width: inherit; height: 600px;">
                        <div style="display: flex;">
                            <div style="text-align: center; width: 50%;"><b>Base</b></div>
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on, attrs }">
                                    <v-icon small v-bind="attrs" v-on="on" @click="MergeAll(cmOption)">mdi-arrow-left</v-icon>   
                                </template>
                                <span>Merge All</span>
                            </v-tooltip>
                            <div style="text-align: center; width: 50%;"><b>Branch</b></div>
                        </div>
                        <!-- <div v-if="!cmOption.orig">Select ClassId</div> -->
                            
                        
                        <codemirror class = "merge-instruction" :merge="true" :options="cmOption" @input="setNewInstruction" @scroll="onCmScroll"></codemirror>
                        <div style="float: right; margin-top: 20px;">
                            <v-btn @click="CancelMerge()" text>Cancel</v-btn>
                            <v-btn @click="mergeInstruction()" :disabled="disableMergeBtn" style="margin-right: 7px;" color="primary" text>Merge</v-btn>
                        </div>
                    </v-card>
                </div>
        </v-dialog>
        
    </div>
</template>
<script>
    import LabBase from "./LabStorageBase";
    import DiffMatchPatch from "diff-match-patch";
    const diffPatcher = new DiffMatchPatch();
    import { codemirror } from 'vue-codemirror'
    import LabLocator from './LabLocator'
 
    // require styles
    import 'codemirror/lib/codemirror.css'
    // merge js
    import 'codemirror/addon/merge/merge.js'
    // merge css
    import 'codemirror/addon/merge/merge.css'
    // google DiffMatchPatch
    window.diff_match_patch = DiffMatchPatch
    window.DIFF_DELETE = -1
    window.DIFF_INSERT = 1
    window.DIFF_EQUAL = 0

    var jp = require('jsonpath');
    var FileSaver = require('file-saver');
export default {
    name: "MergeInstruction",
    components: {
        codemirror,
        LabLocator,
    },
    mixins: [LabBase],
    props: {
        cmOption: Object,
        labInfo: Object,
    },
    data: () => ({
        newInstruction: null,
        disableMergeIcon: true,
        openInstructionList: false,
        keyforRerender: 0,
        disableMergeBtn: true,
        copyClassList: [],
        selectListNumber: null,
        isOwner: false,
        courseInfo: null,
    }),

    watch:{
        openInstructionList(){
            if (window.ipcRenderer) {
                if (this.openInstructionList) {
                    window.ipcRenderer.send("hideView");
                } else {
                    var width = $(".v-navigation-drawer--is-mobile").width() ? $(".v-main").width() - $(".v-navigation-drawer").width() : $(".v-main").width()
                    var height = $(".v-main").height()
                    window.ipcRenderer.send("resizeView", {
                        x: $(".v-navigation-drawer").width(),
                        y: $(".v-toolbar").height(),
                        width: width,
                        height: height
                    })
                }
            }
        },
        "labInfo.instructionMd":function(data){
            this.loadInstructionList()
        },
        courseInfo(){
            var me = this
            if (me.courseInfo != null) {
                if (me.courseInfo.ownerId && me.courseInfo.ownerId == this.myId) {
                    me.isOwner = true
                }
            }
            if (this.myId == 'jyjang@uengine.org' || this.myId == 'help@uengine.org'){
                me.isOwner = true
            }
        },
    },
    async mounted() {
        var me = this
        me.courseInfo = await this.getCourseInfo();
        this.loadInstructionList()
    },

    methods: {
        MergeAll(a){
            console.log(a)
            a.value = a.orig
        },
        async loadInstructionList(){
            var me = this
            try {
                //!!
                var instructionList = await me.getObject('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.courseId + '/instruction')
                var enrolledUserList = await me.list('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`enrolledUsers`))
                if(!enrolledUserList){
                    var enrolledUserList = await me.list('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getOldClassPath(`enrolledUsers`))
                }
                me.copyClassList = []
                if(instructionList){
                    Object.keys(instructionList).forEach(function(key){
                        if(instructionList[key][me.labInfo.labId]){
                            if(enrolledUserList){
                                Object.keys(enrolledUserList).forEach(function(data){
                                    if(enrolledUserList[data].photoURL && enrolledUserList[data].email == instructionList[key][me.labInfo.labId].userId){
                                        instructionList[key][me.labInfo.labId].userImage = enrolledUserList[data].photoURL
                                    }
                                })
                            }
                            if(instructionList[key][me.labInfo.labId].message != me.labInfo.instructionMd){
                                me.copyClassList.push(instructionList[key][me.labInfo.labId])
                                me.disableMergeIcon = false
                            }
                        }
                    })
                }
            } catch(e) {
                alert(e.message)
            }
        },
        setNewInstruction(newVal){
            // console.log(newVal)
            this.disableMergeBtn = false
            this.newInstruction = newVal
        },
        CancelMerge(){
            var me = this
            me.keyforRerender ++;
            me.selectListNumber = null
            me.openInstructionList = false
            me.cmOption.orig = ''
        },
        async mergeInstruction(){
            var me = this
            try {
                var message = {
                    userId: localStorage.getItem('email'),
                    userName: localStorage.getItem('userName'),
                    message: me.newInstruction,
                    instruction: true
                }
                me.putString(`storage://labs-msaez.io/running/${me.courseId}/labs/${me.labId}/instruction.md`, me.newInstruction)
                await me.delete('db://labs/' + me.getBucketByTenantId() + '/' + me.getClassPath('labs/' + me.labId) + '/instruction')
                await me.pushString('db://labs/' + me.getBucketByTenantId() + '/' + me.getClassPath('labs/' + me.labId) + '/instruction', message);
                console.log(me.newInstruction, message)
                me.labInfo.instructionMd = me.newInstruction
                me.keyforRerender ++;
                me.cmOption.orig = ''
                me.selectListNumber = null
                me.openInstructionList = false
            } catch(e) {
                console.log(e.message)
            }
        },
        async loadLabInstruction(copyClassInfo, i){
            var me = this
            // me.openInstructionList = false 
            me.keyforRerender ++;
            me.cmOption.orig = copyClassInfo.message
            me.selectListNumber = i
            me.disableMergeBtn = true
        },
        onCmScroll() {
            console.log('onCmScroll')
        },
        getInstructionDiffList(){
            var me = this
            me.disableMergeBtn = true
            me.openInstructionList = true
            me.selectListNumber = null
            me.cmOption.value = me.labInfo.instructionMd
            console.log(me.copyClassList[0])
            me.cmOption.orig = me.copyClassList[0].message
            me.selectListNumber = 0
            // me.keyforRerender ++;
        },

    }
}
</script>

<style>
    .merge-instruction .CodeMirror pre {
        padding-left: 40px !important;
    }
    .merge-instruction .CodeMirror-gutter {
        display: none !important;
    }
    .merge-instruction .CodeMirror-merge-copybuttons-right .CodeMirror-merge-copy{
        margin-right:40%; margin-top:220px;
    }
    .merge-instruction .CodeMirror-merge-scrolllock:after{
        display:none;
    }
   .merge-instruction .CodeMirror-merge, .CodeMirror-merge .CodeMirror{
       height:500px;
    }
</style>
