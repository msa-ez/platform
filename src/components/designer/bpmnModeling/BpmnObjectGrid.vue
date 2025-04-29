<template>
    <div>
        <!-- 삭제 확인 팝업 -->
        <v-dialog v-model="deleteDialog" max-width="290">
            <v-card>
                <v-card-title>{{ dc.title }}</v-card-title>
                <v-card-text>{{ dc.contentHtml }}</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text color="primary" @click="deleteDialog = false">{{ dc.cancel }}</v-btn>
                    <v-btn text color="primary" @click="deleteVariable">{{ dc.ok }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-data-table
                v-model="selected"
                :headers="dataHeaders"
                :items="value"
                :items-per-page="5"
                item-key="name"
                show-select
                :hide-default-header="selected.length > 0"
                @dblclick:row="editForm">
            <template v-slot:header="{ dataHeaders }">
                <thead v-if="selected.length > 0" class="v-data-table-header">
                    <tr>
                        <th colspan="6" class="text-start">
                            <span>{{ selected.length }} selected</span>
                        </th>
                        <th>
                            <v-btn icon @click="deleteDialog = true">
                                <v-icon>delete</v-icon>
                            </v-btn>
                        </th>
                    </tr>
                </thead>
            </template>
        </v-data-table>

        <div v-if="fullFledged">
            <v-btn text color="primary" @click="newForm">
                <v-icon>add</v-icon>
                Add
            </v-btn>
            

            <v-dialog v-model="updateDialogEnabled" max-width="400">
                <v-card>
                    <v-card-title>Edit</v-card-title>
                    <v-card-text>
                        <bpmn-object-form 
                                v-if="updateDialogEnabled"
                                :formData="formData"
                                :categories="categories"
                                :classList="classList"
                        ></bpmn-object-form>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" text @click="updateDialogEnabled = false">Close</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </div>
        <v-dialog v-model="addDialogEnabled" max-width="400">
            <v-card>
                <v-card-title>New</v-card-title>
                <v-card-text>
                    <bpmn-object-form 
                            v-if="addDialogEnabled"
                            :formData="formData"
                            :categories="categories"
                            :classList="classList"
                    ></bpmn-object-form>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" text @click="enterForm">Enter</v-btn>
                    <v-btn color="primary" text @click="addDialogEnabled = false">Close</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
    import CommonStorageBase from '../../CommonStorageBase'
    import BpmnObjectForm from './BpmnObjectForm.vue'

    var _ = require('lodash');

    export default {
        mixins: [CommonStorageBase],
        name: 'bpmn-object-grid',
        components: {
            'bpmn-object-form': BpmnObjectForm,
        },
        props: {
            value: Array,
            fullFledged: Boolean,
        },
        data: function () {
            return {
                isDelete: false,
                selected: [],
                deleteDialog: false,
                addDialogEnabled: false,
                updateDialogEnabled: false,
                formData: {
                    name: '',
                    displayName: '',
                    defaultValueInString: '',
                    global: false,
                    persistOption: '',
                    typeClassName: '',
                },
                categories: [
                    {
                        displayName: 'Primitive Types',
                        value: 'primitive'
                    }
                ],
                dataHeaders: [
                    {
                        text: 'Name',
                        align: 'start',
                        value: 'name',
                    },
                    {
                        text: 'Display Name',
                        value: 'displayName',
                    },
                    {
                        text: 'Default Value In String',
                        value: 'defaultValueInString',
                    },
                    {
                        text: 'Global',
                        value: 'global',
                    },
                    {
                        text: 'Persist Option',
                        value: 'persistOption',
                    },
                    {
                        text: '변수 유형',
                        value: 'typeClassName',
                    },
                ],
                dc: {
                    title: '데이터 삭제',
                    contentHtml: '해당 데이터를 삭제 하시겠습니까?',
                    cancel: 'No',
                    ok: 'Yes',
                },
                // class definition
                tabLists: {
                    'every': { lists: [] },
                    'mine': { lists: [] },
                    'share': { lists: [] },
                    'local': { lists: [] }
                },
                projectList: [],
                classList: [],
            }
        },
        watch: {
        },
        created: function () {
            if(this.selected) {
                this.selected = []
            }
            
            // class definition setting
            this.getProjectList();
        },
        methods: {
            newForm() {
                this.formData = {
                    name: '',
                    displayName: {
                        text: '',
                        _type: "org.uengine.contexts.TextContext"
                    },
                    defaultValueInString: '',
                    global: false,
                    persistOption: '',
                    typeClassName: '',
                }
                if(this.classList.length > 0) {
                    this.categories = [
                        {
                            displayName: 'Primitive Types',
                            value: 'primitive'
                        },
                        {
                            displayName: 'Class',
                            value: 'class'
                        }
                    ]
                }
                this.addDialogEnabled = true;
            },
            enterForm() {
                var me = this;
                if(!me.value)
                    me.value = []
                me.value.push(me.formData);
                me.formData = {
                    name: '',
                    displayName: '',
                    defaultValueInString: '',
                    global: false,
                    persistOption: '',
                    typeClassName: '',
                },
                me.addDialogEnabled = false;
                me.$emit("input", me.value);
            },
            editForm(event, value) {
                var me = this;
                me.formData = value.item;
                me.updateDialogEnabled = true;
            },
            deleteVariable() {
                var me = this;
                var filter = me.value.filter(function(item) {
                    return me.selected.indexOf(item) < 0;
                });
                me.value = filter;
                me.$emit("input", me.value);
                me.selected = [];
                me.deleteDialog = false;
            },

            async getProjectList() {
                var me = this
                try {
                    var uid = localStorage.getItem("uid") ? localStorage.getItem("uid") : 'anyone'

                    var option = {
                        sort: "desc",
                        orderBy: 'lastModifiedDate',
                        size: null,
                        startAt: null,
                        endAt: null,
                    }

                    // Local
                    var localSnapshots = await me.list(`localstorage://localLists`)
                    if (localSnapshots) {
                        var lists = JSON.parse(localSnapshots)
                        var filter = []

                        filter = lists.sort(function (a, b) {
                            return b.lastModifiedDate - a.lastModifiedDate;
                        })
                        me.tabLists.local.lists = filter
                    }

                    // Mine
                    var mineSnapshots = await me.list(`db://userLists/${uid}/mine`, option)
                    if (mineSnapshots) {
                        me.tabLists.every.lists = []
                        mineSnapshots.forEach(async function (snapshot) {
                            var project = snapshot
                            var projectId = snapshot.key
                            project.isServerProject = true

                            if (!project.projectId) {
                                project.projectId = projectId
                            }
                            if (!project.authorProfile) {
                                project.authorProfile = null
                            }
                            me.tabLists.mine.lists.push(project)
                        })
                    }
                    
                    // Share
                    var shareSnapshots = await me.list(`db://userLists/${uid}/share`, option)
                    if (shareSnapshots) {
                        me.tabLists.every.lists = []
                        shareSnapshots.forEach(async function (snapshot) {
                            var project = snapshot
                            var projectId = snapshot.key
                            project.isServerProject = true

                            if (!project.projectId) {
                                project.projectId = projectId
                            }
                            if (!project.authorProfile) {
                                project.authorProfile = null
                            }
                            me.tabLists.share.lists.push(project)
                        })
                    }

                    // Public
                    var pulicSnapshots = await me.list(`db://userLists/everyone/share`, option)
                    if (pulicSnapshots) {
                        me.tabLists.every.lists = []
                        pulicSnapshots.forEach(async function (snapshot) {
                            var project = snapshot
                            var projectId = snapshot.key
                            project.isServerProject = true

                            if (!project.projectId) {
                                project.projectId = projectId
                            }
                            if (!project.authorProfile) {
                                project.authorProfile = null
                            }
                            me.tabLists.every.lists.push(project)
                        })
                    }

                    Object.values(me.tabLists).forEach(function (tabValue) {
                        me.projectList = me.filterUmlClass(tabValue.lists)
                    })
                    
                    me.$nextTick(function() {
                        if(me.projectList.length > 0) {
                            me.classList = []
                            me.projectList.forEach(function (project) {
                                if(project.isServerProject) {
                                    me.getClassDefinitions(project.projectId)
                                }
                            })
                        }
                    })
                } catch (e) {
                    console.log(e.message)
                }
            },
            reversedChildren(snapshot) {
                var children = [];
                snapshot.forEach(function (child) {
                    children.unshift(child);
                });
                return children;
            },
            filterUmlClass(value) {
                var filters = this.projectList.length > 0 ? this.projectList : [];
                value.forEach(function (project) {
                    if (project) {
                        if (project.type == 'uml') {
                            filters.push(project);
                        }
                    }
                })
                return filters;
            },
            async getClassDefinitions(projectId) {
                var me = this;
                var snapshots = await me.list(`db://definitions/${projectId}`);
                var value, elements;
                if(snapshots.versionLists) {
                    Object.keys(snapshots.versionLists).forEach(function (versionKey) {
                        if(snapshots.information) {
                            if(snapshots.information.lastVersionName == versionKey) {
                                value = JSON.parse(snapshots.versionLists[versionKey].versionValue.value);
                                elements = value.elements;
                                if(elements) {
                                    Object.values(elements).forEach(function (definition) {
                                        if (definition) {
                                            me.classList.push(definition)
                                        }
                                    })
                                }
                            }
                        }
                    })
                }
            }
        }
    }
</script>
