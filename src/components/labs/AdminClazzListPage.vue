<template>
    <v-container fluid>
        <div v-if="!isAdmin"> 권한 없음.</div>
        <v-row v-else>
            <v-col v-for="(course, index) in sortedClazzList" :key="index" md="3">
                <v-card>
                    <v-img :src="course.imgSrc"></v-img>
                    <v-card-title>
                        {{course.course}}
                    </v-card-title>
                    <v-card-text>
                        클래스 명 : {{course.className}}<br>
                        클래스 시작 : {{course.classStartDate}} <br>
                        클래스 종료 : {{course.classEndDate}} <br>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn text
                               :to="'/courses/admin/'+course.course+'/clazz/'+course.className">
                            입장
                        </v-btn>
                    </v-card-actions>
                </v-card>
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
            clazzList: {},
            overlay: false,

            isAdmin: false
        }),
        computed: {
            sortedClazzList() {
                var me = this
                var o = me.clazzList
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
            this.getAdminClazzList();
            if (window.localStorage.getItem('authorized') == 'admin') {
                me.isAdmin = true
            }
        },
        methods: {
            getAdminClazzList() {
                var me = this
                var stream = this.$minioClient.listObjects('labs', '', true);
                stream.on('data', function (obj) {
                    if (obj.name.includes('Class_Metadata') && obj.size != 0) {
                        me.$minioClient.getObject('labs', obj.name, function (err, dataStream) {
                            if (err) {
                                return console.log(err)
                            }
                            dataStream.on('data', function (chunk) {
                                var string = new TextDecoder("utf-8").decode(chunk);
                                var json = JSON.parse(string)
                                json["path"] = obj.name.replace('Class_Metadata.json', '')
                                var thumbnailURL = obj.name.replace('Class_Metadata.json', 'thumbnail.png')
                                me.$minioClient.getObject('labs', thumbnailURL, function (err, dataStream) {
                                    if (err) {
                                        return console.log(err)
                                    }
                                    dataStream.on('data', function (chunk) {
                                        var base64Data = btoa(String.fromCharCode.apply(null, chunk))
                                        json['imgSrc'] = 'data:image/png;base64,' + base64Data
                                        // me.clazzList.push(json)
                                        json["course"] = obj.name.split('/')[0];
                                        me.$set(me.clazzList, obj.name.split('/')[0] + '/' + obj.name.split('/')[2], json)
                                    })
                                    dataStream.on('error', function (err) {
                                        console.log(err)
                                    })
                                })
                            })
                            dataStream.on('error', function (err) {
                                console.log(err)
                            })
                        })
                    }
                })
                stream.on('error', function (err) {
                    console.log(err)
                })
            },
            hashCode(s) {
                return s.split("").reduce(function (a, b) {
                    a = ((a << 5) - a) + b.charCodeAt(0);
                    return a & a
                }, 0);
            },
        }
    };
</script>
