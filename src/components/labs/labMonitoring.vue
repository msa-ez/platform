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
    var Minio = require('minio');

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

            minioClient: null,
        }),
        mounted() {
            var me = this
            var minioClient = new Minio.Client({
                endPoint: "minio.msaez.io",
                port: 443,
                useSSL: true,
                accessKey: "minio",
                secretKey: "minio123"
            });

            me.$minioClient = minioClient
            me.changeLab1()


        },
        methods: {
            /**
             * 클래스 - 랩에 해당하는 정보를 가져옴
             */
            myClazzLabLists() {
                var me = this
                me.clearLabInfo()
                var stream = me.$minioClient.listObjectsV2('labs', `${me.courseName}/runningClass/${me.clazzName}/`, true, '')
                stream.on('data', function (obj) {
                    // 현재 클래스에 해당하는 모든 정보를 넘기고 있음
                    var tmp = obj.name.split('/');
                    // tmp[0] -> 코스이름
                    // tmp[1] -> runningClass
                    // tmp[2] -> 클래스이름
                    // tmp[3] -> 랩 이름 or Class_Metadata.json
                    // tmp[4] -> 유저이름 or Lab_Metadata.json
                    // tmp[5] -> 작업데이터 파일

                    // 클래스 설정 정보를 가져옴
                    if (tmp.length >= 4 && tmp[3] == "Class_Metadata.json") {

                    }

                    if (tmp.length >= 4 && tmp[3] == me.labName) {

                        // 랩 설정정보를 가져옴
                        if (tmp.length >= 5 && tmp[4] == "Lab_Metadata.json") {
                            me.$minioClient.getObject('labs', obj.name, function (err, dataStream) {
                                if (err) {
                                    return console.log(err)
                                }
                                dataStream.on('data', function (chunk) {
                                    try {
                                        var string = new TextDecoder("utf-8").decode(chunk);
                                        var json = JSON.parse(string)

                                        if (json.labScenario) me.labScenario = json.labScenario
                                        if (json.labTime) me.labTime = json.labTime
                                        if (json.passData) me.passData = json.passData
                                    } catch (e) {
                                        console.log(e)
                                    }

                                })
                            })
                        } else if (tmp.length >= 6) {
                            // 랩 이름이 일치 할때 유저를 기준으로 리스트를 생성함
                            var username = tmp[4]

                            // 햅 상단에 test.log (임시) 파일이 있으면 통과 라고 표시
                            var checkFileName = 'test.log'
                            var isPass = ''
                            if (tmp.length >= 6 && tmp[5] == checkFileName) {
                                me.checkLabPass(obj.name, username)
                            }
                            var detailData = {
                                username: username,
                                isPass: isPass,
                            }
                            if (!me.labUserList || !me.labUserList[username]) {
                                me.$set(me.labUserList, username, {})
                            }

                            me.$set(me.labUserList[username], username, detailData)
                        }


                    }

                })
                stream.on('error', function (err) {
                    console.log(err)
                })

                console.log(me.labUserList)
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
                me.$minioClient.getObject('labs', path, function (err, dataStream) {
                    if (err) {
                        return console.log(err)
                    }
                    dataStream.on('data', function (chunk) {
                        if (chunk.includes(me.passData)) {
                            returnData = true
                            console.log(path + ' => ' + returnData)
                        }

                        // TODO 만약 복잡한 결과를 얻고 싶다면? or 강사가 직접 체크를 한다면?
                        // User_Lab_Metadata.json 에 결과값을 보내야함

                        // TODO 늦게 호출 되기 때문에 리스트 값이 변경이 안됨, 이렇게 추가하는게 맞는지 모르겠음
                        me.labUserList[username].isPass = returnData
                    })
                })
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