<template>
    <div style="margin-top: 10px;">
        <div>
            <v-btn v-if="value && value.modelList" class="auto-modeling-btn" color="primary" @click="jump()">Create Model<v-icon class="auto-modeling-btn-icon">mdi-arrow-right</v-icon></v-btn>
        </div>
        <div v-if="value && value.modelList && value.modelList.length > 0"
             class="auto-modeling-message-card"
             style="margin-top:25px; height: 100%; width: 20%;">
            <!-- <v-col v-if="value && value.modelList && value.modelList.length > 0"
                   style="height: 100%; align-items: center; margin: 2px; width: 100%;"
            >
                <div v-for="id in value.modelList" :key="id">
                    <jump-to-model-lists-card :id="id" path="business-model-canvas" @deleteModel="deleteModel" ></jump-to-model-lists-card>
                </div>
            </v-col> -->
        </div>
    </div>
</template>

<script>
    import { VueTypedJs } from 'vue-typed-js'
    import StorageBase from '../../../CommonStorageBase.vue';

    export default {
        name: 'bm-dialoger',
        mixins:[StorageBase],
        props: {
            value: Object,
            prompt: String,
            projectId: String,
            modelIds: Object,
            isServerProject: Boolean
        },
        components: {
            VueTypedJs
        },
        async created(){
            await this.setUserInfo()
        },
        watch: {
            "prompt": {
                deep:true,
                handler:  _.debounce(function(newVal, oldVal)  {
                    if(this.isCreatedModel){
                        this.modelIds.BMDefinitionId = this.uuid()
                        this.isCreatedModel = false
                    }
                },1000)
            }
        },
        mounted(){
            var me = this
            if(!me.value || !me.value.modelList){
                this.jump();
            }
        },
        data() {
            return {
                isCreatedModel: false,
                projectExisted: false,
                state:{
                    generator: "BMGenerator",
                    title: this.prompt,
                },
                storageCondition: null,
                showStorageDialog: false,
            }
        },
        methods: {
            deleteModel(id){
                var me = this
                var index = me.value.modelList.findIndex(x => x == id)
                me.value.modelList.splice(index, 1)
                
                me.$emit("input", me.value);
                me.$emit("change", 'businessModel');
            },
            onGenerationFinished(){},  
            jump(){
                var me = this 

                this.$emit('state','BM')

                // this.state.title = this.value;
                if(!me.value) me.value = {}
                if(!me.value.modelList) me.value.modelList = []

                // if(me.isServerProject) me.value.modelList.push(me.modelIds.BMDefinitionId)
                if(me.isServerProject) me.state.associatedProject = me.modelIds.projectId
                me.$emit("input", me.value);
                me.$emit("change", 'businessModel');
                
                localStorage["gen-state"] = JSON.stringify(this.state);
                window.open(`/#/business-model-canvas/${me.modelIds.BMDefinitionId}`, "_blank")
            },


            uuid: function () {
                function s4() {
                    return Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                        .substring(1);
                }

                return s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4();
            },


        }
    }
</script>
<style>
</style>


