<template>
    <v-card
            v-if="copyInformation.projectId"
            outlined
            class="mx-auto"
            max-width="800"
            max-height="500"
    >
        <div :key="renderKey">
            <v-img
                    style="cursor: pointer;"
                    :src="copyInformation.img"
                    max-width="800"
                    max-height="300"
                    @click="selectModel()"
            >
                <slot name="chips">
                    <v-row justify="end" style="margin-right: 1px; margin-top:0px;">
                        <v-chip
                                v-if="copyInformation.isNewProject"
                                class="ma-2"
                                color="red"
                                text-color="white"
                                style="margin-right: 10px; width: auto; height: 20px; font-size: 10px; font-weight:bold; "
                                small
                        >
                            NEW
                        </v-chip>
                        <v-chip
                                v-if="copyInformation.chip"
                                class="ma-2"
                                :color="copyInformation.chip.color"
                                text-color="white"
                                small
                                style="width: auto; height: 20px; font-size: 10px; font-weight:bold;"
                        >
                            {{copyInformation.chip.display}}
                        </v-chip>
                    </v-row>
                </slot>
            </v-img>
        </div>

        <v-list-item style="margin-bottom:10px;" three-line>
            <v-list-item-content style="max-width: 18%; margin-left: 1%; margin-right: 3%;">
                <div style="text-align: center;">
                    <div style="cursor: pointer;">
                        <v-avatar size="40">
                            <div v-if="copyInformation.authorProfile" style="width: 100%; height: 100%;">
                                <img :src="copyInformation.authorProfile">
                            </div>
                            <div v-else>
                                <v-icon x-large>mdi-account-circle</v-icon>
                            </div>
                        </v-avatar>
                    </div>
                    <div style="width: 100%; height: 100%; font-size:11px; margin-top:5px;">
                        {{ copyInformation.hiddenEmail }}
                    </div>
                </div>
            </v-list-item-content>
            <div v-bind:style="isDelete ? 'text-decoration-line: line-through;': ''">
                <v-card-title style="margin:-10px 0 -10px; 0;">
                    {{ copyInformation.projectName }}
                </v-card-title>
                <v-card-text style="color:rgba(0, 0, 0, 0.6)">
                    LastModified Date : {{ copyInformation.lastModifiedTimeStamp }}<br>
                    Created Date : {{copyInformation.createdTimeStamp }}<br>
                    Comment : {{copyInformation.comment}}<br>
                </v-card-text>
            </div>
        </v-list-item>
        <v-card-actions>
            <slot name="action" :project="copyInformation">
                <div style="position: absolute; bottom:5px; right:5px;">
                    <div  v-if="loading">
                        <v-progress-circular
                                indeterminate size="24"
                        ></v-progress-circular>
                    </div>
                    <div  v-else>
                        <v-row style="align-items: center;">
                            <v-btn
                                    text
                                    color="#1E88E5"
                                    @click="selectModel()"
                            >Select</v-btn>
                        </v-row>
                    </div>

                </div>
            </slot>
        </v-card-actions>
    </v-card>
</template>

<script>
    import LabBase from "../../labs/LabStorageBase";

    export default {
        name: "pbc-model-card",
        mixins: [LabBase],
        props: {
            information: {
                type: Object,
                default: function () {
                    return null
                }
            },
        },
        data() {
            return {
                renderKey: 0,
                set: false,
                isDelete: false,
                copyInformation: null,
                projectPath: null,
                selectedVersion: null,
                // versions: null,
                loading:false,
                defaultImage: 'https://user-images.githubusercontent.com/54785805/125735022-10b4560f-51c3-4d0d-8c05-9641c6d8a8b0.png'
            }
        },
        created() {
            this.setting();
        },
        computed: {
            isOwnModel() {
                if (this.information.author == localStorage.getItem('uid')) {
                    return true
                }
                return false
            },
            latestVersion(){
                if(this.copyInformation.lastVersionName){
                    return this.copyInformation.lastVersionName;
                }
                return this.filteredVersionLists[0];
            },
            filteredVersionLists(){
                var me = this

                return Object.keys(this.copyInformation.versions).sort(function (a,b){
                    if(me.copyInformation.versions[b] && me.copyInformation.versions[a]){
                        if (me.copyInformation.versions[b].timeStamp > me.copyInformation.versions[a].timeStamp) {
                            return 1;
                        }
                        if (me.copyInformation.versions[b].timeStamp < me.copyInformation.versions[a].timeStamp) {
                            return -1;
                        }
                        return 0;
                    }
                    return 0;
                })
            },
        },
        watch:{
        },
        methods: {
            async setting() {
                var me = this
                me.copyInformation = JSON.parse(JSON.stringify(me.information))
                if (me.copyInformation && !me.set) {

                    if (!me.copyInformation.img) me.copyInformation.img = me.defaultImage
                    me.copyInformation.authorId = me.information.authorId ? me.information.authorId : me.information.author
                    me.copyInformation.projectId = me.information.objectID ? me.information.objectID : me.information.projectId
                    me.copyInformation.createdTimeStamp = me.information.createdTimeStamp ? me.convertDate(me.information.createdTimeStamp) : me.convertDate(me.information.date)
                    me.copyInformation.lastModifiedTimeStamp = me.information.lastModifiedTimeStamp ? me.convertDate(me.information.lastModifiedTimeStamp) : me.convertDate(me.information.lastModifiedDate)
                    me.copyInformation.hiddenEmail = me.hiddenEmail(me.copyInformation.authorEmail)
                    me.copyInformation.isShared = me.copyInformation.permissions && me.copyInformation.permissions.length > 0 ? true : false
                    me.copyInformation.isNewProject = me.isNew(me.copyInformation.lastModifiedTimeStamp)
                    me.copyInformation.isDeleteProject = false
                    me.copyInformation.chip = me.chipSetting()
                    if (me.information.type == 'es') {
                        me.projectPath = `/storming/${me.copyInformation.projectId}`
                    } else if (me.information.type == 'k8s') {
                        me.projectPath = `/kubernetes/${me.copyInformation.projectId}`
                    } else if (me.information.type == 'bm') {
                        me.projectPath = `/business-model-canvas/${me.copyInformation.projectId}`
                    } else if (me.information.type == 'sticky') {
                        me.projectPath = `/sticky/${me.copyInformation.projectId}`
                    } else if (me.information.type == 'bpmn') {
                        me.projectPath = `/bpmn/${me.copyInformation.projectId}`
                    } else if (me.information.type == 'uml') {
                        me.projectPath = `/uml/${me.copyInformation.projectId}`
                    } else if (me.information.type == 'cjm') {
                        me.projectPath = `/cjm/${me.copyInformation.projectId}`
                    }


                    let result =  await me.getString(`storage://definitions/${me.copyInformation.projectId}/information/image`);
                    if( !result.Error ){
                        me.copyInformation.img = result
                    } else {
                        let image = await me.getString(`localstorage://image_${me.copyInformation.projectId}`);
                        if( image ) me.copyInformation.img = image

                        // let serverImageLists = await me.getObject(`localstorage://serverImageLists`)
                        // if(serverImageLists && serverImageLists[me.copyInformation.projectId]){
                        //     me.copyInformation.img = serverImageLists[me.copyInformation.projectId];
                        // }
                    }
                    me.set = true
                }
                me.renderKey++;
            },
            isNew(date) {
                var yesterdayTimeStamp = Date.now() - (1 * 24 * 60 * 60 * 1000)
                if (yesterdayTimeStamp < date) {
                    return true
                }
                return false
            },
            chipSetting() {
                var me = this
                if (me.copyInformation)
                    if (me.copyInformation.type == 'k8s') {
                        return {display: 'KUBERNETES', color: 'blue'}
                    } else if (me.copyInformation.type == 'bm') {
                        return {display: 'BusinessModel', color: 'orange'}
                    } else if (me.copyInformation.type == 'es') {
                        return {display: 'EVENTSTORMING', color: 'green'}
                    } else if (me.copyInformation.type == 'sticky') {
                        return {display: 'STICKY NOTE', color: 'purple'}
                    } else if (me.copyInformation.type == 'bpmn') {
                        return {display: 'BusinessProcess', color: 'pink'}
                    } else if (me.copyInformation.type == 'uml') {
                        return {display: 'UML', color: 'grey'}
                    } else if (me.copyInformation.type == 'project') {
                        return {display: 'Project', color: 'purple'}
                    } else if (me.copyInformation.type == 'cjm') {
                        return {display: 'Customer Journey Map', color: '#D81B60'}
                    } else {
                        return null
                    }
            },
            hiddenEmail(email) {
                return email ? email.split('@')[0] : 'undefined'
            },
            convertDate(timeStamp) {
                if (!timeStamp) timeStamp = Date.now()
                if (typeof timeStamp == 'string') timeStamp = Number(timeStamp)
                var date = new Date(timeStamp);
                return date.getFullYear() + "년 " + (date.getMonth() + 1) + "월 " + date.getDate() + "일 " + date.getHours() + "시 " + date.getMinutes() + "분"
            },
            async selectModel(){
                var me = this
                try{
                    me.loading = true
                    let versionInfo = await me.getObject(`db://definitions/${me.copyInformation.projectId}/versionLists/${me.latestVersion}`);
                    let versionValue = {elements: {}, relations: {}};

                    if( versionInfo && versionInfo.valueUrl ){
                        versionValue = await me.getObject(`storage://${versionInfo.valueUrl}`);
                    } else if( versionInfo && versionInfo.versionValue ) {
                        // For not migrate public model.
                        versionValue = JSON.parse(versionInfo.versionValue.value);
                    }

                    var obj = {
                        projectId: me.copyInformation.projectId,
                        projectVersion: me.latestVersion,
                        projectName: versionInfo ? versionInfo.projectName: me.copyInformation.projectName,
                        projectValue: versionValue
                    }
                    me.$emit('selected-model', obj)
                }catch (e) {

                }finally {
                    me.loading = false;
                }
            },
        },
    }

</script>


