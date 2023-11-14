<template>
    <div>
        <slot name="default"> </slot>
    </div>
</template>

<script>
import { observable } from 'vuedraggable';
import Answer from './DropDownQuizAnswer'
import Check from './CheckBoxQuiz'
import Placeholder from './DropDownQuizPlaceHolder'
import VueMarkdown from 'vue-markdown'

export default {
    name: "quiz",
    props: {
        quizId: String,
        value: Object
    },
    watch: {

    },
    created() {
        Vue.component('answer', Answer)
        Vue.component('placeholder', Placeholder)
        Vue.component('check', Check)
        Vue.component('mark-down', VueMarkdown)
        
        if(this.value.result && this.value.result[this.quizId]){
            this.answers = this.value.result[this.quizId].answer
                if(!this.answers){
                    this.answers = {}
                }
        }
        
    },
    data: () => ({
        score: 0,
        isQuiz: true,
        answers:{},
        all: 0,
        childIds: {}
    }),
    methods: {
        onDrop(answer){
            this.answers[answer.key] = answer;

            var score = 0;
            for(var key in this.answers){
                var answer = this.answers[key];
                if(answer && answer.right) score++;
            }

            var value = {score: score, all: this.all, allRight: this.all==score, answer: this.answers, quizId: this.quizId};
            //this.$emit('input', value)
            this.$emit('change', value)
        },
        onCheck(answer){
            this.answers[answer.key] = answer;

            var score = 0;
            for(var key in this.answers){
                var answer = this.answers[key];
                if(answer.right){
                    if(answer.data)
                        score++;
                } 
                else if(!answer.right){
                    if(answer.data)
                        score--;
                }
            }
            var value = {score: score, answer: this.answers, quizId: this.quizId};
            //this.$emit('input', value)
            this.$emit('change', value)
        },
        add(id){
            if(this.childIds[id]) return;

            this.childIds[id]=true;
            this.all ++;
        }
    }

}
</script>