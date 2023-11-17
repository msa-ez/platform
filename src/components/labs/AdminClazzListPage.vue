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
