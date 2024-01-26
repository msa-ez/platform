<template xmlns:v-on="http://www.w3.org/1999/xhtml">
    <div class="page" style="height: 100%">
        <v-tabs  v-model="tab">
            <v-tab key="0">HOME</v-tab>
            <v-tab key="1" :disabled="!isServer">AI</v-tab>
        </v-tabs>

        <v-tabs-items v-model="tab"  style="height: 100%" >
            <v-tab-item>
                <v-card flat v-if="isServer">
                    <v-card flat>
                        <v-card-title>Context Mapping Model</v-card-title>
                        <v-card-text style="width: 100%; white-space: nowrap; overflow-x: scroll;">
                            <v-row style="height: 100%; margin: 2px; width: max-content;">
                                <div v-for="id in cmModelLists" :key="id">
                                    <jump-to-model-lists-card :id="id" path="cm" @deleteDefinition="openDeleteDialog"></jump-to-model-lists-card>
                                </div>

                                <v-card :style="cmModelLists.length == 0 ? 'height: 150px': ''" style="text-align: center; margin-top: 5px; margin-left: 5px;" flat>
                                    <v-tooltip right>
                                        <template v-slot:activator="{ on }">
                                            <v-btn text style="align-items: center; width: 100%; height: 100%;" @click="openStorageDialog('cm')">
                                                <v-icon>mdi-plus</v-icon>
                                            </v-btn>
                                        </template>
                                        <span>add Model</span>
                                    </v-tooltip>
                                </v-card>
                            </v-row>
                        </v-card-text>
                    </v-card>
                    <v-divider></v-divider>

                    <v-card flat>
                        <v-card-title>Event Storming Model</v-card-title>
                        <v-card-text style="width: 100%; white-space: nowrap; overflow-x: scroll;">
                            <v-row style="height: 100%; margin: 2px; width: max-content;">
                                <div v-for="id in esModelLists" :key="id">
                                    <jump-to-model-lists-card :id="id" path="storming" @deleteDefinition="openDeleteDialog"></jump-to-model-lists-card>
                                </div>

                                <v-card :style="esModelLists.length == 0 ? 'height: 150px': ''" style="text-align: center; margin-top: 5px; margin-left: 5px;" flat>
                                    <v-tooltip right>
                                        <template v-slot:activator="{ on }">
                                            <v-btn text style="align-items: center; width: 100%; height: 100%;" @click="openStorageDialog('es')">
                                                <v-icon>mdi-plus</v-icon>
                                            </v-btn>
                                        </template>
                                        <span>add Model</span>
                                    </v-tooltip>
                                </v-card>
                            </v-row>
                        </v-card-text>
                    </v-card>
                    <v-divider></v-divider>

                    <v-card flat>
                        <v-card-title>Business Model</v-card-title>
                        <v-card-text style="width: 100%; white-space: nowrap; overflow-x: scroll;">
                            <v-row style="height: 100%; margin: 2px; width: max-content;">
                                <div v-for="id in bmModelLists" :key="id">
                                    <jump-to-model-lists-card :id="id" path="business-model-canvas" @deleteDefinition="openDeleteDialog"></jump-to-model-lists-card>
                                </div>
                                <v-card :style="bmModelLists.length == 0 ? 'height: 150px': ''" style="text-align: center; margin-top: 5px; margin-left: 5px;" flat>
                                    <v-tooltip right>
                                        <template v-slot:activator="{ on }">
                                            <v-btn text style="align-items: center; width: 100%; height: 100%;" @click="openStorageDialog('bm')">
                                                <v-icon>mdi-plus</v-icon>
                                            </v-btn>
                                        </template>
                                        <span>add Model</span>
                                    </v-tooltip>
                                </v-card>
                            </v-row>
                        </v-card-text>
                    </v-card>
                </v-card>
                <v-card flat v-else>
                    <v-card-text style="width: 25%; position: fixed; left: 40%; top: 25%;">
                        <v-card v-if="storageCondition">
                            <v-card-title class="headline">Save Project</v-card-title>
                            <v-card-text>
                                <br>
                                <v-text-field
                                        v-model="storageCondition.projectId"
                                        label="* Project ID(Unique ID)"
                                        style="font-weight: 900;"
                                        :error-messages="storageCondition.error && storageCondition.error['projectId']"
                                ></v-text-field>
                                <v-text-field
                                        v-model="storageCondition.projectName"
                                        label="Project Name"
                                ></v-text-field>

                                <v-textarea
                                        outline
                                        v-model="storageCondition.comment"
                                        name="input-7-4"
                                        label="Comment"
                                        :counter="255"
                                        rows="4"
                                ></v-textarea>
                            </v-card-text>

                            <v-card-actions style="justify-content: right;">
                                <v-progress-circular
                                        v-if="storageCondition.loading"
                                        indeterminate
                                        color="primary"
                                ></v-progress-circular>
                                <v-btn  v-else color="primary" @click="saveProject()">Save</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-card-text>
                </v-card>

                <ModelStorageDialog
                        :showDialog="showStorageDialog"
                        :condition="storageCondition"
                        @save="saveStorageDialog"
                        @close="closeStorageDialog()"
                ></ModelStorageDialog>

                <v-dialog v-model="showDeleteDialog" v-if="deleteCondition" persistent max-width="470">
                    <v-card>
                        <v-card-title class="headline">{{$t('word.deleteNotification')}}</v-card-title>
                        <v-img :src="deleteCondition.image"></v-img>
                        <v-card-text>AuthorEmail: {{ deleteCondition.authorEmail.split('@')[0] }}
                        </v-card-text>
                        <v-card-text>ProjectName: {{deleteCondition.projectName}}</v-card-text>
                        <v-card-text>date: {{convertTimeStampToDate(deleteCondition.createdTimeStamp)}}</v-card-text>
                        <v-card-text>LastModifiedDate: {{convertTimeStampToDate(deleteCondition.lastModifiedTimeStamp)}}</v-card-text>
                        <v-card-text>## 알림 ## "공유"된 파일의 경우 공동작업자가 사본을 생성할 수 있습니다.</v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn text @click="closeDeleteDialog()">{{$t('word.close')}}</v-btn>
                            <v-btn color="red darken-1" text @click="deleteDefinition()">{{$t('word.delete')}}</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
            </v-tab-item>

            <v-tab-item>
                <AutoModelingDialog
                        v-if="isInitLoading"
                        ref="autoModelingDialog"
                        mode="project"
                        :showChat="true"
                        :projectId="projectId"
                        :projectInfo="information"
                        :isServer="isServer"
                        @closeDialog="close()"
                        @forceUpdateKey="forceUpdateKey"
                        @saveProject="openStorageDialog('project')"
                        @backupProject="backupProject()"
                ></AutoModelingDialog>
            </v-tab-item>
        </v-tabs-items>

    </div>
</template>


<script>
    import StorageBase from "../../CommonStorageBase";
    import AutoModelingDialog from "../modeling/AutoModelingDialog";
    import ModelStorageDialog from "../modeling/ModelStorageDialog";

    export default {
        name: 'project-model',
        mixins: [StorageBase],
        components: {
            AutoModelingDialog,
            ModelStorageDialog
        },
        props: {
            projectId: {
                type: String,
                default: function () {
                    return null;
                }
            },
            projectVersion: {
                type: String,
                default: function () {
                    return null;
                }
            },
            information: {
                type: Object,
                default: function () {
                    return {};
                }
            },
            prompt: {
                type: String,
                default: function () {
                    return null;
                }
            },
            isEditable: {
                type: Boolean,
                default: function () {
                    return true;
                }
            },
            isDisable: {
                type: Boolean,
                default: function () {
                    return false;
                }
            },
            isServer: {
                type: Boolean,
                default: function () {
                    return false;
                }
            },
            isOwnModel: {
                type: Boolean,
                default: function () {
                    return false;
                }
            },
            isClass : {
                type: Boolean,
                default: function () {
                    return false;
                }
            },

        },
        data() {
            return {
                tab: 0,
                componentKey: 0,
                rtcRoomId: null,
                isInitLoading: false,

                showStorageDialog: false,
                storageCondition: null,

                showDeleteDialog: false,
                deleteCondition: null
            }
        },
        computed: {
            esModelLists(){
                if( !this.information) return []
                if( !this.information.eventStorming ) return []
                if( !this.information.eventStorming.modelList) return  []
                return this.information.eventStorming.modelList
            },
            bmModelLists(){
                if( !this.information) return []
                if( !this.information.businessModel ) return []
                if( !this.information.businessModel.modelList) return  []
                return this.information.businessModel.modelList
            },
            cmModelLists(){
                if( !this.information) return []
                if( !this.information.contextMapping ) return []
                if( !this.information.contextMapping.modelList) return  []
                return this.information.contextMapping.modelList
            }
        },
        created: async function () {
            var me = this

            try {
                await me.setUserInfo();
                me.loadProject();
            } catch (e) {
                alert('Error: Project ModelCanvas Created().', e)
            }
        },
        mounted: function () {

        },
        watch: {

        },
        beforeDestroy(){
            this.watch_off(`db://definitions/${this.projectId}/information`)
        },
        methods: {
            close(){
                this.$router.push('/')
            },
            saveStorageDialog(){
                if(this.storageCondition.type == 'project'){
                    this.saveProject()
                } else {
                    this.saveDefinition()
                }
            },
            getCondition(type){
                var me = this
                let condition = {
                    action: 'save',
                    title: 'Save Definition',
                    comment: '',
                    projectName: me.information.prompt,
                    projectId: `${me.information.projectId}-`,
                    error: null,
                    loading: false,
                    type: type
                }
                if(type == 'project') {
                    condition.title = 'Save project'
                    condition.projectId = me.projectId
                }

                return condition;
            },
            openStorageDialog(type){
                var me = this
                me.storageCondition = me.getCondition(type)
                me.showStorageDialog = true;
            },
            closeStorageDialog(){
                if( this.storageCondition.type != 'project') {
                    this.storageCondition = null;
                }
                this.showStorageDialog = false
            },
            openDeleteDialog(id, info){
                this.deleteCondition = info
                this.deleteCondition.projectId = id;
                this.showDeleteDialog = true
            },
            closeDeleteDialog(){
                this.deleteCondition = null;
                this.showDeleteDialog = false
            },
            async deleteDefinition(){
                var me = this

                if(me.deleteCondition.type == 'es' ){
                    me.information.eventStorming.modelList = me.information.eventStorming.modelList.filter(id => id != me.deleteCondition.projectId)
                } else if(me.deleteCondition.type == 'bm') {
                    me.information.businessModel.modelList = me.information.businessModel.modelList.filter(id => id != me.deleteCondition.projectId)
                } else if(me.deleteCondition.type == 'cm'){
                    me.information.contextMapping.modelList = me.information.contextMapping.modelList.filter(id => id != me.deleteCondition.projectId)
                }

                await me.delete(`db://userLists/${me.deleteCondition.author}/mine/${me.deleteCondition.projectId}`)
                me.backupProject()
                me.closeDeleteDialog()
            },
            async saveDefinition(){
                var me = this
                let validate = await me.validateStorageCondition(me.storageCondition, 'save');

                if(validate){
                    var projectVersion = me.storageCondition.version.replaceAll('.','-').trim();
                    var settingProjectId = me.storageCondition.projectId.replaceAll(' ','-').trim();
                    let initValue = {'elements': {}, 'relations': {}}

                    let valueUrl = await me.putString(`storage://definitions/${settingProjectId}/versionLists/${projectVersion}/versionValue`, JSON.stringify(initValue));
                    await me.pushObject(`db://definitions/${settingProjectId}/snapshotLists`, {
                        lastSnapshotKey: '',
                        snapshot: JSON.stringify(initValue),
                        snapshotImg: null,
                        timeStamp: Date.now()
                    })

                    /* 백업용 사용자의 local에서 마지막 모델링 정보 */
                    await me.putObject(`db://definitions/${settingProjectId}/versionLists/${projectVersion}`, {
                        saveUser: me.userInfo.uid,
                        saveUserEmail: me.userInfo.email,
                        saveUserName: me.userInfo.name,
                        projectName: me.projectName,
                        img: null,
                        timeStamp: Date.now(),
                        comment: me.storageCondition.comment,
                        valueUrl: valueUrl
                    })

                    await me.putObject(`db://definitions/${settingProjectId}/information`,  {
                        author: me.userInfo.uid,
                        authorEmail: me.userInfo.email,
                        lastVersionName: projectVersion,
                        comment: me.storageCondition.comment,
                        createdTimeStamp: Date.now(),
                        lastModifiedTimeStamp: Date.now(),
                        lastModifiedUser: null,
                        lastModifiedEmail: null,
                        projectName: me.projectName,
                        type: me.storageCondition.type,
                        associatedProject: me.projectId
                    })


                    let path = null;
                    if(me.storageCondition.type == 'es' ){
                        path = 'storming'
                        if(!me.information.eventStorming ) me.information.eventStorming = {}
                        if(!me.information.eventStorming.modelList) me.information.eventStorming.modelList = []
                        me.information.eventStorming.modelList.push(settingProjectId);
                    } else if(me.storageCondition.type == 'bm') {
                        path = 'business-model-canvas'
                        if(!me.information.businessModel ) me.information.businessModel = {}
                        if(!me.information.businessModel.modelList) me.information.businessModel.modelList = []
                        me.information.businessModel.modelList.push(settingProjectId);
                    } else if(me.storageCondition.type == 'cm'){
                        path = me.storageCondition.type
                        if(!me.information.contextMapping ) me.information.contextMapping = {}
                        if(!me.information.contextMapping.modelList) me.information.contextMapping.modelList = []
                        me.information.contextMapping.modelList.push(settingProjectId);
                    }

                    me.backupProject();
                    window.open(`/#/${path}/${settingProjectId}`, "_blank")
                    me.closeStorageDialog()
                } else {
                    me.storageCondition.loading = false;
                }

            },
            async saveProject(){
                let me = this;

                let validate = await me.validateStorageCondition(me.storageCondition, 'save');
                if(validate) {
                    me.information.projectId = me.storageCondition.projectId.replaceAll(' ', '-').trim();
                    me.information.projectName = me.storageCondition.projectName;
                    me.information.prompt = me.information.prompt ? me.information.prompt : me.information.projectName;
                    me.information.prompt = me.information.prompt ? me.information.prompt : me.information.projectId

                    await me.putObject(`db://definitions/${me.information.projectId}/information`, me.information);
                    me.isServer = true;
                    if( me.information.projectId != me.projectId ) me.$router.push({path: `/${me.information.type}/${me.information.projectId}`});
                    me.forceUpdateKey()
                    me.closeStorageDialog()
                } else{
                    me.storageCondition.loading = false
                }
            },
            async backupProject(){
                // type: eventStorming,  businessModel, customerJourneyMap
                var me = this
                if(!me.isLogin) return;

                if( me.isServer ) {
                    me.setObject(`db://definitions/${me.projectId}/information/eventStorming`, me.information.eventStorming)
                    me.setObject(`db://definitions/${me.projectId}/information/businessModel`, me.information.businessModel)
                    me.setObject(`db://definitions/${me.projectId}/information/customerJourneyMap`, me.information.customerJourneyMap)
                    me.setObject(`db://definitions/${me.projectId}/information/contextMapping`, me.information.contextMapping)
                }
            },
            async loadProject() {
                var me = this

                me.isInitLoading = false;
                var modelUrl = me.isClazzModeling ? me.projectId : me.$route.params.projectId

                if(modelUrl.includes(':')){
                    me.projectId = modelUrl.split(':')[0]
                    me.projectVersion = modelUrl.split(':')[1]
                    me.projectVersion = me.projectVersion.replaceAll('.','-')
                }else{
                    me.projectId = modelUrl
                }

                // rtc
                me.rtcRoomId = `projectRtc_${me.projectId}`

                if (me.projectId) {
                    var information = await me.list(`db://definitions/${me.projectId}/information`);

                    me.$EventBus.$emit('progressValue', true)
                    if (information) {
                        me.isServer = true;
                        await me.loadServerProject(information);
                        me.$EventBus.$emit('progressValue', false)
                    } else {
                        me.isServer = false;
                        me.loadLocalProject();
                        me.storageCondition = me.getCondition('project')
                        me.$EventBus.$emit('progressValue', false)
                    }
                }

                me.isInitLoading = true;
            },
            loadServerProject(information){
                var me = this
                me.settingPermission(information);
                me.watchInformation();
            },
            loadLocalProject() {
                var me = this

                me.information = {
                    author: me.userInfo.uid,
                    authorEmail: me.userInfo.email,
                    comment: "",
                    createdTimeStamp: Date.now(),
                    lastModifiedTimeStamp: Date.now(),
                    projectId: me.projectId,
                    projectName: "",
                    type: 'project',
                    eventStorming: null,
                    customerJourneyMap: null,
                    businessModel: null,
                    contextMapping: null,
                    prompt: ""
                }

                me.projectName = me.information.projectName  ? me.information.projectName : me.information.prompt
            },
            watchInformation(){
                var me = this
                me.watch(`db://definitions/${me.projectId}/information`, function (information) {
                    if (information) {
                        me.isServer = true;
                        me.information = information;
                    }
                })
            },
            settingPermission(information, init) {
                var me = this
                // Only Save Server Model
                me.isOwnModel = false;
                me.information = information ? information : me.information

                if( !me.projectVersion ){
                    me.projectName = me.information && me.information.projectName ? me.information.projectName : 'untitled'
                    me.isAutoForkModel = me.isClass ? false : Object.keys(this.$route.query).includes('fork')
                }

                if ( me.isClass ) {
                    // clazz Modeling
                    if( me.information ){
                        if ( me.information.author == me.userInfo.uid ) {
                            me.isOwnModel = true
                            me.isEditable = true
                        } else if( me.information.permissions && me.information.permissions['everyone'] ){
                            me.isEditable = false
                        } else {
                            me.isDisable = true;
                        }
                    } else {
                        me.isDisable = true;
                    }
                } else {
                    // Base Modeling
                    if (me.information.author == me.userInfo.uid) {
                        //my project
                        me.isOwnModel = true;
                    } else {
                        if (me.isLogin) {
                            if (me.information.permissions) {
                                var isPublic = false
                                if (me.information.permissions['everyone']) {
                                    isPublic = true
                                }
                                if (me.information.permissions[me.userInfo.uid]) {
                                    if (Object.keys(me.information.permissions[me.userInfo.uid]).includes('request')) {
                                        if (me.information.permissions[me.userInfo.uid].request == false) {
                                            if (isPublic) {
                                                me.isEditable = false
                                            } else {
                                                me.isDisable = true
                                            }
                                        } else if (me.information.permissions[me.userInfo.uid].request == true) {
                                            if (isPublic) {
                                                me.isEditable = false
                                            } else {
                                                me.isDisable = true
                                            }
                                        }
                                    } else if (me.information.permissions[me.userInfo.uid].write) {
                                        me.isEditable = true
                                    } else {
                                        me.isEditable = false
                                    }
                                } else {
                                    if (isPublic) {
                                        me.isEditable = false
                                    } else {
                                        me.isDisable = true
                                    }
                                }
                            } else {
                                me.isDisable = true
                            }
                        } else {
                            me.isDisable = true
                        }
                    }
                }
            },
            track() {
                this.$gtag.pageview(
                    {
                        page_title: `Project 모델`,
                        page_path: this.$route.path
                    }
                )
            },

            forceUpdateKey(){
                // reload.
                this.loadProject();
            },
            uuid: function () {
                function s4() {
                    return Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                        .substring(1);
                }

                return s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4();
            },

            async validateStorageCondition(condition, action){
                var me = this


                // Project Id
                if( !me.isLogin ) {
                    var otherMsg = 'Please check your login.';
                    var obj ={
                        'projectId': otherMsg
                    }
                    condition.error = obj
                    return false;
                }

                if( condition.projectId.includes('/') ){
                    var otherMsg = 'ProjectId must be non-empty strings and can\'t contain  "/"'
                    var obj ={
                        'projectId': otherMsg
                    }
                    condition.error = obj
                    return false;
                }
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


                if( condition.type == 'project') return true;

                // VERSION
                if( !condition.version ){
                    condition.version = me.getNowDate();
                }

                var validate = await me.isValidatePath(`db://definitions/${condition.projectId}/versionLists/${condition.version.replaceAll('.','-')}`)
                if( !(validate.status && !condition.version.replaceAll('.','-').includes('/') && !condition.version.replaceAll('.','-').includes(':')) ){
                    var otherMsg = 'Paths must be non-empty strings and can\'t contain  "/" or ":"'
                    var obj ={
                        'version': condition.version.replaceAll('.','-').includes('/') || condition.version.replaceAll('.','-').includes(':') ? otherMsg : validate.msg,
                    }
                    condition.error = obj
                    return false
                }

                var existVersion = await me.list(`db://definitions/${condition.projectId}/versionLists/${condition.version.replaceAll('.','-')}`)
                if(existVersion){
                    var otherMsg = 'This version already exists.'
                    var obj ={
                        'version': otherMsg,
                    }
                    condition.error = obj
                    return false
                }

                return true;
            },
            getNowDate(){
                var currentDate = new Date();

                function addLeadingZeros(number, length) {
                    var numberString = String(number);
                    while (numberString.length < length) {
                        numberString = "0" + numberString;
                    }
                    return numberString;
                }

                var year = currentDate.getYear(); // Get the current year (e.g., 2023)
                var month = currentDate.getMonth() + 1; // Get the current month (0-11, add 1 to get 1-12)
                var day = currentDate.getDate(); // Get the current day of the month (1-31)
                var hours = currentDate.getHours(); // Get the current day of the month (1-31)
                var min = currentDate.getMinutes(); // Get the current day of the month (1-31)
                var sec = currentDate.getSeconds(); // Get the current day of the month (1-31)
                var ms = currentDate.getMilliseconds(); // Get the current day of the month (1-31)

                year = String(year).slice(-2);
                month = addLeadingZeros(month, 2);
                day = addLeadingZeros(day, 2);
                hours = addLeadingZeros(hours, 2);
                min = addLeadingZeros(min, 2);
                sec = addLeadingZeros(sec, 2);

                var currentDateNumber = year + month + day + hours + min + sec + ms;

                return currentDateNumber;
            },


        }
    }
</script>