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
        <ModelStorageDialog
                :showDialog="showStorageDialog"
                :condition="storageCondition"
                @save="saveModel"
                @close="closeStorageDialog()"
        ></ModelStorageDialog>
    </div>
</template>

<script>
    import { VueTypedJs } from 'vue-typed-js'
    import ModelStorageDialog from '../ModelStorageDialog.vue';
    import StorageBase from '../../../CommonStorageBase.vue';

    export default {
        name: 'usm-dialoger',
        mixins:[StorageBase],
        props: {
            value: Object,
            prompt: String,
            projectId: String,
            cachedModels: Object,
            modelIds: Object,
            isServerProject: Boolean
        },
        components: {
            VueTypedJs,
            ModelStorageDialog
        },
        async created(){
            await this.setUserInfo()
        },
        computed: {
            isForeign() {
                if (window.countryCode == 'ko') {
                    return false
                }
                return true
            },
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
            var me = this;
            me.jump();
        },
        data() {
            return {
                isCreatedModel: false,
                projectExisted: false,
                state:{
                    generator: "UserStoryMapGenerator",
                    businessModel: this.cachedModels["BMGenerator"],
                    painpointAnalysis: this.cachedModels["CJMGenerator"],
                    persona: this.cachedModels["selectedPersona"]
                },
                input:{
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
                
                this.$emit("input", this.value);
                this.$emit("change", 'userStoryMap');
            },

            async onGenerationFinished(){
            },  

            jump(){
                try{
                    var me = this
                   
                    if(!me.value.modelList){
                        me.value.modelList = []
                    }
                    if(me.isServerProject) me.value.modelList.push(me.modelIds.USMDefinitionId);

                    me.$emit("input", me.value);
                    me.$emit("change", 'userStoryMap');

                    me.state.userStory = me.value.userStory;
                    let stateJson = JSON.stringify(me.state);
                    localStorage["gen-state"] = stateJson;

                    window.open(`/#/userStoryMap/${me.modelIds.USMDefinitionId}`, "_blank")
                    // this.$router.push({path: `storming/${uuid}`});
                }catch(e){
                    if(e.name=="QuotaExceededError"){
                        var keys = Object.keys(localStorage);
                        var values = keys.map(function(key) {
                            return localStorage.getItem(key);
                        });

                        for (var i = 0; i < keys.length; i++) {
                            var key = keys[i];
                            var value = values[i];

                            if(value.includes('elements') && value.includes('relations')){
                                localStorage.removeItem(key);
                            }
                        }

                    }

                    this.jump();
                }
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


