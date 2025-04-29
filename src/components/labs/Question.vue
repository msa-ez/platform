<template>
    <div>
        <v-tooltip v-if="isAdmin" right>
            <template v-slot:activator="{ on }">
                <v-btn
                    v-on="on"
                    fab
                    dark
                    small
                    color="red"
                    @click="clearMessages()"
                    style = "position:absolute; left:20px; bottom:10px;"
                >
                    <v-icon>mdi-broom</v-icon>
                </v-btn>
            </template>
            <span>제출화면 클리어</span>
        </v-tooltip>
        <!-- <v-speed-dial
                v-if="isAdmin"
                left
                absolute
                bottom
                v-model="fab"
                :direction="'top'"
                :transition="'slide-y-reverse-transition'"
        >
            <template v-slot:activator>
                <v-btn
                        v-model="fab"
                        color="pink"
                        fab
                        dark
                        medium
                        style="margin-bottom: 10px;"
                >
                    <v-icon v-if="fab">mdi-close</v-icon>
                    <v-icon v-else>mdi-broom</v-icon>
                </v-btn>
            </template>
            <v-btn
                    fab
                    dark
                    small
                    color="green"
                    @click="openQuestionDialog"
            >
                <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
                    fab
                    dark
                    small
                    color="green"
                    @click="submitUserAnswer()"
            >
                <v-icon>mdi-pencil</v-icon>
            </v-btn>
        </v-speed-dial> -->
        <v-dialog
                v-model="dialog"
                width="500"
                v-if="labInfo"
        >
            <v-card>
                <v-card-title
                        class="headline grey lighten-2"
                        primary-title
                >
                    {{labInfo.labName}}
                </v-card-title>

                <v-card-text>
                    <v-radio-group v-model="questionType" :mandatory="false" row
                    >
                        <v-radio
                                v-for="n in questionTypeList"
                                :key="n.value"
                                :label="`${n.label}`"
                                :value="n.value"
                        ></v-radio>
                    </v-radio-group>
                    <div v-if="questionType == 'choice'">
                        <!-- 객관식 -->
                        <v-textarea
                                outlined
                                name="input-7-4"
                                label="문제"
                                v-model="question"
                        ></v-textarea>
                        <v-slider
                                min="1"
                                max="5"
                                :thumb-size="24"
                                thumb-label="always"
                                v-model="choice"
                                label="객관식 갯수"
                        >
                        </v-slider>
                        <v-text-field
                                v-for="n in choice"
                                v-model="choiceList[n-1]"
                                :label="`${n}번`"
                                outlined
                        ></v-text-field>
                    </div>
                    <div v-if="questionType == 'short'">
                        <!-- 주관식 -->
                        <v-textarea
                                outlined
                                name="input-7-4"
                                label="문제"
                                v-model="question"
                        ></v-textarea>
                    </div>
                </v-card-text>

                <v-divider></v-divider>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                            color="primary"
                            text
                            @click="postQuestion()"
                    >
                        문제 보내기
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>
<script>
 
    // import LabBase from "./LabBase"
    import LabBase from "./LabStorageBase"

    export default {
        name: "Question",
        components: {},
        mixins: [LabBase],
        data: () => ({
            dialog: false,
            questionTypeList: [{label: '주관식', value: 'short'}, {label: '객관식', value: 'choice'}],
            questionType: '',
            choice: 1,
            question: '',
            choiceList: [],
            fab: false,
        }),
        props: {
            labInfo: Object,
            classInfo: Object
        },
        created() {
            var me = this
        },
        computed: {},
        watch: {},

        mounted() {

        },

        destroyed() {
        },

        methods: {
            openQuestionDialog() {
                this.dialog = tru
            },
            clearMessages() {
                var me = this
                try {
                    var messagePath = 'db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`messages/`);
                    // this.pushString(messagePath, "clear")
                    me.delete(messagePath)
                    me.delete('db://labs/' + me.getBucketByTenantId() + '/' + me.getClassPath(`labs/${me.labId}/labResult/`))
                    setTimeout(() => {
                        this.$EventBus.$emit('clearLabResult', true)
                        this.setString('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`messages/clear`), true)
                    }, 500);
                    // console.log(messagePath)
                } catch (e){
                    alert(e.message)
                }
            },
            submitUserAnswer() {

            },
            postQuestion() {
                console.log(this.questionType)
                console.log(this.question)
                if (this.questionType == 'choice') {
                    // 객관식
                    var questionObj = {
                        questionType: this.questionType,
                        question: this.question,
                        choiceList: this.choiceList
                    }
                } else if (this.questionType == 'short') {
                    // 주관식
                    var questionObj = {
                        questionType: this.questionType,
                        question: this.question,
                    }
                }
                var questionPath = 'storage://labs-msaez.io/running/' + this.getClassPath(`labs/${this.labId}/question/question.json`)
                this.putObject(questionPath, questionObj)
                this.dialog = false
            }

        }
    }
    ;
</script>
