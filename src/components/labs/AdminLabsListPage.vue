<template>
    <v-container fluid>
        <v-row>
            <v-col align="center">
                <v-timeline :dense="$vuetify.breakpoint.smAndDown">
                    <v-timeline-item
                        v-for="(lab, index) in labsList" :key="index"
                        color="purple lighten-2"
                        fill-dot
                        :left = "index % 2 == 1"
                        :right = "index % 2 == 0"
                    >

                        <v-card style="width: 400px">
                            <!--                    <img v-if="a.imgSrc"-->
                            <!--                         :src="labs.imgSrc"-->
                            <!--                         style="width: 300px; height: 150px"-->
                            <!--                    >-->
                            <v-card-title>
                                {{index}}: {{lab.labName}}
                            </v-card-title>
                            <v-card-text>
                                {{lab.labScenario}} <br>
                                {{lab.labTime}}분 이내 완료
                            </v-card-text>
                            <v-card-actions>

                                <v-spacer></v-spacer>
                                <v-btn :to="$route.fullPath+ '/' + index  + '/class-room'">입장</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-timeline-item>
                </v-timeline>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
    var Minio = require('minio');

    export default {
        name: "ClazzListPage",

        components: {},

        data: () => ({
            labsList: {},
            overlay: false,

            isAdmin: false
        }),
        computed: {
            sortedLabsList() {
                var me = this
                var o = me.labsList
                var sorted = {},
                    key, a = [];
                // 키이름을 추출하여 배열에 집어넣음
                for (key in o) {
                    if (o.hasOwnProperty(key)) a.push(key);
                }
                // 키이름 배열을 정렬
                a.sort();
                // 정렬된 키이름 배열을 이용하여 object 재구성
                for (key = 0; key < a.length; key++) {
                    sorted[a[key]] = o[a[key]];
                }
                return sorted;
            }
        },
        watch: {},
        mounted() {
            var me = this
            this.getAdminLabsList();
            if (window.localStorage.getItem('authorized') == 'admin') {
                me.isAdmin = true
            }
        },
        methods: {
            getAdminLabsList() {
                var me = this
                var path = this.$route.params.course + '/runningClass/' + this.$route.params.clazzName + '/'
                console.log(path)
                var rootStream = this.$minioClient.listObjects('labs', path, false)
                rootStream.on('data', function (obj) {
                    if (obj.name.includes('Metadata')) {
                        me.$minioClient.getObject('labs', obj.name, function (err, classDataStream) {
                            if (err) {
                                return console.log(err)
                            }
                            classDataStream.on('data', function (classChunk) {
                                var string = new TextDecoder("utf-8").decode(classChunk);
                                var json = JSON.parse(string)
                                json.labsList.forEach(function (lab) {
                                    var labMetadataPath = `${me.$route.params.course}/planed/${lab}/Lab_Metadata.json`
                                    me.$minioClient.getObject('labs', labMetadataPath, function (err, labDataStream) {
                                        if (err) {
                                            return console.log(err)
                                        }
                                        labDataStream.on('data', function (labChunk) {
                                            var string = new TextDecoder("utf-8").decode(labChunk);
                                            var json = JSON.parse(string)
                                            // me.labsList.push(json)
                                            me.$set(me.labsList, lab, json)
                                        })
                                    })

                                })
                                // me.labsList.push(json)
                                // me.$set(me.labsList, obj.name.split('/')[2], json)
                            })
                        })
                    }

                    // if(obj.prefix  && obj.size == 0) {
                    //     // 얘는 폴더인 경우
                    //
                    //     var labMetaPath = obj.prefix.replace('runningClass', 'planed').replace(me.$route.params.clazzName + '/', '')
                    //     var labsStream = me.$minioClient.listObjects('labs', labMetaPath, false)
                    //     labsStream.on('data', function (labsObj) {
                    //         if(labsObj.name.includes('Metadata')) {
                    //             me.$minioClient.getObject('labs', labsObj.name, function (err, labDataStream) {
                    //                 if (err) {
                    //                     return console.log(err)
                    //                 }
                    //                 labDataStream.on('data', function (labChunk) {
                    //                     var string = new TextDecoder("utf-8").decode(labChunk);
                    //                     var json = JSON.parse(string)
                    //                     // me.labsList.push(json)
                    //                     me.$set(me.labsList, labsObj.name.split('/')[2], json)
                    //                 })
                    //             })
                    //         }
                    //     })
                    // }
                })
            },
        }
    };
</script>
