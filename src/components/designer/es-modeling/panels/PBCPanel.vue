<template>
    <common-panel
            v-model="value"
            :image="image"
            :is-read-only="isReadOnly"
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
                    v-if="newEditUserImg.length > 0 && isReadOnly"
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
                    <v-row class="ma-0 pa-0">
                        <div>{{newEditUserImg[0].name}} is editing...</div>
                        <div style="font-size: 12px;">( Click to edit )</div>
                    </v-row>
                </v-chip>
            </div>
        </template>

        <template slot="element">
            <div v-if="!value.modelValue.openAPI && !value.modelValue.modelPath">
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
                                    :disabled="isReadOnly"
                                    :loading="loading"
                            ></v-autocomplete>
                        </div>
                    </v-card-text>
                </v-card>
            </div>
            <div>
                <v-card flat>
                    <v-card-title style="color: #757575;">{{ $t('PBCPanel.selectVisibilityElement') }}</v-card-title>
                    <v-card-text>
                        <div>
                            {{ $t('PBCPanel.readElement') }}
                            <v-autocomplete
                                    v-model="selectedReads"
                                    :items="value.views"
                                    :disabled="isReadOnly"
                                    item-text="name"
                                    return-object
                                    multiple
                                    density="comfortable"
                            ></v-autocomplete>
                        </div>
                        <div>
                            {{ $t('PBCPanel.commandElement') }}
                            <v-autocomplete
                                    v-model="selectedCommands"
                                    :items="value.commands"
                                    :disabled="isReadOnly"
                                    item-text="name"
                                    return-object
                                    multiple
                                    density="compact"
                            ></v-autocomplete>
                        </div>
                        <div>
                            {{ $t('PBCPanel.eventElement') }}
                            <v-autocomplete
                                    v-model="selectedEvents"
                                    :items="value.events"
                                    :disabled="isReadOnly"
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
                selectedReads: [],
                selectedCommands: [],
                selectedEvents: [],
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
        created: function () { },
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

                me.selectedReads = me.value.views.filter(item => item && item.visibility == "public")
                me.selectedCommands = me.value.commands.filter(item => item && item.visibility == "public")
                me.selectedEvents = me.value.events.filter(item => item && item.visibility == "public")

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

                // IN
                me.value.views.forEach(function (element, idx) {
                    if(me.selectedReads.find(x=> x && x.elementView.id == element.elementView.id) ) {
                        element.visibility = 'public'
                    } else {
                        element.visibility = 'private'
                    }
                })
                me.value.commands.forEach(function (element, idx) {
                    if(me.selectedCommands.find(x=> x && x.elementView.id == element.elementView.id) ) {
                        element.visibility = 'public'
                    } else {
                        element.visibility = 'private'
                    }
                })

                // Out
                me.value.events.forEach(function (element, idx) {
                    if(me.selectedEvents.find(x=> x && x.elementView.id == element.elementView.id) ) {
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
            generatePBC(version){
                var me = this
                me.$app.try({
                    context: me,
                    async action(me){
                        let versionInfo = await me.list(`db://definitions/${me.selectedProjectId}/versionLists/${version}`);
                        let versionValue = {'elements': {}, 'relations': {}};
                        if(versionInfo){
                            versionValue = await me.getObject(`storage://${versionInfo.valueUrl}`);
                        }

                        let projectName = versionInfo ? versionInfo.projectName : ''
                        let copyValue = JSON.parse(JSON.stringify(me.value));
                        me.value = me.canvas.generatePBC(copyValue, {
                            projectId: me.selectedProjectId,
                            projectVersion: version,
                            projectName: projectName,
                            projectValue: versionValue
                        });
                        me.canvas.$refs[`${me.value.elementView.id}`][0].panelValue = me.value
                        me.loading = false
                    }
                });
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

