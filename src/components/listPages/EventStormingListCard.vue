<template>
    <v-card
            v-if="!set"
            outlined
            class="mx-auto"
            style="width: 400px; height: 300px; justify-content: center;"
            align="center"
    >
        <v-skeleton-loader
                ref="skeleton"
                type="card"
                class="mx-auto"
        >
        </v-skeleton-loader>
    </v-card>
    <v-card
            v-else
            outlined
            class="mx-auto"
            max-width="800"
            max-height="500"
    >
        <div :key="renderKey">
            <slot name="image">
                <v-img
                        @click.native="openProject()"
                        style="cursor:pointer;"
                        :src="copyInformation.img"
                        max-width="800"
                        max-height="200"
                >

                    <slot name="chips">
                        <v-row justify="end" style="margin:0px;">
                            <v-chip
                                    v-if="copyInformation.isDeleteProject"
                                    class="ma-2"
                                    color="red"
                                    text-color="white"
                                    style="margin-right: 10px;"
                                    small
                                    outlined
                            >
                                Deleted
                            </v-chip>
                            <v-chip
                                    v-if="copyInformation.isNewProject"
                                    class="ma-2"
                                    color="red"
                                    style="margin-right: 10px; width: auto; height: 20px; font-size: 10px; font-weight:bold; "
                                    small
                                    outlined
                            >
                                NEW
                            </v-chip>
                            <v-chip
                                    v-if="copyInformation.chip"
                                    class="ma-2"
                                    :color="copyInformation.chip.color"
                                    small
                                    outlined
                                    style="width: auto; height: 20px; font-size: 10px; font-weight:bold;"
                            >
                                {{copyInformation.chip.display}}
                            </v-chip>
                            <v-chip
                                    v-if="copyInformation.isShared"
                                    class="ma-2"
                                    color="orange"
                                    small
                                    outlined
                            >
                                shared
                            </v-chip>
                        </v-row>
                    </slot>
                </v-img>
            </slot>
        </div>

        <v-list-item style="margin-bottom:10px;" three-line>
            <slot name="body">
                <v-list-item-content style="max-width:18%; margin-left: 1%; margin-right: 3%;">
                    <div style=" text-align: center;">
                        <div style="cursor:pointer;">
                            <v-avatar
                                    size="40"
                                    @click="openUserProfile()"
                            >
                                <div v-if="copyInformation.authorProfile" style="width: 100%;height: 100%;">
                                    <img
                                            :src="copyInformation.authorProfile"
                                    >
                                </div>
                                <div v-else>
                                    <v-icon x-large>mdi-account-circle</v-icon>
                                </div>
                            </v-avatar>
                        </div>
                        <div style="width: 100%; height: 100%; font-size:11px; margin-top:5px;">{{ copyInformation.hiddenEmail }}
                        </div>
                    </div>
                </v-list-item-content>
                <div v-bind:style="isDelete ? 'text-decoration-line: line-through;': ''">
                    <v-card-title style="margin:-10px 0 -10px 0;">
                        <!--                        {{course}}-->
                        {{ copyInformation.projectName }}
                    </v-card-title>
                    <v-card-text style="color:rgba(0, 0, 0, 0.6)">
                        LastModified Date : {{ copyInformation.lastModifiedTimeStamp }}<br>
                        Created Date : {{copyInformation.createdTimeStamp }}<br>
                        Comment : {{copyInformation.comment}}<br>
                    </v-card-text>
                </div>
            </slot>
        </v-list-item>
        <v-card-actions>
            <slot name="action" :project="copyInformation">
                <div style="position: absolute; bottom:5px; right:5px;">
                    <v-btn
                        v-if="deletedAble"
                        :disabled="isDelete"
                        color="red"
                        text
                        @click.native="deleteProject()"
                    >
                        Delete
                    </v-btn>

                    <v-btn  text
                        color="primary"
                        :disabled="isDelete"
                        @click.native="openProject()"
                    >
                        {{enterText}}
                    </v-btn>
                </div>
            </slot>
        </v-card-actions>
    </v-card>
</template>

<script>
    import LabBase from "../labs/LabStorageBase";
    export default {
  components: {},
        name: "eventstorming-list-card",
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
                projectPath: '',
                defaultImage: '/static/image/listCard/eventStormingDefaultImage.png',
            }
        },
        created() {
            this.setting()
        },
        computed: {
            deletedAble() {
                if (this.copyInformation) {
                    if (this.copyInformation.isLocalProject) {
                        return true
                    }

                    if (this.copyInformation.authorId) {
                        if (this.copyInformation.authorId == localStorage.getItem('uid')) {
                            return true
                        } else {
                            return false
                        }
                    }
                }
                return false
            },
            isOwnModel() {
                if (this.copyInformation.authorId == localStorage.getItem('uid')) {
                    return true
                }
                return false
            },
            enterText() {
                if (this.isOwnModel) {
                    return 'Edit'
                }
                return 'Join'
            },
        },
        mounted() {
            var me = this
            me.$EventBus.$on(`completeDelete_${me.copyInformation.projectId}`, function () {
                me.isDelete = true
            })
        },
        methods: {
            async setting() {
                var me = this
                me.copyInformation = JSON.parse(JSON.stringify(me.information))
                let providerUid = localStorage.getItem('providerUid')
                if (me.copyInformation && !me.set) {
                    if (!me.copyInformation.img) {
                        me.copyInformation.img = me.defaultImage
                    }
                    me.copyInformation.authorId = me.information.authorId ? me.information.authorId : me.information.author
                    me.copyInformation.projectId = me.information.objectID ? me.information.objectID : me.information.projectId
                    me.copyInformation.createdTimeStamp = me.information.createdTimeStamp ? me.convertDate(me.information.createdTimeStamp) : me.convertDate(me.information.date)
                    me.copyInformation.lastModifiedTimeStamp = me.information.lastModifiedTimeStamp ? me.convertDate(me.information.lastModifiedTimeStamp) : me.convertDate(me.information.lastModifiedDate)
                    me.copyInformation.hiddenEmail = me.hiddenEmail(me.copyInformation.authorEmail)
                    me.copyInformation.isShared = me.copyInformation.permissions && me.copyInformation.permissions.length > 0 ? true : false
                    me.copyInformation.isNewProject = me.isNew(me.copyInformation.lastModifiedTimeStamp)
                    me.copyInformation.isDeleteProject = false
                    me.copyInformation.chip = me.chipSetting()

                    let prefix = `${providerUid}_${me.information.type}_`
                    if(me.copyInformation.projectId.startsWith(`${prefix}`)){
                        me.projectPath = `/${providerUid}`
                        me.copyInformation.projectId = me.copyInformation.projectId.split(prefix)[1]
                    } 

                    if (me.information.type == 'es') {
                        me.projectPath = `${me.projectPath}/storming/${me.copyInformation.projectId}`
                    } else if (me.information.type == 'k8s') {
                        me.projectPath = `${me.projectPath}/kubernetes/${me.copyInformation.projectId}`
                    } else if (me.information.type == 'bm') {
                        me.projectPath = `${me.projectPath}/business-model-canvas/${me.copyInformation.projectId}`
                    } else {
                        me.projectPath = `${me.projectPath}/${me.information.type}/${me.copyInformation.projectId}`
                    }
                    
                    
                    // lazy image
                    let result =  await me.getString(`storage://definitions/${me.copyInformation.projectId}/information/image`);
                    if( result && !result.Error ){
                        me.copyInformation.img = result
                    } else {
                        let image = await me.getString(`localstorage://image_${me.copyInformation.projectId}`);
                        if(image) {
                            me.copyInformation.img = image
                        } else {
                            if(me.copyInformation.type == 'project') {
                                me.copyInformation.img = me.defaultImage
                            } else if (me.copyInformation.type == 'es'){
                                me.copyInformation.img = me.defaultImage
                            }
                        }
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
                        return {display: 'BusinessModel', color: '#616161'}
                    } else if (me.copyInformation.type == 'es') {
                        return {display: 'EVENTSTORMING', color: 'green'}
                    } else if (me.copyInformation.type == 'sticky') {
                        return {display: 'STICKY NOTE', color: 'purple'}
                    } else if (me.copyInformation.type == 'bpmn') {
                        return {display: 'BusinessProcess', color: '#16a085'}
                    } else if (me.copyInformation.type == 'uml') {
                        return {display: 'UML', color: '#45AAF2'}
                    } else if (me.copyInformation.type == 'project') {
                        return {display: 'Project', color: 'purple'}
                    } else if (me.copyInformation.type == 'cm') {
                        return {display: 'Context Mapping', color: '#f7d31e'}
                    } else if (me.copyInformation.type == 'cjm') {
                        return {display: 'Customer Journey Map', color: '#D81B60'}
                    }else if (me.copyInformation.type == 'userStoryMap') {
                        return {display: 'User Story Map', color: '#F39C12'}
                    } else {
                        return null
                    }
            },
            openProject(){ 
                var me = this
                // if (me.copyInformation.type == 'project') {
                //     me.$emit("openAutoModelingDialog", me.copyInformation.projectId)
                // } else {
                    me.$EventBus.$emit('progressValue', true)
                    me.$router.push(me.projectPath)
                // }
            },
            openUserProfile() {
                this.$router.push(`/userInfo/${this.information.author}`)
            },
            deleteProject() {
                this.$emit('delete', this.information)
            },
            hiddenEmail(email) {
                return email ? email.split('@')[0] : 'undefined'
            },
            convertDate(timeStamp) {
                if (!timeStamp) return null;
                if (typeof timeStamp == 'string') timeStamp = Number(timeStamp)
                var date = new Date(timeStamp);
                return date.getFullYear() + "년 " + (date.getMonth() + 1) + "월 " + date.getDate() + "일 " + date.getHours() + "시 " + date.getMinutes() + "분"
            },
        },
        beforeDestroy() {
            var me = this
            me.$EventBus.$emit('progressValue', false)
        }
    }

</script>


