<template xmlns:v-on="http://www.w3.org/1999/xhtml">
<!--    <event-storming-model-canvas v-if="loadProjectId"-->
<!--                                 :key="componentKey"-->
<!--                                 elementListBeanPath="classDefinitions"-->
<!--                                 relationListBeanPath="relations"-->
<!--                                 relationVueComponentName="class-relation"-->
<!--                                 ref="designer"-->
<!--                                 :projectTitle="projectName"-->
<!--                                 @change="onResultChange"-->
<!--                                 @codeChange="onCodeChange"-->
<!--                                 :labId="labInfo.labId"-->
<!--                                 :projectId="loadProjectId"-->
<!--                                 @newProjectId="setLoadProjectId"-->
<!--                                 fork-->
<!--    ></event-storming-model-canvas>-->

<!--    <event-storming-model-canvas v-else-->
<!--                                 :key="componentKey"-->
<!--                                 v-model="value.result"-->
<!--                                 elementListBeanPath="classDefinitions"-->
<!--                                 relationListBeanPath="relations"-->
<!--                                 relationVueComponentName="class-relation"-->
<!--                                 ref="designer"-->
<!--                                 :projectTitle="projectName"-->
<!--                                 @change="onResultChange"-->
<!--                                 @codeChange="onCodeChange"-->
<!--                                 :labId="labInfo.labId"-->
<!--                                 :projectId="loadProjectId"-->
<!--                                 @newProjectId="setLoadProjectId"-->
<!--                                 fork-->
<!--    ></event-storming-model-canvas>-->

    <event-storming-model-canvas
                                 v-if="modelingId"
                                 :key="componentKey"
                                 elementListBeanPath="classDefinitions"
                                 relationListBeanPath="relations"
                                 relationVueComponentName="class-relation"
                                 ref="designer"
                                 :projectTitle="projectName"
                                 @change="onResultChange"
                                 @codeChange="onCodeChange"
                                 :labsId="labInfo.labId"
                                 :projectId="modelingId"
                                 :isOriginalModel="isOriginalModel"
                                 @newProjectId="setLoadProjectId"
                                 fork
    ></event-storming-model-canvas>

</template>

<script>
    import EventStormingModelCanvas from "../../designer/es-modeling/EventStormingModelCanvas";
    import LabStorageBase from "../LabStorageBase";

    var jp = require('jsonpath');

    export default {
        name: 'lab-tool-event-designer',
        props: {
            value: Object,
            //readonly: Boolean,
            small: Boolean,
            labInfo: Object
        },
        mixins:[LabStorageBase],
        components:{EventStormingModelCanvas},
        data() {
            return {
                componentKey: 0,
                projectName: '',
                loadProjectId: null ,
                url: '',
            }
        },
        watch: { },
        created: async function () {
            var me = this
            await me.loginUser()
            if (this.value.result == null) {
                this.value.result = {elements: {}, relations: {}};
            }
            me.loadProjectId = await me.settingProjectId()
        },
        computed : {
            modelingId(){
                return this.loadProjectId
            },
            isOriginalModel(){
                var me = this
                if(me.labInfo && me.labInfo.modelUrl){
                    if(me.labInfo.modelUrl == me.loadProjectId){
                        return true
                    }
                }
                return  false
            },
            projectIdPath(){
                try{
                    var me = this
                    if(me.isLogin){
                        var clazzPath = me.getClassPath(`labs/${me.labInfo.labId}/userInfo/${me.userId.replace(/\./gi, '_')}`)
                        return `db://labs/${me.getTenantId().split('.')[0]}/${clazzPath}/projectId`
                    }
                   return null;
                }catch (e) {
                    return null;
                }
            },
            userId() {
                return this.myId;
            },
        },
        mounted: function () {
            var me = this;
            setTimeout(() => {
                me.$EventBus.$emit('progressValue', false)
            }, 2000)

        },
        methods: {
            async setLoadProjectId(newProjectId){
                var me = this
                me.loadProjectId = newProjectId ? newProjectId : null
                if(me.isLogin){
                    await me.setString(me.projectIdPath, me.loadProjectId)
                }

                // force Render
                this.componentKey += 1;
            },
            settingProjectId(){
                var me = this
                return new Promise(async (resolve, reject) => {
                    var getProjectId = null

                    if(me.projectIdPath){
                        getProjectId = await me.getString(me.projectIdPath)
                    }

                    // if(!getProjectId && me.labInfo && me.labInfo.modelUrl){
                    //     // set registered Model ID
                    //     getProjectId = me.labInfo.modelUrl
                    // }
                    
                    // Lab의 모델이 수강생마다 꼬이는 문제로, static하게 걸어둔 모델만 뜨도록 수정
                    if(me.labInfo && me.labInfo.modelUrl){
                        getProjectId = me.labInfo.modelUrl
                    }

                    if( !getProjectId ){
                        getProjectId = me.dbuid()
                    }

                    if(me.isLogin){
                        await me.setString(me.projectIdPath, getProjectId)
                    }

                    resolve(getProjectId)
                })
            },
            onResultChange(change,projectName) {
                var me = this
                this.value.result = change;
                if (change && change.projectName) {
                    me.projectName = change.projectName
                }else{
                    me.projectName = projectName
                }

                this.$emit('input', this.value);
                this.$emit('change', this.value);

            },
            onCodeChange(change) {
                this.value.code = change;
                this.value.modelForElements = change.modelForElements;
                this.value.rootModel = change.rootModel;

                this.$emit('input', this.value);
                this.$emit('change', this.value);

            },
            //for user checkpoint expressions
            query(exp) {
                return jp.query(this.value.modelForElements, exp);
            },
            dbuid: function () {
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


<style scoped lang="css" rel="stylesheet/css">

    .canvas-panel.small {
        left: 0;
        right: 0;
        width: 100%;
        height: 100%;
        position: relative;
        overflow: hidden;
    }

</style>



