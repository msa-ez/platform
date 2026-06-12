<template>
    <v-dialog v-model="showDialog" max-width="600" style="overflow-y:hidden;">
        <v-card>
            <v-card flat>
                <ModelCanvasParticipants
                        v-model="value"
                        :checkPublic="checkPublic"
                        :key="refreshKey"
                        @all="participantAll"
                        @apply="participantApply"
                        @close="participantClose"
                        @add="participantAdd"
                        @remove="participantRemove"
                ></ModelCanvasParticipants>
            </v-card>
        </v-card>
    </v-dialog>
</template>

<script>
    import ModelCanvasParticipants from "./ModelCanvasParticipants";
    export default {
        name: 'model-canvas-share-dialog',
        components: {
            ModelCanvasParticipants
        },
        props: {
            showDialog:{
                type: Boolean,
                default: false
            },
            value: {
                type: Object,
                default: function () {
                    return null
                },
            },
            checkPublic: {
                type: Boolean,
                default: function () {
                    return false
                },
            },
            canvasComponentName: {
                type: String,
                default: function () {
                    return null
                },
            },
            canvas:{
                type: Object,
                default: function () {
                    return null
                },
            },
        },
        data() {
            return {
                refreshKey: 0,
            }
        },
        watch: {
            "showDialog":function (newVal,oldVal) {
                if(newVal){
                    //open
                    this.refreshKey++
                }
            },
        },
        methods: {
            participantClose(value){
                this.$emit('close',value)
            },
            participantAll(value){
                this.$emit('all', value)
            },
            participantApply(value){
                this.$emit('apply', value)
            },
            participantAdd(value){
                this.$emit('add', value)
            },
            participantRemove(value){
                this.$emit('remove', value)
            }
        },
    }
</script>