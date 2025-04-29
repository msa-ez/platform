<template>
    <div>
        <div v-if="status=='writing'">

            <v-subheader>출석과 도움요청</v-subheader>

            <v-btn @click="submitAnswer('출석')" text>출석</v-btn>
            <v-btn @click="submitAnswer('헬프미')" text>헬프미</v-btn>

            <v-subheader>선택형</v-subheader>
            <v-btn @click="submitAnswer('1')" text>1</v-btn>
            <v-btn @click="submitAnswer('2')" text>2</v-btn>
            <v-btn @click="submitAnswer('3')" text>3</v-btn>
            <v-btn @click="submitAnswer('4')" text>4</v-btn>
            <v-btn @click="submitAnswer('5')" text>5</v-btn>

            <v-subheader>예/아니오</v-subheader>
            <v-btn @click="submitAnswer('Y')" text>Yes</v-btn>
            <v-btn @click="submitAnswer('N')" text>No</v-btn>


            <v-subheader>주관식</v-subheader>
            <v-textarea
                    id="subjective-answer"
                    outlined
                    name="input-7-4"
                    label="답을 입력하세요"
                    v-model="answer"
            ></v-textarea>

            <v-btn @click="submitAnswer()"
                   large text color="primary">답안 제출
            </v-btn>
        </div>
        <div v-if="status=='submitting'"><br><br>
            제출중입니다.... <br><br>
            <h1>{{answer}}</h1>
            <br><br>
        </div>
        <div v-if="status=='submitted'"><br><br>
            <font color="indigo">
                제출되었습니다<br><br>
                <h1>{{answer}}</h1>
                <br><br>
            </font>
        </div>
    </div>

</template> 
<script>
    import LabBase from "./LabStorageBase"
    // import LabBase from "./LabBase"
    import firebase from 'firebase'

    export default {
        name: "Answer",
        components: {},
        mixins: [LabBase],
        data: () => ({
            isAdmin: false,
            dialog: false,
            answer: '',
            status: 'writing'
        }),
        props: {
            labInfo: Object,
            classInfo: Object
        },
        created() {
            var me = this
            if (window.localStorage.getItem('authorized') == 'admin') {
                me.isAdmin = true
            }
        },
        computed: {},
        watch: {},

        mounted() {
        },

        destroyed() {
        },

        methods: {
            async submitAnswer(value) {

                var me = this;
                try {
                    if (value) this.answer = value;
                    

                    // var answerPath = me.getClassPath(`${this.labId}/messages/${this.myHashCode}`);
                    // 'labs/' + me.getClassPath(`${me.labId}/messages/`)
                    var message = {
                        email: me.myId,
                        message: this.answer,
                    }
                    this.delete('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`messages/clear`))
                    setTimeout(() => {
                        this.putString('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`messages/${me.myId.replace(/\./gi, '_')}`), message);
                    }, 500);
                    // firebase.database().ref('/labs/'+answerPath).set({
                    //     email: me.myId,
                    //     message: value,
                    // }, function (error) {
                    //     if (error) {
                    //         // The write failed...
                    //     } else {
                    //         // Data saved successfully!
                    //     }
                    // });

                    this.status = 'submitting';

                    // await this.putString(answerPath, this.answer)

                    this.status = 'submitted';
                    setTimeout(() => {
                        me.status = 'writing'
                    }, 3000);

                } catch (e){
                    alert(e.message)
                }
                
            },
            clearAnswer() {

            },

        }
    };
</script>
