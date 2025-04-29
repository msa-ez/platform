<template>
    <div>
        <v-tabs
                v-model="selectedIndex"
                background-color="transparent"
                color="blue darken-1"
                left
                show-arrows
        >

            <div v-for="(tabObj, index) in filterTabLists" :key="index" style="align-self: center;">
                <v-tab
                        v-if="tabObj.show"
                        :key="tabObj.id"
                        @click="tabClickHandler(tabObj)"
                >
                    {{tabObj.display}}
                    <v-avatar v-if="tabObj.totalCount!=null" color="green lighten-5" size="30"
                              style="margin-left: 5px;margin-bottom: 15px; font-size:10px;">
                        {{ tabObj.totalCount }}
                    </v-avatar>
                    <v-avatar v-else-if="tabObj.totalCount==null" color="green lighten-5"
                              size="30"
                              style="margin-left: 5px;margin-bottom: 15px; font-size:10px;">
                        ...
                    </v-avatar>
                    <v-avatar v-else-if="tabObj.totalCount==0" color="green lighten-5" size="30"
                              style="margin-left: 5px;margin-bottom: 15px; font-size:10px;">
                        0
                    </v-avatar>
                </v-tab>
            </div>
        </v-tabs>

        <v-tabs-items v-model="tabListIndex">
            <v-tab-item :value="tabListIndex">
                <v-row style="margin-top:0px;">
                    <v-col
                            v-if="(showLoading && filteredList && filteredList.length < 10)
                                || filteredList == undefined
                                && typeof filteredList == 'undefined'"
                            style="height: 100%;"
                    >
                        <v-row>
                            <v-col v-for="idx in 9" :key="idx">
                                <v-card outlined
                                        class="mx-auto"
                                        style="width: 500px; height: 400px; justify-content: center; align: center;"
                                >
                                    <v-skeleton-loader
                                            ref="skeleton"
                                            type="card"
                                            class="mx-auto"
                                    ></v-skeleton-loader>
                                </v-card>
                            </v-col>
                        </v-row>
                    </v-col>
                    <v-col v-else-if="filteredList == null && typeof filteredList == 'object' "
                           style="height: 590px;"
                    >
                        No Items
                    </v-col>
                    <v-col  v-else
                            cols="12"
                            v-for="(project) in filteredList" :key="project.projectId"
                    >
                        <EventStormingModelCard
                                :modelId="modelId"
                                :information="project"
                        ></EventStormingModelCard>
                    </v-col>
                </v-row>
            </v-tab-item>
        </v-tabs-items>
    </div>
</template>

<script>
    import CommonStorageBase from "../../CommonStorageBase";
    import EventStormingModelCard from "./PBCModelCard";

    var _ = require('lodash');

    export default {
        name: 'eventstorming-model-list',
        mixins: [CommonStorageBase],
        components: {
            EventStormingModelCard,
        },
        props: {
            modelId: String,
        },
        data() {
            return {
                //tabs
                selectedIndex: 0,
                tabListIndex: 0,
                tabLists: [
                    {key: 0, id: 'every', display: 'Public', count: 0, totalCount: null, show: true},
                    {key: 1, id: 'mine', display: 'Mine', count: 0, totalCount: null, show: false},
                ],

                //list
                every: undefined,
                mine: undefined,

                //loading
                showLoading: false,
                showLoadingForMorePage: false,

                //mode
                mode: 'es',
            }
        },
        async created() {
            var me = this
            await me.setUserInfo()
            me.initPage()
        },
        mounted() {
            var me = this
        },
        watch: {
            "mode": _.debounce(
                function () {
                    this.settingCount()
                    this.settingFirstPage(true)
                }, 300
            ),
        },
        computed: {
            myUid() {
                if (this.userInfo.uid) {
                    return this.userInfo.uid
                }
                return localStorage.getItem("uid") ? localStorage.getItem("uid") : 'anyone';
            },
            standardTabCount() {
                return 5
            },
            filterTabLists() {
                var me = this
                if (me.isLogin) {
                    me.tabLists[1].show = true
                } else {
                    me.tabLists[1].show = false
                }
                return me.tabLists
            },
            searchCount() {
                var me = this
                var cnt = 0
                if (me.filteredEvery)
                    cnt = cnt + me.filteredEvery.length
                if (me.filteredMine)
                    cnt = cnt + me.filteredMine.length

                return cnt
            },
            showMoreButton() {
                var me = this
                if (me.search) {
                    return false
                }
                if (me.filterTabLists && me.tabListIndex && me.tabListIndex < me.standardTabCount) {
                    if (me.filterTabLists[me.tabListIndex].count < 9) {
                        return false
                    } else if (me.filterTabLists[me.tabListIndex].count < me.filterTabLists[me.tabListIndex].totalCount) {
                        return true
                    }
                }
            },
            filteredList() {
                var me = this
                var lists = undefined
                // var findIndex = me.filterTabLists.findIndex(tab)
                if (me.filterTabLists[me.tabListIndex].id == 'every') {
                    lists = this.filteredEvery
                } else if (me.filterTabLists[me.tabListIndex].id == 'mine') {
                    lists = this.filteredMine
                }

                if (lists) {
                    // me.tabLists[me.tabListIndex].count = lists.length
                    if (lists.length == 0)
                        return lists = null;
                }
                return lists
            },
            filteredEvery() {
                var list = undefined
                if (this.every && this.mode != 'all') {
                    list = this.every.filter(project => project.type == this.mode)
                } else if (this.every) {
                    list = this.every
                } else if (this.every == null && typeof this.every == 'object') {
                    list = null
                }
                return list
            },
            filteredMine() {
                var list = undefined
                if (this.mode == 'all') {
                    list = this.mine
                } else if (this.mine) {
                    list = this.mine.filter(project => project.type == this.mode)
                } else if (this.mine == null && typeof this.mine == 'object') {
                    list = null
                }
                return list
            },
        },
        methods: {
            tabClickHandler(obj) {
                var me = this
                me.tabListIndex = obj.key;
                me.settingFirstPage()
            },
            displayCnt(tabId) {
                var me = this
                if (tabId == 'mine' && me.mine) {
                    if (me.mode == 'all') {
                        return me.mine.length
                    } else {
                        return me.mine.filter(project => project.type == me.mode).length
                    }
                } else if (tabId == 'every' && me.every) {
                    if (me.mode == 'all') {
                        return me.every.length
                    } else {
                        return me.every.filter(project => project.type == me.mode).length
                    }
                }
                return 0
            },
            initPage() {
                var me = this
                me.settingCount()
                me.settingFirstPage()
            },
            settingCount() {
                var me = this
                try {
                    me.filterTabLists.forEach(async function (tab, index) {
                        var tabId = tab.id
                        var path = null
                        var getSnapshotStr = null
                        var option = null
                        if (tabId == 'every') {
                            path = `db://userLists/everyone/totalCount`
                        } else if (me.isLogin && tabId == 'mine') {
                            path = `db://userLists/${me.userInfo.uid}/mine`
                        }

                        if (me.mode != 'all') {
                            option = {
                                sort: "desc",
                                orderBy: 'type',
                                size: null,
                                startAt: `${me.mode}`,
                                endAt: `${me.mode}`,
                            }
                        }


                        // if(path && me.mode && me.mode != 'all' && tabId == 'every'){
                        //     getSnapshotStr = await me.list(`${path}_${me.mode}`)
                        // } else
                        if (path) {

                            if(tabId == 'every'){
                                getSnapshotStr = await me.getObject(path)
                            } else {
                                getSnapshotStr = await me.list(path, option)
                            }

                            if(tabId == 'local'){
                                getSnapshotStr = JSON.parse(getSnapshotStr)
                            }


                            if(getSnapshotStr && tabId == 'every'){
                                me.filterTabLists[index].totalCount =  getSnapshotStr
                            }else if(getSnapshotStr) {
                                me.filterTabLists[index].totalCount = Array.isArray(getSnapshotStr) ?  getSnapshotStr.length : Object.keys(getSnapshotStr).length
                            }else{
                                me.filterTabLists[index].count = 0
                                me.filterTabLists[index].totalCount = 0
                            }
                        }else{
                            me.filterTabLists[index].count = 0
                            me.filterTabLists[index].totalCount = 0
                        }

                    })
                } catch (e) {
                    alert(`settingCountError::${e}`)
                }
            },
            async settingFirstPage(init) {
                var me = this
                if (me.tabListIndex < me.standardTabCount) {
                    var tabId = me.filterTabLists[me.tabListIndex].id
                    var path = null
                    var option = null

                    //path
                    if (tabId == 'local') {
                        path = `localstorage://localLists`
                    } else if (tabId == 'every') {
                        if (me.mode && me.mode != 'all') {
                            path = `db://userLists/everyone/share_${me.mode}`
                        } else {
                            path = `db://userLists/everyone/share_first`
                        }
                    } else if (me.isLogin && tabId == 'mine') {
                        path = `db://userLists/${me.userInfo.uid}/mine`
                    }


                    //setting Option
                    if (me.mode != 'all') {
                        // mode option
                        option = {
                            sort: "desc",
                            orderBy: 'type',
                            size: null,
                            startAt: `${me.mode}`,
                            endAt: `${me.mode}`,
                        }
                    } else {
                        //basic
                        if (me.mode != 'all' && tabId != 'every') {
                            // mode: es, k8s  && tabId : 'mine','shared'
                            option = {
                                sort: "desc",
                                orderBy: 'lastModifiedDate',
                                size: null,
                                startAt: null,
                                endAt: null,
                            }
                        } else {
                            // mode: all  && tabId : 'mine','shared'
                            var size = null
                            if (tabId != 'every') {
                                size = 9
                            }
                            option = {
                                sort: "desc",
                                orderBy: 'lastModifiedDate',
                                size: size,
                                startAt: null,
                                endAt: null,
                            }
                        }
                    }

                    // setting list
                    var location = undefined

                    if (tabId == 'every') {
                        location = me.every
                    } else if (me.isLogin && tabId == 'mine') {
                        location = me.mine
                    }

                    if (!location) me.showLoading = true


                    if (init) {
                        me.showLoading = true
                        me.initLists(tabId)
                    }
                    if (path) {
                        var snapshots = await me.list(path, option)

                        if (snapshots) {
                            if (location &&
                                location.length < Object.keys(snapshots).length
                            ) {
                                me.initLists(tabId)
                                location = undefined
                            }

                            if (!location || location
                                && location.length < me.tabLists[me.tabListIndex].count
                            ) {
                                // var reversedArray = me.objectToArray(snapshots)
                                // reversedArray = me.sortArrayByKey(reversedArray,'lastModifiedDate')

                                snapshots.forEach(function (projectObj) {
                                    var project = projectObj
                                    var projectId = projectObj.projectId

                                    if (!project.projectId) project.projectId = projectId
                                    if (!project.authorProfile) project.authorProfile = null
                                    if (!project.type) project.type = 'es'

                                    if (!location) location = []

                                    if (location.findIndex(x => x.projectId == projectId) == -1)
                                        location.push(project)
                                })

                                if (tabId == 'every') {
                                    //if (!me.every)
                                    me.every = []
                                    if (location)
                                        me.every = me.every.concat(location)
                                    if (snapshots.length != 9) {
                                        if (snapshots.length < 9) {
                                            var length = 9 - snapshots.length
                                            me.settingMorePage(length)
                                        } else if (snapshots.length > 9) {
                                            var overCnt = snapshots.length - 9
                                            for (var i = 0; i < overCnt; i++) {
                                                me.delete(`db://userLists/everyone/share_first/${me.every[9].projectId}`)
                                                me.every.splice(9, 1)
                                            }
                                        }
                                    }
                                    // console.log(me.every)
                                    me.tabLists[me.tabListIndex].count = me.every.length
                                } else if (me.isLogin && tabId == 'mine') {
                                    if (!me.mine) me.mine = []
                                    if (location)
                                        me.mine = me.mine.concat(location);
                                    // console.log(me.mine)
                                    me.tabLists[me.tabListIndex].count = me.mine.length
                                }
                            }

                        } else {
                            me.noItemLists(tabId)
                        }
                    } else {
                        me.noItemLists(tabId)
                    }
                }
                me.showLoading = false
            },
            async settingMorePage(length) {
                var me = this
                if (me.tabListIndex && me.tabListIndex < me.standardTabCount) {
                    var tabId = me.filterTabLists[me.tabListIndex].id
                    var path = null
                    // me.showLoading = true 로딩표시 ui 수정 ... public 의 경우 전체가 로딩되는듯한 ,,
                    me.showLoadingForMorePage = true

                    if (tabId == 'local') {
                        path = `localstorage://localLists`
                    } else if (tabId == 'every') {
                        path = `db://userLists/everyone/share`
                    } else if (me.isLogin && tabId == 'mine') {
                        path = `db://userLists/${me.userInfo.uid}/mine`
                    }

                    if (path) {
                        if (tabId == 'local') {
                            me.showLoadingForMorePage = false
                        } else {
                            var lastModelIndex = -1
                            var lastModel = null
                            if (tabId == 'every') {
                                lastModelIndex = me.every.length - 1
                                lastModel = me.every[lastModelIndex]
                            } else if (me.isLogin && tabId == 'mine') {
                                
                                lastModelIndex = me.mine.length - 1
                                lastModel = me.mine[lastModelIndex]
                            }

                        }
                        if (length) {
                            var size = length + 1
                        } else {
                            var size = 10
                        }

                        if (lastModel) {
                            var option = {
                                sort: 'desc',
                                orderBy: 'lastModifiedDate',
                                size: size,
                                startAt: null,
                                endAt: lastModel.lastModifiedDate,
                            }
                            if (me.mode && me.mode != 'all' && me.tabListIndex == 'every') {
                                var snapshots = await me.list(`${path}_${me.mode}`, option)
                            } else {
                                var snapshots = await me.list(path, option)
                            }

                            if (snapshots) {
                                var moreProject = {}

                                snapshots.forEach(function (projectObj, index) {
                                    if (index != 0) {
                                        var project = projectObj
                                        var projectId = projectObj.projectId

                                        if (!project.projectId) project.projectId = projectId
                                        if (!project.authorProfile) project.authorProfile = null
                                        if (!project.type) project.type = 'es'

                                        if (tabId == 'every') {
                                            if (!me.every) me.every = []
                                            me.every.push(project)
                                            me.filterTabLists[me.tabListIndex].count = me.every.length
                                            if (length) {
                                                moreProject[projectId] = project
                                            }
                                        } else if (me.isLogin && tabId == 'mine') {
                                            if (!me.mine) me.mine = []
                                            me.mine.push(project)
                                            me.filterTabLists[me.tabListIndex].count = me.mine.length
                                        }
                                    }

                                    // if (Object.keys(snapshots).length == index + 1) {
                                    //     me.showLoadingForMorePage = false
                                    // }
                                })
                                // if (tabId == 'every') {
                                //     if (length) {
                                //         // console.log(moreProject)
                                //         // me.putObject('db://userLists/everyone/share_first', moreProject)
                                //     }
                                // }
                            } else {
                                me.showLoadingForMorePage = false
                            }
                        }
                    }
                }
            },
            noItemLists(tabId) {
                var me = this
                if (tabId == 'every') {
                    me.every = null
                } else if (tabId == 'mine') {
                    me.mine = null
                }
            },
            initLists(tabId) {
                var me = this
                if (tabId == 'every') {
                    me.every = undefined
                } else if (tabId == 'mine') {
                    me.mine = undefined
                }
            },
        },

    }
</script>

<style scoped>
</style>
