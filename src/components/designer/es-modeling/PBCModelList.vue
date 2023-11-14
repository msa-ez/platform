<template>
    <div>
        <slot name="body">
            <div>
                <v-tabs
                        v-model="tabId"
                        background-color="transparent"
                        color="blue darken-1"
                        show-arrows
                        centered
                >
                    <div v-for="(tabObj,index) in filterTabLists" style="align-self: center;">
                        <v-tab
                                v-if="tabObj.show"
                                :disabled="showLoading && index != selectedTabIndex"
                                :href="`#${tabObj.id}`"
                                :key="tabObj.key"
                                style="height:45px;"
                        >
                            {{tabObj.display}}
                            <v-avatar v-if="index > 0 && tabObj.totalCount!=null" color="green lighten-5" size="30"
                                      style="margin-left: 5px;margin-bottom: 15px; font-size:10px;">
                                {{tabObj.totalCount == null ? '...': (tabObj.totalCount == 0 ? '0' : tabObj.totalCount)}}
                            </v-avatar>
                        </v-tab>
                    </div>
                    <v-row style="width:100%; height:57px;" dense>

                        <v-icon @click="searchOpen = !searchOpen" style="width:26px; height:26px; margin-top:16px; margin-left:15px;">mdi-magnify</v-icon>
                    </v-row>
                </v-tabs>

                <v-alert
                        v-if="searchOpen"
                        elevation="2"
                        style="position:fixed; top:0px; z-index:2; height:70px; width:40%; left: 50%; transform: translate(-50%, 0%);"
                >
                    <div>
                        <v-row>
                            <v-text-field
                                    v-model="searchObj.name"
                                    outlined
                                    class="gs-main-search"
                                    :label="searchObj.name ? filterListsCount : 'Search for name'"
                                    autofocus
                                    hide-details
                                    dense
                            ></v-text-field>
                            <v-icon @click="searchClose(true)" style="width:26px; height:26px; margin-top: 13px;">mdi-close</v-icon>
                        </v-row>
                        <v-row>
                            <v-btn @click="searchClose()" block text style="height: 25px"> <v-icon>mdi-chevron-up</v-icon> </v-btn>
                        </v-row>
                    </div>
                </v-alert>

                <v-tabs-items v-model="selectedTabIndex">
                    <v-tab-item v-if="selectedTabIndex == -1" :value="selectedTabIndex">
                        <!-- SEARCH -->
                        <v-row style="margin-top:0px;">
                            <v-col v-if="showLoading || (filteredList == undefined && typeof filteredList == 'undefined')"
                                   style="height: 100%;">
                                <v-row>
                                    <v-col
                                            v-for="idx in 9"
                                            cols="6"
                                            md="4"
                                    >
                                        <v-card
                                                outlined
                                                class="mx-auto"
                                                style="width: 500px; height: 400px; justify-content: center"
                                                align="center"
                                        >
                                            <v-skeleton-loader
                                                    ref="skeleton"
                                                    type="card"
                                                    class="mx-auto"
                                            >
                                            </v-skeleton-loader>
                                        </v-card>
                                    </v-col>
                                </v-row>
                            </v-col>
                            <v-col v-else-if="filteredList == null && typeof filteredList == 'object' "
                                   style="height: 590px;">
                                No Items
                            </v-col>
                            <v-col
                                    v-else
                                    v-for="(project,index) in filteredList"
                                    :key="project.projectId"
                                    xl="4"
                                    lg="4"
                                    md="6"
                                    sm="12"
                            >
                                <EventStormingListCard
                                        :information="project"
                                        @delete="deleteProjectItem"
                                >
                                    <template slot="chips">
                                        <slot name="chips"></slot>
                                    </template>
                                    <template slot="action" slot-scope="project">
                                        <slot name="action" :project="project"></slot>
                                    </template>
                                </EventStormingListCard>
                            </v-col>
                        </v-row>
                    </v-tab-item>

                    <v-tab-item v-if="selectedTabIndex < standardTabCount" :value="selectedTabIndex" :key="selectedTabIndex">
                        <v-row style="margin-top:0px;">
                            <v-col v-if="(showLoading && filteredList && filteredList.length < 10) || filteredList == undefined && typeof filteredList == 'undefined'">
                                <v-row>
                                    <v-col
                                            v-for="idx in 9"
                                            cols="6"
                                            md="4"
                                    >
                                        <v-card
                                                outlined
                                                class="mx-auto"
                                                style="width: 500px; height: 400px; justify-content: center"
                                                align="center"
                                        >
                                            <v-skeleton-loader
                                                    ref="skeleton"
                                                    type="card"
                                                    class="mx-auto"
                                            >
                                            </v-skeleton-loader>
                                        </v-card>
                                    </v-col>
                                </v-row>
                            </v-col>
                            <v-col v-else-if="filteredList == null && typeof filteredList == 'object'">
                                No Items
                            </v-col>
                            <v-col
                                    v-else
                                    v-for="(project,index) in filteredList"
                                    :key="project.projectId"
                                    xl="4"
                                    lg="4"
                                    md="6"
                                    sm="12"
                            >
                                <PBCModelCard
                                        :information.sync="project"
                                        @selected-model="selectedModel"
                                ></PBCModelCard>
                            </v-col>
                        </v-row>
                    </v-tab-item>
                </v-tabs-items>
                <div style="text-align-last: center;">
                    <div block text style="padding:10px 0 10px 0;">마지막 페이지 [최대 27개 표시(최근 수정날짜 기준)]</div>
                </div>
            </div>
        </slot>
    </div>
</template>

<script>
    import PBCModelCard from "./PBCModelCard";
    import AlgoliaModelLists from "../../listPages/AlgoliaModelLists";

    var _ = require('lodash');

    export default {
        name: 'PBC-model-list',
        mixins: [AlgoliaModelLists],
        components: {
            PBCModelCard,
        },
        data() {
            return {
                tabId: 'public',
                searchOpen: true,
                tabLists: [
                    { id: 'mine'  , display: 'Mine'  , show: false, count: 0, totalCount: null },
                    { id: 'public', display: 'Public', show: true , count: 0, totalCount: null },
                ],
            }
        },
        async created() {},
        mounted() {
            var me = this
            $(window).scroll(function () {
                // console.log(Math.ceil($(window).scrollTop()))
                if (Math.ceil($(window).scrollTop()) >= (($(document).height() - $(window).height()))) {
                    if (!me.showLoading && me.showMoreButton) {
                        if (!me.showLoadingForMorePage) {
                            me.settingMorePage()
                        }
                    }
                }
            });
        },
        watch: {

        },
        computed: {
            filteredList() {
                var me = this
                var lists = undefined
                // var findIndex = me.filterTabLists.findIndex(tab)
                if (me.filterTabLists[me.selectedTabIndex].id == 'public') {
                    lists = this.filteredPublic
                } else if (me.filterTabLists[me.selectedTabIndex].id == 'mine') {
                    lists = this.filteredMine
                }
                if (lists) {
                    return lists
                }
                return [];
            },
            filteredPublic() {
                var me = this
                if(me.public){
                    return me.public.filter(x=> x.versions || x.lastVersionName)
                }
                return []
            },
            filteredMine() {
                var me = this
                if(me.mine){
                    return me.mine.filter(x=> x.versions || x.lastVersionName)
                }
                return []
            },
            showMoreButton() {
                var me = this
                if (me.search) {
                    return false
                }
                if ( me.filterTabLists[me.selectedTabIndex] && ( me.selectedTabIndex < me.standardTabCount) ) {
                    if (me.filterTabLists[me.selectedTabIndex].totalCount < 9 || me.filterTabLists[me.selectedTabIndex].count == me.filterTabLists[me.selectedTabIndex].totalCount ) {
                        return false
                    } else if (me.filterTabLists[me.selectedTabIndex].count < me.filterTabLists[me.selectedTabIndex].totalCount) {
                        return true
                    }
                }
            },
            selectedTabIndex(){
                var me = this
                return me.filterTabLists.findIndex(item => item.id == me.tabId)
            },
            filterTabLists() {
                var me = this
                if (me.isLogin) {
                    // me.tabId = 'mine'
                    me.tabLists.filter(function(tabItem){
                        if(tabItem.id == 'mine'){
                            tabItem.show = true
                            tabItem.count = me.filteredMine ? me.filteredMine.length : 0
                        }else if(tabItem.id == 'public'){
                            tabItem.show = true
                            tabItem.count = me.filteredPublic ? me.filteredPublic.length : 0
                        }else {
                            tabItem.show = false
                        }
                    });
                } else {
                    // me.tabId = 'public'
                    me.tabLists.filter(function(tabItem){
                        if( tabItem.id == 'public' ){
                            tabItem.show = true
                            tabItem.count = me.filteredPublic ? me.filteredPublic.length : 0
                        }else{
                            tabItem.show = false
                        }
                    });
                }
                return me.tabLists
            },
        },
        methods: {
            selectedModel(obj){
                this.$emit('selected-model',obj)
            },
            async settingLists(lists, execute){
                var me = this

                for(let info of lists){
                    if( !(info.lastVersionName || (info.versions && Object.keys(info.versions).length > 0)) ){
                        try {
                            info.versions = null
                            let result = await me.getObject(`db://definitions/${info.objectID}/versionLists`);
                            if( execute && !result.Error ){
                                await me.migrateVersions(info.objectID, result);
                            }
                            if(!result.Error){
                                info.versions = result
                            }
                        } catch (e) {
                            info.versions = null;
                        }
                    }
                }

                return lists;
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
            async settingSearchPage() {
                var me = this
                try {
                    me.showLoading = true

                    for(let obj of me.filterTabLists) {
                        if (obj.id != 'home') {
                            let result = null
                            if (obj.id == 'mine' && obj.show) {
                                let filters = `authorId:${me.userInfo.uid}`;
                                filters = me.searchOpen && me.searchObj.type != 'all' ? filters.concat(` AND type:${me.searchObj.type}`) : filters

                                result = await me.onLoadServerModel({
                                    filters: filters,
                                    alternativesAsExact: ['multiWordsSynonym'],
                                    hitsPerPage: 9,
                                });
                                let setLists = await me.settingLists(result.lists, true);
                                me.mine = setLists;

                            }  else if (obj.id == 'public' && obj.show) {
                                let filters = `permissions:everyone`;
                                filters = me.searchOpen && me.searchObj.type != 'all' ? filters.concat(` AND type:${me.searchObj.type}`) : filters

                                result = await me.onLoadServerModel({
                                    filters: filters,
                                    alternativesAsExact: ['multiWordsSynonym'],
                                    hitsPerPage: 9,
                                });
                                let setLists = await me.settingLists(result.lists);
                                me.public = setLists;

                            }
                            obj.count = result ? result.count : 0
                            obj.totalCount = result ? result.totalCount : 0
                        }
                    }

                } catch (e) {
                    alert(e.message)
                }finally {
                    me.showLoading = false
                }

            },
            async settingFirstPage(init) {
                var me = this
                try{
                    if (me.selectedTabIndex < me.standardTabCount) {
                        let tabId = me.filterTabLists[me.selectedTabIndex].id;


                        if (init) {
                            me.showLoading = true
                            me.initLists(tabId)
                        }

                        for(let obj of me.filterTabLists){
                            if(obj.id != 'home'){
                                let result = null
                                if(obj.id == 'mine'&& obj.show){
                                    let filters = `authorId:${me.userInfo.uid}`;
                                    filters = me.searchOpen && me.searchObj.type != 'all' ? filters.concat(` AND type:${me.searchObj.type}`) : filters

                                    result = await me.onLoadServerModel({
                                        filters: filters,
                                        hitsPerPage: 27
                                    });
                                    let setLists = await me.settingLists(result.lists, true);
                                    me.mine = setLists
                                }  else  if(obj.id == 'public' && obj.show){
                                    let filters = `permissions:everyone`;
                                    filters = me.searchOpen && me.searchObj.type != 'all' ? filters.concat(` AND type:${me.searchObj.type}`) : filters

                                    result = await me.onLoadServerModel({
                                        filters: filters,
                                        hitsPerPage: 27
                                    });
                                    let setLists = await me.settingLists(result.lists);
                                    me.public = setLists
                                }
                                obj.count = result ? result.count : 0
                                obj.totalCount = result ? result.totalCount : 0
                            }
                        }
                    }
                }catch (e) {

                }finally {
                    me.showLoading = false
                }
            },
        }

    }
</script>

<style scoped>
    .ytp-chrome-top-buttons {
        display: none;
    }

    .ytp-title {
        display: none;
    }

    .ytp-title-channel {
        display: none;
    }

    .title-page-card-box {
        height: 260px;
        padding: 0;
        margin-bottom: 30px;
        height: 105%;
    }

    .title-card-actions-btn {
        position: absolute;
        right: 0;
        bottom: 0;
    }

    .title-page-title {
        margin: 10px 0 20px 0;
        font-size: 20px;
        font-weight: 500;
        text-align: center;
        color: #1E88E5;
    }

    .home-card-title {
        text-align: left;
        display: block;
        line-height: 10px;
        font-size: 15px;
    }

    .introduction-img {
        height: 170px;
        cursor: pointer;
    }

    .text-reader input[type="file"] { /* 파일 필드 숨기기 */
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        border: 0;
    }

    .text-reader:hover {
        background-color: #E0ECF8;
        color: #1565C0;
    }

    .v-pagination__navigation {
        box-shadow: none !important;
    }

    .v-pagination__item {
        box-shadow: 0 0 black;
        color: #8e44ad;
    }

    .x-pagination a, .x-pagination span {
        -webkit-box-shadow: none !important;
        -moz-box-shadow: none !important;
        box-shadow: none !important;
        border: 1px solid #eaeaea;
    }

    .tiblock {
        align-items: center;
        display: flex;
        height: 17px;
    }

    .ticontainer .tidot {
        background-color: rgb(215, 215, 215)
    }

    .tidot {
        -webkit-animation: mercuryTypingAnimation 1.5s infinite ease-in-out;
        display: inline-block;
        border-radius: 10px;
        height: 12px;
        width: 12px;
        margin-right: 15px;
    }

    @-webkit-keyframes mercuryTypingAnimation {
        0% {
            -webkit-transform: translateY(0px)
        }
        28% {
            -webkit-transform: translateY(-5px)
        }
        44% {
            -webkit-transform: translateY(0px)
        }
    }

    .tidot:nth-child(1) {
        -webkit-animation-delay: 200ms;
    }

    .tidot:nth-child(2) {
        -webkit-animation-delay: 300ms;
    }

    .tidot:nth-child(3) {
        -webkit-animation-delay: 400ms;
    }

    .title-page-card-box-row {
        margin-bottom:60px;
    }

    @media only screen and (max-width: 1110px) {
        .main-tap-list {
            max-width:50% !important;
        }

    }

    @media only screen and (max-width: 850px) {
        #textsize {
            font-size: 11px;
        }

        #mode_btn {
            margin-left: -10px;
        }

    }

</style>
