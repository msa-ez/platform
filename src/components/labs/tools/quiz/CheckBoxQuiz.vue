<template>
    <v-checkbox :disabled="submitted" v-model="data" color="#3498db" @change="onChecked" :label="text"></v-checkbox>
</template>
<script>
import LabBase from '../../LabStorageBase'
// import LabBase from '../../LabBase';
    export default { 
        name: "check-box-quiz",
        mixins: [LabBase],
        props: {
            right: Boolean,
            text: String,
            id: String,
        },
        
        data: function () {
            return {
                quiz: null,
                data: false,
                submitted: false,
            };
        },
        
        watch:{
            "quiz.value":function(newVal){
                if(newVal.result && newVal.result.quiz[this.quiz.quizId])
                    if(newVal.result.quiz[this.quiz.quizId].answer[this.id ? this.id : this.answer])
                        var tmpData = newVal.result.quiz[this.quiz.quizId].answer[this.id ? this.id : this.answer].data
                if(!tmpData)
                    this.data = false
                else 
                    this.data = tmpData
         }
    },
        async mounted() {
            var me = this
            var submittedUser = localStorage.getItem('email')
            var convertEmail = submittedUser.replace(/\./gi, '_')
            this.submitted = await me.getString('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.courseId + '/classes/' + me.classId + '/labs/' + me.labId + "/userInfo/" + convertEmail + "/submitted")
            if(!this.submitted){
                this.submitted = await me.getString('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getOldClassPath('labs/' + me.labId) + "/userInfo/" + convertEmail + "/submitted")
            }
            // console.log(this.labInfo)
            var quiz = this.$parent;
            while (!quiz.isQuiz) quiz = quiz.$parent;

            this.quiz = quiz;
        },
        
        methods: {
            onChecked() {
                this.quiz.onCheck({data: this.data, right: this.right, key: this.id})
            },
        },
    }
</script>
