<template>
    <drag class="drag" :data="data">{{ data }}</drag>
</template>
<script>
import { Drag } from "vue-easy-dnd";
export default {
    name: "drop-down-quiz-answer",
    props: {
        data:{
                type:String,
                default:function () {
                    return ''
                }
            }
    },
    components: {
        Drag
    },
    
    
}
</script>

<style>

     html,
     body {
          height: 100%;
          font-family: "Roboto";
     }
     .drag {
          width: 150px;
          height: 60px;
          background-color: #8e44ad;
          color:#ffffff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin: 10px 10px 10px 10px;
          font-size: 15px;
          transition: all 0.5s;

     }




</style>