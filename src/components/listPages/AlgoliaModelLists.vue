<template>
    <div>
        <v-container style="max-width: 1500px;">
            <slot name="body">
                <div>
                    <div :class="isForeign ? 'isForeign-main-nav-tabs-box' : 'main-nav-tabs-box' ">
                        <v-tabs class="main-nav-tabs" background-color="transparent" show-arrows color="none">
                            <v-tab to="/"
                                class="main-nav-tab main-nav-tab-home"
                            >
                                <v-icon style="margin-top:10px;">mdi-home</v-icon>
                            </v-tab>
                            <v-tab @click="wikiOpen('introduction')"
                                class="main-nav-tab"
                            >{{$t('mainNav.introduction')}}
                            </v-tab>
                            <v-tab @click="wikiOpen('company')"
                                class="main-nav-tab"
                            >{{$t('mainNav.company')}}
                            </v-tab>
                            <v-tab @click="wikiOpen('pricing')"
                                class="main-nav-tab"
                            >{{$t('mainNav.pricing')}}
                            </v-tab>
                            <v-tab @click="wikiOpen('partnership')"
                                class="main-nav-tab"
                            >{{$t('mainNav.partnership')}}
                            </v-tab>
                            <v-tab @click="nationLearnNavDialog"
                                class="main-nav-tab"
                            >{{$t('mainNav.learn')}}
                            </v-tab>
                            <!-- <v-tab @click="openMakingDialog()"
                                class="main-nav-tab main-nav-tab-display"
                            >{{$t('making.title')}}
                            </v-tab> -->
                            <v-icon @click="searchOpen = !searchOpen"
                                class="main-nav-tab"
                                style="margin-left:10px;"
                            >mdi-magnify
                            </v-icon>
                        </v-tabs>
                    </div>
                    <v-hover v-slot="{ hover }">
                        <v-list-group class="nav-storage-list"
                            :value="hover"
                            :append-icon="null"
                            :class="isForeign ? 'isForeign-nav-storage-list' : 'isForeign-not-nav-storage-list'"
                        >
                            <template v-slot:activator>
                                <v-list-item-title style="margin:5px 0px 0px 10px; font-weight: 700;">
                                    <div style="display: flex;">
                                        <Icon icon="material-symbols:home-storage" width="26" height="26" style="margin-right:5px;" />
                                        <div class="cp-storage" :class="isForeign ? 'isForeign-storage-main-list-text' : 'isNotForeign-storage-main-list-text'">{{$t('mainNav.Storage')}}</div>
                                    </div>
                                </v-list-item-title>
                            </template>
                            <v-card
                                class="mx-auto pt-2 pb-2"
                                max-width="300"
                            >
                                <v-list-item
                                    v-for="(tabObj, tabIndex) in filterTabLists"
                                    v-if="tabObj.id !== 'home' && tabObj.show"
                                    :key="tabObj.id"
                                    link
                                    @click="tabId = tabObj.id"
                                >
                                    <v-list-item-title style="margin-top:2px;">{{ tabObj.display }}</v-list-item-title>
                                    <v-avatar v-if="tabIndex > 0 && tabObj.totalCount != null" color="green lighten-5" size="30"
                                            style="font-size:10px;">
                                        {{ tabObj.totalCount == null ? '...' : (tabObj.totalCount == 0 ? '0' : tabObj.totalCount) }}
                                    </v-avatar>
                                </v-list-item>
                            </v-card>
                        </v-list-group>
                    </v-hover>

                    

                    <v-dialog v-model="learnNavDialog"
                        max-width="90%"
                    >
                        <v-card style="padding:10px; height:85vh; overflow:auto;">
                            <div style="font-size:24px; font-weight: 700; text-align: center; margin:5px 0px;">{{$t('mainNav.learn')}}</div>
                            <v-row
                                style="margin:0px;"
                            >
                                <!-- 튜토리얼, 모델링 예제 -->
                                <v-col v-for="(item,index) in navSubCards"
                                    :key="index"
                                    lg="4"
                                    md="4"
                                    sm="6"
                                    xs="12"
                                >
                                    <v-card style="height:100%;"
                                        outlined
                                        @click="wikiOpen('business')"
                                    >
                                        <v-card-title class="justify-center">{{ $t(item.title) }}</v-card-title>
                                        <v-img 
                                            :src="item.image"
                                            style="cursor: pointer; height:200px;"
                                        >
                                        </v-img>
                                        <v-card-subtitle style="margin-bottom:20px;">{{ $t(item.subtitle) }}</v-card-subtitle>
                                    </v-card>
                                    <!-- 튜토리얼 다이얼로그-->
                                    <!-- <v-dialog v-model="item.dialog"
                                        v-if="item.dialogType === 'tutorial'"
                                    >
                                        <v-card style="padding:10px; height:85vh; overflow:auto;">
                                            <div style="font-size:24px; font-weight: 700; text-align: center; margin:5px 0px;">{{$t('mainNavSubCard.tutorial')}}</div>
                                            <v-row class="title-page-card-box-row">
                                                <v-col
                                                    v-for="(card, index) in navLearnTutorialCards"
                                                    :key="index"
                                                    lg="2"
                                                    md="3"
                                                    sm="4"
                                                    xs="12"
                                                >
                                                    <v-card @click="moveToPages(card.page)"
                                                        class="mx-auto"
                                                        outlined
                                                        style="padding:15px; height:100%;"
                                                    >
                                                        <v-chip
                                                            :color="card.color"
                                                            style="width: auto; height: 20px; font-size: 12px; margin-bottom:5px; font-weight:bold; z-index: 200;"
                                                            small
                                                            outlined
                                                        >{{$t(card.chip)}}
                                                        </v-chip>
                                                        <div style="font-weight: 500; font-size:18px; color:black;">
                                                            {{$t(card.title)}}
                                                        </div>
                                                        <v-row>
                                                            <v-col cols="12">
                                                                <v-img :src="card.imageUrl"></v-img>
                                                            </v-col>
                                                        </v-row>
                                                        <div style="font-size:14px; margin-top:10px; color:#757575;">{{$t(card.subtitle)}}</div>
                                                    </v-card>
                                                </v-col>
                                            </v-row>
                                        </v-card>
                                    </v-dialog> -->
                                    <!-- 모델링 예제 다이얼로그 -->
                                    <!-- <v-dialog v-model="item.dialog"
                                        v-if="item.dialogType === 'examples'"
                                    >
                                        <v-card style="padding:10px; height:85vh; overflow:auto;">
                                            <div style="font-size:24px; font-weight: 700; text-align: center; margin:5px 0px;">{{$t('mainNavSubCard.examples')}}</div>
                                            <v-row class="title-page-card-box-row">
                                                <v-col
                                                    v-for="(card, index) in navLearnExamplesCards"
                                                    :key="index"
                                                    lg="2"
                                                    md="3"
                                                    sm="4"
                                                    xs="12"
                                                >
                                                    <v-card @click="moveToPages(card.page)"
                                                        class="mx-auto"
                                                        outlined
                                                        style="padding:15px; height:100%;"
                                                    >
                                                    <div style="font-weight: 500; font-size:18px; color:black;">
                                                        {{$t(card.title)}}
                                                    </div>
                                                    <v-row>
                                                        <v-col cols="12">
                                                            <v-img
                                                                :src="card.imageUrl"
                                                                style="height:110px; margin:10px 0px; cursor:pointer;"
                                                            ></v-img>
                                                        </v-col>
                                                    </v-row>
                                                    </v-card>
                                                </v-col>
                                            </v-row>
                                        </v-card>
                                    </v-dialog> -->
                                </v-col>
                                <!-- 아카데미 -->
                                <v-col
                                    lg="4"
                                    md="4"
                                    sm="6"
                                    xs="12"
                                >
                                    <v-card style="height:100%;"
                                        outlined
                                        @click="navigateTo('/courses')"
                                    >
                                        <v-card-title class="justify-center">{{ $t('mainNavSubCard.Academy') }}</v-card-title>
                                        <v-img 
                                            src="/static/image/main/mainSubLectures.png"
                                            style="cursor: pointer; height:200px;"
                                        >
                                        </v-img>
                                        <v-card-subtitle style="margin-bottom:20px;">{{  }}</v-card-subtitle>
                                    </v-card>
                                </v-col>
                                <!-- 교육신청 -->
                                <v-col
                                    lg="4"
                                    md="4"
                                    sm="6"
                                    xs="12"
                                >
                                    <v-card style="height:100%;"
                                        outlined
                                        @click="navigateTo('https://www.msaschool.io/operation/introduction/curriculum/')"
                                    >
                                        <v-card-title class="justify-center">{{ $t('mainNavSubCard.training') }}</v-card-title>
                                        <v-img 
                                            src="/static/image/main/mainSubTraining.png"
                                            style="cursor: pointer; height:200px;"
                                        >
                                        </v-img>
                                        <v-card-subtitle style="margin-bottom:20px;">{{  }}</v-card-subtitle>
                                    </v-card>
                                </v-col>
                            </v-row>
                        </v-card>
                    </v-dialog>

                    <v-alert
                            v-if="searchOpen"
                            elevation="2"
                            style="position:fixed; top:50px; z-index:2; width:40%; left: 50%; transform: translate(-50%, 0%);"
                            class="ma-0 pa-2"
                    >
                        <div>
                            <v-row class="ma-0 pa-0">
                                <v-spacer></v-spacer>
                                <v-icon @click="searchClose(true)" :size="16">mdi-close</v-icon>
                            </v-row>
                            <v-row class="ma-0 pa-0" style="align-items: baseline;">
                                <v-menu offset-y>
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-chip
                                            :color="selectedMode.color"
                                            outlined
                                            style="margin-right: 10px;"
                                            v-bind="attrs"
                                            v-on="on"
                                        >
                                            {{selectedMode.display}}
                                        </v-chip>
                                    </template>
                                    <v-list>
                                        <v-list-item
                                                v-for="(item, index) in listMode"
                                                :key="index"
                                                @click="selectMode(item)"
                                        >
                                            <v-list-item-title>{{ item.display }}</v-list-item-title>
                                        </v-list-item>
                                    </v-list>
                                </v-menu>
                                <v-text-field
                                        v-model="searchObj.name"
                                        outlined
                                        class="gs-main-search"
                                        :label="searchObj.name ? filterListsCount : 'Search for name'"
                                        autofocus
                                        hide-details
                                        dense
                                ></v-text-field>
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
                                            @openAutoModelingDialog=openAutoModelingDialog
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

                        <v-tab-item v-else-if="selectedTabIndex == 0" :value="selectedTabIndex">
                            <!-- HOME -->
                            <div class="gs-main-page-top-box">
                                <transition name="fade" mode="out-in">
                                    <div v-for="item in mainTexts" :key="item.id" v-if="currentTextId === item.id">
                                        <v-row justify="start" align="center">
                                            <v-col cols="2"></v-col>
                                            <v-col cols="6" class="gs-main-page-text-box">
                                                <div style="display: flex; justify-content: flex-start;">
                                                    <div style="text-align: left; padding-right:10px;">
                                                        <div class="gs-main-page-top-title" style="white-space: pre-wrap;">{{$t(item.title)}}</div>
                                                        <div class="gs-main-page-sub-title">
                                                            <div v-for="content in item.content" :key="content">{{$t(content)}}<br></div>
                                                        </div>
                                                        <a :href="isForeign ? item.goToUrlEn : item.goToUrl" target="_blank" style="text-decoration: none; color: inherit;">
                                                            <v-btn color="primary"
                                                            text
                                                            style="margin-top:5px;
                                                            font-size:18px;
                                                            font-weight:700;
                                                            padding: 0px;"
                                                            >{{$t('main.goToUrlText')}}</v-btn>
                                                        </a>
                                                    </div>
                                                </div>
                                            </v-col>
                                            <v-col cols="4" class="gs-main-page-img-box">
                                                <v-img :src="item.imageUrl"/>
                                            </v-col>
                                            <v-col cols="2"></v-col>
                                        </v-row>
                                    </div>
                                </transition>
                            </div>
                            <div class="gs-main-page-top-box-mobile">
                                <transition name="fade" mode="out-in">
                                    <div v-for="item in mainTexts" :key="item.id" v-if="currentTextId === item.id">
                                        <v-row>
                                            <v-col cols="3.5"></v-col>
                                            <v-col cols="5" class="gs-main-page-img-box-mobile">
                                                <v-img :src="item.imageUrl"/>
                                            </v-col>
                                            <v-col cols="3.5"></v-col>
                                        </v-row>
                                        <div style="text-align: center;">
                                            <div class="gs-main-page-top-title-mobile" style="white-space: pre-wrap;">{{$t(item.title)}}</div>
                                            <div class="gs-main-page-sub-title-mobile">
                                                <div v-for="content in item.content" :key="content">{{$t(content)}}<br></div>
                                            </div>
                                            <a :href="item.goToUrl" target="_blank" style="text-decoration: none; color: inherit;">
                                                <v-btn color="primary" style="margin-top:10px;">{{$t('main.goToUrlText')}}</v-btn>
                                            </a>
                                        </div>
                                    </div>
                                </transition>
                            </div>
                            <AutoModelingDialog
                                mode="es"
                                :showDialog="false"
                                :showChat="true"
                            ></AutoModelingDialog>
                        <div style="margin-top:30px;">
                            <carousel :perPageCustom="[[0, 1], [576, 2], [768, 3], [992, 4], [1200, 5]]">
                                <slide v-for="(logo, index) in logos" :key="index">
                                    <img :src="logo.url" :alt="logo.alt">
                                </slide>
                            </carousel>
                        </div>
                        </v-tab-item>
                        <v-tab-item v-else-if="0 < selectedTabIndex && selectedTabIndex < 4" :value="selectedTabIndex" :key="selectedTabIndex">
                            <!-- MINE, SHARE,PUBLIC -->
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
                                            @openAutoModelingDialog=openAutoModelingDialog
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
                        <v-tab-item v-else-if="selectedTabIndex == 4" :value="selectedTabIndex">
                            <!-- LOCAL -->
                            <v-row style="margin-top:0px;">
                                <v-col v-if="(showLoading && filteredList && filteredList.length < 10) || filteredList == undefined && typeof filteredList == 'undefined'"
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
                                            @openAutoModelingDialog=openAutoModelingDialog
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
                    </v-tabs-items>
                    <div style="text-align-last: center;" v-if="selectedTabIndex != 0 ">
                        <div v-if="showLoadingForMorePage" class="ticontainer" style="margin-left: 50%; margin-top: 30px;">
                            <div class="tiblock">
                                <div class="tidot"></div>
                                <div class="tidot"></div>
                                <div class="tidot"></div>
                            </div>
                        </div>
                        <div v-if="!showLoading && !showMoreButton" block text style="padding:10px 0 10px 0;">마지막 페이지</div>
                        <v-row v-else-if="showLoading && showMoreButton">
                            <v-col
                                    v-for="idx in 9"
                                    cols="6"
                                    md="4"
                            >
                                <v-card
                                        outlined
                                        class="mx-auto"
                                        style="width: 500px; height: 400px; justify-content: center;"
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
                    </div>
                </div>
            </slot>
        </v-container>

        <v-dialog v-model="deleteDialog" v-if="deleteItem" persistent max-width="470">
            <v-card>
                <v-card-title class="headline">{{$t('word.deleteNotification')}}</v-card-title>
                <v-img :src="deleteItem.img"></v-img>
                <v-card-text>AuthorEmail: {{ deleteItem.authorEmail ? deleteItem.authorEmail.split('@')[0] : 'anyone' }}
                </v-card-text>
                <v-card-text>ProjectName: {{deleteItem.projectName ? deleteItem.projectName : 'untitled'}}</v-card-text>
                <v-card-text>date: {{convertTimeStampToDate(deleteItem.createdTimeStamp)}}</v-card-text>
                <v-card-text>LastModifiedDate: {{convertTimeStampToDate(deleteItem.lastModifiedTimeStamp)}}</v-card-text>
                <v-card-text>## 알림 ## "공유"된 파일의 경우 공동작업자가 사본을 생성할 수 있습니다.</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text @click="closeDeleteDialog()">{{$t('word.close')}}</v-btn>
                    <v-btn color="red darken-1" text @click="deleteProject()">{{$t('word.delete')}}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- 메인페이지 슬라이드 -->
        <!-- <div v-if="selectedTabIndex == 0" class="d-flex flex-row mt-sm-8 mt-5 overflow-hidden main-page-slider-group-box">
            <div class="main-page-slider-group">
                <img src="/static/image/main/mainSlide.png" />
            </div>
            <div class="main-page-slider-group">
                <img src="/static/image/main/mainSlide.png" />
            </div>
            <div class="main-page-slider-group">
                <img src="/static/image/main/mainSlide.png" />
            </div>
            <div class="main-page-slider-group">
                <img src="/static/image/main/mainSlide.png" />
            </div>
            <div class="main-page-slider-group">
                <img src="/static/image/main/mainSlide.png" />
            </div>
        </div> -->
        
        <v-footer
            padless
            style="background-color: transparent;"
        >
            <ProvisionIndication style="margin:0; padding:0px; width:100%;"></ProvisionIndication>
        </v-footer>
    </div>
</template>

<script>
    import CommonStorageBase from "../CommonStorageBase";
    import {YoutubeIcon} from 'vue-feather-icons'
    import 'instantsearch.css/themes/satellite-min.css';
    import AutoModelingDialog from '../designer/modeling/AutoModelingDialog.vue';
    import { Carousel, Slide } from 'vue-carousel';
    import ProvisionIndication from '../../components/payment/ProvisionIndication.vue'
    // import VueCookies from "vue-cookies";
    var _ = require('lodash');

    export default {
        name: 'algolia-model-lists',
        mixins: [CommonStorageBase],
        components: {
            'EventStormingListCard': () => import('./EventStormingListCard'),
            // 'ProvisionIndication': () => import('../payment/ProvisionIndication'),
            YoutubeIcon,
            AutoModelingDialog,
            Carousel,
            Slide,
            ProvisionIndication
        },
        data() {
            return {
                navLectureTab: null,
                wikiOpenUrl: [
                    {
                        type: 'introduction',
                        ko: 'https://intro-kor.msaez.io/started/',
                        en: 'https://intro.msaez.io/started/'
                    },
                    {
                        type: 'company',
                        ko: 'https://intro-kor.msaez.io/info/company/',
                        en: 'https://intro.msaez.io/info/company/'
                    },
                    {
                        type: 'pricing',
                        ko: 'https://intro-kor.msaez.io/info/pricing',
                        en: 'https://intro.msaez.io/info/pricing'
                    },
                    {
                        type: 'partnership',
                        ko: 'https://intro-kor.msaez.io/info/partnership',
                        en: 'https://intro.msaez.io/info/partnership'
                    },
                    {
                        type: 'business',
                        ko: 'https://intro-kor.msaez.io/business/',
                        en: 'https://intro.msaez.io/business/'
                    },
                ],
                navSubCards: [
                    {
                        title: 'mainNavSubCard.tutorial',
                        image: '/static/image/main/mainSubTutorial.png',
                        subtitle: 'mainNavSubCard.tutorial-inst',
                        dialogType: 'tutorial',
                        dialog: false,
                    },
                    // {
                    //     title: 'mainNavSubCard.examples',
                    //     image: '/static/image/main/mainSubExamples.png',
                    //     subtitle: 'mainNavSubCard.examples-inst',
                    //     dialogType: 'examples',
                    //     dialog: false,
                    // },
                ],
                navLearnTutorialCards: [
                    {
                        color: "red",
                        title: 'tutorials.ddd',
                        subtitle: 'tutorials.ddd-inst',
                        imageUrl: 'https://user-images.githubusercontent.com/113568664/211271741-4e4cdd7a-37af-4445-902c-a3229c392e6e.png',
                        page: 'ggd',
                        chip: 'word.biz'
                    },
                    {
                        color: "green",
                        title: 'tutorials.unit',
                        subtitle: 'tutorials.unit-inst',
                        imageUrl: 'https://user-images.githubusercontent.com/113568664/211271746-a3f5fce0-ad12-4cf3-88cb-a6348d990044.png',
                        page: 'run-mu',
                        chip: 'word.dev'
                    },
                    {
                        color: "green",
                        title: 'tutorials.reqres',
                        subtitle: 'tutorials.reqres-inst',
                        imageUrl: 'https://user-images.githubusercontent.com/113568664/211271766-11c1234e-8ee9-4ef5-9c4a-36df00530766.png',
                        page: 'req-res',
                        chip: 'word.dev'
                    },
                    {
                        color: "green",
                        title: 'tutorials.cb',
                        subtitle: 'tutorials.cb-inst',
                        imageUrl: 'https://user-images.githubusercontent.com/113568664/211271764-07de1f1c-96de-49fe-99ea-d12c658a8644.png',
                        page: 'cb',
                        chip: 'word.dev'
                    },
                    {
                        color: "green",
                        title: 'tutorials.pubsub',
                        subtitle: 'tutorials.pubsub-inst',
                        imageUrl: 'https://user-images.githubusercontent.com/113568664/211271759-4bb531e0-e8ad-4964-a8f7-65ceae30c79c.png',
                        page: 'pub-sub',
                        chip: 'word.dev'
                    },
                    {
                        color: "green",
                        title: 'tutorials.comcor',
                        subtitle: 'tutorials.comcor-inst',
                        imageUrl: 'https://user-images.githubusercontent.com/113568664/211271747-7c7d01e4-30c6-4b44-804c-be834713d8fa.png',
                        page: 'com-cor',
                        chip: 'word.dev'
                    },
                    {
                        color: "green",
                        title: 'tutorials.jwt',
                        subtitle: 'tutorials.jwt-inst',
                        imageUrl: 'https://user-images.githubusercontent.com/113568664/211271754-e0c813d9-9f85-4af5-8770-4ddce2383d90.png',
                        page: 'jwt-auth',
                        chip: 'word.dev'
                    },
                    {
                        color: "green",
                        title: 'tutorials.hateoas',
                        subtitle: 'tutorials.hateoas-inst',
                        imageUrl: 'https://user-images.githubusercontent.com/113568664/211271752-19bcfa58-61f0-47ca-9e42-b3e017eda354.png',
                        page: 'dp-fh',
                        chip: 'word.dev'
                    },
                    {
                        color: "green",
                        title: 'tutorials.graphql',
                        subtitle: 'tutorials.graphql-inst',
                        imageUrl: 'https://user-images.githubusercontent.com/113568664/211271748-f3662a80-cb9b-4190-96e9-33a5b244b1f5.png',
                        page: 'dp-gql',
                        chip: 'word.dev'
                    },
                    {
                        color: "green",
                        title: 'tutorials.axon',
                        subtitle: 'tutorials.axon-inst',
                        imageUrl: 'https://user-images.githubusercontent.com/113568664/225213375-c0dcc8cc-c696-48f0-be8d-b0330f6b9ee5.png',
                        page: 'axon',
                        chip: 'word.dev'
                    }
                ],
                navLearnExamplesCards: [
                    {
                        imageUrl: 'https://user-images.githubusercontent.com/92732781/163898754-62dc9532-5505-41b0-852b-6070ac817eff.png',
                        title: 'examples.pet',
                        page: '/storming/e25a97f84aa34376697cc220496a9608'
                    },
                    {
                        imageUrl: 'https://user-images.githubusercontent.com/92732781/163902964-56a0dc31-b069-4bd0-8b15-9d52a1dc84eb.png',
                        title: 'examples.food',
                        page: '/storming/2737b4f61c1ea85e3de602479ddc1e3a'
                    },
                    {
                        imageUrl: 'https://user-images.githubusercontent.com/92732781/163904161-c15eba6a-be32-4ee5-9541-f258ef72f7a4.png',
                        title: 'examples.shop',
                        page: '/storming/0f89dcccd80e9ec9fb6540c3236cfe2b'
                    },
                    {
                        imageUrl: 'https://user-images.githubusercontent.com/92732781/163903262-60260260-dae9-47f9-bf88-1bdc6fe7de88.png',
                        title: 'examples.k8s',
                        page: '/storming/e8f1d14ea6a9a714f79f73aa4fff0601'
                    },
                    {
                        imageUrl: 'https://user-images.githubusercontent.com/92732781/163904696-8f9202b3-2301-4ca4-bae6-f90f9a07d64e.png',
                        title: 'examples.google',
                        page: '/storming/d8525abb1acc3cf621b6aacf371fa4be'
                    },
                    {
                        imageUrl: 'https://user-images.githubusercontent.com/113568664/224649981-78c46486-4ef0-46e6-b861-2f1a662c4c91.png',
                        title: 'examples.axon',
                        page: '/storming/human-resource-mgmt-0303:v0.0.1'
                    }
                ],
                mainNav: [
                    {   
                        title: '제품 소개',
                        icon: 'mdi-information',
                        dialog: false,
                        dialogType: 'introduction',
                    },
                    {
                        title: 'mainNav.partnership',
                        icon: 'mdi-handshake',
                        dialogType: 'partnership',
                        dialog: false,
                    },
                    {
                        title: 'mainNav.learn',
                        icon: 'mdi-school',
                        dialogType: 'learn',
                        dialog: false,
                    }
                ],

                learnNavDialog: false,
                projectUid: "",
                showDialog: false,
                showMainText1: true,
                showMainText2: false,
                showMainText3: false,
                showMainIndex: 0,
                fab: false,
                labURLNumber: 4,
                showLoadingForMorePage: false,
                //tabs
                tabId: 'home',
                setFirstTime: true,
                activeProject: false,
                projects: [
                    { id: 'home'  , display: 'Home'  , show: true, },
                    { id: 'mine'  , display: 'Mine'  , show: false, count: 0, totalCount: null, },
                    { id: 'public', display: 'Public', show: false , count: 0, totalCount: null, },
                    { id: 'share' , display: 'Shared', show: false, count: 0, totalCount: null, },
                    { id: 'local' , display: 'Local' , show: true , count: 0, totalCount: null, },
                ],
                mainTexts: [
                    {
                        id: 1,
                        title: 'main.title',
                        content: ['main.content1', 'main.content2', 'main.content3'],
                        imageUrl: '/static/image/main/main1.png',
                        goToUrl: 'https://intro-kor.msaez.io/tool/google-drive-examples/',
                        goToUrlEn: 'https://intro.msaez.io/tool/google-drive-examples/'
                    },
                    {
                        id: 2,
                        title: 'main.title2',
                        content: ['main.content4', 'main.content5'],
                        imageUrl: '/static/image/main/main2.png',
                        goToUrl: 'https://intro-kor.msaez.io/tool/chat-gpt/',
                        goToUrlEn: 'https://intro.msaez.io/tool/chat-gpt/'
                    },
                    {
                        id: 3,
                        title: 'main.title3',
                        content: ['main.content6', 'main.content7', 'main.content8'],
                        imageUrl: '/static/image/main/main3.png',
                        goToUrl: 'https://intro-kor.msaez.io/tool/si-gpt/',
                        goToUrlEn: 'https://intro.msaez.io/tool/si-gpt/'
                    }
                ],
                currentTextId: 1,
                //list
                public: undefined,
                mine: undefined,
                share: undefined,
                local: undefined,
                //search
                searchOpen: false,
                searchObj:{
                    name: '',
                    type: 'all'
                },
                mouseOverOpenList: false,
                listMode: [
                    {type: 'es', display: 'EventStorming', color: 'green'},
                    {type: 'k8s', display: 'Kubernetes', color: '#3498db'},
                    {type: 'bm', display: 'Business model canvas', color: '#bdc3c7'},
                    {type: 'uml', display: 'UML', color: '#45AAF2'},
                    {type: 'bpmn', display: 'BPMN', color: '#34495e'},
                    {type: 'sticky', display: 'STICKY NOTE', color: 'purple'},
                    {type: 'all', display: 'All', color: 'primary'},
                ],
                //delete
                deleteItem: null,
                deleteDialog: false,

                //loading
                showLoading: false,
                showInitVideos: {
                    show: null,
                    id: ['aC3LgJZ6XIU', 'L-y2aju--v0', 'iZhq2pT8UPc', '7_n8KHi7eWc', '4J8mViMo8lE']
                },
                currentVideoIndex: 0,
                checkbox: false,
                firstVideo: false,
                secondVideo: false,
                thirdVideo: false,
                forthVideo: false,
                fifthVideo: false,
                renderTabId: 0,
            }
        },
        beforeDestroy() {
            console.log('Ev beforeDestroy')
        },
        async created() {
            this.labURL = window.location.href.split('/');
            this.showLoading = true;
            this.$EventBus.$emit('showNewButton', true);
            // this.tabId = localStorage.getItem('tabId') ? localStorage.getItem('tabId') : 'home'
            if(window.MODE == 'bpm') {
                this.projects= [
                        { id: 'home'  , display: 'Home'  , show: true },
                        { id: 'mine'  , display: 'Mine'  , show: true, count: 0, totalCount: null },
                        { id: 'public', display: 'Public', show: true , count: 0, totalCount: null },
                    ]
            }
                
            // if(this.isOnPrem){
            //     this.labURLNumber = 3
            // }
            await this.setUserInfo();
            this.initPage();


            this.$EventBus.$emit('progressValue', false);
        },
        mounted() {
            var me = this

            me.showMainIndex = 1
            setInterval(me.toggleMainTexts, 10000);
            $(window).scroll(function () {
                if (Math.ceil($(window).scrollTop()) >= (($(document).height() - $(window).height()))) {
                    if (!me.showLoading && me.showMoreButton && !me.searchObj.name) {
                        if (!me.showLoadingForMorePage) {
                            me.settingMorePage()
                        }
                    }
                }
            });

            me.$EventBus.$on('searchItem', function (value, type, isModeling) {
                if (isModeling) {
                    me.showLoading = true
                    me.searchObj.name = value
                    me.searchObj.type = type ? type : 'all'
                }
            });
            me.$EventBus.$on('showNewButton', function (newVal) {
                me.showNewButton = newVal
            });

            // Vue.use(VueCookies);
            // Vue.$cookies.config("7d");
            var cookies = me.$cookies.get("unactivateYoutube");
            if (cookies == "true") {
                me.showInitVideos.show = false
                me.checkbox = true
            } else {
                me.showInitVideos.show = true
                me.checkbox = false
            }
        },
        watch: {
            '$route'() {
                var me = this
                if(me.$route.name === 'EventStormingListPages' && me.$route.hash === "") {
                    me.tabId = 'home';
                }
                console.log(me.$route)
            },
            "searchObj":{
                deep: true,
                handler:_.debounce(
                    function () {
                        var me = this
                        if (me.searchOpen) {
                            me.settingSearchPage()
                        } else {
                            me.settingFirstPage(true)
                        }

                    }, 300
                ),
            },

            // "search":
            //     _.debounce(
            //         function () {
            //             var me = this
            //             if (me.search) {
            //                 me.settingSearchPage()
            //             } else {
            //                 me.settingFirstPage(true)
            //             }
            //
            //         }, 300
            //     ),
        },
        computed: {
            selectedMode(){
                return this.listMode.find(x=>x.type == this.searchObj.type);
            },
            isOnPrem() {
                if(window.MODE == 'onprem' || window.MODE == "bpm")
                    return true
                else
                    return false
            },
            myUid() {
                if (this.userInfo.uid) {
                    return this.userInfo.uid
                }
                return localStorage.getItem("uid") ? localStorage.getItem("uid") : 'anyone';
            },
            standardTabCount() {
                return 5
            },
            selectedTabIndex(){
                var me = this
                if(me.searchOpen){
                    return -1;
                }
                if(me.setFirstTime || me.tabId == '/courses'){
                    me.tabId = me.labURL[me.labURLNumber].match(/[#]?([A-Za-z0-9\s]+)/i) ? me.labURL[me.labURLNumber].match(/[#]?([A-Za-z0-9\s]+)/i)[1]: 'home';
                    me.setFirstTime = false 
                } 
                // me.tabId = me.tabId == '/courses' ? localStorage.getItem('tabId') : me.tabId

                var tabType = me.tabId == 'home' ? '': `#${me.tabId.toLowerCase()}`
                                if (me.labURL && me.labURL[me.labURLNumber]) {
                    me.labURL[me.labURLNumber] = tabType
                    window.location.href = me.labURL.join('/')
                } else {
                    window.location.href = window.location.href + tabType
                    me.labURL = window.location.href.split('/')
                }
                return me.filterTabLists.findIndex(item => item.id == me.tabId)
            },
            filterTabLists() {
                var me = this
                if (me.isLogin) {
                    me.projects.filter(function(tabItem){
                        tabItem.show = true
                    });
                } else {
                    me.projects.filter(function(tabItem){
                        if(tabItem.id == 'mine' || tabItem.id == 'share'){
                            tabItem.show = false
                        }else {
                            tabItem.show = true
                        }
                    });
                }
                return me.projects
            },
            searchCount() {
                var me = this
                var cnt = 0
                if (me.filteredPublic)
                    cnt = cnt + me.filteredPublic.length
                if (me.filteredMine)
                    cnt = cnt + me.filteredMine.length
                if (me.filteredShared)
                    cnt = cnt + me.filteredShared.length
                if (me.filteredLocal)
                    cnt = cnt + me.filteredLocal.length

                return cnt
            },
            showMoreButton() {
                var me = this
                if (me.searchObj.name) {
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
            filteredList() {
                var me = this
                var lists = undefined
                if(me.searchOpen){
                    lists = []
                    lists = lists.concat(me.filteredPublic ? me.filteredPublic: []);
                    lists = lists.concat(me.filteredMine ? me.filteredMine: []);
                    lists = lists.concat(me.filteredLocal ? me.filteredLocal: []);
                    lists = lists.concat(me.filteredShared? me.filteredShared: []);
                } else {
                    // var findIndex = me.filterTabLists.findIndex(tab)
                    if (me.filterTabLists[me.selectedTabIndex].id == 'public') {
                        // console.log( this.filteredPublic)
                        lists = this.filteredPublic
                    } else if (me.filterTabLists[me.selectedTabIndex].id == 'mine') {
                        lists = this.filteredMine
                    } else if (me.filterTabLists[me.selectedTabIndex].id == 'share') {
                        lists = this.filteredShared
                    } else if (me.filterTabLists[me.selectedTabIndex].id == 'local') {
                        lists = this.filteredLocal
                    }
                }
                lists = lists ? lists.map(item => ({ ...item, isDeletedProject: false })) : lists;

                me.renderTabId++;

                if( !lists ) {
                    return lists;
                }

                if( lists.length == 0 ){
                    return lists = null;
                }

                return lists.sort(function (a, b) {
                    let aTime = a.lastModifiedTimeStamp ? a.lastModifiedTimeStamp : a.lastModifiedDate
                    let bTime = b.lastModifiedTimeStamp ? b.lastModifiedTimeStamp : b.lastModifiedDate
                    return bTime - aTime;
                });
            },
            filteredPublic() {
                var list = undefined
                if (this.public) {
                    list = this.public
                } else {
                    list = null
                }
                return list
            },
            filteredMine() {
                var list = undefined
                if (this.mine) {
                    list = this.mine
                } else {
                    list = null
                }
                return list
            },
            filteredShared() {
                var list = undefined
                if (this.share) {
                    list = this.share
                } else {
                    list = null
                }
                return list

            },
            filteredLocal() {
                var list = undefined
                if (this.local) {
                    list = this.local
                    return list.sort(function (a, b) {
                        let aTime = a.lastModifiedTimeStamp ? a.lastModifiedTimeStamp : a.lastModifiedDate
                        let bTime = b.lastModifiedTimeStamp ? b.lastModifiedTimeStamp : b.lastModifiedDate
                        return bTime - aTime;
                    });
                }else {
                    list = null
                }
                return list

            },
            filterListsCount() {
                var me = this

                if (me.showLoading) {
                    return '검색중..'
                } else {
                    return `검색 결과 : 총 ${me.searchCount} 건 찾았습니다.`
                }

            },
        },
        methods: {
            nationLearnNavDialog() {
                if (!this.isForeign) {
                    this.learnNavDialog = true;
                } else {
                    this.wikiOpen('business');
                }
            },
            openMakingDialog() {
                var me = this
                me.$EventBus.$emit('open-new-making-dialog');
            },
            wikiOpen(linkType) {
                const link = this.wikiOpenUrl.find(item => item.type === linkType);
                if (link) {
                    const url = this.isForeign ? link.en : link.ko;
                    window.open(url, "_blank");
                }
            },
            toggleDialog(item) {
                item.dialog = !item.dialog;
            },
            navigateTo(path) {
                try {
                    if (path.startsWith('http://') || path.startsWith('https://')) {
                        window.open(path, '_blank');
                    } else {
                        this.$router.push(path);
                    }
                } catch (error) {
                    console.error('Navigation error:', error);
                }
            },
            closeDialog(){
                this.showDialog = false
            },
            openAutoModelingDialog(projectId){
                this.showDialog = true
                this.projectUid = projectId
            },
            toggleMainTexts() {
                this.currentTextId++;
                if (this.currentTextId > this.mainTexts.length) {
                    this.currentTextId = 1;
                }
            },
            selectMode(item){
                this.searchObj.type = item.type
            }, 
            searchClose(close) {
                var me = this
                if(close) me.searchObj.name = '';
                if(close) me.searchObj.type = 'all';
                me.searchOpen = false
                me.mouseOverOpenList = false
            },
            moveToPages(type) {
                var me = this
                try {
                    let path = `storming/${me.dbuid()}`;
                    if (!type) type = 'es'

                    if (type == 'es') {
                        path = `storming/${me.dbuid()}`
                        // me.$router.push({path: `storming/${me.dbuid()}`});
                    } else if (type == 'k8s') {
                        path = `kubernetes/${me.dbuid()}`
                        // me.$router.push({path: `kubernetes/${me.dbuid()}`});
                    } else if (type == 'bm') {
                        path = `business-model-canvas/${me.dbuid()}`
                        // me.$router.push({path: `business-model-canvas/${me.dbuid()}`});
                    } else if (type == 'bpmn') {
                        path = `bpmn/${me.dbuid()}`
                        // me.$router.push({path: `bpmn/${me.dbuid()}`});
                    } else if (type == 'axonex') {
                        path = `/storming/human-resource-mgmt-0303:v0.0.1`
                        // me.$router.push({path: `/storming/human-resource-mgmt-0303:v0.0.1`});
                    } else if (type == 'petshop') {
                        path = `/storming/e25a97f84aa34376697cc220496a9608`
                        // me.$router.push({path: `/storming/e25a97f84aa34376697cc220496a9608`});
                    } else if (type == 'food-delivery') {
                        path = `/storming/2737b4f61c1ea85e3de602479ddc1e3a`
                        // me.$router.push({path: `/storming/2737b4f61c1ea85e3de602479ddc1e3a`});
                    } else if (type == 'shop') {
                        path = `/storming/0f89dcccd80e9ec9fb6540c3236cfe2b`
                        // me.$router.push({path: `/storming/0f89dcccd80e9ec9fb6540c3236cfe2b`});
                    } else if (type == 'k8s-blueprint') {
                        path = `/kubernetes/e8f1d14ea6a9a714f79f73aa4fff0601`
                        // me.$router.push({path: `/kubernetes/e8f1d14ea6a9a714f79f73aa4fff0601`});
                    } else if (type == 'google-drive') {
                        path = `/storming/d8525abb1acc3cf621b6aacf371fa4be`
                        // me.$router.push({path: `/storming/d8525abb1acc3cf621b6aacf371fa4be`});
                    } else if (type == 'cna-full-course') {
                        path = `/courses/cna-full/full-course-cna`
                        // me.$router.push({path: `/courses/cna-full/full-course-cna`});
                    } else if (type == 'object-oriented') {
                        path = `/courses/objectOrientedBasics/objectOrientedBasics`
                        // me.$router.push({path: `/courses/objectOrientedBasics/objectOrientedBasics`});
                    } else if (type == 'bpm-with-uEngine5') {
                        path = `/courses/bpm/bpm`
                        // me.$router.push({path: `/courses/bpm/bpm`});
                    } else if (type == 'axon') {
                        path = `/courses/cna-full-english/cna-full-english/axon-template`
                        // me.$router.push({path: `/courses/cna-full-english/cna-full-english/axon-template`});
                    } else if (type == 'ggd') {
                        path = me.isForeign ?
                            `/courses/cna-full-english/cna-full-english/en-ddd-google-drive`:
                            `/courses/fea33dd0-8030-11ed-9757-3db21672e322/1f2deec0-c856-11ed-aa53-950d34db487f/ddd-google-drive-associate`
                        // me.$router.push({path: `/courses/cna-full-english/cna-full-english/en-ddd-google-drive`});
                    } else if (type == 'run-mu') {
                        path = me.isForeign ?
                            `/courses/cna-full-english/cna-full-english/en-cna-start-2022`:
                            `/courses/fea33dd0-8030-11ed-9757-3db21672e322/1f2deec0-c856-11ed-aa53-950d34db487f/cna-start-2022-associate`
                        // me.$router.push({path: `/courses/cna-full-english/cna-full-english/en-cna-start-2022`});
                    } else if (type == 'req-res') {
                        path = me.isForeign ?
                            `/courses/cna-full-english/cna-full-english/en-monolith-2-misvc-2022`:
                            `/courses/fea33dd0-8030-11ed-9757-3db21672e322/1f2deec0-c856-11ed-aa53-950d34db487f/monolith-2-misvc-2022-associate`
                        // me.$router.push({path: `/courses/cna-full-english/cna-full-english/en-monolith-2-misvc-2022`});
                    } else if (type == 'pub-sub') {
                        path = me.isForeign ?
                            `/courses/cna-full-english/cna-full-english/en-pub-sub-2022`:
                            `/courses/fea33dd0-8030-11ed-9757-3db21672e322/1f2deec0-c856-11ed-aa53-950d34db487f/pub-sub-2022-assocaiate`
                        // me.$router.push({path: `/courses/cna-full-english/cna-full-english/en-pub-sub-2022`});
                    } else if (type == 'com-cor') {
                        path = me.isForeign ?
                            `/courses/cna-full-english/cna-full-english/en-compensation-correlation-2022`:
                            `/courses/fea33dd0-8030-11ed-9757-3db21672e322/1f2deec0-c856-11ed-aa53-950d34db487f/compensation-correlation-2022-associate`
                        // me.$router.push({path: `/courses/cna-full-english/cna-full-english/en-compensation-correlation-2022`});
                    } else if (type == 'dp-gql') {
                        path = me.isForeign ?
                            `/courses/cna-full-english/cna-full-english/en-dp-graphql-2022`:
                            `/courses/fea33dd0-8030-11ed-9757-3db21672e322/1f2deec0-c856-11ed-aa53-950d34db487f/dp-graphql-2022-associate`
                        // me.$router.push({path: `/courses/cna-full-english/cna-full-english/en-dp-graphql-2022`});
                    } else if (type == 'cb') {
                        path = me.isForeign ?
                            `/courses/cna-full-english/cna-full-english/en-circuit-breaker-2022`:
                            `/courses/fea33dd0-8030-11ed-9757-3db21672e322/1f2deec0-c856-11ed-aa53-950d34db487f/circuit-breaker-2022-associate`
                        // me.$router.push({path: `/courses/cna-full-english/cna-full-english/en-circuit-breaker-2022`});
                    } else if (type == 'jwt-auth') {
                        path = me.isForeign ?
                            `/courses/cna-full-english/cna-full-english/en-Oauth2withKeycloak`:
                            `/courses/fea33dd0-8030-11ed-9757-3db21672e322/1f2deec0-c856-11ed-aa53-950d34db487f/Oauth2withKeycloak-associate`
                        // me.$router.push({path: `/courses/cna-full-english/cna-full-english/en-Oauth2withKeycloak`});
                    } else if (type == 'dp-fh') {
                        path = me.isForeign ?
                            `/courses/cna-full-english/cna-full-english/en-dp-frontend-2022`:
                            `/courses/fea33dd0-8030-11ed-9757-3db21672e322/1f2deec0-c856-11ed-aa53-950d34db487f/dp-frontend-2022-associate`
                        // me.$router.push({path: `courses/cna-full-english/cna-full-english/en-dp-frontend-2022`});
                    }
                    if(window.MODE != "bpm")
                        me.$router.push({path: path});
                } catch (e) {
                    alert('Error-NewProject', e)
                }

            },
            showVideo(i) {
                var me = this;
                if (i == 1) {
                    me.firstVideo = !me.firstVideo;
                } else if (i == 2) {
                    me.secondVideo = !me.secondVideo;
                } else if (i == 3) {
                    me.thirdVideo = !me.thirdVideo;
                } else if (i == 4) {
                    me.forthVideo = !me.forthVideo;
                } else if (i == 5) {
                    me.fifthVideo = !me.fifthVideo;
                }
            },
            unactivateYoutube() {
                var me = this
                // Vue.use(VueCookies);
                // Vue.$cookies.config("7d");

                // me.selectedIndex = 0;

                if (me.checkbox) {
                    me.showInitVideos.show = false;
                    me.$cookies.set("unactivateYoutube", "true");
                } else {
                    me.$cookies.set("unactivateYoutube", "false");
                }

            },
            goVideo: function (type) {
                if (type == 'es') {
                    if (this.isForeign) {
                        window.open(" https://www.youtube.com/watch?v=G46GbI8aa3o&list=PLEr96Fo5umW9w_5SmjXhOar1xRRWcZsbB&index=1", "_blank");
                    } else {
                        window.open("https://www.youtube.com/watch?v=BqKfq3ASU1g&list=PLEr96Fo5umW99TW0kmXQHzL3XEztDXPjI", "_blank");
                    }
                } else if (type == 'k8s') {
                    window.open("https://www.youtube.com/watch?v=vtPtymnmo6M&list=PLEr96Fo5umW8oIZrO0bLVUWaqPOuB3msk&index=1", "_blank");
                } else if (type == 'bpmn') {
                    window.open("https://www.youtube.com/watch?v=9RtGeyvZrJo&t=4s", "_blank");
                }

            },
            goTutorials: function (type) {
                if (type == 'es') {
                    if (this.isForeign) {
                        window.open("https://intro.msaez.io/tool/event-storming-tool/", "_blank");
                    } else {
                        window.open("https://intro-kor.msaez.io/tool/event-storming-tool/", "_blank");
                    }
                } else if (type == 'k8s') {
                    if (this.isForeign) {
                        window.open("https://intro.msaez.io/tool/infrastructure-modeling/", "_blank");
                    } else {
                        window.open("https://intro-kor.msaez.io/tool/infrastructure-modeling/", "_blank");
                    }
                } else if (type == 'bpmn') {
                    window.open("https://bpm-intro.uengine.io/getting-started/", "_blank");
                }

            },
            displayCnt(tabId) {
                var me = this
                if (tabId == 'local' && me.local) {
                    if (me.searchObj.type == 'all') {
                        return me.local.length
                    } else {
                        return me.local.filter(project => project.type == me.searchObj.type).length
                    }

                } else if (tabId == 'mine' && me.mine) {
                    if (me.searchObj.type == 'all') {
                        return me.mine.length
                    } else {
                        return me.mine.filter(project => project.type == me.searchObj.type).length
                    }
                } else if (tabId == 'share' && me.share) {
                    if (me.searchObj.type == 'all') {
                        return me.share.length
                    } else {
                        return me.share.filter(project => project.type == me.searchObj.type).length
                    }
                } else if (tabId == 'public' && me.public) {
                    if (me.searchObj.type == 'all') {
                        return me.public.length
                    } else {
                        return me.public.filter(project => project.type == me.searchObj.type).length
                    }
                }
                return 0
            },
            initPage() {
                var me = this
                me.settingFirstPage();
            },
            async onLoadLocalModel(){
                var me = this
                try {
                    let result = await me.list(`localstorage://localLists`);
                    result = result ? JSON.parse(result) : null;
                    let cnt = result ? result.length : 0

                    return {lists : result, count: cnt, totalCount: cnt }
                }catch(e){
                    console.log(`Error] Load LocalModel: ${e}`)
                }
            },

            async onLoadServerModel(options){
                var me = this;
                try{
                    let search = me.searchObj.name ? me.searchObj.name :''
                    let result = await me.$searchIndex.search(search, options)
                    let lists = result ? result.hits : null;
                    let cnt = lists ? lists.length : 0

                    return {lists : lists, count: cnt, totalCount: result.nbHits }
                }catch (e) {
                    console.log(`Error] Load ServerModel: ${e}`)
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

                        for(let obj of me.filterTabLists) {
                            if(obj.id != 'home') {
                                let result = null
                                if(obj.id == 'local' && obj.show){
                                    result = await me.onLoadLocalModel();
                                    if(me.searchObj.name){
                                        result.lists = result.lists.filter(item => item.projectName && item.projectName.includes(me.searchObj.name));
                                    }

                                    if(me.searchObj.type != 'all'){
                                        result.lists = result.lists.filter(item => item.type == me.searchObj.type);
                                    }
                                    me.validation(result.lists, 'local')
                                    me.local = result.lists.filter(item => item.type)
                                } else if(obj.id == 'mine'&& obj.show){
                                    if(window.MODE == 'bpm' || window.MODE == 'onprem') {
                                        let data = await this.list(`db://userLists/${me.userInfo.uid}/mine`)
                                        result = await this.setListByAcebase(data)
                                        await Promise.all([result])
                                        result.lists.map(x =>x.versions = null);
                                        let newArr = result.lists.filter((element, i) => element != null);
                                        result.count = newArr.length
                                        result.totalCount = newArr.length
                                        result.lists = newArr
                                    } else {
                                        result = await me.onLoadServerModel({
                                            filters: `authorId:${me.userInfo.uid}`,
                                            tagFilters: '-associatedProject', // - is Negation
                                            hitsPerPage: 9,
                                        });
                                        result.lists.map(x =>x.versions = null);
                                    }
                                    me.mine = result.lists.filter(item => item.type)
                                } else if(obj.id == 'share' && obj.show){
                                    if(window.MODE == 'bpm' || window.MODE == 'onprem') {
                                        let data = await this.getObject(`db://userLists/${me.userInfo.uid}/share`)
                                        result = await this.setListByAcebase(data)
                                        await Promise.all([result])
                                        result.lists.map((x,idx) =>{
                                            x.versions = null
                                            if(!x.projectId) {
                                                result.lists[idx] = null
                                            }
                                        });
                                        let newArr = result.lists.filter((element, i) => element != null);
                                        result.count = newArr.length
                                        result.totalCount = newArr.length
                                        result.lists = newArr
                                    } else {
                                        result = await me.onLoadServerModel({
                                            filters: `permissions:${me.userInfo.uid}`,
                                            tagFilters: '-associatedProject', // - is Negation
                                            hitsPerPage: 9,
                                        });
                                    }
                                    
                                    me.share = result.lists.filter(item => item.type)
                                } else if(obj.id == 'public' && obj.show){
                                    if(window.MODE == 'bpm' || window.MODE == 'onprem') {
                                        // let result = {}
                                        let data = await this.getObject("db://definitions")
                                        result = await this.setListByAcebase(data)
                                        await Promise.all([result])
                                        result.lists.map((x,idx) =>{
                                            x.versions = null
                                            if(!x.projectId) {
                                                result.lists[idx] = null
                                            }
                                        });
                                        let newArr = result.lists.filter((element, i) => element != null);
                                        result.count = newArr.length
                                        result.totalCount = newArr.length
                                        result.lists = newArr
                                    } else {
                                        result = await me.onLoadServerModel({
                                            filters: `permissions:everyone`,
                                            tagFilters: '-associatedProject', // - is Negation
                                            hitsPerPage: 9,
                                        });
                                        result.lists.map(x =>x.versions = null);
                                    }
                                    me.public = result.lists.filter(item => item.type)
                                }
                                // console.log(result)
                                obj.count = result ? result.count : 0
                                obj.totalCount = result ? result.totalCount : 0
                            }
                        }
                    }
                }catch (e) {
                    console.log(e)
                }finally {
                    me.showLoading = false
                }
            },
            validation(lists, key){
                if(key == 'local'){
                    if(!lists) return;
                    if(lists.filter(item => !item.type).length == 0) return;


                    let locals = localStorage.getItem('localLists')
                    if(!locals) return;
                    locals = JSON.parse(locals)
                    
                    lists.filter(item => !item.type).forEach(item => {
                        let index = locals.findIndex(local=> JSON.stringify(local) === JSON.stringify(item))
                        if(index != -1){
                            locals.splice(index, 1)
                        }
                    })
                    localStorage.setItem('localLists', JSON.stringify(locals))
                } else if(key = 'mine'){

                }
            },
            setListByAcebase(data) {
                return new Promise(function (resolve, reject) {
                    try {
                        let result = {}
                        result.lists = []
                        if(data != null && Object.keys(data).length != 0) {
                            const keys = Object.keys(data);
                            keys.forEach(function (key, idx) {
                                if(data[key].information)
                                    result.lists.push(data[key].information)
                                else 
                                result.lists.push(data[key])
                                if(keys.length-1 == idx) {
                                    resolve(result)
                                }
                            })
                        } else {
                            console.log("return? - null")
                            result.count = 0
                            result.totalCount = 0
                            resolve(result)
                        }
                    } catch (e) {
                        console.log(e)
                        reject()
                    }
                })
            },
            async settingSearchPage() {
                var me = this
                try {
                    me.showLoading = true

                    for(let obj of me.filterTabLists) {
                        if (obj.id != 'home') {
                            let result = null
                            if (obj.id == 'local' && obj.show) {
                                result = await me.onLoadLocalModel();

                                if(me.searchObj.name){
                                    result.lists = result.lists.filter(item => item.projectName && item.projectName.includes(me.searchObj.name));
                                }

                                if(me.searchObj.type != 'all'){
                                    result.lists = result.lists.filter(item => item.type == me.searchObj.type);
                                }

                                me.local = result.lists
                            } else if (obj.id == 'mine' && obj.show) {
                                let filters = `authorId:${me.userInfo.uid}`;
                                filters = me.searchOpen && me.searchObj.type != 'all' ? filters.concat(` AND type:${me.searchObj.type}`) : filters

                                result = await me.onLoadServerModel({
                                    filters: filters,
                                    tagFilters: '-associatedProject', // - is Negation
                                    alternativesAsExact: ['multiWordsSynonym'],
                                    hitsPerPage: 9,
                                });
                                me.mine = result.lists
                            } else if (obj.id == 'share' && obj.show) {
                                let filters = `permissions:${me.userInfo.uid}`;
                                filters = me.searchOpen && me.searchObj.type != 'all' ? filters.concat(` AND type:${me.searchObj.type}`) : filters

                                result = await me.onLoadServerModel({
                                    filters: filters,
                                    tagFilters: '-associatedProject', // - is Negation
                                    alternativesAsExact: ['multiWordsSynonym'],
                                    hitsPerPage: 9,
                                });
                                me.share = result.lists
                            } else if (obj.id == 'public' && obj.show) {
                                let filters = `permissions:everyone`;
                                filters = me.searchOpen && me.searchObj.type != 'all' ? filters.concat(` AND type:${me.searchObj.type}`) : filters

                                result = await me.onLoadServerModel({
                                    filters: filters,
                                    tagFilters: '-associatedProject', // - is Negation
                                    alternativesAsExact: ['multiWordsSynonym'],
                                    hitsPerPage: 9,
                                });
                                me.public = result.lists
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
            async settingMorePage() {

                var me = this
                if (me.selectedTabIndex < me.standardTabCount) {
                    me.showLoadingForMorePage = true
                    let tabId = me.filterTabLists[me.selectedTabIndex].id;
                    let current = me.filterTabLists[me.selectedTabIndex].count
                    let show = me.filterTabLists[me.selectedTabIndex].show
                    let result = null;

                    if(tabId == 'mine' && show){
                        let filters = `authorId:${me.userInfo.uid}`;

                        let mineOptions = {
                            filters: filters,
                            tagFilters: '-associatedProject', // - is Negation
                            hitsPerPage: current + 9,
                        }
                        if(me.searchObj.name){
                            mineOptions['alternativesAsExact'] = ['multiWordsSynonym']
                        }
                        result = await me.onLoadServerModel(mineOptions);
                        me.mine = result ? result.lists : me.mine
                    } else  if(tabId == 'share' && show){
                        let filters = `permissions:${me.userInfo.uid}`;

                        let shareOptions = {
                            filters: filters,
                            tagFilters: '-associatedProject', // - is Negation
                            hitsPerPage: current + 9,
                        }
                        if(me.searchObj.name){
                            shareOptions['alternativesAsExact'] = ['multiWordsSynonym']
                        }
                        result = await me.onLoadServerModel(shareOptions);
                        me.share =  result ? result.lists : me.share
                    } else  if(tabId == 'public' && show){
                        let filters = `permissions:everyone`;

                        let publicOptions = {
                            filters: filters,
                            tagFilters: '-associatedProject', // - is Negation
                            hitsPerPage: current + 9,
                        }
                        if(me.searchObj.name){
                            publicOptions['alternativesAsExact'] = ['multiWordsSynonym']
                        }
                        result = await me.onLoadServerModel(publicOptions);
                        me.public =  result ? result.lists : me.public
                    }
                    me.filterTabLists[me.selectedTabIndex].count = result ? result.count : me.filterTabLists[me.selectedTabIndex].count
                }
                me.showLoading = false
                me.showLoadingForMorePage = false
            },
            noItemLists(tabId) {
                var me = this
                if (tabId == 'local') {
                    me.local = null
                } else if (tabId == 'public') {
                    me.public = null
                } else if (tabId == 'mine') {
                    me.mine = null
                } else if (tabId == 'share') {
                    me.share = null
                }
            },
            initLists(tabId) {
                var me = this
                if (tabId == 'local') {
                    me.local = undefined
                } else if (tabId == 'public') {
                    me.public = undefined
                } else if (tabId == 'mine') {
                    me.mine = undefined
                } else if (tabId == 'share') {
                    me.share = undefined
                }
            },
            deleteProjectItem(item) {
                var me = this
                me.deleteItem = item
                me.openDeleteDialog()
            },
            async deleteProject() {
                var me = this

                try {
                    if (me.deleteItem) {
                        var isServer = false
                        let projectId = me.deleteItem.projectId ? me.deleteItem.projectId : me.deleteItem.objectID
                        let authorId = me.deleteItem.author ? me.deleteItem.author : me.deleteItem.authorId

                        var modelSnap = await me.list(`db://definitions/${projectId}/information`)
                        if (modelSnap) {
                            isServer = true
                        }
                        if (isServer) {
                            await me.delete(`db://userLists/${authorId}/mine/${projectId}`)
                        }
                        me.deleteItem.isDeletedProject = true

                        me.delete(`localstorage://${projectId}`)
                        me.delete(`localstorage://image_${projectId}`)


                        // let imageObjects = await me.getObject(`localstorage://serverImageLists`);
                        //
                        // delete imageObjects[me.projectId]
                        //
                        // await me.putObject(`localstorage://serverImageLists`, imageObjects);



                        var localLists = await me.getObject(`localstorage://localLists`)
                        var index = localLists.findIndex(info => info.projectId == projectId)
                        if (index != -1)
                            localLists.splice(index, 1)
                        await me.putObject(`localstorage://localLists`, localLists)
                    }
                    me.closeDeleteDialog()
                } catch (e) {
                    alert('Error:', e)
                }
            },
            openDeleteDialog() {
                this.deleteDialog = true
            },
            closeDeleteDialog() {
                this.deleteItem = null
                this.deleteDialog = false
            },
            convertTimeStampToDate(timeStamp) {
                if (typeof timeStamp == 'string')
                    timeStamp = Number(timeStamp)
                var date = new Date(timeStamp);
                return date.getFullYear() + "년 " + (date.getMonth() + 1) + "월 " + date.getDate() + "일 " + date.getHours() + "시 " + date.getMinutes() + "분"
            },
            objectToArray(obj){
                return Object.keys(obj).map(key=> ({ ...obj[key], key }) );
            },
            sortArrayByKey(array, key , asc){
                try{
                    return array.sort(function compare(a, b) {
                        if (a[key] < b[key]) return asc ? -1 : 1;
                        if (a[key] > b[key]) return asc ? 1 : -1;
                        return 0;
                    });
                }catch (e) {
                    return array
                }
            },
            reversedChildren(snapshot) {
                var children = [];
                snapshot.forEach(function (child) {
                    children.unshift(child);
                });
                return children;
            },
            dbuid: function () {
                function s4() {
                    return Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                        .substring(1);
                }

                return s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4();
            },
        },

    }
</script>

<style>
    .isNotForeign-storage-main-list-text {
        margin-top:3px; 
        font-size:14px;
    }
    .isForeign-storage-main-list-text {
        margin-top:5px; 
        font-size:14px;
    }
    .main-nav-tab-home {
        display:none;
    }
    .main-nav-tabs-box {
        margin-top:-78px;
        margin-bottom:10px;
        position:absolute;
        max-width:60%;
        min-width:10%;
        z-index:1;
        left: 46%;
        transform: translate(-50%, 0%);
    }
    .isForeign-main-nav-tabs-box {
        margin-top:-78px;
        margin-bottom:10px;
        position:absolute;
        max-width:60%;
        min-width:10%;
        z-index:1;
        left: 43%;
        transform: translate(-50%, 0%);
    }
    .main-nav-tab {
        height:45px;
        font-size:16px;
        color:#898989 !important;
        font-weight: 700;
        margin-right:10px;
        margin-top:2px;
    }
    .main-nav-tabs {
        cursor: pointer !important;
    }
    .main-nav-tabs .v-tabs-slider-wrapper {
        display: none;
    }

    .nav-storage-list {
        background-color:white;
        position:fixed;
        top:13px;
        z-index:1;
        right:200px;
    }
    .isForeign-not-nav-storage-list {
        padding-right:10px;
    }
    .nav-storage-list .v-list-item {
        padding:0px 5px 5px 5px;
        min-height:36px;
    }
    .main-nav-tab:hover {
        color: #2C81D5 !important; /* Vuetify의 primary 색상 */
    }
    .isForeign-nav-storage-list {
        right:247px !important;
    }

    @media only screen and (max-width: 1250px) { 
        .isForeign-nav-storage-list {
            top:58px !important;
            right:134px !important;
        }
        .isForeign-not-nav-storage-list {
            top:60px !important;
            right:105px !important;
        }
    }
</style>

<style scoped>
    .nav-dialog {
        margin:0px;
    }
    .fade-enter-active, .fade-leave-active {
        transition: opacity 1s;
    }
    .fade-enter, .fade-leave-to {
        opacity: 0;
    }

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

    .main-nav-tab-display {
        display: none;
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
        margin: 0px;
    }
    .main-logo-image {
        display: none;
    }
    .mobile-tab {
        display: none;
    }
    /* .mobile-tab-list {
        display: none;
    } */
    /* .main-search {
        position:fixed; 
        top:50px; 
        z-index:2; 
        height:70px; 
        width:40%; 
        left: 50%; 
        transform: translate(-50%, 0%);
    } */

    .gs-main-page-title-box {
        width: 650px;
    }
    .gs-main-page-sub-title {
        margin: 10px 0;
    }
    .gs-main-page-sub-title-mobile {
        font-size: 12px;
        margin-top: 10px;
    }
    
    @media only screen and (max-width: 1200px) {
        .main-nav-tab-display {
            display:flex;
        }
    }

    @media only screen and (max-width: 850px) {
        #textsize {
            font-size: 11px;
        }

        #mode_btn {
            margin-left: -10px;
        }

        .main-nav-tabs-box {
            max-width: 450px;
            left: 46%;
            margin-top: -70px;
        }

    }

    @media only screen and (max-width: 800px) {
        .main-search {
            width: 50%;
        }

    }

    @media only screen and (max-width: 750px) {
        .main-nav-tabs-box {
            max-width: 300px;
            left: 45%;
        }
    }

    @media only screen and (max-width: 599px) {
        .main-nav-tab-home {
            display:block;
        }
        .main-logo-image {
            display:block;
        }
        .main-chair-image {
            display: none;
        }
        .main-nav-tabs-box {
            max-width: 300px;
            left: 32%;
        }
        .main-search {
            width: 75%;
        }
    }

    @media only screen and (max-width: 499px) {
        .main-nav-tabs-box {
            max-width: 200px;
            left: 28%;
        }
    }
</style>