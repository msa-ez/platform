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
            },
        }
    };
</script>
