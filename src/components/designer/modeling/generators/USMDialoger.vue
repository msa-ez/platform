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
            VueTypedJs
        },
        computed: {
            isForeign() {
                try {
                    let lang = this.$i18n.locale;
                    return lang !== 'ko';
                } catch (error) {
                    console.error('Error determining locale:', error);
                    // 기본값으로 false 반환
                    return false;
                }
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
            if(!me.value || !me.value.modelList){
                this.jump();
            }
        },
        data() {
            return {
                isCreatedModel: false,
                projectExisted: false,
                state:{
                    generator: "UserStoryMapGenerator",
                    title: this.prompt,
                    businessModel: this.cachedModels["BMGenerator"],
                    painpointAnalysis: this.cachedModels["CJMGenerator"],
                    personas: this.cachedModels["Personas"]
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
                    this.$emit('state','userStoryMap')

                    if(!me.value) me.value = {}
                    if(!me.value.modelList)me.value.modelList = []
                    
                
                    // if(me.isServerProject) me.value.modelList.push(me.modelIds.USMDefinitionId);
                    if(me.isServerProject) me.state.associatedProject = me.modelIds.projectId

                    me.$emit("input", me.value);
                    me.$emit("change", 'userStoryMap');
                    me.state.userStory = me.value.userStory;

                    localStorage["gen-state"] = JSON.stringify(me.state);

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


