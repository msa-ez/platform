<template>
    <common-panel
            v-model="value"
            :image="image"
            :is-read-only="canvas.isReadOnlyModel"
            :width-style="widthStyle"
            :related-url="relatedUrl"
            :validation-lists="validationLists"
            :translate-obj="translateObj"
            :element-author-display="elementAuthorDisplay"
            @close="closePanel"
            @changeTranslate="changeTranslate"
    >

        <template slot="t-description-text">
        </template>

        <template slot="t-generation-text">
        </template>


        <template slot="t-edit-user">
            <div
                    v-if="newEditUserImg.length > 0 && canvas.isReadOnlyModel"
                    style="text-align:center"
            >
                <v-chip
                        small
                        color="orange"
                        text-color="white"
                        style="font-weight:bold;"
                        @click.once="forceEditPanel()"
                >
                    <v-avatar left>
                        <v-icon>mdi-lead-pencil</v-icon>
                    </v-avatar>
                    <v-row>
                        <div style="margin-left: 10px;"> {{newEditUserImg[0].name}} is now editing...</div>
                        <div style="font-size: 12px; margin-right: 10px;"> ( Click to force editing ) </div>
                    </v-row>
                </v-chip>
            </div>
        </template>

        <template slot="element">
            <div v-if="!value.modelValue.openAPI">
                <v-card flat>
                    <v-card-title style="color: #757575;">
                        Selected Model Info
                    </v-card-title>
                    <v-card-text>
                        <div>
                            Project ID   :
                            <a
                                    @click="moveToModel()"
                            >{{selectedProjectId}}</a>
                        </div>
                        <div>
                            Project Name : {{value.modelValue.projectName}}
                        </div>
                        <div>
                            Selected Version
                            <v-autocomplete
                                    v-model="selectVersion"
                                    :items="versionNameLists"
                                    :auto-select-first="true"
                                    :disabled="canvas.isReadOnlyModel"
                                    :loading="loading"
                            ></v-autocomplete>
                        </div>
                    </v-card-text>
                </v-card>
            </div>
            <div>
                <v-card flat>
                    <v-card-title style="color: #757575;">Select Visibility Element</v-card-title>
                    <v-card-text>
                        <div>
                            Read Element
                            <v-autocomplete
                                    v-model="selectedRead"
                                    :items="value.views"
                                    :disabled="canvas.isReadOnlyModel"
                                    item-text="name"
                                    return-object
                                    multiple
                                    density="comfortable"
                            ></v-autocomplete>
                        </div>
                        <div>
                            Command Element
                            <v-autocomplete
                                    v-model="selectedCommand"
                                    :items="value.commands"
                                    :disabled="canvas.isReadOnlyModel"
                                    item-text="name"
                                    return-object
                                    multiple
                                    density="compact"
                            ></v-autocomplete>
                        </div>
                    </v-card-text>
                </v-card>
            </div>
        </template>
    </common-panel>
</template>


<script>
    import CommonPanel from "./CommonPanel";
    import EventStormingModelPanel from "../EventStormingModelPanel";
    var jsondiffpatch = require('jsondiffpatch').create({
        objectHash: function (obj, index) {
            return '$$index:' + index;
        },
    });

    export default {
        mixins: [EventStormingModelPanel],
        name: 'pbc-panel',
        components: {
            CommonPanel,
        },
        data() {
            return {
                selectVersion: null,
                versions: null,
                loading: false,
                selectedRead: [],
                selectedCommand: [],
            }
        },
        computed: {
            selectedProjectId(){
                return this.value ? this.value.modelValue.projectId : null
            },
            versionNameLists(){
                if(this.versions){
                    return Object.keys(this.versions)
                }
                return null
            },
        },
        created: function () {
            var me = this
            me.panelInit()
        },
        watch: {
            "selectVersion":function (newVal, oldVal) {
                if(oldVal){
                    this.loading = true
                    this.generatePBC(newVal)
                }
            },
        },
        mounted(){},
        methods: {
            async panelInit(){
                var me = this
                // Element
                me.selectVersion = me.value.modelValue.projectVersion
                me.versions = await me.getString(`db://definitions/${me.selectedProjectId}/versionLists`)
                await me.migrateVersions(me.selectedProjectId, me.versions);

                me.selectedRead = me.value.views.filter(item => item && item.visibility == "public")
                me.selectedCommand = me.value.commands.filter(item => item && item.visibility == "public")

                // Common
                me.$super(EventStormingModelPanel).panelInit()
            },
            async migrateVersions(projectId, versions){
                var me = this

                for(let version in versions){
                    if( projectId && !versions[version].valueUrl ){
                        let versionInfo =  versions[version].versionInfo
                        let versionValue =  versions[version].versionValue && versions[version].versionValue.value  ? versions[version].versionValue.value : versions[version].versionValue;
                        if(!versionInfo){
                            versionInfo = {}
                        }

                        let valueUrl = await me.putString(`storage://definitions/${projectId}/versionLists/${version}/versionValue`, versionValue);
                        versionInfo.valueUrl = valueUrl;

                        // date -> timeStamp
                        versionInfo.timeStamp = versionInfo.date;
                        delete versionInfo.date;

                        await me.putObject(`db://definitions/${projectId}/versionLists/${version}`, versionInfo);
                        me.delete(`db://definitions/${projectId}/versionLists/${version}/versionValue`);
                        me.delete(`db://definitions/${projectId}/versionLists/${version}/versionInfo`);
                    }
                }
            },
            executeBeforeDestroy() {
                var me = this
                // Element
                me.value.views.forEach(function (element, idx) {
                    if(me.selectedRead.find(x=> x && x.elementView.id == element.elementView.id) ) {
                        element.visibility = 'public'
                    } else {
                        element.visibility = 'private'
                    }
                })

                me.value.commands.forEach(function (element, idx) {
                    if(me.selectedCommand.find(x=> x && x.elementView.id == element.elementView.id) ) {
                        element.visibility = 'public'
                    } else {
                        element.visibility = 'private'
                    }
                })


                // Common
                me.$super(EventStormingModelPanel).executeBeforeDestroy()
            },
            moveToModel(){
                window.open(`${window.location.origin}/#/storming/${this.selectedProjectId}`, "_blank")
            },
            async generatePBC(version){
                var me = this
                var versionInfo = await me.list(`db://definitions/${me.selectedProjectId}/versionLists/${version}`);
                let versionValue = {'elements': {}, 'relations': {}};

                if(versionInfo){
                    versionValue = await me.getObject(`storage://${versionInfo.valueUrl}`);
                }

                let projectName = versionInfo ? versionInfo.projectName : ''

                var obj = {
                    projectId: me.selectedProjectId,
                    projectVersion: version,
                    projectName: projectName,
                    projectValue: versionValue
                }
                let copyValue = JSON.parse(JSON.stringify(me.value));
                me.value = me.canvas.generatePBC(copyValue,obj);
                me.canvas.$refs[`${me.value.elementView.id}`][0].panelValue = me.value
                me.loading = false
            },
        }
    }
</script>

<style scoped>
    .v-autocomplete-list {
        max-height: 200px; /* Set your desired maximum height */
        overflow-y: auto;  /* Add vertical scrollbar if needed */
        border: 1px solid #ccc; /* Add other styling as needed */
    }
</style>

