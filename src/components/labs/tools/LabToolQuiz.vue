<template xmlns:v-on="http://www.w3.org/1999/xhtml" >

<div style = "margin-top:-30px; margin-bottom:-10px; padding-top:50px;">
    <div style="float: right; margin-right: 5%; margin-top: -25px;">
        <div v-if="isAdmin && !quizLoading" style="position: fixed; z-index: 999;">
            <v-icon x-large @click="setNewQuiz()">mdi-plus-circle</v-icon>
        </div>
    </div>
    <div v-if="quizLoading">
        <v-col cols="11" style = "margin-left:60px;">
            <v-skeleton-loader type="image"></v-skeleton-loader>
            <v-skeleton-loader style = "margin-top:30px;" type="image"></v-skeleton-loader>
            <v-skeleton-loader style = "margin-top:30px;" type="image"></v-skeleton-loader>
            <v-skeleton-loader style = "margin-top:30px;" type="image"></v-skeleton-loader>
        </v-col>
    </div>
    <div v-else>
        <v-card v-for="(quiz, index) in quizList" :key="index" style = "width:90%; margin-left:5%; margin-bottom:20px; margin-top:20px;">
            <v-chip color = "primary" style = "margin:10px;">Quiz {{index+1}}</v-chip>
            <div v-if="isAdmin" style="float: right; padding: 10px;">
                <v-icon @click="openDeleteDialog(index, quizList)">mdi-delete</v-icon>
                <v-icon @click="onEditMode(index, quizList)">mdi-pencil</v-icon>
            </div>
            <div style = "padding-left:12px; padding-right:12px; padding-bottom:0; font-size:20px; font-weight:700;" v-if="setQuizNumber != index" :style="submitted ? 'pointer-events: none;':''">
                <quiz @change="onAnswer" :quizId="quizIds[index]" v-model="value">
                    <v-runtime-template :template="'<div slot=default>' + quizList[index] + '</div>'"/>
                </quiz>
            </div>
            <div v-if="setQuizNumber == index">
                <v-card>
                    <vue-simplemde v-model="setQuizText" ref="markdownEditor"/>
                    <v-btn @click="editQuizInfo(setQuizText)" color="primary" style="position: absolute; top: 0; right: 0; margin: 8px; z-index:999;">save</v-btn>
                    <v-btn @click="setQuizNumber=null" text style="position: absolute; top: 0; z-index: 999; right: 0; margin: 8px; margin-right: 80px;">cancel</v-btn>
                </v-card>
            </div>
        </v-card>
    </div>
    
    <v-card v-if="openAddQuizInfo" style = "width:90%; margin-left:5%; margin-bottom:20px; margin-top:20px;">
        <v-chip color = "primary" style = "margin:10px;">Quiz {{newQuizNumber+1}}</v-chip>
        <div style="padding: 20px;">
            <v-btn color="primary" style="float: right; margin-top: -60px; margin-right: 10px;" @click="addQuiz(newQuizText, newQuizNumber)">생성</v-btn>
            <v-btn style="float: right; margin-top: -60px; margin-right: 80px;" @click="openAddQuizInfo = false">취소</v-btn>
            <vue-simplemde v-model="newQuizText" ref="markdownEditor"/>
        </div>
    </v-card>
    <div style ="width:100%; height:50px;"></div>
    <v-btn color="primary" v-if="!quizLoading" :disabled="submitted || !isLogin" style = "position:absolute; right:5%; bottom:20px;" @click="openSubmitDialog()"> 이대로 제출 </v-btn>
    <!-- <v-btn v-if="!submitted" disabled> 제출 되었습니다 </v-btn> -->
    <div>
        <v-dialog 
            v-model="submitDialog"
             width="500"
        >
            <v-card-title style="background-color: #3498db; color: white;">submit</v-card-title>
            <v-card style="height: 120px; width: 500px; padding:10px;">
                <v-checkbox
                    v-model="checkToSubmit"
                    :label="'제출하시겠습니까? 제출시 수정이 불가합니다.'"
                    color="#3498db"
                    style="margin-top: -4px;"
                ></v-checkbox>
                <v-btn :disabled="!checkToSubmit" style="float: right; margin-top: 17px;" text color="#3498db" @click="submit()"><b>확인</b></v-btn>
                <v-btn style="float: right; margin-top: 17px; margin-right:7px;" text @click="submitDialog=false, checkToSubmit=false">취소</v-btn>
            </v-card>
        </v-dialog>
        <v-dialog 
            v-model="deleteDialog"
             width="500"
        >
            <v-card-title style="background-color: #3498db; color: white;">delete</v-card-title>
            <v-card style="height: 120px; width: 500px; padding:10px;">
                <v-checkbox
                    v-model="checkToDelete"
                    :label="'해당 퀴즈가 삭제됨을 확인했습니다.'"
                    color="#3498db"
                    style="margin-top: -4px;"
                ></v-checkbox>
                <v-btn :disabled="!checkToDelete" style="float: right; margin-top: 17px;" text color="#3498db" @click="deleteQuiz(quizIdx, setQuizList)"><b>삭제</b></v-btn>
                <v-btn style="float: right; margin-top: 17px; margin-right:7px;" text @click="deleteDialog=false, checkToDelete=false">취소</v-btn>
            </v-card>
        </v-dialog>
    </div>
        
</div>
</template>


<script>
    
    import VRuntimeTemplate from "v-runtime-template";
    import Quiz from './quiz/Quiz'
    // import LabBase from '../LabBase'
    import LabBase from "../LabStorageBase";


    var jp = require('jsonpath'); 

    

    export default {
        name: 'lab-tool-quiz',
        mixins: [LabBase],
        // mixins: [StorageBase],
        // labbase 수정 필요

        components: {
            VRuntimeTemplate
        },
        props: {
            value: Object,
            small: Boolean,
            passAll: Boolean,
            certi: Object,
            labInfo: Object,
            classInfo: Object,
            basicPassed: Number,
        },
        data() {
            return {
                results: {},
                quizList: [],
                quizIds: [],
                e1: 1,
                setQuizNumber: null,
                setQuizText: null,
                submitDialog: false,
                submitted: false,
                checkToSubmit: false,
                pathforEditQuiz: null,
                quizLoading: true,
                isLogin: false,
                openAddQuizInfo: false,
                newQuizNumber: 0,
                newQuizText: null,

                checkToDelete: false,
                deleteDialog: false,
                quizIdx: null,
                setQuizList: null,
            }
        },

        watch:{
            // value(){
            //     this.results = this.value.result.quiz;
            // }
            
        },

        created: async function () {
            var me = this;
            // this.results = this.value
            // console.log(this.results)

            Vue.component('quiz', Quiz)

            var quizPaths = await this.list(`storage://labs-msaez.io/running/${this.courseId}/labs/${this.labId}/quiz/`, true);
            this.pathforEditQuiz = quizPaths
            if(quizPaths){
                for(var i=0; i<quizPaths.length; i++){
                    var key = quizPaths[i].name;
                    key = key.substring(key.lastIndexOf("/")+1, key.lastIndexOf(".html"));
                    me.quizIds[i] = key;                        

                    me.quizList[i] = await this.getString('storage://labs-msaez.io/' + quizPaths[i].name);
                    me.newQuizNumber = me.quizList.length
                };
            }

            me.quizList.__ob__.dep.notify();
            this.quizLoading = false
            this.$EventBus.$emit('setLabTool', 'quiz')
        },
        async mounted() {
            var me = this
            var submittedUser = localStorage.getItem('email')
            if(submittedUser == null)
                me.isLogin = false
            else
                me.isLogin = true
            var convertEmail = submittedUser.replace(/\./gi, '_')
            //firebase
            this.submitted = await me.getString('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.courseId + '/classes/' + me.classId + '/labs/' + me.labId + "/userInfo/" + convertEmail + "/submitted")
            if(!this.submitted){
                this.submitted = await me.getString('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getOldClassPath('labs/' + me.labId) + "/userInfo/" + convertEmail + "/submitted")
            }
            var setClassId = me.classId.replace('running@', '')
            this.watch('db://labs/' + me.getBucketByTenantId() + '/' + me.courseId + '/classes/' + setClassId + '/labs/' + me.labInfo.labId + '/quizList', function (data) {
                me.quizList = data
            })
        },
        beforeDestroy(){
            this.$EventBus.$emit('setLabTool', 'null')
        },
        methods: {
            async addQuiz(quizText, quizIndex){
                var me = this
                try {
                    var time = Date.now()
                    console.log(time)
                    // var quizNumber = quizIndex + 1
                    // if(quizNumber - 9 <= 0){
                    //     var test = 'quiz0'
                    // } else {
                    //     var test = 'quiz'
                    // }
                    var newCheckPoint = {
                        text: "Quiz " + time,
                        javascript: "result.quiz.quiz" + time + ".score == 1"
                    }
                    // console.log(newCheckPoint)
                    var copyLabInfo = JSON.parse(JSON.stringify(this.labInfo))
                    copyLabInfo.checkPoints.push(newCheckPoint)
                    await me.putObject('storage://labs-msaez.io/running/' + me.courseId + "/labs" + '/' + me.labInfo.labId + "/quiz/" + "quiz" + time + ".html", quizText)
                    await me.putObject('storage://labs-msaez.io/running/' + me.courseId + "/labs" + '/' + me.labInfo.labId + "/Lab_Metadata.json", copyLabInfo)
                    if(!me.quizList || me.quizList == null) me.quizList = [] 
                    me.quizList[quizIndex] = quizText
                    var setClassId = me.classId.replace('running@', '')
                    me.putObject('db://labs/' + me.getBucketByTenantId() + '/' + me.courseId + '/classes/' + setClassId + '/labs/' + me.labInfo.labId + '/quizList', me.quizList)
                    me.openAddQuizInfo = false
                    me.newQuizText = null
                    me.newQuizNumber ++;
                    me.labInfo = copyLabInfo
                    this.$EventBus.$emit("checkPointsUpdate", newCheckPoint)

                    var quizPaths = await this.list(`storage://labs-msaez.io/running/${this.courseId}/labs/${this.labId}/quiz/`, true);
                    this.pathforEditQuiz = quizPaths
                } catch (e) {
                    console.log(e.message)
                }

            },
            setNewQuiz(){
                var me = this
                me.openAddQuizInfo = true
                me.newQuizText = "<!--정답을 선택하려면 <check /> right 옵션을 추가하세요-->\n<div>\n질문\n</div> \n<check right id='1' text='답변'></check>\n<check id='2' text='답변2'></check>"
                this.$nextTick(() => {
                    window.scrollTo(0, document.body.scrollHeight);
                });
            },
            editQuizInfo(setQuizText){
                var me = this
                try {
                    me.quizList[me.setQuizNumber] = setQuizText
                    //minio
                    me.putString('storage://labs-msaez.io/' + me.pathforEditQuiz[me.setQuizNumber].name, setQuizText)
                    me.setString('db://labs/' + me.getBucketByTenantId() + '/' + me.getClassPath(`labs/${me.labId}/quizList/${me.setQuizNumber}`), setQuizText)
                    // console.log(this.pathforEditQuiz[this.setQuizNumber], setQuizText)
                    me.setQuizNumber = null
                } catch(e){
                    alert(e.message)
                }
                
            },
            openDeleteDialog(index, quizList){
                this.deleteDialog = true
                this.quizIdx = index
                this.setQuizList = quizList
            },
            async deleteQuiz(index, quizList){
                var me = this
                try {
                    var userId = localStorage.getItem('email')
                    quizList.splice(index, 1)
                    var nameParts = me.labInfo.checkPoints[index].javascript.split(".")
                    console.log(nameParts[2])
                    var quizIndex = nameParts[2]
                    me.labInfo.checkPoints.splice(index, 1)
                    console.log(quizList)
                    console.log(me.labInfo.checkPoints)
                    
                    await me.delete(`storage://labs-msaez.io/running/${me.courseId}/labs/${me.labId}/quiz/${quizIndex}.html`)
                    me.putObject(`storage://labs-msaez.io/running/${me.courseId}/labs/${me.labId}/Lab_Metadata.json`, me.labInfo)
    
                    await me.delete('db://labs/' + me.getBucketByTenantId() + '/' + me.getClassPath(`labs/${me.labId}/quizList`))
                    me.putObject('db://labs/' + me.getBucketByTenantId() + '/' + me.getClassPath(`labs/${me.labId}/quizList`), quizList)
                    if(me.labId){
                        await me.delete('db://labs/' + me.getBucketByTenantId() + '/' + me.getClassPath(`labs/${me.labId}/userInfo/${userId.replace(/\./gi, '_')}/checkpointResults`))
                        me.putObject('db://labs/' + me.getBucketByTenantId() + '/' + me.getClassPath(`labs/${me.labId}/userInfo/${userId.replace(/\./gi, '_')}/checkpointResults`), me.labInfo.checkPoints)
                    }
                    me.newQuizNumber --;
                    me.deleteDialog = false
                    me.checkToDelete = false
                    this.$EventBus.$emit("DeletecheckPoints", me.labInfo.checkPoints)

                } catch(e){
                    console.log(e.message)
                }
            },
            onEditMode(index, quizList){
                this.setQuizText = quizList[index]
                this.setQuizNumber = index
            },
            onAnswer(result){
                this.results[result.quizId] = result;
                // this.openSubmitDialog();                
            },

            openSubmitDialog(){
                var me = this
                me.submitDialog = true
            },
            async submit() {
                var me = this
                try{
                    this.$emit('change', {quiz: this.results});
                    var quizResults = this.results

                    var passed = false
                    var passCnt = 0
                    var disableCnt = 0
                    var userName = localStorage.getItem("userName")
                    if(me.labInfo.certificate){
                        if(me.labInfo.mandatory && me.labInfo.mandatory.attend && me.attendance){
                            // me.passAllCheckPoints = true
                            passed = true
                        }
                        if(!passed){
                            if(me.labInfo.mandatory.checkPoint && me.labInfo.mandatory.checkPoint <= me.basicPassed){
                                passed = true
                            }
                        }
                    }
                    var submittedUser = localStorage.getItem('email')
                    var convertEmail = submittedUser.replace(/\./gi, '_')
                
                    this.submitted = true 
                    if(me.labId){
                        me.setString('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.courseId + '/classes/' + me.classId + '/labs/' + me.labId + "/userInfo/" + convertEmail + "/submitted", this.submitted);
                        me.putObject('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`labs/${me.labId}/userInfo/${convertEmail}/toolResult`), quizResults)
                    }
                    if(passed){
                        var obj = {
                            labId: me.labId,
                            passed: true
                        }
                        me.putObject('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`certificateByUser/${convertEmail}/passedLab/${me.labId}`), obj)
                        var classCerti = await me.getObject('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`certificateByUser/${convertEmail}/passedLab`));
                        if(!classCerti){
                            var classCerti = await me.getObject('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getOldClassPath(`certificateByUser/${convertEmail}/passedLab`));
                        }
                            // console.log(classCerti)
                            this.classInfo.certification.forEach(function (data){
                                if(!data.disable){
                                    var copyLabId = data.labId
                                    if(classCerti[copyLabId].passed){
                                        passCnt ++;
                                    }
                                }
                                else {
                                    disableCnt ++;
                                }
                            })
                            var certiScore = this.classInfo.certification.length - disableCnt
                            if(certiScore == passCnt){
                                var enrolledClassInfo = me.courseId + '@' + me.classId + '@' + this.labInfo.labId
                                var resourceId = me.courseId + '@labs@' + this.labInfo.labId
                                var certi = {
                                    className: this.classInfo.className,
                                    itemId: enrolledClassInfo,
                                    // labName: this.labInfo.labName,
                                    period: 365,
                                    resourceId: resourceId,
                                    userName: userName,
                                    teacherId: this.classInfo.teacherId,
                                    when: Date.now()
                                }
                                me.pushString(`db://enrolledUsers/${convertEmail}/certificates`, certi)
                                // console.log('certi 발급  !! ! ! ')
                            }
                        }
                        
                } catch(e) {
                    alert(e.message)
                }
                me.submitDialog = false
                alert('제출되었습니다.')
            }
        },

    }
</script>



