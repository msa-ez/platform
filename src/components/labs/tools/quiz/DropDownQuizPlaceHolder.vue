<template>
     <drop class="copy" @drop="onCopyDrop" v-model="value">{{ value }}</drop>
</template>
<script>
import { Drop } from "vue-easy-dnd";
export default {
    name: "drop-down-quiz-place-holder",
    props: {
        answer: String,
        id: {
                type: String,
                default: function () {
                    return null;
                }
          },
    },
    data: function() {
      return {
        quiz: null,
        value: null,
        added: false
      };
    },
    watch: {
         "quiz.value":function(newVal){
              if(newVal.result.quiz[this.quiz.quizId].answer && newVal.result.quiz[this.quiz.quizId].answer[this.id ? this.id : this.answer]){
                    this.value = newVal.result.quiz[this.quiz.quizId].answer[this.id ? this.id : this.answer].data
                }
         }
    },
    components: {
        Drop
    },

    mounted(){
      var quiz = this.$parent;
      while(!quiz.isQuiz) quiz = quiz.$parent;

      this.quiz = quiz;

      if(!this.added){
          this.quiz.add(this.id ? this.id : this.answer);
           this.added = true;
      }
     
    },
    methods: {
        onCopyDrop(e) {
          this.value = e.data;
          var keyset = this.id ? this.id : this.answer
          if(e.data)
            this.quiz.onDrop({data: e.data, right: e.data == this.answer, key: keyset})
        },
    },
    
}
</script>

<style>

     html,
     body {
          height: 100%;
          font-family: "Roboto";
     }

     .copy {
          margin: 30px 10px;
          border: 1px solid #8e44ad;
          height: 30px;
          width: 200px;
          display: inline-block;
          position: relative;
          flex: 1;
          font-size: 20px;
          text-align: center;
     }


     .copy::before {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          color: rgba(0, 0, 0, 0.4);
          font-size: 10px;
          font-weight: bold;
     }


</style>