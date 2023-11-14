<template>
    <v-container fluid v-if="value">

    <v-item-group>
        <v-row v-for="(answerGroup, index) in answerGroups" v-bind:key="index">
            <v-col>
                <v-item>
                    <v-card
                        :color="selectedAnswer == answerGroup.answer ? 'primary' : ''"
                        class="d-flex align-center"
                        dark
                        height="80"
                        @click="selectAnswer(answerGroup)"
                    >
                        <v-col>

                        <div>
                            <div :style="'position: absolute; left:0; top:5%; background: #3498db; z-index:100; width:'+answerGroup.percentage+'%; height:90%; overflow: hidden'"></div>

                                <div style="position: absolute; left:0; top:5%; z-index: 100" class="white--text mb-2" >
                                    <div style="background:white; width:100px"></div>
                                    {{answerGroup.percentage}}% ({{answerGroup.count}}명)
                                </div>

                                
                            <div style="z-index:100; position: absolute; width:100%; left:0; top:10%; height:100%"
                                class="display-2 flex-grow-1 text-center white--text"
                            >
                                {{answerGroup.answer}} {{'1,2,3,4,5'.includes(answerGroup.answer) ? '번' :'' }}
                            </div>
                        </div>
                        </v-col>
                    </v-card>
                </v-item>
            </v-col>
        </v-row>
    </v-item-group>
    </v-container>
</template>
<script>

    export default {
        name: "PollResult",
        components: {},
        data: () => ({
            selectedAnswer: null,
            prize: 0
        }),
        props: {
            value: Object,
        },
        computed:{
            answerGroups() {
                var me = this
                var allAnswers = 0;
                var answerGroups = {};

                Object.keys(me.value).forEach(key => {
                    var answer = me.value[key]
                    if(answer && answer.trim().length > 0){
                        answer = answer.toUpperCase().trim();
                        if(answerGroups[answer] == null){

                            var title = answer
                           
                            answerGroups[answer] = {
                                count: 0,
                                answer: title,
                                percentage: 0
                            };
                        }

                        answerGroups[answer].count ++;
                        allAnswers ++;
                    }
                });

                Object.keys(answerGroups).forEach(key => {
                    var answerGroup = answerGroups[key];

                    answerGroup.percentage = 
                            Math.round(answerGroup.count * 100 / allAnswers)
                });

                return answerGroups;
            },
        },

        watch: {},

        mounted() {

        },

        destroyed() {
        },

        methods: {
            selectAnswer(answerGroup){
                this.selectedAnswer = answerGroup.answer;
                this.$emit('answered', {answer: this.selectedAnswer})

            }

        }
    }
    ;
</script>
