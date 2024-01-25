<template>
    <div style="margin-top: 10px;">
        <div>
            <v-btn v-if="value && value.modelList" class="auto-modeling-btn" color="primary" @click="openStorageDialog()">Create Model<v-icon class="auto-modeling-btn-icon">mdi-arrow-right</v-icon></v-btn>
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
            VueTypedJs,
            ModelStorageDialog
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
                // this.jump();
                this.openStorageDialog()
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
            async saveModel(){
                var me = this
        
                let validate = await me.validateStorageCondition(me.storageCondition, 'save');
                if(validate) {
                    var settingModelId = me.storageCondition.projectId.replaceAll(' ', '-').trim();
                    me.modelIds.BMDefinitionId = settingModelId   
                    
                    me.$emit('state','BM')
                    if(!me.value) me.value = {}
                    if(!me.value.modelList)me.value.modelList = []
                    me.value.modelList.push(settingModelId);

                    me.state.userStory = me.value.userStory;
                    let stateJson = JSON.stringify(me.state);
                    localStorage["gen-state"] = stateJson;
                   
                    me.$emit("input", me.value);
                    me.$emit("change", 'businessModel');

                    await me.putObject(`db://definitions/${settingModelId}/information`, {
                        associatedProject: me.modelIds.projectId,
                        author:  me.userInfo.uid,
                        authorEmail : me.userInfo.email,
                        projectId: settingModelId,
                        projectName: me.storageCondition.projectName ? me.storageCondition.projectName : me.projectInfo.prompt,
                        type: 'bm',
                        createdTimeStamp: Date.now(),
                        lastModifiedTimeStamp: Date.now()
                    })
                   
                    me.isCreatedModel = true;
                    window.open(`/#/business-model-canvas/${settingModelId}`, "_blank")
                    me.closeStorageDialog()
                } else{
                    me.storageCondition.loading = false
                }
            },
            async validateStorageCondition(condition, action){
                var me = this

                if( !this.isLogin ) {
                    var otherMsg = 'Please check your login.';
                    var obj ={
                        'projectId': otherMsg
                    }
                    condition.error = obj
                    return false;
                }

                if( !condition.projectId || condition.projectId.includes('/') ){
                    var otherMsg = 'ProjectId must be non-empty strings and can\'t contain  "/"'
                    var obj ={
                        'projectId': otherMsg
                    }
                    condition.error = obj
                    return false;
                }

                // checked duplicate projectId
                var validateInfo = await me.isValidatePath(`db://definitions/${condition.projectId}/information`);
                if( !validateInfo.status ){
                    var obj ={
                        'projectId': validateInfo.msg,
                    }
                    condition.error = obj
                    return false;
                }

                var information = await me.list(`db://definitions/${condition.projectId}/information`)
                if(information){
                    var obj ={
                        'projectId': 'This project id already exists.'
                    }
                    condition.error = obj
                    return false;
                }


                return true;
            },
            openStorageDialog(){
                if(!this.isServerProject){
                    this.$emit('saveProject')
                    return;
                }

                this.storageCondition = {
                    action: 'save',
                    title: 'Save Definition',
                    comment: '',
                    projectName: this.prompt,
                    projectId: this.isServerProject ? `${this.modelIds.projectId}_${this.modelIds.BMDefinitionId}`: this.modelIds.BMDefinitionId,
                    error: null,
                    loading: false,
                    type: 'bm'
                }
                this.showStorageDialog = true;
            },
            closeStorageDialog(){
                this.storageCondition = null;
                this.showStorageDialog = false
            },
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
                if(!me.value){
                    me.value = {}
                    if(!me.value.modelList){
                        me.value.modelList = []
                    }
                }
                me.value.modelList.push(me.modelIds.BMDefinitionId)
                me.$emit("input", me.value);
                me.$emit("change", 'businessModel');

                let stateJson = JSON.stringify(this.state);
                localStorage["gen-state"] = stateJson;

                window.open(`/#/business-model-canvas/${me.modelIds.BMDefinitionId}`, "_blank")
                //this.$router.push(`business-model-canvas/${uuid}`);

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


