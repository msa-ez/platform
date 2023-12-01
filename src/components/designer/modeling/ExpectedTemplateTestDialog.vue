<template>
    <div>
        <v-card style="z-index:2;">
            <div style="display: flex; height:88vh;">
                <div style="width: 400px; overflow-y: scroll;">
                    <v-card-title style="margin-bottom: -15px;">
                        Expected Template Test
                    </v-card-title>

                    <div>
                        <v-list
                            nav dense
                        >
                            <v-list-group
                                :value="true"
                                style="margin-left: -15px;"
                                no-action
                                sub-group
                            >
                                <template v-slot:activator>
                                    <v-list-item-content style="margin-left: -10px;">
                                        <v-list-item-title>Diff list</v-list-item-title>
                                    </v-list-item-content>
                                </template>
                                <v-list-item v-for="(filePath, i) in diffList" :key="i" 
                                    :style="selectedFilePath == filePath ? 'background-color: aliceblue;':''"
                                >
                                    <div style="cursor: pointer;"
                                        @click="onSelected('diff', filePath)"
                                    >
                                        <v-row>
                                            <Icon
                                                icon="mdi:file-document-edit-outline" width="20" height="20"
                                                style="color: #2278cf; position: relative; left: -30px;"
                                                :style="diffPathList[filePath].subPath && diffPathList[filePath].subPath != '' ? 'top: 20px;':'top: 9px;'"
                                            />
                                            <v-col style="margin-left:-35px; margin-right: 25px;">
                                                <v-list-item-subtitle
                                                        style="font-size: x-small;">
                                                    {{ diffPathList[filePath].subPath }}
                                                </v-list-item-subtitle>
                                                <v-list-item-title>
                                                    {{ diffPathList[filePath].name }} 
                                                </v-list-item-title>
                                            </v-col>
                                        </v-row>
                                    </div>
                                </v-list-item>
                            </v-list-group>
                            <v-list-group
                                :value="true"
                                style="margin-left: -15px;"
                                no-action
                                sub-group
                            >
                                <template v-slot:activator>
                                    <v-list-item-content style="margin-left: -10px;">
                                        <v-list-item-title>Actual list</v-list-item-title>
                                    </v-list-item-content>
                                </template>
                                <v-list-item v-for="(filePath, i) in existOnlyActual" :key="i"
                                    :style="selectedFilePath == filePath ? 'background-color: aliceblue;':''"
                                >
                                    <div style="cursor: pointer;"
                                        @click="onSelected('actual', filePath)"
                                    >
                                        <v-row>
                                            <Icon
                                                icon="mdi:file-document-plus-outline" width="20" height="20"
                                                style="color: green; position: relative; left: -30px;"
                                                :style="diffPathList[filePath].subPath && diffPathList[filePath].subPath != '' ? 'top: 20px;':'top: 9px;'"
                                            />
                                            <v-col style="margin-left:-35px; margin-right: 25px;">
                                                <v-list-item-subtitle
                                                        style="font-size: x-small;">
                                                    {{ diffPathList[filePath].subPath }}
                                                </v-list-item-subtitle>
                                                <v-list-item-title>
                                                    {{ diffPathList[filePath].name }} 
                                                </v-list-item-title>
                                            </v-col>
                                        </v-row>
                                    </div>
                                </v-list-item>
                            </v-list-group>
                            <v-list-group
                                :value="true"
                                style="margin-left: -15px;"
                                no-action
                                sub-group
                            >
                                <template v-slot:activator>
                                    <v-list-item-content style="margin-left: -10px;">
                                        <v-list-item-title>Expected list</v-list-item-title>
                                    </v-list-item-content>
                                </template>
                                <v-list-item v-for="(filePath, i) in existOnlyExpected" :key="i"
                                    :style="selectedFilePath == filePath ? 'background-color: aliceblue;':''"
                                >
                                    <div style="cursor: pointer;"
                                        @click="onSelected('expected', filePath)"
                                    >
                                        <v-row>
                                            <Icon
                                                icon="mdi:file-document-minus-outline" width="20" height="20"
                                                style="color: red; position: relative; left: -30px;"
                                                :style="diffPathList[filePath].subPath && diffPathList[filePath].subPath != '' ? 'top: 20px;':'top: 9px;'"
                                            />
                                            <v-col style="margin-left:-35px; margin-right: 25px;">
                                                <v-list-item-subtitle
                                                        style="font-size: x-small;">
                                                    {{ diffPathList[filePath].subPath }}
                                                </v-list-item-subtitle>
                                                <v-list-item-title>
                                                    {{ diffPathList[filePath].name }} 
                                                </v-list-item-title>
                                            </v-col>
                                        </v-row>
                                    </div>
                                </v-list-item>
                            </v-list-group>
                        </v-list>
                    </div>
                </div>
                <v-divider vertical />
                <v-card-text style="padding:1px;">
                    <code-viewer
                        v-if="isDiff"
                        :type="'diff'"
                        :isExpectedTemplate="true"
                        v-model="selectedTemplateFramework"
                        :create-value="selectedTemplateFile"
                        :editMode="true"
                        :readOnly="true"
                        class="gs-expected-code-viewer1"
                    ></code-viewer>
                    <div v-else :key="codeViewerRenderKey">
                        <code-viewer
                            ref="codeViewer"
                            :isExpectedTemplate="true"
                            v-model="selectedTemplateFile"
                            :editMode="true"
                            :readOnly="true"
                            class="gs-expected-code-viewer1"
                        ></code-viewer>
                    </div>
                </v-card-text>
            </div>
        </v-card>
    </div>
</template>

<script>
    import CodeViewer from "../CodeViewer";

    export default {
        name: 'expected-template-test-dialog',
        mixins:[],
        components: {
            CodeViewer,
        },
        props: {
            actualCodeList: Array,
            templateFrameWorkList: Object,
            existOnlyExpected: Array,
            existOnlyActual: Array,
            diffList: Array,
            templateMetaData: Object,
            modelingProjectId: String,
        },
        data() {
            return {
                isDiff: true,
                selectedTemplateFile: [],
                selectedTemplateFramework: [],
                diffPathList: {},
                selectedFilePath: null,
                codeViewerRenderKey: 0,
            }
        },
        watch: {
            
        },
        computed: {

        },
        created:function () {
            
        },
        beforeDestroy: function () {

        },
        mounted: function () { 
            var me = this
            me.diffPathList = {}
            me.diffList.forEach(function (filePath){
                var path = filePath.split("/")
                me.diffPathList[filePath] = {
                    name: path[path.length - 1],
                    subPath: null
                }
                path = filePath.replace(path[path.length - 1], "")
                me.diffPathList[filePath].subPath = path
            })
            me.existOnlyActual.forEach(function (filePath){
                var path = filePath.split("/")
                me.diffPathList[filePath] = {
                    name: path[path.length - 1],
                    subPath: null
                }
                path = filePath.replace(path[path.length - 1], "")
                me.diffPathList[filePath].subPath = path
            })
            me.existOnlyExpected.forEach(function (filePath){
                var path = filePath.split("/")
                me.diffPathList[filePath] = {
                    name: path[path.length - 1],
                    subPath: null
                }
                path = filePath.replace(path[path.length - 1], "")
                me.diffPathList[filePath].subPath = path
            })

            me.onSelected('diff', me.diffList[0])
        },
        methods: {
            onSelected(type, filePath){
                var me = this
                me.selectedFilePath = filePath
                if(type == 'actual' || type == 'diff'){
                    me.selectedTemplateFile[0] = JSON.parse(JSON.stringify(me.actualCodeList.find(x => x.fullPath == filePath)))
                }

                if(type == 'expected' || type == 'diff'){
                    var expectedFilePath = `.template/test/expected/${filePath.replace(me.modelingProjectId, me.templateMetaData.testModel)}`
                }

                if(type == 'diff'){
                    me.selectedTemplateFramework = JSON.parse(JSON.stringify(me.selectedTemplateFile))
                    me.selectedTemplateFramework[0].code = me.templateFrameWorkList[me.selectedTemplateFramework[0].template][expectedFilePath].content
                    me.isDiff = true
                } else {
                    if(type == 'expected'){
                        Object.keys(me.templateFrameWorkList).some(function (key){
                            if(me.templateFrameWorkList[key][expectedFilePath] && me.templateFrameWorkList[key][expectedFilePath].content){
                                me.selectedTemplateFile[0].code = me.templateFrameWorkList[key][expectedFilePath].content
                                return true;
                            }
                        })
                    }
                    me.isDiff = false
                    me.codeViewerRenderKey++;
                } 
            },
            setOpenedFolderList(item){
                this.selectedTemplateTreePathList = item.fullPath
            },
        }
    }
</script>
<style>
</style>