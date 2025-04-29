<template>
    <v-container fluid>

        <v-row>
            <v-col>
                코스 이름 : {{courseName}}
                클래스 이름 : {{clazzName}}
                랩 이름 : {{labName}}
            </v-col>
        </v-row>

        <v-row>
            <v-col>
                랩 시나리오 : {{labScenario}}
                랩 시간 : {{labTime}}
                랩 성공 데이터 : {{passData}}
            </v-col>
        </v-row>

        <v-row>
            <v-col>
                <v-btn @click="changeLab1()">1번 랩</v-btn>
            </v-col>
            <v-col>
                <v-btn @click="changeLab2()">2번 랩</v-btn>
            </v-col>
        </v-row>
        <v-row v-for="(user, index) in labUserList" :key="index" md="3">

            {{user}}
            {{user.username}}
            {{user.isPass}}
        </v-row>

    </v-container>
</template>

<script>
    export default {
        name: "labMonitoring",

        components: {},

        data: () => ({
            labUserList: {},
            courseName: 'kubernetes1',
            clazzName: 'sk1st',
            labName: 'lab1',
            labScenario: '',
            labTime: 20,
            passData: '',
        }),
        mounted() {
            var me = this
            me.changeLab1()
        },
        methods: {
            /**
             * 클래스 - 랩에 해당하는 정보를 가져옴
             */
            myClazzLabLists() {
                var me = this
                me.clearLabInfo()
            },
            clearLabInfo() {
                var me = this
                me.labUserList = {}
                me.labScenario = ''
                me.labTime = ''
                me.passData = ''
            },
            /**
             * 파일의 내용을 includes 하여 값 비교
             * @param path
             * @param username
             */
            checkLabPass(path, username) {

                var me = this
                var returnData = false;
            },
            changeLab1() {
                this.labName = 'lab1'
                this.myClazzLabLists()
            },
            changeLab2() {
                this.labName = 'lab2'
                this.myClazzLabLists()
            }
        }
    }
</script>

<style scoped>

</style>